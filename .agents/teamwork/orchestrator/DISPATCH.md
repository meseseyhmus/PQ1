## 2026-11-02T14:18:41Z
Lütfen aşağıdaki onaylanmış görev tanımı doğrultusunda derhal uygulamaya geçin:

HEDEF: 
`c:\Users\HUAWEI\Desktop\saas` içerisindeki 4 SaaS projesini (`parselya`, `seoradar`, `konvertlab`, `terneon`), `d_rt_proje_i_in_kapsaml_prd_ve_prompt_dok_man.md` belgesindeki PRD standartlarına göre eksiksiz, hatasız, modern ve tam fonksiyonel çalışan birer prodüksiyon uygulamasına dönüştürün.

GÖREVLER:
1. `parselya` (Port 3004):
   - Emlak/arsa video animasyon oluşturucu (Emlivo / Remotion kalitesinde).
   - Canvas animasyon zaman çizelgesi, kamera açıları (zoom-in, orbit), POI mesafe çizgileri.
   - Google Maps Satellite & Esri HD uydu fayansları tabanı, kullanıcının yerel drone/arsa fotoğrafı yüklemesi (`FileReader` -> canvas), TKGM Megsis API kadastro sorgu motoru (`/api/parsel`).
   - Video dışa aktarma (Client-side MediaRecorder / Canvas recording ile WebM/MP4 indirme).

2. `seoradar` (Port 3002):
   - Seocu / Ahrefs ayarında SEO denetim ve analiz aracı.
   - Derinlemesine HTML/Teknik analiz, Core Web Vitals (LCP, CLS, FID), başlık hiyerarşisi, kırık link tespiti, güvenlik başlıkları.
   - Detaylı PDF rapor indirme, rakip karşılaştırma sekmesi.
   - Kurumsal ajans teklif modalı (`AgencyContactModal`) ve WhatsApp doğrudan iletişim akışı.

3. `konvertlab` (Port 3001):
   - Smallpdf / ILovePDF kalitesinde dosya & PDF dönüştürücü.
   - PDF -> Word (DOCX), Excel, Görsel; Görsel -> PDF, WebP dönüştürücü.
   - Toplu işlem (Batch Pro) ile çoklu dosya sürükle-bırak ve ZIP arşivi indirme.
   - Tesseract.js istemci taraflı OCR metin çıkarma.

4. `terneon` (Port 3003):
   - Awwwards seviyesinde interaktif Cyberpunk/Neon dijital ajans landing page'i.
   - Dinamik neon parçacık ve ızgara canvas arka planı.
   - İnteraktif cihaz simülatörü (Masaüstü / Mobil canlı önizleme).
   - Anlık paket & fiyat hesaplayıcı, WhatsApp doğrudan teklif oluşturucu.

Lütfen kodları inceleyin, test edin, eksiklikleri giderin ve tüm projelerin hatasız derlenip çalıştığından emin olun. Doğrudan yürütmeye başlayın.

Working directory: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\
Original Request Record: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
PRD Document: c:\Users\HUAWEI\Desktop\saas\d_rt_proje_i_in_kapsaml_prd_ve_prompt_dok_man.md
Identity: Project Orchestrator (teamwork_orchestrator)


## 2026-11-02T15:14:51Z
URGENT DIRECTIVE FROM USER:
The user explicitly demands immediate, visible, production-grade frontend & core feature implementation across all 4 projects. They do NOT want any more time spent on infrastructure/dockers/configuration audits.

Immediately conclude/fast-track Milestone 0 and dispatch parallel workers across all 4 projects:
1. Parselya: Canvas render, video export (MediaRecorder/WebM), Google/Esri satellite tiles, TKGM API querying.
2. SeoRadar: Core Web Vitals, in-depth SEO analysis, PDF report download, AgencyContactModal & WhatsApp flow.
3. KonvertLab: PDF/Image/Word/Excel conversion pipelines, client-side Tesseract.js OCR, Batch Pro ZIP download.
4. Terneon: Live device simulator (Desktop/Mobile), neon canvas background, interactive price/package calculator.

