# KonvertLab

Türkçe, %100 tarayıcı tabanlı doküman dönüştürücü ve YouTube metin araçları.
Hiçbir dosya sunucuya yüklenmez — tüm dönüşümler kullanıcının tarayıcısında
gerçekleşir.

## Özellikler

- **TXT → PDF**: `.txt` / `.md` dosyası yükleyin veya metni yapıştırın;
  ayarlanabilir yazı boyutu (8–24 pt), kenar boşluğu (10–40 mm), hizalama
  (sola / iki yana / ortaya), isteğe bağlı başlık, sayfa numaraları ve
  filigran ile PDF indirin. Tam Türkçe karakter desteği (ğüşiöçİĞÜŞÖÇ).
- **Markdown → PDF**: `.md` metnini başlıkları ve vurguları koruyarak PDF'e
  çevirir (`MarkdownToPdfPanel`).
- **Görsel → PDF**: JPG/PNG görsellerini sıralayarak tek PDF'e birleştirir
  (`ImageToPdfPanel`).
- **PDF → TXT**: PDF dosyasını sürükleyip bırakın; `pdfjs-dist` ile metin
  sayfa sayfa çıkarılır, düzenlenebilir editörde gösterilir ve `.txt` olarak
  indirilir. Şifreli / taranmış PDF'ler için açıklayıcı Türkçe hata mesajları.
- **YouTube Araçları**: SRT / VTT altyazısı veya düz metin yapıştırın;
  zaman kodları, numaralandırma, etiketler ve konuşmacı adları temizlenerek
  düz paragraf metnine dönüşür. Kelime sayısı ve tahmini okuma süresi
  gösterilir. Çıktı: düzenlenebilir "Temiz Metin", bölüm başlıklı
  "PDF E-kitap" veya madde işaretli "Sunum Özeti" PDF'i.
- **UX**: Sürükle-bırak alanı (çoklu dosya, dosya boyutu göstergesi, 25 MB
  sınırı), determinate ilerleme çubuğu, klavye erişilebilirliği.
- **Monetizasyon**: Üç adet görsel Google AdSense yer tutucusu (sol 300×600,
  sağ 300×250, alt 728×90 leaderboard) ve "Pro Üyelik" modalı
  (₺149/ay veya ₺1.490/yıl: 50 dosyaya kadar toplu dönüşüm + reklamsız
  deneyim).

## Kurulum

```bash
npm install
npm run dev      # http://localhost:3001
npm run build    # üretim derlemesi
npm start        # üretim sunucusu (http://localhost:3001)
```

Not: uygulama sabit olarak **3001** portunda çalışır (`next dev -p 3001`).

Gereksinimler: Node.js 20+ (paket genelinde önerilen sürüm), npm.

## Mimari Notlar

- **Next.js 15 App Router + React 19**, tamamen istemci tarafı çalışır.
  API rotası / backend yoktur; `app/page.tsx` bir client component'tir.
- **Türkçe karakter desteği (PDF üretimi)**: jsPDF'in yerleşik
  `helvetica`/`times` fontları WinAnsi (Latin-1) kodludur ve ğ/ş/ı/İ
  gliflerini doğru render edemez. Bunun yerine metin, jsPDF'in
  `doc.html()` yöntemiyle tarayıcının Unicode destekli font yığınından
  html2canvas üzerinden rasterleştirilir — böylece Türkçe glifler ekranda
  göründüğü gibi çıkar. Sayfa numaraları ve filigran gibi yalnızca ASCII
  meta veriler yerleşik fontla `doc.text()` ile çizilir.
- **pdfjs-dist worker**: `new URL('pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url)` kalıbıyla webpack 5 worker dosyasını asset olarak
  paketler; modül yalnızca tarayıcıda dinamik `import()` ile yüklenir.
- **SRT/VTT ayrıştırma** (`lib/srtParse.ts`): zaman kodu satırları,
  numaralandırma, `WEBVTT` başlığı, `<c>` gibi inline etiketler, `{...}`
  stilleri, `>>` / `SPEAKER:` konuşmacı önekleri ve tekrarlayan çakışan
  satırlar temizlenir; cümleler 3'erli gruplarla paragraflara dönüştürülür.
- **Tasarım**: Tailwind CSS 3.4 koyu tema (slate paleti + cyan vurgu),
  360px / 768px / 1280px'e duyarlı; yan reklam sütunları mobilde gizlenir.
- **Reklamlar**: `components/AdBanner.tsx` yalnızca görsel yer tutucudur;
  canlıya alırken içeriği gerçek AdSense `<ins>` etiketiyle değiştirin.

## Dizin Yapısı

```
app/          layout, globals.css, sayfa
components/   UI bileşenleri (paneller, DropZone, AdBanner, PricingModal, …)
lib/          cn, pdfGenerate (jsPDF), pdfExtract (pdfjs-dist), srtParse, format
types/        paylaşılan TypeScript tipleri
```
