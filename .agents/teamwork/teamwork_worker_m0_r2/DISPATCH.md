## 2026-11-02T15:09:08Z
Your Identity:
- Archetype: teamwork_worker
- Role: Implementation Worker
- Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_worker_m0_r2\
- Parent: Project Orchestrator (Conversation ID: 89b1683a-3a87-4b48-9463-fad6372fd211)

MANDATORY INPUTS (You MUST read these before starting work):
- ORIGINAL_REQUEST.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
- PROJECT.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md
- Reviewer 1 Handoff (Feedback & Defect mapping): `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_reviewer_m0_1\handoff.md`
- Reviewer 2 Handoff (Feedback & Defect mapping): `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_reviewer_m0_2\handoff.md`

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Remediation Scope & Tasks for Milestone 0 (Iteration 2):
1. Per-App Container Files:
   - `seoradar/Dockerfile`: Update `EXPOSE 3002`, `ENV PORT=3002`, healthcheck curl to `http://localhost:3002/`.
   - `seoradar/docker-compose.yml`: Update port to `3002:3002`, `PORT: 3002`, healthcheck `http://localhost:3002/`.
   - `terneon/Dockerfile`: Update `EXPOSE 3003`, `ENV PORT=3003`, healthcheck curl to `http://localhost:3003/`.
   - `terneon/docker-compose.yml`: Update port to `3003:3003`, `PORT: 3003`, healthcheck `http://localhost:3003/`.
   - `parselya/Dockerfile`: Update `EXPOSE 3004`, `ENV PORT=3004`, healthcheck curl to `http://localhost:3004/`.
   - `parselya/docker-compose.yml`: Update port to `3004:3004`, `PORT: 3004`, healthcheck `http://localhost:3004/`.
2. QA Contract Enforcement:
   - In `qa/run-all.mjs`, update the per-app contract checks so it explicitly asserts that each subproject's `Dockerfile` and `docker-compose.yml` contain the correct port constant (matching `app.port`).
3. Documentation Updates:
   - Update stale port references in `seoradar/scripts/SMOKE.md`, `DEPLOYMENT.md`, `TESTING.md`, `docs/API.md`, `docs/CONTAINERIZATION.md`, `CONTRIBUTING.md`, and any subproject `README.md` files where ports 3000-3003 are mentioned as active service ports.
4. Run independent verification:
   - `node scripts/status.mjs --json`
   - `node qa/run-all.mjs`
   - `npm test`
   - `npm run verify:fast`
   All must pass with exit code 0.
5. Write your handoff report to `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_worker_m0_r2\handoff.md`.
6. Send a message to parent when complete.