Spawn workers immediately to implement these features directly in the codebases. Updated in ORIGINAL_REQUEST.md.


## 2026-11-02T15:21:07Z
NEW USER DIRECTIVE FOR PARSELYA (Port 3004):
The user provided a concrete reference repository for TKGM kadastro API integration:
Repository: https://github.com/okansafak/qgistkgmplugin
This QGIS plugin accesses TKGM cadastral data.
Immediately instruct worker `worker_parselya` (`13508152`) to use the API patterns, TKGM endpoint URLs, and query parameters from this repo in Parselya's `/api/parsel` endpoint to fetch real cadastral parcel data.

Recorded in ORIGINAL_REQUEST.md.


## 2026-11-03T08:08:27Z
ajanlara böl işleri ve kodlamaya başla

Kullanıcı Direktifleri ve Önceki Bağlam:
- "arka planlar kendi den ekleme yap parsel kısmına google maps ve parsel sorgu kısımından apı al ve diğer projeleri de aynı şekilde eksikliklerini tamamla githuptan örnek projelere bak ve düzelt"
- "https://github.com/okansafak/qgistkgmplugin 4. PROJE İÇİN BUNU KULLAN"
- Onaylanan Uygulama Planı: `C:\Users\HUAWEI\.gemini\antigravity\brain\6815d714-faf7-4642-bf32-a87b8c77c112\production_perfection_plan.md`

