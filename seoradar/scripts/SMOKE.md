# SeoRadar Smoke Testi

Çalışan bir SeoRadar örneğine karşı **canlı API sözleşmesi** testi.
Birim testlerinin (`tests/`) kapsamadığı HTTP katmanını doğrular.

## Ön koşul

```bash
# Ayrı terminalde sunucuyu başlat
node scripts/dev-all.mjs --only seoradar
# veya
cd seoradar && npm run dev
```

Sunucu `http://127.0.0.1:3002` üzerinde dinliyor olmalı.

## Çalıştırma

```bash
node seoradar/scripts/smoke.mjs

# özel hedef
node seoradar/scripts/smoke.mjs --base http://127.0.0.1:3002
node seoradar/scripts/smoke.mjs --url https://example.com

# kota sınırını da dene (3 ücretsiz istek → 429)
node seoradar/scripts/smoke.mjs --quota

# zaman aşımı (ms)
node seoradar/scripts/smoke.mjs --timeout 60000
```

Çıkış kodu: `0` = hepsi geçti, `1` = en az bir başarısız.

## Ne doğrulanıyor?

| # | Kontrol | Beklenen |
|---|---|---|
| 1 | `GET /api/usage` | 200, şema uygun, `ok:true`, `usage.{used,limit}` sayı |
| 2 | `POST /api/analyze` | 200, `AnalysisResult` şeması + `passed+warnings+errors===total` |
| 2b | stabil check id'leri | 20 id eksiksiz (`title` … `html-weight`) |
| 2c | `score` / `grade` | 0–100, harf notu dolu |
| 2d | `plan` / `dailyUsage` | `free\|pro`, sayaç sayıları |
| 3 | geçersiz URL | 400 + `code: INVALID_URL` + `AnalyzeError` şeması |
| 4 | *(opsiyonel, `--quota`)* | 429 + `code: RATE_LIMIT` + `dailyUsage` |

Şema doğrulaması `qa/validate-schema.mjs` üzerinden yapılır — smoke testi
sözleşmeleri **aynı** doğrulayıcıyla okur, ikinci bir tanım yoktur.

## Şemalar

- `qa/contracts/analysis-result.schema.json`
- `qa/contracts/analysis-error.schema.json`
- `qa/contracts/usage-response.schema.json`

## Sınırlar

- **Ağ gerekir** (yalnızca hedef sunucu; dışarıya istek atılmaz).
- `--quota` testi sunucu bellek içi sayacını doldurur; sunucu yeniden
  başlayana kadar o IP için ücretsiz kota kapanır. Yalnızca geliştirme
  ortamında çalıştırın.
- Hedef URL varsayılan olarak `https://example.com` (hızlı, kararlı).
  Yavaş bir hedef için `--timeout` artırın.
- Kırık bağlantı taraması canlı hedefin yanıtına bağlıdır; smoke testi
  `links-broken` sonuç değerini değil, **alanın varlığını** doğrular.