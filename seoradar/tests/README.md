# SeoRadar Birim Testleri

`lib/` altındaki **saf fonksiyonların** testleri. Ağ erişimi yoktur, veritabanı
yoktur, ek test çerçevesi (jest/vitest) yoktur — sıfır bağımlılık.

## Çalıştırma

```bash
# hepsi
node seoradar/tests/run-tests.mjs
# veya
cd seoradar && npm test

# tek dosya
node seoradar/tests/run-tests.mjs --only format
node seoradar/tests/run-tests.mjs --only analyze
node seoradar/tests/run-tests.mjs --only rateLimit
```

Çıkış kodu: `0` = hepsi geçti, `1` = en az bir başarısız.

## Dosyalar

| Dosya | Kapsadığı modül |
|---|---|
| `format.test.mjs` | `lib/format.ts` — `formatBytes`, `formatNumberTR`, `formatPriceTL`, `formatDuration`, `normalizeUrl`, `isValidUrl` |
| `analyze.test.mjs` | `lib/analyze.ts` — `extractMetrics`, `buildChecks`, `computeScore`, `gradeFor` |
| `rateLimit.test.mjs` | `lib/rateLimit.ts` — `FREE_DAILY_LIMIT`, `getUsage`, `consume` |
| `harness.mjs` | Mini test koşucu (`describe` / `it` / `expect` / `run`) |

## Notlar

- Node **24+** `.ts` dosyalarını doğrudan yükleyebilir (type stripping);
  bu yüzden testler `.ts` modüllerini import eder. Node 22 altındaysanız
  `--experimental-strip-types` ekleyin.
- `rateLimit.test.mjs` her testte **farklı anahtar** kullanır; sayaç bellek
  içidir ve süreç sonunda sıfırlanır.
- `analyze.test.mjs` içindeki HTML örneği ağdan çekilmez; `extractMetrics`
  doğrudan dize alır.
- Testler **API route'larını** kapsamaz — onlar için canlı sözleşme testi:
  `node seoradar/scripts/smoke.mjs` (bkz. `scripts/SMOKE.md`).

## Sınırlar

- `lib/pdf.ts` (jsPDF) tarayıcı DOM'una bağlı olduğu için burada test edilmez.
- `checkBrokenLinks` ve `analyzeUrl` ağ çağrısı yapar; birim testlerinin
  dışındadır — smoke testi bunları canlı doğrular.