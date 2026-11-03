/**
 * lib/format.ts birim testleri.
 * Node 24 doğrudan .ts dosyalarını yükleyebilir (type stripping).
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  formatBytes,
  formatNumberTR,
  formatPriceTL,
  formatDuration,
  normalizeUrl,
  isValidUrl,
} from "../lib/format.ts";

describe("formatBytes", () => {
  it("0 ve negatif → '0 B'", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-5)).toBe("0 B");
  });
  it("1 KB sınırı", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
  });
  it("1.5 KB", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
  it("MB / GB", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 1024 * 3)).toBe("3.0 GB");
  });
  it("küçük bayt", () => {
    expect(formatBytes(512)).toBe("512.0 B");
  });
});

describe("formatNumberTR", () => {
  it("binlik ayraç (tr-TR)", () => {
    const s = formatNumberTR(1234567);
    expect(s).toBe("1.234.567");
  });
  it("küçük sayı", () => {
    expect(formatNumberTR(42)).toBe("42");
  });
});

describe("formatPriceTL", () => {
  it("TL simgesi içerir", () => {
    const s = formatPriceTL(14900);
    expect(s).toContain("₺");
    expect(s).toContain("14.900");
  });
  it("ondalık yuvarlanır", () => {
    expect(formatPriceTL(0)).toContain("0");
  });
});

describe("formatDuration", () => {
  it("1000 ms altı → ms", () => {
    expect(formatDuration(450)).toBe("450 ms");
  });
  it("1 sn üzeri → sn", () => {
    expect(formatDuration(1500)).toBe("1.50 sn");
  });
  it("tam 1000 ms", () => {
    expect(formatDuration(1000)).toBe("1.00 sn");
  });
});

describe("normalizeUrl", () => {
  it("https:// korunur", () => {
    expect(normalizeUrl("https://ornek.com")).toBe("https://ornek.com");
  });
  it("http:// korunur", () => {
    expect(normalizeUrl("http://ornek.com")).toBe("http://ornek.com");
  });
  it("şemasız → https:// eklenir", () => {
    expect(normalizeUrl("ornek.com")).toBe("https://ornek.com");
  });
  it("boşluklar kırpılır", () => {
    expect(normalizeUrl("  ornek.com  ")).toBe("https://ornek.com");
  });
  it("boş girdi", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
  });
});

describe("isValidUrl", () => {
  it("geçerli http/https", () => {
    expect(isValidUrl("https://ornek.com")).toBeTruthy();
    expect(isValidUrl("http://ornek.com/yol?s=1")).toBeTruthy();
    expect(isValidUrl("ornek.com")).toBeTruthy();
  });
  it("geçersiz girdiler", () => {
    expect(isValidUrl("")).toBeFalsy();
    expect(isValidUrl("javascript:alert(1)")).toBeFalsy();
    expect(isValidUrl("ftp://ornek.com")).toBeFalsy();
    expect(isValidUrl("not a url at all !!")).toBeFalsy();
  });
});

await run();