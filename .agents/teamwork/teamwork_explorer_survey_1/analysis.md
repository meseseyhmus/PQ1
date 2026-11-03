# KonvertLab & SeoRadar Kapsamlı Durum ve Gereksinim Analiz Raporu

**Tarih**: 2026-11-02  
**Araştırmacı**: Teamwork Explorer (Survey Agent 1)  
**Hedef Kapsam**:
1. `konvertlab` (Port 3001) — Smallpdf / ILovePDF Kalitesinde Dosya & PDF Dönüştürücü
2. `seoradar` (Port 3002) — Seocu / Ahrefs Ayarında SEO Denetim ve Analiz Aracı

---

## 1. Yönetici Özeti (Executive Summary)

Bu araştırma, `saas` kök dizini altındaki `konvertlab` ve `seoradar` projelerinin mevcut kod tabanlarını, mimari yapılarını, bağımlılıklarını, port konfigürasyonlarını ve PRD dokümanı (`d_rt_proje_i_in_kapsaml_prd_ve_prompt_dok_man.md` ve `PRD.md`) ile kullanıcı gereksinimlerine göre eksikliklerini ortaya koymak üzere yürütülmüştür.

### Temel Bulgular:
1. **Derleme & Test Durumu**:
   - `konvertlab`: Birim testleri geçiyor (3 dosya, 53 test: 53/53 passed). Next.js 15.1.6 üretim derlemesi (`npm run build`) **başarılı** (25.3 sn).
   - `seoradar`: Birim testleri geçiyor (4 dosya, 86 test: 86/86 passed). Next.js 15.1.6 üretim derlemesi (`npm run build`) **başarılı** (20.8 sn).

2. **Kritik Port Uyuşmazlığı**:
   - Kullanıcı Görev Tanımı: `konvertlab` = **Port 3001**, `seoradar` = **Port 3002**, `terneon` = **Port 3003**, `parselya` = **Port 3004**.
   - Mevcut Kod Tabanı (`scripts/dev-all.mjs`, `docker-compose.yml`, `seoradar/package.json`): `seoradar` = **Port 3000**, `konvertlab` = **Port 3001**, `terneon` = **Port 3002**, `parselya` = **Port 3003**.
   - `seoradar`'ın portu 3000'den 3002'ye çekilmeli ve suite genelindeki `dev-all.mjs`, `docker-compose.yml`, `build-all.mjs`, `status.mjs` scriptleri güncellenmelidir.

3. **KonvertLab Eksiklikleri**:
   - **Eksik Dönüştürücüler**: PDF -> Word (DOCX), PDF -> Excel (XLSX), PDF -> Görsel (PNG/JPG), Görsel -> WebP dönüşüm modülleri henüz bulunmamaktadır.
   - **Tesseract.js OCR**: İstemci taraflı optik karakter tanıma (OCR) kütüphanesi ve arayüzü entegre edilmemiştir. Hatta `components/PdfToTxtPanel.tsx` içerisinde *"Taranmış (görsel) PDF'lerden metin çıkarılamaz"* uyarısı yer almaktadır.
   - **Batch Pro & ZIP İndirme**: `components/BatchConvertPanel.tsx` yalnızca `.txt,.md` kabul etmekte ve çıktıları sırayla tek tek indirmektedir. Çoklu format desteği ve `jszip` ile tek tıklamayla ZIP arşivi indirme özelliği eksiktir.

4. **SeoRadar Eksiklikleri**:
   - **Core Web Vitals (LCP, CLS, FID/INP)**: `lib/analyze.ts` içerisinde gerçek CWV veya algoritma bazlı sentetik Core Web Vitals ölçümü/hesaplaması yapılmamakta; yalnızca pro kilit metninde Lighthouse adı geçmektedir.
   - **Güvenlik Başlıkları (Security Headers)**: `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` başlıkları HTTP yanıtından okunmamakta ve değerlendirilmemektedir.
   - **PDF Raporu Kapsamı**: PDF çıktısında Core Web Vitals ve Güvenlik Başlıkları yer almamaktadır.
   - **Rakip Karşılaştırma Sekmesi**: Tab bulunmaktadır ancak sadece genel skor, hata/uyarı sayısı, yüklenme süresi ve kelime sayısını karşılaştırmaktadır; teknik ve CWV kırılımları eksiktir.

---

## 2. Proje Bazlı Detaylı İnceleme: `konvertlab`

