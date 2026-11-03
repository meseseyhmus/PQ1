# Tasarım Sistemi

Dört ürün bilinçli olarak **ortak bir tasarım dili, ayrı marka paletleri**
yaklaşımıyla tasarlanmıştır: aynı spacing/radius/bileşen sözlüğü, farklı renk
ve atmosfer. Bu doküman o ortak dili ve proje bazlı sapmaları tanımlar.

---

## 1. Ortak İlkeler

### 1.1 Dark / light yaklaşımı

| Proje | Tema | Gerekçe |
|---|---|---|
| SeoRadar | Light ana tema, dark-hybrid kartlar (skör, sonuç paneli) | Analiz raporu okunabilirliği için aydınlık zemin; skör görselini koyu kartta öne çıkarma. |
| KonvertLab | Light ana tema, dark-hybrid dönüşüm bölgesi | Araç hissi; çalışma alanını çevre sayfadan ayırır. |
| Terneon | Tam dark neon | Ajans/marka algısı; neon vurgular framer-motion animasyonlarıyla sinerji. |
| Parselya | Tam dark, editör chrome'u | Video editörü konvansiyonu (CapCut/Remotion); uzun süreli kullanımda göz yorgunluğunu azaltır, neon parsel sınırı kontrastı maksimize eder. |

### 1.2 Tipografi

| Rol | Font | Kullanım |
|---|---|---|
| Gövde/UI | **Inter** | Dört üründe de ana metin (`next/font/google`); ekran için optimize, Türkçe glif desteği tam. |
| Başlık/display | **Sora** | Yalnızca Terneon'da (hero/display); diğer üç üründe başlıklar da Inter. |

Hiyerarşi ölçeği (Tailwind varsayılanına yakın): `text-sm` (14) → `text-base`
(16) → `text-lg` (18) → `text-2xl` (24) → `text-4xl` (36) → `text-6xl` (60,
yalnızca hero). Satır yüksekliği gövdede `leading-relaxed`.

### 1.3 Spacing — 8px ölçeği

Tüm boşluklar 8 px tabanlıdır (4 px yalnızca ikon-metin arası mikro boşlukta):

`4 → 8 → 16 → 24 → 32 → 48 → 64 → 96`

Bölüm dikey ritmi: `py-24` (96), kart iç dolgusu `p-6` (24), kartlar arası
`gap-6`, form elemanları arası `space-y-4`.

### 1.4 Radius

| Bileşen | Sınıf | Not |
|---|---|---|
| Kart/panel | `rounded-2xl` (16px) | Dört üründe ortak kart dili. |
| Buton/input | `rounded-xl` (12px) | Kart ile buton arasında 1 kademe fark bilinçli. |
| Badge/pill | `rounded-full` | Etiketler. |

### 1.5 Gölge ve çerçeve

