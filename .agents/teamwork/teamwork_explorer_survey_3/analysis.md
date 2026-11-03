# Comprehensive System & E2E Testing Survey Report

**Prepared by:** System & E2E Testing Explorer (`teamwork_explorer_survey_3`)  
**Workspace:** `c:\Users\HUAWEI\Desktop\saas`  
**Date:** 2026-11-02  
**Target Projects:** `seoradar`, `konvertlab`, `terneon`, `parselya`

---

## Executive Summary

A comprehensive investigation of the multi-project SaaS repository `c:\Users\HUAWEI\Desktop\saas` was conducted. The workspace contains four production-oriented SaaS applications built on Next.js 15.1.6, React 19.0.0, and Tailwind CSS 3.4.17. 

Key architectural and operational findings:
1. **Isolation Architecture:** The repository intentionally does not use npm workspaces. Each application lives in its own subdirectory with an independent `package.json`, `package-lock.json`, and `node_modules`. Zero runtime code is shared across boundaries, preventing dependency leakage and ensuring each product can be deployed or sold independently.
2. **Health & Build Status:** All four projects have healthy dependencies installed, zero circular or cross-project imports, pass all 78 contract tests (`qa/run-all.mjs`), pass all 247 unit tests (`scripts/test-all.mjs`), pass JSON Schema validation (`qa/validate-schema.mjs`), and compile into production builds (`scripts/build-all.mjs`).
3. **Port Allocation Divergence:** Currently, the codebase default configuration allocates ports `3000..3003` (`seoradar: 3000`, `konvertlab: 3001`, `terneon: 3002`, `parselya: 3003`), whereas the approved user prompt and orchestrator dispatch specify `3001..3004` (`konvertlab: 3001`, `seoradar: 3002`, `terneon: 3003`, `parselya: 3004`). The files and changes required to reconcile this are detailed in Section 3.
4. **4-Tier E2E Testing Track:** An industrial-grade test framework is specified herein, covering Tier 1 (Functional Feature Coverage >= 5 tests/feature), Tier 2 (Boundary & Corner Cases >= 5 tests/feature), Tier 3 (Cross-Feature Combinations), and Tier 4 (Real-World Workloads & Scenarios).

---

## 1. System Environment & Monorepo Architecture

### 1.1 Host Environment
- **Operating System:** Windows 11 (win32, x64)
- **Node.js Runtime:** `v24.14.1` (Supports native ESM, native TypeScript type stripping via `--import` and `node:test`)
- **Package Manager:** `npm` (independent package-lock.json per project)
- **Workspace Root:** `c:\Users\HUAWEI\Desktop\saas`

### 1.2 Repository Topology
```
c:\Users\HUAWEI\Desktop\saas\
├── package.json              # Monorepo orchestration scripts (dev, build, verify, qa, test)
├── docker-compose.yml        # Multi-container local production stack
├── TESTING.md                # Multi-tier testing manual and contract guide
├── DEPLOYMENT.md             # Standalone & container deployment runbooks
├── docs/                     # Architecture, PRD coverage, design system, roadmaps
├── scripts/                  # Cross-project orchestration CLI utilities (dev-all, build-all, verify-all)
├── qa/                       # Contract validation, JSON schemas, health probes
├── seoradar/                 # Port 3000 (Target: 3002) - SEO Audit & Analysis SaaS
├── konvertlab/               # Port 3001 - In-Browser Document & PDF Converter SaaS
├── terneon/                  # Port 3002 (Target: 3003) - Cyberpunk Web Agency & Showcase SaaS
└── parselya/                 # Port 3003 (Target: 3004) - Real Estate / Parcel Video Generator SaaS
```

### 1.3 Dependency & Framework Matrix

| Attribute | seoradar | konvertlab | terneon | parselya |
|---|---|---|---|---|
| **Next.js Version** | 15.1.6 (App Router) | 15.1.6 (App Router) | 15.1.6 (App Router) | 15.1.6 (App Router) |
| **React Version** | 19.0.0 | 19.0.0 | 19.0.0 | 19.0.0 |
| **Tailwind CSS** | ^3.4.17 | ^3.4.17 | ^3.4.17 | ^3.4.17 |
| **TypeScript** | ^5.7.2 | ^5.7.2 | ^5.7.2 | ^5.7.2 |
| **Icons** | lucide-react ^0.468 | lucide-react ^0.468 | lucide-react ^0.468 | lucide-react ^0.468 |
| **Styling Helpers** | clsx, tailwind-merge | clsx, tailwind-merge | clsx, tailwind-merge | clsx, tailwind-merge |
| **Core Libraries** | cheerio ^1.0.0, jspdf ^2.5.2 | jspdf ^2.5.2, pdfjs-dist ^4.8.69 | framer-motion ^11.15.0 | HTML5 Canvas, MediaRecorder |
| **API Endpoints** | `/api/analyze`, `/api/usage` | None (100% client) | None (Static/Client) | `/api/parsel` (TKGM Kadastro) |
| **Source Files** | 27 (.ts/.tsx) | 28 (.ts/.tsx) | 21 (.ts/.tsx) | 35 (.ts/.tsx) |
| **Unit Test Files**| 4 test suites | 3 test suites | 3 test suites | 3 test suites |
| **Unit Test Count**| 86 passed | 53 passed | 50 passed | 58 passed |

---

## 2. Cross-Project Orchestration & Script Engine

The repository includes a suite of zero-dependency Node ESM scripts in `scripts/` and `qa/` that govern multi-project development, verification, and building.

### 2.1 Available CLI Commands

