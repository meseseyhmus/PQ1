# Kapsamlı Proje Gereksinim Dokümanı (PRD) ve Geliştirme Promptları

Bu doküman, tersine mühendislik (reverse engineering) ve modern web teknolojileri kullanılarak geliştirilecek 4 ana projenin teknik gereksinimlerini, gelir modellerini ve AI kodlama asistanlarına (Claude Code, İkizler 4 Argon vb.) verilecek hazır başlangıç promptlarını içerir.

---

## Proje 1: Seocu.com Benzeri SEO Analiz ve Gelir Platformu

### 1. Proje Özeti ve Amacı
Kullanıcıların web sitelerinin SEO uyumluluğunu analiz edebileceği, eksik yönlerini raporlayabileceği ve iyileştirme önerileri alabileceği otomatik bir SaaS (Software as a Service) platformu oluşturmak.

### 2. Temel Özellikler (MVP)
* **Site İçi (On-Page) SEO Analizi:** Başlık (Title), Meta Açıklama, H1-H6 etiketleri, görsel ALT etiketleri ve anahtar kelime yoğunluğu kontrolü.
* **Teknik SEO Kontrolü:** `robots.txt`, `sitemap.xml`, SSL durumu, sayfa yüklenme hızı (PageSpeed API entegrasyonu) ve mobil uyumluluk testi.
* **Kırık Link (Broken Link) Tarayıcı:** Sayfa içindeki çalışmayan iç ve dış bağlantıları tespit etme.
* **PDF Raporlama:** Analiz sonuçlarını markalı (white-label) PDF olarak indirme (Ücretli özellik).

### 3. Tersine Mühendislik ve Teknik Yaklaşım
* Hedef sitelerin (ör. seocu.com vb.) frontend ağ (network) istekleri incelenerek hangi metrikleri nasıl sunduğu analiz edilir.
* **Backend:** Python (FastAPI veya BeautifulSoup/Playwright ile web scraping) ya da Node.js (Cheerio/Puppeteer).
* **Frontend:** React / Next.js ve Tailwind CSS (hızlı ve SEO uyumlu arayüz).

### 4. Gelir Modeli (Monetizasyon)
* **Freemium:** Günlük 3 ücretsiz temel analiz.
* **Pro Abonelik:** Detaylı teknik analiz, rakip analizi ve PDF rapor indirme.
* **Reklam & Affiliate:** Google AdSense ve SEO/Hosting firmalarının satış ortaklığı linkleri.

### 5. AI Kodlama Promptu (Kopyala & Yapıştır)
> **Prompt:** "Bana Next.js (App Router), Tailwind CSS ve Node.js (Cheerio kütüphanesi) kullanarak 'Seocu.com' benzeri modern bir SEO analiz web uygulaması kurgula. Kullanıcı ana sayfada bir URL girdiğinde, arka planda bu URL'nin HTML kaynağını çekip; Title, Meta Description, H1-H6 sayıları, resimlerin ALT etiket durumu ve kırık linkleri analiz eden bir API endpoint'i (`/api/analyze`) yaz. Sonuçları dairesel bir başarı skoru (0-100) ve altında kategorize edilmiş (Başarılı, Uyarı, Hata) şık kartlarla göster. Ayrıca sonuçları PDF olarak indirme butonu ve Pro üyelik fiyatlandırma tablosu ekle."

---

## Proje 2: Çok Yönlü Doküman Dönüştürücü (TXT <-> PDF vb.) ve İçerik Araçları

### 1. Proje Özeti ve Amacı
Kullanıcıların farklı dosya formatlarını (TXT, PDF, DOCX, Görsel) birbirine hızlıca dönüştürebileceği, aynı zamanda YouTube içerik üreticileri için metin/doküman tabanlı yardımcı araçlar sunan yüksek trafikli bir web aracı.

### 2. Temel Özellikler (MVP)
* **Çift Yönlü Dönüşüm:** TXT to PDF, PDF to TXT, Word to PDF, Görselden Metne (OCR).
* **Toplu İşlem (Batch Processing):** Birden fazla dosyayı aynı anda yükleyip dönüştürme.
* **Tarayıcı İçi İşleme (Client-Side):** Sunucu maliyetini düşürmek için basit dönüşümlerin doğrudan tarayıcıda (WebAssembly / JS kütüphaneleri ile) yapılması.

### 3. Tersine Mühendislik ve Teknik Yaklaşım
* Popüler dönüştürücü sitelerin kullandığı açık kaynaklı kütüphaneler ve istemci tarafı (client-side) işleme mantıkları incelenir.
* **Kütüphaneler:** `pdf-lib`, `jspdf`, `pdfjs-dist` (tarayıcı tabanlı), Python `PyMuPDF` veya `pdf2docx` (sunucu tabanlı ağır işlemler için).

