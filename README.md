# SaaS Proje Paketi

`PRD.md` içindeki 4 bağımsız ürünün çalışır kaynak kodları. Her proje kendi
dizininde **bağımsız bir Next.js (App Router) uygulamasıdır** — ayrı
`package.json`, ayrı `node_modules`, ayrı marka. Ortak bir monorepo workspace
kullanılmadı, böylece istenilen proje tek başına indirilip yayınlanabilir.

| Dizin | Marka | Ürün | Gelir Modeli |
|---|---|---|---|
| `seoradar/` | **SeoRadar** | URL SEO analiz + PDF rapor SaaS | Freemium, Pro abonelik, AdSense, affiliate |
| `konvertlab/` | **KonvertLab** | TXT↔PDF dönüştürücü + YouTube metin araçları (100% client-side) | AdSense, toplu dönüşüm Pro |
| `terneon/` | **Terneon** | Web ajans, canlı demo vitrini, interaktif fiyat hesaplayıcı | Proje satışı + aylık bakım aboneliği |
| `parselya/` | **Parselya** | Ada/parsel uydu video animasyon editörü (9:16 / 16:9) | Kredi/abonelik, filigransız HD dışa aktarma |

`rea/` dizini bu paketle ilgili değildir (daha önce var olan tersine mühendislik
araç deposu), dokunulmamıştır.

---

## Ortak kurulum

Her proje için ayrı ayrı:

```bash
cd seoradar        # veya konvertlab / terneon / parselya
npm install
npm run dev        # http://localhost:3002 (seoradar; 3001..3004)
```

Üretim derlemesi: `npm run build && npm start`

Gerekli sürümler: **Node.js 20+** (24 ile test edildi).

---

## Proje notları

### 1. SeoRadar
- `POST /api/analyze` → `cheerio` ile hedef URL'nin HTML'ini çeker, On-Page +
  teknik metrikleri hesaplar, ağırlıklı 0-100 skor döner.
- Analiz sunucu tarafında yapılır (CORS / robots nedeniyle). Ücretsiz planda
  günde 3 analiz (`localStorage` + IP tabanlı soft-limit), Pro kilitleri
  bulanıklaştırılmış alanlarla gösterilir.
- PDF rapor `jspdf` ile istemcide üretilir (Pro).

### 2. KonvertLab
- Hiçbir dosya sunucuya yüklenmez. `jspdf` (TXT→PDF) ve `pdfjs-dist` (PDF→TXT)
  tarayıcıda çalışır.
- YouTube sekmesi SRT/TXT altyazılarını temiz metne ve PDF e-kitaba çevirir.
- AdSense banner alanları `AdBanner` bileşeniyle yer tutucu olarak bırakıldı.

### 3. Terneon
- Tüm marka/iletişim/demo/fiyat verisi `config/siteConfig.ts` içinde.
- Fiyat hesaplayıcı 3 adımlı; sağdaki sticky özet sepet seçimleri canlı toplar,
  WhatsApp teklif linkine otomatik mesaj metni üretir.
- Framer Motion ile giriş/scroll animasyonları.

### 4. Parselya
- Karanlık mod video editörü arayüzü: sol panel (veri/katman), orta canvas
  sahne, alt timeline, üst bar (kredi + export).
- Parsel sınırı `GeoJSON` poligonundan canvas'a çizilir; zoom-in / orbit
  kamera hareketi ve bilgi etiketi (callout) animasyonları zaman çizelgesine
  bağlıdır.
- "Videoyu Dışa Aktar" `MediaRecorder` + `canvas.captureStream()` ile WebM
  kaydı yapar (MP4 desteği tarayıcıya bağlıdır; UI'da seçenek sunulur).
- Gerçek tapu/parsel sorgulama servisi bağlanmadı — harici API anahtarı
  girilebilecek bir alan ve demo veri (`lib/demoParcel.ts`) bırakıldı.

---

## Yasal not

Bu paketteki hiçbir kod üçüncü taraf sitelerden (seocu.com, smallpdf.com,
eraslansoftware.com, emlivo.tr) kopyalanmamıştır. Ürünler yalnızca PRD'deki
işlevsel gereksinimlerden, sıfırdan ve özgün markalarla yazılmıştır.