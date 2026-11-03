## 2026-11-02T14:39:02Z
Your Identity:
- Archetype: teamwork_worker
- Role: Implementation Worker
- Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_worker_m0\
- Parent: Project Orchestrator (Conversation ID: 89b1683a-3a87-4b48-9463-fad6372fd211)

MANDATORY INPUTS (You MUST read these before starting work):
- ORIGINAL_REQUEST.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
- PROJECT.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md
- Survey Reports:
  - `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_explorer_survey_3\analysis.md` (Section 3.2 lists the exact files and lines for port migration)
  - `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_explorer_survey_3\handoff.md`

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive Write Ownership for this Milestone:
- `seoradar/package.json`
- `terneon/package.json`
- `parselya/package.json`
- `docker-compose.yml`
- `scripts/dev-all.mjs`
- `scripts/status.mjs`
- `scripts/smoke-pages.mjs`
- `qa/run-all.mjs`
- `qa/health-all.mjs`
- Any related helper scripts under `scripts/` or `qa/` referencing ports 3000-3003.

Milestone Scope & Requirements:
Execute Milestone 0 (Synchronized Port & QA Contract Migration):
1. Migrate ports across the monorepo configuration:
   - `konvertlab`: Port 3001 (remains 3001)
   - `seoradar`: Port 3002 (change from 3000 to 3002)
   - `terneon`: Port 3003 (change from 3002 to 3003)
   - `parselya`: Port 3004 (change from 3003 to 3004)
2. Update all references in:
   - `seoradar/package.json` (`"dev": "next dev -p 3002"`, `"start": "next start -p 3002"`)
   - `terneon/package.json` (`"dev": "next dev -p 3003"`, `"start": "next start -p 3003"`)
   - `parselya/package.json` (`"dev": "next dev -p 3004"`, `"start": "next start -p 3004"`)
   - `docker-compose.yml` (ports and PORT env variables for all 4 services)
   - `scripts/dev-all.mjs`, `scripts/status.mjs`, `scripts/smoke-pages.mjs`
   - `qa/run-all.mjs` (L37, L65, L94, L118 and any assertions)
   - `qa/health-all.mjs` (L23-28)
3. Run verification commands:
   - `node scripts/status.mjs --json`
   - `node qa/run-all.mjs`
   - `npm test`
   - `npm run verify:fast`
4. Confirm 100% of checks pass with exit code 0.
5. Write your handoff report to `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_worker_m0\handoff.md`.
6. Send a message to parent with the summary and verification results.
