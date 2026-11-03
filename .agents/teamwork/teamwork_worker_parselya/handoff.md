# Handoff Report — Parselya Implementation (Milestone M4)

## 1. Observation
- **Scope & Objectives**: Parselya (Port 3004) requires:
  1. TKGM Megsis Kadastro Engine (`parselya/app/api/parsel/route.ts`): forward queries to TKGM Megsis API (`megsiswebapi.v3.1/api/parsel/...` per `okansafak/qgistkgmplugin` reference), supporting query params `il`, `ilce`, `mahalle`, `ada`, `parsel`, and coordinates (`lat`, `lng`), with deterministic geodetic fallback polygon algorithm calculating realistic parcel polygons, land area (m²), coordinates, perimeter, and bounding box without crashing.
  2. Satellite & HD Map Tile Layer (`parselya/lib/tileProvider.ts`): Web Mercator tile projection supporting Google Maps Satellite (`lyrs=s`), Esri ArcGIS World Imagery, CartoDB Dark, and OSM with server proxy (`/api/tile`) returning `Access-Control-Allow-Origin: *` to prevent CORS canvas tainting (`SecurityError`).
  3. Local Drone / Plot Photo Upload (`parselya/components/TabStyleCamera.tsx` & `ParcelCanvas.tsx`): FileReader upload with drag-and-drop, opacity slider, brightness slider, 0-360° rotation slider, and 0.5x-3.0x scale controls rendered directly on canvas.
  4. Canvas Animation & Camera Engine (`parselya/components/ParcelCanvas.tsx` & `lib/camera.ts`): timeline controls (Play, Pause, Scrub, Reset, Speed 0.5x, 1x, 1.5x, 2x), camera motion modes (Zoom-in, 360 Orbit, Cinematic Pan), neon glowing parcel boundary lines, translucent area fill, POI distance lines with real-time `haversineMeters`, screen-space callout info cards (Ada/Parsel, m², tapu status, distance to airport/coast/highway).
  5. Video Export Engine (`parselya/lib/exportVideo.ts`): client-side video generation using `canvas.captureStream(30)` and `MediaRecorder` to WebM (VP9/VP8) or MP4, tainted canvas guard, progress indicator, and automatic download.
  6. Verification: 5 test suites (`camera`, `export`, `format`, `geo`, `tile`) with 84 unit tests passing, workspace contract check (`node qa/run-all.mjs`) passing 86/86, and Next.js 15.1.6 production build (`npm --prefix parselya run build`) passing with zero errors.

- **Observed Test Commands & Outputs**:
  - `node parselya/tests/run-tests.mjs`:
    ```text
    Parselya — Birim Testleri
    5 dosya · Node v24.14.1

    ▶ camera … GEÇTİ 167 ms · 21 geçti · 0 başarısız
    ▶ export … GEÇTİ 172 ms · 10 geçti · 0 başarısız
    ▶ format … GEÇTİ 157 ms · 14 geçti · 0 başarısız
    ▶ geo … GEÇTİ 191 ms · 27 geçti · 0 başarısız
    ▶ tile … GEÇTİ 163 ms · 12 geçti · 0 başarısız

    ──── ÖZET ────
      GEÇTİ  camera       167 ms
      GEÇTİ  export       172 ms
      GEÇTİ  format       157 ms
      GEÇTİ  geo          191 ms
      GEÇTİ  tile         163 ms

    5 dosya geçti · 0 dosya kaldı · 853 ms
    ```
  - `npm --prefix parselya run build`:
    ```text
    > parselya@1.0.0 build
    > next build

       ▲ Next.js 15.1.6

       Creating an optimized production build ...
     ✓ Compiled successfully
       Linting and checking validity of types ...
       Collecting page data ...
       Generating static pages (7/7)
     ✓ Generating static pages (7/7)
       Finalizing page optimization ...
       Collecting build traces ...

    Route (app)                              Size     First Load JS
    ┌ ○ /                                    27.5 kB         132 kB
    ├ ○ /_not-found                          979 B           106 kB
    ├ ƒ /api/parsel                          139 B           105 kB
    ├ ƒ /api/tile                            139 B           105 kB
    ├ ○ /robots.txt                          0 B                0 B
    └ ○ /sitemap.xml                         0 B                0 B
    + First Load JS shared by all            105 kB
    ```
  - `node qa/run-all.mjs`:
    ```text
    ━━━ parselya (parselya/ · port 3004) ━━━
      [PASS] Dizin mevcut — parselya
      [PASS] package.json parse edilebilir — name=parselya
      [PASS] Gerekli npm script'leri — dev, build, start
      [PASS] Port sabiti: dev — -p 3004
      [PASS] Port sabiti: start — -p 3004
      [PASS] Bağımlılık: next — 15.1.6
      [PASS] Bağımlılık: react — 19.0.0
      [PASS] Bağımlılık: react-dom — 19.0.0
      [PASS] Bağımlılık: lucide-react — ^0.468.0
      [PASS] Dev bağımlılık: tailwindcss — ^3.4.17
      [PASS] Dev bağımlılık: typescript — ^5.7.2
      [PASS] Beklenen kaynak dosyaları — 9 dosya
      [PASS] Kaynak dosyası sayısı — 36 .ts/.tsx
      [PASS] node_modules — kurulu
      [PASS] README.md mevcut — parselya/README.md
      [PASS] Konteyner dosyaları — Dockerfile + .dockerignore + docker-compose.yml
      [PASS] Konteyner port sabiti: Dockerfile — EXPOSE/PORT/HEALTHCHECK 3004
      [PASS] Konteyner port sabiti: docker-compose.yml — ports/PORT/healthcheck 3004
      [PASS] Uygulamalar arası izolelik — çapraz import yok
      [PASS] SEO meta sözleşmesi — JSON-LD + Open Graph + description

    ━━━━━━━━━━━━━━ ÖZET ━━━━━━━━━━━━━━
      86 geçti · 0 başarısız
    ```

