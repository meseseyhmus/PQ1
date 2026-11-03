/**
 * lib/rateLimit.ts birim testleri.
 * Sayaç bellek içidir — her test kendi anahtarını kullanır.
 */

import { describe, it, expect, run } from "./harness.mjs";
import { FREE_DAILY_LIMIT, getUsage, consume } from "../lib/rateLimit.ts";

describe("FREE_DAILY_LIMIT", () => {
  it("3 olarak sabit", () => {
    expect(FREE_DAILY_LIMIT).toBe(3);
  });
});

describe("getUsage", () => {
  it("yeni anahtar → 0/3", () => {
    const u = getUsage("test-get-yeni");
    expect(u.used).toBe(0);
    expect(u.limit).toBe(FREE_DAILY_LIMIT);
  });

  it("tüketimden sonra sayar", () => {
    const key = "test-get-sayim";
    consume(key);
    consume(key);
    const u = getUsage(key);
    expect(u.used).toBe(2);
    expect(u.limit).toBe(FREE_DAILY_LIMIT);
  });

  it("anahtarlar birbirinden bağımsız", () => {
    consume("test-get-izole-a");
    const b = getUsage("test-get-izole-b");
    expect(b.used).toBe(0);
  });
});

describe("consume", () => {
  it("limit içinde allowed=true döner", () => {
    const key = "test-consume-icinde";
    for (let i = 1; i <= FREE_DAILY_LIMIT; i++) {
      const r = consume(key);
      expect(r.allowed).toBeTruthy();
      expect(r.used).toBe(i);
      expect(r.limit).toBe(FREE_DAILY_LIMIT);
    }
  });

  it("limiti aşınca allowed=false, sayı artmaz", () => {
    const key = "test-consume-asim";
    for (let i = 0; i < FREE_DAILY_LIMIT; i++) consume(key);
    const over = consume(key);
    expect(over.allowed).toBeFalsy();
    expect(over.used).toBe(FREE_DAILY_LIMIT);
    expect(over.limit).toBe(FREE_DAILY_LIMIT);

    const again = consume(key);
    expect(again.allowed).toBeFalsy();
    expect(again.used).toBe(FREE_DAILY_LIMIT);
  });

  it("dönen nesne {used, limit, alan alanları içerir}", () => {
    const r = consume("test-consume-sekil");
    expect(typeof r.used).toBe("number");
    expect(typeof r.limit).toBe("number");
    expect(typeof r.allowed).toBe("boolean");
    expect(r.limit).toBe(FREE_DAILY_LIMIT);
    expect(r.used).toBeGreaterThanOrEqual(1);
    expect(r.used).toBeLessThanOrEqual(FREE_DAILY_LIMIT);
  });
});

await run();