- Light temada yumuşak çok katmanlı gölge (`shadow-sm` + hover'da `shadow-md`).
- Dark temada gölge yerine 1px çerçeve: `border border-white/10` — koyu zeminde
  gölge görünmez, derinlik çerçeve + hafif zemin farkıyla sağlanır.

---

## 2. Proje Paletleri

### 2.1 SeoRadar — `brand` mavisi + `ink` slate

| Token | Değer (Tailwind) | Kullanım |
|---|---|---|
| `brand-600` | Mavi (ana) | Birincil buton, linkler, skör vurgusu. |
| `brand-700/800` | Koyu mavi | Hover, gradient ucu. |
| `ink-900` | Slate-siyah | Light temada ana metin. |
| `ink-600` | Orta slate | İkincil metin, micro-label. |
| `ink-100` | Açık slate | Sayfa zemini (beyaz kart üzerinde). |
| Durum | `green-500` / `amber-500` / `red-500` | pass / warn / fail kartları. |

### 2.2 KonvertLab — cyan/violet accent

| Token | Kullanım |
|---|---|
| `cyan-500` | Birincil aksan: dönüşüm butonu, aktif sekme. |
| `violet-500` | İkincil aksan: YouTube araçları sekmesi, gradient ortağı (`from-cyan-500 to-violet-500`). |
| `slate-*` | Nötr metin/kenarlar (SeoRadar `ink` ile aynı rol). |

### 2.3 Terneon — cyan + violet neon, koyu zemin

| Token | Değer | Kullanım |
|---|---|---|
| Zemin | `#070a12` | Sayfa zemini; saf siyah değil, hafif mavi-siyah. |
| `cyan-400` | `#22d3ee` | Birincil neon: CTA butonu, vurgu çizgileri, hover. |
| `violet-400` | `#a78bfa` | İkincil neon: gradient ortağı, etiketler. |
| Metin | `slate-200/400` | Gövde metni açık gri; koyu zeminde AA kontrastı korur. |
| Cam yüzey | `bg-white/5 + backdrop-blur` | Kartlar, üst bar. |

Neon kullanım kuralı: neon renkler yalnızca **interaktif veya vurgu** öğelerde;
geniş alanlarda asla. Aksi halde "glow çorbası" etkisi oluşur ve CTA kaybolur.

### 2.4 Parselya — neon yeşil + editör chrome

| Token | Değer | Kullanım |
|---|---|---|
| Zemin | `#0b0d12` | Editör chrome'u (paneller, timeline, barlar). |
| `green-500` | `#22c55e` | Neon yeşil: parsel sınırı varsayılanı, birincil aksan, "kaydet/export". |
| Altın `yellow-400` | — | Alternatif parsel sınır rengi. |
| `red-500` | — | Alternatif parsel sınır rengi (kullanıcı seçimi). |
| `slate-800/900` | — | Panel yüzeyleri, timeline katman çubukları. |
| `slate-300/500` | — | Panel metni, ikonlar. |

Zemin farkı bilinçli: Terneon `#070a12` (marka), Parselya `#0b0d12` (editör
nötrlüğü — sahne içeriğine kıyasla daha az mavi ton, uydu görüntüsünün renk
dengesini bozmaz).

---

## 3. Ortak Bileşen Sözlüğü

| Sözcük | Sözleşme | SeoRadar | KonvertLab | Terneon | Parselya |
|---|---|---|---|---|---|
| `btn` | `rounded-xl`, `px-5 py-2.5`, `font-semibold`, boyutlar `sm/md/lg` | `btn-primary` (brand) | `btn-primary` (cyan gradyan) | `btn-neon` (cyan glow) | `btn-editör` (yeşil, kompakt) |
| `card` | `rounded-2xl`, `p-6`, light'ta gölge / dark'ta `border-white/10` | analiz kontrol kartı | dönüşüm paneli | demo vitrin kartı | panel yüzeyi |
| `badge` | `rounded-full`, `text-xs`, `px-3 py-1` | durum rozeti (pass/warn/fail) | format etiketi (TXT/PDF/SRT) | sektör etiketi + güven rozeti | kredi rozeti, katman tipi |
| `micro-label` | `text-xs uppercase tracking-wider`, ikincil renk | bölüm üst etiketi | ayar grubu etiketi | bölüm etiketi | panel sekme başlığı |

Sınıf isimleri projede birebir böyle adlandırılmış olabilir veya Tailwind
utility'leriyle satır içi uygulanmış olabilir; **sözleşme görsel davranıştır**:
aynı rolü üstlenen öğe dört üründe de aynı şekilde davranır.

---

## 4. Erişilebilirlik Kuralları

- **Focus:** Tüm interaktif öğelerde görünür `:focus-visible` halkası (2px,
  aksan renginde, 2px offset). Dark temada halka cyan/yeşil aksan; `outline: none`
  yalnızca kendi focus stili sağlanan bileşenlerde kabul edilir.
- **aria:** İkon-only butonlarda `aria-label` (oynat/duraklat, kapat, indir);
  akordeon ve modal açılır/kapanır durumlarında `aria-expanded` / `aria-hidden`;
  arka planda değişen kullanım/skor bilgisi `aria-live="polite"` bölgesinde.
- **Kontrast:** WCAG AA hedefi — normal metin 4.5:1, büyük metin ve UI ikonları
  3:1. Neon aksanlar koyu zeminde rahatça geçer; light temada ikincil gri metin
  en açık `slate-500` ile sınırlı tutulur. Durum renkleri (yeşil/sarı/kırmızı)
  tek başına anlam taşımaz; her zaman ikon + metinle birlikte gelir.
- **Klavye (Parselya):** timeline oynatma kısayolları (`Space`, `←`/`→`, `Home`)
  henüz uygulanmadı; v0.2 adayıdır. Mevcut kontroller buton/scrubber üzerinden
  klavye ile erişilebilir.
- **Hareket:** hedef, Framer Motion geçişlerinin `prefers-reduced-motion` medya
  sorgusunda kısılarak animasyonlu süreçlerin (skor sayacı, progress bar) bilgiye
  erişimi engellememesidir. (Bu davranış şu an tüm bileşenlerde açıkça
  uygulanmış değildir; zamanla tamamlanacak.)

---

## 5. İkon: `lucide-react`

- **Tree-shake edilebilir:** yalnızca kullanılan ikon bundle'a girer (~1 KB/ikon),
  icon-font CDN maliyeti yoktur.
- **Tutarlılık:** tek çizgi ailesi, tek çizgi kalınlığı (2px varsayılan);
  dört ürün arasında görsel tutarlılık sağlar.
- **İsimlendirme:** deklaratif isimler (`Search`, `FileText`, `MapPin`,
`Download`), Türkçe UI metinleriyle eşleştirmesi kolaydır.
- **Bakım:** aktif bakımda, TypeScript tipleri birinci sınıf.
