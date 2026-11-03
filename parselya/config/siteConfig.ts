import type { OverlayItem, CameraMotion, ParcelData } from "@/types";

export const siteConfig = {
  name: "Parselya",
  tagline: "Arsa & Parsel Video Animasyon Editörü",
  domain: "Parselya.com",
};

export const CREDIT_PLANS = [
  {
    id: "free",
    name: "Ücretsiz",
    credits: 3,
    price: "0₺",
    features: ["3 video kredisi", "720p dışa aktarım", "Filigran kaldırılamaz"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 30,
    price: "299₺/ay",
    features: ["30 video kredisi", "1080p dışa aktarım", "Filigransız export", "Öncelikli render"],
  },
  {
    id: "business",
    name: "Emlak Ofisi",
    credits: 150,
    price: "999₺/ay",
    features: ["150 video kredisi", "1080p dışa aktarım", "Filigransız export", "Çoklu kullanıcı"],
  },
] as const;

export const COLOR_PRESETS = [
  { id: "neon-yesil", name: "Neon Yeşil", value: "#22c55e" },
  { id: "altin-sari", name: "Altın Sarısı", value: "#f5b942" },
  { id: "kirmizi", name: "Kırmızı", value: "#ef4444" },
  { id: "elektrik-mavi", name: "Elektrik Mavisi", value: "#38bdf8" },
  { id: "mor", name: "Neon Mor", value: "#a855f7" },
] as const;

export const CAMERA_PRESETS: {
  id: CameraMotion;
  name: string;
  description: string;
}[] = [
  {
    id: "zoom-in",
    name: "Uzaydan Yakınlaşma",
    description: "Yüksek irtifadan yumuşak bir zoom-in ile parselin üzerine iner.",
  },
  {
    id: "orbit",
    name: "360° Etrafında Dönüş",
    description: "Parsel merkez etrafında tam tur atan yörünge hareketi.",
  },
  {
    id: "pan",
    name: "Sinematik Pan & Kaydırma",
    description: "Parsel üzerinde yatay ve dikey yumuşak sinematik kaydırma.",
  },
];

export const OVERLAY_PRESETS: Omit<OverlayItem, "id">[] = [
  {
    type: "badge",
    label: "Ada / Parsel",
    value: "1425 / 7",
    enabled: true,
    startTime: 1.5,
    endTime: 15,
    position: { x: 0.5, y: 0.08 },
  },
  {
    type: "area",
    label: "Arsa Alanı",
    value: "1.250 m²",
    enabled: true,
    startTime: 3,
    endTime: 15,
    position: { x: 0.18, y: 0.22 },
  },
  {
    type: "imar",
    label: "Tapu & İmar Durumu",
    value: "Müstakil Parsel (Konut İmarlı)",
    enabled: true,
    startTime: 4.5,
    endTime: 15,
    position: { x: 0.2, y: 0.68 },
  },
  {
    type: "price",
    label: "Fiyat",
    value: "2.750.000 ₺",
    enabled: true,
    startTime: 5.5,
    endTime: 15,
    position: { x: 0.68, y: 0.16 },
  },
  {
    type: "distance",
    label: "Sahile Mesafe",
    value: "500 m (Yürüme Mesafesi)",
    enabled: true,
    startTime: 6.5,
    endTime: 15,
    position: { x: 0.72, y: 0.52 },
  },
  {
    type: "distance",
    label: "Havalimanına Mesafe",
    value: "32 km (25 dk)",
    enabled: true,
    startTime: 7.5,
    endTime: 15,
    position: { x: 0.25, y: 0.82 },
  },
  {
    type: "distance",
    label: "Otoyola / Yola Cephe",
    value: "35 m Cephe",
    enabled: true,
    startTime: 8.5,
    endTime: 15,
    position: { x: 0.7, y: 0.75 },
  },
];

export const DEFAULT_PARCEL: ParcelData = {
  il: "Mardin",
  ilce: "Nusaybin",
  mahalle: "Akçatarla",
  ada: "174",
  parsell: "1",
  areaM2: 2443,
  nitelik: "Arsa",
  mevkii: "Nusaybin Yolu",
  pafta: "N46d19b2c",
  polygon: [
    [41.20485, 37.08520],
    [41.20548, 37.08526],
    [41.20556, 37.08474],
    [41.20492, 37.08468],
    [41.20485, 37.08520],
  ],
  center: [41.20520, 37.08497],
  pois: [
    { id: "d400", label: "D-400 Karayolu 80 m", lngLat: [41.2045, 37.0858], color: "#f5b942" },
    { id: "hastane", label: "Nusaybin Devlet Hastanesi 1.8 km", lngLat: [41.218, 37.078], color: "#ef4444" },
    { id: "merkez", label: "İlçe Merkezi 2.4 km", lngLat: [41.222, 37.075], color: "#38bdf8" },
  ],
};
