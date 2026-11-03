# API Dokümanı

Bu doküman paketin HTTP API yüzeyini tanımlar. Paketteki **tek gerçek HTTP API
SeoRadar analiz servisidir**; diğer üç uygulama sunucu API'si sunmaz (bkz.
"Sunucu API'si olmayan projeler").

Baz URL (geliştirme): `http://localhost:3002`

---

## SeoRadar — `/api/analyze`

### `GET /api/analyze`

Servisin ayakta olduğunu döndürür. Analiz yapmaz.

**200 yanıtı**

```json
{
  "ok": true,
  "service": "SeoRadar Analyze API",
  "usage": { "used": 0, "limit": 3 }
}
```

| Alan | Tür | Açıklama |
|---|---|---|
| `ok` | `boolean` | `true`. |
| `service` | `string` | Sabit hizmet tanımlayıcısı. |
| `usage` | `object` | Sunucudaki yerel (`local`) sayaç için örnek değer. Çağıran IP'nin gerçek kullanımı için `GET /api/usage` kullanın. |

---

### `GET /api/usage`

Çağıran IP'nin günlük analiz kullanımını döndürür. Analiz yapmaz.

**Örnek istek**

```http
GET /api/usage HTTP/1.1
```

**200 yanıtı**

```json
{
  "ok": true,
  "plan": "free",
  "usage": { "used": 1, "limit": 3 }
}
```

| Alan | Tür | Açıklama |
|---|---|---|
| `ok` | `boolean` | `true`. |
| `plan` | `"free" \| "pro"` | `x-seoradar-plan: pro` başlığı gönderildiyse `pro`. |
| `usage.used` | `number` | Bugün (IP bazlı) yapılan analiz sayısı. |
| `usage.limit` | `number` | Günlük ücretsiz limit (3). |

Sözleşme tanımı: `qa/contracts/usage-response.schema.json`.

---

### `POST /api/analyze`

Gönderilen URL'yi çeker, HTML'ini `cheerio` ile ayrıştırır, On-Page + teknik
SEO metriklerini hesaplar ve ağırlıklı 0–100 skorla birlikte `AnalysisResult`
döner.

**İstek gövdesi**

```json
{ "url": "https://ornek.com" }
```

**Başlıklar**

| Başlık | Zorunlu | Açıklama |
|---|---|---|
| `Content-Type: application/json` | Evet | Gövde JSON'dur. |
| `x-seoradar-plan: pro` | Hayır | Pro plan bayrağı. Gönderilmediğinde istek ücretsiz plandan sayılır; Pro'da rate limit uygulanmaz ve kilitli alanlar dolu döner. (v0.2'de gerçek auth ile değiştirilecektir — bkz. ROADMAP.) |

**Başarı yanıtı — `200 OK`**

`AnalysisResult` şeması (`seoradar/types/index.ts`):

| Alan | Tür | Açıklama |
|---|---|---|
| `url` | `string` | Normalleştirilmiş analiz edilen URL. |
| `score` | `number` | 0–100 arası ağırlıklı genel SEO skoru. |
| `grade` | `string` | Harf notu (örn. `"A"`, `"B"`). |
| `summary` | `object` | `{ passed, warnings, errors, total }` — kontrol sayıları; toplam eşitliği `passed + warnings + errors === total` sözleşmeyle zorlanır. |
| `metrics` | `PageMetrics` | Sayısal ham metrikler (aşağıda). |
| `checks` | `CheckItem[]` | Kontrol kartları (aşağıda). |
| `plan` | `"free" \| "pro"` | İsteğin hangi plan adına yapıldığı. |
| `dailyUsage` | `object` | `{ used, limit }` — istek sonrası güncel kullanım. |

`PageMetrics`:

| Alan | Tür | Açıklama |
|---|---|---|
| `url` / `finalUrl` | `string` | İstenen ve (yönlendirme varsa) nihai URL. |
| `fetchedAt` | `string` | ISO zaman damgası. |
| `loadTimeMs` | `number` | HTML çekim süresi (ms). |
| `htmlSizeBytes` | `number` | Ham HTML boyutu. |
| `title` / `titleLength` | `string \| null` / `number` | `<title>` içeriği ve uzunluğu. |
| `metaDescription` / `metaDescriptionLength` | `string \| null` / `number` | Meta açıklama ve uzunluğu. |
| `canonical` / `lang` / `viewport` / `charset` | `string \| null` | İlgili etiket değerleri. |
| `headings` | `object` | `{ h1, h2, h3, h4, h5, h6 }` — her biri `string[]`. |
| `images` | `object` | `{ total, missingAlt, missingAltSrcs, emptyAlt, missingDimensions, lazyLoaded }`. |
| `links` | `object` | `{ total, internal, external, noFollow, empty, checked, broken }` — `broken` öğeleri `{ href, status, error? }`. |
| `technical` | `object` | `{ isHttps, hasRobotsTxt, robotsTxtContent, hasSitemapXml, hasFavicon, hasOpenGraph, openGraphKeys, hasTwitterCard, hasStructuredData, structuredDataTypes, hasHreflang, inlineStyles, scriptCount, stylesheetCount }`. |
| `wordCount` / `textToHtmlRatio` / `contentLength` | `number` | İçerik metrikleri. |

`CheckItem`:

