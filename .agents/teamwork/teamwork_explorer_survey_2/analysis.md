# Terneon ve Parselya Kapsamlı Mimari & PRD Durum Analiz Raporu

**Rapor Tarihi**: 2026-11-02  
**Hazırlayan**: Teamwork Explorer (Codebase & PRD Explorer)  
**Kapsam**: 
1. `terneon` (Port 3003) — Awwwards Seviyesinde Cyberpunk/Neon Dijital Ajans Platformu
2. `parselya` (Port 3004) — Emlak/Arsa Video Animasyon Editörü (Emlivo / Remotion Düzeyinde)

---

## 1. Yönetici Özeti (Executive Summary)

Her iki proje (`terneon` ve `parselya`) Next.js 15 (App Router), React 19, TypeScript ve Tailwind CSS altyapısı ile yapılandırılmış, mevcut birim testleri (harness) ve `npm run build` üretim derlemeleri başarıyla tamamlanmaktadır. 

Ancak PRD gereksinimleri, kullanıcı talebi ve kod tabanı çapraz analiz edildiğinde kritik port çakışmaları, DOM hiyerarşik hataları (duplicate layout) ve UI/UX derinleştirme gereksinimleri tespit edilmiştir:
1. **Port Uyumsuzluğu**: Kullanıcı promptunda `terneon` **Port 3003**, `parselya` **Port 3004** olarak tanımlanmıştır. Ancak kod tabanında (`package.json`, `docker-compose.yml`, `scripts/dev-all.mjs`, `scripts/smoke-pages.mjs`, `qa/run-all.mjs`, `qa/health-all.mjs`) `terneon` 3002, `parselya` ise 3003 portuna ayarlanmıştır (`seoradar` 3000, `konvertlab` 3001). Portların 3001-3004 düzenine geçirilmesi durumunda tüm workspace orkestrasyon dosyalarının senkron güncellenmesi zorunludur.
2. **Terneon Duplicate Layout Bug**: `terneon/app/layout.tsx` içerisinde `<Header />`, `<main>{children}</main>`, `<Footer />` tanımlı iken; `terneon/app/page.tsx` içinde de tekrar `<Header />`, `<main>`, `<Footer />` render edilmektedir. Bu durum sayfada çift başlık, çift altbilgi ve geçersiz iç içe `<main>` HTML5 semantik ihlaline yol açmaktadır.
3. **Terneon Canlı Demo Simülatörü**: Masaüstü / Mobil simülatör modalı mevcuttur ancak iç ekran statik özet kartı şeklindedir; her sektör için zengin interaktif demo içeriği/iframe önizlemesi ile Awwwards kalitesi güçlendirilmelidir.
4. **Parselya Video & Uydu Altyapısı**: TKGM Megsis API (`/api/parsel`), Web Mercator Tile Engine (`google-satellite`, `esri-satellite`, `osm`), MediaRecorder WebM/MP4 dışa aktarım, kamera hareketleri (`zoom-in`, `orbit`), POI mesafe çizgileri ve FileReader drone yükleme başarıyla kodlanmıştır. Harici uydu fayanslarının CORS kısıtları nedeniyle canvas tainting (lekelenme) ve video render güvenliği için fallback mekanizması titizlikle korunmalıdır.

---

## 2. Terneon (Port 3003) — Durum ve Boşluk Analizi

### 2.1 Mevcut Mimari ve Bileşen Haritası
- **Giriş Noktası**: `terneon/app/page.tsx` & `layout.tsx`
- **Konfigürasyon Merkezi**: `terneon/config/siteConfig.ts` (Tüm sektör demoları, fiyatlar, iletişim bilgileri, süreç adımları ve FAQ tek merkezden yönetilmektedir)
- **Arka Plan Efekti**: `components/NeonCanvasBackground.tsx` (Fare etkileşimli parçacıklar, neon bağlantı çizgileri, Tailwind keyframe auroralar)
- **Fiyat Hesaplayıcı**: `components/PriceCalculator.tsx` (3 temel paket, 5 ek modül, aylık/yıllık bakım aboneliği, dinamik yapışkan sepet, Türk Lirası formatlama)
- **WhatsApp Entegrasyonu**: `lib/whatsapp.ts` (`openWhatsAppQuote` ve `openWhatsAppDemoRequest` ile detaylı emojili hazır teklif mesajı)
- **Demo Vitrini & Cihaz Simülatörü**: `components/DemoShowcase.tsx` (Sektörel filtreleme, modal içi Masaüstü / Mobil en-boy görünüm simülatörü)

