"use client";

import {
  useEffect,
  useRef,
  type Ref,
} from "react";
import type { EditorState, LatLng, OverlayItem } from "@/types";
import { computeCamera, easeOutCubic } from "@/lib/camera";
import { makeScreenProjection, haversineMeters } from "@/lib/geo";
import { mulberry32 } from "@/lib/demoParcel";
import { canvasRegistry } from "@/lib/canvasRegistry";
import { siteConfig } from "@/config/siteConfig";
import { lngLatToTile, tileToLngLat, tileCache } from "@/lib/tileProvider";
import { formatM2 } from "@/lib/format";

export interface ParcelCanvasHandle {
  renderAt(time: number): void;
  getCanvas(): HTMLCanvasElement | null;
  setResolution(w: number, h: number): void;
}

interface SceneParams {
  state: EditorState;
  time: number;
  customImage?: HTMLImageElement | null;
  onTileLoaded?: () => void;
}

/* ------------------------------------------------------------------ */
/* Prosedürel uydu dokusu (deterministik, önbelleklenir)               */
/* ------------------------------------------------------------------ */

const TERRAIN_SIZE = 1024;

function valueNoise(rng: () => number, grid: number): (x: number, y: number) => number {
  const g: number[][] = [];
  for (let i = 0; i <= grid; i++) {
    g[i] = [];
    for (let j = 0; j <= grid; j++) g[i][j] = rng();
  }
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const gx = Math.min(grid - 1, Math.max(0, x * grid));
    const gy = Math.min(grid - 1, Math.max(0, y * grid));
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const fx = smooth(gx - i);
    const fy = smooth(gy - j);
    const a = g[j][i] * (1 - fx) + g[j][i + 1] * fx;
    const b = g[j + 1][i] * (1 - fx) + g[j + 1][i + 1] * fx;
    return a * (1 - fy) + b * fy;
  };
}

