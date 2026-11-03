# KonvertLab Birim Testleri

KonvertLab'ın saf (istemci tarafı, ağ erişimi gerektirmeyen) fonksiyonları için
sıfır bağımlılıklı birim testleri. Hiçbir npm paketi kurulmaz; Node.js'un
TypeScript type-stripping desteğiyle `.ts` kaynakları doğrudan import edilir.

## Çalıştırma

```bash
cd konvertlab
npm test            # veya: node tests/run-tests.mjs
```

Tek bir dosyayı çalıştırmak için:

```bash
node --import ./tests/register.mjs tests/srtParse.test.mjs
node --import ./tests/register.mjs tests/format.test.mjs
```

## Dosyalar

| Dosya | Görev |
|---|---|
| `harness.mjs` | Küçük `describe` / `it` / `expect` / `run` test koşucusu |
| `register.mjs` | `--import` ile modül kancasını kaydeder |
| `alias-hook.mjs` | `@/…` takma adını konvertlab köküne çözer (tsconfig `paths` karşılığı) |
| `run-tests.mjs` | Her `.test.mjs` dosyasını ayrı süreçte çalıştıran giriş noktası |
| `srtParse.test.mjs` | `lib/srtParse.ts` — SRT/WebVTT ayrıştırma, temizleme, istatistikler, maddeleme |
| `format.test.mjs` | `lib/format.ts` — bayt/süre biçimleme, kelime sayımı; `lib/cn.ts` — sınıf birleştirme |

## Kurallar

- Testler ağ erişimi yapmaz, tarayıcı API'leri (File, Blob, document) kullanmaz.
- `run-tests.mjs` her testi ayrı süreçte çalıştırır; `--import` yolu
  `pathToFileURL(...).href` ile verilir (Windows uyumluluğu).
- Yeni test dosyaları `*.test.mjs` adıyla bu dizine eklendiğinde otomatik çalışır.
