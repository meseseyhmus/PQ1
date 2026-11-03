# Kapsamlı Proje Gereksinim Dokümanı (PRD) ve Geliştirme Promptları

Bu doküman, tersine mühendislik (reverse engineering) ve modern web teknolojileri kullanılarak geliştirilecek 4 ana projenin teknik gereksinimlerini, gelir modellerini ve AI kodlama asistanlarına (İkizler 4 Argon, Claude Opus/Sonnet, Claude Code vb.) doğrudan kopyalanıp yapıştırılacak **Master (Ana) Promptları** içerir.

---

## ADIM 0: İnceleme Aracına (Figma Make / CLI) Verilecek İlk Komut

Ekranındaki inceleme aracının sorduğu *"İncelemek istediğiniz 4 sitenin adresini yazın..."* sorusuna şu cevabı kopyalayıp yapıştırarak analizi başlatabilirsin:

```text
İncelemek istediğim 4 hedef site ve odaklanılacak noktalar şunlardır:
1. https://seocu.com (veya alternatif SEO analiz araçları) -> SEO analiz formunun gönderdiği ağ (network) istekleri, dönen JSON veri yapısı ve raporlama kartlarının frontend bileşenleri.
2. https://smallpdf.com/pdf-to-txt (veya benzeri TXT/PDF dönüştürücü) -> Dosya yükleme (drag & drop) alanı, tarayıcı içi (client-side) dosya işleme scriptleri ve indirme akışı.
3. https://www.eraslansoftware.com/ -> Sektörel canlı demo vitrini (filtreleme ve önizleme yapısı), interaktif fiyat hesaplama modülünün JavaScript mantığı ve kullanılan CSS/JS animasyon kütüphaneleri.
4. https://emlivo.tr -> Harita/Uydu altlığı (Mapbox, Cesium vb.), ada/parsel sınır çizim (GeoJSON/Canvas) mantığı, kamera animasyonları ve tarayıcı içi video/timeline editörü yapısı.

Bu sitelerin sahibi değilim; amaç tarayıcıya gelen frontend kodlarını, bileşen mimarilerini ve dışarıdan görünen API/veri yapılarını analiz edip raporu oluşturmaktır. Analiz tamamlandığında her biri için kendi bağımsız frontend ve backend'imizi sıfırdan, kendi markalarımızla yazacağız. Lütfen önce bu 4 sitenin analiz raporunu oluştur.
```

---

## Proje 1: Seocu.com Benzeri SEO Analiz ve Gelir Platformu

### 1. Proje Özeti ve Gelir Modeli
* **Amaç:** Kullanıcıların URL girerek site içi (On-Page) ve teknik SEO analizi yapabileceği, kırık linkleri bulabileceği ve PDF rapor alabileceği SaaS platformu.
* **Gelir Modeli:** Günlük ücretsiz analiz limiti (Freemium), Pro abonelik (detaylı analiz + White-Label PDF rapor), AdSense ve Hosting/SEO affiliate linkleri.