| Command | Script Invocation | Purpose & Behavior |
|---|---|---|
| `npm run dev` | `node scripts/dev-all.mjs` | Spawns all 4 development servers concurrently with colored stream prefixes and graceful shutdown. |
| `npm run dev:<project>` | `node scripts/dev-all.mjs --only <project>` | Runs only the specified project. |
| `npm run build` | `node scripts/build-all.mjs` | Sequentially builds all 4 projects with `--max-old-space-size=4096`. |
| `npm run build:<project>` | `node scripts/build-all.mjs --only <project>` | Builds only the target project. |
| `npm run test` / `npm run test:all` | `node scripts/test-all.mjs` | Executes all unit tests across all 4 projects in isolation. |
| `npm run qa` | `node qa/run-all.mjs` | Verifies directory layout, script tags, dependencies, port constants, file counts, and absence of cross-project imports (78 checks). |
| `npm run health` | `node qa/health-all.mjs` | Sends HTTP health checks to running localhost ports + validates `/api/usage`. |
| `npm run verify` | `node scripts/verify-all.mjs` | Full CI gate: Validator self-test -> Contract checks -> Unit tests -> Schema validation -> Production build. |
| `npm run verify:fast` | `node scripts/verify-all.mjs --skip-build` | Instant CI gate (< 4 seconds) executing all tests and contracts without triggering full Next.js webpack builds. |
| `npm run smoke:pages` | `node scripts/smoke-pages.mjs` | Live HTTP smoke test checking status 200, Turkish text tokens, SEO meta tags, `robots.txt`, and `sitemap.xml`. |
| `npm run smoke:api` | `node seoradar/scripts/smoke.mjs` | In-depth contract and rate-limiting smoke test against `/api/analyze`. |
| `npm run status` | `node scripts/status.mjs` | Prints real-time dashboard of all 4 projects (node_modules, builds, file counts, framework majors). |

---

## 3. Port Allocation Analysis & Divergence Resolution

### 3.1 The Divergence
There is a discrepancy between the repository's baseline code configuration and the target configuration requested in `ORIGINAL_REQUEST.md` and the Orchestrator dispatch:

| Application | Baseline Code Config | Requested Target Config | Conflict Note |
|---|---|---|---|
| **seoradar** | `Port 3000` | `Port 3002` | Port 3000 is often reserved/occupied by default Next.js setups. Target moves to 3002. |
| **konvertlab** | `Port 3001` | `Port 3001` | Match. |
| **terneon** | `Port 3002` | `Port 3003` | Shifts to 3003 to accommodate seoradar on 3002. |
| **parselya** | `Port 3003` | `Port 3004` | Shifts to 3004 to accommodate terneon on 3003. |

