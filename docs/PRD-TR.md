# Ürün Gereksinim Dokümanı (Türkçe)

Bu doküman, paketin kapsandığı dört ürünün vizyonunu, hedef kitlesini, gelir
modellerini ve gereksinimlerini yapılandırılmış biçimde özetler. Kaynak gereksinim
notlarının yeniden düzenlenmiş ve sadeleştirilmiş hâlidir.

---

## 1. Vizyon

Tek bir çatı altında, birbirinden bağımsız ama aynı mühendislik disipliniyle
üretilmiş **dört Türkçe, gelir odaklı web ürünü**:

- **SeoRadar** — herkesin erişebildiği, saniyeler içinde sonuç veren SEO analizi.
- **KonvertLab** — sunucuya hiçbir şey göndermeyen, tamamen tarayıcıda çalışan
  doküman ve metin aracı.
- **Terneon** — "önce demo gör, sonra öde" felsefeli web ajans satış platformu.
- **Parselya** — emlakçıların saniyeler içinde sosyal medya kalitesinde arsa
  tanıtım videosu ürettiği editör.

Ortak ilkeler: Türkçe arayüz, hızlı ilk yükleme, ücretsiz değer sunup üstünde
Pro/abonelik katmanı satmak, mümkün olan her yerde istemci tarafı işlem.

## 2. Hedef Kitle

| Ürün | Hedef kitle |
|---|---|
| SeoRadar | Site sahipleri, freelance SEO'cular, ajanslar, içerik üreticileri. |
| KonvertLab | Öğrenciler, ofis çalışanları, YouTube içerik üreticileri (senaryo/altyazı ihtiyacı olanlar). |
| Terneon | KOBİ'ler ve girişimciler: klinik, e-ticaret, güzellik merkezi, otel, kafe/restoran, kurumsal. |
| Parselya | Gayrimenkul danışmanları ve arsa satıcıları; sosyal medya üzerinden (Reels/TikTok) pazarlayan emlak profesyonelleri. |

## 3. Gelir Modeli Tablosu

| Ürün | Ücretsiz | Ücretli | Yan gelir |
|---|---|---|---|
| SeoRadar | Günde 3 analiz, temel rapor | Pro abonelik (aylık/yıllık): sınırsız analiz, detaylı metrikler, white-label PDF | AdSense, hosting/SEO affiliate |
| KonvertLab | Tek dosya dönüşümleri | Pro: 50 dosyaya kadar toplu dönüşüm + reklamsız deneyim | AdSense (yüksek organik trafik) |
| Terneon | — (satış sitesi) | Sektörel hazır/özel web sitesi satışı, ek özellik modülleri, aylık bakım/animasyon aboneliği | — |
| Parselya | Filigranlı/düşük çözünürlük deneme | Kredi paketleri veya abonelik: filigransız HD/4K export | — |

---

## 4. SeoRadar

**Problem:** Site sahipleri teknik SEO sorunlarını anlamak için pahalı ajanslar
veya karmaşık/İngilizce araçlara muhtaç; hızlı, Türkçe, eyleme dönük bir bakış açısı yok.

**Çözüm — MVP özellikleri**

- URL girilen sitenin On-Page + teknik analizi: title, meta description, H1–H6
  yapısı, görsel `alt` eksikleri, iç/dış linkler, kırık link kontrolü,
  `robots.txt`/`sitemap.xml`/HTTPS/Open Graph kontrolleri.
- Ağırlıklı 0–100 skor + kritik/uyarı/başarılı özeti; renk kodlu kontrol
  kartları ve her biri için "nasıl çözülür" önerisi.
- Rakip karşılaştırma sekmesi: ikinci bir URL'yi analiz edip yan yana kıyaslama
  (uygulamada mevcuttur).
- PDF rapor (Pro), bulanıklaştırılmış Pro alanları, fiyatlandırma tablosu
  (Ücretsiz/Pro/Ajans), AdSense alanları.

**KPI:** analiz başına ortalama süre, ücretsiz→Pro dönüşüm oranı, tekrar
kullanım (haftalık aktif kullanıcı), PDF indirme oranı.

**Kapsam dışı:** anahtar kelime sıralama takibi, backlink analizi, çoklu dil
arayüzü.

**Teknik kısıtlar:** analiz sunucuda yapılır (CORS/robots); cheerio ile statik
HTML analizi — JS ile client-side render edilen içerikler tam görülmez;
jsPDF WinAnsi kısıtı nedeniyle PDF'te Türkçe glifler için gömülü TTF gerekir
(ARA: geçici çözüm ASCII transliterasyon).

## 5. KonvertLab

**Problem:** Basit dosya dönüşümleri için kullanıcılar su dosyası yükleyen,
reklamla boğulmuş, gizlilik açısından riskli sitelere yöneliyor.

**Çözüm — MVP özellikleri**

- TXT→PDF: yazı tipi boyutu, kenar boşluğu, hizalama ayarları; Türkçe
  karakterli çıktı.
- PDF→TXT: sayfa sayfa metin ayıklama, ekranda düzenlenebilir editör, `.txt`
  indirme.
