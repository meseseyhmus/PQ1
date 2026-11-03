/**
 * Parselya birim testleri — TKGM CBS İdari Yapı ve Normalizasyon Motoru.
 *
 * Kapsam: lib/tkgm.ts (normalizeTr, findMatchingFeature, idariYapiCache,
 * generateGeodeticPolygon), lib/demoParcel.ts.
 *
 * Çalıştırma: node --import ./tests/register.mjs tests/tkgm.test.mjs
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  normalizeTr,
  findMatchingFeature,
  idariYapiCache,
  generateGeodeticPolygon,
  hashSeed,
} from "@/lib/tkgm";
import { findParcel, DEMO_PARCELS } from "@/lib/demoParcel";

describe("tkgm — normalizeTr Türkçe Karakter Standardizasyonu", () => {
  it("İzmir ve izmir varyasyonlarını birebir eşitler", () => {
    expect(normalizeTr("İzmir")).toBe("izmir");
    expect(normalizeTr("izmir")).toBe("izmir");
    expect(normalizeTr("İZMİR")).toBe("izmir");
  });

  it("Çamlık ve Çamlik (noktalı/noktasız I) varyasyonlarını eşitler", () => {
    expect(normalizeTr("Çamlık")).toBe("camlik");
    expect(normalizeTr("Çamlik")).toBe("camlik");
    expect(normalizeTr("CAMLIK")).toBe("camlik");
    expect(normalizeTr("çamlık")).toBe("camlik");
  });

  it("Alaçatı ve alacati karakterlerini eşitler", () => {
    expect(normalizeTr("Alaçatı")).toBe("alacati");
    expect(normalizeTr("alacati")).toBe("alacati");
  });

  it("Mahallesi, Köyü gibi idari sonekleri temizler", () => {
    expect(normalizeTr("Çamlık Mahallesi")).toBe("camlik");
    expect(normalizeTr("Kızılağaç Köyü")).toBe("kizilagac");
    expect(normalizeTr("Mumcular Mah.")).toBe("mumcular");
  });

  it("Boş ve geçersiz girdilerde boş dizgi döner", () => {
    expect(normalizeTr("")).toBe("");
    expect(normalizeTr(null)).toBe("");
  });
});

describe("tkgm — findMatchingFeature İdari Eşleştirme", () => {
  const sampleFeatures = [
    { properties: { id: 70, text: "Muğla" } },
    { properties: { id: 57, text: "İzmir" } },
    { properties: { id: 29, text: "Antalya" } },
  ];

  it("Büyük/küçük harf duyarsız tam eşleşmeyi bulur", () => {
    const hit = findMatchingFeature(sampleFeatures, "muğla");
    expect(hit?.properties.id).toBe(70);
  });

  it("Türkçe İ karakteri içeren şehri (İzmir) bulur", () => {
    const hit = findMatchingFeature(sampleFeatures, "izmir");
    expect(hit?.properties.id).toBe(57);
  });

  it("Bilinmeyen bir birimde null döner", () => {
    const hit = findMatchingFeature(sampleFeatures, "BilinmeyenYer");
    expect(hit).toBe(null);
  });
});

describe("tkgm — idariYapiCache Önbellek Yönetimi", () => {
  it("Önbelleğe kaydedilen parselleri hızlıca getirir ve temizler", () => {
    idariYapiCache.parcelCache.set("test_key", { alan: 1000 });
    expect(idariYapiCache.parcelCache.has("test_key")).toBe(true);
    expect(idariYapiCache.parcelCache.get("test_key").alan).toBe(1000);

    idariYapiCache.clear();
    expect(idariYapiCache.parcelCache.has("test_key")).toBe(false);
  });
});

describe("tkgm — generateGeodeticPolygon Sentetik Geometri Fallback", () => {
  it("Kapalı poligon halkası oluşturur (ilk nokta == son nokta)", () => {
    const center = [27.53, 37.07];
    const poly = generateGeodeticPolygon(center, 32000, 42);
    expect(poly.length).toBeGreaterThanOrEqual(6); // 5-7 köşe + 1 kapanış
    expect(poly[0]).toEqual(poly[poly.length - 1]);
  });

  it("Deterministik tohum ile aynı koordinatları üretir", () => {
    const center = [27.53, 37.07];
    const p1 = generateGeodeticPolygon(center, 10000, 100);
    const p2 = generateGeodeticPolygon(center, 10000, 100);
    expect(p1).toEqual(p2);
  });
});

describe("demoParcel — Doğrulanmış Canlı Parseller", () => {
  it("Bodrum Çamlık 131/36 parselini ~32.093 m² ve Zeytinli Tarla olarak bulur", () => {
    const p = findParcel("Muğla", "Bodrum", "Çamlık", "131", "36");
    expect(p.ada).toBe("131");
    expect(p.parsell).toBe("36");
    expect(p.areaM2).toBe(32093);
    expect(p.nitelik).toBe("Zeytinli Tarla");
    expect(p.polygon.length).toBe(21);
  });

  it("Çeşme Alaçatı 300/1 parselini ~8.484 m² ve Zeytin Ağaçlı Tarla olarak bulur", () => {
    const p = findParcel("İzmir", "Çeşme", "Alaçatı", "300", "1");
    expect(p.ada).toBe("300");
    expect(p.parsell).toBe("1");
    expect(p.areaM2).toBe(8484);
    expect(p.nitelik).toBe("Zeytin Ağaçlı Tarla");
  });

  it("Antalya Manavgat 118/3 parselini 613 m² ve Arsa olarak bulur", () => {
    const p = findParcel("Antalya", "Manavgat", "Kızılağaç", "118", "3");
    expect(p.ada).toBe("118");
    expect(p.parsell).toBe("3");
    expect(p.areaM2).toBe(613);
    expect(p.nitelik).toBe("Arsa");
  });
});

run();
