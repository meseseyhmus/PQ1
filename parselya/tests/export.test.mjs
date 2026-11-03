/**
 * Parselya birim testleri — Video Export Motoru ve Kadastro Veri Ayrıştırıcı.
 *
 * Kapsam: lib/exportVideo.ts (pickMimeType, estimateSizeMB, isCanvasTainted)
 * ve app/api/parsel/route.ts (parseAlan locale-bağımsız sayı ayrıştırma).
 */

import { describe, it, expect, run } from "./harness.mjs";
import { estimateSizeMB, pickMimeType } from "@/lib/exportVideo";
import { parseAlan } from "@/lib/format";

describe("export — estimateSizeMB video boyutu tahmini", () => {
  it("10 saniye @ 8 Mbps -> 10 MB", () => {
    // 8 Mbps = 1 MB/s -> 10s = 10 MB
    expect(estimateSizeMB(10, 8)).toBe(10);
  });

  it("15 saniye @ 8 Mbps -> 15 MB", () => {
    expect(estimateSizeMB(15, 8)).toBe(15);
  });

  it("0 saniye veya 0 bitrate -> 0 MB", () => {
    expect(estimateSizeMB(0, 8)).toBe(0);
    expect(estimateSizeMB(10, 0)).toBe(0);
  });
});

describe("export — pickMimeType tarayıcı ortamı kontrolü", () => {
  it("Node.js ortamında MediaRecorder undefined iken null döner", () => {
    expect(pickMimeType()).toBe(null);
    expect(pickMimeType("mp4")).toBe(null);
  });
});

describe("parsel — parseAlan locale-bağımsız alan ayrıştırma (qgistkgmplugin uyumu)", () => {
  it("sayısal girdi doğrudan float olarak korunur", () => {
    expect(parseAlan(1250)).toBe(1250);
    expect(parseAlan(4483.39)).toBeCloseTo(4483.39);
  });

  it("Türkçe formatlı metin '4.483,39' -> 4483.39", () => {
    expect(parseAlan("4.483,39")).toBeCloseTo(4483.39);
    expect(parseAlan("12.500,50")).toBeCloseTo(12500.50);
  });

  it("Yalnız virgül içeren metin '4483,39' -> 4483.39", () => {
    expect(parseAlan("4483,39")).toBeCloseTo(4483.39);
  });

  it("İngilizce formatlı metin '4,483.39' -> 4483.39", () => {
    expect(parseAlan("4,483.39")).toBeCloseTo(4483.39);
  });

  it("Standart noktalı metin '1250.75' -> 1250.75", () => {
    expect(parseAlan("1250.75")).toBeCloseTo(1250.75);
  });

  it("Geçersiz veya boş girdiler için 0 döner", () => {
    expect(parseAlan(null)).toBe(0);
    expect(parseAlan(undefined)).toBe(0);
    expect(parseAlan("")).toBe(0);
    expect(parseAlan("geçersiz")).toBe(0);
  });
});

run();
