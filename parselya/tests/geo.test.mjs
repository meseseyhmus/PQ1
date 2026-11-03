/**
 * Parselya birim testleri — GeoJSON projeksiyonu ve demo parsel verisi.
 *
 * Kapsam: lib/geo.ts (normalizePolygon, centroid, bbox, haversineMeters,
 * polygonPerimeterMeters, makeLocalProjection, makeScreenProjection) ve
 * lib/demoParcel.ts içindeki saf yardımcılar (findParcel, mulberry32).
 *
 * Çalıştırma: node --import ./tests/register.mjs tests/geo.test.mjs
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  normalizePolygon,
  centroid,
  bbox,
  haversineMeters,
  polygonPerimeterMeters,
  makeLocalProjection,
  makeScreenProjection,
} from "@/lib/geo";
import { findParcel, mulberry32 } from "@/lib/demoParcel";

// Bodrum demo parseli (lib/demoParcel.ts içindeki kayıt)
const BODRUM_POLYGON = [
  [27.7245, 37.0412],
  [27.7281, 37.0416],
  [27.7288, 37.0389],
  [27.7262, 37.0384],
  [27.7241, 37.0401],
];

describe("geo — normalizePolygon", () => {
  it("ardışık tekrar eden noktaları ayıklar", () => {
    const input = [
      [1, 1],
      [1, 1],
      [2, 2],
      [2, 2],
      [3, 3],
    ];
    expect(normalizePolygon(input)).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });

  it("ardışık olmayan tekrarları korur (halka kapanışı)", () => {
    const input = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ];
    expect(normalizePolygon(input).length).toBe(4);
  });

  it("3'ten az noktalı girdiyi olduğu gibi döndürür", () => {
    const input = [
      [5, 5],
      [5, 5],
    ];
    expect(normalizePolygon(input)).toEqual(input);
  });
});

describe("geo — centroid", () => {
  it("birim karenin ağırlık merkezi (0.5, 0.5)", () => {
    const square = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const c = centroid(square);
    expect(c[0]).toBeCloseTo(0.5);
    expect(c[1]).toBeCloseTo(0.5);
  });

  it("bozulmuş (çakışık) poligonda ortalamaya düşer", () => {
    const degenerate = [
      [2, 2],
      [2, 2],
      [2, 2],
    ];
    const c = centroid(degenerate);
    expect(c[0]).toBeCloseTo(2);
    expect(c[1]).toBeCloseTo(2);
  });

  it("Bodrum parselinin merkezi parsel sınırları içinde kalır", () => {
    const c = centroid(BODRUM_POLYGON);
    const b = bbox(BODRUM_POLYGON);
    expect(c[0]).toBeGreaterThan(b.minLng);
    expect(c[0]).toBeLessThan(b.maxLng);
    expect(c[1]).toBeGreaterThan(b.minLat);
    expect(c[1]).toBeLessThan(b.maxLat);
  });
});

describe("geo — bbox", () => {
  it("dört köşeyi doğru hesaplar", () => {
    const poly = [
      [10, 20],
      [30, 25],
      [25, 40],
      [12, 38],
    ];
    expect(bbox(poly)).toEqual({
      minLng: 10,
      minLat: 20,
      maxLng: 30,
      maxLat: 40,
    });
  });

  it("tek noktalı poligonda min = max", () => {
    expect(bbox([[7, 42]])).toEqual({
      minLng: 7,
      minLat: 42,
      maxLng: 7,
      maxLat: 42,
    });
  });
});

describe("geo — mesafe hesapları", () => {
  it("aynı nokta arası mesafe 0", () => {
    expect(haversineMeters([27.7, 37.0], [27.7, 37.0])).toBe(0);
  });

  it("1 derece enlem ≈ 111.2 km", () => {
    // ekvator yakınında boylam yerine enlem farkı: sabit ~110.9-111.7 km
    const d = haversineMeters([30, 36], [30, 37]);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it("ekvatorda 1 derece boylam ≈ 111.2 km", () => {
    const d = haversineMeters([10, 0], [11, 0]);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_500);
  });

  it("kare poligonun çevresi 4 × kenar uzunluğu", () => {
    // ~0.01 derece enlem kenarlı kare (Bodrum enleminde)
    const side = haversineMeters([27.7, 37.0], [27.7, 37.01]);
    const square = [
      [27.7, 37.0],
      [27.7, 37.01],
      [27.71, 37.01],
      [27.71, 37.0],
    ];
    const perim = polygonPerimeterMeters(square);
    // enlem kenarları tam `side`; boylam kenarları cos(37°) nedeniyle daha kısa
    expect(perim).toBeGreaterThan(2 * side);
    expect(perim).toBeLessThan(4 * side);
  });
});

describe("geo — lokal projeksiyon", () => {
  it("merkez nokta (0,0)'a projects", () => {
    const { project, center } = makeLocalProjection(BODRUM_POLYGON);
    const p = project(center);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("kuzeydeki nokta negatif y'ye gider (canvas ekran koordinatı)", () => {
    const { project, center } = makeLocalProjection(BODRUM_POLYGON);
    const north = project([center[0], center[1] + 0.01]);
    expect(north.y).toBeLessThan(0);
    expect(north.x).toBeCloseTo(0);
  });

  it("doğudaki nokta pozitif x'e gider", () => {
    const { project, center } = makeLocalProjection(BODRUM_POLYGON);
    const east = project([center[0] + 0.01, center[1]]);
    expect(east.x).toBeGreaterThan(0);
    expect(east.y).toBeCloseTo(0);
  });
});

describe("geo — ekran projeksiyonu (kadraj merkezleme)", () => {
  it("9:16 dikey karede poligon merkezde ve contentSize içinde", () => {
    const contentSize = 600;
    const { toScreen } = makeScreenProjection(
      BODRUM_POLYGON,
      1080,
      1920,
      contentSize,
    );
    for (const pt of BODRUM_POLYGON) {
      const s = toScreen(pt);
      // merkez etrafında hizalı: piksel uzaklık ≤ contentSize/2 (küçük toleransla)
      const dx = s.x - 1080 / 2;
      const dy = s.y - 1920 / 2;
      expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(contentSize / 2 + 1e-6);
    }
  });

  it("16:9 yatay karede poligon merkezde ve contentSize içinde", () => {
    const contentSize = 800;
    const { toScreen } = makeScreenProjection(
      BODRUM_POLYGON,
      1920,
      1080,
      contentSize,
    );
    for (const pt of BODRUM_POLYGON) {
      const s = toScreen(pt);
      const dx = s.x - 1920 / 2;
      const dy = s.y - 1080 / 2;
      expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(contentSize / 2 + 1e-6);
    }
  });

  it("en uzak köşe contentSize/2 yarıçapına ölçeklenir", () => {
    const contentSize = 600;
    const { toScreen } = makeScreenProjection(
      BODRUM_POLYGON,
      1080,
      1920,
      contentSize,
    );
    const radii = BODRUM_POLYGON.map((pt) => {
      const s = toScreen(pt);
      return Math.hypot(s.x - 540, s.y - 960);
    });
    const maxR = Math.max(...radii);
    expect(maxR).toBeCloseTo(contentSize / 2, 3);
  });

  it("deterministik: aynı girdi iki çağrıda aynı ölçek verir", () => {
    const a = makeScreenProjection(BODRUM_POLYGON, 1080, 1920, 600);
    const b = makeScreenProjection(BODRUM_POLYGON, 1080, 1920, 600);
    expect(a.scale).toBe(b.scale);
    for (const pt of BODRUM_POLYGON) {
      expect(a.toScreen(pt)).toEqual(b.toScreen(pt));
    }
  });
});

describe("demoParcel — findParcel", () => {
  it("bilinen demo parseli (Bodrum 1425/7) ada-parsel ve il/ilce ile bulur", () => {
    const p = findParcel("Muğla", "Bodrum", "Mumcular", "1425", "7");
    expect(p.ada).toBe("1425");
    expect(p.parsell).toBe("7");
    expect(p.mahalle).toBe("Mumcular");
    expect(p.polygon).toEqual(BODRUM_POLYGON);
  });

  it("il/ilce eşleşmesi büyük-küçük harf duyarsız ve boşluk toleranslı", () => {
    const p = findParcel("  muğla ", "BODRUM", "x", "1425", "7");
    expect(p.ada).toBe("1425");
  });

  it("demo parselde alan pozitif ve merkez bbox içinde", () => {
    const p = findParcel("Muğla", "Bodrum", "Mumcular", "1425", "7");
    expect(p.areaM2).toBeGreaterThan(0);
    const b = bbox(p.polygon);
    expect(p.center[0]).toBeGreaterThanOrEqual(b.minLng);
    expect(p.center[0]).toBeLessThanOrEqual(b.maxLng);
    expect(p.center[1]).toBeGreaterThanOrEqual(b.minLat);
    expect(p.center[1]).toBeLessThanOrEqual(b.maxLat);
  });

  it("bilinmeyen ada/parsel için sentetik ama geçerli parsel üretir", () => {
    const p = findParcel("Ankara", "Çankaya", "Kızılay", "999", "999");
    expect(p.polygon.length).toBeGreaterThanOrEqual(5);
    expect(p.polygon.length).toBeLessThanOrEqual(7);
    expect(p.areaM2).toBeGreaterThan(0);
    expect(p.pois.length).toBe(2);
    // sentetik parsel Türkiye sınırları içinde (26-32 boylam, 36-39 enlem civarı)
    const b = bbox(p.polygon);
    expect(b.minLng).toBeGreaterThan(25);
    expect(b.maxLng).toBeLessThan(33);
    expect(b.minLat).toBeGreaterThan(36);
    expect(b.maxLat).toBeLessThan(39);
  });

  it("sentetik parsel deterministik: aynı girdi aynı çıktı", () => {
    const a = findParcel("Ankara", "Çankaya", "Kızılay", "555", "12");
    const b = findParcel("Ankara", "Çankaya", "Kızılay", "555", "12");
    expect(a).toEqual(b);
  });
});

describe("demoParcel — mulberry32", () => {
  it("aynı tohum aynı diziyi üretir (deterministik)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b());
    }
  });

  it("üretilen değerler [0, 1) aralığında", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("farklı tohumlar farklı diziler üretir", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    if (JSON.stringify(seqA) === JSON.stringify(seqB)) {
      throw new Error("farklı tohumlar aynı dizi üretti");
    }
  });
});

run();
