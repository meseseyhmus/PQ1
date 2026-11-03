/**
 * lib/urlGuard.ts — SSRF koruması testleri (ağ yok, saf fonksiyon).
 */

import { describe, it, expect, run } from "./harness.mjs";
import { isBlockedHostname, assertPublicHttpUrl } from "../lib/urlGuard.ts";

describe("isBlockedHostname — engellenen hedefler", () => {
  const blocked = [
    "localhost",
    "sub.localhost",
    "api.internal",
    "db.local",
    "printer.home.arpa",
    "127.0.0.1",
    "127.0.0.53",
    "127.1", // kısa yazım → 127.0.0.1
    "0.0.0.0",
    "0x7f000001", // onaltılık → 127.0.0.1
    "0177.0.0.1", // sekizlik → 127.0.0.1
    "2130706433", // onluk → 127.0.0.1
    "10.0.0.5",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254", // bulut metadata
    "100.64.0.1",
    "[::1]",
    "::1",
    "fd00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
  ];
  for (const host of blocked) {
    it(`${host} engellenir`, () => {
      expect(isBlockedHostname(host)).toBe(true);
    });
  }
});

describe("isBlockedHostname — izin verilen hedefler", () => {
  const allowed = [
    "example.com",
    "www.google.com",
    "ornek.com.tr",
    "8.8.8.8", // gerçek public DNS
    "1.1.1.1",
    "172.32.0.1", // 172.16-31 aralığının dışı
    "192.169.0.1", // 192.168 aralığının dışı
    "2606:4700::1111", // public IPv6
  ];
  for (const host of allowed) {
    it(`${host} izinli`, () => {
      expect(isBlockedHostname(host)).toBe(false);
    });
  }
});

describe("assertPublicHttpUrl", () => {
  it("https://example.com geçer", () => {
    const u = assertPublicHttpUrl("https://example.com/sayfa");
    expect(u.hostname).toBe("example.com");
  });

  it("http:// kabul edilir", () => {
    expect(assertPublicHttpUrl("http://example.com").protocol).toBe("http:");
  });

  it("javascript: reddedilir", () => {
    let threw = false;
    try {
      assertPublicHttpUrl("javascript:alert(1)");
    } catch (err) {
      threw = true;
      expect(err.code).toBe("BLOCKED_TARGET");
    }
    expect(threw).toBe(true);
  });

  it("file: ve ftp: reddedilir", () => {
    for (const u of ["file:///etc/passwd", "ftp://ornek.com"]) {
      let threw = false;
      try {
        assertPublicHttpUrl(u);
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    }
  });

  it("userinfo hilesi (https://ornek.com@127.0.0.1) reddedilir", () => {
    let threw = false;
    try {
      assertPublicHttpUrl("https://ornek.com@127.0.0.1/");
    } catch (err) {
      threw = true;
      expect(err.code).toBe("BLOCKED_TARGET");
    }
    expect(threw).toBe(true);
  });

  it("geçersiz URL reddedilir", () => {
    let threw = false;
    try {
      assertPublicHttpUrl("https://");
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});

await run();
