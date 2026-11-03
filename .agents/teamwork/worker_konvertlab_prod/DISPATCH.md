## 2026-11-03T08:11:42Z
You are worker_konvertlab_prod, a dedicated specialist worker for KonvertLab (Port 3001).
Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_konvertlab_prod\
Parent conversation ID: 27cfe0c4-d6f1-4646-9727-d2768ec895fa

EXCLUSIVE WRITE OWNERSHIP:
You have exclusive write ownership of `c:\Users\HUAWEI\Desktop\saas\konvertlab\**` and your metadata in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_konvertlab_prod\`.
DO NOT modify any files outside `konvertlab/`.

STRICT ARCHITECTURAL CONSTRAINT:
KonvertLab is 100% client-side. NO server API routes are allowed under `konvertlab/app/api/` (enforced by QA contracts).

INPUTS TO READ FIRST:
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md (MANDATORY)
- C:\Users\HUAWEI\.gemini\antigravity\brain\6815d714-faf7-4642-bf32-a87b8c77c112\production_perfection_plan.md
- c:\Users\HUAWEI\Desktop\saas\d_rt_proje_i_in_kapsaml_prd_ve_prompt_dok_man.md
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASKS & ACCEPTANCE CRITERIA FOR KONVERTLAB (Port 3001):
1. "Try with Sample File" (Örnek Dosya ile Dene) Buttons:
   - For PDF -> Word, PDF -> Excel, Image -> WebP, and OCR tabs, add a dedicated 1-click sample button that loads an in-memory sample document/image directly into the conversion pipeline, allowing immediate testing without user file browsing.
2. Visual Savings & Quality Preview for WebP:
   - In the WebP converter, show original size vs WebP size, percentage saved (e.g. "-70%"), dimensions, and interactive quality preview.
3. OCR Turkish Language Support & Instant Actions:
   - Client-side Tesseract.js with Turkish language support, live OCR progress percentage, 1-click clipboard copy, and TXT/PDF download of recognized text.
4. Batch Pro Drag-and-Drop & ZIP Download:
   - Enhance the Batch Pro multi-file queue with animated processing status badges and a prominent 1-click JSZip archive download button.
5. Testing & Verification:
   - Run unit tests (`npm test`) and build (`npm run build`) in `konvertlab/`.
   - Ensure 0 errors and all tests pass.

DELIVERABLES:
- Write `progress.md` with timestamps and task steps in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_konvertlab_prod\`.
- Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, Verification Method & Results in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_konvertlab_prod\`.
- Send a completion message back to parent via `send_message` with Recipient="27cfe0c4-d6f1-4646-9727-d2768ec895fa".


## 2026-11-03T08:19:51Z
**Context**: KonvertLab UI & Feature Benchmark Update from User
**Content**: CRITICAL BENCHMARK UPDATE — The user requires KonvertLab (Port 3001) to benchmark `https://github.com/orkunisitmak/nashi-app`:
1. Architecture & UX:
   - Ultra-fast, clean, drag-and-drop centered conversion hub.
   - Distinct, intuitive cards/tabs for: PDF -> Word, PDF -> Excel, Image -> WebP, OCR Metin Çıkarıcı (Turkish), and Quick QR Code tool.
   - Built-in "Örnek Dosya ile Dene" (Try with sample file) button on every tool for instant demonstration without searching files.
   - Batch Pro drag-and-drop zone with animated conversion status and 1-click JSZip archive download.
   - Client-side only (0 server API routes).
**Action**: Incorporate these clean UX patterns and QR code utility into `konvertlab/components/` and `konvertlab/app/`, verify unit tests and build (`npm test`, `npm run build`), and include in your handoff report.
