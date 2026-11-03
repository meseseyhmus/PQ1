# Sözleşmeler (Contracts)

Bu dizin, uygulamaların **dışarıya açtıkları gövdelerin** (API response)
JSON Şemalarını ve geçerli örnek yüklerini tutar. Şemalar yalnızca SeoRadar'ın
HTTP API'sini kapsar — KonvertLab %100 istemci tarafı olduğu için sunucu
gövdesi yoktur; Terneon ve Parselya ise statik/istemci uygulamalardır.

## Dosyalar

| Dosya | Kapsam |
|---|---|
| `analysis-result.schema.json` | `POST /api/analyze` → `AnalysisResult` |
| `analysis-error.schema.json` | `POST /api/analyze` hata gövdesi → `AnalyzeError` |
| `usage-response.schema.json` | `GET /api/usage` → `{ ok, usage, plan }` |
| `examples/analysis-result.ok.json` | Geçerli tam örnek (20 check + metrics) |
| `examples/analysis-error.rate-limit.json` | 429 kota hatası örneği |
| `examples/usage-response.ok.json` | Ücretsiz plan kota gövdesi örneği |

## Doğrulama

```bash
# Örnek yükü şemaya karşı dene (smoke test öncesi kuru çalışma)
node qa/validate-schema.mjs \
  --schema qa/contracts/analysis-result.schema.json \
  --data qa/contracts/examples/analysis-result.ok.json

# Canlı gövdeyi doğrula
curl -s -X POST http://localhost:3002/api/analyze \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com"}' \
  | node qa/validate-schema.mjs \
      --schema qa/contracts/analysis-result.schema.json --data -
```

## Değişmezler (invariant)

`AnalysisResult.summary` için:

```
passed + warnings + errors === total
```

Bu kural şemada `x-invariants` ile tanımlıdır ve `qa/validate-schema.mjs`
tarafından alanlar arası kontrol edilir. Kırık gövde `[FAIL]` ile reddedilir.

`checks` dizisi en az 10 öğe içermeli ve şu stabil `id` değerlerini
barındırmalı: `title`, `meta-description`, `h1`, `heading-hierarchy`,
`images-alt`, `images-dimensions`, `links-structure`, `links-broken`,
`https`, `robots-txt`, `sitemap`, `open-graph`, `twitter-card`,
`structured-data`, `viewport`, `html-lang`, `canonical`, `content-length`,
`hreflang`, `html-weight`.

## Sürümleme

Şema değişikliği **kırıcı değişiklik** sayılır. Yeni alan eklemek için
`additionalProperties` kuralına uyun; mevcut bir alanı yeniden adlandırmak
veya tipini değiştirmek istemcileri (PDF raporu, smoke testleri, UI)
bozar — bunun yerine yeni alan ekleyip eskisini `deprecated` olarak belgeleyin.