## 2. Logic Chain
1. **TKGM Engine & Fallback Geometry**:
   - In `parselya/app/api/parsel/route.ts`, queries are forwarded to TKGM Megsis API (`https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/parsel/...` and legacy proxy `/megsis/api/parsel/...`) with headers from `okansafak/qgistkgmplugin`.
   - Reverse geocoding by coordinates (`/api/parsel?lat=..&lng=..`) is supported and hits `/megsiswebapi.v3.1/api/parsel/{lat}/{lng}/`.
   - `parseAlan` in `parselya/lib/format.ts` provides locale-independent parsing of Turkish (`"4.483,39"`), English (`"4,483.39"`), and numeric area inputs.
   - If TKGM is unreachable or times out (2000ms AbortController), the deterministic geodetic fallback algorithm calculates realistic jittered polygon vertices, `perimeterMeters` via `polygonPerimeterMeters(polygon)`, and bounding box via `bbox(polygon)` across 40+ Turkish district coordinate centers.
   - The response includes standard GeoJSON feature format (`type: "Feature"`, `geometry`, `properties`) alongside `data` and `parcel` for 100% backward compatibility and contract compliance.

2. **Satellite Tile Layer & CORS Immunity**:
   - `parselya/lib/tileProvider.ts` implements Web Mercator tile projection (`lngLatToTile`, `tileToLngLat`).
   - All tile requests (`google-satellite`, `esri-satellite`, `osm`, `dark-satellite`) route through `/api/tile?source=...`, which fetches the tiles and returns them with `Access-Control-Allow-Origin: *` and 7-day caching.
   - This ensures the browser canvas is never tainted by external cross-origin images, allowing `canvas.captureStream(30)` and `MediaRecorder` to record smoothly without throwing `SecurityError`.

3. **Drone / Plot Photo Upload Layer**:
   - `parselya/components/TabStyleCamera.tsx` handles `FileReader.readAsDataURL` with both file picker and drag-and-drop (`onDragOver`, `onDrop`).
   - Opacity slider (%10-%100), brightness slider (%50-%150), rotation slider (0°-360°), and scale slider (0.5x-3.0x) are provided.
   - In `parselya/components/ParcelCanvas.tsx`, the custom drone photo is rendered as a base layer centered on the parcel with the user's custom scale and rotation applied.

4. **Canvas Camera Engine & Timeline**:
   - `parselya/lib/camera.ts` supports `"zoom-in"`, `"orbit"`, and `"pan"` (Cinematic Pan: smooth horizontal and vertical sweep across parcel center).
   - In `parselya/state/EditorContext.tsx`, `speed` (0.5x to 2x) is added to `playback` state and factored into `usePlaybackClock`.
   - In `parselya/app/page.tsx`, speed buttons (`0.5x`, `1x`, `1.5x`, `2x`) are rendered next to Play/Pause/Scrub/Restart.
   - POI distance lines dynamically calculate real-time ground distance via `haversineMeters` in `ParcelCanvas.tsx`.
   - Screen-space floating info callouts display Ada/Parsel, m², Tapu Durumu, Sahile Mesafe, Havalimanına Mesafe, and Otoyola/Yola Cephe.

5. **Video Export Engine**:
   - `parselya/lib/exportVideo.ts` provides `recordCanvas` using `canvas.captureStream(30)` and `MediaRecorder` (VP9, VP8, WebM, MP4).
   - Added `isCanvasTainted` check to proactively detect and report CORS issues with descriptive Turkish error messages.
   - Modal shows real-time percentage progress (`exportProgress` 0% to 100%) and triggers automatic file download upon completion.

## 3. Caveats
- Direct network access to TKGM servers (`cbsapi.tkgm.gov.tr`) depends on state network availability and firewall policies; when external servers block requests or time out, the deterministic geodetic fallback engine takes over seamlessly without any crash or UI freeze.
- `MediaRecorder` is client-side and requires modern Chromium or Firefox browsers (standard for video creator SaaS applications).

## 4. Conclusion
All 6 scope requirements for Parselya (Port 3004) are completely implemented, genuine, and verified. Next.js 15.1.6 builds with zero errors, all 84 unit tests pass, and workspace contract audits pass 86/86.

## 5. Verification Method
- **Unit Tests**: Run `node parselya/tests/run-tests.mjs` (5 suites, 84 tests pass).
- **Workspace Contract Audit**: Run `node qa/run-all.mjs` (86/86 checks pass).
- **Next.js Production Build**: Run `npm --prefix parselya run build` (builds cleanly with code 0).
- **Files to Inspect**:
  - `parselya/app/api/parsel/route.ts` (TKGM Megsis integration & geodetic fallback)
  - `parselya/lib/tileProvider.ts` (Web Mercator tile provider & proxy URLs)
  - `parselya/components/TabStyleCamera.tsx` (Drone upload, rotation & scale sliders)
  - `parselya/components/ParcelCanvas.tsx` (Canvas render, drone layer, POI distances)
  - `parselya/lib/camera.ts` (Zoom-in, orbit, and pan camera modes)
  - `parselya/lib/exportVideo.ts` (MediaRecorder video export & tainted canvas guard)
  - `parselya/state/EditorContext.tsx` & `parselya/app/page.tsx` (Speed controls 0.5x-2x)
  - `parselya/tests/` (`camera.test.mjs`, `export.test.mjs`, `format.test.mjs`, `geo.test.mjs`, `tile.test.mjs`)
