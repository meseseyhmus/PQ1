# Katkı Rehberi

Bu depo **dört bağımsız ürünün** kaynak kodunu taşır. Katkı yaparken en önemli
kural şudur: **her proje ayrıdır.** Ortak npm workspace'i, ortak `lib/` klasörü
veya uygulamalar arası import yoktur — hiçbiri olmayacak.

| Dizin | Marka | Port | Ne yapar |
|---|---|---|---|
| `konvertlab/` | KonvertLab | 3001 | TXT↔PDF + YouTube altyazı araçları |
| `seoradar/` | SeoRadar | 3002 | URL SEO analizi + PDF rapor |
| `terneon/` | Terneon | 3003 | Web ajans sitesi + fiyat hesaplayıcı |
| `parselya/` | Parselya | 3004 | Uydu video animasyon editörü |

`rea/` dizini bu paketle ilgilidir **değildir**; oraya hiç dokunmayın.

---

## Başlarken

```bash
# Her proje kendi bağımlılıklarını kurar
cd seoradar        # veya konvertlab / terneon / parselya
npm install
npm run dev        # http://localhost:3002 (seoradar)
```

Gerekli sürüm: **Node.js 20+** (24 ile test edilir).

Kök dizindeki ortak araçlar da ayrıdır ve hiçbir uygulamaya import edilmez:

```bash
node scripts/status.mjs          # dört uygulamanın durum tablosu
node scripts/dev-all.mjs         # hepsini paralel ayağa kaldır
node scripts/verify-all.mjs      # tam doğrulama zinciri
```

---

## Kural: uygulamalar arası izolelik

Bir uygulamanın kaynağından diğerine **hiçbir** import yazılmaz. Bunu yalnızca
kural olarak değil, otomatik kontrol olarak da uygularız — `qa/run-all.mjs`
**7b** adımı dört uygulamanın kaynak ağacında çapraz import arar ve bulursa
başarısız olur.

Aynı şekilde **KonvertLab %100 istemci tarafıdır**; `app/api/` altında sunucu
rotası olamaz. Bu da **7c** adımıyla zorlanır.

Bir uygulamaya yeni özellik eklerken:

- Ortak görünen bir yardımcı gerekiyorsa **o uygulamanın kendi `lib/`** dizinine
  kopyalayın/geliştirin, kök dizine ortak modül açmayın.
- Ortak görünen bir bileşen gerekiyorsa aynı şekilde o uygulamanın
  `components/` dizinine yazın.
- Her uygulamanın kendi `package.json`, `node_modules`, `Dockerfile`,
  `docker-compose.yml`, `README.md` dosyası vardır; bunları uygulamalar arasında
  paylaşmayın.

`qa/run-all.mjs` ayrıca her uygulamada `README.md` (**7a**) ve
`Dockerfile` + `.dockerignore` + `docker-compose.yml` ve port sabitleri (**7d**) olmasını zorunlu tutar.

---

## Sözleşme katmanı (qa/)

API yanıt gövdeleri `qa/contracts/*.schema.json` altında JSON Şema ile
tanımlıdır. Gerçek örnek gövdeler `qa/contracts/examples/` altındadır ve
şemaya karşı doğrulanır.

Desteklenen ek alan:

- `x-invariants` — JSON Şema'nın ifade edemediği alanlar arası eşitlikler
  (ör. `summary.passed + summary.warnings + summary.errors === summary.total`).

Bir API gövdesi değiştirirseniz **üçünü birden** güncelleyin:

1. ilgili `qa/contracts/*.schema.json`,
2. ilgili `qa/contracts/examples/*.json`,
3. üreten uygulamanın kodu.

Şema doğrulayıcının kendi testleri `qa/validate-schema.test.mjs` içindedir;
bozarsanız orası yakalar.

---

## Test katmanları

Ayrıntı: [`TESTING.md`](TESTING.md).

| Katman | Komut | Ağ? |
|---|---|---|
| Sözleşme | `node qa/run-all.mjs` | Hayır |
| Birim | `node scripts/test-all.mjs` (veya `node <app>/tests/run-tests.mjs`) | Hayır |
| Şema örnekleri | `node scripts/verify-all.mjs --skip-build` | Hayır |
| Derleme | `node scripts/build-all.mjs` | Hayır |
| Sağlık | `node qa/health-all.mjs` | Yalnızca localhost |
| Sayfa içerik | `node scripts/smoke-pages.mjs` | Yalnızca localhost |
| Canlı API | `node seoradar/scripts/smoke.mjs` | Yalnızca localhost |

PR göndermeden önce şu ikisini çalıştırın:

```bash
node scripts/verify-all.mjs --skip-build   # hızlı
node scripts/verify-all.mjs                # tam (derleme dahil)
```

`scripts/test-all.mjs` dört uygulamanın `tests/run-tests.mjs` dosyalarını
keşfeder ve sırayla koşturur. `--only seoradar` veya `--only konvertlab,terneon`
ile daraltabilirsiniz. Bir uygulamada test paketi yoksa atlanır, zincir
düşmez.

Birim testleri sıfır bağımlılıklıdır (jest/vitest yok). Kalıp:

- `<app>/tests/harness.mjs` — `describe` / `it` / `expect` / `run`
- `<app>/tests/*.test.mjs` — test dosyaları
- `<app>/tests/run-tests.mjs` — her dosyayı **ayrı süreçte** koşturur
  (bellek içi sayaçlar birbirini etkilemesin)

