import type { LatLng, PoiMarker } from "@/types";
import { bbox, centroid, polygonPerimeterMeters } from "@/lib/geo";
import { parseAlan } from "@/lib/format";

export interface IdariFeature {
  type?: string;
  geometry?: any;
  properties: { id: number; text: string; [key: string]: any };
}

/**
 * Türkçe karakter duyarlı, aksan ve boşluk temizleyici normalizasyon.
 * Büyük-küçük 'İ', 'I', 'ı', 'i', 'ğ', 'ü', 'ş', 'ö', 'ç' varyasyonlarını standartlaştırır.
 */
export function normalizeTr(s: string): string {
  if (!s) return "";
  const transliterated = String(s)
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

  return transliterated
    .replace(/\b(mahallesi|mah|koyu|koy|merkez|mevkii)\b/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/** İdari birim listesinde (İl, İlçe, Mahalle) en uygun eşleşmeyi bulur */
export function findMatchingFeature(
  features: IdariFeature[],
  target: string
): IdariFeature | null {
  const norm = normalizeTr(target);
  if (!norm) return null;
  // 1. Tam eşleşme
  let hit = features.find((f) => normalizeTr(f.properties.text) === norm);
  if (hit) return hit;
  // 2. Başlangıç eşleşmesi
  hit = features.find((f) => {
    const t = normalizeTr(f.properties.text);
    return t.startsWith(norm) || norm.startsWith(t);
  });
  if (hit) return hit;
  // 3. İçerme eşleşmesi
  return (
    features.find((f) => {
      const t = normalizeTr(f.properties.text);
      return t.includes(norm) || norm.includes(t);
    }) || null
  );
}

/**
 * Bellek içi idari yapı ve parsel sorgu önbelleği.
 * TKGM CBS API çağrılarında hız ve kota koruması sağlar.
 */
export class IdariYapiCache {
  ilFeatures: IdariFeature[] | null = null;
  ilceMap = new Map<number, IdariFeature[]>();
  mahalleMap = new Map<number, IdariFeature[]>();
  parcelCache = new Map<string, any>();
  coordCache = new Map<string, any>();

  clear() {
    this.ilFeatures = null;
    this.ilceMap.clear();
    this.mahalleMap.clear();
    this.parcelCache.clear();
    this.coordCache.clear();
  }
}

export const idariYapiCache = new IdariYapiCache();

export const API_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
};

/**
 * TKGM MEGSİS idari yapı API hiyerarşisi üzerinden ilçe ve mahalle ID'sini çözümler:
 * ilListe -> ilceListe/{ilId} -> mahalleListe/{ilceId} -> mahalleId
 */
export async function resolveMahalleId(
  ilName: string,
  ilceName: string,
  mahalleName: string
): Promise<number | null> {
  try {
    // 1. İl Listesi
    if (!idariYapiCache.ilFeatures) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch(
          "https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/idariYapi/ilListe",
          { headers: API_HEADERS, signal: controller.signal }
        );
        if (res.ok) {
          const d = await res.json();
          if (d && Array.isArray(d.features)) idariYapiCache.ilFeatures = d.features;
        }
      } finally {
        clearTimeout(timer);
      }
    }
    if (!idariYapiCache.ilFeatures) return null;

    const ilItem = findMatchingFeature(idariYapiCache.ilFeatures, ilName);
    if (!ilItem) return null;
    const ilId = ilItem.properties.id;

    // 2. İlçe Listesi
    let ilceFeatures = idariYapiCache.ilceMap.get(ilId);
    if (!ilceFeatures) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch(
          `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/idariYapi/ilceListe/${ilId}`,
          { headers: API_HEADERS, signal: controller.signal }
        );
        if (res.ok) {
          const d = await res.json();
          if (d && Array.isArray(d.features)) {
            ilceFeatures = d.features as IdariFeature[];
            idariYapiCache.ilceMap.set(ilId, ilceFeatures);
          }
        }
      } finally {
        clearTimeout(timer);
      }
    }
    if (!ilceFeatures) return null;

    const ilceItem = findMatchingFeature(ilceFeatures, ilceName);
    if (!ilceItem) return null;
    const ilceId = ilceItem.properties.id;

    // 3. Mahalle Listesi
    let mahalleFeatures = idariYapiCache.mahalleMap.get(ilceId);
    if (!mahalleFeatures) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch(
          `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/idariYapi/mahalleListe/${ilceId}`,
          { headers: API_HEADERS, signal: controller.signal }
        );
        if (res.ok) {
          const d = await res.json();
          if (d && Array.isArray(d.features)) {
            mahalleFeatures = d.features as IdariFeature[];
            idariYapiCache.mahalleMap.set(ilceId, mahalleFeatures);
          }
        }
      } finally {
        clearTimeout(timer);
      }
    }
    if (!mahalleFeatures) return null;

    const mahItem = findMatchingFeature(mahalleFeatures, mahalleName);
    if (!mahItem) return null;
    return mahItem.properties.id;
  } catch {
    return null;
  }
}

