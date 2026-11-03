# Test Rehberi

Bu paket dört **bağımsız** uygulamadan oluşur (SeoRadar, KonvertLab, Terneon,
Parselya). Ortak bir test workspace'i yoktur; her uygulama kendi testlerini
taşır, kök dizindeki `qa/` ise **sözleşme** katmanını doğrular.

## Katmanlar

| Katman | Ne doğrular | Komut | Ağ? |
|---|---|---|---|
| Sözleşme | Dizin / package.json / sürüm majörleri / beklenen dosyalar / izolelik | `node qa/run-all.mjs` | Hayır |
| Birim | Her uygulamanın `lib/` saf fonksiyonları | `node scripts/test-all.mjs` | Hayır |
| Şema | API gövdeleri JSON Şema'ya uyuyor mu | `node qa/validate-schema.mjs …` | Hayır |
| Derleme | TypeScript + Next.js hata vermiyor | `node scripts/build-all.mjs` | Hayır |
| Sağlık | Uygulamalar portlarında ayakta mı | `node qa/health-all.mjs` | Yalnızca localhost |
| Sayfa içerik | Ana sayfalar ayırt edici Türkçe içeriği taşıyor mu | `node scripts/smoke-pages.mjs` | Yalnızca localhost |
| Canlı API | `/api/analyze` ve `/api/usage` gerçekten çalışıyor mu | `node seoradar/scripts/smoke.mjs` | Yalnızca localhost |
| Uçtan uca | Tarayıcıda dönüşüm / hesaplıcı / dışa aktarma | Manuel (bkz. altta) | Hayır |

## Hızlı akış (CI'ya uygun)

Tek komut — sözleşme → birim → şema → derleme:

```bash
node scripts/verify-all.mjs              # tam zincir
node scripts/verify-all.mjs --skip-build # hızlı, derlemez
```

Adım adım çalışmak isterseniz:

```bash
# 1) Sözleşme — hızlı, derlemez
node qa/run-all.mjs

# 2) Birim testleri — dört uygulamanınkini de keşfeder
node scripts/test-all.mjs
node scripts/test-all.mjs --only seoradar     # tek uygulama
node scripts/test-all.mjs --only konvertlab,terneon

# 3) Derleme (dört app, sırayla)
node scripts/build-all.mjs

# 4) Örnek yükü şemaya karşı dene
node qa/validate-schema.mjs \
  --schema qa/contracts/analysis-result.schema.json \
  --data qa/contracts/examples/analysis-result.ok.json
```

Bu adımların hepsi **ağ erişimi gerektirmez** ve `node` 20+ ile çalışır.
Kök `package.json` kısayolları: `npm run verify`, `npm run verify:fast`,
`npm test` (= `node scripts/test-all.mjs`), `npm run qa`, `npm run health`.

## Canlı akış

```bash
# Uygulamaları başlat (3001–3004)
node scripts/dev-all.mjs

# Ayrı bir terminalde:
node qa/health-all.mjs
node scripts/smoke-pages.mjs
node seoradar/scripts/smoke.mjs
```

## Uçtan uca kontrol listesi (manuel)

### SeoRadar (`http://localhost:3002`)
- [ ] URL gir → analiz başlıyor, skor halkası animasyonlu geliyor
- [ ] 3 analizden sonra kota bitiyor, Pro modalı açılıyor
- [ ] Kategori filtreleri (Tümü / Kritik Hatalar / On-Page / Teknik / İçerik / Link)
- [ ] Bir kontrol satırını açınca `howToFix` listesi görünüyor; `proDetail` ücretsiz planda bulanık
- [ ] PDF indirme butonu ücretsiz planda Pro modalına götürüyor
- [ ] Rakip karşılaştırma sekmesi ikinci URL'yi analiz ediyor

### KonvertLab (`http://localhost:3001`)
- [ ] TXT yapıştır → PDF indir (Türkçe karakterler: ğüşiöçİĞÜŞÖÇ)
- [ ] PDF bırak → metin çıkıyor, `.txt` olarak iniyor
- [ ] YouTube SRT yapıştır → zaman kodları temizleniyor, PDF e-kitap çıkıyor
- [ ] Dosya seçici/değiştirici ağ isteği atmıyor (DevTools → Network)
- [ ] Pro modalı toplu dönüşümde açılıyor

### Terneon (`http://localhost:3003`)
- [ ] 3 adımlık fiyat hesaplayıcı çalışıyor, sepet yapışkan (sticky) güncelleniyor
- [ ] Toplam TL doğru hesaplanıyor
- [ ] WhatsApp butonu `wa.me` bağlantısını önceden doldurulmuş mesajla açıyor
- [ ] Demo modalı masaüstü/mobil önizleme anahtarını değiştiriyor
- [ ] `config/siteConfig.ts` üzerinden marka adı/fiyat değişince arayüz güncelleniyor

### Parselya (`http://localhost:3004`)
- [ ] Canvas parseli çiziyor, zoom/orbit tepki veriyor
- [ ] GeoJSON poligon doğru yansıtılıyor
- [ ] Timeline oynat/durdur deterministik (`renderAt` aynı zamanda aynı kare)
- [ ] WebM dışa aktarma başlıyor (Chrome/Edge; Firefox'ta `isExportSupported` false olmalı)
- [ ] Kredi sayacı azalıyor, plan değişince artıyor
- [ ] Hiçbir **API anahtarı istenmiyor** (tamamen çevrimdışı)

## Sınırlar

- `qa/run-all.mjs` iç mantığı test **etmez**; yalnızca paket/dosya sözleşmesini doğrular.
- SeoRadar rate limit'i bellek içidir — sunucu yeniden başlayınca sıfırlanır, çok örnekli
  (multi-instance) dağıtımda paylaşılmaz. Bu bilinçli bir sınırdır; dağıtım notları için
  `DEPLOYMENT.md`.
- jsPDF standart fontları WinAnsi olduğundan PDF çıktısında Türkçe karakterler ASCII'ye
  çevrilir (`ğ→g`, `ü→u`, …). Doğru çözüm: TTF fontu VFS'e gömmek. Bkz. `seoradar/lib/pdf.ts`.
- `rea/` dizini bu paketle ilgisizdir; test edilmez.