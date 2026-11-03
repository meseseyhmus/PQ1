## 2026-11-03T08:11:55Z
You are worker_terneon_prod, a dedicated specialist worker for Terneon (Port 3003).
Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_terneon_prod\
Parent conversation ID: 27cfe0c4-d6f1-4646-9727-d2768ec895fa

EXCLUSIVE WRITE OWNERSHIP:
You have exclusive write ownership of `c:\Users\HUAWEI\Desktop\saas\terneon\**` and your metadata in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_terneon_prod\`.
DO NOT modify any files outside `terneon/`.

INPUTS TO READ FIRST:
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md (MANDATORY)
- C:\Users\HUAWEI\.gemini\antigravity\brain\6815d714-faf7-4642-bf32-a87b8c77c112\production_perfection_plan.md
- c:\Users\HUAWEI\Desktop\saas\d_rt_proje_i_in_kapsaml_prd_ve_prompt_dok_man.md
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASKS & ACCEPTANCE CRITERIA FOR TERNEON (Port 3003):
1. Interactive Device Simulator:
   - Smooth animation between Desktop (Safari frame) and Mobile (iPhone frame) viewports.
   - 6 rich industry sectors (SaaS Analytics, FinTech / DeFi, E-Commerce, AI Creative Studio, Luxury Real Estate, Cyberpunk Gaming) with reactive interactive buttons inside the simulator preview (e.g. simulated deployment, token swap, cart badge counter, etc.).
2. Live WhatsApp Pricing Terminal:
   - Dynamic package and feature calculator where chosen options dynamically update a retro-futuristic pricing terminal in real-time with a typewriter effect.
   - WhatsApp CTA button formats a clean, URL-encoded Turkish proposal message ready to send with 1 click.
3. Neon Canvas Performance & DPR:
   - Ensure `NeonCanvas.tsx` properly scales with Device Pixel Ratio (DPR) for Retina / 4K monitors without blurriness or performance lag.
4. Testing & Verification:
   - Run unit tests (`npm test`) and build (`npm run build`) in `terneon/`.
   - Ensure 0 errors and all tests pass.

DELIVERABLES:
- Write `progress.md` with timestamps and task steps in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_terneon_prod\`.
- Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, Verification Method & Results in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_terneon_prod\`.
- Send a completion message back to parent via `send_message` with Recipient="27cfe0c4-d6f1-4646-9727-d2768ec895fa".

## 2026-11-03T08:19:45Z
**Context**: Terneon UI & Typography Benchmark Update from User
**Content**: CRITICAL BENCHMARK UPDATE — The user requires Terneon (Port 3003) to match `https://www.eraslansoftware.com/` aesthetic:
1. Editorial Typography & Copy:
   - Tag: "Tasarım ve yazılım stüdyosu, İstanbul"
   - Headline: "İşletmenize özel. Her ayrıntısıyla." (High-end editorial typography).
   - Subheadline: "Web siteleri, mobil uygulamalar ve işinizi kolaylaştıran yazılımlar geliştiriyoruz. İlk fikirden yayına, birlikte."
   - CTA Buttons: `Projeleri incele ↓` (dark pill) & `Fiyat hesapla ↗` (light rounded).
   - Trust badges: `✓ Size özel tasarım   ✓ Önce ücretsiz demo   ✓ Doğrudan iletişim`.
2. Hero Showcase (Right side):
   - Safari/Browser mockup (`... Saklı Cave House ↗` or SaaS mockup) in desktop view.
   - Sleek iPhone mobile mockup overlapping the bottom-right of the desktop browser window.
   - Footer bar showing Project Name, Category, and pagination with arrows (`< 03 / 06 >`).
   - Interactive Sector switching (6 sectors) updates both desktop and overlapping mobile viewports.
3. Pricing & WhatsApp Terminal:
   - "Fiyat hesapla" scrolls/opens the live pricing terminal with typewriter effect and instant WhatsApp inquiry.
**Action**: Implement these exact UI elements, typography, and overlapping Safari + iPhone showcase in `terneon/components/` and `terneon/app/`, verify unit tests and build (`npm test`, `npm run build`), and include in your handoff report.