### 2.2 Yapısal Hatalar ve Eksiklikler
1. **Layout Duplication (Çift Render)**:
   - `terneon/app/layout.tsx` L122-124: `<Header /> <main>{children}</main> <Footer />`
   - `terneon/app/page.tsx` L12-23: `<Header /> <main ...> ... </main> <Footer />`
   - **Çözüm**: `page.tsx` içindeki Header ve Footer kaldırılmalı, ana bileşenler doğrudan döndürülmelidir.
2. **Port Değişimi**:
   - `package.json` içindeki `dev` ve `start` scriptleri `-p 3002` yerine `-p 3003` olmalıdır.
   - `docker-compose.yml` 3002 -> 3003 güncellenmelidir.
3. **Cihaz Simülatöründe Canlı Demo İçeriği**:
   - Simülatör içindeki placeholder görünüm yerine, her kategoriye özel (Sağlık, E-Ticaret, Güzellik, Otel, Kafe, Kurumsal) interaktif mini arayüz veya zengin mock vitrin sunulmalıdır.

### 2.3 Terneon Özellik Tablosu

| Kategori | Özellik Adı | Açıklama | Teknik Gereksinimler | Mevcut Durum | Kalan / Eksik İşler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Görsel & Tasarım** | Neon Parçacık & Izgara Canvas | Fareye duyarlı, hız sönümlemeli neon parçacıklar ve ızgara zemin | HTML5 Canvas, requestAnimationFrame, Tailwind `glow-*` | ✅ Tamamlandı (`NeonCanvasBackground.tsx`) | İsteğe bağlı parçacık hızı / renk ayarı |
| **Görsel & Tasarım** | Cyberpunk Tipografi & Aurora | Sora + Inter yazı tipleri, koyu arka plan (`#070a12`), akıcı aurora gradyanları | Google Fonts, Tailwind config `animate-aurora` | ✅ Tamamlandı | Yok |
| **Mimari** | Layout & DOM Bütünlüğü | Sayfa hiyerarşisinin semantik doğruluğu | Next.js App Router root layout | ⚠️ Hatalı (Duplicate Header/Footer) | `page.tsx` içindeki mükerrer Header/Footer/Main temizlenmeli |
| **Vitrin & Demo** | Sektörel Demo Vitrini | Sağlık, E-Ticaret, Güzellik, Otel, Kafe, Kurumsal kategorileri | Filter tabs, AnimatePresence, kart animasyonları | ✅ Tamamlandı (12 adet demo proje) | Yok |
| **Simülasyon** | İnteraktif Cihaz Simülatörü | Seçilen demonun Masaüstü ve Mobil (375x667) canlı önizleme modalı | Framer Motion modal, Laptop / Smartphone toggle | ⚠️ Kısmi (Görünüm çerçevesi hazır, içerik statik) | Seçilen sektöre ait canlı UI mockup şablonunun simülatör içine gömülmesi |
| **Fiyatlandırma** | Anlık Bütçe Hesaplayıcı | Hizmet türü + Ek modüller + Bakım/Sunucu aboneliği | React state, dinamik toplam, sepet özeti | ✅ Tamamlandı (`PriceCalculator.tsx`) | Yok |
| **Fiyatlandırma** | Bakım & Sunucu Abonelik Tablosu | Aylık ve Yıllık (2 ay hediye) bakım ve SLA desteği | `siteConfig.pricing.subscription`, kart seçimi | ✅ Tamamlandı | Yok |
| **Dönüşüm (CRO)** | WhatsApp Doğrudan Teklif | Seçilen sepetin kırılımlı WhatsApp mesajına dönüştürülmesi | `lib/whatsapp.ts`, `wa.me` deep link | ✅ Tamamlandı (`openWhatsAppQuote`) | Yok |
| **Dönüşüm (CRO)** | Ücretsiz Demo Talep Modalı | "Önce Ücretsiz Demo, Sonra Ödeme" taahhüdüyle 48 saatlik demo formu | Form state, validasyon, WhatsApp bildirim | ✅ Tamamlandı (`TestimonialsAndFaq.tsx`) | Form alanlarına telefon formatlama maskesi eklenebilir |
| **Güvenilirlik** | Müşteri Yorumları & FAQ | Yıldızlı değerlendirmeler, akordiyon SSS, süreç adımları | AnimatePresence akordiyon, grid | ✅ Tamamlandı | Yok |
| **Sözleşme / Port** | Port 3003 Uyumu | Geliştirme ve prodüksiyon portu | `package.json`, `docker-compose.yml` | ⚠️ Port 3002 olarak ayarlı | 3003'e güncellenmeli |

