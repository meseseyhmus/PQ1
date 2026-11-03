# Dağıtım Kılavuzu (Deployment)

Bu depo **dört bağımsız Next.js (App Router) uygulaması** içerir. Ortak npm
workspace **yoktur**; her uygulamanın kendi `package.json`, kendi
`node_modules` ve kendi dağıtım hedefi vardır. İstediğiniz uygulamayı tek
başına alıp ayrı bir sunucuya yayınlayabilirsiniz.

| Uygulama | Dizin | Port | İmaj |
|---|---|---|---|
| KonvertLab | `konvertlab/` | 3001 | `konvertlab:local` |
| SeoRadar | `seoradar/` | 3002 | `seoradar:local` |
| Terneon | `terneon/` | 3003 | `terneon:local` |
| Parselya | `parselya/` | 3004 | `parselya:local` |

Gereksinim: **Node.js 20+** (24 ile test edildi). Docker kullanacaksanız
Docker Engine + Compose v2.

---

## 1. Yerel geliştirme

### Tüm paket tek komutla

Kök dizinde:

```bash
node scripts/dev-all.mjs
```

- Dört uygulamayı **paralel** başlatır: konvertlab → 3001, seoradar → 3002,
  terneon → 3003, parselya → 3004.
- `node_modules` bulunmayan uygulama için otomatik `npm install` çalıştırır.
- Her uygulamanın çıktısı kendi renginde `[uygulama-adı]` önekiyle etiketlenir.
- Durdurmak için `Ctrl+C`.

Faydalı bayraklar:

```bash
node scripts/dev-all.mjs --only seoradar   # yalnızca tek uygulama
node scripts/dev-all.mjs --skip-install    # npm install'ı atla
node scripts/dev-all.mjs --only konvertlab --port 3010  # özel port
```

Kök `package.json` üzerindeki kısayollar da kullanılabilir:
`npm run dev`, `npm run dev:seoradar`, `npm run dev:konvertlab`,
`npm run dev:terneon`, `npm run dev:parselya`.

### Uygulama bazlı (klasik yol)

```bash
cd seoradar        # veya konvertlab / terneon / parselya
npm install
npm run dev        # http://localhost:3002 (seoradar)
```

