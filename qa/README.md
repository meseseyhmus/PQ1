# QA — Sözleşme Denetimi

Bu klasör, paketteki **dört bağımsız uygulamanın** (SeoRadar, KonvertLab,
Terneon, Parselya) birbirinden tamamen ayrı tutulduğunu ve temel sözleşmelerini
doğrular. Ortak bir npm workspace **kullanılmaz**; her uygulama kendi
`package.json` dosyasına, kendi `node_modules` dizinine ve kendi dağıtım
hedefine sahiptir.

## Neden "sözleşme denetimi"?

Uygulamalar ayrı ekipler/ajanlar tarafından paralel geliştirilebiliyor. Bu
betik, bir uygulamanın yanlışlıkla başka bir uygulamanın alanına taşmadığını
ve her birinin kendi API/UI sözleşmesini koruduğunu hızlıca doğrular.

## Ne denetleniyor?

| # | Denetim | Açıklama |
|---|---|---|
| 1 | Dizin | `seoradar/`, `konvertlab/`, `terneon/`, `parselya/` mevcut |
| 2 | `package.json` | Parse edilebilir, `name` alanı dolu |
| 3 | npm script'leri | `dev`, `build`, `start` tanımlı |
| 4 | Bağımlılık majörleri | Örn. `next` 15, `react` 19, `tailwindcss` 3 |
| 5 | Beklenen kaynak dosyaları | Her projenin kritik dosyaları yerinde (`app/robots.ts` + `app/sitemap.ts` dahil) |
| 6 | Kaynak dosyası sayısı | ≥ 15 `.ts`/`.tsx` (boş iskelet değil) |
| 7 | `node_modules` | Kurulum durumu bilgisi |
| 7a | `README.md` | Her app kendi Türkçe belgesini taşır |
| 7d | Konteyner dosyaları | `Dockerfile` + `.dockerignore` + `docker-compose.yml` ve port sabitleri |
| 7b | Uygulamalar arası izolelik | Bir app'in kaynağı başka bir app dizinine çapraz import etmemeli |
| 7c | Yasaklar | Örn. KonvertLab'de `app/api` olmamalı (%100 istemci tarafı) |
| 8 | `npm run build` | `--run-build` ile isteğe bağlı gerçek derleme |

## Kullanım

```bash
# Tüm projeleri denetle (hızlı, derleme yapmaz)
node qa/run-all.mjs

# Tek bir proje
node qa/run-all.mjs --only seoradar

# Gerçek derleme dahil (yavaş; önce npm install)
node qa/run-all.mjs --run-build

# npm install'ı atla (node_modules zaten kuruluysa)
node qa/run-all.mjs --skip-install --run-build
```

Çıkış kodu `0` = tüm denetimler geçti, `1` = en az bir başarısızlık.

## Örnek çıktı

```
━━━ seoradar (seoradar/ · port 3002) ━━━
  [PASS] Dizin mevcut — seoradar
  [PASS] package.json parse edilebilir — name=seoradar
  [PASS] Gerekli npm script'leri — dev, build, start
  [PASS] Bağımlılık: next — ^15.1.6
  ...
━━━━━━━━━━━━━━ ÖZET ━━━━━━━━━━━━━━
  32 geçti · 0 başarısız
```

## Şema doğrulama (opsiyonel, sıfır bağımlılık)

`qa/contracts/` altındaki JSON Şemaları, SeoRadar API gövdelerinin sözleşmesini
tanımlar. `qa/validate-schema.mjs` bu şemaları draft-07 alt kümesiyle doğrular
(npm paketi gerekmez).

```bash
# Dosyaya karşı
node qa/validate-schema.mjs \
  --schema qa/contracts/analysis-result.schema.json \
  --data qa/contracts/examples/analysis-result.ok.json

# Canlı API'ye karşı
curl -s -X POST http://localhost:3002/api/analyze \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com"}' \
  | node qa/validate-schema.mjs --schema qa/contracts/analysis-result.schema.json --data -
```

| Şema | Kapsam |
|---|---|
| `contracts/analysis-result.schema.json` | `POST /api/analyze` → `AnalysisResult` |
| `contracts/usage-response.schema.json` | `GET /api/usage` → `{ ok, usage, plan }` |
| `contracts/examples/analysis-result.ok.json` | Geçerli örnek yük (smoke/fixtures için) |

Doğrulayıcının desteklediği anahtarlar: `type`, `properties`, `required`,
`additionalProperties`, `items`, `enum`, `minimum`/`maximum`,
`exclusiveMinimum`/`exclusiveMaximum`, `minLength`/`maxLength`, `pattern`,
`$ref` (`#/definitions/...`), `oneOf`/`anyOf` (yalın),
`x-invariants` (alanlar arası toplam eşitliği — ör. `summary.passed + warnings + errors === summary.total`).

Doğrulayıcının kendi testleri:

```bash
node qa/validate-schema.test.mjs   # 12 senaryo: 3 geçerli + 9 geçersiz
```

## İlişkili betikler

| Betik | Amaç |
|---|---|
| `scripts/dev-all.mjs` | Dört uygulamayı farklı portlarda paralel çalıştırır (3001–3004) |
| `scripts/build-all.mjs` | Uygulamaları sırayla derler (`--concurrent` ile paralel) |
| `scripts/status.mjs` | Dizin/dosya/derleme durumu tablosu (`--json` destekli) |
| `scripts/verify-all.mjs` | Tek komutta sözleşme → birim → şema → derleme zinciri (CI girişi) |
| `scripts/test-all.mjs` | Dört uygulamanın `tests/run-tests.mjs` paketlerini keşfeder ve koşturur |
| `qa/run-all.mjs` | Dört uygulamanın paket/dosya/sürüm sözleşmesi |
| `qa/validate-schema.mjs` | API gövdelerini JSON Şema'ya karşı doğrular |
| `qa/validate-schema.test.mjs` | Doğrulayıcının öz-testleri (geçerli + geçersiz senaryolar) |
| `qa/health-all.mjs` | Çalışan uygulamaların port sağlık kontrolü (yalnızca localhost) |
| `scripts/smoke-pages.mjs` | Ana sayfaların ayırt edici Türkçe içeriği taşıdığını doğrular |
| `seoradar/scripts/smoke.mjs` | Çalışan SeoRadar API'sine karşı canlı sözleşme testi |
| `<app>/tests/run-tests.mjs` | İlgili uygulamanın `lib/` saf fonksiyonları birim testleri |

## Sınırlar

- Bu betik **bir uygulamanın iç mantığını test etmez** — bunun için
  `<app>/tests/` birim testleri (`node scripts/test-all.mjs`) ve
  `seoradar/scripts/smoke.mjs` canlı API testi kullanılır.
- `rea/` dizini bu paketle ilgili değildir; denetlenmez.
- Ağ erişimi gerekmez (yalnızca `--run-build` yerel `npm` kullanır).