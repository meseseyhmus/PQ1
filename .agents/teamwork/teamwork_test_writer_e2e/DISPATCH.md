## 2026-11-02T15:37:30Z
Your Identity:
- Archetype: teamwork_test_writer
- Role: E2E Test Suite Creator
- Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_test_writer_e2e\
- Parent: Project Orchestrator (Conversation ID: 89b1683a-3a87-4b48-9463-fad6372fd211)

MANDATORY INPUTS (You MUST read these before starting work):
- ORIGINAL_REQUEST.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
- PROJECT.md: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md
- E2E Test Plan: `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_explorer_survey_3\analysis.md` (Sections 5 and 6 describe the 4-tier test architecture and matrix)

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All tests must be genuine and execute against real endpoints, libraries, and application logic. Do not fabricate test results.

Scope & Tasks:
1. Design and implement the unified E2E test suite across all 4 applications:
   - `konvertlab` (Port 3001)
   - `seoradar` (Port 3002)
   - `terneon` (Port 3003)
   - `parselya` (Port 3004)
2. Implement test tiers per the 4-Tier methodology:
   - **Tier 1 (Feature Coverage)**: >=5 tests per feature for all 4 apps (KonvertLab converters, SeoRadar CWV & headers, Terneon sectors & calculator, Parselya TKGM & camera & export).
   - **Tier 2 (Boundary & Corner Cases)**: Edge cases (empty payload, invalid URLs, SSRF attempt, corrupted files, max file sizes, out-of-bounds coordinates, canvas CORS edge cases).
   - **Tier 3 (Cross-Feature Combinations)**: Multi-step pipelines (e.g. Kadastro query -> tile loading -> POI calculation -> video export; SEO analysis -> CWV evaluation -> security audit -> PDF export; File batch conversion -> OCR fallback -> ZIP packaging).
   - **Tier 4 (Real-World Scenarios)**: Complete end-to-end user journeys simulating real users for each of the 4 products.
3. Organize the suite under `qa/e2e/` with an executable test runner: `node qa/e2e/run-e2e.mjs`.
4. Execute the test runner: ensure all tests run cleanly and report unambiguous PASS/FAIL results with exit code 0.
5. Create `TEST_READY.md` at project root `c:\Users\HUAWEI\Desktop\saas\TEST_READY.md` following the standard template (runner command, coverage table per tier, and feature checklist).
6. Write your handoff report to `c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_test_writer_e2e\handoff.md`.
7. Send a message to parent when complete with test metrics and summary.