// Bilinen Türkiye il ve ilçe koordinat merkezleri (Çevrimdışı ve hızlı CBS doğrulama için referans noktaları)
export const TURKEY_DISTRICT_COORDS: Record<string, LatLng> = {
  // Muğla
  mugla: [28.3636, 37.2153],
  "mugla-bodrum": [27.4289, 37.0344],
  "mugla-bodrum-camlik": [27.5365, 37.0782],
  "mugla-bodrum-mumcular": [27.5348, 37.0782],
  "mugla-bodrum-yalikavak": [27.2917, 37.1042],
  "mugla-bodrum-turgutreis": [27.2586, 37.0019],
  "mugla-bodrum-bitez": [27.3794, 37.0294],
  "mugla-fethiye": [29.1164, 36.6217],
  "mugla-fethiye-oludeniz": [29.1242, 36.5492],
  "mugla-marmaris": [28.2744, 36.855],
  "mugla-milas": [27.7842, 37.3164],
  "mugla-datca": [27.6869, 36.7269],
  "mugla-koycegiz": [28.6942, 36.9686],
  "mugla-ortaca": [28.7667, 36.84],
  // İzmir
  izmir: [27.1384, 38.4192],
  "izmir-cesme": [26.3053, 38.3236],
  "izmir-cesme-alacati": [26.3742, 38.2819],
  "izmir-urla": [26.7636, 38.3225],
  "izmir-seferihisar": [26.8394, 38.1978],
  "izmir-foca": [26.7564, 38.6703],
  "izmir-karsiyaka": [27.1147, 38.4556],
  "izmir-bornova": [27.2186, 38.4636],
  "izmir-konak": [27.135, 38.4167],
  "izmir-menderes": [27.1333, 38.25],
  "izmir-torbali": [27.3606, 38.1517],
  // Antalya
  antalya: [30.7133, 36.8969],
  "antalya-manavgat": [31.4422, 36.7869],
  "antalya-manavgat-kizilagac": [31.5422, 36.7569],
  "antalya-alanya": [31.9998, 36.5438],
  "antalya-kas": [29.6377, 36.2023],
  "antalya-kas-kalkan": [29.4142, 36.2625],
  "antalya-kemer": [30.56, 36.6025],
  "antalya-serik": [31.1017, 36.9178],
  "antalya-muratpasa": [30.7083, 36.8853],
  "antalya-kepez": [30.6833, 36.9333],
  "antalya-dosemealti": [30.6125, 37.0167],
  // Aydın
  aydin: [27.8456, 37.8444],
  "aydin-kusadasi": [27.2606, 37.8579],
  "aydin-didim": [27.2564, 37.3739],
  "aydin-efeler": [27.8456, 37.8444],
  "aydin-soke": [27.4069, 37.7517],
  // Balıkesir
  balikesir: [27.8833, 39.6483],
  "balikesir-ayvalik": [26.6967, 39.3197],
  "balikesir-edremit": [27.0242, 39.5961],
  "balikesir-bandirma": [27.9767, 40.3522],
  "balikesir-burhaniye": [26.9722, 39.4986],
  // İstanbul
  istanbul: [28.9784, 41.0082],
  "istanbul-silivri": [28.2464, 41.0744],
  "istanbul-catalca": [28.4611, 41.1439],
  "istanbul-sile": [29.6125, 41.1758],
  "istanbul-cekmekoy": [29.2131, 41.0353],
  "istanbul-beykoz": [29.1, 41.1333],
  "istanbul-sariyer": [29.05, 41.1667],
  "istanbul-besiktas": [29.0067, 41.0422],
  "istanbul-kadikoy": [29.0278, 40.9917],
  // Ankara
  ankara: [32.8597, 39.9334],
  "ankara-golbasi": [32.8089, 39.7917],
  "ankara-cankaya": [32.8597, 39.9208],
  "ankara-yenimahalle": [32.7981, 39.9697],
  "ankara-etimesgut": [32.6842, 39.9497],
  // Bursa
  bursa: [29.0611, 40.1885],
  "bursa-mudanya": [28.8842, 40.3756],
  "bursa-nilufer": [28.9833, 40.2167],
  "bursa-gemlik": [29.1606, 40.4319],
  // Çanakkale
  canakkale: [26.4086, 40.1553],
  "canakkale-bozcaada": [26.0469, 39.8278],
  "canakkale-assos": [26.3386, 39.4897],
  // Mersin & Adana
  mersin: [34.6415, 36.8121],
  "mersin-erdemli": [34.3089, 36.6053],
  adana: [35.3213, 36.9914],
  // Sakarya & Kocaeli
  sakarya: [30.4033, 40.7731],
  "sakarya-sapanca": [30.2708, 40.6908],
  kocaeli: [29.9169, 40.7656],
  // Karadeniz
  trabzon: [39.7168, 41.0027],
  samsun: [36.3361, 41.2867],
  // İç & Doğu Anadolu
  konya: [32.4833, 37.8667],
  kayseri: [35.4853, 38.7312],
  eskisehir: [30.5256, 39.7767],
  gaziantep: [37.3833, 37.0667],
};

export function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

export function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateGeodeticPolygon(
  center: LatLng,
  areaM2: number,
  seed: number
): LatLng[] {
  const radiusMeters = Math.sqrt(areaM2 / Math.PI);
  const latMeters = 111320;
  const lngMeters = 111320 * Math.cos((center[1] * Math.PI) / 180);

  const numVertices = 5 + (seed % 3);
  const coords: LatLng[] = [];

  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const jitter = 0.75 + ((seed + i * 17) % 50) / 100;
    const r = radiusMeters * jitter;

    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;

    const pLng = center[0] + dx / lngMeters;
    const pLat = center[1] + dy / latMeters;

    coords.push([Number(pLng.toFixed(6)), Number(pLat.toFixed(6))]);
  }

  // Poligonu kapat
  coords.push([...coords[0]]);
  return coords;
}
