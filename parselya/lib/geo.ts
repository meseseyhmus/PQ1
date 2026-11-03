import type { LatLng } from "@/types";

export interface BBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export function normalizePolygon(polygon: LatLng[]): LatLng[] {
  if (polygon.length < 3) return polygon;
  // İlk noktayı sona ekle (kapalı halka) — çizim kolaylığı için açık tutarız,
  // burada sadece geçersiz/tekrar eden noktaları ayıklıyoruz.
  const out: LatLng[] = [];
  for (const p of polygon) {
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  return out;
}

export function centroid(polygon: LatLng[]): LatLng {
  let x = 0;
  let y = 0;
  let a = 0;
  for (let i = 0; i < polygon.length; i++) {
    const p0 = polygon[i];
    const p1 = polygon[(i + 1) % polygon.length];
    const cross = p0[0] * p1[1] - p1[0] * p0[1];
    a += cross;
    x += (p0[0] + p1[0]) * cross;
    y += (p0[1] + p1[1]) * cross;
  }
  if (Math.abs(a) < 1e-12) {
    // bozulmuş poligon: ortalama al
    for (const p of polygon) {
      x += p[0];
      y += p[1];
    }
    return [x / polygon.length, y / polygon.length];
  }
  a *= 0.5;
  return [x / (6 * a), y / (6 * a)];
}

export function bbox(polygon: LatLng[]): BBox {
  const b: BBox = {
    minLng: Infinity,
    minLat: Infinity,
    maxLng: -Infinity,
    maxLat: -Infinity,
  };
  for (const [lng, lat] of polygon) {
    b.minLng = Math.min(b.minLng, lng);
    b.maxLng = Math.max(b.maxLng, lng);
    b.minLat = Math.min(b.minLat, lat);
    b.maxLat = Math.max(b.maxLat, lat);
  }
  return b;
}

export function polygonPerimeterMeters(polygon: LatLng[]): number {
  let d = 0;
  for (let i = 0; i < polygon.length; i++) {
    d += haversineMeters(polygon[i], polygon[(i + 1) % polygon.length]);
  }
  return d;
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Poligonun "dış çemberini" kapsayan bir projeksiyon kurar.
 * lng/lat koordinatlarını, merkezi (0,0) olacak şekilde metre cinsinden
 * lokal kartezyen koordinatlara çevirir.
 */
export function makeLocalProjection(polygon: LatLng[]) {
  const c = centroid(polygon);
  const latRad = (c[1] * Math.PI) / 180;
  const metersPerDegLng = 111320 * Math.cos(latRad);
  const metersPerDegLat = 110540;
  const project = (p: LatLng): { x: number; y: number } => ({
    x: (p[0] - c[0]) * metersPerDegLng,
    y: -(p[1] - c[1]) * metersPerDegLat,
  });
  return { project, center: c };
}

/**
 * Lokal metre koordinatlarını canvas piksellerine ölçekler.
 * contentSize: sahnenin merkezinde ayrılan kullanılabilir alan (kare).
 */
export function makeScreenProjection(
  polygon: LatLng[],
  canvasW: number,
  canvasH: number,
  contentSize: number,
) {
  const { project } = makeLocalProjection(polygon);
  const pts = polygon.map(project);
  const maxR = Math.max(
    1,
    ...pts.map((p) => Math.hypot(p.x, p.y)),
  );
  const scale = contentSize / (maxR * 2);
  const toScreen = (p: LatLng): { x: number; y: number } => {
    const local = project(p);
    return {
      x: canvasW / 2 + local.x * scale,
      y: canvasH / 2 + local.y * scale,
    };
  };
  return { toScreen, scale, project, maxR };
}