- YouTube araçları sekmesi: SRT/altyazı → temiz metin → PDF e-kitap/sunum.
- Drag & drop, dosya boyut göstergesi, ilerleme çubuğu; AdSense alanları;
  Pro modalı (toplu dönüşüm).

**KPI:** organik trafik (SEO'dan), dönüşüm oturumu/işlem oranı, Pro dönüşüm,
sayfa başına reklam geliri (RPM).

**Kapsam dışı:** görüntü formatları arası dönüşüm, OCR (taranan PDF'ten metin
çıkarma), bulut depolama, hesap sistemi (v0.2'ye kadar).

**Teknik kısıtlar:** %100 client-side — `pdfjs-dist` worker'da çalışır;
taranmış/görüntüsel PDF'lerden metin çıkmaz; büyük PDF'lerde performans
worker ayrımına bağlı.

## 6. Terneon

**Problem:** KOBİ'ler web sitesi alırken ne alacağını göremiyor; ajanslar
güven inşa etmek için pahalı satış süreçleri yürütüyor.

**Çözüm — MVP özellikleri**

- "Önce ücretsiz demo, sonra ödeme" vurgulu hero; akıcı animasyonlar.
- Sektörel canlı demo vitrini: kategori filtreleri (sağlık, e-ticaret, güzellik,
  otel, kafe/restoran, kurumsal), iframe modal ile masaüstü/mobil canlı gezinti.
- 3 adımlı interaktif fiyat hesaplayıcı: temel hizmet (kurumsal 12.000 TL /
  e-ticaret 20.000 TL / özel uygulama 30.000 TL), ek modüller (panel +3.000,
  SEO +3.000, çoklu dil +2.500, chatbot +4.000, GSAP/3D animasyon +5.000 TL),
  aylık/yıllık bakım aboneliği.
- Sticky özet sepet; "WhatsApp'tan Teklif Al" ile seçimlerin otomatik mesaj
  metnine dönüştürülmesi.

**KPI:** demo vitrini etkileşim oranı, hesaplayıcı tamamlama oranı,
WhatsApp tıklama → teklif dönüşümü, ortalama sepet tutarı.

**Kapsam dışı:** online ödeme ile self-servis site satın alma, kullanıcı
hesapları, çoklu dil arayüzü, CMS (v0.2).

**Teknik kısıtlar:** tüm veri `config/siteConfig.ts`'te; canlı demolar
üçüncü taraf iframe'ler olduğundan çevrimdışı çalışmaz.

## 7. Parselya

**Problem:** Arsa tanıtım videoları (uydu görünüm + parsel vurgusu) profesyonel
montaj gerektiriyor; emlakçı bunu hızlı ve markalı üretemiyor.

**Çözüm — MVP özellikleri**

- Sol panel: tapu/parsel sorgu (il, ilçe, mahalle, ada, parsel) veya KML/GeoJSON
  yükleme; bilgi etiketleri (m², fiyat, imar durumu, "yola cephe", mesafe);
  stil (neon yeşil/altın/kırmızı sınır, dolgu opaklığı) ve kamera hareketi
  (zoom-in / orbit).
- Orta sahne: 9:16 veya 16:9 canvas önizleme; oynat/duraklat/baştan ve süre göstergesi.
- Alt panel: 0–15 sn timeline — kamera katmanı, sınır çizim animasyonu, etiket
  giriş/çıkışları.
- Üst bar: marka, kredi göstergesi ("3 kredi kaldı — paket yükselt"),
  `MediaRecorder` tabanlı video export (WebM; MP4 tarayıcı desteğine bağlı).

**KPI:** üretilen video sayısı, kredi tüketimi/dolumu, filigranlı→ücretli
export dönüşümü, ortalama editör oturum süresi.

**Kapsam dışı:** gerçek tapu/parsel servisi (v0.2; şimdilik demo veri + manuel
GeoJSON), bulutta render, müzik kütüphanesi/lisans, video düzenleme (kes/birleştir).

**Teknik kısıtlar:** export tarayıcıya bağlı (WebM birincil; Safari'de MP4
kısıtlı — wasm transkod v0.2); 15 sn üstü render'lar gerçek zamanlı kayıt
süresi kadar sürer.

---

## 8. Yasal Çerçeve

- Bu paketteki **hiçbir kod üçüncü taraf sitelerden kopyalanmamıştır**;
  ürünler PRD'deki işlevsel gereksinimlerden sıfırdan, özgün markalarla
  (SeoRadar, KonvertLab, Terneon, Parselya) yazılmıştır.
- Referans alınan siteler üzerinde yapılan **tersine mühendislik, yalnızca
  kamuya açık işlevsel davranışın anlaşılmasına** yönelikti: tarayıcıya açık
  ağ isteklerinin gözlemlenmesi ve dışarıdan görünen veri yapılarının incelenmesi.
  Hiçbir telifli varlık (kod, görsel, metin, marka) yeniden kullanılmamıştır.
- Marka adları ve tüm arayüz metinleri özgündür; referans sitelerin markaları
  ürünlerde kullanılmamıştır.
- Yer tutucu demo içerikleri ve reklam alanları, lansman öncesi kendi
  lisanslı/ürettiğimiz içeriklerle doldurulacaktır.