### 2. Master AI Kodlama Promptu (Kopyala & Yapıştır)
```text
Sen kıdemli bir Full-Stack Web Geliştiricisi ve SEO Uzmanısın. Bana Next.js (App Router), TypeScript, Tailwind CSS ve Lucide-React ikonları kullanarak "Seocu.com" benzeri, yüksek dönüşümlü ve para kazanmaya hazır bir SEO Analiz SaaS platformu kodla.

Lütfen şu bileşenleri ve dosyaları eksiksiz oluştur:
1. Backend Analiz API'si (`/api/analyze/route.ts`):
   - Kullanıcının gönderdiği URL'nin HTML kaynağını `fetch` ve `cheerio` kullanarak çeksin.
   - Şu metrikleri analiz edip JSON olarak döndürsün:
     * Genel SEO Skoru (0-100 arası ağırlıklı hesaplama)
     * Title etiketi (var mı, karakter uzunluğu ideal mi?)
     * Meta Description (var mı, karakter uzunluğu ideal mi?)
     * Heading yapısı (H1-H6 etiketlerinin sayısı ve içerikleri)
     * Görsel Analizi (Toplam `<img>` sayısı ve `alt` etiketi eksik olanların listesi)
     * Link Analizi (İç linkler, dış linkler ve yanıt vermeyen/kırık link kontrolü)
     * Teknik Kontrol (`robots.txt`, `sitemap.xml`, SSL/HTTPS kontrolü ve Open Graph etiketleri)

2. Frontend Arayüzü (`app/page.tsx` ve alt bileşenler):
   - Hero Bölümü: Dikkat çekici başlık, URL giriş inputu ve "Ücretsiz Analiz Et" butonu.
   - Analiz Sonuç Ekranı:
     * Ortada animasyonlu dairesel başarı skoru (0-100) ve özet istatistikler (Kritik Hatalar, Uyarılar, Başarılı Testler).
     * Her bir SEO metriği için renk kodlu (Yeşil: Başarılı, Sarı: Uyarı, Kırmızı: Hata) detaylı akordeon/kart listesi ve "Nasıl Çözülür?" önerileri.
   - Gelir (Monetizasyon) Özellikleri:
     * "Raporu PDF Olarak İndir (Pro)" butonu (jspdf / html2canvas mantığıyla).
     * Ücretsiz kullanımda bazı ileri düzey teknik detayları bulanıklaştıran (blur) "Pro'ya Yükselt" kilidi.
     * Sayfa altında Aylık/Yıllık Abonelik Fiyatlandırma Tablosu (Ücretsiz, Pro, Ajans paketleri) ve reklam (AdSense) yerleşim alanları.

Kodu modüler, temiz ve doğrudan çalıştırılabilir şekilde ver.
```

---

## Proje 2: Çok Yönlü Doküman Dönüştürücü (TXT <-> PDF vb.) ve YouTube Araçları

### 1. Proje Özeti ve Gelir Modeli
* **Amaç:** Sunucu maliyeti olmadan (doğrudan tarayıcıda) TXT, PDF, Markdown ve Görsel formatlarını birbirine dönüştüren, ayrıca YouTube içerik üreticileri için metin/senaryo araçları sunan yüksek trafikli web aracı.
* **Gelir Modeli:** Yüksek organik arama trafiği üzerinden AdSense geliri, toplu dosya (batch) dönüştürme için Pro üyelik.

### 2. Master AI Kodlama Promptu (Kopyala & Yapıştır)
```text
Sen uzman bir Frontend Mühendisisin. Next.js, Tailwind CSS, `jspdf` ve `pdfjs-dist` kütüphanelerini kullanarak sunucuya dosya yüklemeden %100 tarayıcı içinde (Client-Side) çalışan ultra hızlı bir "Doküman Dönüştürücü ve YouTube Metin Araçları" platformu kodla.

Uygulamada şu modüller ve özellikler yer almalı:
1. Çift Yönlü Dönüştürücü Sekmeleri (Tabs):
   - **TXT to PDF:** Kullanıcının yüklediği `.txt` dosyasını veya doğrudan metin kutusuna yapıştırdığı yazıyı; yazı tipi boyutu, sayfa kenar boşluğu ve hizalama ayarlarıyla Türkçe karakter destekli PDF'e dönüştürüp indirten modül.
   - **PDF to TXT:** Kullanıcının sürükleyip bıraktığı PDF dosyasının içindeki tüm metinleri sayfa sayfa ayıklayan (extract), ekranda düzenlenebilir bir editörde gösteren ve `.txt` olarak indirten modül.
   - **YouTube Araçları Modülü:** YouTube video senaryolarını veya altyazı (SRT/TXT) dosyalarını temiz metne ve PDF e-kitaba/sunuma dönüştüren özel sekme.

2. Kullanıcı Deneyimi (UX) ve Gelir Alanları:
   - Çoklu dosya sürükle-bırak (Drag & Drop) alanı, dosya boyutu göstergesi ve dönüşüm ilerleme çubuğu (Progress Bar).
   - Dönüşüm ekranının sağ/sol ve alt kısımlarında Google AdSense için optimize edilmiş şık reklam banner (placeholder) alanları.
   - "Toplu Dönüştürme (50 Dosyaya Kadar) ve Reklamsız Deneyim" sunan Pro Üyelik modalı.

Tüm dosya okuma ve oluşturma fonksiyonlarını eksiksiz, çalışır JavaScript/TypeScript kodu olarak yaz.
```

