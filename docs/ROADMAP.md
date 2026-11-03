# Yol Haritası

Bugünün tarihi: **1 Kasım 2026**. Plan dört ürünün ortak release takvimini
milestone bazlı tanımlar. Tarihler hedeftir; kapsam kayması halinde önce kapsam
kırpılır, tarih öne alınmaz.

---

## v0.1 — Tamamlandı (1 Kasım 2026)

Dört uygulamanın ilk çalışır sürümleri.

**Kapsam (tamamlanan iş kalemleri)**

- [x] SeoRadar: `POST /api/analyze` boru hattı (fetch → cheerio → metrikler →
  kontroller → skor), sonuç ekranı, in-memory rate limit, jsPDF raporu
  (ASCII transliterasyonlu), Pro kilitli alanlar.
- [x] KonvertLab: TXT→PDF, PDF→TXT (pdfjs worker), SRT→temiz metin→PDF
  e-kitap sekmeleri; drag & drop, progress bar, AdSense alanları.
- [x] Terneon: `siteConfig` merkezli yapı, hero, demo vitrini + iframe modal,
  3 adımlı fiyat hesaplayıcı, sticky sepet, WhatsApp teklif linki.
- [x] Parselya: 4 bölgeli editör, `renderAt(time)` motoru, kamera matematiği,
  GeoJSON poligon çizimi, timeline, WebM export, demo parsel verisi.