### 4. Gelir Modeli (Monetizasyon)
* Yüksek organik trafik üzerinden reklam geliri (AdSense).
* Dosya boyutu sınırı kaldırma ve reklamsız kullanım için mikro abonelik.

### 5. AI Kodlama Promptu (Kopyala & Yapıştır)
> **Prompt:** "React ve Tailwind CSS kullanarak tamamen tarayıcı tabanlı çalışan modern bir 'Doküman Dönüştürücü' (TXT to PDF, PDF to TXT, Markdown to PDF) web uygulaması oluştur. Kullanıcıların dosyalarını sürükleyip bırakabileceği (drag-and-drop) şık bir alan tasarla. `jspdf` ve `pdfjs-dist` kütüphanelerini kullanarak sunucuya dosya yüklemeden (client-side) TXT dosyalarını PDF'e, PDF dosyalarını ise düzenlenebilir metne (TXT) çeviren fonksiyonları yaz. Dönüşüm tamamlandığında otomatik indirme butonu çıksın. Arayüz hızlı, reklama uygun boşluklara sahip ve mobil uyumlu olsun."

---

## Proje 3: Eraslan Software (`eraslansoftware.com`) Benzeri Web Sitesi Geliştirme, Canlı Demo ve Satış Platformu (Terneon)

### 1. Proje Özeti ve Amacı
`https://www.eraslansoftware.com/` sitesinin yapısı tersine mühendislik aracıyla incelenip kendi markamız (**Terneon**) altında yeniden markalanarak (rebranding); farklı sektörler için hazırlanan web sitelerinin canlı demolarla sergilendiği, müşterilerin kendi paketlerini ve ek özelliklerini seçerek anında fiyat hesaplayabildiği, animasyonlu ve abonelik/satış odaklı bir yazılım stüdyosu platformu kurmak.

### 2. Temel Özellikler (MVP)
* **Sektörel Canlı Demo Vitrini (İnteraktif Kartlar):** Sağlık, E-Ticaret, Güzellik, Otelcilik, Kafe/Restoran, Diş Hekimliği gibi kategorilere göre filtrelenebilen, yatay kaydırmalı ve tıklanıldığında siteyi canlı önizleme (iframe/modal veya yeni sekme) olarak gezdirmeyi sağlayan portfolyo vitrini.
* **İnteraktif Fiyat Hesaplama Modülü:** Kullanıcının temel site tipini (Kurumsal Web, E-Ticaret, Mobil Uygulama, Özel Yazılım) seçip üzerine Yönetim Paneli, Çoklu Dil, Yapay Zeka Asistanı, İleri Düzey SEO gibi ek özellikleri işaretleyerek anlık fiyat/abonelik tutarını hesaplayabildiği dinamik modül ve WhatsApp/Teklif bağlantısı.
* **"Önce Ücretsiz Demo" ve Abonelik Akışı:** Müşteriye önce ücretsiz demo sunma vaadi ve teslim sonrası yıllık/aylık bakım, sunucu ve animasyon abonelik paketleri.
* **Akıcı Animasyonlar:** Sayfa geçişleri, yatay kaydırmalı kartlar ve mikro etkileşimler.

### 3. Tersine Mühendislik ve Teknik Yaklaşım
* Mevcut inceleme aracınla `https://www.eraslansoftware.com/` adresinin frontend bileşenleri, DOM hiyerarşisi, kullanılan CSS/JS animasyon kütüphaneleri (Framer Motion, GSAP, Swiper vb.) ve fiyat hesaplama mantığı dışa aktarılır.
* Elde edilen yapı temizlenerek **Terneon** marka kimliği, neon/modern tasarım dili ve kendi iletişim/ödeme kanallarımızla yeniden derlenir.

### 4. Gelir Modeli (Monetizasyon)
* Sektörel hazır veya özel web sitesi, e-ticaret ve mobil uygulama satışı.
* Ek modül satışları (Yönetim paneli, SEO paketi, AI entegrasyonu).
* Aylık/Yıllık sunucu, bakım ve animasyon güncelleme abonelikleri.

### 5. AI Kodlama Promptu (Kopyala & Yapıştır)
> **Prompt:** "Elimizde incelediğimiz `https://www.eraslansoftware.com/` sitesinin frontend analiz çıktıları var. Bu yapıyı temel alarak 'Terneon' adında, kendi markamıza ait modern ve animasyonlu bir Web Tasarım, Yazılım ve Demo Satış platformu kodla. Sitede şu kritik bölümler mutlaka yer alsın:
> 1. Sektörlere göre filtrelenebilen (Tümü, Sağlık, E-Ticaret, Güzellik, Konaklama, Kafe vb.) ve kullanıcıların karta tıklayıp canlı demoyu doğrudan gezebileceği interaktif 'Çalışmalar / Canlı Demolar' vitrini.
> 2. Kullanıcının hizmet türünü (Web Sitesi, E-Ticaret, Mobil Uygulama) ve ek özellikleri (Yönetim Paneli +3.000 TL, İleri Düzey SEO +3.000 TL, Çoklu Dil, Yapay Zeka Asistanı) seçerek anlık bütçe çıkarabildiği interaktif 'Fiyat Hesapla' bileşeni ve seçilen paketi doğrudan WhatsApp/Teklif formuna aktaran buton.
> 3. Aylık abonelik ve bakım paketleri tablosu.
> Framer Motion ve Tailwind CSS kullanarak akıcı animasyonlar ekle. Tüm marka isimlerini, fiyatları ve demo linklerini tek bir `siteConfig.js` dosyasından yönetilebilir şekilde modüler kurgula."