Dört SaaS Projesinin Kapsamı:
1. KonvertLab (Port 3001): Smallpdf / ILovePDF kalitesinde dosya dönüştürücü (Word, Excel, WebP, Tesseract.js OCR, Batch Pro ZIP indirme, hızlı örnek test butonları).
2. SeoRadar (Port 3002): Seocu.com / Ahrefs seviyesinde SEO denetimi (Core Web Vitals puan kartları, HTTP güvenlik başlıkları, rakip kıyaslama matrisi, filigranlı/filigransız PDF rapor indirme, hızlı örnek site test butonları, WhatsApp ajans teklifi).
3. Terneon (Port 3003): Awwwards seviyesinde neon web ajansı (6 sektör şablonlu Masaüstü/Mobil cihaz simülatörü, dinamik neon parçacık canvas'ı, canlı WhatsApp teklif terminali içeren fiyat hesaplayıcı).
4. Parselya (Port 3004): Emlivo / Remotion kalitesinde parsel video motoru (qgistkgmplugin referanslı canlı TKGM CBS idari yapı sorgusu il/ilce/mahalle/ada/parsel, Google Maps ve Esri HD uydu katmanları, drone görsel yükleme, kamera animasyonları ve MediaRecorder video indirme).

Tüm projeler derlenmeli (`npm run build`), tüm testler yeşil olmalı ve belirtilen portlarında (3001, 3002, 3003, 3004) sorunsuz çalışmalıdır.


## 2026-11-03T08:19:11Z
[CRITICAL USER UPDATE - REFERENCE SITES AND DESIGNS]
The user/caller provided exact benchmark reference designs that must be incorporated into the implementations:

1. **Parselya (Port 3004)**:
   - Benchmark: `https://parselsorgu.pro/`
   - Left Sidebar:
     - Search boxes: City/District/Neighborhood search + Ada/Parsel inputs + "Sorgula" button.
     - Large title: e.g. `174 / 1`, `Arsa · 2.443 m²`, `Akçatarla, Nusaybin, Mardin`.
     - Purpose Pills ("Bu parsele neden bakıyorsunuz?"): `Emlakçıyım`, `Benim`, `Almak istiyorum`.
     - Tags: `Akarsu`, `Çevre Düzeni Planı`, `e-Plan`, `Plan Analizi [yeni]`.
     - Tabs: `Özet`, `Plan`.
     - Attribute Table: Nitelik, Mevkii, Pafta.
     - "HARİTADA GÖSTER: Kenar uzunlukları (Her kenarın uzunluğu haritaya yazılır)" toggle.
     - Action Buttons: `Piyasa`, `Uçuş (Animasyonlu Video Uçuşu)`, `Paylaş`, `PDF`.
   - Right Map Area:
     - Fullscreen HD satellite map.
     - Parcel polygon with blue/neon border + floating center badge (`174/1 · 2.443 m² Arsa`).
     - Map controls: layer selector (Uydu / Hibrit / Harita), zoom (+ / -), compass.

2. **Terneon (Port 3003)**:
   - Benchmark: `https://www.eraslansoftware.com/`
   - Editorial Typography & Copy:
     - Tag: "Tasarım ve yazılım stüdyosu, İstanbul"
     - Headline: "İşletmenize özel. Her ayrıntısıyla."
     - Subheadline: "Web siteleri, mobil uygulamalar ve işinizi kolaylaştıran yazılımlar geliştiriyoruz. İlk fikirden yayına, birlikte."
     - CTA Buttons: `Projeleri incele ↓` (dark pill) & `Fiyat hesapla ↗` (light rounded).
     - Trust badges: `✓ Size özel tasarım   ✓ Önce ücretsiz demo   ✓ Doğrudan iletişim`.
   - Showcase (Right):
     - Top: Safari/Browser window mockup (`... Saklı Cave House ↗`).
     - Bottom-right overlay: Sleek iPhone frame mockup overlapping the desktop browser!
     - Footer: Project name, category, and `03 / 06` pagination arrows (`<` `>`).

3. **KonvertLab (Port 3001)**:
   - Benchmark Repo: `https://github.com/orkunisitmak/nashi-app`
   - Ultra-fast, clean, drag-and-drop tool suite: PDF/Word/Excel/Image/OCR and QR code tools.


## 2026-11-03T08:53:56Z
Parselya https://parselsorgu.pro/, Terneon https://www.eraslansoftware.com/, https://github.com/orkunisitmak/nashi-app KonvertLab projesini referans al ajanlara bölüp bana @[c:\Users\HUAWEI\Desktop\saas\rea] 

3 SAAT BOYUNCA KESİNTİSİZ GELİŞTİRME VE TAM BİTMİŞ ÜSTÜN KALİTEDE TESLİMAT TALİMATI:

Tüm 4 SaaS uygulamasının referanslara %100 sadık kalarak, en ufak bir eksik veya taklit olmadan, eksiksiz çalışan kodlarla donatılması:

1. Parselya (Port 3004): https://parselsorgu.pro/ referansı
- Sol kenar çubuğu (Sidebar):
  * Üst marka başlığı: P ikonu, ParselSorgu.Pro, Nasıl kullanılır? modalı, Giriş butonu
  * Arama çubuğu: "📍 Akçatarla Nusaybin / Mardin" temizleme butonlu arama alanı
  * Hızlı Ada / Parsel kutuları: "174", "1", "Sorgula" butonu, altında "👆 ya da haritadan seçin"
  * Seçili parsel kartı: Üst ikon araçları (Odakla, Kaydet, Kopyala, Temizle, Kapat), büyük mavi "174 / 1" başlığı, "● Arsa · 2.443 m²" alt başlığı, "Akçatarla, Nusaybin, Mardin" konum satırı
  * Kullanıcı amacı seçici ("Bu parsele neden bakıyorsunuz?"): Krem/bej kart arkalığı, "Emlakçıyım", "Benim", "Almak istiyorum" hap butonları
  * Etiketler: "● Akarsu", "● Çevre Düzeni Planı", "● e-Plan", "⊞ Plan Analizi" (kırmızı 'yeni' rozetli)
  * Sekmeler: "Özet", "Plan ●"
  * Parsel tablosu: Nitelik: Arsa ⓘ, Mevkii: Nusaybin Yolu, Pafta: N46d19b2c, Alan: 2.443 m²
  * Haritada Göster kartı: "Kenar uzunlukları" switch'i (Her kenarın uzunluğu haritaya yazılır)
  * Sabit alt çubuk: "Piyasa 🪙 1" (₺4.886.000 değerleme modalı), "▶ Uçuş" (3D uçuş animasyonu ve MP4/Reels video export), "📤 Paylaş" (kopyalama & paylaşım modalı), "📄 PDF" (resmi kadastro föyü PDF indirme)
- Sağ Harita Alanı:
  * Parselin merkezinde yüzen 4 satırlı kart: 174/1 \n 2.443 m² \n Arsa \n Akçatarla, Nusaybin / Mardin
  * Kenar uzunlukları haritada poligon kenarları boyunca metre cinsinden rozetlerle çizilir (örn: 48.2 m)
  * Canlı TKGM CBS Megsis API entegrasyonu (ilListe -> ilceListe -> mahalleListe -> parsel/{mahalleId}/{ada}/{parsel})
  * Sağ üstte [Harita] [Katmanlar], sağ dikeyde pusula, GPS ve zoom butonları

2. Terneon (Port 3003): https://www.eraslansoftware.com/ referansı
- Üst Menü: <E> Eraslan Software / <T> Terneon Studio, Çalışmalar, Demolar, Hizmetler, Süreç, Sorular, İletişim, EN, karanlık mod ikonu, "Teklif al" siyah hap butonu
- Hero Sol: "— Tasarım ve yazılım stüdyosu, İstanbul", "İşletmenize özel. Her ayrıntısıyla.", "Web siteleri, mobil uygulamalar ve işinizi kolaylaştıran yazılımlar geliştiriyoruz. İlk fikirden yayına, birlikte.", [Projeleri incele ↓], [Fiyat hesapla ↗], "✓ Size özel tasarım  ✓ Önce ücretsiz demo  ✓ Doğrudan iletişim"
- Hero Sağ Vitrin: macOS Safari penceresi (Saklı Cave House Kapadokya mağara oteli, Dokuz oda, oda kartları) + sağ altta üst üste binen iPhone mobil çerçevesi (canlı mobil site, oda seçimi)
- Karusel: Saklı Cave House / Kapadokya Mağara Oteli, < 01 / 06 > sayfalama, önceki/sonraki oklar (6 sektör: Turizm, Sağlık, E-Ticaret, Kafe, SaaS, Lüks Otomotiv)
- Alt etiketler: "Web sitesi / E-ticaret / Mobil uygulama / Özel yazılım"
- Çerez tercihiniz modalı ("Reddet", "Kabul et")
- Fiyat hesaplama terminali ve doğrudan WhatsApp teklif dökümü

3. KonvertLab (Port 3001): https://github.com/orkunisitmak/nashi-app referansı
- %100 istemci taraflı gizlilik
- 1-tık örnek test dosyaları ("Örnek Dosya ile Dene" butonları)
- WebP tasarruf kaydıracı ve boyut simülatörü
- Türkçe Tesseract.js OCR motoru
- Çoklu dosya Batch Pro ZIP arşivi
- İstemci taraflı QR kod üretici

4. SeoRadar (Port 3002):
- 1-tık hazır demo site denetimleri (Trendyol, Hepsiburada, GitHub)
- Google PageSpeed radyal Core Web Vitals kartları (LCP, CLS, FID, INP)
- Nginx, Apache, Next.js güvenlik başlığı kod parçacıkları
- Kurumsal çok sayfalı PDF denetim raporu
- Ajans WhatsApp teklif modalı

Tüm projeler tsc --noEmit, qa/run-all.mjs (86 sözleşme), npm run test:all (373 test) ve Next.js prodüksiyon derlemesini (node scripts/build-all.mjs --skip-install) eksiksiz geçmeli ve 3001, 3002, 3003, 3004 portlarında canlı çalışmalıdır. Tersine mühendislik için c:\Users\HUAWEI\Desktop\saas\rea dizinindeki araçlardan faydalanabilirsiniz.
