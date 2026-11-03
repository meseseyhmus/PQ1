## 2026-11-03T08:56:59Z
You are explorer_audit_suite. Your working directory is c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_explorer_audit_suite\.
You MUST read the original request at: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md

Your task is a rigorous technical audit and gap analysis of `konvertlab` (Port 3001), `seoradar` (Port 3002), and global project verification against the user's checklist:
KonvertLab checklist:
- %100 istemci taraflı gizlilik (no server API routes)
- 1-tık örnek test dosyaları ("Örnek Dosya ile Dene" butonları)
- WebP tasarruf kaydıracı ve boyut simülatörü
- Türkçe Tesseract.js OCR motoru
- Çoklu dosya Batch Pro ZIP arşivi
- İstemci taraflı QR kod üretici

SeoRadar checklist:
- 1-tık hazır demo site denetimleri (Trendyol, Hepsiburada, GitHub)
- Google PageSpeed radyal Core Web Vitals kartları (LCP, CLS, FID, INP)
- Nginx, Apache, Next.js güvenlik başlığı kod parçacıkları
- Kurumsal çok sayfalı PDF denetim raporu
- Ajans WhatsApp teklif modalı

Global verification status:
- Check how tests are structured in konvertlab and seoradar, and whether tests pass.
- Check `qa/run-all.mjs` (86 contracts) and scripts (`scripts/build-all.mjs`).
- Check if tools in `c:\Users\HUAWEI\Desktop\saas\rea` can be used or referenced.

Write your analysis to `analysis.md` and complete handoff to `handoff.md` in your working directory.
Communicate back with send_message with a summary and reference to your handoff report.