- [x] Her proje tek başına `npm install && npm run build` ile derleniyor.
- [x] Kök geliştirme yardımcıları (README'de belgelenen akış).

**Başarı ölçütleri:** dört üründe de temiz production build; temel kullanıcı
akışlarının (analiz, dönüşüm, teklif, video export) uçtan uca çalışması. Sağlandı.

**Kalan riskler:** in-memory rate limit ve MP4/Safari kısıtları v0.2'ye devredildi.

---

## v0.2 — Aralık 2026

**SeoRadar**

- Auth (e-posta + OAuth), hesap ve plan yönetimi.
- Gerçek ödeme entegrasyonu (Iyzico/Stripe) + webhook'lar; `x-seoradar-plan`
  başlığı gerçek oturum token'ıyla değiştirilir.
- Redis (Upstash) tabanlı rate limit; gömülü TTF ile Türkçe karakterli PDF.
- Taslak uçların implementi: `POST /api/report/pdf`, `POST /api/batch`
  (`GET /api/usage` halihazırda uygundur).

**KonvertLab**

- Toplu dönüşüm kuyruğu (IndexedDB tabanlı; sekmeyi kapatsa bile kalır).
- Pro kilidi: 50 dosyaya kadar batch + reklamsız deneyim.

**Terneon**

- CMS entegrasyonu (demo içerikleri ve vitrin verisi `siteConfig`'ten
  headless CMS'e taşınır; `siteConfig` yedek kaynak olarak kalır).

**Parselya**

- Gerçek tapu/parsel API entegrasyonu (sunucu taraflı proxy, API anahtarı
  sunucuda saklanır; demo veri geliştirme modunda kalır).
- MP4 export: wasm tabanlı transkod (ffmpeg.wasm veya eşdeğeri) — Safari
  dahil tutarlı MP4 üretimi.

**Başarı ölçütleri**

- SeoRadar'da kayıtlı kullanıcı gerçek kartla (test modu) Pro satın alabiliyor.
- Rate limit çoklu sunucu örneğinde tutarlı.
- KonvertLab'de 20 dosyalık batch kesintisiz tamamlanıyor.
- Parselya'da Safari'de MP4 indirilebiliyor.

**Riskler**

- Tapu/parsel servisinin lisans/kotası ve fiyatı bilinmiyor → entegrasyon
  sözleşmeye bağlı; fallback olarak mevcut demo veri ve manuel GeoJSON yükleme kalır.
- Ödeme sağlayıcı onay süreleri (Türkiye) gecikebilir → Iyzico/Stripe sırası
  değil paralel hazırlanır.
- ffmpeg.wasm bundle boyutu (~25 MB) → yalnızca export anında lazy yüklenir;
  CDN'den sunulur.

---

## v0.3 — Ocak 2027

- **Ortak auth/paywall paketi:** ürünler arasında tek oturum (SSO) ve
  paywall/pricing bileşenleri; kod paylaşımı bu noktada bir iç paket
  (npm private package) olarak başlar — monorepo'ya geçiş gerekmez.
- **Admin panelleri:** her ürün için içerik/abonelik/destek yönetimi.
- **Performans:** Lighthouse 90+ hedefi dört üründe de (mobil dahil);
  bundle bütçeleri (bkz. ARCHITECTURE.md §6.4) CI'da zorunlu kontrol olur.
- **KVKK + çerez onayı:** açık rıza yönetimi (çerez banner'ı, veri işleme
  politikaları, kullanıcı verisi silme akışı); AdSense kullanan iki üründe
  kişiselleştirilmiş reklam onayı ayrıca ele alınır.

**Başarı ölçütleri:** Lighthouse 90+ dört üründe; KVVK kontrol listesi
(banner, politika sayfaları, silme akışı) tam; admin panelinden abonelik
iptali/yükseltme ucuca çalışıyor.

**Riskler:** ortak paketin "dördüncü bağımlılık ağacını" doğurması — paket
sürüm disiplini (semver + changelog) ilk günden zorunlu tutulur.

---

## v1.0 — Mart 2027

**Üretim lansmanı.**

- **İzleme:** Sentry (hata) + ürün analitiği (sayfa/etkinlik, çerez onayına
  bağlı); uptime izleme ve uyarılar.
- **SLA:** seoradar analiz API'si için %99.5 erişilebilirlik hedefi; hata
  bütçesi tanımlanır, dashboard'da izlenir.
- **Destek dokümanları:** SSS, kullanıcı kılavuzları, iletişim/destek akışı;
  para iade ve iptal politikaları (ödeme sağlayıcı politikalarıyla uyumlu).
- **Lansman checklist:** canlı alan adları, SSL, analitik doğrulama, yedekleme,
  runbook (olası kesinti prosedürü).

**Başarı ölçütleri:** ilk 30 günde kritik (P0) olay sayısı 0; destek taleplerine
ilk yanıt < 24 saat; dört üründe ücretli dönüşüm kanalı canlı ve ölçülebilir.

**Riskler:** dört ürünü aynı anda lansman yapmanın destek yükü → ürünler
bir hafta arayla sırayla açılır (SeoRadar → KonvertLab → Parselya → Terneon).

---

## Bilinen Eksikler (PRD Kapsama Denetimi — 2 Kasım 2026)

Tam denetim: [`docs/PRD-COVERAGE.md`](./PRD-COVERAGE.md). Özet: 41 gereksinim
✅, 5 gereksinim ⚠️, 0 gereksinim ❌. Kalan açık kalemler:

1. **SeoRadar:** fiyat tablosunda yıllık abonelik seçeneği yok (yalnızca aylık).
2. **Parselya:** KML dosya ayrıştırması yok — yükleme butonu "GeoJSON / KML"
   diyor ama kod yalnızca GeoJSON JSON.parse ediyor; etiket düzeltilmeli ya da
   KML desteği eklenmeli.
3. **Parselya:** dışa aktarım 1080p ile sınırlı; 4K çıktı ve pazarlama metnindeki
   "4K" vaadi karşılanmıyor.
4. **Parselya:** timeline'daki "Ses Dalgası" katmanı görsel; gerçek arka plan
   müziği çalma/dışa aktarmada ses yok.
5. **KonvertLab:** YouTube araçlarında "sunum" (slayt düzeni) PDF çıktısı yok
   (e-kitap ve özet var).

Bilinçli kapsam dışı (harici servis gerektirir, lansmandan önce ele alınmalı):
gerçek ödeme tahsilatı, gerçek AdSense ağı, gerçek tapu/parsel servisi (TAKBIS),
gerçek uydu mozaği (Mapbox/Cesium).
