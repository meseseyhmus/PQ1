import type { LatLng, ParcelData } from "@/types";
import { centroid, haversineMeters, polygonPerimeterMeters } from "@/lib/geo";

interface DemoRecord {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsell: string;
  polygon: LatLng[];
  areaM2?: number;
  nitelik?: string;
  mevkii?: string;
  pafta?: string;
  pois: { label: string; lngLat: LatLng }[];
}

export const DEMO_PARCELS: DemoRecord[] = [
  {
    il: "Mardin",
    ilce: "Nusaybin",
    mahalle: "Akçatarla",
    ada: "174",
    parsell: "1",
    areaM2: 2443,
    nitelik: "Arsa",
    mevkii: "Nusaybin Yolu",
    pafta: "N46d19b2c",
    polygon: [
      [41.20485, 37.08520],
      [41.20548, 37.08526],
      [41.20556, 37.08474],
      [41.20492, 37.08468],
      [41.20485, 37.08520],
    ],
    pois: [
      { label: "D-400 Karayolu: 80 m", lngLat: [41.2045, 37.0858] },
      { label: "Nusaybin Devlet Hastanesi: 1.8 km", lngLat: [41.218, 37.078] },
      { label: "İlçe Merkezi: 2.4 km", lngLat: [41.222, 37.075] },
    ],
  },
  {
    il: "Muğla",
    ilce: "Bodrum",
    mahalle: "Çamlık",
    ada: "131",
    parsell: "36",
    areaM2: 32093,
    nitelik: "Zeytinli Tarla",
    mevkii: "Ermene",
    pafta: "",
    polygon: [
      [27.53791, 37.07855],
      [27.53894, 37.0786],
      [27.54035, 37.07938],
      [27.54022, 37.07944],
      [27.53984, 37.07962],
      [27.53884, 37.07879],
      [27.53733, 37.07891],
      [27.53633, 37.07891],
      [27.53568, 37.07868],
      [27.53466, 37.07831],
      [27.53348, 37.07774],
      [27.53243, 37.07711],
      [27.53262, 37.0771],
      [27.53279, 37.07711],
      [27.533, 37.07711],
      [27.53316, 37.0771],
      [27.53341, 37.0771],
      [27.53389, 37.07754],
      [27.5357, 37.07815],
      [27.53653, 37.07838],
      [27.53791, 37.07855],
    ],
    pois: [
      { label: "Yola Cephe: 180 m", lngLat: [27.5335, 37.0772] },
      { label: "Bodrum Merkez 14 km", lngLat: [27.542, 37.081] },
      { label: "Havalimanı: 28 km", lngLat: [27.531, 37.076] },
    ],
  },
  {
    il: "İzmir",
    ilce: "Çeşme",
    mahalle: "Alaçatı",
    ada: "300",
    parsell: "1",
    areaM2: 8484,
    nitelik: "Zeytin Ağaçlı Tarla",
    mevkii: "Kerdeme",
    pafta: "L16-B-23-D-4",
    polygon: [
      [26.38125, 38.29124],
      [26.38245, 38.29185],
      [26.38312, 38.29082],
      [26.38285, 38.29015],
      [26.38174, 38.29045],
      [26.38125, 38.29124],
    ],
    pois: [
      { label: "Alaçatı Port 2.8 km", lngLat: [26.384, 38.293] },
      { label: "İzmir Otoyolu 1.5 km", lngLat: [26.379, 38.289] },
    ],
  },
  {
    il: "Muğla",
    ilce: "Bodrum",
    mahalle: "Mumcular",
    ada: "1425",
    parsell: "7",
    polygon: [
      [27.7245, 37.0412],
      [27.7281, 37.0416],
      [27.7288, 37.0389],
      [27.7262, 37.0384],
      [27.7241, 37.0401],
    ],
    pois: [
      { label: "Denize 500 m", lngLat: [27.7382, 37.0335] },
      { label: "Ana Yol 120 m", lngLat: [27.7162, 37.0442] },
      { label: "Merkez 2 km", lngLat: [27.7412, 37.0471] },
    ],
  },
  {
    il: "Antalya",
    ilce: "Manavgat",
    mahalle: "Kızılağaç",
    ada: "118",
    parsell: "3",
    areaM2: 613,
    nitelik: "Arsa",
    polygon: [
      [31.4402, 36.8215],
      [31.4448, 36.8221],
      [31.4455, 36.8196],
      [31.4431, 36.8188],
      [31.4400, 36.8202],
    ],
    pois: [
      { label: "Denize 900 m", lngLat: [31.4538, 36.8142] },
      { label: "D-400 Yolu 250 m", lngLat: [31.4341, 36.8244] },
    ],
  },
  {
    il: "İzmir",
    ilce: "Çeşme",
    mahalle: "Alaçatı",
    ada: "902",
    parsell: "14",
    polygon: [
      [26.3708, 38.2785],
      [26.3742, 38.2789],
      [26.3749, 38.2766],
      [26.3725, 38.2761],
      [26.3705, 38.2774],
    ],
    pois: [
      { label: "Alaçatı Merkez 1.2 km", lngLat: [26.3621, 38.2755] },
      { label: "Denize 2.4 km", lngLat: [26.3862, 38.2705] },
    ],
  },
];