---

## Proje 4: Emlivo.tr Benzeri Arsa & Parsel Video Animasyon Editörü

### 1. Proje Özeti ve Amacı
Emlakçılar, arsa yatırımcıları ve gayrimenkul firmaları için; il, ilçe, mahalle, ada ve parsel bilgilerini girerek harita/uydu görüntüsü üzerinde parsel sınırlarını otomatik çizen, üzerine fiyat/özellik etiketleri ekleyip bunu sosyal medyada (Reels, TikTok, YouTube Shorts) paylaşılabilir 3D/2D animasyonlu bir videoya dönüştüren web tabanlı video editörü.

### 2. Temel Özellikler (MVP)
* **Ada/Parsel Sorgulama ve Harita Çizimi:** Girilen parsel verisine (veya yüklenen KML/GeoJSON dosyasına) göre uydu haritası üzerinde arsa sınırlarını parlak çizgilerle otomatik belirleme.
* **Kamera Animasyonu (Zoom & Orbit):** Uzaydan/yukarıdan arsaya doğru yaklaşan (zoom-in) ve parsel etrafında dönen sinematik kamera hareketi.
* **Bilgi Kartları ve Etiketler (Overlays):** Arsa metrekaresi, fiyatı, yola/denize mesafesi gibi bilgileri animasyonlu metin kutularıyla harita üzerine sabitleme.
* **Tarayıcı İçi Video Editörü (Timeline):** Yazıların giriş-çıkış zamanlarını ayarlama, arka plan müziği ekleme ve MP4 formatında çıktı (render) alma.

### 3. Tersine Mühendislik ve Teknik Yaklaşım
* `emlivo.tr` sitesinin tarayıcıya gelen frontend kodu ve ağ (network) istekleri analiz edilerek harita altlığı için hangi servisi (Mapbox GL JS, CesiumJS, Google Maps 3D veya Leaflet) ve video oluşturmak için hangi teknolojiyi (Remotion, HTML5 Canvas CaptureStream veya FFmpeg.wasm) kullandığı tespit edilir.
* Tespit edilen mimari klonlanıp yeniden adlandırılarak (rebranding) kendi sunucumuzda ayağa kaldırılır.

### 4. Gelir Modeli (Monetizasyon)
* **Kredi / Abonelik Sistemi:** Emlak ofisleri için aylık belirli sayıda (ör. 10, 50, Sınırsız) filigransız (no-watermark) HD/4K video üretme paketleri.

### 5. AI Kodlama Promptu (Kopyala & Yapıştır)
> **Prompt:** "Emlivo.tr benzeri, gayrimenkul ve arsa satışı yapanlar için 'Arsa/Parsel Video Animasyon Editörü' web uygulaması geliştiriyoruz. Arayüzü modern bir video editörü (sol tarafta Ada/Parsel/Metrekare/Fiyat giriş paneli, ortada canlı 3D uydu haritası/Canvas önizleme ekranı, altta ise zaman çizelgesi - timeline) şeklinde tasarla. Harita üzerinde seçilen parselin sınırlarını neon çizgilerle çizen, kamerayı yukarıdan parsele doğru sinematik olarak yakınlaştıran (Mapbox GL JS veya Three.js/Canvas mantığıyla) ve arsa bilgilerini animasyonlu etiketler olarak ekrana getiren yapıyı kurgula. Sağ üstte 'Videoyu Dışa Aktar (MP4)' butonu ve kullanıcı kredi bakiyesi yer alsın."

---

## Uygulama ve Başlangıç Yol Haritası (Adım Adım)

1. **Analiz Aracını Çalıştırma:** Bilgisayarındaki inceleme aracına (Figma Make / CLI aracın) hedef sitelerin (`seocu.com`, `eraslansoftware.com`, `emlivo.tr` vb.) adreslerini vererek frontend ve API yapılarını dışa aktar.
2. **Model Seçimi:** Kodlama asistanında **İkizler 4 Argon** veya **Claude Opus/Sonnet** modelini seç.
3. **Adım Adım İnşa:** Yukarıdaki her bir projenin altında yer alan **"AI Kodlama Promptu"** kısmını kopyalayıp, analiz aracının çıkardığı raporla birlikte asistana yapıştırarak kodlamayı başlat.