---

## 3. Parselya (Port 3004) — Durum ve Boşluk Analizi

### 3.1 Mevcut Mimari ve Bileşen Haritası
- **Giriş Noktası**: `parselya/app/page.tsx`
- **Uygulama Durum Yönetimi**: `parselya/state/EditorContext.tsx` (Zamanlayıcı saati `usePlaybackClock`, parsel koordinatları, katmanlar, kamera, video kalitesi)
- **Kadastro & CBS API**: `parselya/app/api/parsel/route.ts` (TKGM Megsis proxy çağrısı, Türkiye ilçe koordinat sözlüğü, deterministik geodetic poligon algoritması)
- **Canvas Çizim Motoru**: `parselya/components/ParcelCanvas.tsx` (676 satır; Mercator ekran projeksiyonu, parsel neon sınır parlaması, vinyet, POI mesafe çizgileri)
- **Uydu & Harita Sağlayıcısı**: `parselya/lib/tileProvider.ts` (Google Satellite, Esri World Imagery, OSM, Dark CartoDB Web Mercator fayansları)
- **Kamera Dönüşümleri**: `parselya/lib/camera.ts` (`zoom-in` uzaydan yumuşak iniş ve `orbit` 360° dönüş)
- **Zaman Çizelgesi (Timeline)**: `app/page.tsx` (CapCut / Remotion tarzı çok kanallı izler: Kamera, Parsel, Etiketler, Ses Dalgası, Scrubber)
- **İstemci Taraflı Video Export**: `parselya/lib/exportVideo.ts` (`recordCanvas` fonksiyonu, `canvas.captureStream(30)`, MediaRecorder WebM/MP4, otomatik dosya indirme)
- **Kullanıcı Drone/Görsel Yükleyici**: `components/TabStyleCamera.tsx` (`FileReader.readAsDataURL` ile yerel drone/parsel fotoğrafı)

### 3.2 Yapısal İnceleme ve Potansiyel Riskler
1. **Port Değişimi**:
   - `parselya/package.json` içindeki `dev` ve `start` scriptleri `-p 3003` -> `-p 3004`.
   - `docker-compose.yml` 3003 -> 3004.
2. **CORS ve Canvas Tainting (Video Kayıt Emniyeti)**:
   - `HTMLCanvasElement.captureStream()` kullanılarak video kaydedilirken, eğer Google/Esri harita fayansları CORS izni vermezse canvas "tainted" hale gelir ve tarayıcı güvenlik hatası fırlatır (`SecurityError`).
   - Parselya'da prosedürel zemin astarı (`buildTerrain()`) ve offline modelleme hazır bulunmaktadır. Ancak canlı fayans çekiminde `img.crossOrigin = "anonymous"` ile hata durumunda procedural zemine yumuşak geçiş (fallback) eksiksiz çalışmalıdır.