### 2.1 Mevcut Mimari ve Dizin Yapısı
- **Çerçeve**: Next.js 15.1.6 (App Router), React 19.0.0, TypeScript 5.7.2, Tailwind CSS 3.4.17.
- **Port**: `package.json` içerisinde varsayılan `"dev": "next dev -p 3001"`.
- **Mevcut Bağımlılıklar** (`konvertlab/package.json`):
  - `clsx`: ^2.1.1
  - `jspdf`: ^2.5.2
  - `lucide-react`: ^0.468.0
  - `next`: 15.1.6
  - `pdfjs-dist`: ^4.8.69
  - `react`: 19.0.0
  - `react-dom`: 19.0.0
  - `tailwind-merge`: ^2.6.0

### 2.2 Mevcut Bileşenler ve Kapsamları
1. `components/ConverterTabs.tsx`:
   - 6 sekme tanımlı: `txt2pdf`, `pdf2txt`, `md2pdf`, `img2pdf`, `youtube`, `batch`.
2. `components/TxtToPdfPanel.tsx`:
   - `.txt` ve metin girdisinden Türkçe karakter destekli PDF üretimi (`lib/pdfGenerate.ts` -> `html2canvas` / `doc.html()` ve font ayarları).
3. `components/PdfToTxtPanel.tsx`:
   - `pdfjs-dist` ile sayfa sayfa metin çıkarma. Satır 146-150'de *"Taranmış (görsel) PDF'lerden metin çıkarılamaz"* notu vardır.
4. `components/MarkdownToPdfPanel.tsx`:
   - Markdown metnini başlıklara göre işleyip PDF'e dönüştürür.
5. `components/ImageToPdfPanel.tsx`:
   - Çoklu JPG/PNG görsellerini A4 sayfalarına ölçekleyerek tek PDF'te birleştirir (`jsPDF.addImage`).
6. `components/YoutubeToolsPanel.tsx`:
   - SRT/VTT altyazılarını ve transkriptleri temizleyip e-kitap veya sunum özeti PDF'ine çevirir (`lib/srtParse.ts`).
7. `components/BatchConvertPanel.tsx`:
   - Çoklu dosya sürükle-bırak kuyruğu (`lib/batch.ts`). Sadece `.txt,.md` kabul eder ve her dosyayı tek tek `savePdf` ile indirir.
8. `components/PricingModal.tsx` & `components/AdBanner.tsx`:
   - Pro paket modalı ve AdSense yerleşim yer tutucuları.

### 2.3 Eksik Kütüphaneler & Bağımlılık İhtiyacı
| Kütüphane | Gerekçe | Kurulum Durumu |
|-----------|---------|----------------|
| `jszip` | Çoklu dosya toplu indirmelerinde ZIP arşivi oluşturmak | **Eksik** (Kurulmalı) |
| `docx` | PDF'ten çıkarılan metin ve paragrafları düzenlenebilir `.docx` dosyası olarak üretmek | **Eksik** (Kurulmalı) |
| `xlsx` / `exceljs` | Tablosal PDF verilerini `.xlsx` Excel formatına aktarmak | **Eksik** (Kurulmalı) |
| `tesseract.js` | Taranmış PDF ve görsel dokümanlardan tarayıcıda Türkçe/İngilizce OCR yapmak | **Eksik** (Kurulmalı) |

---

## 3. Proje Bazlı Detaylı İnceleme: `seoradar`

### 3.1 Mevcut Mimari ve Dizin Yapısı
- **Çerçeve**: Next.js 15.1.6 (App Router), React 19.0.0, TypeScript 5.7.2, Tailwind CSS 3.4.17.
- **Port**: `package.json` içerisinde varsayılan `"dev": "next dev -p 3000"` (Gereksinim: **3002**).
- **Mevcut Bağımlılıklar** (`seoradar/package.json`):
  - `cheerio`: ^1.0.0
  - `clsx`: ^2.1.1
  - `jspdf`: ^2.5.2
  - `lucide-react`: ^0.468.0
  - `next`: 15.1.6
  - `react`: 19.0.0
  - `react-dom`: 19.0.0
  - `tailwind-merge`: ^2.6.0

### 3.2 Mevcut Bileşenler ve Kapsamları
1. `app/api/analyze/route.ts` & `lib/analyze.ts`:
   - SSRF korumalı `fetchWithTimeout` (`lib/urlGuard.ts`).
   - Cheerio ile HTML parse: Title, Meta Description, Headings (H1-H6), Images (alt, dimension, lazy), Links (internal, external, nofollow, broken links HEAD/GET kontrolü), Open Graph, Twitter Cards, Schema.org JSON-LD, robots.txt, sitemap.xml, SSL/HTTPS, metin/HTML oranı, kelime sayısı.
   - Toplam 20 adet ağırlıklı kontrol (`buildChecks`) ve 0-100 puanlama (`computeScore`).
