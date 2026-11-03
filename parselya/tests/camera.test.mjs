/**
 * Parselya birim testleri — kamera yolu / interpolasyon.
 *
 * Kapsam: lib/camera.ts (easeOutCubic, computeCamera). renderAt(time)
 * determinizminin temeli: zaman → kamera dönüşümü eşlemesi, uç değerler
 * (t=0, t=duration), aralık dışına taşma kelepçelenmesi, zoom-in ve orbit
 * hareketlerinin matematiksel özellikleri.
 *
 * Çalıştırma: node --import ./tests/register.mjs tests/camera.test.mjs
 */

import { describe, it, expect, run } from "./harness.mjs";
import { easeOutCubic, computeCamera } from "@/lib/camera";

const DURATION = 12; // saniye
const INTENSITY = 0.5; // k = 0.4 + 0.5 * 1.2 = 1.0

describe("camera — easeOutCubic", () => {
  it("t=0 → 0 ve t=1 → 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("t<0 ve t>1 kelepçelenir", () => {
    expect(easeOutCubic(-3)).toBe(0);
    expect(easeOutCubic(7)).toBe(1);
  });

  it("monoton artan: e(0.25) < e(0.5) < e(0.75)", () => {
    const a = easeOutCubic(0.25);
    const b = easeOutCubic(0.5);
    const c = easeOutCubic(0.75);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it("hızlı başlar (ease-out): e(0.5) > 0.5", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe("camera — zoom-in uç değerleri", () => {
  it("t=0: yüksek irtifa başlangıcı (scale = 1 + 1.6k)", () => {
    // k = 1.0 → startScale = 2.6
    const t0 = computeCamera("zoom-in", 0, DURATION, INTENSITY);
    expect(t0.scale).toBeCloseTo(2.6);
    expect(t0.rotation).toBeCloseTo(0.06); // (1-e) * 0.06 * k, e=0
    expect(t0.offsetY).toBeCloseTo(0.12);
    expect(t0.offsetX).toBeCloseTo(0.04);
  });

  it("t=duration: yere inmiş hali (scale = 1, dönüş/pan yok)", () => {
    const tEnd = computeCamera("zoom-in", DURATION, DURATION, INTENSITY);
    expect(tEnd.scale).toBeCloseTo(1);
    expect(tEnd.rotation).toBeCloseTo(0);
    expect(tEnd.offsetY).toBeCloseTo(0);
    expect(tEnd.offsetX).toBeCloseTo(0);
  });

  it("t=0 ve t=duration deterministik: tekrar çağrı aynı sonucu verir", () => {
    const a = computeCamera("zoom-in", 3.7, DURATION, INTENSITY);
    const b = computeCamera("zoom-in", 3.7, DURATION, INTENSITY);
    expect(a).toEqual(b);
  });
});

describe("camera — zoom-in ara değerler", () => {
  it("scale zamanla azalarak 2.6 → 1 arasında iner", () => {
    const s0 = computeCamera("zoom-in", 0, DURATION, INTENSITY).scale;
    const sMid = computeCamera("zoom-in", DURATION / 2, DURATION, INTENSITY).scale;
    const sEnd = computeCamera("zoom-in", DURATION, DURATION, INTENSITY).scale;
    expect(s0).toBeCloseTo(2.6);
    expect(sMid).toBeGreaterThan(1);
    expect(sMid).toBeLessThan(2.6);
    expect(sEnd).toBeCloseTo(1);
  });

  it("yoğunluk arttıkça başlangıç ölçeği büyür", () => {
    const low = computeCamera("zoom-in", 0, DURATION, 0).scale;
    const high = computeCamera("zoom-in", 0, DURATION, 1).scale;
    expect(high).toBeGreaterThan(low);
    // k(0)=0.4 → 1+1.6*0.4 = 1.64; k(1)=1.6 → 1+1.6*1.6 = 3.56
    expect(low).toBeCloseTo(1.64);
    expect(high).toBeCloseTo(3.56);
  });
});

describe("camera — orbit", () => {
  it("t=0: dönmüş değil, hafif uzakta (scale = 1 + 0.18k)", () => {
    const t0 = computeCamera("orbit", 0, DURATION, INTENSITY);
    expect(t0.rotation).toBe(0);
    expect(t0.scale).toBeCloseTo(1.18);
    expect(t0.offsetX).toBe(0);
    expect(t0.offsetY).toBe(0); // sin(0) = 0
  });

  it("t=duration: tam tur (rotation = 2π), offsetX hâlâ 0", () => {
    const tEnd = computeCamera("orbit", DURATION, DURATION, INTENSITY);
    expect(tEnd.rotation).toBeCloseTo(Math.PI * 2);
    expect(tEnd.offsetX).toBe(0);
  });

  it("yarı yolda dönüş π civarında ve salınım ofseti sınırlı", () => {
    const mid = computeCamera("orbit", DURATION / 2, DURATION, INTENSITY);
    expect(mid.rotation).toBeCloseTo(Math.PI);
    // |bob| = |sin(p*4π)| * 0.015 * k ≤ 0.015
    expect(Math.abs(mid.offsetY)).toBeLessThanOrEqual(0.015 + 1e-12);
  });

  it("dönüş zamanla doğrusal artar", () => {
    const r1 = computeCamera("orbit", 3, DURATION, INTENSITY).rotation;
    const r2 = computeCamera("orbit", 6, DURATION, INTENSITY).rotation;
    expect(r2 - r1).toBeCloseTo(r1); // 6s = 2 × 3s → fark eşit
  });

  it("orbit deterministik: aynı t aynı dönüşüm", () => {
    const a = computeCamera("orbit", 5.25, DURATION, INTENSITY);
    const b = computeCamera("orbit", 5.25, DURATION, INTENSITY);
    expect(a).toEqual(b);
  });
});

describe("camera — cinematic pan", () => {
  it("t=0: soldan başlar (offsetX negatif), scale ve offsetY sınırlı", () => {
    const t0 = computeCamera("pan", 0, DURATION, INTENSITY);
    expect(t0.offsetX).toBeLessThan(0);
    expect(t0.scale).toBeGreaterThan(1);
    expect(typeof t0.offsetY).toBe("number");
    expect(typeof t0.rotation).toBe("number");
  });

  it("t=duration/2: merkezden geçer (offsetX ~ 0)", () => {
    const mid = computeCamera("pan", DURATION / 2, DURATION, INTENSITY);
    expect(Math.abs(mid.offsetX)).toBeLessThan(0.01);
    expect(mid.scale).toBeGreaterThan(1.1);
  });

  it("t=duration: sağa ulaşır (offsetX pozitif)", () => {
    const tEnd = computeCamera("pan", DURATION, DURATION, INTENSITY);
    expect(tEnd.offsetX).toBeGreaterThan(0);
  });

  it("pan deterministik: aynı t aynı dönüşümü üretir", () => {
    const a = computeCamera("pan", 4.2, DURATION, INTENSITY);
    const b = computeCamera("pan", 4.2, DURATION, INTENSITY);
    expect(a).toEqual(b);
  });
});

describe("camera — aralık dışı ve uç girdiler", () => {
  it("t > duration kelepçelenir: sonuç t=duration ile aynı", () => {
    const over = computeCamera("zoom-in", DURATION + 100, DURATION, INTENSITY);
    const end = computeCamera("zoom-in", DURATION, DURATION, INTENSITY);
    expect(over).toEqual(end);
  });

  it("t < 0 kelepçelenir: sonuç t=0 ile aynı", () => {
    const under = computeCamera("orbit", -50, DURATION, INTENSITY);
    const start = computeCamera("orbit", 0, DURATION, INTENSITY);
    expect(under).toEqual(start);
  });

  it("duration = 0: p=0 alınır, sonuç t=0 durumuyla aynı", () => {
    const zero = computeCamera("zoom-in", 5, 0, INTENSITY);
    const start = computeCamera("zoom-in", 0, DURATION, INTENSITY);
    expect(zero).toEqual(start);
  });
});

run();
