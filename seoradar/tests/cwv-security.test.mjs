/**
 * Core Web Vitals (CWV), HTTP Güvenlik Başlıkları ve PDF Benchmark birim testleri.
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  calculateCoreWebVitals,
  inspectSecurityHeaders,
  extractMetrics,
  buildChecks,
} from "../lib/analyze.ts";
import { generateAnalysisPdf } from "../lib/pdf.ts";

describe("calculateCoreWebVitals — Algoritmik Sentetik CWV", () => {
  it("hızlı ve optimize sayfada LCP, CLS, FID iyi (good) döner", () => {
    const vitals = calculateCoreWebVitals({
      loadTimeMs: 150,
      htmlSizeBytes: 25 * 1024,
      images: { total: 2, missingDimensions: 0 },
      technical: { scriptCount: 3, stylesheetCount: 1, inlineStyles: 0 },
      headings: { h1: ["Hızlı Sayfa Başlığı"] },
      domElementsCount: 45,
    });

    expect(vitals.lcp.value).toBeLessThanOrEqual(2500);
    expect(vitals.lcp.rating).toBe("good");
    expect(vitals.lcp.score).toBeGreaterThanOrEqual(80);

    expect(vitals.cls.value).toBeLessThanOrEqual(0.1);
    expect(vitals.cls.rating).toBe("good");
    expect(vitals.cls.score).toBeGreaterThanOrEqual(80);

    expect(vitals.fid.value).toBeLessThanOrEqual(100);
    expect(vitals.fid.rating).toBe("good");

    expect(vitals.overallScore).toBeGreaterThanOrEqual(80);
    expect(vitals.overallRating).toBe("good");
    expect(vitals.lcp.element).toContain("Öne Çıkan Görsel");
  });

  it("yavaş ve ağır sayfada LCP zayıf (poor) veya geliştirilmeli döner", () => {
    const vitals = calculateCoreWebVitals({
      loadTimeMs: 2500,
      htmlSizeBytes: 800 * 1024,
      images: { total: 40, missingDimensions: 30 },
      technical: { scriptCount: 45, stylesheetCount: 10, inlineStyles: 50 },
      headings: { h1: ["Ağır Sayfa"] },
      domElementsCount: 1500,
    });

    expect(vitals.lcp.value).toBeGreaterThan(2500);
    expect(["needs-improvement", "poor"]).toContain(vitals.lcp.rating);

    // Boyutsuz 30 görsel yüzünden CLS artmalı
    expect(vitals.cls.value).toBeGreaterThan(0.1);
    expect(vitals.cls.unconstrainedImages).toBe(30);

    // Çok sayıda script yüzünden FID/INP yükselmeli
    expect(vitals.fid.value).toBeGreaterThan(40);
    expect(vitals.inp.value).toBeGreaterThan(vitals.fid.value);
  });

  it("görsel olmayan sayfada LCP başlık/metin bloğuna dayanır", () => {
    const vitals = calculateCoreWebVitals({
      loadTimeMs: 200,
      htmlSizeBytes: 10 * 1024,
      images: { total: 0, missingDimensions: 0 },
      technical: { scriptCount: 1, stylesheetCount: 1, inlineStyles: 0 },
      headings: { h1: ["Sadece Metin"] },
      domElementsCount: 20,
    });

    expect(vitals.lcp.element).toContain("Ana Başlık Bloğu");
    expect(vitals.cls.value).toBeLessThanOrEqual(0.05);
  });
});

describe("inspectSecurityHeaders — HTTP Yanıt Başlıkları", () => {
  it("tüm güvenlik başlıkları tanımlı ise tam puan ve A+ notu alır", () => {
    const headers = {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Content-Security-Policy": "default-src 'self'; script-src 'self'",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    };

    const sec = inspectSecurityHeaders(headers, true);

    expect(sec.score).toBe(100);
    expect(sec.grade).toBe("A+");
    expect(sec.passedCount).toBe(6);
    expect(sec.headers.hsts.present).toBeTruthy();
    expect(sec.headers.csp.present).toBeTruthy();
    expect(sec.headers.xFrameOptions.present).toBeTruthy();
    expect(sec.headers.xContentTypeOptions.present).toBeTruthy();
    expect(sec.headers.referrerPolicy.present).toBeTruthy();
    expect(sec.headers.permissionsPolicy.present).toBeTruthy();
  });

  it("başlıklar eksikse düşük puan ve F notu alır, öneriler üretilir", () => {
    const emptyHeaders = {};
    const sec = inspectSecurityHeaders(emptyHeaders, true);

    expect(sec.score).toBeLessThan(40);
    expect(sec.grade).toBe("F");
    expect(sec.passedCount).toBe(0);
    expect(sec.headers.hsts.present).toBeFalsy();
    expect(sec.headers.csp.present).toBeFalsy();
    expect(sec.headers.xFrameOptions.recommendation).toContain("X-Frame-Options");
  });

  it("büyük/küçük harf duyarsız başlık okur", () => {
    const mixedCase = {
      "strict-transport-security": "max-age=16000000",
      "X-FRAME-OPTIONS": "SAMEORIGIN",
      "x-content-type-options": "nosniff",
    };

    const sec = inspectSecurityHeaders(mixedCase, true);
    expect(sec.headers.hsts.present).toBeTruthy();
    expect(sec.headers.xFrameOptions.present).toBeTruthy();
    expect(sec.headers.xContentTypeOptions.present).toBeTruthy();
    expect(sec.score).toBeGreaterThan(40);
  });
});

describe("extractMetrics & buildChecks — CWV, Güvenlik ve Başlık Atlamaları", () => {
  const SKIPPED_HEADINGS_HTML = `<!doctype html>
  <html>
  <head><title>Test</title></head>
  <body>
    <h1>Ana Başlık</h1>
    <h3>Atlanmış Başlık (H2 yok)</h3>
    <h5>Bir Kez Daha Atlanmış (H4 yok)</h5>
    <img src="/foto.jpg">
  </body>
  </html>`;

  it("başlık seviyesi atlamalarını doğru tespit eder", () => {
    const m = extractMetrics(SKIPPED_HEADINGS_HTML, "https://test.com", "https://test.com", 100);
    expect(m.headings.skips.length).toBeGreaterThanOrEqual(1);
    expect(m.headings.skips[0].fromLevel).toBe(1);
    expect(m.headings.skips[0].toLevel).toBe(3);

    const checks = buildChecks(m);
    const headingCheck = checks.find((c) => c.id === "heading-hierarchy");
    expect(headingCheck).toBeTruthy();
    expect(headingCheck?.summary).toContain("atlama");
  });

  it("buildChecks içinde core-web-vitals ve security-headers kontrolleri bulunur", () => {
    const m = extractMetrics(SKIPPED_HEADINGS_HTML, "https://test.com", "https://test.com", 100);
    const checks = buildChecks(m);

    const cwv = checks.find((c) => c.id === "core-web-vitals");
    const sec = checks.find((c) => c.id === "security-headers");

    expect(cwv).toBeTruthy();
    expect(sec).toBeTruthy();
    expect(cwv?.category).toBe("technical");
    expect(sec?.category).toBe("technical");
  });
});

describe("generateAnalysisPdf — PDF Raporu ve Benchmark", () => {
  it("CWV, Güvenlik Başlıkları ve Rakip Benchmark içeren geçerli PDF üretir", () => {
    const html = `<!doctype html><html><head><title>Sitem</title></head><body><h1>H1</h1><p>Metin</p></body></html>`;
    const m = extractMetrics(html, "https://sitem.com", "https://sitem.com", 120);
    const checks = buildChecks(m);

    const result = {
      url: "https://sitem.com",
      score: 88,
      grade: "A",
      checks,
      metrics: m,
      cwv: m.cwv,
      securityHeaders: m.security,
      summary: { passed: 18, warnings: 2, errors: 2, total: 22 },
      plan: "pro",
      dailyUsage: { used: 1, limit: 3 },
    };

    const compResult = {
      url: "https://rakip.com",
      score: 75,
      grade: "B",
      checks,
      metrics: m,
      cwv: m.cwv,
      securityHeaders: m.security,
      summary: { passed: 14, warnings: 4, errors: 4, total: 22 },
      plan: "pro",
      dailyUsage: { used: 1, limit: 3 },
    };

    const doc = generateAnalysisPdf(result, {
      brandName: "SeoRadar",
      planLabel: "Pro Rapor",
      watermark: false,
      competitorResult: compResult,
    });

    expect(doc).toBeTruthy();
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});

await run();