2. `app/page.tsx`:
   - Çok sekmeli derin analiz:
     - `checks`: Filtrelenebilir akordeon kontrol listesi.
     - `headings`: H1-H6 başlık iskeleti ağacı.
     - `images`: Alt etiketi eksik görseller listesi.
     - `links`: Kırık bağlantılar ve HTTP durum kodları.
     - `social`: Facebook/Twitter kart önizlemeleri.
     - `keywords`: Kelime frekansı ve yoğunluğu.
     - `competitor`: İki URL'yi karşılaştıran sekme (Mevcut haliyle özet metrikler).
   - `AgencyContactModal`: İsim, şirket, bütçe, hizmet seçimi ve doğrudan WhatsApp (`wa.me`) yönlendirmesi.
   - Fiyatlandırma tablosu (Ücretsiz, Pro 149 TL/ay, Ajans 499 TL/ay).
3. `lib/pdf.ts`:
   - `generateAnalysisPdf`: jsPDF ile A4 çok sayfalı Türkçe SEO denetim raporu çıktısı.

---

## 4. Özellik Matrisi ve Gap Analizi (Feature Matrix & Gap Analysis)

Aşağıdaki tablo, PRD ve kullanıcı isterleri doğrultusunda her iki projenin gereksinimlerini, mevcut durumunu ve yapılması gereken eksik işleri detaylandırmaktadır:

