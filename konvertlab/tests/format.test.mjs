/**
 * konvertlab/lib/format.ts ve konvertlab/lib/cn.ts birim testleri.
 * Çalıştırma: node --import ./tests/register.mjs tests/format.test.mjs
 */
import { describe, it, expect, run } from "./harness.mjs";
import {
  formatBytes,
  formatDuration,
  countWords,
  readingTimeMinutes,
} from "../lib/format.ts";
import { cn } from "../lib/cn.ts";

describe("formatBytes — bayt biçimleme", () => {
  it("1024 bayt altında değerleri olduğu gibi gösterir", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("kilobaytları bir ondalıkla gösterir", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10240)).toBe("10.0 KB");
  });

  it("megabaytları iki ondalıkla gösterir", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
    expect(formatBytes(1572864)).toBe("1.50 MB");
  });

  it("geçersiz ve negatif değerlerde '0 B' döner", () => {
    expect(formatBytes(-5)).toBe("0 B");
    expect(formatBytes(NaN)).toBe("0 B");
    expect(formatBytes(Infinity)).toBe("0 B");
  });
});

describe("formatDuration — süre biçimleme (Türkçe)", () => {
  it("sadece saniyeleri gösterir", () => {
    expect(formatDuration(5)).toBe("5 sn");
    expect(formatDuration(59)).toBe("59 sn");
  });

  it("dakika ve saniyeyi birleştirir", () => {
    expect(formatDuration(125)).toBe("2 dk 5 sn");
  });

  it("tam dakikalarda saniye göstermez", () => {
    expect(formatDuration(120)).toBe("2 dk");
    expect(formatDuration(3600)).toBe("1 sa");
  });

  it("saat, dakika ve saniyeyi birleştirir", () => {
    expect(formatDuration(3725)).toBe("1 sa 2 dk 5 sn");
  });

  it("sıfır, negatif ve geçersiz girdide '0 sn' döner", () => {
    expect(formatDuration(0)).toBe("0 sn");
    expect(formatDuration(-10)).toBe("0 sn");
    expect(formatDuration(NaN)).toBe("0 sn");
  });
});

describe("countWords — kelime sayımı", () => {
  it("boş ve boşluktan ibaret girdide 0 döner", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });

  it("boşluklarla ayrılmış kelimeleri sayar", () => {
    expect(countWords("bir iki üç")).toBe(3);
  });

  it("çoklu boşlukları tek boşluk gibi sayar", () => {
    expect(countWords("  bir   iki  ")).toBe(2);
  });

  it("satır sonlarını da ayraç sayar", () => {
    expect(countWords("bir\niki\tüç")).toBe(3);
  });
});

describe("readingTimeMinutes — okuma süresi tahmini", () => {
  it("boş metin dahil en az 1 dakika döner", () => {
    expect(readingTimeMinutes(0)).toBe(1);
  });

  it("200 kelime 1 dakikadır", () => {
    expect(readingTimeMinutes(200)).toBe(1);
  });

  it("300 kelime 2 dakikaya yuvarlanır", () => {
    expect(readingTimeMinutes(300)).toBe(2);
  });
});

describe("cn — sınıf birleştirme", () => {
  it("koşullu sınıfları filtreleyip birleştirir", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("çakışan Tailwind sınıflarında son kazananı tutar", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("çakışmayan sınıfları yan yana korur", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("boş girdide boş dizgi döner", () => {
    expect(cn()).toBe("");
    expect(cn(null, undefined, false)).toBe("");
  });
});

run();