---

## Proje 3: Eraslan Software (`eraslansoftware.com`) Benzeri Web Ajans, Canlı Demo ve Abonelik Platformu (Marka: Terneon)

### 1. Proje Özeti ve Gelir Modeli
* **Amaç:** `https://www.eraslansoftware.com/` sitesinin mimarisini tersine mühendislikle baz alarak **Terneon** markası altında; sektörel canlı demoların sergilendiği, müşterinin kendi paketini dinamik olarak hesaplayabildiği animasyonlu web satış ve abonelik platformu.
* **Gelir Modeli:** Sektörel hazır/özel web sitesi satışı, ek özellik modülleri ve aylık bakım/animasyon aboneliği.

### 2. Master AI Kodlama Promptu (Kopyala & Yapıştır)
```text
Elimizde `https://www.eraslansoftware.com/` sitesinin tersine mühendislik analiz çıktıları bulunuyor. Bu sitenin işleyiş mantığını ve bileşen yapısını temel alarak, "Terneon" adında kendi markamıza ait, neon/modern karanlık (dark-mode) temalı, yüksek animasyonlu bir Web Tasarım, Yazılım ve Abonelik Platformu kodla. Next.js, Tailwind CSS ve Framer Motion kullan.

Sitede şu kritik bölümleri birebir işlevsel olarak oluştur:
1. Merkezi Konfigürasyon (`config/siteConfig.ts`):
   - Marka adı ("Terneon"), iletişim bilgileri, WhatsApp numarası, demo projeleri ve fiyatlandırma verileri tek bir dosyadan yönetilsin.

2. Hero ve "Önce Ücretsiz Demo" Vurgusu:
   - Akıcı metin animasyonları, "Önce Ücretsiz Demo, Sonra Ödeme" güven rozetleri, "Canlı Demoları İncele" ve "Fiyat Hesapla" aksiyon butonları.

3. Sektörel Canlı Demo Vitrini (İnteraktif Portfolyo):
   - Kategori filtreleme butonları: Tümü, Sağlık & Klinik, E-Ticaret, Güzellik Merkezi, Otel & Konaklama, Kafe & Restoran, Kurumsal.
   - Her proje kartında: Proje görseli, sektör etiketi, kısa açıklama ve tıklandığında siteyi ekran içinde (Masaüstü/Mobil görünüm seçenekli tam ekran İframe Modal) veya yeni sekmede canlı gezdiren "Canlı Demoyu İncele" butonu.