function buildTerrain(): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = TERRAIN_SIZE;
  cv.height = TERRAIN_SIZE;
  const ctx = cv.getContext("2d")!;
  const rng = mulberry32(20260101);
  const n1 = valueNoise(rng, 8);
  const n2 = valueNoise(rng, 24);
  const n3 = valueNoise(rng, 64);

  const img = ctx.createImageData(TERRAIN_SIZE, TERRAIN_SIZE);
  for (let y = 0; y < TERRAIN_SIZE; y++) {
    for (let x = 0; x < TERRAIN_SIZE; x++) {
      const u = x / TERRAIN_SIZE;
      const v = y / TERRAIN_SIZE;
      const e = n1(u, v) * 0.6 + n2(u, v) * 0.3 + n3(u, v) * 0.1;

      // su şeridi: sol üst köşegen bant
      const waterBand = u + v * 0.6 < 0.42 && n2(u, v) < 0.55;
      // yol şeridi: sağ alttan geçen düz bant
      const roadDist = Math.abs(v - (0.78 + u * 0.1));

      let r: number, g: number, b: number;
      if (waterBand) {
        r = 18; g = 52; b = 88;
      } else if (roadDist < 0.008) {
        r = 96; g = 92; b = 84;
      } else if (roadDist < 0.016) {
        r = 58; g = 54; b = 48;
      } else if (e < 0.35) {
        // tarım alanları — koyu yeşil
        const t = e / 0.35;
        r = 34 + t * 18; g = 72 + t * 30; b = 38 + t * 14;
      } else if (e < 0.62) {
        // çayır / açık yeşil
        const t = (e - 0.35) / 0.27;
        r = 58 + t * 40; g = 100 + t * 30; b = 48 + t * 22;
      } else {
        // kuru toprak / kahve tonları
        const t = (e - 0.62) / 0.38;
        r = 118 + t * 42; g = 104 + t * 34; b = 70 + t * 26;
      }
      // doku gren
      const grain = (n3(u, v) - 0.5) * 14;
      const idx = (y * TERRAIN_SIZE + x) * 4;
      img.data[idx] = Math.max(0, Math.min(255, r + grain));
      img.data[idx + 1] = Math.max(0, Math.min(255, g + grain));
      img.data[idx + 2] = Math.max(0, Math.min(255, b + grain));
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const v = m.length === 3
    ? m.split("").map((c) => c + c).join("")
    : m;
  const n = parseInt(v, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function withAlpha(hex: string, a: number): string {
  return hexToRgba(hex, a);
}

interface CameraView {
  scale: number;
  rotation: number;
  cx: number;
  cy: number;
  offsetX: number;
  offsetY: number;
  transformPoint(px: number, py: number): { x: number; y: number };
  apply(ctx: CanvasRenderingContext2D): void;
}

function makeView(
  w: number,
  h: number,
  cam: ReturnType<typeof computeCamera>,
): CameraView {
  const { scale, rotation, offsetX, offsetY } = cam;
  const cx = w / 2;
  const cy = h / 2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    scale,
    rotation,
    cx,
    cy,
    offsetX: offsetX * w,
    offsetY: offsetY * h,
    transformPoint(px: number, py: number) {
      const dx = (px - cx) * scale;
      const dy = (py - cy) * scale;
      return {
        x: this.offsetX + cx + dx * cos - dy * sin,
        y: this.offsetY + cy + dx * sin + dy * cos,
      };
    },
    apply(ctx) {
      ctx.save();
      ctx.translate(this.offsetX, this.offsetY);
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.rotate(rotation);
      ctx.translate(-cx, -cy);
    },
  };
}

/* ------------------------------------------------------------------ */
/* Ana çizim                                                           */
/* ------------------------------------------------------------------ */

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, terrain: HTMLCanvasElement, params: SceneParams) {
  const { state, time } = params;
  const { style, camera, parcel, overlays } = state;
  const D = camera.duration;
  const t = Math.min(D, Math.max(0, time));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const cam = computeCamera(camera.motion, t, D, camera.intensity);
  const view = makeView(w, h, cam);

  /* Projeksiyon hazırlığı */
  const content = Math.min(w, h) * 0.62;
  const proj = makeScreenProjection(parcel.polygon, w, h, content);
  const { toScreen } = proj;
  const pts = parcel.polygon.map((p: LatLng) => toScreen(p));
  const centerScreen = toScreen(parcel.center);

  /* 1 — uydu tabanı (kamera dönüşümü altında) */
  view.apply(ctx);
  const terrainScale = Math.max(w, h) * (camera.motion === "zoom-in" ? 3.4 : 2.2) / TERRAIN_SIZE;
  const tw = TERRAIN_SIZE * terrainScale;
  ctx.imageSmoothingEnabled = true;

  const bg = state.background ?? {
    source: "google-satellite" as const,
    opacity: 0.95,
    brightness: 100,
    customImageUrl: null,
  };

  // 1.1 Temel doku (prosedürel uydu/zemin astarı)
  if (bg.source !== "dark-satellite") {
    ctx.drawImage(terrain, w / 2 - tw / 2, h / 2 - tw / 2, tw, tw);
  } else {
    ctx.fillStyle = "#0c1017";
    ctx.fillRect(w / 2 - tw / 2, h / 2 - tw / 2, tw, tw);
  }

  const rawBrightness = bg.brightness ?? 100;
  const brightnessVal = rawBrightness <= 2 ? Math.round(rawBrightness * 100) : rawBrightness;

  // 1.2 Özel kullanıcı görseli (drone / ortofoto)
  if (bg.source === "custom" && params.customImage) {
    ctx.save();
    ctx.filter = `brightness(${brightnessVal}%) contrast(105%)`;
    ctx.globalAlpha = bg.opacity;
    const img = params.customImage;
    const imgW = img.naturalWidth || img.width || TERRAIN_SIZE;
    const imgH = img.naturalHeight || img.height || TERRAIN_SIZE;
    const aspect = imgW / imgH;
    const baseW = Math.max(w, h) * 2.2;
    const customScale = bg.customScale ?? 1;
    const boxW = baseW * customScale;
    const boxH = boxW / aspect;
    const rotationRad = ((bg.customRotation ?? 0) * Math.PI) / 180;

    ctx.translate(w / 2, h / 2);
    if (rotationRad !== 0) ctx.rotate(rotationRad);
    ctx.drawImage(img, -boxW / 2, -boxH / 2, boxW, boxH);
    ctx.restore();
  } else if (
    bg.source === "google-satellite" ||
    bg.source === "esri-satellite" ||
    bg.source === "osm" ||
    bg.source === "dark-satellite"
  ) {
    // 1.3 Harita fayansları (Web Mercator Tile Grid)
    const maxR = proj.maxR || 100;
    const spanMeters = maxR * 2;
    let z = 16;
    if (spanMeters < 150) z = 18;
    else if (spanMeters < 350) z = 17;
    else if (spanMeters < 850) z = 16;
    else if (spanMeters < 2000) z = 15;
    else z = 14;

    const centerTile = lngLatToTile(parcel.center[0], parcel.center[1], z);

    ctx.save();
    ctx.filter = `brightness(${brightnessVal}%)`;
    ctx.globalAlpha = bg.opacity;

    // 7x7 fayans ızgarası ile kadastro alanını ve kamera dönüş alanını tamamen kapla
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        const tx = centerTile.x + dx;
        const ty = centerTile.y + dy;
        const tileImg = tileCache.getTile(bg.source, tx, ty, z, params.onTileLoaded);
        if (tileImg) {
          const b = tileToLngLat(tx, ty, z);
          const tl = toScreen([b.minLng, b.maxLat]);
          const br = toScreen([b.maxLng, b.minLat]);
          const tileW = (br.x - tl.x) + 0.5;
          const tileH = (br.y - tl.y) + 0.5;
          ctx.drawImage(tileImg, tl.x, tl.y, tileW, tileH);
        }
      }
    }
    ctx.restore();
  }

  // grid (isteğe bağlı)
  if (style.showGrid) {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1 / cam.scale;
    const step = 60;
    for (let gx = -tw; gx < tw; gx += step) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + gx, h / 2 - tw);
      ctx.lineTo(w / 2 + gx, h / 2 + tw);
      ctx.stroke();
    }
    for (let gy = -tw; gy < tw; gy += step) {
      ctx.beginPath();
      ctx.moveTo(w / 2 - tw, h / 2 + gy);
      ctx.lineTo(w / 2 + tw, h / 2 + gy);
      ctx.stroke();
    }
  }
  ctx.restore();

  /* 2 — parsel projeksiyonu (ekran koordinatlarında, kamera altında çizilir) */

  // sınır çizim animasyonu: t ∈ [0.05D, 0.35D]
  const drawStart = 0.05 * D;
  const drawEnd = 0.35 * D;
  const drawP = easeOutCubic((t - drawStart) / Math.max(0.001, drawEnd - drawStart));

  // perimeter (px)
  let perim = 0;
  const segLens: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    segLens.push(l);
    perim += l;
  }

  view.apply(ctx);

  // dolgu (çizim tamamlandıktan sonra belirir)
  if (drawP > 0.55 && style.fillOpacity > 0) {
    const fillP = easeOutCubic((drawP - 0.55) / 0.45);
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = withAlpha(style.strokeColor, style.fillOpacity * fillP);
    ctx.fill();
  }

  const strokePath = () => {
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
  };

  if (drawP > 0) {
    const dash = perim * drawP;

    // 3 katman parlama (glow)
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([dash, perim * 2]);

    ctx.shadowColor = withAlpha(style.strokeColor, 0.9);
    ctx.shadowBlur = 26;
    ctx.strokeStyle = withAlpha(style.strokeColor, 0.25);
    ctx.lineWidth = style.strokeWidth * 4;
    strokePath();
    ctx.stroke();

    ctx.shadowBlur = 12;
    ctx.strokeStyle = withAlpha(style.strokeColor, 0.6);
    ctx.lineWidth = style.strokeWidth * 2;
    strokePath();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;
    strokePath();
    ctx.stroke();

    // hareketli "enerji" kesikli çizgisi
    if (drawP >= 1) {
      ctx.setLineDash([14, 22]);
      ctx.lineDashOffset = -t * 46;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = Math.max(1, style.strokeWidth * 0.4);
      strokePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.setLineDash([]);

    // 2.2 Kenar uzunlukları (Haritada göster toggle'ı açıkken)
    if (drawP > 0.7 && style.showEdgeLengths !== false && pts.length >= 3) {
      const poly = parcel.polygon;
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        const geo1 = poly[i];
        const geo2 = poly[(i + 1) % poly.length];
        if (!geo1 || !geo2) continue;
        const lenM = haversineMeters(geo1, geo2);
        if (lenM < 1) continue;

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const text = `${lenM >= 10 ? Math.round(lenM) : lenM.toFixed(1)} m`;

        ctx.font = `bold 10px Inter, system-ui, sans-serif`;
        const tw = ctx.measureText(text).width;
        const bw = tw + 10;
        const bh = 18;

        ctx.fillStyle = "rgba(10, 15, 25, 0.88)";
        roundRect(ctx, midX - bw / 2, midY - bh / 2, bw, bh, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, midX, midY);
      }
    }

    // 2.3 Merkez Parsel Rozeti (Örn. 174/1 • 2.443 m² • Arsa • Akçatarla, Nusaybin / Mardin)
    if (drawP > 0.4 && style.showCenterBadge !== false) {
      const line1 = `${parcel.ada}/${parcel.parsell}`;
      const line2 = formatM2(parcel.areaM2);
      const line3 = parcel.nitelik || "Arsa";
      const line4 = `${parcel.mahalle}, ${parcel.ilce} / ${parcel.il}`;

      const bbw = 148;
      const bbh = 72;
      const bx = centerScreen.x - bbw / 2;
      const by = centerScreen.y - bbh / 2;

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(12, 17, 29, 0.94)";
      roundRect(ctx, bx, by, bbw, bbh, 8);
      ctx.fill();

      ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, bx, by, bbw, bbh, 8);
      ctx.stroke();

      // Line 1: Ada / Parsel
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(line1, centerScreen.x, by + 14);

      // Line 2: Area m²
      ctx.fillStyle = "#38bdf8";
      ctx.font = "600 11px Inter, system-ui, sans-serif";
      ctx.fillText(line2, centerScreen.x, by + 30);

      // Line 3: Nitelik (pill)
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 10px Inter, system-ui, sans-serif";
      ctx.fillText(line3, centerScreen.x, by + 45);

      // Line 4: Location
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "500 9px Inter, system-ui, sans-serif";
      ctx.fillText(line4, centerScreen.x, by + 60);

      ctx.restore();
    }
  }

  /* 3 — mesafe çizgileri / POI'lar (süre %25..100) */
  const poiP = easeOutCubic((t - 0.25 * D) / (0.75 * D));
  if (poiP > 0) {
    ctx.setLineDash([8, 8]);
    for (const poi of parcel.pois) {
      const ps = toScreen(poi.lngLat);
      ctx.strokeStyle = withAlpha(poi.color, 0.85 * poiP);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerScreen.x, centerScreen.y);
      ctx.lineTo(ps.x, ps.y);
      ctx.stroke();

      // POI noktası
      ctx.setLineDash([]);
      ctx.fillStyle = withAlpha(poi.color, poiP);
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([8, 8]);

      // etiket (haversineMeters ile dinamik mesafe hesaplaması)
      const dist = Math.round(haversineMeters(parcel.center, poi.lngLat));
      const distStr = dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(1)} km`;
      const label = poi.label.includes("m") || poi.label.includes("km")
        ? poi.label
        : `${poi.label}: ${distStr}`;

      ctx.font = `600 ${Math.round(Math.min(w, h) * 0.024)}px Inter, system-ui, sans-serif`;
      const tw2 = ctx.measureText(label).width;
      const lx = (centerScreen.x + ps.x) / 2;
      const ly = (centerScreen.y + ps.y) / 2;
      ctx.globalAlpha = poiP;
      ctx.fillStyle = "rgba(11,13,18,0.85)";
      roundRect(ctx, lx - tw2 / 2 - 8, ly - 12, tw2 + 16, 24, 12);
      ctx.fill();
      ctx.strokeStyle = withAlpha(poi.color, 0.6);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, lx, ly);
      ctx.globalAlpha = 1;
    }
    ctx.setLineDash([]);
  }
  ctx.restore();

  /* 4 — bilgi kartları (ekran uzayı, kamera ile dönmez) */
  const centerView = view.transformPoint(centerScreen.x, centerScreen.y);
  const visible = overlays.filter(
    (o) => o.enabled && t >= o.startTime && t <= o.endTime,
  );
  const base = Math.min(w, h);
  for (let i = 0; i < visible.length; i++) {
    const o = visible[i];
    // kartın kendi penceresinde yumuşak giriş
    const appear = easeOutCubic((t - o.startTime) / 0.7);
    if (appear <= 0) continue;
    drawCallout(ctx, w, h, o, appear, i, centerView, base, style.strokeColor);
  }

  /* 5 — vinyet */
  const vg = ctx.createRadialGradient(w / 2, h / 2, base * 0.35, w / 2, h / 2, base * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  /* 6 — filigran */
  if (style.showWatermark) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.translate(w * 0.86, h * 0.94);
    ctx.rotate(-0.12);
    ctx.font = `700 ${Math.round(base * 0.038)}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(siteConfig.domain, 0, 0);
    ctx.restore();
  }
}

