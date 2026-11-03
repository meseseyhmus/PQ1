/**
 * Parselya birim testleri — saf format yardımcıları.
 *
 * Kapsam: lib/format.ts (formatNumberTR, formatPriceTL, formatM2,
 * formatSeconds). Ağ/tarayıcı gerektirmez.
 *
 * Çalıştırma: node --import ./tests/register.mjs tests/format.test.mjs
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  formatNumberTR,
  formatPriceTL,
  formatM2,
  formatSeconds,
} from "@/lib/format";

describe("format — formatNumberTR", () => {
  it("tam sayıyı olduğu gibi döndürür", () => {
    expect(formatNumberTR(42)).toBe("42");
  });

  it("binlik ayırıcı nokta koyar (tr-TR)", () => {
    expect(formatNumberTR(1234567)).toBe("1.234.567");
  });

  it("ondalığı en yakın tam sayıya yuvarlar", () => {
    expect(formatNumberTR(1.4)).toBe("1");
    expect(formatNumberTR(1.5)).toBe("2");
  });

  it("yuvarlama sonrası binlik ayırıcı uygulanır", () => {
    expect(formatNumberTR(999999.6)).toBe("1.000.000");
  });

  it("0 ve negatif değerler", () => {
    expect(formatNumberTR(0)).toBe("0");
    expect(formatNumberTR(-1250)).toBe("-1.250");
  });
});

describe("format — formatPriceTL", () => {
  it("sayının arkasına ₺ simgesi ekler", () => {
    expect(formatPriceTL(1250)).toBe("1.250 ₺");
  });

  it("küçük tutarlar", () => {
    expect(formatPriceTL(99)).toBe("99 ₺");
  });
});

describe("format — formatM2", () => {
  it("metrekare soneki ekler", () => {
    expect(formatM2(485)).toBe("485 m²");
  });

  it("büyük alanlarda binlik ayırıcı ile", () => {
    expect(formatM2(12500)).toBe("12.500 m²");
  });
});

describe("format — formatSeconds", () => {
  it("0 saniye → 00:0", () => {
    expect(formatSeconds(0)).toBe("00:0");
  });

  it("saniye iki haneli, ondalık ilk hane gösterilir", () => {
    expect(formatSeconds(9.99)).toBe("09:9");
    expect(formatSeconds(12.34)).toBe("12:3");
  });

  it("dakika aşan süreler olduğu gibi saniye olarak yazılır", () => {
    expect(formatSeconds(65.7)).toBe("65:7");
  });

  it("negatif süre 00:0'a kelepçelenir", () => {
    expect(formatSeconds(-5)).toBe("00:0");
  });

  it("ondalık hanesi aşağı yuvarlanır (floor)", () => {
    // 3.999 → tam 3 saniye, onda 9
    expect(formatSeconds(3.999)).toBe("03:9");
  });
});

run();