function shoelaceAreaM2(polygon: LatLng[]): number {
  const c = centroid(polygon);
  const latRad = (c[1] * Math.PI) / 180;
  const mx = 111320 * Math.cos(latRad);
  const my = 110540;
  let a = 0;
  for (let i = 0; i < polygon.length; i++) {
    const p0 = polygon[i];
    const p1 = polygon[(i + 1) % polygon.length];
    const x0 = (p0[0] - c[0]) * mx;
    const y0 = -(p0[1] - c[1]) * my;
    const x1 = (p1[0] - c[0]) * mx;
    const y1 = -(p1[1] - c[1]) * my;
    a += x0 * y1 - x1 * y0;
  }
  return Math.abs(a / 2);
}

function normalizeSimple(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Mock parsel sorgusu. Bilinen demo parsellerden birini döndürür;
 * eşleşme yoksa ada/parsel'den türetilmiş sentetik bir poligon üretir.
 */
export function findParcel(
  il: string,
  ilce: string,
  mahalle: string,
  ada: string,
  parsell: string,
): ParcelData {
  const normIl = normalizeSimple(il);
  const normIlce = normalizeSimple(ilce);
  const normMah = normalizeSimple(mahalle);
  const targetAda = ada.trim();
  const targetParsel = parsell.trim();

  const hit = DEMO_PARCELS.find((d) => {
    const matchAda = d.ada === targetAda;
    const matchParsel = d.parsell === targetParsel;
    const matchIl = normalizeSimple(d.il) === normIl || normIl.includes(normalizeSimple(d.il));
    const matchIlce = normalizeSimple(d.ilce) === normIlce || normIlce.includes(normalizeSimple(d.ilce));
    return matchAda && matchParsel && matchIl && matchIlce;
  });

  if (hit) {
    const calcArea = hit.areaM2 ?? Math.round(shoelaceAreaM2(hit.polygon));
    return {
      il: hit.il,
      ilce: hit.ilce,
      mahalle: hit.mahalle,
      ada: hit.ada,
      parsell: hit.parsell,
      polygon: hit.polygon,
      areaM2: calcArea,
      nitelik: hit.nitelik || "Arsa",
      mevkii: hit.mevkii || `${hit.mahalle} Mevkii`,
      pafta: hit.pafta || "",
      center: centroid(hit.polygon),
      pois: hit.pois.map((p, i) => ({
        id: `poi-${i}`,
        label: p.label,
        lngLat: p.lngLat,
        color: ["#38bdf8", "#f5b942", "#f472b6"][i % 3],
      })),
    };
  }

  // Sentetik parsel: ada/parsel sayılarından deterministik tohum
  const seedNum =
    (parseInt(ada || "1", 10) || 1) * 977 +
    (parseInt(parsell || "1", 10) || 1) * 613;
  const rng = mulberry32(seedNum);
  const baseLng = 26.0 + rng() * 5;
  const baseLat = 36.5 + rng() * 2.2;
  const n = 5 + Math.floor(rng() * 3);
  const rBase = 0.0015 + rng() * 0.0015;
  const polygon: LatLng[] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + rng() * 0.4;
    const r = rBase * (0.7 + rng() * 0.6);
    polygon.push([
      +(baseLng + Math.cos(ang) * r * 1.6).toFixed(6),
      +(baseLat + Math.sin(ang) * r).toFixed(6),
    ]);
  }

  const c = centroid(polygon);
  const perim = polygonPerimeterMeters(polygon);
  const poiColors = ["#38bdf8", "#f5b942", "#f472b6"];
  const pois = [
    { label: "Denize 800 m", lngLat: [c[0] + 0.012, c[1] - 0.007] as LatLng },
    { label: "Yola Cephe 40 m", lngLat: [c[0] - 0.011, c[1] + 0.006] as LatLng },
  ].map((p, i) => ({
    id: `poi-${i}`,
    label: p.label,
    lngLat: p.lngLat,
    color: poiColors[i % poiColors.length],
  }));
  void haversineMeters;

  return {
    il: il || "—",
    ilce: ilce || "—",
    mahalle: mahalle || "—",
    ada: ada || "—",
    parsell: parsell || "—",
    polygon,
    areaM2: Math.round(shoelaceAreaM2(polygon)) || Math.round(perim * 8),
    nitelik: "Arsa",
    mevkii: `${mahalle || "Merkez"} Mevkii`,
    pafta: `Pafta ${(seedNum % 30) + 1}`,
    center: c,
    pois,
  };
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
