/**
 * Parselya birim testleri — Harita ve Uydu Fayans (Tile) Motoru.
 *
 * Kapsam: lib/tileProvider.ts (lngLatToTile, tileToLngLat, getTileUrl, getDirectTileUrl).
 * Web Mercator projeksiyonu, fayans sınırları, koordinat sarmalama ve CORS proxy adresleri.
 */

import { describe, it, expect, run } from "./harness.mjs";
import { lngLatToTile, tileToLngLat, getTileUrl, getDirectTileUrl } from "@/lib/tileProvider";

describe("tile — lngLatToTile Web Mercator projeksiyonu", () => {
  it("z=0: dünya tek bir fayans (0,0)", () => {
    const tile = lngLatToTile(0, 0, 0);
    expect(tile.x).toBe(0);
    expect(tile.y).toBe(0);
    expect(tile.z).toBe(0);
  });

  it("z=1: 4 çeyrek fayans doğru eşlenir", () => {
    // Kuzeybatı: (-90, 45) -> (0, 0)
    const nw = lngLatToTile(-90, 45, 1);
    expect(nw.x).toBe(0);
    expect(nw.y).toBe(0);

    // Güneydoğu: (90, -45) -> (1, 1)
    const se = lngLatToTile(90, -45, 1);
    expect(se.x).toBe(1);
    expect(se.y).toBe(1);
  });

  it("İstanbul koordinatları (28.9784, 41.0082) z=16 için geçerli pozitif fayans üretir", () => {
    const tile = lngLatToTile(28.9784, 41.0082, 16);
    expect(tile.z).toBe(16);
    expect(tile.x).toBeGreaterThan(0);
    expect(tile.y).toBeGreaterThan(0);
    expect(tile.x).toBeLessThan(Math.pow(2, 16));
    expect(tile.y).toBeLessThan(Math.pow(2, 16));
  });

  it("Aşırı enlem değerleri Mercator sınırlarına (-85.05..85.05) kelepçelenir", () => {
    const northPole = lngLatToTile(0, 89.9, 5);
    expect(northPole.y).toBe(0);

    const southPole = lngLatToTile(0, -89.9, 5);
    expect(southPole.y).toBe(31); // 2^5 - 1
  });
});

describe("tile — tileToLngLat ters projeksiyon", () => {
  it("z=0 fayansı tüm dünyayı (-180..180, -85.05..85.05) kapsar", () => {
    const bounds = tileToLngLat(0, 0, 0);
    expect(bounds.minLng).toBe(-180);
    expect(bounds.maxLng).toBe(180);
    expect(bounds.maxLat).toBeCloseTo(85.051128, 2);
    expect(bounds.minLat).toBeCloseTo(-85.051128, 2);
  });

  it("İleri ve ters dönüşüm tutarlıdır (roundtrip)", () => {
    const origLng = 27.5348;
    const origLat = 37.0782;
    const z = 15;
    const tile = lngLatToTile(origLng, origLat, z);
    const bounds = tileToLngLat(tile.x, tile.y, z);

    expect(origLng).toBeGreaterThanOrEqual(bounds.minLng);
    expect(origLng).toBeLessThanOrEqual(bounds.maxLng);
    expect(origLat).toBeGreaterThanOrEqual(bounds.minLat);
    expect(origLat).toBeLessThanOrEqual(bounds.maxLat);
  });
});

describe("tile — getTileUrl ve CORS güvenliği", () => {
  it("google-satellite proxy adresine yönlendirir", () => {
    const url = getTileUrl("google-satellite", 38000, 24000, 16);
    expect(url).toContain("/api/tile?source=google");
    expect(url).toContain("x=38000");
    expect(url).toContain("y=24000");
    expect(url).toContain("z=16");
  });

  it("esri-satellite proxy adresine yönlendirir (CORS canvas tainting önlemi)", () => {
    const url = getTileUrl("esri-satellite", 100, 200, 10);
    expect(url).toContain("/api/tile?source=esri");
  });

  it("osm ve dark-satellite proxy adreslerine yönlendirir", () => {
    const osmUrl = getTileUrl("osm", 50, 50, 8);
    expect(osmUrl).toContain("/api/tile?source=osm");

    const darkUrl = getTileUrl("dark-satellite", 50, 50, 8);
    expect(darkUrl).toContain("/api/tile?source=carto");
  });

  it("Y koordinatı sınır dışı ise (y < 0 veya y >= 2^z) null döner", () => {
    expect(getTileUrl("google-satellite", 0, -1, 5)).toBe(null);
    expect(getTileUrl("google-satellite", 0, 32, 5)).toBe(null);
  });

  it("X koordinatı negatif veya 2^z'yi aştığında sarmalanır", () => {
    const normal = getTileUrl("google-satellite", 1, 5, 4);
    const wrapped = getTileUrl("google-satellite", 17, 5, 4); // 17 % 16 = 1
    expect(normal).toBe(wrapped);
  });

  it("getDirectTileUrl orijinal harici servis adreslerini döner", () => {
    const googleDirect = getDirectTileUrl("google-satellite", 10, 10, 5);
    expect(googleDirect).toContain("google.com/vt/lyrs=s");

    const esriDirect = getDirectTileUrl("esri-satellite", 10, 10, 5);
    expect(esriDirect).toContain("arcgisonline.com");
  });
});

run();