| Kategori | Özellik Adı | Açıklama | Teknik Gereksinimler | Mevcut Durum | Yapılması Gereken İş (Missing Work) |
|---|---|---|---|---|---|
| **KonvertLab - Format** | **PDF -> Word (DOCX)** | PDF dosyasından metin ve paragrafları çıkarıp `.docx` formatında indirme | `pdfjs-dist` text content extraction + `docx` npm kütüphanesi (Paragraph, TextRun, Document, Packer) | **Yok** | `components/PdfToDocxPanel.tsx` bileşeni yazılacak, `docx` kütüphanesi kurulacak, indirme fonksiyonu eklenecek. |
| **KonvertLab - Format** | **PDF -> Excel (XLSX)** | PDF içindeki tablo ve satır verilerini çıkarıp `.xlsx` tablosuna aktarma | `pdfjs-dist` konum/satır ayrıştırma + `xlsx` (SheetJS) ile çalışma kitabı oluşturma | **Yok** | `components/PdfToExcelPanel.tsx` bileşeni oluşturulacak, satır ayrıştırma ve Excel indirme sağlanacak. |
| **KonvertLab - Format** | **PDF -> Görsel (PNG/JPG)** | PDF sayfalarını HTML5 Canvas'a render edip görsel olarak indirme | `pdfjs-dist` viewport ve `page.render({ canvasContext })` + `canvas.toBlob()` | **Yok** | `components/PdfToImagesPanel.tsx` oluşturulacak. Tek tek veya ZIP olarak indirme sunulacak. |
| **KonvertLab - Format** | **Görsel -> WebP** | JPG/PNG/BMP görselleri kalite ayarıyla modern WebP formatına dönüştürme | HTML5 Canvas `toBlob('image/webp', quality)` + sıkıştırma tasarruf oranı hesaplama | **Yok** | `components/ImageToWebpPanel.tsx` yazılacak. Kalite kaydırıcısı (slider) ve dosya boyutu karşılaştırması eklenecek. |
| **KonvertLab - OCR** | **Tesseract.js İstemci OCR** | Görsellerden ve taranmış PDF sayfalarından tarayıcıda metin tanıma | `tesseract.js` worker, dil paketleri (`tur+eng`), canvas entegrasyonu | **Yok** | `tesseract.js` kurulacak, `components/OcrPanel.tsx` oluşturulacak, Türkçe dil desteği, düzenlenebilir metin alanı ve TXT/PDF dışa aktarma eklenecek. |
| **KonvertLab - Batch** | **Batch Pro & ZIP İndirme** | Çoklu dosya sürükle-bırak ve tüm çıktıların tek bir `.zip` dosyası olarak indirilmesi | `jszip` kütüphanesi + Blob oluşturma + `FileSaver` mantığı | **Kısmen Var (Eksik)** | `BatchConvertPanel.tsx` yalnızca TXT/MD kabul ediyor ve tek tek indiriyor. `jszip` kurularak çoklu format ve toplu ZIP arşivi indirme eklenecek. |
| **KonvertLab - UI/UX** | **Genişletilmiş Sekmeler** | Tüm yeni dönüştürücülerin şık ve sezgisel sekme çubuğunda sunulması | `ConverterTabs.tsx` ve `types/index.ts` güncellemesi | **Kısmen Var** | Sekme listesine DOCX, Excel, WebP, PDF Görsel ve OCR seçenekleri eklenecek. |
| **KonvertLab - Port** | **Port 3001 Doğrulaması** | Uygulamanın 3001 portunda çalışması | `package.json`, `scripts/dev-all.mjs`, `docker-compose.yml` | **Tam Uyumlu** | KonvertLab zaten 3001 portuna ayarlıdır. |
| **SeoRadar - Port** | **Port 3002 Hizalaması** | Uygulamanın 3002 portunda çalışacak şekilde güncellenmesi | `seoradar/package.json` (`dev -p 3002`), `scripts/dev-all.mjs`, `docker-compose.yml` | **Uyuşmazlık (3000)** | Mevcut 3000 portu 3002 olarak değiştirilecek. Suite genelindeki scriptlerle uyumlu hale getirilecek. |
| **SeoRadar - Vitals** | **Core Web Vitals Analizi** | LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift) ve FID/INP metrikleri | `lib/analyze.ts` hesaplama mantığı, HTML element boyutları, TTFB, script bloklama süresi analizi | **Yok** | Algoritmik/sentetik CWV motoru (`calculateCoreWebVitals`) yazılacak; LCP, CLS, FID puanları ve renkli kartları UI ve PDF'e eklenecek. |
| **SeoRadar - Güvenlik** | **Güvenlik Başlıkları Denetimi** | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy kontrolü | `fetchWithTimeout` yanıt header'larının okunması (`res.headers.get(...)`) | **Yok** | `lib/analyze.ts` içine `securityHeaders` alanı ve `security-headers` kontrol maddesi eklenecek. UI'da ve PDF'te gösterilecek. |
| **SeoRadar - Başlık** | **Başlık Hiyerarşisi (H1-H6)** | Başlık seviyeleri, atlama hataları ve görsel hiyerarşi ağacı | Cheerio H1-H6 toplama + ardışıklık kontrolü | **Mevcut & Başarılı** | H1-H6 başlık ağacı sekmesi ve kontrolleri mevcut. |
| **SeoRadar - Linkler** | **Kırık Link & Görsel Denetimi** | Sayfa içi linklerin durum kodları (404/500 vb.) ve alt etiketi kontrolü | Cheerio + `fetchWithTimeout` HEAD/GET istekleri | **Mevcut & Başarılı** | Kırık link kontrolü ve görseller sekmesi eksiksiz çalışıyor. |
| **SeoRadar - Rapor** | **PDF Rapor İndirme** | Markalı detaylı PDF rapor oluşturma ve indirme | `jspdf` tabanlı rapor motoru (`lib/pdf.ts`) | **Mevcut (Geliştirilmeli)** | Rapor mevcut ancak Core Web Vitals ve Güvenlik Başlıkları bölümleri rapora entegre edilecek. |
| **SeoRadar - Rakip** | **Rakip Karşılaştırma Sekmesi** | İki URL'yi teknik, hız ve içerik metrikleriyle yan yana kıyaslama | İkinci analiz isteği + karşılaştırma görünümü | **Kısmen Var (Geliştirilmeli)** | Mevcut karşılaştırma görünümüne Core Web Vitals, Başlıklar, Güvenlik ve Hata detayları yan yana eklenecek. |
| **SeoRadar - İletişim** | **Kurumsal Ajans Modalı & WhatsApp** | Kurumsal teklif formu ve tek tıkla WhatsApp doğrudan mesaj yönlendirmesi | `components/AgencyContactModal.tsx` | **Mevcut & Başarılı** | Form ve WhatsApp doğrudan URL oluşturucusu eksiksiz çalışıyor. |

---

## 5. Port ve Ortam Konfigürasyonu Haritası

Suite genelinde belirlenen yeni port standardı ile mevcut durum arasındaki farklar:

