# PRD Kapsama Raporu

Bu rapor, `PRD.md` içindeki dört ürünün somut ve doğrulanabilir gereksinimlerinin
uygulama kodunda karşılanma durumunu denetler. Her satır, ilgili kod gerçekten
görülerek işaretlenmiştir; "muhtemelen vardır" varsayımı yapılmamıştır.

Kanıt yolları repo köküne göredir (ör. `seoradar/lib/analyze.ts`).

Denetim tarihi: 2 Kasım 2026.

---

## Özet

| Proje | ✅ Karşılanmış | ⚠️ Kısmi | ❌ Yok |
|---|---|---|---|
| SeoRadar (Proje 1) | 15 | 1 | 0 |
| KonvertLab (Proje 2) | 7 | 1 | 0 |
| Terneon (Proje 3) | 8 | 0 | 0 |
| Parselya (Proje 4) | 11 | 3 | 0 |
| **Toplam** | **41** | **5** | **0** |

PRD'nin somut gereksinimlerinin tamamı en azından kısmen karşılanmıştır.
Hiçbir gereksinim tamamen uygulanmamış (❌) durumda değildir. Kalan 5 ⚠️ kalemin
detayı aşağıdaki bölümlerde ve sondaki "Kritik Eksikler" bölümündedir.

---

## Proje 1 — SeoRadar (SEO Analiz Platformu)