Her uygulamanın kendi dizininde çalıştırılması yeterlidir; kök dizinde
`npm install` gerektiren bir şey yoktur (kök `package.json` yalnızca
yardımcı script'ler içerir, bağımlılığı yoktur).

---

## 2. Üretim derlemesi (Node.js)

Tüm uygulamaları sırayla derle:

```bash
node scripts/build-all.mjs
```

- Eksik `node_modules` varsa önce `npm install` yapar, sonra `npm run build`.
- Çıkış kodu `0` = hepsi başarılı, `1` = en az biri başarısız.
- `--only <app>` ile tek uygulama, `--concurrent` ile paralel derleme
  (RAM kullanımına dikkat), `--skip-install` ile kurulum adımını atlama.

Kısayollar: `npm run build`, `npm run build:seoradar`, vb.

Ardından her uygulamayı kendi dizininde başlat:

```bash
cd seoradar && npm start    # next start, PORT'a göre dinler
```

Anlık durum tablosu için: `node scripts/status.mjs` (veya `npm run status`,
JSON çıktı için `--json`).

---

## 3. Docker (tüm paket)

Kök dizindeki `docker-compose.yml` dört imajı da sıfırdan inşa eder ve
3001–3004 portlarını yayınlar. Her servis `restart: unless-stopped` ile
çalışır, `saas` adlı ortak bir bridge ağında yer alır ve konteyner içi
`wget` tabanlı bir healthcheck içerir (30 sn aralıkla, 20 sn başlangıç
süresi, 5 deneme).

```bash
# Tüm imajları derle ve arka planda başlat
docker compose up -d --build

# Durum ve healthcheck kontrolü
docker compose ps

# Tek uygulamanın loglarını izle
docker compose logs -f seoradar    # veya konvertlab / terneon / parselya

# Durdur (imajlar kalır)
docker compose down
```

Tek uygulamayı yeniden derleyip başlatmak için:

```bash
docker compose up -d --build seoradar
```

### Dockerfile notları (dört uygulama için aynı yapı)

Her uygulamanın kendi `Dockerfile`'ı **üç aşamalı (multi-stage)** ve
**`node:22-alpine`** tabanlıdır:

1. **deps** — `package.json` (+ varsa `package-lock.json`) kopyalanır,
   `npm install` çalıştırılır.
2. **builder** — kaynak kod kopyalanır, `NEXT_TELEMETRY_DISABLED=1` ile
   `npm run build` çalıştırılır.
3. **runner** — root olmayan `nextjs` kullanıcısıyla çalışır; `package.json`,
   `node_modules`, `.next`, `next.config.ts` ve `public` kopyalanır.
   Standalone çıktı **kullanılmaz**; `next start` tam build artefaktlarıyla
   çalışır. `PORT` ve `HOSTNAME=0.0.0.0` ayarlanır, `EXPOSE` ilgili porttur
   (3001–3004).

Her imaj `docker build -t seoradar:local ./seoradar` şeklinde tek başına da
inşa edilebilir.

---

## 4. Ortam değişkenleri

Uygulamalar kasıtlı olarak minik bir env ayak izine sahiptir:

| Değişken | Uygulama | Açıklama |
|---|---|---|
| `PORT` | hepsi | Dinlenecek port (Docker Compose'da 3001–3004 olarak ayarlanır) |
| `NODE_ENV` | hepsi | `production` / `development` |
| `HOSTNAME` | hepsi | Docker içinde `0.0.0.0` (konteyner dışından erişim için) |
| `NEXT_PUBLIC_SITE_URL` | SeoRadar | `sitemap.ts` ve `robots.ts` bunu okur. Üretimde site adresinizi verin, ör. `https://seoradar.example.com`. Tanımsızsa uygulama çalışmaya devam eder ama sitemap/robots varsayılan değere düşer. |

- **KonvertLab**: harici env değişkeni gerekmez (tüm dönüşüm tarayıcıda).
- **Terneon**: harici env değişkeni gerekmez (tüm yapılandırma
  `config/siteConfig.ts` içinde).
- **Parselya**: harici env değişkeni gerekmez; harita/tapu API anahtarı
  yoktur, demo veri `lib/demoParcel.ts` içindedir.

Not: hiçbir uygulama veritabanı, Redis veya ödeme API anahtarı beklemez;
kullanıcı verisi kalıcılığı için dosya sistemi de kullanılmaz.

---

## 5. Ters vekil (reverse proxy)

Dört alan adını dört konteyner portuna yönlendirmek için örnek nginx
yapılandırması:

```nginx
server {
  listen 80;
  server_name seoradar.example.com;
  location / { proxy_pass http://127.0.0.1:3002; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
}
server {
  listen 80;
  server_name konvertlab.example.com;
  location / { proxy_pass http://127.0.0.1:3001; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
}
server {
  listen 80;
  server_name terneon.example.com;
  location / { proxy_pass http://127.0.0.1:3003; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
}
server {
  listen 80;
  server_name parselya.example.com;
  location / { proxy_pass http://127.0.0.1:3004; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
}
```

Aynı şeyi Caddy ile (otomatik HTTPS ile birlikte) yapmak daha kısadır:

```caddy
seoradar.example.com {
  reverse_proxy 127.0.0.1:3002
}
konvertlab.example.com {
  reverse_proxy 127.0.0.1:3001
}
terneon.example.com {
  reverse_proxy 127.0.0.1:3003
}
parselya.example.com {
  reverse_proxy 127.0.0.1:3004
}
```

TLS için nginx tarafında certbot veya Caddy'nin yerleşik ACME desteği
kullanılabilir.

---

## 6. Ölçeklendirme ve SeoRadar rate limit uyarısı

**SeoRadar'ın ücretsiz plan limiti (günde 3 analiz) bellek içi (in-memory)
tutulur** (`localStorage` + IP tabanlı yumuşak limit):

- Konteyner/süreç **yeniden başlatıldığında sayaç sıfırlanır.**
- Birden fazla SeoRadar örneği (Docker `--scale`, load balancer arkasında
  ayrı kopyalar) çalıştırırsanız her örnek **kendi sayacını** tutar; yani
  limit etkili biçimde "örnek sayısı × 3"e çıkar. Bu davranış bilinçli bir
  basitlik tercihidir ve **multi-instance güvenli değildir.**
- Kalıcı, örnekler arası tutarlı bir limite ihtiyaç duyulursa sayacın
  Redis vb. paylaşımlı bir depoya taşınması gerekir (mevcut kodda yoktur).

Diğer üç uygulama (KonvertLab, Terneon, Parselya) durum tutmaz; durumdan
bağımsız olarak yatayda ölçeklenebilirler.

---

## 7. Bağımsız dağıtım

Dört uygulama birbirinden tamamen kopuktur:

- Ortak lockfile **yoktur**; her dizin kendi `package-lock.json`'uyla
  ayrı kurulur.
- Tek bir uygulamayı kopyalayıp (ör. yalnızca `terneon/` klasörünü) kendi
  VPS'ine, Vercel'e veya Netlify'ına taşıyabilirsiniz — başka dizine ya da
  kök script'lere bağımlılığı yoktur.
- Vercel/Netlify gibi platformlarda her uygulamayı ayrı proje olarak
  import edin; kök dizini değil, ilgili uygulamanın klasörünü kök olarak
  seçin. Ek yapılandırma gerekmez (`next.config.ts` standarttır).
- VPS üzerinde ise "Üretim derlemesi" bölümündeki `npm run build && npm start`
  akışı ya da tek başına `docker build` yeterlidir.
