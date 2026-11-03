# Dispatch Log

## 2026-11-03T09:36:41Z

Parselya https://parselsorgu.pro/, Terneon https://www.eraslansoftware.com/, https://github.com/orkunisitmak/nashi-app KonvertLab projesini referans al ajanlara bölüp bana @[c:\Users\HUAWEI\Desktop\saas\rea] 

3 SAAT BOYUNCA KESİNTİSİZ GELİŞTİRME VE TAM BİTMİŞ ÜSTÜN KALİTEDE TESLİMAT TALİMATI:

Tüm 4 SaaS uygulamasının referanslara %100 sadık kalarak, en ufak bir eksik veya taklit olmadan, eksiksiz çalışan kodlarla donatılması:

1. Parselya (Port 3004): https://parselsorgu.pro/ referansı
- Sol kenar çubuğu (Sidebar):
  * Üst marka başlığı: P ikonu, ParselSorgu.Pro, Nasıl kullanılır? modalı, Giriş butonu
  * Arama çubuğu: "📍 Akçatarla Nusaybin / Mardin" temizleme butonlu arama alanı
  * Hızlı Ada / Parsel kutuları: "174", "1", "Sorgula" butonu, altında "👆 ya da haritadan seçin"
  * Seçili parsel kartı: Üst ikon araçları (Odakla, Kaydet, Kopyala, Temizle, Kapat), büyük mavi "174 / 1" başlığı, "● Arsa · 2.443 m²" alt başlığı, "Akçatarla, Nusaybin, Mardin" konum satırı
  * Kullanıcı amacı seçici ("Bu parsele neden bakıyorsunuz?"): Krem/bej kart arkalığı, "Emlakçıyım", "Benim", "Almak istiyorum" hap butonları
  * Etiketler: "● Akarsu", "● Çevre Düzeni Planı", "● e-Plan", "⊞ Plan Analizi" (kırmızı 'yeni' rozetli)
  * Sekmeler: "Özet", "Plan ●"
  * Parsel tablosu: Nitelik: Arsa ⓘ, Mevkii: Nusaybin Yolu, Pafta: N46d19b2c, Alan: 2.443 m²
  * Haritada Göster kartı: "Kenar uzunlukları" switch'i (Her kenarın uzunluğu haritaya yazılır)
  * Sabit alt çubuk: "Piyasa 🪙 1" (₺4.886.000 değerleme modalı), "▶ Uçuş" (3D uçuş animasyonu ve MP4/Reels video export), "📤 Paylaş" (kopyalama & paylaşım modalı), "📄 PDF" (resmi kadastro föyü PDF indirme)
- Sağ Harita Alanı:
  * Parselin merkezinde yüzen 4 satırlı kart: 174/1 \n 2.443 m² \n Arsa \n Akçatarla, Nusaybin / Mardin
  * Kenar uzunlukları haritada poligon kenarları boyunca metre cinsinden rozetlerle çizilir (örn: 48.2 m)
  * Canlı TKGM CBS Megsis API entegrasyonu (ilListe -> ilceListe -> mahalleListe -> parsel/{mahalleId}/{ada}/{parsel})
  * Sağ üstte [Harita] [Katmanlar], sağ dikeyde pusula, GPS ve zoom butonları

2. Terneon (Port 3003): https://www.eraslansoftware.com/ referansı
- Üst Menü: <E> Eraslan Software / <T> Terneon Studio, Çalışmalar, Demolar, Hizmetler, Süreç, Sorular, İletişim, EN, karanlık mod ikonu, "Teklif al" siyah hap butonu
- Hero Sol: "— Tasarım ve yazılım stüdyosu, İstanbul", "İşletmenize özel. Her ayrıntısıyla.", "Web siteleri, mobil uygulamalar ve işinizi kolaylaştıran yazılımlar geliştiriyoruz. İlk fikirden yayına, birlikte.", [Projeleri incele ↓], [Fiyat hesapla ↗], "✓ Size özel tasarım  ✓ Önce ücretsiz demo  ✓ Doğrudan iletişim"
- Hero Sağ Vitrin: macOS Safari penceresi (Saklı Cave House Kapadokya mağara oteli, Dokuz oda, oda kartları) + sağ altta üst üste binen iPhone mobil çerçevesi (canlı mobil site, oda seçimi)
- Karusel: Saklı Cave House / Kapadokya Mağara Oteli, < 01 / 06 > sayfalama, önceki/sonraki oklar (6 sektör: Turizm, Sağlık, E-Ticaret, Kafe, SaaS, Lüks Otomotiv)
- Alt etiketler: "Web sitesi / E-ticaret / Mobil uygulama / Özel yazılım"
- Çerez tercihiniz modalı ("Reddet", "Kabul et")
- Fiyat hesaplama terminali ve doğrudan WhatsApp teklif dökümü

3. KonvertLab (Port 3001): https://github.com/orkunisitmak/nashi-app referansı
- %100 istemci taraflı gizlilik
- 1-tık örnek test dosyaları ("Örnek Dosya ile Dene" butonları)
- WebP tasarruf kaydıracı ve boyut simülatörü
- Türkçe Tesseract.js OCR motoru
- Çoklu dosya Batch Pro ZIP arşivi
- İstemci taraflı QR kod üretici

4. SeoRadar (Port 3002):
- 1-tık hazır demo site denetimleri (Trendyol, Hepsiburada, GitHub)
- Google PageSpeed radyal Core Web Vitals kartları (LCP, CLS, FID, INP)
- Nginx, Apache, Next.js güvenlik başlığı kod parçacıkları
- Kurumsal çok sayfalı PDF denetim raporu
- Ajans WhatsApp teklif modalı

Tüm projeler tsc --noEmit, qa/run-all.mjs (86 sözleşme), npm run test:all (373 test) ve Next.js prodüksiyon derlemesini (node scripts/build-all.mjs --skip-install) eksiksiz geçmeli ve 3001, 3002, 3003, 3004 portlarında canlı çalışmalıdır. Tersine mühendislik için c:\Users\HUAWEI\Desktop\saas\rea dizinindeki araçlardan faydalanabilirsiniz.