3. **Format ve Çözünürlük Desteği**:
   - Dikey (9:16 Reels/TikTok) ve Yatay (16:9 HD) oran desteği mevcuttur. Export sırasında çözünürlük ayarı (720p/1080p) ve filigran kontrolü uygulanmaktadır.

### 3.3 Parselya Özellik Tablosu

| Kategori | Özellik Adı | Açıklama | Teknik Gereksinimler | Mevcut Durum | Kalan / Eksik İşler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kadastro Motoru** | Ada / Parsel Sorgulama | İl, ilçe, mahalle, ada, parsel girilerek parsel sınırlarının otomatik çizilmesi | `/api/parsel`, TKGM Megsis API | ✅ Tamamlandı (`TabParcelQuery.tsx` + route) | Hızlı örnek parsel butonları mevcut |
| **Kadastro Motoru** | GeoJSON / KML Yükleme | Kullanıcının kendi CBS / Harita dosyasını sürüklemesi | `FileReader.readAsText`, GeoJSON parser | ✅ Tamamlandı (Feature & FeatureCollection) | KML parser desteği eklenebilir |
| **Harita Altlığı** | Google Satellite & Esri HD | Gerçek uydu görüntüsü üzerinde parseli görüntüleme | Web Mercator tile provider (Google, Esri, OSM) | ✅ Tamamlandı (`tileProvider.ts`) | Ağ hatası/CORS durumunda prosedürel zemin fallback'i aktif |
| **Görsel Yükleme** | Yerel Drone / Ortofoto Fotoğrafı | Kullanıcının drone ile çektiği arsa fotoğrafını zemine yerleştirmesi | `FileReader.readAsDataURL`, Canvas `drawImage` | ✅ Tamamlandı (`TabStyleCamera.tsx`) | Opaklık ve parlaklık ayarları mevcut |
| **Görsel Efektler** | Neon Parsel Sınır Çizimi | Çizgi çizim animasyonu, neon parlaması, enerji dalgası | Multi-pass glow, setLineDash, shadowBlur | ✅ Tamamlandı (`ParcelCanvas.tsx`) | Renk paletinden (Yeşil, Altın, Mavi vb.) anlık değişim |
| **CBS Analizi** | POI Mesafe Çizgileri | Denize mesafe, yola cephe, merkeze mesafe kesikli çizgileri ve etiketleri | Haversine mesafe hesabı, açısal etiketleme | ✅ Tamamlandı | Özel POI ekleme formu zenginleştirilebilir |
| **Sinematik Kamera** | Uzaydan Zoom-In & Orbit | Uzaydan parsele iniş ve parsel etrafında 360° dönüş animasyonu | `lib/camera.ts`, easeOutCubic matematiksel model | ✅ Tamamlandı | Kamera süresi ve yoğunluk slider'ı mevcut |
| **Video Editörü** | Zaman Çizelgesi (Timeline) | Scrubber, oynat/durdur/başa sar, çok kanallı katman görseli | React clock hook, requestAnimationFrame | ✅ Tamamlandı (Kamera, Çizim, Etiket, Ses izleri) | Çoklu ses parçası seçimi opsiyonel |
| **Bilgi Katmanları** | Dinamik Etiket Kartları | m², Fiyat, İmar, Ada/Parsel bilgi kutucuklarının sahneye girişi | Ekran uzayı projeksiyonu, giriş-çıkış süreleri | ✅ Tamamlandı (`TabOverlays.tsx`) | Konum X/Y ve zaman aralığı ayarlanabilir |
| **Video Export** | İstemci Taraflı Video Render | Sunucu masrafı olmadan tarayıcıda WebM/MP4 video indirme | MediaRecorder, Canvas captureStream, VP9/VP8 | ✅ Tamamlandı (`lib/exportVideo.ts`) | İlerleme çubuğu ve kredi düşümü mevcut |
| **Monetizasyon** | Kredi & Paket Sistemi | Ücretsiz (3 video), Pro (30 video), Emlak Ofisi (150 video) paketleri | State kredi yönetimi, modal vitrini | ✅ Tamamlandı (`CreditBadge.tsx` & modal) | Gerçek ödeme geçidi (Stripe/Iyzico) hazırlığı |
| **Sözleşme / Port** | Port 3004 Uyumu | Geliştirme ve prodüksiyon portu | `package.json`, `docker-compose.yml` | ⚠️ Port 3003 olarak ayarlı | 3004'e güncellenmeli |

