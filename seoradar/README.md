# SEORadar

Ücretsiz SEO analiz aracı. Bir URL girin; SEORadar sayfayı tarar, on-page, teknik, içerik ve bağlantı kontrollerini çalıştırır, 0–100 arası bir SEO skoru ve her kontrol için "Nasıl Çözülür?" önerileri içeren bir rapor üretir.

Bu repo tamamen bağımsız bir Next.js uygulamasıdır; suite'teki diğer üç uygulamayla (konvertlab, terneon, parselya) hiçbir kod, yapılandırma veya npm workspace bağımlılığı yoktur. Kendi `package.json`'u ile tek başına deploy edilebilir.

## Özellikler

- **20 sabit otomatik kontrol**: title, meta description, H1, başlık hiyerarşisi, alt metinler, görsel boyutları, link yapısı, kırık linkler, HTTPS, robots.txt, sitemap, Open Graph, Twitter Card, yapısal veri, viewport, HTML lang, canonical, içerik uzunluğu, hreflang, HTML ağırlığı. Bu id'ler API sözleşmesinin parçasıdır (`qa/contracts/examples/analysis-result.ok.json`) — sürüm boyunca sabit kalır.
- **0–100 SEO skoru** ve harf notu, ağırlıklı kontrol sonuçlarından hesaplanır.
- **Ücretsiz plan**: IP başına günde **3 analiz** (rate limit).
- **Pro plan**: sınırsız analiz, filigransız PDF raporu ve pro detayları (ücretsiz planda bulanıklaştırılır).
- **PDF raporu**: jsPDF ile istemci tarafında üretilir. WinAnsi kodlama kısıtı nedeniyle PDF içindeki Türkçe karakterler ASCII'ye çevrilir (ör. `ş → s`, `ğ → g`). Bu bilinen bir davranıştır ve belgelendirilmiştir.
- Reklam birimi yer tutucuları (AdBanner), paylaşılabilir OG görseli, sitemap ve robots.

## Yerel Geliştirme

Gereksinim: Node.js 20+ (paket genelinde önerilen sürüm; 24 ile test edildi).

```bash
npm install
npm run dev
```

Uygulama http://localhost:3002 adresinde çalışır.

Production build:

```bash
npm run build
npm run start
```

Docker:

```bash
docker compose up --build
```

## API

### `POST /api/analyze`

```json
{ "url": "https://ornek.com" }
```

Yanıt: `AnalysisResult` — skor, harf notu, kontroller, ham metrikler, özet ve kullanım bilgisi. Hata durumunda `{ "error": "...", "code": "INVALID_URL" | "FETCH_FAILED" | "TIMEOUT" | "NOT_HTML" | "RATE_LIMIT" }`.

### `GET /api/usage`

IP'nin günlük kullanımını döndürür: `{ "ok": true, "plan": "free", "usage": { "used": 1, "limit": 3 } }`.

## Limitler ve Planlar

| | Ücretsiz | Pro |
|---|---|---|
| Günlük analiz | 3 | Sınırsız |
| PDF raporu | Filigranlı | Filigransız |
| Pro kontrol detayları | Bulanık | Açık |

## Teknoloji

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, cheerio (HTML ayrıştırma), jsPDF (rapor), lucide-react (ikonlar).