### 3.2 Affected Files Requiring Harmonization if Target Port Set is Applied
If the team transitions the project ports to `3001, 3002, 3003, 3004`:
1. `qa/run-all.mjs`: Line 37 (`seoradar.port: 3002`), Line 94 (`terneon.port: 3003`), Line 118 (`parselya.port: 3004`). (Note: `qa/run-all.mjs` strictly asserts that each project's `dev` and `start` scripts contain `-p <app.port>`).
2. `scripts/dev-all.mjs`: Lines 11-14 (`APPS` array port mappings).
3. `scripts/status.mjs`: Lines 22-25 (`APPS` array port mappings).
4. `scripts/smoke-pages.mjs`: Lines 38, 50, 56 (`APPS` port array).
5. `qa/health-all.mjs`: Lines 17, 19, 20 (`APPS` port array).
6. `docker-compose.yml`: Services port mappings (`seoradar: 3002:3002`, `terneon: 3003:3003`, `parselya: 3004:3004`).
7. `seoradar/package.json`: Scripts `dev` and `start` (`next dev -p 3002`, `next start -p 3002`).
8. `terneon/package.json`: Scripts `dev` and `start` (`next dev -p 3003`, `next start -p 3003`).
9. `parselya/package.json`: Scripts `dev` and `start` (`next dev -p 3004`, `next start -p 3004`).
10. `seoradar/scripts/smoke.mjs`: Default BASE URL parameter (`http://127.0.0.1:3002`).
11. Documentation: `TESTING.md`, `DEPLOYMENT.md`, `README.md`.

*Recommendation for Implementation Agents:* Perform the port migration in an isolated atomic commit so contract and smoke tests remain 100% green at all times.

---

## 4. Deep-Dive Project Survey & Functional Health

### 4.1 SeoRadar (SEO Audit & Revenue Platform)
- **Architecture:** Next.js App Router with Server-Side Route Handler `/api/analyze`.
- **Analysis Pipeline:** `fetchWithTimeout` -> `cheerio` HTML parse -> `extractMetrics` -> `buildChecks` -> `computeScore` -> JSON payload.
- **Security:** Strict SSRF protection via `assertPublicHttpUrl` (blocks private IP ranges, AWS/cloud metadata addresses `169.254.169.254`, localhost, IPv6 loopbacks, and inspects all redirects manually).
- **Core Features Verified:**
  - On-Page Checks: Title tag (length 30-60), Meta Description (70-160), H1-H6 hierarchy, Image ALT tags with missing source list, Content length.
  - Technical Checks: HTTPS enforcement, `robots.txt` resolution, `sitemap.xml` existence, Open Graph tags, Twitter Card, JSON-LD, Viewport, Canonical URL, HTML payload weight.
  - Broken Link Detector: Scans up to 25 links using `HEAD` with fallback to `GET`, detecting 404/500 status codes.
  - Rate Limiting: In-memory IP-based tracker granting 3 free daily audits. Returns HTTP 429 with `RATE_LIMIT` code. Header `x-seoradar-plan: pro` grants unlimited usage.
  - Reporting: Client-side PDF generation via `jspdf`. Free tier adds watermark; Pro tier generates clean white-label audit report.
  - Lead Generation: `AgencyContactModal` capturing name, phone, URL, and linking directly to WhatsApp with pre-filled consultation message.

### 4.2 KonvertLab (Document Converter & YouTube Content Tools)
- **Architecture:** 100% Client-Side Next.js application. Zero server-side API endpoints (`app/api/` does not exist).
- **Security & Privacy:** Documents never touch a server; processed entirely in the user's browser via HTML5 FileReader, Web Workers, and WebAssembly. Zero server infrastructure or bandwidth costs for file processing.
- **Core Features Verified:**
  - TXT to PDF: Textarea input or file drop, customizable font size, margins, left/center/right alignment, page numbers, and Turkish glyph support (via HTML rasterization pipeline in `lib/pdfGenerate.ts`).
  - PDF to TXT: Multi-page text extraction powered by `pdfjs-dist` inside a Web Worker. Displays page-by-page extracted text in an editable editor with `.txt` download.
  - YouTube Tools: SRT / WebVTT subtitle parser in `lib/srtParse.ts`. Automatically strips subtitle numbering, timecodes, speaker tags (`>>`), styling tags (`<i>`, ASS formatting), deduplicates identical consecutive cues, and creates formatted 3-sentence paragraphs for e-books and summaries.
  - Batch Processing (`lib/batch.ts`): Queue manager accepting up to 50 files. Tracks `pending -> running -> done | error` states with live progress bar.
  - Pricing Modal: Freemium model displaying 50-file bulk conversion and ad-free tier.

### 4.3 Terneon (Awwwards-Level Digital Agency Platform)
- **Architecture:** Next.js App Router with Framer Motion animations and dynamic canvas background.
- **Design System Disconnect & Configuration:** Zero hardcoded brand or pricing data in UI components. Everything is derived from `config/siteConfig.ts`.
- **Core Features Verified:**
  - Neon Particle Canvas: Dynamic HTML5 Canvas rendering glowing grid and interactive particles (`NeonCanvasBackground.tsx`).
  - Portfolio Showcase: Filterable by 6 sectors (Health & Clinic, E-commerce, Beauty, Hotels, Cafe/Restaurant, Corporate).
  - Interactive Device Simulator: Live demo modal allowing instant switching between Desktop view (1280px) and Mobile view (375px device frame).
  - 3-Step Price Calculator:
    1. Base Service: Corporate (12.000 TL), E-Commerce (20.000 TL), Custom App (30.000 TL).
    2. Add-ons: Admin Panel (+3.000 TL), Advanced SEO (+3.000 TL), Multi-language (+2.500 TL), AI Chatbot (+4.000 TL), 3D/Canvas (+5.000 TL).
    3. Maintenance: Monthly vs. Yearly subscription.
  - Sticky Summary Cart: Instant calculation with reactive Framer Motion layout animations.
  - WhatsApp Proposal Engine (`lib/whatsapp.ts`): Compiles selected services, add-ons, and prices into a formatted, encoded Turkish business proposal link.

### 4.4 Parselya (Real Estate / Parcel Video Animation Generator)
- **Architecture:** Next.js App Router with Canvas 2D animation engine, Kadastro API route, and MediaRecorder video export.
- **Core Features Verified:**
  - Deterministic Canvas Renderer (`ParcelCanvas.tsx`): Exposes `renderAt(time)`. Given time `t`, the frame rendered is 100% deterministic with zero side-effects. Both live preview (via `requestAnimationFrame`) and video export (via canvas recording) feed into the exact same `renderAt` pipeline.
  - Kadastro Query Engine (`/api/parsel`): Queries Turkish Land Registry (TKGM Megsis API). Implements coordinates dictionary for Turkish districts (Bodrum, Mumcular, Yalıkavak, Çeşme, Urla, etc.) and fallback geodetic polygon generator seeded deterministically.
  - Satellite Tile Integration (`lib/tileProvider.ts`): Web Mercator tile math (`lngLatToTile`, `tileToLngLat`). Loads Google Maps Satellite (`mtX.google.com`), Esri ArcGIS World Imagery, and OpenStreetMap tiles into a 5x5 grid around the parcel centroid.
  - Custom Drone / Orthophoto Upload: Supports user-supplied aerial photos via `FileReader` with brightness, contrast, and opacity tuning.
  - Animation Timeline & Camera Engine (`lib/camera.ts`): Smooth keyframed camera curves (`easeInOutCubic` zoom-in from space, 360° orbit rotation), POI distance callout cards ("Denize 450 m", "Yola Cephe 25 m").
  - Video Export (`lib/exportVideo.ts`): Client-side MediaRecorder canvas stream capture to WebM/MP4 with credit deduction logic.

---

## 5. Testing Tooling Survey

| Tooling Option | Current Availability | Pros | Cons / Constraints | Recommendation |
|---|---|---|---|---|
| **Node.js Native Test Runner (`node:test` + ESM Hooks)** | Fully functional & active in repo (`tests/*.test.mjs`) | Zero dependencies, instant run (< 3s total), native TypeScript support via Node 24 type stripping, rock solid on Windows. | No built-in browser DOM/Canvas execution context unless mocked. | **Primary runner** for Tier 1, Tier 2, and Tier 3 logic, schema, and API tests. |
| **Playwright (`@playwright/test`)** | Available via npx / global / devDependency | Complete browser automation, visual regression, Canvas snapshotting, MediaRecorder testing, responsive viewport simulation. | Requires downloading browser binaries (~300MB), longer CI execution time. | **Dedicated E2E browser runner** for Tier 4 real-world workloads and visual canvas verification. |
| **Vitest** | Not currently installed | Excellent DX, compatible with Vite/Jest syntax. | Adds node_modules overhead to independent apps; redundant given Node 24 native runner. | Not required; current Node native runner is faster and requires no config. |
| **Custom HTTP / Contract Runner (`qa/run-all.mjs`, `smoke-pages.mjs`)** | Fully functional & active in repo | Tailored specifically to this repo's isolation rules and Turkish SEO invariants. | Hand-crafted scripts require maintenance. | Retain and extend for CI gates. |

---

## 6. Architecture of the 4-Tier E2E Testing Track

The E2E Testing Track is organized strictly following the 4-tier methodology, establishing unambiguous validation gates across all 4 products.

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 4: Real-World Workloads & Scenarios                    │
│ Full multi-step end-to-end user journeys (Playwright & API)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Tier 3: Cross-Feature Combinations                          │
│ State interactions, mode switching, dual analysis, cart-demo│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Tier 2: Boundary & Corner Cases (>= 5 per feature)          │
│ Corrupt inputs, giant payloads, rate caps, edge coordinates │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Tier 1: Functional Feature Coverage (>= 5 per feature)      │
│ Core behavior, happy path, data parsing, rendering contracts│
└─────────────────────────────────────────────────────────────┘
```

### 6.1 Tier 1: Functional Feature Coverage Matrix (>=5 tests per feature)

#### SeoRadar (Port 3000 / 3002)
- **Feature 1: On-Page Extraction & Analysis (5+ tests)**
  - TC-SEO-01: Correctly extracts `<title>` and flags ideal length (30-60 characters).
  - TC-SEO-02: Correctly extracts `<meta name="description">` and validates 70-160 range.
  - TC-SEO-03: Parses H1-H6 headers, verifies presence of exactly one H1 tag.
  - TC-SEO-04: Identifies all `<img>` tags, records total count and missing `alt` attributes.
  - TC-SEO-05: Computes word count, reading time, and content length thresholds.
- **Feature 2: Technical SEO Verification (5+ tests)**
  - TC-SEO-06: Verifies HTTPS scheme and flags plain HTTP with error severity.
  - TC-SEO-07: Checks `robots.txt` accessibility and evaluates User-Agent directives.
  - TC-SEO-08: Checks `sitemap.xml` presence and validates XML URLset root structure.
  - TC-SEO-09: Validates canonical tag correctness and origin matching.
  - TC-SEO-10: Checks structured data presence (`application/ld+json`) and Open Graph metadata.
- **Feature 3: Broken Link Scanner (5+ tests)**
  - TC-SEO-11: Classifies internal vs. external links based on hostname origin.
  - TC-SEO-12: Detects and skips un-crawlable protocols (`mailto:`, `tel:`, `javascript:`, `#`).
  - TC-SEO-13: Identifies HTTP 404 responses from target hyperlinks.
  - TC-SEO-14: Follows HTTP 301/302 redirects up to 5 hops and records target status.
  - TC-SEO-15: Enforces the 25-link scanning threshold for bounded execution time.
- **Feature 4: Score Engine & Summary Invariants (5+ tests)**
  - TC-SEO-16: Scores range between 0 and 100 with appropriate letter grades (A+ to F).
  - TC-SEO-17: Invariant check: `passed + warnings + errors === total` checks count.
  - TC-SEO-18: Checks items contain valid severity levels (`success`, `warning`, `error`).
  - TC-SEO-19: Each failing check contains actionable `howToFix` remediation instructions.
  - TC-SEO-20: Score calculation applies correct category weights (On-Page, Technical, Links).
- **Feature 5: Rate Limiting & Freemium Access (5+ tests)**
  - TC-SEO-21: Initial state permits free analysis with used count incrementing.
  - TC-SEO-22: Exactly 3 analyses allowed per IP per calendar day in free tier.
  - TC-SEO-23: Fourth request returns HTTP 429 with `RATE_LIMIT` error code and dailyUsage data.
  - TC-SEO-24: `x-seoradar-plan: pro` header bypasses daily quota limit.
  - TC-SEO-25: `GET /api/usage` accurately returns current client quota statistics.
- **Feature 6: PDF Report Generation (5+ tests)**
  - TC-SEO-26: Free plan attaches watermark notice on generated PDF.
  - TC-SEO-27: Pro plan generates clean, white-label PDF document.
  - TC-SEO-28: PDF includes score ring, date, analyzed URL, and check summary counts.
  - TC-SEO-29: PDF text properly transliterates or embeds Turkish special characters.
  - TC-SEO-30: Download trigger initiates client-side file save with filename `seoradar-<domain>.pdf`.
- **Feature 7: Agency Contact Modal & Lead Generation (5+ tests)**
  - TC-SEO-31: Modal triggers from header "Ajans Teklifi Al" button.
  - TC-SEO-32: Validates required inputs (Name, Phone number, Website URL).
  - TC-SEO-33: Formats WhatsApp deep link with sanitized phone and URL encoded proposal body.
  - TC-SEO-34: Modal closes cleanly on backdrop click or ESC keypress.
  - TC-SEO-35: Form state persists entered URL from prior analysis without retyping.

#### KonvertLab (Port 3001)
- **Feature 1: TXT to PDF Conversion (5+ tests)**
  - TC-KL-01: Raw text input in textarea generates valid PDF ArrayBuffer.
  - TC-KL-02: File drop of `.txt` file loads content into processing buffer.
  - TC-KL-03: Font size options (10pt, 12pt, 14pt, 16pt) adjust rendering output.
  - TC-KL-04: Turkish characters (ç, ğ, ı, ö, ş, ü, Ç, Ğ, İ, Ö, Ş, Ü) render legibly.
  - TC-KL-05: Page number footer toggles on and off based on checkbox state.
- **Feature 2: PDF to TXT Extraction (5+ tests)**
  - TC-KL-06: PDF file drop initializes `pdfjs-dist` worker without main thread freeze.
  - TC-KL-07: Text extracted page by page with `--- Sayfa N ---` boundary markers.
  - TC-KL-08: Extracted text populates editable live textarea.
  - TC-KL-09: One-click "Metni İndir (.txt)" triggers browser download of parsed text.
  - TC-KL-10: Word count and character count statistics update accurately.
- **Feature 3: YouTube SRT & Transcript Tools (5+ tests)**
  - TC-KL-11: Strips SRT numeric sequence indexes and timecodes (`00:00:01,000 --> 00:00:04,000`).
  - TC-KL-12: Strips WebVTT header blocks and inline formatting tags (`<i>`, `<b>`, ASS tags).
  - TC-KL-13: Deduplicates repetitive speech recognition cues and overlapping subtitles.
  - TC-KL-14: Formats continuous transcript into readable 3-sentence paragraphs.
  - TC-KL-15: Generates summary bullet points from leading sentences of each paragraph.
- **Feature 4: Batch Processing (5+ tests)**
  - TC-KL-16: `planBatch` accepts up to 50 files into pending processing queue.
  - TC-KL-17: Each queue entry receives a unique ID, filename, and byte size.
  - TC-KL-18: Sequential execution transitions items through `pending -> running -> done`.
  - TC-KL-19: `batchProgress` accurately computes completed percentage.
  - TC-KL-20: Individual files can be removed from queue before or after batch execution.
- **Feature 5: Client-Side Security & Zero-Server Leak (5+ tests)**
  - TC-KL-21: Network inspection verifies zero outgoing POST/PUT requests during document conversion.
  - TC-KL-22: FileReader memory is released after conversion completes.
  - TC-KL-23: App operates completely while offline (airplane mode / disconnected network).
  - TC-KL-24: Pricing modal opens cleanly when user selects Pro batch features.
  - TC-KL-25: AdSense placeholders render in designated sidebar and banner slots without layout shifts.

#### Terneon (Port 3002 / 3003)
- **Feature 1: Interactive Price Calculator (5+ tests)**
  - TC-TN-01: Selecting "Kurumsal Web Sitesi" initializes base price at 12.000 TL.
  - TC-TN-02: Selecting "E-Ticaret Paketi" switches base price to 20.000 TL.
  - TC-TN-03: Selecting "Özel Web Uygulaması" switches base price to 30.000 TL.
  - TC-TN-04: Checking add-ons (Admin Panel +3.000, SEO +3.000) adds exact amounts.
  - TC-TN-05: Toggling between Monthly and Yearly maintenance updates recurring rate.
- **Feature 2: Sticky Cart & Summary Drawer (5+ tests)**
  - TC-TN-06: Cart remains sticky in viewport during page scroll.
  - TC-TN-07: Itemized breakdown lists every chosen service and add-on by name.
  - TC-TN-08: Total price updates immediately upon each checkbox toggle.
  - TC-TN-09: Unchecking an add-on removes it from cart with exit animation.
  - TC-TN-10: Mobile viewport collapses cart into bottom summary sheet.
- **Feature 3: WhatsApp Proposal Generator (5+ tests)**
  - TC-TN-11: Generates valid `https://wa.me/` URI with international format `905550000000`.
  - TC-TN-12: Proposal message body contains itemized list of selected services and addons.
  - TC-TN-13: Includes final calculated total in Turkish Lira format (e.g. `18.000 TL`).
  - TC-TN-14: Message is properly sanitized and URL-encoded.
  - TC-TN-15: Link opens with `target="_blank"` and `rel="noopener noreferrer"`.
- **Feature 4: Portfolio Showcase & Device Simulator (5+ tests)**
  - TC-TN-16: Category filter buttons correctly filter demo cards (e.g. "Sağlık & Klinik").
  - TC-TN-17: Clicking "Tümü" restores the complete list of demo cards.
  - TC-TN-18: Clicking demo card opens full-screen interactive preview modal.
  - TC-TN-19: Device simulator toggle switches iframe container between Desktop and Mobile dimensions.
  - TC-TN-20: Modal closes on close button click, backdrop click, or Escape key.
- **Feature 5: Centralized Configuration System (5+ tests)**
  - TC-TN-21: `config/siteConfig.ts` exports strictly-typed `siteConfig` object.
  - TC-TN-22: Modifying brand name in `siteConfig` updates header, hero, and footer.
  - TC-TN-23: Modifying pricing in `siteConfig` updates calculator and WhatsApp message simultaneously.
  - TC-TN-24: Trust badges and stat counters load directly from config.
  - TC-TN-25: Social and contact email/phone links map to config variables.

#### Parselya (Port 3003 / 3004)
- **Feature 1: TKGM Kadastro Query Engine (5+ tests)**
  - TC-PAR-01: Submitting İl, İlçe, Mahalle, Ada, Parsel triggers `/api/parsel`.
  - TC-PAR-02: Endpoint resolves district center coordinates from built-in coordinate dictionary.
  - TC-PAR-03: Generates deterministic geodetic polygon based on parcel seed when offline.
  - TC-PAR-04: Response conforms to `{ success: true, parcel: { center, polygon, areaM2 } }`.
  - TC-PAR-05: Missing required fields in UI shows Turkish validation error.
- **Feature 2: Satellite Map & Tile Integration (5+ tests)**
  - TC-PAR-06: `lngLatToTile` maps coordinate to correct Web Mercator tile index `(x, y, z)`.
  - TC-PAR-07: `tileToLngLat` returns correct bounding box for tile coordinate.
  - TC-PAR-08: `tileCache` loads and caches Google Maps Satellite tile images.
  - TC-PAR-09: Switching tile source to Esri World Imagery requests ArcGIS tile endpoints.
  - TC-PAR-10: Canvas renders a 5x5 tile grid covering the parcel bounds under camera transform.
- **Feature 3: Custom Aerial / Drone Photo Upload (5+ tests)**
  - TC-PAR-11: Dropping image file triggers `FileReader` to load data URL.
  - TC-PAR-12: Background source switches to `custom` mode upon image load.
  - TC-PAR-13: Brightness and contrast sliders adjust canvas filter properties.
  - TC-PAR-14: Aspect ratio of uploaded drone image is preserved without distortion.
  - TC-PAR-15: Clearing custom image restores satellite tile grid seamlessly.
- **Feature 4: Canvas Animation & Camera Engine (5+ tests)**
  - TC-PAR-16: `renderAt(time)` produces identical pixels for identical timestamp `t` (deterministic).
  - TC-PAR-17: Zoom-in motion smoothly interpolates camera scale from wide to parcel level.
  - TC-PAR-18: Orbit motion rotates scene 360 degrees around parcel centroid.
  - TC-PAR-19: Boundary line draws neon glow effect with user-selected theme color.
  - TC-PAR-20: POI distance markers ("Denize Mesafe", "Yola Cephe") project to screen coordinates.
- **Feature 5: Video Export & Credit Lifecycle (5+ tests)**
  - TC-PAR-21: Switching between 9:16 (Reels/TikTok) and 16:9 (YouTube) resizes canvas aspect ratio.
  - TC-PAR-22: "Videoyu Dışa Aktar" captures canvas stream via `MediaRecorder`.
  - TC-PAR-23: Export progress bar tracks recording progression from 0% to 100%.
  - TC-PAR-24: Exported WebM/MP4 blob triggers browser download.
  - TC-PAR-25: Successful export decrements user credit balance in state.

---

### 6.2 Tier 2: Boundary & Corner Cases (>=5 tests per feature)

#### SeoRadar
- BC-SEO-01: **SSRF Exploitation Attempts:** Tests `http://169.254.169.254/latest/meta-data`, `http://127.0.0.1:3000`, `http://[::1]`, and private IPs `10.0.0.1`, `192.168.1.1`. Must all be rejected with `INVALID_URL` (400) or `BLOCKED_TARGET`.
- BC-SEO-02: **Massive HTML Payloads:** Tests URLs returning HTML > 5MB. Must enforce `MAX_HTML_BYTES` and truncate gracefully without memory exhaustion.
- BC-SEO-03: **Malformed HTML Structure:** Unclosed tags, deeply nested divs (> 100 levels), missing `<body>` or `<head>`, invalid character encodings (Windows-1254, ISO-8859-9).
- BC-SEO-04: **Infinite Redirect Loops:** Tests URLs with circular 302 redirects (`A -> B -> A`). Must abort at hop 5 with clear error message.
- BC-SEO-05: **Slow / Non-Responsive Targets:** Simulates a target server that hangs indefinitely. Fetch timeout (12,000ms) must abort cleanly and return 502 `FETCH_FAILED`.

#### KonvertLab
- BC-KL-01: **Corrupted / Truncated PDF:** Uploading arbitrary binary data disguised as `.pdf`. Must reject gracefully with user-friendly error without crashing worker.
- BC-KL-02: **Zero-Byte File Upload:** Dropping an empty 0-byte `.txt` or `.pdf` file. Must notify user that file contains no content.
- BC-KL-03: **Queue Overflow:** Dropping 65 files into Batch Convert (limit is 50). First 50 files must be accepted; surplus 15 files must be rejected with notification.
- BC-KL-04: **Malformed Subtitle Timestamps:** SRT file with disordered timestamps, negative intervals, missing sequence IDs, or mixed CRLF/LF line endings.
- BC-KL-05: **Extreme Font & Margin Settings:** Font size set to 2pt or 72pt, margin set to 0mm or 100mm. PDF layout engine must prevent text overflow or fatal clipping.

#### Terneon
- BC-TN-01: **Zero Add-on Selection:** User selects base service and unchecks all add-ons. Price calculator must output valid base total without NaN errors.
- BC-TN-02: **Special Character Injection in Proposal:** Custom requirements input containing XML/HTML tags (`<script>alert(1)</script>`), Turkish quotes, or emojis. Must encode safely for WhatsApp link.
- BC-TN-03: **Extreme Viewport Dimensions:** Responsive testing at 320px width (iPhone SE) and 3840px (4K monitor). Navigation, calculator, and showcase cards must not break layout.
- BC-TN-04: **Rapid Simulator Toggling:** Clicking Desktop/Mobile buttons 50 times in rapid succession. Modal container and iframe must not leak listeners or flicker.
- BC-TN-05: **Corrupt siteConfig Values:** Providing negative price or empty string in service array. Safe fallbacks must display gracefully.

#### Parselya
- BC-PAR-01: **Degenerate Parcel Geometry:** Polygon with only 2 vertices, collinear points, or self-intersecting hourglass shapes. Projection math must handle without throwing zero-division errors.
- BC-PAR-02: **Extreme Lat/Lng Coordinates:** Coordinates at International Date Line (180° / -180°), North Pole (90° N), or Null Island (0°, 0°). Tile math must clamp safely within `[-85.05, 85.05]` latitude.
- BC-PAR-03: **Negative / Out-of-Bounds Timeline:** Calling `renderAt(-5)` or `renderAt(999)`. Scrubber math must clamp to valid duration range `[0, duration]`.
- BC-PAR-04: **Browser Unsupported MediaRecorder:** Simulating browser environments where `window.MediaRecorder` is undefined. Export button must disable and display compatibility warning.
- BC-PAR-05: **Massive Drone Photo Upload:** Dropping a 48-megapixel image (8000x6000). Canvas downsampler must maintain responsive UI without tab crash.

---

### 6.3 Tier 3: Cross-Feature Combinations

- **CF-01 (SeoRadar Broken Link + Scoring + PDF):**
  - Scenario: Analyze a webpage with 10 broken links and 5 missing image ALT tags.
  - Interaction: Score engine applies specific penalty weights; CheckAccordion highlights issues under "Kritik Hatalar"; Exporting PDF includes the exact failing URLs and image paths in the generated document.
- **CF-02 (SeoRadar Quota Depletion -> In-Session Upgrade):**
  - Scenario: Free user consumes 3 analyses; 4th attempt returns 429 and triggers `PricingModal`.
  - Interaction: User toggles to Pro in session; modal closes; retry analysis immediately succeeds without requiring full page reload.
- **CF-03 (KonvertLab SRT -> Live Editor -> E-Book PDF):**
  - Scenario: User drops messy YouTube SRT file into YouTube Tools tab.
  - Interaction: SRT parser strips timestamps; user edits summary paragraph in live editor; clicks "PDF E-Kitap Olarak İndir"; PDF generates formatted title, table of contents, and clean paragraphs.
- **CF-04 (KonvertLab Batch Queue Mixed Formats):**
  - Scenario: User drops 10 `.txt` files and 5 `.md` files together.
  - Interaction: Queue accepts all 15; processes text and markdown sequentially; updates progress bar from 0% to 100%; downloads converted PDFs.
- **CF-05 (Terneon Config -> Showcase -> Calculator -> WhatsApp):**
  - Scenario: Admin modifies service base price in `siteConfig.ts`.
  - Interaction: Hero pricing badge updates; Calculator step 1 reflects new price; selecting add-ons updates sticky cart; WhatsApp click launches pre-filled message with the updated price.
- **CF-06 (Parselya TKGM Query -> Esri HD -> Custom POI -> Video Export):**
  - Scenario: User enters "Muğla / Bodrum / Mumcular / Ada 1425 / Parsel 7".
  - Interaction: `/api/parsel` returns geometry; user switches background from Google Satellite to Esri Satellite; user adds custom POI "Havalimanı: 15 km"; user triggers 15-second 9:16 video export; MediaRecorder records all layers into single MP4 file.

---

### 6.4 Tier 4: Real-World Workloads & Scenarios

- **RW-01: Commercial Real Estate Video Generation Workflow (Parselya)**
  - Persona: Real estate broker creating social media video for an Instagram Reel.
  - Workflow:
    1. Broker opens Parselya (`http://localhost:3004`).
    2. Inputs real parcel details: İl: Antalya, İlçe: Kaş, Mahalle: Kalkan, Ada: 102, Parsel: 4.
    3. Clicks "Parseli Haritada Bul ve Çiz". Kadastro API resolves coordinates and renders boundary on satellite view.
    4. Customizes styling: selects "Neon Altın" boundary stroke, adjusts opacity slider to 30%, adds POI "Denize 300 m".
    5. Chooses "Orbit (360° Dönüş)" camera motion.
    6. Selects "9:16 Reels" vertical format.
    7. Previews playback on canvas timeline (0 to 15 seconds).
    8. Clicks "Videoyu Dışa Aktar (MP4)".
    9. System renders frames, records stream, exports `parselya-ada102-parsel4.mp4`, and decrements user credit balance.
  - Success Metric: Video file downloads, duration is exactly 15s, dimensions 608x1080 (or 1080x1920), 0 dropped frames.

- **RW-02: Digital Marketing SEO Client Audit (SeoRadar)**
  - Persona: Freelance SEO consultant running an initial website audit for a prospective client.
  - Workflow:
    1. Consultant navigates to SeoRadar (`http://localhost:3002`).
    2. Submits client URL (`https://example.com`).
    3. Server processes HTML, parses DOM, performs broken link check.
    4. Results screen displays circular score (e.g. 74/100, Grade B).
    5. Consultant filters by "Kritik Hatalar" (errors), reviews H1 hierarchy and missing Open Graph tags.
    6. Enters competitor URL in "Rakip Karşılaştır" tab to run side-by-side comparison.
    7. Clicks "Raporu PDF Olarak İndir (Pro)".
    8. High-resolution branded audit report downloads ready for client presentation.
  - Success Metric: Complete audit generated in < 15s, PDF downloaded, invariant checks pass.

- **RW-03: Video Creator Course Notes Conversion (KonvertLab)**
  - Persona: Online educator converting 10 video transcripts into course handouts.
  - Workflow:
    1. Educator opens KonvertLab (`http://localhost:3001`).
    2. Navigates to "YouTube İçerik Araçları" tab.
    3. Pastes raw SRT transcript containing 400 subtitle blocks.
    4. Clicks "Altyazıyı Temizle & Paragrafla".
    5. Clean, structured Turkish text is produced with timestamps stripped.
    6. Switches to "Toplu Dönüşüm (Batch Pro)" and drops remaining 9 transcript files.
    7. Batch engine processes files sequentially without browser memory crash.
    8. Downloads all formatted PDFs.
  - Success Metric: Zero server network requests, zero memory leak, 10 formatted PDFs produced.

- **RW-04: Business Owner Agency Consultation (Terneon)**
  - Persona: Dental clinic owner looking to commission a new website.
  - Workflow:
    1. Clinic owner lands on Terneon (`http://localhost:3003`).
    2. Browses portfolio showcase, clicks "Sağlık & Klinik" filter.
    3. Opens "Estetik Diş Kliniği" demo card; tests interactive mobile simulator.
    4. Scrolls to "Fiyat Hesapla" interactive component.
    5. Selects "Kurumsal Web Sitesi" (12.000 TL).
    6. Checks "Yönetim Paneli" (+3.000 TL), "İleri Düzey SEO" (+3.000 TL), "Yapay Zeka Asistanı" (+4.000 TL).
    7. Selects "Yıllık Bakım Aboneliği".
    8. Observes sticky cart displaying 22.000 TL + Yıllık Bakım.
    9. Clicks "WhatsApp ile Teklif Al".
    10. WhatsApp opens with complete pre-structured Turkish proposal message ready to send.
  - Success Metric: Cart calculation accurate to the penny; WhatsApp message contains all selected add-ons.

---

## 7. Mock APIs, Test Stubs & Environment Variables

### 7.1 Mocking Strategy for External Dependencies

1. **TKGM Megsis Kadastro API Mock:**
   - *Target URL:* `https://cbsapi.tkgm.gov.tr/megsis/api/parsel/{mahalle}/{ada}/{parsel}`
   - *Behavior:* External government API has rate-limiting, CORS, and occasional regional downtime.
   - *Implementation:* `parselya/app/api/parsel/route.ts` already has a 2500ms timeout with built-in geodetic polygon fallback. For deterministic E2E testing, provide an HTTP mock fixture intercepting the route to return static Turkish cadastral polygons (e.g. Bodrum Mumcular polygon fixture).

2. **SEO Crawling Target Mock:**
   - *Target URL:* External websites requested in SeoRadar.
   - *Behavior:* Real websites change frequently and may be slow or block automated scraping.
   - *Implementation:* Create a local test fixture server (or Next.js test page at `http://127.0.0.1:3002/test-fixtures/sample-page.html`) containing:
     - Exactly 1 `<title>` (45 chars)
     - 1 `<meta name="description">` (110 chars)
     - 1 `<h1>`, 2 `<h2>`, 4 `<h3>`
     - 5 images (2 with `alt`, 3 without)
     - 10 internal links, 2 broken links (returning 404), 1 redirect link (302)
     - Valid JSON-LD schema script
     - `robots.txt` and `sitemap.xml` endpoints.

3. **Map Tile Mock Server:**
   - *Target URL:* Google Maps Satellite (`mtX.google.com`), Esri World Imagery.
   - *Behavior:* Heavy network image fetching during canvas testing.
   - *Implementation:* Provide 1x1 or 256x256 solid/textured PNG mock tiles in `/public/test-tiles/` or data URIs to guarantee offline, deterministic canvas snapshots without external network access.

### 7.2 System Environment Variables Specification

```env
# Cross-Project Server Settings
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=4096"

# Port Assignments (Target Harmonized Set)
PORT_KONVERTLAB=3001
PORT_SEORADAR=3002
PORT_TERNEON=3003
PORT_PARSELYA=3004

# SeoRadar Configuration
SEORADAR_FETCH_TIMEOUT_MS=12000
SEORADAR_MAX_LINKS_TO_CHECK=25
SEORADAR_FREE_DAILY_LIMIT=3

# Parselya Configuration
TKGM_API_TIMEOUT_MS=2500
TILE_CACHE_MAX_ENTRIES=500
```

---

## 8. Concrete Implementation Plan for E2E Testing Track

To turn this survey into executable testing code without disrupting existing developer workflows, the implementation should proceed in four phases:

### Phase 1: Port Harmonization (Configuration B)
- Update package.json scripts, docker-compose, and QA contract constants to align on ports `3001, 3002, 3003, 3004`.
- Run `npm run verify:fast` to confirm 100% green status.

### Phase 2: Tier 1 & Tier 2 Integration Test Expansion
- Add comprehensive test suites under each project's `tests/` directory:
  - `seoradar/tests/api-analyze-extended.test.mjs` (Covering TC-SEO-01 through TC-SEO-35 and BC-SEO-01 through BC-SEO-05)
  - `konvertlab/tests/converter-extended.test.mjs` (Covering TC-KL-01 through TC-KL-25 and BC-KL-01 through BC-KL-05)
  - `terneon/tests/calculator-extended.test.mjs` (Covering TC-TN-01 through TC-TN-25 and BC-TN-01 through BC-TN-05)
  - `parselya/tests/cadastre-extended.test.mjs` (Covering TC-PAR-01 through TC-PAR-25 and BC-PAR-01 through BC-PAR-05)
- Leverage existing `tests/harness.mjs` and Node 24 native execution (instant feedback, zero dependencies).

### Phase 3: Tier 3 Cross-Feature & Test Fixtures Setup
- Implement local mock fixtures (`qa/fixtures/sample-seo-site/` and `qa/fixtures/cadastre-samples/`).
- Create `qa/e2e-cross-feature.mjs` executing combination scenarios CF-01 through CF-06.

### Phase 4: Tier 4 Automated Workload & Verification Runner
- Create `qa/e2e-workloads.mjs` to execute simulated multi-step journeys RW-01 through RW-04 against running localhost servers.
- Wire into root `package.json` as `npm run test:e2e`.

---

## 9. Conclusion

The `c:\Users\HUAWEI\Desktop\saas` codebase exhibits high software engineering hygiene: strict modular isolation, zero cross-project pollution, robust SSRF protection, deterministic canvas math, and fast contract verification. With the port mapping harmonized and the 4-tier testing matrix implemented as designed above, the monorepo will possess complete, production-grade quality assurance.