---

## 4. Port ve Workspace Orkestrasyon Çakışma Analizi

Tüm projeler tek bir workspace altında `scripts/` yardımcılarıyla yönetilmektedir. Aşağıdaki tabloda mevcut yapı ile PRD/Kullanıcı hedefi karşılaştırılmıştır:

| Proje | Mevcut Repo Portu | Kullanıcı Hedef Portu | Etkilenen Dosyalar |
| :--- | :--- | :--- | :--- |
| **konvertlab** | 3001 | 3001 | Uyumlu |
| **seoradar** | 3000 | 3002 | `seoradar/package.json`, `seoradar/docker-compose.yml`, root scripts |
| **terneon** | 3002 | 3003 | `terneon/package.json`, `terneon/docker-compose.yml`, root scripts |
| **parselya** | 3003 | 3004 | `parselya/package.json`, `parselya/docker-compose.yml`, root scripts |

### Etkilenen Kök Betikler:
1. `scripts/dev-all.mjs` (L10-15: APPS port tanımları)
2. `scripts/smoke-pages.mjs` (L35-60: APPS port ve mustContain testleri)
3. `qa/health-all.mjs` (L17-21: APPS port array'i)
4. `qa/run-all.mjs` (L37, L65, L94, L118: Her projenin sözleşmesindeki port sabitleri)

**Önemli Not**: Portlar 3001-3004 düzenine geçirildiğinde, `qa/run-all.mjs` ve `smoke-pages.mjs` testlerinin de aynı anda güncellenmesi gerekir; aksi takdirde sözleşme testleri port uyuşmazlığı nedeniyle başarısız olacaktır.

---

## 5. Doğrulama ve Test Sonuçları

Mevcut durumda yerel sistemde çalıştırılan doğrulamalar:
1. **Birim Testleri (`npm test`)**:
   - `terneon`: 3 dosya geçti (`format`, `siteConfig`, `whatsapp` — 50 test başarılı).
   - `parselya`: 3 dosya geçti (`camera`, `format`, `geo` — 58 test başarılı).
2. **Sözleşme Testleri (`node qa/run-all.mjs`)**:
   - 4 uygulama, 78 kontrol maddesinin tamamı PASS.
3. **Üretim Derlemesi (`npm run build`)**:
   - `terneon`: Başarılı (Next.js 15.1.6, 6 sayfa statik prerender).
   - `parselya`: Başarılı (Next.js 15.1.6, 7 sayfa prerender + 1 dinamik API route `/api/parsel`).

---

## 6. Önerilen Uygulama Yol Haritası (Sonraki Adımlar)

1. **Terneon Düzeltmeleri**:
   - `terneon/app/page.tsx` içerisindeki mükerrer `<Header />` ve `<Footer />` kaldırılması.
   - `DemoShowcase.tsx` içindeki Masaüstü/Mobil cihaz simülatörüne 6 sektöre ait zengin ve etkileşimli canlı mock UI bileşenlerinin yerleştirilmesi.
   - Portun 3002'den 3003'e taşınması.
2. **Parselya Geliştirmeleri**:
   - Portun 3003'ten 3004'e taşınması.
   - Harita fayanslarının CORS lekelemesi (tainting) durumunda MediaRecorder güvenliğinin teyidi ve pürüzsüz hata yakalama akışı.
   - Sosyal medya dışa aktarımında ses dalgası görseli yanında arka plan ses dosyası (audio element) ekleme opsiyonu.
3. **Suite Entegrasyonu**:
   - Kök dizindeki `dev-all.mjs`, `health-all.mjs`, `smoke-pages.mjs` ve `qa/run-all.mjs` dosyalarındaki port eşleşmelerinin senkronize edilmesi.
