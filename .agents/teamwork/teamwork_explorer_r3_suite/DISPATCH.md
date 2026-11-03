## 2026-11-03T09:39:56Z
You are teamwork_explorer assigned to conduct a deep forensic audit and verification of KonvertLab (Port 3001, reference https://github.com/orkunisitmak/nashi-app), SeoRadar (Port 3002), and the global workspace suite (86 QA contracts, 373 unit tests, production builds, and ports 3001-3004).

Working Directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_explorer_r3_suite\
Scope Document: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator_r3\PROJECT.md
Original Request: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
Parent Conversation ID: 96387340-2354-460a-bcd7-0d88d137bff2

INSTRUCTIONS:
1. Initialize your workspace (DISPATCH.md, BRIEFING.md, progress.md) in your working directory.
2. Read ORIGINAL_REQUEST.md and PROJECT.md.
3. Systematically inspect KonvertLab (`c:\Users\HUAWEI\Desktop\saas\konvertlab\`):
   - %100 istemci taraflı gizlilik (Verify NO server api routes exist; qa contract for forbidding api routes)
   - 1-tık örnek test dosyaları ("Örnek Dosya ile Dene" buttons for PDF->Docx, PDF->Excel, Image->WebP, OCR, QR, Batch)
   - WebP tasarruf kaydıracı ve boyut simülatörü (savings % badge, dimension display, real-time quality slider)
   - Türkçe Tesseract.js OCR motoru (progress %, Turkish status text, TXT/PDF/DOCX downloads)
   - Çoklu dosya Batch Pro ZIP arşivi (multi-file queue with animated badges, 1-click JSZip download)
   - İstemci taraflı QR kod üretici (Nashi-app style QR code generator, live preview, SVG/PNG download)
   - Run `npm --prefix konvertlab test` and `npm --prefix konvertlab run build`
4. Systematically inspect SeoRadar (`c:\Users\HUAWEI\Desktop\saas\seoradar\`):
   - 1-tık hazır demo site denetimleri (Trendyol, Hepsiburada, GitHub under search bar)
   - Google PageSpeed radyal Core Web Vitals kartları (LCP, CLS, FID, INP with circular gauges and 3-stage threshold bars)
   - Nginx, Apache, Next.js güvenlik başlığı kod parçacıkları (1-click copy panel with tabbed server selector)
   - Kurumsal çok sayfalı PDF denetim raporu (safe Turkish characters, executive score, CWV, security headers, competitor matrix)
   - Ajans WhatsApp teklif modalı (pre-filled proposal text with SEO score, CWV, security rating, 1-click WhatsApp link)
   - Run `npm --prefix seoradar test` and `npm --prefix seoradar run build`
5. Systematically inspect and run Global Workspace QA and Tests:
   - Run `node qa/run-all.mjs` (must pass all 86 contracts)
   - Run `npm run test:all` or `node scripts/test-all.mjs` (must pass all 373 unit tests)
   - Run `node scripts/build-all.mjs --skip-install` (must pass Next.js production builds across all 4 apps)
   - Verify port allocations across package.json, scripts, and Docker: 3001 (KonvertLab), 3002 (SeoRadar), 3003 (Terneon), 3004 (Parselya).
6. Record verbatim outputs, exact counts, and identify any gaps or anomalies.
7. Write your detailed technical findings in `analysis.md` and structured `handoff.md` in your working directory.
8. Send a completion message to your parent with summary and artifact path.
