# Parselya — Birim Testleri

Parselya (ada/parsel uydu video animasyon editörü) için sıfır-bağımlılık
birim testleri. npm paketi gerektirmez; Node 24'ün yerleşik TypeScript tip
soyması (type stripping) ile `lib/*.ts` dosyaları doğrudan import edilir.

## Çalıştırma

```bash
node parselya/tests/run-tests.mjs                  # tüm testler
node parselya/tests/run-tests.mjs --only geo       # yalnızca geo.test.mjs
node parselya/tests/run-tests.mjs --only camera    # yalnızca camera.test.mjs
node parselya/tests/run-tests.mjs --only format    # yalnızca format.test.mjs
```

ya da parselya dizininden:

```bash
npm test
```

Çıkış kodu `0` = hepsi geçti, `1` = en az bir test başarısız.
Ağ erişimi gerekmez; tarayıcı API'si (`canvas`, `MediaRecorder`,
`HTMLVideoElement`) kullanan kod (`lib/exportVideo.ts`) bilinçli olarak
test edilmez — yalnızca saf matematik/fonksiyonlar test edilir.

## Dosyalar

| Dosya             | Açıklama                                                        |
| ----------------- | --------------------------------------------------------------- |
| `harness.mjs`     | Minimal test koşucusu: `describe`, `it`, `expect`, `run`         |
| `register.mjs`    | `node:module` `register()` ile alias kancasını yükler           |
| `alias-hook.mjs`  | `@/…` takma adını parselya köküne çözen çözümleme kancası       |
| `run-tests.mjs`   | Her `*.test.mjs` dosyasını ayrı süreçte çalıştıran toplu koşucu |
| `geo.test.mjs`    | GeoJSON projeksiyonu (`lib/geo.ts`) + demo parsel verisi        |
| `camera.test.mjs` | Kamera yolu / interpolasyon (`lib/camera.ts`)                   |
| `format.test.mjs` | Format yardımcıları (`lib/format.ts`)                           |

## Test edilen konular

- **geo** — `normalizePolygon` (tekrar eden nokta ayıklama), `centroid`
  (shoelace formülü, bozulmuş poligon fallback'i), `bbox`,
  `haversineMeters` (küre yüzeyi mesafesi), `polygonPerimeterMeters`,
  `makeLocalProjection` (lng/lat → metre, merkez (0,0), kuzey = negatif y),
  `makeScreenProjection` (9:16 ve 16:9 kadrajda merkezleme, contentSize
  sınırlaması, determinizm), `findParcel` (demo kayıt eşleşmesi,
  büyük-küçük harf duyarsızlık, sentetik parsel determinizmi),
  `mulberry32` (deterministik RNG, [0,1) aralığı).
- **camera** — `easeOutCubic` (uç değerler, kelepceleme, monotonluk),
  `computeCamera`: t=0 ve t=duration uç durumları, zoom-in ölçek aralığı
  (2.6 → 1 @ yoğunluk 0.5), yoğunluk etkisi, orbit tam tur (2π) ve salınım
  sınırı, aralık dışı t kelepçelenmesi, duration=0, determinizm.
- **format** — `formatNumberTR` (tr-TR binlik ayırıcı, yuvarlama),
  `formatPriceTL` (₺), `formatM2` (m²), `formatSeconds` (ss:d formatı,
  negatif kelepceleme, ondalık floor).
