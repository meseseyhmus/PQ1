import { jsPDF } from "jspdf";

/**
 * Creates an in-memory sample PDF File with realistic document text or table rows
 * so users can test PDF -> Word / PDF -> Excel / PDF -> Images without manual upload.
 */
export function createSamplePdf(type: "document" | "table" = "document"): File {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  if (type === "document") {
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("KURUMSAL FAALIYET RAPORU 2026", 20, 25);

    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text("1. GENEL BAKIS VE OZET", 20, 40);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Bu belge, KonvertLab istemci tarafli PDF donusturucu motorunun test edilmesi\namaciyla otomatik olarak uretilmistir. Tum paragraflar, basliklar ve\nmetin yapisi Microsoft Word (.docx) uyumlu olarak aktarilacaktir.",
      20,
      50
    );

    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text("2. STRATEJIK HEDEFLER", 20, 75);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "- Dijital donusum sureclerinin tamamlanmasi ve hizlandirilmasi.\n- Bulut tabanli guvenli belge yonetimi ve gizlilik standartlari.\n- %100 istemci tarafli guvenlik ve sifreleme garantisi.",
      20,
      85
    );

    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text("3. FINANSAL PERFORMANS TABLOSU", 20, 115);

    doc.setFontSize(10);
    doc.text("Donem\t\tGelir (TL)\t\tGider (TL)\t\tNet Kar (TL)", 20, 125);
    doc.text("2026 Q1\t\t450.000\t\t210.000\t\t240.000", 20, 133);
    doc.text("2026 Q2\t\t580.000\t\t240.000\t\t340.000", 20, 141);
    doc.text("2026 Q3\t\t720.000\t\t290.000\t\t430.000", 20, 149);
  } else {
    // Table specific PDF
    doc.setFontSize(18);
    doc.text("FINANS VE SATIS LISTESI 2026", 20, 25);

    doc.setFontSize(10);
    const headers = "Urun Kodu\tUrun Adi\t\tAdet\tBirim Fiyat\tToplam";
    doc.text(headers, 20, 40);

    const rows = [
      "PRD-001\tBulut Sunucu Paketi\t15\t1.250 TL\t18.750 TL",
      "PRD-002\tSSL Sertifikasi Pro\t45\t350 TL\t15.750 TL",
      "PRD-003\tKurumsal E-Posta 50GB\t30\t180 TL\t5.400 TL",
      "PRD-004\tSEO Denetim Lisansi\t12\t2.400 TL\t28.800 TL",
      "PRD-005\tYedekleme Servisi 1TB\t20\t450 TL\t9.000 TL",
    ];

    rows.forEach((r, idx) => {
      doc.text(r, 20, 50 + idx * 10);
    });
  }

  const blob = doc.output("blob");
  return new File([blob], type === "document" ? "ornek_kurumsal_rapor.pdf" : "ornek_finans_tablosu.pdf", {
    type: "application/pdf",
  });
}

/**
 * Creates an in-memory sample image File (JPEG/PNG) rendered on canvas with text
 * for testing Image -> WebP or OCR Optical Character Recognition.
 */
export function createSampleImage(title = "FATURA NO: 2026-88412"): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Background gradient
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Header banner
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(20, 20, canvas.width - 40, 70);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("RESMİ FATURA BELGESİ", 40, 65);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 20px monospace";
      ctx.fillText(title, 40, 140);

      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText("Alıcı: Örnek Teknoloji Ltd. Şti.", 40, 180);
      ctx.fillText("Tarih: 15 Mart 2026", 40, 210);
      ctx.fillText("Vergi No: 1234567890 (Kadıköy VD)", 40, 240);

      ctx.fillStyle = "#2563eb";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("Hizmet: Bulut Dönüşüm & Lisanslama", 40, 300);

      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("ÖDENECEK TUTAR: 14.500,00 TL", 40, 370);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText("Bu belge KonvertLab Türkçe OCR ve WebP testi için üretilmiştir.", 40, 440);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], "ornek_fatura_belgesi.jpg", { type: "image/jpeg" }));
      } else {
        resolve(new File(["empty"], "ornek.jpg", { type: "image/jpeg" }));
      }
    }, "image/jpeg", 0.95);
  });
}

