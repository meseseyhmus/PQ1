import { jsPDF } from "jspdf";
import type { AnalysisResult, CheckItem, Severity } from "@/types";

/**
 * PDF rapor üretimi — Kurumsal ve Ahrefs/Seocu Seviyesinde.
 *
 * Karakter desteği: jsPDF standart Helvetica/Times fontları WinAnsi (Latin-1)
 * tabanlıdır. Tüm Türkçe karakterler ve özel noktalama işaretleri burada
 * kusursuz, kayıpsız ASCII/Latin-1 karşılıklarına güvenle eşlenir.
 */

const TR_MAP: Record<string, string> = {
  ğ: "g", Ğ: "G", ü: "u", Ü: "U", ş: "s", Ş: "S",
  ı: "i", İ: "I", ö: "o", Ö: "O", ç: "c", Ç: "C",
  â: "a", Â: "A", î: "i", Î: "I", û: "u", Û: "U", ê: "e", Ê: "E",
  "’": "'", "‘": "'", "“": '"', "”": '"', "–": "-", "—": "-",
  "•": "*", "…": "...", "₺": "TL", "™": "(TM)", "®": "(R)", "©": "(C)",
};

export function safe(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/[ğĞüÜşŞıİöÖçÇâÂîÎûÛêÊ’‘“”–—•…₺™®©]/g, (ch) => TR_MAP[ch] ?? ch)
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " "); // yazdırılamayan glifleri temizle
}

const SEV_LABEL: Record<Severity, string> = {
  success: "BASARILI",
  warning: "UYARI",
  error: "HATA",
  info: "BILGI",
};

const SEV_COLOR: Record<Severity, [number, number, number]> = {
  success: [16, 149, 93],    // emerald
  warning: [217, 119, 6],    // amber
  error: [225, 29, 72],      // rose
  info: [37, 99, 235],       // blue
};

export interface PdfOptions {
  brandName?: string;
  planLabel?: string;
  watermark?: boolean;
  competitorResult?: AnalysisResult | null;
  agencyPhone?: string;
  agencyEmail?: string;
}