| Uygulama | İstenen Port (PRD / Talimat) | Mevcut `package.json` | Mevcut `docker-compose.yml` | Mevcut `scripts/dev-all.mjs` | Eylem |
|---|---|---|---|---|---|
| **konvertlab** | **3001** | `3001` | `3001:3001` | `3001` | Değişiklik gerekmez, tam uyumlu. |
| **seoradar** | **3002** | `3000` | `3000:3000` | `3000` | **3002'ye güncellenmeli**. |
| **terneon** | **3003** | `3002` | `3002:3002` | `3002` | **3003'e güncellenmeli** (Koordinasyon notu). |
| **parselya** | **3004** | `3003` | `3003:3003` | `3003` | **3004'e güncellenmeli** (Koordinasyon notu). |

---

## 6. Önerilen Uygulama Mimarisi ve Kod Taslakları

### 6.1 `konvertlab` için Gerekli Kütüphaneler ve Yapı:
```bash
cd konvertlab
npm install jszip docx xlsx tesseract.js
```

1. **`lib/docxGenerate.ts`**:
   `pdfjs-dist` ile sayfa metinlerini ve başlık satırlarını ayrıştırıp `docx` kütüphanesinin `Document`, `Paragraph`, `TextRun` sınıflarıyla `.docx` Blob'u üreten modül.
2. **`lib/excelGenerate.ts`**:
   Metin satırlarını boşluk/tab karakterlerine göre sütunlara ayırıp `xlsx.utils.aoa_to_sheet` ve `xlsx.write` ile `.xlsx` üreten modül.
3. **`lib/imageConvert.ts`**:
   Canvas kullanarak görseli WebP formatına çeviren, dosya boyutu kazanımını hesaplayan istemci modülü.
4. **`lib/ocr.ts`**:
   `tesseract.js` worker'ını başlatan, `worker.recognize(imageSource, { lang: 'tur+eng' })` ile metin çıkaran ve ilerleme durumunu (`logger`) bildiren servis.
5. **`lib/zipHelper.ts`**:
   `new JSZip()` ile dönüştürülmüş dosyaları arşivleyip `zip.generateAsync({ type: 'blob' })` ile tek tıkla indiren yardımcı.

### 6.2 `seoradar` için Core Web Vitals ve Güvenlik Başlıkları Entegrasyonu:
1. **`lib/analyze.ts` içine Eklenecek Güvenlik Başlıkları**:
   ```typescript
   const securityHeaders = {
     hsts: !!res.headers.get("strict-transport-security"),
     csp: !!res.headers.get("content-security-policy"),
     xFrameOptions: res.headers.get("x-frame-options") || null,
     xContentTypeOptions: res.headers.get("x-content-type-options") || null,
     referrerPolicy: res.headers.get("referrer-policy") || null,
     permissionsPolicy: !!res.headers.get("permissions-policy"),
   };
   ```
2. **Core Web Vitals Hesabı (Sentetik / Algoritmik)**:
   - **LCP (ms)**: TTFB (`loadTimeMs`) + en büyük görsel veya en uzun blok metnin tahminlenen render gecikmesi (`loadTimeMs * 1.5 + imgDelay`).
   - **CLS (Skor)**: Boyutsuz görsellerin (`missingDimensions`) oranı ve kayma riski (`Math.min(0.5, (missingDimensions / totalImgs) * 0.25)`).
   - **FID / INP (ms)**: Sayfadaki `<script>` sayısı ve inline JS yoğunluğuna göre ana iş parçacığı bloklama tahmini (`Math.min(300, scriptCount * 8 + (htmlSizeBytes > 200000 ? 50 : 0))`).
3. **`types/index.ts` ve `lib/pdf.ts` Senkronizasyonu**:
   - `PageMetrics` içine `vitals: { lcp: number; cls: number; fid: number; rating: 'good' | 'needs-improvement' | 'poor' }` ve `security: SecurityMetrics` eklenecek.
   - `lib/pdf.ts` içerisinde Core Web Vitals ve Güvenlik Başlıkları için yeni bir sayfa/bölüm eklenecek.

---

## 7. Sonuç ve Sonraki Adımlar

- **Konvertlab**: Temel altyapı sağlam ve derleme hatasızdır. Ancak Smallpdf kalitesine ulaşmak için 4 eksik dönüştürücü panel (DOCX, Excel, Görseller, WebP), Tesseract.js OCR ve `jszip` toplu indirme derhal eklenmelidir.
- **SeoRadar**: Arayüz ve temel On-Page denetimi güçlüdür. Port 3002'ye çekilmeli, Core Web Vitals (LCP, CLS, FID) ve Güvenlik Başlıkları (HSTS, CSP, X-Frame) analiz motoruna ve arayüze eklenmelidir.
