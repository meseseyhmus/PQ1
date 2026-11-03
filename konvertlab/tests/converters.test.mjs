/**
 * konvertlab/tests/converters.test.mjs
 * DOCX, Excel, WebP, OCR ve ZIP birim testleri.
 */

import { describe, it, expect, run } from "./harness.mjs";
import { isHeadingLine, textToDocxParagraphs } from "../lib/docxGenerate.ts";
import {
  parseDelimitedTextToRows,
  clusterItemsIntoTableRows,
} from "../lib/pdfExtract.ts";
import { convertTextToExcel } from "../lib/excelGenerate.ts";
import { calculateSavings } from "../lib/imageConvert.ts";
import { formatOcrStatus } from "../lib/ocrEngine.ts";
import { createZipArchive } from "../lib/zipHelper.ts";
import { createSamplePdf } from "../lib/sampleFiles.ts";
import QRCode from "qrcode";

describe("docxGenerate — Başlık ve Paragraf Ayrıştırma", () => {
  it("Markdown tarzı başlıkları tanır", () => {
    const h1 = isHeadingLine("# Ana Başlık");
    expect(h1.isHeading).toBe(true);

    const h2 = isHeadingLine("## İkinci Düzey Başlık");
    expect(h2.isHeading).toBe(true);

    const h3 = isHeadingLine("### Alt Başlık");
    expect(h3.isHeading).toBe(true);
  });

  it("Numaralı bölümleri başlık olarak tanır", () => {
    const res = isHeadingLine("1. Giriş ve Amaç");
    expect(res.isHeading).toBe(true);

    const sub = isHeadingLine("2.3 Sistem Mimarisi");
    expect(sub.isHeading).toBe(true);
  });

  it("Kısa ve tamamı büyük harf satırları başlık tanır", () => {
    const res = isHeadingLine("YILLIK FAALİYET RAPORU");
    expect(res.isHeading).toBe(true);
  });

  it("Normal gövde metnini başlık saymaz", () => {
    const normal = isHeadingLine("Bu standart bir paragraf metnidir ve başlık olmamalıdır.");
    expect(normal.isHeading).toBe(false);

    const empty = isHeadingLine("");
    expect(empty.isHeading).toBe(false);
  });

  it("Metinden Paragraph listesi oluşturur", () => {
    const text = "# Başlık\n\nİlk paragraf metni.\nİkinci satır.";
    const paras = textToDocxParagraphs(text);
    expect(paras.length >= 2).toBe(true);
  });
});

describe("excelGenerate & pdfExtract — Tablo ve Sütun Ayrıştırma", () => {
  it("Tab ile ayrılmış satırları sütunlara böler", () => {
    const input = "Ürün\tFiyat\tAdet\nElma\t25\t10\nArmut\t30\t5";
    const rows = parseDelimitedTextToRows(input);
    expect(rows.length).toBe(3);
    expect(rows[0]).toEqual(["Ürün", "Fiyat", "Adet"]);
    expect(rows[1]).toEqual(["Elma", "25", "10"]);
  });

  it("Noktalı virgül (CSV) satırlarını sütunlara böler", () => {
    const input = "Ad;Soyad;Şehir\nAli;Yılmaz;Ankara";
    const rows = parseDelimitedTextToRows(input);
    expect(rows.length).toBe(2);
    expect(rows[0]).toEqual(["Ad", "Soyad", "Şehir"]);
    expect(rows[1]).toEqual(["Ali", "Yılmaz", "Ankara"]);
  });

  it("Markdown tablo satırlarını sütunlara böler ve ayraçları eler", () => {
    const input = "| Başlık 1 | Başlık 2 |\n| --- | --- |\n| Veri A | Veri B |";
    const rows = parseDelimitedTextToRows(input);
    expect(rows.length).toBe(2);
    expect(rows[0]).toEqual(["Başlık 1", "Başlık 2"]);
    expect(rows[1]).toEqual(["Veri A", "Veri B"]);
  });

  it("Çoklu boşlukla ayrılmış sütunları böler", () => {
    const input = "Sıra    Açıklama    Tutar\n1       Fatura      500 TL";
    const rows = parseDelimitedTextToRows(input);
    expect(rows.length).toBe(2);
    expect(rows[0]).toEqual(["Sıra", "Açıklama", "Tutar"]);
  });

  it("clusterItemsIntoTableRows Y ve X koordinatlarına göre gruplar", () => {
    const rawItems = [
      { str: "Sütun1", transform: [1, 0, 0, 1, 50, 700], width: 40 },
      { str: "Sütun2", transform: [1, 0, 0, 1, 150, 700], width: 40 },
      { str: "Değer1", transform: [1, 0, 0, 1, 50, 680], width: 40 },
      { str: "Değer2", transform: [1, 0, 0, 1, 150, 680], width: 40 },
    ];
    const rows = clusterItemsIntoTableRows(rawItems);
    expect(rows.length).toBe(2);
    expect(rows[0]).toEqual(["Sütun1", "Sütun2"]);
    expect(rows[1]).toEqual(["Değer1", "Değer2"]);
  });

  it("convertTextToExcel XLSX Blob oluşturur", () => {
    const text = "A1\tB1\nA2\tB2";
    const { blob, rows } = convertTextToExcel(text, "TestSheet");
    expect(rows.length).toBe(2);
    expect(blob).toBeTruthy();
    expect(blob.size > 0).toBe(true);
  });
});