4. İnteraktif Fiyat ve Abonelik Hesaplama Modülü (Çok Önemli):
   - Adım 1 (Temel Hizmet Seçimi): Kurumsal Web Sitesi (12.000 TL), E-Ticaret Paketi (20.000 TL), Özel Web Uygulaması (30.000 TL).
   - Adım 2 (Ek Özellik Checkbox'ları): Yönetim Paneli (+3.000 TL), İleri Düzey SEO Paketi (+3.000 TL), Çoklu Dil Desteği (+2.500 TL), Yapay Zeka Chatbot (+4.000 TL), Özel GSAP/3D Animasyon Paketi (+5.000 TL).
   - Adım 3 (Bakım & Sunucu Aboneliği): Aylık veya Yıllık abonelik seçimi.
   - Sağ tarafta yapışkan (sticky) "Özet Sepet": Seçilen kalemleri anlık toplayan ve "Bu Paketle WhatsApp'tan Teklif Al / Ücretsiz Demo İste" butonuna basıldığında tüm seçimleri otomatik mesaj metnine dönüştüren yapı.

Tüm bileşenleri Framer Motion geçişleriyle, kusursuz ve modern bir UI ile kodla.
```

---

## Proje 4: Emlivo.tr Benzeri Arsa & Parsel Video Animasyon Editörü

### 1. Proje Özeti ve Gelir Modeli
* **Amaç:** `emlivo.tr` sitesinin tersine mühendislik analizini temel alarak; emlakçıların ada/parsel bilgisiyle uydu haritası üzerinde arsa sınırlarını otomatik çizdiği, kamera yakınlaştırma (zoom/orbit) animasyonu ve bilgi etiketleri ekleyip sosyal medya (Reels/TikTok) videosu ürettiği web tabanlı video editörü.
* **Gelir Modeli:** Aylık kredi/abonelik sistemi ile filigransız (no-watermark) HD/4K emlak videosu dışa aktarma.

### 2. Master AI Kodlama Promptu (Kopyala & Yapıştır)
```text
`emlivo.tr` sitesinin çalışma mantığını tersine mühendislik ile analiz ettik. Buna dayanarak gayrimenkul danışmanları ve arsa satıcıları için tarayıcı tabanlı bir "Arsa & Parsel Video Animasyon Editörü" web uygulaması kodla. Next.js, Tailwind CSS, Lucide-React ve harita/animasyon için HTML5 Canvas / Mapbox GL JS mimarisini kullan.

Arayüzü profesyonel bir karanlık mod (dark-mode) video editörü (CapCut / Remotion Studio tarzı) olarak 4 ana bölgede tasarla:

1. Sol Panel (Veri ve Katman Yönetimi):
   - Sekme 1 (Tapu / Parsel Sorgu): İl, İlçe, Mahalle, Ada ve Parsel numarası giriş alanları + "Parseli Haritada Bul ve Çiz" butonu (veya dışarıdan KML/GeoJSON yükleme).
   - Sekme 2 (Bilgi Etiketleri / Overlays): Harita üzerine eklenecek animasyonlu rozetler (Arsa m², Fiyat, İmar Durumu, "Yola Cephe", "Denize 500m" gibi mesafe çizgileri).
   - Sekme 3 (Stil & Kamera): Parsel sınır çizgisi rengi (Neon Yeşil, Altın Sarısı, Kırmızı), dolgu opaklığı ve Kamera Hareketi seçimi (Uzaydan Yakınlaşma / Zoom-In, 360 Derece Etrafında Dönüş / Orbit).

2. Orta Alan (Canlı 3D Uydu & Canvas Önizleme Sahnesi):
   - 9:16 (Reels/Shorts/TikTok) veya 16:9 (YouTube) en-boy oranı seçicisi.
   - Uydu görüntüsü üzerinde parlayan neon parsel sınırlarını, parselin ortasından çıkan animasyonlu bilgi kartlarını (callouts) ve kamera yakınlaşma efektini simüle eden etkileşimli Canvas/Harita sahnesi.
   - Oynat / Duraklat (Play/Pause), Baştan Oynat ve saniye göstergesi.

3. Alt Panel (Zaman Çizelgesi - Timeline):
   - 0 ile 15 saniye arasında kamera hareketi katmanı, parsel sınır çizim animasyonu katmanı, metin etiketlerinin giriş-çıkış zamanları ve arka plan müziği ses dalgası katmanı.

4. Üst Bar (Markalama, Kredi ve Dışa Aktarma):
   - Kendi marka logomuz, kullanıcının kalan video üretim kredisi (Örn: "3 Kredi Kaldı - Paket Yükselt") ve Canvas sahnesini kaydedip indirmeyi sağlayan "Videoyu Dışa Aktar (MP4 Render)" butonu.

Tüm state yönetimini (ada/parsel verisi değiştiğinde veya renk/metin güncellendiğinde ortadaki önizleme sahnesinin anında güncellenmesi) eksiksiz ve çalışır şekilde kodla.
```