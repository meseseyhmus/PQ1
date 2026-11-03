# Changelog

Bu depodaki tüm önemli değişiklikler burada belgelenir.
Biçim [Keep a Changelog](https://keepachangelog.com/tr-TR/1.1.0/) esaslarına
göredir; sürümleme [SemVer](https://semver.org/lang/tr/) ile yapılır.

## [Unreleased]

### Eklendi

- `CONTRIBUTING.md` — izolelik kuralları, sözleşme katmanı, test kalıpları,
  commit biçimi ve sorun giderme tablosu.
- `scripts/test-all.mjs` — dört uygulamanın `tests/run-tests.mjs` paketlerini
  keşfedip sırayla koşturur (`--only` ile daraltılabilir). `npm test` artık
  bunu çağırır.
- `scripts/smoke-pages.mjs` — dört uygulamanın ana sayfasını indirir ve
  markaya özgü ayırt edici Türkçe içerik parçalarını doğrular
  (`npm run smoke:pages`). Ayrıca `<title>`, `meta description`, Open Graph
  ve JSON-LD işaretlerini denetler (indexlenebilirlik).
- `scripts/verify-all.mjs` birim test adımı artık yalnızca SeoRadar'ı değil,
  test paketi olan **her** uygulamayı koşar.
- `qa/validate-schema.test.mjs` — şema doğrulayıcının öz-testleri (12 senaryo:
  geçerli yükler + `x-invariants` dahil bozuk yükler).
- `qa/contracts/analysis-error.schema.json` + örnekleri — `AnalyzeError`
  (`code` enum) ve `UsageResponse` sözleşme yükleri.
- SeoRadar birim testleri: `tests/harness.mjs`, `format.test.mjs`,
  `rateLimit.test.mjs`, `analyze.test.mjs`, `run-tests.mjs`, `alias-hook.mjs`.
- SeoRadar canlı smoke: `scripts/smoke.mjs` (+ `SMOKE.md`).
- KonvertLab, Terneon ve Parselya için kendi birim test paketleri.

### Düzeltildi

- Birim test harness'larına `expect(x).not.…` olumsuz eşleyicileri eklendi
  (`toBe`, `toContain`, `toMatch`, `toThrow` vb.). Terneon testlerindeki
  iki başarısızlık bunun eksikliğinden kaynaklanıyordu — kod doğruydu.
- `qa/run-all.mjs` beklenen dosya listesine her uygulama için
  `app/robots.ts` + `app/sitemap.ts` eklendi (SEO altyapısı sözleşmesi).
- `seoradar/lib/format.ts` → `normalizeUrl` zaten şeması olan girdiye
  (`ftp:`, `javascript:` …) artık `https://` eklemiyor; `isValidUrl` bu
  protokolleri reddediyor.
- `qa/validate-schema.mjs` artık `x-invariants` (alanlar arası toplam
  eşitliği) destekliyor; `analysis-result.schema.json` içine
  `summary.passed + warnings + errors === total` kuralı kondu.
- `seoradar/README.md` içindeki "40+ otomatik kontrol" iddiası gerçek
  sözleşmeyle (20 sabit kontrol id'si) uyumlu hale getirildi.
- `scripts/status.mjs` derleme kontrolü artık yalnızca `.next/` yerine
  `.next/BUILD_ID` arıyor; `README` ve test sütunları eklendi.

### Belgelendi

- `terneon/README.md`, `parselya/README.md` — hızlı başlangıç, dizin ağacı,
  yapılandırma kaynağı, sınırlar.
- `TESTING.md`, `qa/README.md` — `scripts/test-all.mjs` ve çok-uygulamalı
  birim test keşfi.

## [1.0.0] — 2026-11-01

İlk kararlı sürüm. Dört bağımsız SaaS uygulaması, kök geliştirme araçları,
Docker desteği ve QA denetleyicisi birlikte yayınlandı.

### SeoRadar (`seoradar/`)

- URL SEO analiz motoru: `POST /api/analyze`, hedef sayfanın HTML'ini
  `cheerio` ile sunucu tarafında çeker.
- **20 kontrol** içeren On-Page + teknik analiz: başlık, meta açıklama,
  başlık hiyerarşisi, resim alt metinleri, iç/dış bağlantı sayımları ve
  benzeri metrikler; ağırlıklı 0–100 skor.
- **PDF rapor** üretimi (Pro): `jspdf` ile istemci tarafında.
- **Rate limit**: ücretsiz planda günde 3 analiz (bellek içi, IP +
  `localStorage` tabanlı yumuşak limit).
- **Pro bulanıklaştırma**: Pro kilitli alanlar ücretsiz planda blur ile
  gösterilir.
- Birim testleri (`seoradar/tests/run-tests.mjs`) ve canlı API smoke testi
  (`seoradar/scripts/smoke.mjs`).

### KonvertLab (`konvertlab/`)

- **TXT → PDF** ve **PDF → TXT** dönüştürücü; %100 istemci tarafında
  (`jspdf` + `pdfjs-dist`), hiçbir dosya sunucuya yüklenmez.
- **YouTube araçları**: SRT/TXT altyazıları temiz metne ve PDF e-kitaba
  çevirme.
- AdSense banner alanları `AdBanner` bileşeniyle yer tutucu olarak hazır.
- Toplu dönüşüm Pro kilidi.

### Terneon (`terneon/`)

- **Yapılandırma güdümlü** içerik: marka, iletişim, demo ve fiyat verisi
  `config/siteConfig.ts` içinde.
- **İnteraktif fiyat hesaplayıcı**: 3 adımlı seçim akışı, sticky canlı özet.
- **WhatsApp teklif linki**: seçimleri otomatik mesaj metnine çevirip
  `wa.me` linki üretir.
- **Demo modalı**: canlı ürün vitrini.
- Framer Motion giriş/scroll animasyonları.

### Parselya (`parselya/`)

- **Canvas uydu parselleme**: GeoJSON poligonundan parsel sınırı çizimi,
  karanlık mod video editörü arayüzü (sol panel, orta sahne, alt timeline,
  üst bar).
- **Çevrimdışı çalışma**: harita/uydu servisi gerekmez, API anahtarı
  istemez; demo veri `lib/demoParcel.ts` içinde.
- **Video dışa aktarma**: `MediaRecorder` + `canvas.captureStream()` ile
  WebM kaydı (MP4 desteği tarayıcıya bağlı; UI'da seçenek sunulur).
- Zoom-in/orbit kamera hareketi ve callout etiket animasyonları timeline'a
  bağlı.
- Kredi göstergesi ve filigransız HD dışa aktarma kilidi.

### Paket / araçlar (kök)

- `scripts/dev-all.mjs`: dört uygulamayı 3001–3004 portlarında paralel
  çalıştırır (`--only`, `--skip-install`, `--port` bayrakları).
- `scripts/build-all.mjs`: sıralı/paralel toplu derleme (`--only`,
  `--concurrent`, `--skip-install`).
- `scripts/status.mjs`: dizin/derleme/bağımlılık durumu tablosu (`--json`).
- Kök `package.json` kısayol script'leri (`dev`, `build`, `dev:<app>`,
  `build:<app>`, `status`).

### QA

- `qa/run-all.mjs` sözleşme denetleyicisi: dizin yapısı, `package.json`
  geçerliliği, npm script'leri, bağımlılık majör sürümleri, beklenen kaynak
  dosyalar, asgari kaynak dosya sayısı; `--run-build` ile gerçek derleme
  denetimi.

### Docker

- Kök `docker-compose.yml`: dört servis (`seoradar:local`, `konvertlab:local`,
  `terneon:local`, `parselya:local`), 3001–3004 port eşlemeleri, wget
  tabanlı healthcheck'ler, `saas` bridge ağı, `restart: unless-stopped`.
- Uygulama başına üç aşamalı `node:22-alpine` Dockerfile'ları (deps →
  builder → runner, root olmayan kullanıcı).

### Dokümantasyon

- Kök `README.md`, `qa/README.md`, `DEPLOYMENT.md`, `CONTRIBUTING.md` ve
  uygulama dizinlerindeki README'ler.

### Olumsuz / bilinçli kararlar

- **Hiçbir üçüncü taraf sitesi tersine mühendislik edilmedi veya
  kopyalanmadı** (seocu.com, smallpdf.com, eraslansoftware.com, emlivo.tr
  vb.). Tüm kod, yalnızca PRD'deki işlevsel gereksinimlerden, sıfırdan ve
  özgün markalarla yazılmıştır.
- SeoRadar PDF çıktısında **jsPDF Türkçe karakter desteği** eksik olduğu
  için metinler transliterasyon (ç→c, ş→s, ğ→g, ü→u, ö→o, ı→i vb.) ile
  yazılmıştır; bu bir hata değil, WinAnsi kodlamasından kaynaklanan bilinçli
  bir açık sınırlamadır.
- Parselya **harita API anahtarı gerektirmez**; gerçek tapu/parsel sorgu
  servisi bilinçli olarak bağlanmadı, anahtar girilebilecek alan ve demo
  veri bırakıldı.
- Veritabanı, ödeme sağlayıcısı ve oturum sistemi bilinçli olarak eklenmedi;
  gelir modeli yer tutucu (Pro kilidi, AdBanner) olarak uygulandı.
