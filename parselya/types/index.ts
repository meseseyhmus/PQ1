export type LatLng = [number, number]; // [lng, lat]

export type OverlayType = "badge" | "price" | "area" | "imar" | "distance";

export interface OverlayItem {
  id: string;
  type: OverlayType;
  /** Ana etiket metni, örn. "Arsa Alanı" */
  label: string;
  /** Gösterilecek değer, örn. "1.250 m²" */
  value: string;
  enabled: boolean;
  /** saniye cinsinden zaman aralığı */
  startTime: number;
  endTime: number;
  /** 0..1 normalize konum (sahne genişliği/yüksekliği oranı) */
  position: { x: number; y: number };
}

export type CameraMotion = "zoom-in" | "orbit" | "pan";

export type BackgroundSource =
  | "google-satellite"
  | "esri-satellite"
  | "osm"
  | "dark-satellite"
  | "custom"
  | "procedural";

export interface BackgroundConfig {
  source: BackgroundSource;
  customImageUrl?: string | null;
  customImageName?: string | null;
  opacity: number;
  brightness: number;
  zoomOffset: number;
  customRotation?: number; // 0..360 derece
  customScale?: number; // 0.5..3.0 katsayı
}

export interface PoiMarker {
  id: string;
  label: string;
  /** poligon koordinat uzayında (lng/lat) konum */
  lngLat: LatLng;
  /** mesafe çizgisi rengi */
  color: string;
}

export interface ParcelData {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsell: string;
  polygon: LatLng[];
  areaM2: number;
  center: LatLng;
  pois: PoiMarker[];
  pafta?: string;
  mevkii?: string;
  nitelik?: string;
}

export interface EditorState {
  parcel: {
    il: string;
    ilce: string;
    mahalle: string;
    ada: string;
    parsell: string;
    polygon: LatLng[];
    areaM2: number;
    center: LatLng;
    pois: PoiMarker[];
    pafta?: string;
    mevkii?: string;
    nitelik?: string;
  };
  overlays: OverlayItem[];
  style: {
    strokeColor: string;
    strokeWidth: number;
    fillOpacity: number;
    showGrid: boolean;
    showWatermark: boolean;
    showEdgeLengths?: boolean;
    showCenterBadge?: boolean;
  };
  background: BackgroundConfig;
  camera: {
    motion: CameraMotion;
    duration: number;
    intensity: number;
  };
  playback: {
    time: number;
    playing: boolean;
    fps: number;
    speed?: number;
  };
  aspect: "9:16" | "16:9";
  credits: number;
  purpose?: string;
  sidebarTab?: "ozet" | "plan";
}

export type EditorAction =
  | { type: "SET_PARCEL_FORM"; field: "il" | "ilce" | "mahalle" | "ada" | "parsell"; value: string }
  | { type: "LOAD_PARCEL"; parcel: EditorState["parcel"] }
  | { type: "LOAD_GEOJSON"; polygon: LatLng[] }
  | { type: "ADD_OVERLAY"; overlay: OverlayItem }
  | { type: "REMOVE_OVERLAY"; id: string }
  | { type: "UPDATE_OVERLAY"; id: string; patch: Partial<OverlayItem> }
  | { type: "SET_STYLE"; patch: Partial<EditorState["style"]> }
  | { type: "SET_BACKGROUND"; patch: Partial<BackgroundConfig> }
  | { type: "SET_CUSTOM_BG_IMAGE"; url: string | null; name?: string }
  | { type: "SET_CAMERA"; patch: Partial<EditorState["camera"]> }
  | { type: "SET_PLAYING"; playing: boolean }
  | { type: "SET_TIME"; time: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "TICK"; dt: number }
  | { type: "TOGGLE_PLAY" }
  | { type: "RESTART" }
  | { type: "SET_ASPECT"; aspect: "9:16" | "16:9" }
  | { type: "USE_CREDIT" }
  | { type: "SET_PURPOSE"; purpose: string }
  | { type: "SET_SIDEBAR_TAB"; tab: "ozet" | "plan" }
  | { type: "TOGGLE_EDGE_LENGTHS" }
  | { type: "TOGGLE_CENTER_BADGE" };
