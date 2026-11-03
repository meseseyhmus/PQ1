## 2026-11-03T08:11:28Z
You are worker_seoradar_prod, a dedicated specialist worker for SeoRadar (Port 3002).
Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_seoradar_prod\
Parent conversation ID: 27cfe0c4-d6f1-4646-9727-d2768ec895fa

EXCLUSIVE WRITE OWNERSHIP:
You have exclusive write ownership of `c:\Users\HUAWEI\Desktop\saas\seoradar\**` and your metadata in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_seoradar_prod\`.
DO NOT modify any files outside `seoradar/`.

INPUTS TO READ FIRST:
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md (MANDATORY)
- C:\Users\HUAWEI\.gemini\antigravity\brain\6815d714-faf7-4642-bf32-a87b8c77c112\production_perfection_plan.md
- c:\Users\HUAWEI\Desktop\saas\d_rt_proje_i_in_kapsaml_prd_ve_prompt_dok_man.md
- c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASKS & ACCEPTANCE CRITERIA FOR SEORADAR (Port 3002):
1. Quick Demo Site Buttons (`seoradar/app/page.tsx`):
   - Under the URL input, add quick sample test buttons (e.g. `trendyol.com`, `hepsiburada.com`, `github.com`).
   - Clicking one automatically fills the input and triggers the comprehensive SEO audit without requiring manual URL entry.
2. Core Web Vitals Visual Scorecards:
   - Modern Google PageSpeed style color-coded scorecards/gauges for LCP, CLS, FID/INP with status indicators (Good, Needs Improvement, Poor), metric units (ms, score), and actionable advice.
3. Security Headers 1-Click Copy Snippet:
   - In the security audit section, provide a 1-click copy panel for missing HTTP headers with ready configuration code for Nginx, Next.js (`next.config.js`), and Apache.
4. Corporate PDF Report Export:
   - Enhance the jsPDF report generation to ensure Turkish character support, proper page breaks, and comprehensive inclusion of CWV, security headers, competitor matrix, and agency proposal info.
5. Agency Contact & WhatsApp Proposal Flow:
   - Ensure the `AgencyContactModal` seamlessly pre-fills an agency SEO proposal and opens WhatsApp with a professional formatted message.
6. Testing & Verification:
   - Run unit tests (`npm test`) and build (`npm run build`) in `seoradar/`.
   - Ensure 0 errors and all tests pass.

DELIVERABLES:
- Write `progress.md` with timestamps and task steps in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_seoradar_prod\`.
- Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, Verification Method & Results in `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\worker_seoradar_prod\`.
- Send a completion message back to parent via `send_message` with Recipient="27cfe0c4-d6f1-4646-9727-d2768ec895fa".
