import type { CameraMotion } from "@/types";

export interface CameraTransform {
  scale: number;
  rotation: number; // radyan
  offsetX: number; // normalize (-1..1) sahne genişliği oranı
  offsetY: number;
}

export function easeOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

/**
 * t ∈ [0, duration] için kamera dönüşümünü hesaplar.
 * Deterministiktir: aynı t → aynı sonuç (export = önizleme).
 */
export function computeCamera(
  motion: CameraMotion,
  t: number,
  duration: number,
  intensity: number,
): CameraTransform {
  const p = duration <= 0 ? 0 : Math.min(1, Math.max(0, t / duration));
  const k = 0.4 + intensity * 1.2; // yoğunluk katsayısı

  if (motion === "zoom-in") {
    const e = easeOutCubic(p);
    const startScale = 1 + 1.6 * k; // ~2.6 @ k=1
    const scale = startScale + (1 - startScale) * e;
    // hafif aşağı doğru pan (yüksek irtifadan iniş hissi)
    const offsetY = (1 - e) * 0.12 * k;
    const offsetX = (1 - e) * 0.04 * k;
    return { scale, rotation: (1 - e) * 0.06 * k, offsetX, offsetY };
  }

  if (motion === "pan") {
    // Cinematic Pan: smooth horizontal & gentle vertical sweep across parcel
    const panProgress = Math.sin((p - 0.5) * Math.PI); // -1..1
    const offsetX = panProgress * 0.14 * k;
    const offsetY = Math.cos(p * Math.PI * 2) * 0.025 * k;
    const scale = 1.08 + Math.sin(p * Math.PI) * 0.14 * k;
    const rotation = Math.sin((p - 0.5) * Math.PI) * 0.03 * k;
    return { scale, rotation, offsetX, offsetY };
  }

  // orbit
  const e = easeOutCubic(Math.min(1, p * 1.15));
  const scale = 1.0 + 0.18 * k - 0.06 * k * e;
  const rotation = p * Math.PI * 2;
  const bob = Math.sin(p * Math.PI * 4) * 0.015 * k;
  return { scale, rotation, offsetX: 0, offsetY: bob };
}
