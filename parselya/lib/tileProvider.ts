import type { BackgroundSource, LatLng } from "@/types";

export interface TileCoordinate {
  x: number;
  y: number;
  z: number;
}

export function lngLatToTile(lng: number, lat: number, zoom: number): TileCoordinate {
  const z = Math.max(0, Math.min(20, Math.round(zoom)));
  const n = Math.pow(2, z);
  const rawX = Math.floor(((lng + 180) / 360) * n);
  const x = Math.max(0, Math.min(n - 1, rawX));
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const clampedRad = (clampedLat * Math.PI) / 180;
  const rawY = Math.floor(
    ((1 - Math.log(Math.tan(clampedRad) + 1 / Math.cos(clampedRad)) / Math.PI) / 2) * n
  );
  const y = Math.max(0, Math.min(n - 1, rawY));
  return { x, y, z };
}

export function tileToLngLat(x: number, y: number, z: number): { minLng: number; maxLng: number; minLat: number; maxLat: number } {
  const n = Math.pow(2, z);
  const minLng = (x / n) * 360 - 180;
  const maxLng = ((x + 1) / n) * 360 - 180;

  const latFromY = (yVal: number) => {
    const latN = Math.PI - (2 * Math.PI * yVal) / n;
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(latN) - Math.exp(-latN)));
  };

  const maxLat = latFromY(y);
  const minLat = latFromY(y + 1);

  return { minLng, maxLng, minLat, maxLat };
}

export function getTileUrl(source: BackgroundSource, x: number, y: number, z: number): string | null {
  const n = Math.pow(2, z);
  const wrappedX = ((x % n) + n) % n;
  if (y < 0 || y >= n) return null;

  switch (source) {
    case "google-satellite":
      // Google Maps Satellite tile layer (proxy via server for zero CORS restrictions)
      return `/api/tile?source=google&x=${wrappedX}&y=${y}&z=${z}`;
    case "esri-satellite":
      // Esri ArcGIS World Imagery (proxy via server to prevent CORS canvas tainting during export)
      return `/api/tile?source=esri&x=${wrappedX}&y=${y}&z=${z}`;
    case "osm":
      // OpenStreetMap tiles
      return `/api/tile?source=osm&x=${wrappedX}&y=${y}&z=${z}`;
    case "dark-satellite":
      // CartoDB Dark Matter tiles
      return `/api/tile?source=carto&x=${wrappedX}&y=${y}&z=${z}`;
    default:
      return null;
  }
}

export function getDirectTileUrl(source: BackgroundSource, x: number, y: number, z: number): string | null {
  const n = Math.pow(2, z);
  const wrappedX = ((x % n) + n) % n;
  if (y < 0 || y >= n) return null;

  switch (source) {
    case "google-satellite": {
      const s = (wrappedX + y) % 4;
      return `https://mt${s}.google.com/vt/lyrs=s&x=${wrappedX}&y=${y}&z=${z}`;
    }
    case "esri-satellite":
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${wrappedX}`;
    case "osm":
      return `https://tile.openstreetmap.org/${z}/${wrappedX}/${y}.png`;
    case "dark-satellite":
      return `https://basemaps.cartocdn.com/dark_all/${z}/${wrappedX}/${y}.png`;
    default:
      return null;
  }
}

class TileCache {
  private cache = new Map<string, HTMLImageElement>();
  private requested = new Set<string>();

  getTile(source: BackgroundSource, x: number, y: number, z: number, onTileLoaded?: () => void): HTMLImageElement | null {
    const url = getTileUrl(source, x, y, z);
    if (!url) return null;

    const key = `${source}_${z}_${x}_${y}`;
    const existing = this.cache.get(key);
    if (existing) {
      return existing.complete && existing.naturalWidth > 0 ? existing : null;
    }

    if (!this.requested.has(key)) {
      this.requested.add(key);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        this.cache.set(key, img);
        if (onTileLoaded) onTileLoaded();
      };
      img.onerror = () => {
        // failed or blocked, remove from cache
        this.cache.delete(key);
      };
    }

    return null;
  }

  clear() {
    this.cache.clear();
    this.requested.clear();
  }
}

export const tileCache = new TileCache();

