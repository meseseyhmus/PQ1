## 2026-11-02T15:16:18Z
Your Identity:
- Archetype: teamwork_worker
- Role: Implementation Worker - SeoRadar
- Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_worker_seoradar\
- Parent: Project Orchestrator (Conversation ID: 89b1683a-3a87-4b48-9463-fad6372fd211)

MANDATORY INPUTS (You MUST read these before starting work):
- ORIGINAL_REQUEST.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
- PROJECT.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md
- Survey Analysis: `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_explorer_survey_1\analysis.md`

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
- `c:\Users\HUAWEI\Desktop\saas\seoradar\**` (You own all files in seoradar exclusively. Do NOT touch any other project folder.)

Detailed Scope & Tasks for SeoRadar (Port 3002):
1. Implement Core Web Vitals (CWV) in `seoradar/lib/analyze.ts`:
   - Calculate and return metrics:
     - Largest Contentful Paint (LCP): synthesized from TTFB, HTML size, and largest visual image/hero element.
     - Cumulative Layout Shift (CLS): calculated from images lacking explicit width/height attributes and unconstrained layout elements.
     - First Input Delay (FID) / Interaction to Next Paint (INP): estimated from script tag count, bundle weight, and DOM complexity.
   - Return clean score cards (Good / Needs Improvement / Poor) with specific actionable recommendations.
2. Implement HTTP Security Headers Inspection in `seoradar/lib/analyze.ts`:
   - Inspect fetched response headers:
     - `Strict-Transport-Security` (HSTS)
     - `Content-Security-Policy` (CSP)
     - `X-Frame-Options`
     - `X-Content-Type-Options`
     - `Referrer-Policy`
     - `Permissions-Policy`
   - Include security score and detailed status in analysis response.
3. Heading Hierarchy & Link Analysis:
   - Ensure H1 count check (exactly 1 recommended), sequential H1-H6 nesting without skipping levels.
   - Categorize links into internal, external, nofollow, and broken links with status codes.
4. Enhance Competitor Comparison Tab (`seoradar/app/page.tsx`):
   - Upgrade the competitor comparison tab to show side-by-side matrices: Overall SEO score, Core Web Vitals (LCP, CLS, FID), Security Headers score, word count, load time, and technical error count.
5. Upgrade White-Label PDF Export (`seoradar/lib/pdf.ts`):
   - Include Core Web Vitals metrics table.
   - Include HTTP Security Headers audit section.
   - Include Competitor Benchmark comparison summary if competitor data exists.
6. Verify AgencyContactModal & WhatsApp Flow:
   - Ensure modal works seamlessly and generates pre-filled WhatsApp message with audit summary and link.
7. Verification:
   - Run `node seoradar/tests/run-tests.mjs` (ensure all tests pass; add new tests for CWV and security headers).
   - Run `npm run build` in `seoradar/` (ensure Next.js build succeeds with zero errors).
8. Write your handoff report to `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_worker_seoradar\handoff.md`.
9. Send completion message to parent.

## 2026-11-02T15:28:16Z
Heartbeat check from parent: Report progress step on SeoRadar.
