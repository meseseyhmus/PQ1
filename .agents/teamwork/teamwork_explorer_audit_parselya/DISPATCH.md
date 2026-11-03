## 2026-11-03T08:56:44Z
From: d1debc50-0d01-49fe-9fbb-ac1195300479

You are explorer_audit_parselya. Your working directory is c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\teamwork_explorer_audit_parselya\.
You MUST read the original request at: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at: c:\Users\HUAWEI\Desktop\saas\.agents\teamwork\orchestrator\PROJECT.md

Your task is a rigorous technical audit and gap analysis of `parselya` (Port 3004) against https://parselsorgu.pro/ and the user's checklist:
1. Sol kenar çubuğu (Sidebar):
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
2. Sağ Harita Alanı:
  * Parselin merkezinde yüzen 4 satırlı kart: 174/1 \n 2.443 m² \n Arsa \n Akçatarla, Nusaybin / Mardin
  * Kenar uzunlukları haritada poligon kenarları boyunca metre cinsinden rozetlerle çizilir (örn: 48.2 m)
  * Canlı TKGM CBS Megsis API entegrasyonu (ilListe -> ilceListe -> mahalleListe -> parsel/{mahalleId}/{ada}/{parsel})
  * Sağ üstte [Harita] [Katmanlar], sağ dikeyde pusula, GPS ve zoom butonları

Investigate the code in `parselya/components/`, `parselya/lib/`, `parselya/app/`, and `parselya/__tests__/`.
Detail every component, line of code, and test. Verify if each feature is fully implemented or if there are any bugs, visual flaws, missing details, or stubbed logic.
Write your analysis to `analysis.md` and complete handoff to `handoff.md` in your working directory.
Communicate back with send_message with a summary and reference to your handoff report.