describe("imageConvert — WebP ve Boyut Tasarrufu Hesabı", () => {
  it("calculateSavings doğru yüzde ve bayt tasarrufu hesaplar", () => {
    const { bytesSaved, percentSaved } = calculateSavings(1000, 300);
    expect(bytesSaved).toBe(700);
    expect(percentSaved).toBe(70);
  });

  it("calculateSavings yeni boyut büyürse negatif tasarruf üretmez", () => {
    const { bytesSaved, percentSaved } = calculateSavings(500, 600);
    expect(bytesSaved).toBe(0);
    expect(percentSaved).toBe(0);
  });

  it("calculateSavings sıfır orijinal boyutta sıfır döner", () => {
    const { bytesSaved, percentSaved } = calculateSavings(0, 0);
    expect(bytesSaved).toBe(0);
    expect(percentSaved).toBe(0);
  });
});

describe("ocrEngine — OCR Durum Metinleri", () => {
  it("formatOcrStatus İngilizce durumları Türkçe açıklamalara çevirir", () => {
    expect(formatOcrStatus("loading tesseract core")).toContain("OCR motoru yükleniyor");
    expect(formatOcrStatus("recognizing text")).toContain("Metin taranıyor");
    expect(formatOcrStatus("loading language traineddata")).toContain("Dil modeli");
  });

  it("Bilinmeyen durumlarda orijinal metni döner", () => {
    expect(formatOcrStatus("custom-status")).toBe("custom-status");
  });
});

describe("zipHelper — Arşivleme", () => {
  it("createZipArchive dosyaları sıkıştırıp geçerli ZIP Blob döner", async () => {
    const entries = [
      { name: "test1.txt", content: "Merhaba Dünya" },
      { name: "test2.txt", content: "KonvertLab Test Dosyası" },
    ];
    const zipBlob = await createZipArchive(entries);
    expect(zipBlob).toBeTruthy();
    expect(zipBlob.size > 0).toBe(true);
  });
});

describe("sampleFiles — Örnek Dosya Üretimi (1-Tık Test)", () => {
  it("createSamplePdf('document') geçerli kurumsal rapor PDF dosyası üretir", () => {
    const file = createSamplePdf("document");
    expect(file).toBeTruthy();
    expect(file.name).toBe("ornek_kurumsal_rapor.pdf");
    expect(file.type).toBe("application/pdf");
    expect(file.size > 0).toBe(true);
  });

  it("createSamplePdf('table') geçerli finans tablosu PDF dosyası üretir", () => {
    const file = createSamplePdf("table");
    expect(file).toBeTruthy();
    expect(file.name).toBe("ornek_finans_tablosu.pdf");
    expect(file.type).toBe("application/pdf");
    expect(file.size > 0).toBe(true);
  });
});

describe("qrcode — Hızlı QR Kod Üretimi (Nashi Benchmark)", () => {
  it("QRCode.toString geçerli vektör SVG dizisi üretir", async () => {
    const svg = await QRCode.toString("https://konvertlab.com", { type: "svg" });
    expect(svg).toBeTruthy();
    expect(svg.includes("<svg")).toBe(true);
    expect(svg.includes("<path")).toBe(true);
  });
});

run();
