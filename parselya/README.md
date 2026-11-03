# Parselya

Parsel video editörü — kredili SaaS. Koyu, editör tarzı bir arayüzde parsel
poligonunu çizer, kamera/stil/overlay ayarlar ve **WebM** olarak dışa aktarır.

Tamamen **çevrimdışı** çalışır: harita dokusu prosedürel üretilir, harici harita
sağlayıcı (Mapbox / Cesium / Google Maps) **ve API anahtarı istenmez**.

> Bu proje `saas/` paketindeki **dört bağımsız uygulamadan** biridir. Ortak npm
> workspace kullanılmaz; kendi `package.json`, kendi `node_modules`, kendi dağıtım
> hedefi vardır.

## Hızlı başlangıç

```bash
cd parselya
npm install
npm run dev          # → http://localhost:3004
```

Üretim derlemesi:

```bash
npm run build
npm start            # → http://localhost:3004
```

Paket kökünden:

```bash
node scripts/dev-all.mjs --only parselya
node scripts/build-all.mjs --only parselya
```

## Dizin yapısı

```
parselya/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # editör kabuğu — sekmeler, timeline, dışa aktar
│   └── globals.css
├── state/EditorContext.tsx   # tüm editör durumu (parsel, kamera, stil, kredi, zaman)
├── components/
│   ├── ParcelCanvas.tsx      # HTML5 Canvas sahnesi
│   ├── CameraPicker.tsx      # kamera yolu / preset
│   ├── ColorPicker.tsx
│   ├── OverlayPresetPicker.tsx
│   ├── TabStyleCamera.tsx    # stil + kamera sekmesi
│   ├── TabOverlays.tsx       # overlay sekmesi
│   ├── TabParcelQuery.tsx    # parsel sorgu / GeoJSON
│   ├── CreditBadge.tsx       # kredi sayacı
│   └── ui/                   # ortak kontroller
├── lib/
│   ├── exportVideo.ts        # MediaRecorder + captureStream → WebM
│   ├── geo.ts                # GeoJSON poligon → ekran projeksiyonu
│   ├── camera.ts             # zoom / orbit / kamera matematiği
│   ├── canvasRegistry.ts     # kanvas kaydı (dışa aktarım için)
│   ├── demoParcel.ts         # örnek parsel verisi
│   ├── format.ts
│   └── cn.ts
├── config/siteConfig.ts      # marka, planlar, kredi fiyatları
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Deterministik render

Sahne `renderAt(time)` ile çizilir: **aynı `time` değeri her zaman aynı kareyi
üretir**. Bu, dışa aktarımın gerçek zamanlı oynatım ile birebir aynı olmasını
sağlar (timeline `play` → `recordCanvas` sırasında `renderAt` zinciri).

```ts
renderAt(0)     // ilk kare
renderAt(2.5)   // 2.5. saniye
renderAt(duration)
```

## Prosedürel uydu dokusu

`lib/geo.ts` + `ParcelCanvas.tsx` parsel çevresini prosedürel bir uydu dokusuyla
çizer (gürültü + parseller + yollar). **Harici harita SDK'sı, lisans anahtarı veya
ağ isteği yoktur** — kurulumdan hemen sonra çalışır, demo tamamen offline'dır.

GeoJSON poligon girdisi (`TabParcelQuery`) gerçek koordinat listesinden ekran
uzayına projekte edilir; zoom/orbit kamera `lib/camera.ts` üzerinden yönetilir.

## WebM dışa aktarma

```ts
import { isExportSupported, recordCanvas } from "@/lib/exportVideo";

if (isExportSupported()) {
  const { blob, extension } = await recordCanvas(
    canvas,          // HTMLCanvasElement
    15,              // süre (saniye)
    run,             // kayıt sırasında sahneyi oynatan async fonksiyon
    (ratio) => …,    // isteğe bağlı ilerleme geri çağrısı
  );
  // blob → indir: parselya-<tarih>.webm
}
```

- Kullanılan API: `canvas.captureStream()` + `MediaRecorder`
- Öncelikli codec: `video/webm;codecs=vp9` → `vp8` → `video/webm` → `video/mp4`
- **Chrome / Edge**: destekli. **Firefox**: `isExportSupported()` `false` döner ve
  arayüz indirme butonunu devre dışı bırakır / alternatif sunar.
- Kayıt gerçek zamanlıdır (sahne oynatılırken yakalanır); dışa aktarma başına kredi düşer.

## Kredi sistemi

`config/siteConfig.ts` içindeki `CREDIT_PLANS` kredi paketlerini tanımlar
(ör. Başlangıç / Profesyonel / Ajans). `CreditBadge` kalan krediyi gösterir;
dışa aktarım ve bazı pro araçlar kredi harcar. Plan değişince sayaç artar.

Tüm editör durumu `state/EditorContext.tsx` içindedir (tek kaynak):
parsel, kamera, stil, overlay, oynatma zamanı, kredi, dışa aktarım durumu.

## Bağımlılıklar

| Paket | Majör | Not |
|---|---|---|
| `next` | 15 | App Router |
| `react` / `react-dom` | 19 | |
| `lucide-react` | 0 | ikonlar |
| `clsx` + `tailwind-merge` | — | `lib/cn.ts` |
| `tailwindcss` | 3 | **v3** (v4 değil) |
| `typescript` | 5 | |

**Harici harita SDK'sı yoktur.** Mapbox, Cesium, Google Maps vb. bilinçli olarak
kullanılmamıştır — ürün token gerektirmeden çalışmalıdır.

## Docker

```bash
docker build -t parselya .
docker run --rm -p 3004:3004 parselya
```

Paket kökünden: `docker compose up parselya` (port 3004).

## Test

```bash
node qa/run-all.mjs --only parselya    # paket/dosya/izolelik sözleşmesi
node scripts/status.mjs
```

Uçtan uca kontrol listesi (canvas, zoom/orbit, deterministik timeline, WebM,
kredi sayacı) kök `TESTING.md` içindedir.

## Sınırlar

- Sunucu API rota **yoktur**; her şey tarayıcıda olur.
- WebM dışa aktarımı tarayıcı desteğine bağlıdır (`isExportSupported`).
- Harici harita/uydu görüntüsü **çekilmez**; doku prosedüreldir ve temsilidir.
- Ödeme entegrasyonu bu sürümde yoktur; kredi planları `siteConfig` üzerinden
  yapılandırılır.
- Diğer uygulamalarla (SeoRadar, KonvertLab, Terneon) kaynak paylaşılmaz;
  çapraz import `qa/run-all.mjs` 7b denetimiyle engellenir.