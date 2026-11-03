# Terneon

Sektörüne özel, neon dokunuşlu kurumsal web sitesi + **interaktif fiyat hesaplayıcı**.
Tek sayfalık, animasyonlu, tamamen Türkçe bir pazarlama sitesi. Sunucu API'si yok —
statik/istemci tarafı bir Next.js uygulamasıdır.

> Bu proje `saas/` paketindeki **dört bağımsız uygulamadan** biridir. Ortak npm
> workspace kullanılmaz; kendi `package.json`, kendi `node_modules`, kendi dağıtım
> hedefi vardır.

## Hızlı başlangıç

```bash
cd terneon
npm install
npm run dev          # → http://localhost:3003
```

Üretim derlemesi:

```bash
npm run build
npm start            # → http://localhost:3003
```

Paket kökünden (dört uygulamayı birlikte):

```bash
node scripts/dev-all.mjs                 # 3001–3004
node scripts/dev-all.mjs --only terneon
node scripts/build-all.mjs --only terneon
```

## Dizin yapısı

```
terneon/
├── app/
│   ├── layout.tsx          # kök yerleşim, meta
│   ├── page.tsx            # tek sayfa — tüm bölümler
│   └── globals.css
├── components/
│   ├── Header.tsx          # yapışkan üst menü
│   ├── Hero.tsx            # neon hero + CTA
│   ├── TrustAndStats.tsx   # güven göstergeleri / sayaçlar
│   ├── DemoShowcase.tsx    # masaüstü / mobil demo önizleme modalı
│   ├── ProcessSection.tsx  # 3 adımlık süreç
│   ├── PriceCalculator.tsx # 3 adımlık hesaplayıcı + yapışkan sepet
│   ├── TestimonialsAndFaq.tsx
│   └── Footer.tsx
├── config/siteConfig.ts    # ← tek doğruluk kaynağı (marka, fiyat, iletişim)
├── lib/
│   ├── whatsapp.ts         # wa.me derin bağlantısı + mesaj oluşturucu
│   ├── format.ts           # TL / sayı biçimlendirme
│   └── cn.ts               # clsx + tailwind-merge
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## `config/siteConfig.ts` — tek doğruluk kaynağı

Marka adı, slogan, telefon, WhatsApp numarası, e-posta, hero metinleri, demo
projeler, fiyat kalemleri ve abonelik planları **yalnızca** bu dosyadan okunur.
Arayüzde metin/fiyat sabiti yoktur.

```ts
export const siteConfig = {
  brand: { name: "Terneon", tagline: "…", logoText: "T" },
  contact: {
    phone: "+90 555 000 00 00",
    whatsapp: "905550000000",   // + ve boşluksuz — wa.me için
    email: "merhaba@terneon.com",
    address: "İstanbul, Türkiye",
  },
  hero: { title: "…", subtitle: "…", primaryCta: {…}, secondaryCta: {…} },
  pricing: {
    services: [ { id: "kurumsal", name: "Kurumsal Web Sitesi", price: 14900, … } ],
    subscriptions: [ { id: "monthly", price: 490, … }, { id: "yearly", price: 4900, … } ],
  },
  // …
}
```

Değiştirmek için yalnızca bu dosyayı düzenleyin — arayüz otomatik güncellenir.

## Fiyat hesaplayıcı (3 adım)

1. **Hizmet seç** — kurumsal site, e-ticaret, özel yazılım vb. (`pricing.services`)
2. **Ek modüller** — blog, rezervasyon, çoklu dil, SEO paketi, bakım…
3. **Abonelik** — aylık / yıllık (yıllıkta indirim etiketi)

Sahip olunan seçimler **yapışkan sepet** (sticky cart) bölümünde canlı özetlenir;
toplam TL `lib/format.ts` ile Türkçe biçimde yazılır. Değişiklik anında sepete işlenir.

## WhatsApp derin bağlantısı

`lib/whatsapp.ts` seçimleri önceden doldurulmuş bir mesaja dönüştürür:

```ts
buildWhatsAppLink(siteConfig.contact.whatsapp, selection)
// → https://wa.me/905550000000?text=Merhaba%20Terneon%2C%20…
```

Hero, hesaplayıcı ve footer'daki WhatsApp butonları bu linki `wa.me` üzerinden açar.
Numara `siteConfig.contact.whatsapp` alanından gelir (ulusal biçim, `+` ve boşluk yok).

## Demo modalı

`DemoShowcase` masaüstü / mobil önizleme anahtarı sunar; örnek projeler
`siteConfig` içindeki `DemoProject` listesinden gelir (`saglik`, `eticaret`,
`guzellik`, `otel`, `kafe`, `kurumsal` kategorileri).

## Bağımlılıklar

| Paket | Majör | Not |
|---|---|---|
| `next` | 15 | App Router |
| `react` / `react-dom` | 19 | |
| `framer-motion` | 11 | bölüm animasyonları |
| `lucide-react` | 0 | ikonlar |
| `clsx` + `tailwind-merge` | — | `lib/cn.ts` |
| `tailwindcss` | 3 | **v3** (v4 değil) + postcss + autoprefixer |
| `typescript` | 5 | |

## Docker

```bash
docker build -t terneon .
docker run --rm -p 3003:3003 terneon
```

Veya paket kökünden dört servislik compose:

```bash
docker compose up terneon     # port 3003
```

## Test

Terneon saf istemci/SSG uygulamasıdır; sunucu API gövdesi üretmediği için
`qa/contracts/` şemaları kapsamı dışındadır. Kontrol edilenler:

```bash
node qa/run-all.mjs --only terneon     # paket/dosya/izolelik sözleşmesi
node scripts/status.mjs                # derleme + README + tests durumu
```

Uçtan uca kontrol listesi için kök `TESTING.md`.

## Sınırlar

- Sunucu tarafı API rota **yoktur** (`app/api/` oluşturulmamalı).
- Form gönderimi yoktur — iletişim WhatsApp ve e-posta üzerindendir.
- Fiyatlar `siteConfig` içindedir; ödeme entegrasyonu bu sürümde yoktur.
- Diğer uygulamalarla (SeoRadar, KonvertLab, Parselya) **hiçbir kaynak paylaşılmaz**;
  çapraz import sözleşme denetimiyle (`qa/run-all.mjs` 7b) engellenir.