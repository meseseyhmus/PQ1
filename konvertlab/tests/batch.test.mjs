/**
 * konvertlab/lib/batch.ts birim testleri.
 * Çalıştırma: node --import ./tests/register.mjs tests/batch.test.mjs
 */
import { describe, it, expect, run } from "./harness.mjs";
import {
  MAX_BATCH_FILES,
  planBatch,
  batchProgress,
  detectFileType,
  recommendTargetFormat,
} from "../lib/batch.ts";

function fakeFiles(n) {
  return Array.from({ length: n }, (_, i) => ({
    name: `not-${i + 1}.txt`,
    size: (i + 1) * 100,
  }));
}

describe("planBatch — kuyruk planlama", () => {
  it("boş girdide boş kuyruk döner", () => {
    const plan = planBatch([]);
    expect(plan.items).toHaveLength(0);
    expect(plan.rejected).toBe(0);
    expect(plan.reason).toBe(undefined);
  });

  it("50 ve altı dosyaların tamamını kabul eder", () => {
    expect(planBatch(fakeFiles(1)).items).toHaveLength(1);
    expect(planBatch(fakeFiles(10)).items).toHaveLength(10);
    const edge = planBatch(fakeFiles(MAX_BATCH_FILES));
    expect(edge.items).toHaveLength(MAX_BATCH_FILES);
    expect(edge.rejected).toBe(0);
    expect(edge.reason).toBe(undefined);
  });

  it("50'den fazlasını reddeder ve neden bildirir", () => {
    const plan = planBatch(fakeFiles(60));
    expect(plan.items).toHaveLength(MAX_BATCH_FILES);
    expect(plan.rejected).toBe(10);
    expect(plan.reason).toBeTruthy();
    expect(plan.reason).toContain("50");
  });

  it("her öğe pending durumunda ve benzersiz kimlikli başlar", () => {
    const plan = planBatch(fakeFiles(5));
    const ids = plan.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(5);
    for (const item of plan.items) {
      expect(item.status).toBe("pending");
      expect(item.error).toBe(undefined);
      expect(typeof item.name).toBe("string");
      expect(typeof item.size).toBe("number");
    }
  });

  it("dosya adı ve boyutunu korur", () => {
    const plan = planBatch([{ name: "rapor.md", size: 2048 }]);
    expect(plan.items[0].name).toBe("rapor.md");
    expect(plan.items[0].size).toBe(2048);
  });
});

describe("batchProgress — ilerleme hesabı", () => {
  it("boş kuyrukta sıfır döner", () => {
    expect(batchProgress([])).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it("tamamlanan (done) dosyaları sayar", () => {
    const items = [
      { id: "1", name: "a.txt", size: 1, status: "done" },
      { id: "2", name: "b.txt", size: 1, status: "pending" },
      { id: "3", name: "c.txt", size: 1, status: "running" },
      { id: "4", name: "d.txt", size: 1, status: "done" },
    ];
    expect(batchProgress(items)).toEqual({ done: 2, total: 4, percent: 50 });
  });

  it("hatalı dosyaları da tamamlanmış sayar", () => {
    const items = [
      { id: "1", name: "a.txt", size: 1, status: "error", error: "oku" },
      { id: "2", name: "b.txt", size: 1, status: "done" },
      { id: "3", name: "c.txt", size: 1, status: "pending" },
    ];
    expect(batchProgress(items)).toEqual({ done: 2, total: 3, percent: 67 });
  });

  it("hepsi tamamlanınca yüzde 100 olur", () => {
    const items = [
      { id: "1", name: "a.txt", size: 1, status: "done" },
      { id: "2", name: "b.txt", size: 1, status: "done" },
    ];
    expect(batchProgress(items).percent).toBe(100);
  });

  it("çalışan dosyalar ilerlemeye katkı vermez", () => {
    const items = [
      { id: "1", name: "a.txt", size: 1, status: "running" },
      { id: "2", name: "b.txt", size: 1, status: "running" },
    ];
    expect(batchProgress(items)).toEqual({ done: 0, total: 2, percent: 0 });
  });
});

describe("detectFileType & recommendTargetFormat — Karışık Dosya Tipleri", () => {
  it("TXT ve Markdown uzantılarını tanır", () => {
    expect(detectFileType("notlar.txt")).toBe("txt");
    expect(detectFileType("README.md")).toBe("md");
    expect(detectFileType("belge.markdown")).toBe("md");
  });

  it("PDF dosyalarını tanır", () => {
    expect(detectFileType("fatura.pdf")).toBe("pdf");
    expect(detectFileType("RAPOR.PDF")).toBe("pdf");
  });

  it("Görsel formatlarını tanır", () => {
    expect(detectFileType("foto.png")).toBe("image");
    expect(detectFileType("resim.jpg")).toBe("image");
    expect(detectFileType("manzara.jpeg")).toBe("image");
    expect(detectFileType("logo.webp")).toBe("image");
    expect(detectFileType("cizim.svg")).toBe("image");
  });

  it("Bilinmeyen uzantılarda unknown döner", () => {
    expect(detectFileType("arsiv.zip")).toBe("unknown");
    expect(detectFileType("program.exe")).toBe("unknown");
  });

  it("Önerilen hedef formatları doğru eşler", () => {
    expect(recommendTargetFormat("txt")).toBe("pdf");
    expect(recommendTargetFormat("md")).toBe("pdf");
    expect(recommendTargetFormat("pdf")).toBe("docx");
    expect(recommendTargetFormat("image")).toBe("webp");
    expect(recommendTargetFormat("unknown")).toBe("pdf");
  });
});

run();

