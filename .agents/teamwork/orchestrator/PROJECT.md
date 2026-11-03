# Project: 4 SaaS Production Applications Suite

## Architecture
The repository consists of 4 independent Next.js 15 App Router applications sharing standard patterns, with a unified QA contract and verification suite:
1. `konvertlab` (Port 3001): 100% client-side file and document conversion tool (PDF, Word, Excel, Images, OCR, Batch ZIP).
2. `seoradar` (Port 3002): Comprehensive technical SEO auditor, Core Web Vitals analyzer, security headers validator, and PDF reporting engine with WhatsApp agency inquiry.
3. `terneon` (Port 3003): Cyberpunk/Neon digital agency landing page with canvas particle background, interactive device preview simulator, dynamic pricing calculator, and WhatsApp proposal generator.
4. `parselya` (Port 3004): Drone & land parcel video animation platform with TKGM cadastral query engine, satellite tiles, canvas camera engine, and client-side video recorder.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Port & Contract Alignment | Align ports to 3001, 3002, 3003, 3004 across all config & QA files | M0 | Survey & PRD |
| 2 | KonvertLab PDF to Word | Convert PDF text and layout to DOCX using docx library | M1 | PRD §2.1 |
| 3 | KonvertLab PDF to Excel | Convert tabular PDF text to XLSX spreadsheets using xlsx | M1 | PRD §2.1 |
| 4 | KonvertLab PDF to Image | Render PDF pages to PNG/JPG using pdfjs-dist and canvas | M1 | PRD §2.1 |
| 5 | KonvertLab Image to WebP | Convert uploaded images to WebP with custom quality slider | M1 | PRD §2.1 |
| 6 | KonvertLab Client OCR | Tesseract.js client-side OCR for scanned PDFs & images | M1 | PRD §2.2 |
| 7 | KonvertLab Batch Pro ZIP | Multi-file drag-drop batch conversion with JSZip archive download | M1 | PRD §2.3 |
| 8 | SeoRadar Core Web Vitals | Algorithmic estimation of LCP, CLS, FID/INP metrics | M2 | PRD §3.1 |
| 9 | SeoRadar Security Headers | HTTP header inspection for HSTS, CSP, X-Frame-Options, etc. | M2 | PRD §3.2 |
| 10 | SeoRadar Competitor Tab | Enhanced side-by-side comparison with CWV & security score | M2 | PRD §3.3 |
| 11 | SeoRadar PDF Export | Integrate CWV, security headers, and competitor metrics in PDF | M2 | PRD §3.4 |
| 12 | Terneon Layout Cleanup | Fix duplicate Header/Footer/main in page.tsx vs layout.tsx | M3 | Survey & PRD |
| 13 | Terneon Device Simulator | Interactive desktop/mobile preview modal with rich UI mock templates | M3 | PRD §4.1 |
| 14 | Terneon Neon Canvas & Price | Verify canvas background, pricing calculator, WhatsApp generator | M3 | PRD §4.2 |
| 15 | Parselya Kadastro Engine | TKGM Megsis API query with geodetic fallback polygon math | M4 | PRD §1.1 |
| 16 | Parselya Satellite Tiles | Google Maps Satellite and Esri HD tile integration with Mercator math | M4 | PRD §1.2 |
| 17 | Parselya Drone Upload | Local photo upload overlay onto canvas with position controls | M4 | PRD §1.3 |
| 18 | Parselya Camera & Timeline | Zoom-in, orbit camera animation, POI distance lines, timeline | M4 | PRD §1.4 |
| 19 | Parselya Video Export | MediaRecorder canvas recording with tainted-canvas guard | M4 | PRD §1.5 |
| 20 | E2E Testing Suite (T1-T4) | Complete 4-Tier test suite covering all features and scenarios | E2E | PRD & Methodology |
| 21 | Final Verification & Hardening | 100% pass across all E2E tests, QA contracts, builds | Final | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Port & Contract Migration | Synchronize ports to 3001-3004 in scripts, docker, QA, package.json | none | DONE |
| M1 | KonvertLab Production Perfection | Nashi-app UX, Sample files, WebP preview, Turkish OCR, Batch Pro ZIP, QR Tool | M0 | DONE |
| M2 | SeoRadar Production Perfection | Quick demo sites, CWV PageSpeed scorecards, Security headers copy snippet, Corporate PDF | M0 | DONE |
| M3 | Terneon Production Perfection | Eraslan Software editorial design, Safari + overlapping iPhone frame, 6 sectors, live WhatsApp terminal | M0 | DONE |
| M4 | Parselya Production Perfection | parselsorgu.pro UI layout, edge lengths toggle, TKGM CBS live API, Google/Esri satellite sync, video flight | M0 | DONE |
| Final | Production Verification | 100% build pass across all 4 apps (Next.js 15), 373 unit tests pass, 86 QA contracts pass | M1, M2, M3, M4 | DONE |


## Interface Contracts
### Port & URL Endpoints
- `konvertlab`: http://localhost:3001
- `seoradar`: http://localhost:3002
- `terneon`: http://localhost:3003
- `parselya`: http://localhost:3004

### KonvertLab Internal Contract
- Client-side only. No server API routes permitted (`qa/run-all.mjs` enforces `forbidApiRoutes`).
- Conversions export downloadable blobs (`Blob`, `application/pdf`, `application/vnd.openxmlformats...`, `application/zip`).

### SeoRadar API Contract
- `POST /api/analyze`: Body `{ url: string }`. Returns JSON including `score`, `checks`, `headings`, `images`, `links`, `cwv` (LCP, CLS, FID/INP), `securityHeaders` (HSTS, CSP, X-Frame).
- PDF Generator: accepts full analysis data object and exports valid PDF buffer.

### Parselya API Contract
- `GET /api/parsel?il=X&ilce=Y&mahalle=Z&ada=A&parsel=B`: Returns GeoJSON feature with coordinates and attributes.

## Code Layout
- Root: `package.json`, `scripts/`, `qa/`, `docker-compose.yml`
- KonvertLab: `konvertlab/components/`, `konvertlab/lib/`, `konvertlab/app/`
- SeoRadar: `seoradar/components/`, `seoradar/lib/`, `seoradar/app/`
- Terneon: `terneon/components/`, `terneon/config/`, `terneon/app/`
- Parselya: `parselya/components/`, `parselya/lib/`, `parselya/app/`