| # | Gereksinim (PRD) | Durum | Kanıt | Not |
|---|---|---|---|---|
| 1.1 | Backend analiz API'si (`/api/analyze/route.ts`), URL HTML'ini `fetch` + `cheerio` ile çeker, JSON döner | ✅ | `seoradar/app/api/analyze/route.ts`, `seoradar/lib/analyze.ts` (cheerio ^1.0.0 package.json'da) | SSRF korumalı fetch, 12 sn timeout, 5 MB gövde sınırı |
| 1.2 | Genel SEO Skoru (0-100 ağırlıklı) | ✅ | `seoradar/lib/analyze.ts:881` `computeScore` — 20 kontrol, ağırlıklı ortalama | A+…F harf notu da var |
| 1.3 | Title etiketi kontrolü (var mı, uzunluk ideal mi) | ✅ | `seoradar/lib/analyze.ts:418-445` — 30-60 karakter ideal aralığı | |
| 1.4 | Meta Description kontrolü | ✅ | `seoradar/lib/analyze.ts:448-471` — 70-160 karakter ideal aralığı | |
| 1.5 | Heading yapısı H1-H6 sayısı ve içerikleri | ✅ | `seoradar/lib/analyze.ts:179-186` (çıkarma), `:494-519` (hiyerarşi kontrolü) | |
| 1.6 | Görsel analizi: toplam `<img>` + alt eksik listesi | ✅ | `seoradar/lib/analyze.ts:188-207` — `missingAltSrcs` listesi (ilk 15) | |
| 1.7 | Link analizi: iç link, dış link | ✅ | `seoradar/lib/analyze.ts:209-231` — internal/external/nofollow sayımı | |
| 1.8 | Kırık link kontrolü | ✅ | `seoradar/lib/analyze.ts:323-365` `checkBrokenLinks` — HEAD, 405/501'de GET fallback | Başına 25 link üst sınırı (performans koruması) |
| 1.9 | Teknik kontrol: robots.txt, sitemap.xml, SSL/HTTPS, Open Graph | ✅ | `seoradar/lib/analyze.ts:371-399` (robots/sitemap), `:296-311` (HTTPS/OG), `:686-702` (OG kontrolü) | Ek: Twitter Card, JSON-LD, canonical, viewport, hreflang kontrolleri de var |
| 1.10 | Hero: URL giriş inputu + "Ücretsiz Analiz Et" butonu | ✅ | `seoradar/components/Hero.tsx:81-104` | |
| 1.11 | Animasyonlu dairesel başarı skoru (0-100) + özet istatistikler (kritik/uyarı/başarılı) | ✅ | `seoradar/components/ScoreRing.tsx` (SVG stroke animasyonu, useEffect), `seoradar/components/SummaryStats.tsx`, `lib/analyze.ts:952-954` | |
| 1.12 | Renk kodlu (yeşil/sarı/kırmızı) akordeon/kart listesi + "Nasıl Çözülür?" önerileri | ✅ | `seoradar/lib/analyze.ts:405-413` `sev()` (success/warning/error), `seoradar/components/CheckAccordion.tsx`, her kontrolde `howToFix` dizisi | |
| 1.13 | "Raporu PDF Olarak İndir (Pro)" (jspdf) | ✅ | `seoradar/lib/pdf.ts` (jspdf ^2.5.2), `seoradar/app/page.tsx:286`, `components/ResultView.tsx:278-293` | Ücretsiz planda filigran, Pro'da kalkar (white-label) |
| 1.14 | Ücretsiz planda ileri detayları bulanıklaştıran Pro kilidi | ✅ | `seoradar/app/page.tsx:494` — `blur-sm select-none` + "Pro'ya Yükselt" butonu (`:485-493`) | |
| 1.15 | Aylık/Yıllık abonelik fiyatlandırma tablosu (Ücretsiz/Pro/Ajans) | ⚠️ | `seoradar/app/page.tsx:786-885` — Ücretsiz 0 ₺ / Pro 149 ₺ / Ajans 499 ₺ tablosu var | Yalnızca **aylık** fiyat gösteriliyor; PRD'deki "Aylık/**Yıllık**" geçişi (toggle) yok |
| 1.16 | AdSense reklam yerleşim alanları | ✅ | `seoradar/components/AdBanner.tsx` — slot/variant (sidebar/leaderboard) yer tutucu; gerçek ağ bağlantısı bilinçli olarak yok | |
| 1.17 | Günlük ücretsiz analiz limiti (freemium) | ✅ | `seoradar/lib/rateLimit.ts:7` `FREE_DAILY_LIMIT = 3`, `app/api/analyze/route.ts:55-63` limit aşımında 429 | |
| 1.18 | Hosting/SEO affiliate linkleri | ✅ | `seoradar/components/PartnerSection.tsx` — kategorili (hosting vb.) partner/affiliate bölümü | |

---

## Proje 2 — KonvertLab (Doküman Dönüştürücü + YouTube Araçları)

| # | Gereksinim (PRD) | Durum | Kanıt | Not |
|---|---|---|---|---|
| 2.1 | TXT to PDF: dosya yükleme **veya** metin yapıştırma; yazı tipi boyutu, kenar boşluğu, hizalama ayarları; Türkçe karakter destekli PDF | ✅ | `konvertlab/components/TxtToPdfPanel.tsx:31-33` (fontSize/margin/align state), `:141` textarea; `konvertlab/lib/pdfGenerate.ts:8-12` — jsPDF `doc.html()` + html2canvas ile ğ/ş/ı/İ desteği | Standart fontlar Latin-1 olduğu için HTML rasterize yolu seçilmiş (açıklama kodda mevcut) |
| 2.2 | PDF to TXT: sürükle-bırak PDF, sayfa sayfa metin ayıklama, düzenlenebilir editör, `.txt` indirme | ✅ | `konvertlab/components/PdfToTxtPanel.tsx` — `lib/pdfExtract.ts` (pdfjs-dist ^4.8.69), sayfa bazlı `--- Sayfa N ---` çıktısı (`:10-14`), düzenlenebilir textarea (`:111-114`), indirme (`:52-58`) | |
| 2.3 | YouTube araçları: senaryo/SRT/TXT → temiz metin + PDF e-kitap/sunum | ⚠️ | `konvertlab/components/YoutubeToolsPanel.tsx`, `konvertlab/lib/srtParse.ts` (SRT/WebVTT/düz metin ayrıştırma), "ebook" ve "summary" dışa aktarım modları (`:11, 66-77`) | E-kitap ve özet PDF var; PRD'deki "**sunum**" (slayt düzeni) çıktısı yok |
| 2.4 | Çoklu dosya sürükle-bırak, dosya boyutu göstergesi, ilerleme çubuğu | ✅ | `konvertlab/components/DropZone.tsx` (`multiple`, `formatBytes` boyut göstergesi `:121`), `konvertlab/components/ProgressBar.tsx`, `components/BatchConvertPanel.tsx` + `lib/batch.ts` | |
| 2.5 | Sağ/sol ve alt kısımlarda AdSense banner yer tutucuları | ✅ | `konvertlab/app/page.tsx:29-40` — `AdBanner slot="left"/"bottom"/"right"` | |
| 2.6 | "Toplu Dönüştürme (50 Dosyaya Kadar) ve Reklamsız Deneyim" Pro üyelik modalı | ✅ | `konvertlab/components/PricingModal.tsx:15,55` — "Toplu dönüşüm (50 dosyaya kadar)", `lib/batch.ts` `MAX_BATCH_FILES` | |
| 2.7 | %100 tarayıcı içi (sunucuya dosya yüklemesi yok) | ✅ | `konvertlab/components/` ve `lib/` içinde `fetch(`/`/api/` çağrısı yok (grep ile doğrulandı); `app/` altında API route yok | |
| — | (PRD özetinde anılan) Markdown ve görsel formatları | ✅ | `konvertlab/components/MarkdownToPdfPanel.tsx`, `konvertlab/components/ImageToPdfPanel.tsx` | PRD gövdesinde istenmeyen ek modüller |

---

## Proje 3 — Terneon (Web Ajans + Canlı Demo + Abonelik)

| # | Gereksinim (PRD) | Durum | Kanıt | Not |
|---|---|---|---|---|
| 3.1 | Merkezi konfigürasyon `config/siteConfig.ts`: marka, iletişim, WhatsApp, demolar, fiyatlar tek dosyada | ✅ | `terneon/config/siteConfig.ts` — whatsapp `:44`, hizmet fiyatları `:62-115`, demolar, trustBadges `:306` | |
| 3.2 | Hero: akıcı metin animasyonları, "Önce Ücretsiz Demo, Sonra Ödeme" güven rozetleri, "Canlı Demoları İncele" + "Fiyat Hesapla" butonları | ✅ | `terneon/components/Hero.tsx:3,35-43` (framer-motion), CTA'lar `config/siteConfig.ts:52-53`; güven rozetleri `components/TrustAndStats.tsx:48` | |
| 3.3 | Kategori filtreleme: Tümü, Sağlık & Klinik, E-Ticaret, Güzellik, Otel & Konaklama, Kafe & Restoran, Kurumsal | ✅ | `terneon/components/DemoShowcase.tsx:17-23` — yedi kategori birebir aynı | |
| 3.4 | Proje kartı: görsel, sektör etiketi, açıklama + tam ekran iframe modal (Masaüstü/Mobil seçenekli) veya yeni sekmede canlı demo | ✅ | `terneon/components/DemoShowcase.tsx` — `viewMode: 'desktop' \| 'mobile'` (`:29, 166-185`), tam ekran iframe modal (`:203` civarı) | "Yeni sekmede aç" ayrı butonu yok; PRD "veya" ile ifade ettiği için modal karşılar |
| 3.5 | Adım 1: Kurumsal 12.000 / E-Ticaret 20.000 / Özel Uygulama 30.000 TL | ✅ | `terneon/config/siteConfig.ts:62,70,78` — fiyatlar birebir aynı | |
| 3.6 | Adım 2 ek özellikler: Panel +3.000, SEO +3.000, Çoklu Dil +2.500, AI Chatbot +4.000, GSAP/3D +5.000 | ✅ | `terneon/config/siteConfig.ts:87,94,101,108,115` — beş kalem ve fiyatlar birebir | |
| 3.7 | Adım 3: Aylık veya Yıllık bakım/sunucu aboneliği seçimi | ✅ | `terneon/components/PriceCalculator.tsx:221-296` — "Aylık Abonelik" / "Yıllık Abonelik" | |
| 3.8 | Sağda yapışkan (sticky) Özet Sepet, anlık toplam, seçimleri otomatik WhatsApp mesajına çeviren buton | ✅ | `terneon/components/PriceCalculator.tsx:296-334` (`sticky top-24` Özet Sepet), `:369` "WhatsApp ile Teklif Al", `lib/whatsapp.ts:59-61` `wa.me` + `encodeURIComponent` ile mesaj oluşturma | "Ücretsiz Demo İste" ifadesi de `components/TestimonialsAndFaq.tsx:201`'de mevcut |
| 3.9 | Framer Motion geçişleri, neon/dark-mode modern tema | ✅ | `terneon/package.json` (framer-motion ^11.15.0), `components/Hero.tsx`, `app/globals.css` (neon renk paleti) | |

---

## Proje 4 — Parselya (Arsa & Parsel Video Animasyon Editörü)

| # | Gereksinim (PRD) | Durum | Kanıt | Not |
|---|---|---|---|---|
| 4.1 | Sol Panel Sekme 1: İl, İlçe, Mahalle, Ada, Parsel girişleri + "Parseli Haritada Bul ve Çiz" butonu | ✅ | `parselya/components/TabParcelQuery.tsx:32-46,68-94` — zorunlu alan doğrulaması, `findParcel` ile bulma ve `LOAD_PARCEL` | Parsel verisi `lib/demoParcel.ts` örnek verisinden gelir; gerçek TAKBIS/tapu servisi yok (bkz. kapsam dışı) |
| 4.2 | KML/GeoJSON yükleme | ⚠️ | `parselya/components/TabParcelQuery.tsx:154` buton etiketi "GeoJSON / KML Yükle"; ancak `dosyaYukle` (`:46-60`) yalnızca `JSON.parse` + `extractPolygon` yapar | **KML (.xml/.kml) ayrıştırması uygulanmadı**; yalnızca GeoJSON Polygon destekleniyor |
| 4.3 | Sekme 2: animasyonlu bilgi etiketleri (Arsa m², Fiyat, İmar Durumu, "Yola Cephe", "Denize 500m" mesafe çizgileri) | ✅ | `parselya/config/siteConfig.ts:58-124` — `OVERLAY_PRESETS` (Alan/Fiyat/İmar/Yola Cephe/Ada-Parsel) + mesafe noktaları ("Denize 500 m", "Ana Yol 120 m", "Merkez 2 km"); `components/TabOverlays.tsx`, `components/OverlayPresetPicker.tsx` | Etiket giriş/çıkış zamanları (startTime/endTime) destekleniyor |
| 4.4 | Sekme 3: sınır rengi (Neon Yeşil, Altın Sarısı, Kırmızı), dolgu opaklığı, kamera hareketi (Zoom-In / Orbit) | ✅ | `parselya/config/siteConfig.ts:33-39` `COLOR_PRESETS` (üç PRD rengi + 2 ek), `components/TabStyleCamera.tsx:41-48` "Dolgu Opaklığı" slider'ı, `components/CameraPicker.tsx` zoom-in/orbit | |
| 4.5 | Orta alan: 9:16 / 16:9 en-boy oranı seçicisi | ✅ | `parselya/app/page.tsx:154-164` ("9:16 Reels" butonu), `components/ParcelCanvas.tsx:494` — 9:16 → 608×1080, 16:9 → 1080×608 | |
| 4.6 | Uydu görüntüsü üzerinde parlayan neon parsel sınırları + animasyonlu callout kartları + kamera yakınlaşma simülasyonu | ✅ | `parselya/components/ParcelCanvas.tsx:27-211` — prosedürel uydu dokusu (value-noise), neon vuruş çizimi, `lib/camera.ts` zoom/orbit hareketi | Gerçek uydu mozaği (Mapbox/Google) değil, prosedürel doku (bkz. kapsam dışı) |
| 4.7 | Oynat/Duraklat, Baştan Oynat, saniye göstergesi | ✅ | `parselya/app/page.tsx:253-277` — TOGGLE_PLAY, RESTART (RotateCcw), mm:ss.f zaman göstergesi | |
| 4.8 | Alt panel zaman çizelgesi (0-15 sn): kamera katmanı, parsel çizim katmanı, etiket giriş-çıkış zamanları, ses dalgası katmanı | ⚠️ | `parselya/app/page.tsx:242-360` — çok katmanlı timeline (🎥 Kamera, 📍 Parsel Çizim, etiket katmanları, 🎵 Ses Dalgası `:358`), süre 15 sn (`state/EditorContext.tsx:46`) | Katmanlar ve scrubber tam; ancak **arka plan müziği gerçek ses çalması yok** — "Ses Dalgası" yalnızca görsel katman |
| 4.9 | Üst bar: marka logosu, kalan kredi ("3 Kredi Kaldı - Paket Yükselt"), "Videoyu Dışa Aktar (MP4)" butonu | ✅ | `parselya/components/CreditBadge.tsx:28` "N Kredi Kaldı" + yükseltme; `app/page.tsx:191` "Videoyu Dışa Aktar"; `lib/exportVideo.ts` — MediaRecorder ile canvas → mp4 kaydı ve indirme | |
| 4.10 | Kredi/abonelik sistemi, filigransız HD/4K dışa aktarma | ⚠️ | `parselya/config/siteConfig.ts:13-29` `CREDIT_PLANS` (3/30/150 kredi; 720p filigranlı / 1080p filigransız); `state/EditorContext.tsx:164` kredi düşümü; `components/ParcelCanvas.tsx:379` filigran çizimi | Planlar ve kredi mekaniği var; ancak **4K (2160p) çıktı yok** — canvas 1080p üst sınırı; "filigransız" yalnızca plan tanımında |
| 4.11 | Eksiksiz state yönetimi: veri/renk/metin değişince önizleme anında güncellenir | ✅ | `parselya/state/EditorContext.tsx` — merkezi reducer (SET_PARCEL_FORM, LOAD_PARCEL, SET_ASPECT, kredi vs.), `app/page.tsx`'te tüketimi; `lib/canvasRegistry.ts` | |

---

## En Kritik 5 Eksik (⚠️ kalemleri)

❌ (tamamen yok) işaretli gereksinim çıkmadı. Aşağıdaki beş ⚠️ kalemi, kalan
açıkları önem sırasıyla listeler:

1. **SeoRadar — yıllık abonelik seçeneği yok** (`seoradar/app/page.tsx:786-885`).
   Fiyat tablosu yalnızca aylık 149 ₺ / 499 ₺ gösteriyor; PRD "Aylık/Yıllık"
   geçişi istiyor. Gider kaybı (yıllık peşin indirmesi) doğrudan gelir modelini
   etkiler.
2. **Parselya — KML ayrıştırma yok** (`parselya/components/TabParcelQuery.tsx:154`).
   Buton "GeoJSON / KML Yükle" diyor ama kod yalnızca `JSON.parse` yapıyor; KML
   yükleyen kullanıcı hata alır. Ya KML desteği eklenmeli ya da etiket
   "GeoJSON Yükle" olarak düzeltilmeli (yanıltıcı arayüz).
3. **Parselya — 4K dışa aktarma yok** (`parselya/lib/exportVideo.ts`,
   `components/ParcelCanvas.tsx:494`). Gelir modeli "filigransız HD/**4K**
   dışa aktarım" üzerine kurulu; mevcut çıktı 1080p ile sınırlı ve pazarlama
   metni (`app/page.tsx:424`) 4K vaat ediyor.
4. **Parselya — arka plan müziği çalmıyor** (`parselya/app/page.tsx:358`).
   Timeline'da "Ses Dalgası" katmanı yalnızca görsel; PRD ses dalgası katmanını
   gerçek müzik olarak tanımlıyor. Dışa aktarılan videoda da ses yok.
5. **KonvertLab — sunum (slayt) çıktısı yok**
   (`konvertlab/components/YoutubeToolsPanel.tsx:11`). YouTube modülü "e-kitap"
   ve "özet" PDF üretiyor; PRD'nin anısındaki "sunum" formatı eksik.

---

## Bilinçli Olarak Kapsam Dışı Bırakılanlar

PRD'de adı geçen ancak bu aşamada bilinçli olarak gerçek entegrasyonu
yapılmayan, yer tutucu/mock ile karşılanan maddeler:

- **Gerçek ödeme/abonelik tahsilatı** — dört üründe de Pro/Plan satın alma
  butonları yalnızca client-side state değiştiriyor (ör.
  `seoradar/app/page.tsx:848` `setIsPro(true)`); ödeme sağlayıcı (iyzico/Stripe)
  entegrasyonu yok.
- **Gerçek AdSense** — `seoradar/components/AdBanner.tsx` ve
  `konvertlab/components/AdBanner.tsx` bilinçli yer tutucu; reklam ağı bağlantısı
  yok (kod yorumlarında belirtilmiş).
- **Gerçek tapu/parsel servisi (TAKBIS)** — Parselya'da parseller
  `lib/demoParcel.ts` örnek verisinden geliyor.
- **Gerçek uydu mozaği (Mapbox/Cesium)** — Parselya'da uydu altlığı prosedürel
  value-noise dokusu (`components/ParcelCanvas.tsx:27-211`); harita sağlayıcısı
  ve API anahtarı gerektirmiyor.
- **Gerçek WhatsApp backend'i** — Terneon'da `wa.me` derin linki üretiliyor
  (`lib/whatsapp.ts`); mesajlaşma altyapısı yok (beklenen davranış).

Bu maddeler harici servis, API anahtarı ve hukuki sözleşme gerektirdiği için
ürün lansmanı öncesi ayrı ele alınmalıdır (bkz. `docs/ROADMAP.md`).