`expect` eşleyicileri: `toBe`, `toEqual`, `toBeTruthy`/`toBeFalsy`,
`toContain`, `toMatch`, `toThrow` (+ sayısal karşılaştırmalar) ve bunların
olumsuz halleri `expect(x).not.toContain(y)` gibi. Yeni bir eşleyici
eklerseniz dört harness'ı da güncelleyin — kopya değiller ama API'leri
aynı kalmalı.

Node 24 `.ts` dosyalarını doğrudan yükleyebilir (type stripping). Bir modül
`@/…` takma adı kullanıyorsa `tests/register.mjs` + `tests/alias-hook.mjs`
ile çözülür. Windows'ta `--import` yolunu `pathToFileURL(...).href` olarak
verin; aksi halde `ERR_UNSUPPORTED_ESM_URL_SCHEME` alırsınız.

---

## Kod stili

- **TypeScript**, katı tipler. `any` kullanmayın; gerekirse `unknown` + daraltma.
- **React 19** fonksiyonel bileşen + hook. Sınıf bileşen yok.
- **Next.js 15 App Router**. Sunucu istemcisi ayrımına dikkat: istemci
  bileşenlerinde `"use client"` başta olmalı.
- **Tailwind CSS 3.4** (v4 değil). Sınıf birleştirmek için `cn()`
  (clsx + tailwind-merge) yardımcısını kullanın; her uygulamanın kendi
  `lib/cn.ts` dosyası vardır.
- Türkçe arayüz metinleri. Yorumlar ve README'ler Türkçe.
- Sihirli sayı/string yerine `config/` veya `types/` altında sabit tanımlayın
  (bkz. `terneon/config/siteConfig.ts`, `parselya/config/siteConfig.ts`).

### Hukuki sınır (her katkı için geçerli)

- `seocu.com`, `smallpdf.com`, `eraslansoftware.com`, `emlivo.tr` veya başka
  herhangi bir üçüncü parti siteden **kod kopyalamayın**, taramayın, tersine
  mühendislik yapmayın.
- Yalnızca özgün kod yazın. Üçüncü parti görsel/fon yazı da kullanmayın.
- Marka metinleri, fiyatlar ve iletişim bilgileri `config/siteConfig.ts`
  benzeri tek dosyadan gelir; bunları başka siteden almayın.

---

## Commit mesajları

- Konu satırı 50–72 karakter, emir kipi, Türkçe veya İngilizce ama tutarlı.
  Örnek: `seoradar: kırık link kontrolü için zaman aşımı ekle`
- Gerekirse gövdeyle "neden"i açıklayın; "ne yaptım" zaten diff'te görünüyor.
- Commit mesajının sonuna ekleyin:

  ```
  Co-Authored-By: Claude Code <noreply@anthropic.com>
  ```

Bu depoda `git init` yapılmaz; katkı genelde mevcut bir depo üzerinden
yürütülür.

---

## Değişiklik türlerine göre kontrol listesi

**Yeni bir kontrol (SeoRadar) ekliyorsanız**
- `lib/analyze.ts` içinde id, ağırlık, kategori, önem ve `howToFix` üretin.
- `qa/contracts/examples/analysis-result.ok.json` içindeki 20 sabit id listesini
  genişletiyorsanız `seoradar/tests/analyze.test.mjs` içindeki stabil id
  testini ve `seoradar/scripts/smoke.mjs` içindeki zorunlu id listesini güncelleyin.
- `CheckItem.score` **kısmi puandır** ve `[0, 1]` aralığındadır (ör. 0.65) —
  0/1 bayrağı değildir.

**Bir API gövdesi değiştiriyorsanız**
- Şema + örnek + üreten kod üçlüsünü güncelleyin (yukarıya bakın).
- `smoke.mjs` gövdeyi şemaya karşı test ediyorsa orayı da güncelleyin.

**Yeni bir sayfa/bileşen ekliyorsanız**
- `npm run build` hatasız geçmeli.
- Erişilebilirlik: butonların erişilebilir adı, form alanlarında `label`,
  renk tek başına anlam taşımamalı.

**Docker ekliyorsanız / değiştiriyorsanız**
- Uygulamanın kendi `Dockerfile` + `.dockerignore` ikilisi tek başına
  derlenebilir olmalı.
- `node qa/run-all.mjs` **7d** adımı bu dosyaları doğrular.

---

## Sorun giderme

| Belirti | Neden / Çözüm |
|---|---|
| `Cannot find package '@/lib'` | Test Node'u `@/` takma adını bilmiyor. `<app>/tests/register.mjs` + `alias-hook.mjs` ekleyip `--import` ile yükleyin. |
| `ERR_UNSUPPORTED_ESM_URL_SCHEME` … `'c:'` | Windows'ta `--import` yolunu `pathToFileURL(...).href` yapın. |
| `isValidUrl("ftp://…")` true diyordu | `normalizeUrl` zaten şeması olan girdiye `https://` eklememeli. Düzeltilmiş hali `lib/format.ts` içinde. |
| `node qa/run-all.mjs` 7a/7d düşüyor | İlgili uygulamada `README.md` veya `Dockerfile` + `.dockerignore` yok. |
| Port dolu | `node scripts/status.mjs` ile bakın; varsayılanlar 3001–3004. |
| `next build` OOM | `NODE_OPTIONS=--max-old-space-size=4096` (bkz. `docs/CONTAINERIZATION.md`). |

---

## İletişim / yön

Ürün kapsamı ve yol haritası: [`PRD.md`](PRD.md), [`docs/ROADMAP.md`](docs/ROADMAP.md).
Mimari: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Dağıtım:
[`DEPLOYMENT.md`](DEPLOYMENT.md).