| Alan | Tür | Açıklama |
|---|---|---|
| `id` | `string` | Kontrol tanımlayıcısı (örn. `"title"`). 20 sabit id sözleşmenin parçasıdır. |
| `title` | `string` | Kart başlığı (Türkçe). |
| `category` | `string` | Grup: `"onpage"` \| `"technical"` \| `"content"` \| `"links"`. |
| `severity` | `string` | `"success"` \| `"warning"` \| `"error"` \| `"info"`. |
| `summary` | `string` | Kartın ilk satırı — kısa bulgu özeti. |
| `value` | `string` (opsiyonel) | Ölçülen değer. |
| `howToFix` | `string[]` | "Nasıl Çözülür?" önerileri. |
| `proDetail` | `string` (opsiyonel) | Pro plana özel detay; ücretsiz planda bulanıklaştırılır. |
| `weight` | `number` | Skor hesabındaki ağırlık. |
| `score` | `number` | `[0, 1]` arası kısmi başarı oranı (örn. `0.6`). |

**Örnek başarı yanıtı (kısaltılmış; tam örnek: `qa/contracts/examples/analysis-result.ok.json`)**

```json
{
  "url": "https://example.com/",
  "score": 78,
  "grade": "B",
  "plan": "free",
  "dailyUsage": { "used": 1, "limit": 3 },
  "summary": { "passed": 12, "warnings": 6, "errors": 2, "total": 20 },
  "checks": [
    {
      "id": "title",
      "title": "Sayfa Başlığı",
      "category": "onpage",
      "severity": "success",
      "summary": "Title etiketi 52 karakter ile ideal aralıkta.",
      "value": "Örnek Site — Ana Sayfa",
      "howToFix": ["Başlığı 50-60 karakter arasında tutun."],
      "weight": 8,
      "score": 1
    }
  ],
  "metrics": { "…": "yukarıdaki PageMetrics tablosu" }
}
```

### Hata yanıtları

Tüm hatalar `{ "error": "<Türkçe mesaj>", "code": "<KOD>" }` biçimindedir.

| HTTP | `code` | Ne zaman |
|---|---|---|
| 400 | `INVALID_URL` | Gövde JSON değil, `url` yok veya geçerli bir `http(s)` URL'si değil. |
| 429 | `RATE_LIMIT` | Günlük ücretsiz limit (3) doldu. Yanıt gövdesinde `dailyUsage` da yer alır. |
| 502 | `FETCH_FAILED` | Hedef siteye bağlanılamadı (DNS, bağlantı reddi vb.). |
| 502 | `NOT_HTML` | URL bir HTML sayfası döndürmedi (örn. doğrudan PDF/JSON). |
| 502 | `TIMEOUT` | Hedef site zaman aşımına uğradı (sayfa çekimi 12 sn, kırık link taraması 5 sn). |

```json
{
  "error": "Ücretsiz günlük analiz limitine ulaştınız (3/3). Pro'ya yükselterek sınırsız analiz yapabilirsiniz.",
  "code": "RATE_LIMIT",
  "dailyUsage": { "used": 3, "limit": 3 }
}
```

Sözleşme tanımı: `qa/contracts/analysis-error.schema.json`.

### Rate limit davranışı

- **Limit:** IP başına günde **3 analiz** (ücretsiz plan). `x-seoradar-plan: pro`
  başlığı gönderen istekler sayılmaz.
- **Kimlik:** İstek IP'si (`x-forwarded-for` varsa ilk değer, yoksa
  `x-real-ip`, o da yoksa `local`).
- **Depolama:** Süreç içi (in-memory) `Map` — anahtar IP, değer
  `{ date, count }`. Sayaç günlük UTC sıfırlamayla temizlenir. Sunucu yeniden
  başlatıldığında sayaçlar kaybolur — bu bilinen bir kısıttır; üretim için Redis
  tabanlı sayaç planlanmıştır (v0.2).
- İstemci ayrıca `localStorage` üzerinden ikinci bir soft-limit tutar; bu yalnızca
  UI'da kalan hakkı göstermek içindir, güvenlik sınırı değildir.

---

## Gelecek uçlar (taslak — henüz implement edilmedi)

Aşağıdaki uçlar tasarım aşamasındadır; **mevcut kodda yoktur** ve şemaları
kesinleşmemiştir.

| Uç | Amaç |
|---|---|
| `POST /api/report/pdf` | `AnalysisResult` gövdesini sunucuda PDF'e derleyip döndürme (Türkçe glif sorunu sunucu tarafında gömülü TTF ile çözülür). |
| `POST /api/batch` | Pro kullanıcı için çoklu URL kuyruğu; iş durumu sorgulanabilir görev kimliği döner. |

---

## Sunucu API'si olmayan projeler

| Proje | Neden API yok |
|---|---|
| **KonvertLab** | Tüm dönüşümler tarayıcıda (`jspdf`, `pdfjs-dist` worker) çalışır; hiçbir dosya sunucuya gitmez. |
| **Terneon** | Statik içerik + `config/siteConfig.ts`; satış akışı `wa.me` WhatsApp deep-link'i ile kullanıcının telefonuna taşınır. |
| **Parselya** | Render tamamen yerel canvas + `MediaRecorder` ile yapılır; video hiçbir sunucuya gönderilmez. |

### İleride eklenebilecek uçlar

- **Ortak:** auth/oturum uçları (kayıt, giriş, plan sorgusu), ödeme/abonelik
  uçları (Stripe/Iyzico webhook dahil).
- **SeoRadar:** yukarıdaki taslak uçlar.
- **Terneon:** teklif taleplerini kaydeden basit form/CMS uçları.
- **Parselya:** tapu/parsel sorgulama servisi proxy'si (harici API anahtarı
  sunucu tarafında saklanır) ve bulut render servisi (sunucuda MP4 transkod).
