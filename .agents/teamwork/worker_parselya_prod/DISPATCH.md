## 2026-11-03T08:11:12Z
You are worker_parselya_prod, a dedicated specialist worker for Parselya (Port 3004).
Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_parselya_prod\
Parent conversation ID: 27cfe0c4-d6f1-4646-9727-d2768ec895fa

EXCLUSIVE WRITE OWNERSHIP:
You have exclusive write ownership of `c:\Users\HUAWEI\Desktop\saas\parselya\**` and your metadata in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_parselya_prod\`.
DO NOT modify any files outside `parselya/`.

INPUTS TO READ FIRST:
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md (MANDATORY)
- C:\Users\HUAWEI\.gemini\antigravity\brain\6815d714-faf7-4642-bf32-a87b8c77c112\production_perfection_plan.md
- c:\Users\HUAWEI\Desktop\saas\d_rt_proje_i_in_kapsaml_prd_ve_prompt_dok_man.md
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASKS & ACCEPTANCE CRITERIA FOR PARSELYA (Port 3004):
1. Live TKGM Megsis CBS API Integration (`parselya/app/api/parsel/route.ts`):
   - Reference: `https://github.com/okansafak/qgistkgmplugin` pattern.
   - TKGM CBS operates via idariYapi hierarchy:
     `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/idariYapi/ilListe`
     `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/idariYapi/ilceListe/{ilId}`
     `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/idariYapi/mahalleListe/{ilceId}`
     `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{mahalleId}/{ada}/{parsel}`
     and `/parsel/{lat}/{lng}/`
   - Implement normalized, Turkish-character resilient caching (`idariYapiCache`) for administrative unit IDs.
   - Call live TKGM API to resolve official cadastral polygon, area (m²), nitelik, and coordinates (e.g. Bodrum Çamlık 131/36 returns ~32.092,93 m² Zeytinli Tarla).
   - Retain robust geodetic mathematical parcel generator as an automatic fallback if TKGM API is unreachable or rate-limited.
2. Verified Demo Parcels in UI (`parselya/components/TabParcelQuery.tsx` / `parselya/components/ParcelCanvas.tsx`):
   - Add single-click sample parcel buttons (e.g., Bodrum Çamlık 131/36, Çeşme Alaçatı, Antalya Manavgat). Clicking one immediately loads the real parcel boundaries and metadata.
3. Satellite Layer Alignment (`ParcelCanvas.tsx` & `tileProvider.ts`):
   - Center Web Mercator tile coordinates on parcel centroid with smooth zoom and align Google / Esri satellite tiles perfectly with the cadastral polygon.
4. Single-Click Video Recording & Download:
   - MediaRecorder captures canvas animation and triggers automatic browser download of `.webm` or `.mp4`.
5. Testing & Verification:
   - Run unit tests (`npm test`) and build (`npm run build`) in `parselya/`.
   - Ensure 0 errors and all tests pass.

DELIVERABLES:
- Write `progress.md` with timestamps and task steps in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_parselya_prod\`.
- Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, Verification Method & Results in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_parselya_prod\`.
- Send a completion message back to parent via `send_message` with Recipient="27cfe0c4-d6f1-4646-9727-d2768ec895fa".


## 2026-11-03T08:19:38Z
**Context**: Parselya UI & Feature Benchmark Update from User
**Content**: CRITICAL BENCHMARK UPDATE — The user requires Parselya (Port 3004) to match `https://parselsorgu.pro/`:
1. Left Sidebar:
   - Search inputs: City / District / Neighborhood autocomplete/search + Ada / Parsel inputs + "Sorgula" button.
   - Prominent Header: e.g. `174 / 1`, `Arsa · 2.443 m²`, `Akçatarla, Nusaybin, Mardin` (dynamically filled from query).
   - Purpose Pills ("Bu parsele neden bakıyorsunuz?"): `Emlakçıyım`, `Benim`, `Almak istiyorum` (interactive toggleable state).
   - Tags: `Akarsu`, `Çevre Düzeni Planı`, `e-Plan`, `Plan Analizi [yeni]`.
   - Tabs: `Özet`, `Plan`.
   - Attribute Table: Nitelik (Arsa / Tarla vb.), Mevkii, Pafta, Alan (m²).
   - Toggle switch: "HARİTADA GÖSTER: Kenar uzunlukları (Her kenarın uzunluğu haritaya yazılır)".
   - Action Buttons: `Piyasa`, `Uçuş (Animasyonlu Video Uçuşu)`, `Paylaş`, `PDF`.
2. Right Map / Canvas Area:
   - Fullscreen HD satellite map (Google/Esri tiles).
   - Centered parcel polygon with blue/neon border + floating center badge showing `174/1 · 2.443 m² Arsa`.
   - Edge length labels rendered along polygon boundary when the "Kenar uzunlukları" toggle is ON.
   - Map overlay controls: Layer switch (Uydu / Hibrit / Harita), zoom (+ / -), compass.
   - "Uçuş" button triggers the smooth camera zoom-in/orbit animation with the MediaRecorder video export option.
**Action**: Implement these exact UI components and features into `parselya/components/` and `parselya/app/`, verify tests and build (`npm test`, `npm run build`), and include in your handoff report.


## 2026-11-03T08:28:43Z
**Context**: Parselya Status Check
**Content**: Checking in on Parselya (Port 3004) progress. The other 3 projects (KonvertLab, SeoRadar, Terneon) have completed their builds and verified test suites. Are your unit tests and production build (`npm test`, `npm run build`) running or ready?
**Action**: Please update progress.md and deliver your handoff.md report once testing concludes.