function drawCallout(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  o: OverlayItem,
  appear: number,
  index: number,
  centerView: { x: number; y: number },
  base: number,
  accent: string,
) {
  const scale = 0.6 + 0.4 * appear;
  const alpha = appear;
  const delay = Math.min(1, index * 0.08);
  const s = scale * (1 - delay * 0.05 + 0.05);

  const cardW = base * 0.34;
  const cardH = base * 0.115;
  // kart hedef konumu — parsel merkezinden dışa doğru açılır
  const dirX = o.position.x - 0.5;
  const dirY = o.position.y - 0.5;
  const px = o.position.x * _w;
  const py = o.position.y * _h;
  // girişte merkezden hedefe süzülür
  const cx = centerView.x + (px - centerView.x) * appear;
  const cy = centerView.y + (py - centerView.y) * appear;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);

  const x = cx - cardW / 2;
  const y = cy - cardH / 2;

  // bağlantı çizgisi
  ctx.strokeStyle = withAlpha(accent, 0.7);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(centerView.x, centerView.y);
  ctx.lineTo(cx, cy + cardH / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // kart
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "rgba(13,16,23,0.92)";
  roundRect(ctx, x, y, cardW, cardH, base * 0.018);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = withAlpha(accent, 0.55);
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, cardW, cardH, base * 0.018);
  ctx.stroke();

  // sol vurgu şeridi
  ctx.fillStyle = accent;
  roundRect(ctx, x, y + base * 0.018, base * 0.007, cardH - base * 0.036, base * 0.0035);
  ctx.fill();

  // metinler
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `600 ${Math.round(base * 0.02)}px Inter, system-ui, sans-serif`;
  ctx.fillText(o.label.toUpperCase(), x + base * 0.028, y + cardH * 0.33);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.round(base * 0.032)}px Inter, system-ui, sans-serif`;
  ctx.fillText(o.value, x + base * 0.028, y + cardH * 0.7);

  ctx.restore();
  void dirX; void dirY;
}

/* ------------------------------------------------------------------ */
/* Bileşen                                                             */
/* ------------------------------------------------------------------ */

export function ParcelCanvas({
  state,
  handleRef,
}: {
  state: EditorState;
  handleRef?: Ref<ParcelCanvasHandle>;
}) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const terrainRef = useRef<HTMLCanvasElement | null>(null);
  const customImgRef = useRef<HTMLImageElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const resolutionRef = useRef<{ w: number; h: number } | null>(null);

  // boyutlandırma
  useEffect(() => {
    const canvas = canvasElRef.current;
    if (!canvas) return;
    const base = state.aspect === "9:16" ? { w: 608, h: 1080 } : { w: 1080, h: 608 };
    const r = resolutionRef.current ?? base;
    if (canvas.width !== r.w || canvas.height !== r.h) {
      canvas.width = r.w;
      canvas.height = r.h;
    }
  }, [state.aspect]);

  // doku önbelleği
  useEffect(() => {
    if (!terrainRef.current) terrainRef.current = buildTerrain();
  }, []);

  // Özel kullanıcı görseli (drone/ortofoto) yükleme
  useEffect(() => {
    const url = state.background?.customImageUrl;
    if (!url) {
      customImgRef.current = null;
      render(stateRef.current.playback.time);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      customImgRef.current = img;
      render(stateRef.current.playback.time);
    };
  }, [state.background?.customImageUrl]);

  const onTileLoaded = () => {
    render(stateRef.current.playback.time);
  };

  const render = (time: number) => {
    const canvas = canvasElRef.current;
    const terrain = terrainRef.current;
    if (!canvas || !terrain) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawScene(ctx, canvas.width, canvas.height, terrain, {
      state: stateRef.current,
      time,
      customImage: customImgRef.current,
      onTileLoaded,
    });
  };

  // zorunlu API (ref)
  useEffect(() => {
    if (!handleRef) return;
    const api: ParcelCanvasHandle = {
      renderAt: (time) => render(time),
      getCanvas: () => canvasElRef.current,
      setResolution: (w, h) => {
        resolutionRef.current = { w, h };
        const canvas = canvasElRef.current;
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
        }
      },
    };
    if (typeof handleRef === "function") handleRef(api);
    else (handleRef as { current: ParcelCanvasHandle | null }).current = api;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleRef]);

  // kayıt defteri
  useEffect(() => {
    const canvas = canvasElRef.current;
    if (canvas) canvasRegistry.set(canvas);
    return () => canvasRegistry.set(null);
  }, []);

  // oynatma döngüsü / duruk çizim
  useEffect(() => {
    if (state.playback.playing) {
      let raf = 0;
      const loop = () => {
        render(stateRef.current.playback.time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }
    render(state.playback.time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.playback.playing,
    state.playback.time,
    state.aspect,
    state.parcel,
    state.overlays,
    state.style,
    state.camera,
    state.background,
  ]);

  return (
    <canvas
      ref={canvasElRef}
      className="h-full w-full"
      aria-label="Parsel sahne önizlemesi"
    />
  );
}