export function generateAnalysisPdf(
  result: AnalysisResult,
  options: PdfOptions = {}
): jsPDF {
  const brand = options.brandName ?? "SeoRadar";
  const watermark = options.watermark ?? result.plan === "free";
  const agencyPhone = options.agencyPhone ?? "+90 (532) 000 00 00";
  const agencyEmail = options.agencyEmail ?? "ajans@seoradar.com";

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 18;

  // Sayfa sonu taşmalarını kesin önleyen yardımcı
  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin - 12) {
      doc.addPage();
      y = margin + 8;
    }
  };

  const line = (text: string, size = 10, style: "normal" | "bold" | "italic" = "normal") => {
    ensureSpace(size * 0.45 + 3.5);
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.text(safe(text), margin, y);
    y += size * 0.42 + 2.4;
  };

  const wrap = (
    text: string,
    size = 8.5,
    style: "normal" | "bold" | "italic" = "normal",
    indent = 0,
    textColor: [number, number, number] = [60, 60, 60]
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...textColor);
    const lines = doc.splitTextToSize(safe(text), contentW - indent) as string[];
    lines.forEach((l) => {
      ensureSpace(size * 0.42 + 2);
      doc.text(l, margin + indent, y);
      y += size * 0.42 + 1.8;
    });
  };

  /* -------------------------------------------------------------------------- */
  /*  1. Kapak ve Üst Bilgi Başlığı                                             */
  /* -------------------------------------------------------------------------- */
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageW, 36, "F");

  // Accent bar
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 35, pageW, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(safe(`${brand} — Teknik SEO & Performans Denetim Raporu`), margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text(safe(`Hedef URL: ${result.url}`), margin, 23);
  doc.text(
    safe(`Tarih: ${new Date(result.metrics.fetchedAt).toLocaleString("tr-TR")}`),
    margin,
    29
  );

  const planText = options.planLabel ?? (result.plan === "pro" ? "PRO RAPOR (White-Label)" : "Ucretsiz Denetim");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(safe(planText), pageW - margin - doc.getTextWidth(safe(planText)), 29);

  y = 45;
  doc.setTextColor(20, 20, 20);

  /* -------------------------------------------------------------------------- */
  /*  2. Yönetici Özeti & Skor Kartı                                             */
  /* -------------------------------------------------------------------------- */
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "FD");

  // Skor dairesi
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(15, 23, 42);
  doc.text(String(result.score), margin + 8, y + 18);

  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  doc.text(`/100`, margin + 30, y + 14);
  doc.setFontSize(11);
  doc.setTextColor(16, 149, 93);
  doc.text(safe(`Not: ${result.grade}`), margin + 30, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    safe(
      `Basarili: ${result.summary.passed}  ·  Uyari: ${result.summary.warnings}  ·  Kritik Hata: ${result.summary.errors}  ·  Toplam: ${result.summary.total} Denetim Noktasi`
    ),
    margin + 62,
    y + 13
  );
  doc.text(
    safe(
      `Sunucu Yanit Suresi: ${result.metrics.loadTimeMs} ms  ·  Sayfa Boyutu: ${(result.metrics.htmlSizeBytes / 1024).toFixed(1)} KB  ·  Kelime: ${result.metrics.wordCount}`
    ),
    margin + 62,
    y + 20
  );

  y += 36;
  doc.setTextColor(20, 20, 20);

  /* -------------------------------------------------------------------------- */
  /*  3. Core Web Vitals (CWV) Google PageSpeed Metrikleri                      */
  /* -------------------------------------------------------------------------- */
  if (result.cwv) {
    ensureSpace(42);
    line("1. Core Web Vitals (Google Hiz & Kullanici Deneyimi)", 13, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      safe(
        `CWV Genel Puani: ${result.cwv.overallScore}/100  ·  Genel Durum: ${result.cwv.overallRating.toUpperCase()} (Google 2024+ Siralama Algoritmasi)`
      ),
      margin,
      y
    );
    y += 5.5;

    const cwvCards: [string, string, string, string, string][] = [
      [
        "LCP (Largest Contentful Paint)",
        `${(result.cwv.lcp.value / 1000).toFixed(2)} sn (${result.cwv.lcp.value} ms)`,
        result.cwv.lcp.rating.toUpperCase(),
        `Oge: ${result.cwv.lcp.element}`,
        result.cwv.lcp.recommendation,
      ],
      [
        "CLS (Cumulative Layout Shift)",
        String(result.cwv.cls.value),
        result.cwv.cls.rating.toUpperCase(),
        `Boyutsuz Gorsel: ${result.cwv.cls.unconstrainedImages} adet`,
        result.cwv.cls.recommendation,
      ],
      [
        "FID (First Input Delay)",
        `${result.cwv.fid.value} ms`,
        result.cwv.fid.rating.toUpperCase(),
        `Gecikme standardi: < 100 ms`,
        result.cwv.fid.recommendation,
      ],
      [
        "INP (Interaction to Next Paint)",
        `${result.cwv.inp.value} ms`,
        result.cwv.inp.rating.toUpperCase(),
        `Yeni Nesil Google 2024 Metrigi`,
        result.cwv.inp.recommendation,
      ],
    ];

    cwvCards.forEach(([metricTitle, val, rating, diag, rec]) => {
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);

      const isGood = rating === "GOOD";
      const isWarn = rating === "NEEDS-IMPROVEMENT";
      doc.setTextColor(isGood ? 16 : isWarn ? 217 : 225, isGood ? 149 : isWarn ? 119 : 29, isGood ? 93 : isWarn ? 6 : 72);
      doc.text(safe(`[${rating}] ${metricTitle}: ${val}`), margin + 2, y);
      y += 4.2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(safe(`Tespit: ${diag}`), margin + 6, y);
      y += 3.8;

      wrap(`Eylem Plani: ${rec}`, 7.5, "normal", 6, [90, 90, 90]);
      y += 2;
    });

    y += 4;
    doc.setTextColor(20, 20, 20);
  }

  /* -------------------------------------------------------------------------- */
  /*  4. HTTP Güvenlik Başlıkları Denetimi                                      */
  /* -------------------------------------------------------------------------- */
  if (result.securityHeaders) {
    ensureSpace(40);
    line("2. HTTP Guvenlik Basliklari & Sifreleme Standartlari", 13, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      safe(
        `Guvenlik Skoru: ${result.securityHeaders.score}/100 (Not: ${result.securityHeaders.grade})  ·  ${result.securityHeaders.passedCount}/6 Baslik Etkin`
      ),
      margin,
      y
    );
    y += 5.5;

    const secHeaders = Object.values(result.securityHeaders.headers);
    secHeaders.forEach((sec) => {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(sec.present ? 16 : 225, sec.present ? 149 : 29, sec.present ? 93 : 72);
      doc.text(
        safe(`${sec.present ? "[TANIMLI]" : "[EKSIK]"} ${sec.name} (${sec.headerKey})`),
        margin + 2,
        y
      );
      y += 4.2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      wrap(
        sec.present
          ? `Mevcut Deger: ${sec.value ?? "Aktif"}`
          : `Cozum: ${sec.recommendation}`,
        8,
        "normal",
        6,
        [80, 80, 80]
      );
      y += 1.5;
    });

    y += 4;
    doc.setTextColor(20, 20, 20);
  }

  /* -------------------------------------------------------------------------- */
  /*  5. Rakip Karşılaştırma Matrisi (Varsa)                                    */
  /* -------------------------------------------------------------------------- */
  if (options.competitorResult) {
    const comp = options.competitorResult;
    ensureSpace(48);
    line("3. Rakip Karşılaştırma & Benchmark Matrisi", 13, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(safe(`Hedef: ${result.url}   vs   Rakip: ${comp.url}`), margin, y);
    y += 6;

    const matrixRows: [string, string, string, string][] = [
      [
        "Genel SEO Skoru",
        `${result.score}/100 (${result.grade})`,
        `${comp.score}/100 (${comp.grade})`,
        result.score >= comp.score ? "Siteniz Onde" : "Rakip Onde",
      ],
      [
        "Core Web Vitals Puani",
        `${result.cwv?.overallScore ?? "—"}/100`,
        `${comp.cwv?.overallScore ?? "—"}/100`,
        (result.cwv?.overallScore ?? 0) >= (comp.cwv?.overallScore ?? 0) ? "Siteniz Onde" : "Rakip Onde",
      ],
      [
        "LCP (Yuklenme Boyama)",
        `${result.cwv ? (result.cwv.lcp.value / 1000).toFixed(2) + " sn" : "—"}`,
        `${comp.cwv ? (comp.cwv.lcp.value / 1000).toFixed(2) + " sn" : "—"}`,
        (result.cwv?.lcp.value ?? 9999) <= (comp.cwv?.lcp.value ?? 9999) ? "Siteniz Onde" : "Rakip Onde",
      ],
      [
        "CLS (Sayfa Kaymasi)",
        `${result.cwv?.cls.value ?? "—"}`,
        `${comp.cwv?.cls.value ?? "—"}`,
        (result.cwv?.cls.value ?? 1) <= (comp.cwv?.cls.value ?? 1) ? "Siteniz Onde" : "Rakip Onde",
      ],
      [
        "Guvenlik Basliklari",
        `${result.securityHeaders?.score ?? "—"}/100`,
        `${comp.securityHeaders?.score ?? "—"}/100`,
        (result.securityHeaders?.score ?? 0) >= (comp.securityHeaders?.score ?? 0) ? "Siteniz Onde" : "Rakip Onde",
      ],
      [
        "Sunucu Yanit Suresi",
        `${result.metrics.loadTimeMs} ms`,
        `${comp.metrics.loadTimeMs} ms`,
        result.metrics.loadTimeMs <= comp.metrics.loadTimeMs ? "Siteniz Onde" : "Rakip Onde",
      ],
      [
        "Icerik Kelime Sayisi",
        `${result.metrics.wordCount} kelime`,
        `${comp.metrics.wordCount} kelime`,
        result.metrics.wordCount >= comp.metrics.wordCount ? "Siteniz Onde" : "Rakip Onde",
      ],
      [
        "Kritik Hata Sayisi",
        `${result.summary.errors} hata`,
        `${comp.summary.errors} hata`,
        result.summary.errors <= comp.summary.errors ? "Siteniz Onde" : "Rakip Onde",
      ],
    ];

    // Tablo başlığı
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentW, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("Karsilastirma Metrigi", margin + 3, y + 4.2);
    doc.text("Siteniz", margin + 65, y + 4.2);
    doc.text("Rakip", margin + 115, y + 4.2);
    doc.text("Durum", margin + 150, y + 4.2);
    y += 7;

    matrixRows.forEach(([metricName, valA, valB, winner]) => {
      ensureSpace(5.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(safe(metricName), margin + 3, y);

      doc.setFont("helvetica", "normal");
      doc.text(safe(valA), margin + 65, y);
      doc.text(safe(valB), margin + 115, y);

      const isSiteAhead = winner === "Siteniz Onde";
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isSiteAhead ? 16 : 147, isSiteAhead ? 149 : 51, isSiteAhead ? 93 : 234);
      doc.text(safe(winner), margin + 150, y);
      y += 5;
    });

    y += 4;
    doc.setTextColor(20, 20, 20);
  }

  /* -------------------------------------------------------------------------- */
  /*  6. Detaylı Kontroller Listesi (Kategori Kategori)                          */
  /* -------------------------------------------------------------------------- */
  ensureSpace(20);
  line("4. Detayli Teknik Denetim Maddeleri", 13, "bold");

  const byCat = result.checks.reduce<Record<string, CheckItem[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  const catLabel: Record<string, string> = {
    onpage: "Sayfa Ici (On-Page) SEO",
    technical: "Teknik SEO & Altyapi",
    content: "Icerik & Semantik Metin",
    links: "Link Yapisi & Baglantilar",
  };

  Object.entries(byCat).forEach(([cat, items]) => {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(79, 70, 229); // indigo
    doc.text(safe(catLabel[cat] ?? cat), margin, y);
    y += 5.5;

    items.forEach((c) => {
      ensureSpace(15);
      const [r, g, b] = SEV_COLOR[c.severity];
      doc.setFillColor(r, g, b);
      doc.circle(margin + 2.5, y - 1, 1.4, "F");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(safe(`${SEV_LABEL[c.severity]} · ${c.title}`), margin + 6.5, y);
      y += 4.2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      wrap(c.summary, 8, "normal", 6.5, [71, 85, 105]);

      if (c.value && c.value.length < 140) {
        wrap(`Olcum: ${c.value}`, 7.5, "normal", 6.5, [100, 116, 139]);
      }

      if (c.howToFix && c.howToFix.length > 0) {
        c.howToFix.slice(0, 2).forEach((tip) => {
          wrap(`• Oneri: ${tip}`, 7.5, "normal", 8.5, [90, 90, 90]);
        });
      }

      y += 2;
    });

    y += 3;
  });

  /* -------------------------------------------------------------------------- */
  /*  7. Kurumsal Ajans & Teklif Çağrısı Kutusu                                  */
  /* -------------------------------------------------------------------------- */
  ensureSpace(34);
  doc.setDrawColor(79, 70, 229);
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(margin, y, contentW, 30, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.text(safe("KURUMSAL SEO & CORE WEB VITALS DANISMANLIGI — SeoRadar Agency"), margin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    safe(
      "Web sitenizin Google ilk sayfaya yukselmesi, Core Web Vitals metriklerinin tumuyle 'Iyi' seviyesine gelmesi"
    ),
    margin + 6,
    y + 14
  );
  doc.text(
    safe(
      "ve organik ciro buyumesi icin uzman kadromuz tarafindan ozel bir yol haritasi olusturulabilir."
    ),
    margin + 6,
    y + 19
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    safe(
      `Hizli Teklif & Iletisim: ${agencyPhone}   ·   WhatsApp Destek   ·   E-Posta: ${agencyEmail}`
    ),
    margin + 6,
    y + 25
  );

  y += 38;

  /* -------------------------------------------------------------------------- */
  /*  8. Sayfa Numaraları ve Filigran                                            */
  /* -------------------------------------------------------------------------- */
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Alt bilgi çizgisi
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      safe(`${brand} · ${result.url} · Rapor No: SR-${Date.now().toString().slice(-6)}`),
      margin,
      pageH - 7
    );
    doc.text(
      safe(`Sayfa ${p} / ${totalPages}`),
      pageW - margin - doc.getTextWidth(safe(`Sayfa ${p} / ${totalPages}`)),
      pageH - 7
    );

    // Ücretsiz filigranı
    if (watermark) {
      doc.setFontSize(32);
      doc.setTextColor(240, 240, 245);
      doc.text(safe(`${brand} · Ucretsiz Rapor`), pageW / 2 - 50, pageH / 2, {
        angle: 35,
      });
    }
  }

  return doc;
}

export function downloadAnalysisPdf(result: AnalysisResult, options?: PdfOptions) {
  const doc = generateAnalysisPdf(result, options);
  const host = (() => {
    try {
      return new URL(result.url).hostname.replace(/[^a-z0-9]/gi, "_");
    } catch {
      return "site";
    }
  })();
  doc.save(`seoradar_rapor_${host}_${Date.now()}.pdf`);
}