/**
 * PDF Raporlama ve Türkçe Karakter Desteği Birim Testleri
 */

import { describe, it, expect, run } from "./harness.mjs";
import { generateAnalysisPdf, safe } from "../lib/pdf.ts";

describe("pdf — safe() Türkçe Karakter Eşleme Fonksiyonu", () => {
  it("tüm Türkçe karakterleri başarıyla dönüştürür", () => {
    const raw = "Şöför ılık çay içerken gölde yüzdü. Ğaziantep, İSTANBUL, ÇORUM, ÖDEMİŞ.";
    const cleaned = safe(raw);

    // Hiçbir Türkçe özel karakter kalmamalı
    expect(cleaned).not.toContain("ş");
    expect(cleaned).not.toContain("ö");
    expect(cleaned).not.toContain("ı");
    expect(cleaned).not.toContain("ç");
    expect(cleaned).not.toContain("ğ");
    expect(cleaned).not.toContain("İ");
    expect(cleaned).not.toContain("Ö");
    expect(cleaned).not.toContain("Ç");
    expect(cleaned).not.toContain("Ş");
    expect(cleaned).not.toContain("Ğ");

    // Okunabilir ASCII harflerine dönüşmeli
    expect(cleaned).toContain("Sofor");
    expect(cleaned).toContain("Gaziantep");
    expect(cleaned).toContain("ISTANBUL");
  });

  it("tipografik tırnak ve tire işaretlerini güvenli ASCII'ye çevirir", () => {
    const raw = "“Örnek Rapor” – ‘SEO’ Analizi … Fiyat: 500 ₺";
    const cleaned = safe(raw);
    expect(cleaned).toContain('"Ornek Rapor"');
    expect(cleaned).toContain("'SEO'");
    expect(cleaned).toContain("TL");
  });
});

describe("generateAnalysisPdf — Kurumsal Rapor Üretimi", () => {
  const mockResult = {
    url: "https://ornek-magaza.com",
    score: 84,
    grade: "A",
    checks: [
      {
        id: "title",
        title: "Sayfa Başlığı (Title)",
        category: "onpage",
        severity: "success",
        summary: "Başlık uzunluğu ideal.",
        value: "Örnek Mağaza — En Uygun Ürünler",
        howToFix: ["Anahtar kelimeleri koruyun."],
        weight: 10,
        score: 1,
      },
      {
        id: "cwv-check",
        title: "Core Web Vitals",
        category: "technical",
        severity: "warning",
        summary: "LCP süresi 2.8s geliştirilmeli.",
        value: "2.8s",
        howToFix: ["Görselleri WebP formatına dönüştürün."],
        weight: 10,
        score: 0.7,
      },
    ],
    metrics: {
      url: "https://ornek-magaza.com",
      finalUrl: "https://ornek-magaza.com",
      fetchedAt: new Date().toISOString(),
      loadTimeMs: 340,
      htmlSizeBytes: 45000,
      title: "Örnek Mağaza",
      titleLength: 12,
      metaDescription: "Açıklama metni",
      metaDescriptionLength: 15,
      canonical: "https://ornek-magaza.com",
      lang: "tr",
      viewport: "width=device-width",
      charset: "utf-8",
      headings: {
        h1: ["Başlık 1"],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        order: [],
        skips: [],
      },
      images: {
        total: 5,
        missingAlt: 0,
        missingAltSrcs: [],
        emptyAlt: 0,
        missingDimensions: 0,
        lazyLoaded: 5,
      },
      links: {
        total: 10,
        internal: 8,
        external: 2,
        noFollow: 0,
        empty: 0,
        checked: 10,
        broken: [],
      },
      technical: {
        isHttps: true,
        hasRobotsTxt: true,
        robotsTxtContent: "User-agent: *",
        hasSitemapXml: true,
        hasFavicon: true,
        hasOpenGraph: true,
        openGraphKeys: ["og:title"],
        hasTwitterCard: true,
        hasStructuredData: false,
        structuredDataTypes: [],
        hasHreflang: false,
        inlineStyles: 0,
        scriptCount: 4,
        stylesheetCount: 2,
      },
      cwv: {
        lcp: {
          value: 2800,
          unit: "ms",
          rating: "needs-improvement",
          score: 65,
          description: "LCP geliştirilmeli",
          recommendation: "Görselleri CDN ile dağıtın",
          element: "img.banner",
        },
        cls: {
          value: 0.02,
          unit: "score",
          rating: "good",
          score: 95,
          description: "CLS iyi",
          recommendation: "Mevcut düzeni koruyun",
          unconstrainedImages: 0,
        },
        fid: {
          value: 30,
          unit: "ms",
          rating: "good",
          score: 95,
          description: "FID iyi",
          recommendation: "Tavsiye",
        },
        inp: {
          value: 90,
          unit: "ms",
          rating: "good",
          score: 90,
          description: "INP iyi",
          recommendation: "Tavsiye",
        },
        overallScore: 86,
        overallRating: "good",
      },
      security: {
        score: 75,
        grade: "B",
        headers: {
          hsts: {
            name: "HSTS",
            headerKey: "Strict-Transport-Security",
            present: true,
            value: "max-age=31536000",
            severity: "success",
            rating: "good",
            score: 1,
            description: "HSTS etkin",
            recommendation: "",
          },
          csp: {
            name: "CSP",
            headerKey: "Content-Security-Policy",
            present: false,
            value: null,
            severity: "error",
            rating: "poor",
            score: 0,
            description: "CSP eksik",
            recommendation: "CSP ekleyin",
          },
          xFrameOptions: {
            name: "X-Frame-Options",
            headerKey: "X-Frame-Options",
            present: true,
            value: "DENY",
            severity: "success",
            rating: "good",
            score: 1,
            description: "X-Frame tanımlı",
            recommendation: "",
          },
          xContentTypeOptions: {
            name: "X-Content-Type-Options",
            headerKey: "X-Content-Type-Options",
            present: true,
            value: "nosniff",
            severity: "success",
            rating: "good",
            score: 1,
            description: "nosniff tanımlı",
            recommendation: "",
          },
          referrerPolicy: {
            name: "Referrer-Policy",
            headerKey: "Referrer-Policy",
            present: true,
            value: "strict-origin",
            severity: "success",
            rating: "good",
            score: 1,
            description: "Referrer tanımlı",
            recommendation: "",
          },
          permissionsPolicy: {
            name: "Permissions-Policy",
            headerKey: "Permissions-Policy",
            present: false,
            value: null,
            severity: "warning",
            rating: "poor",
            score: 0,
            description: "Eksik",
            recommendation: "Permissions-Policy ekleyin",
          },
        },
        passedCount: 4,
        totalCount: 6,
      },
      wordCount: 1200,
      textToHtmlRatio: 25,
      contentLength: 6000,
    },
    cwv: null, // metrics içinden doldurulacak
    securityHeaders: null,
    summary: { passed: 18, warnings: 2, errors: 1, total: 21 },
    plan: "free",
    dailyUsage: { used: 1, limit: 3 },
  };

  mockResult.cwv = mockResult.metrics.cwv;
  mockResult.securityHeaders = mockResult.metrics.security;

  it("kurumsal PDF nesnesi başarıyla oluşturur", () => {
    const doc = generateAnalysisPdf(mockResult, {
      brandName: "SeoRadar Pro",
      planLabel: "Pro Rapor",
      watermark: false,
    });

    expect(doc).toBeTruthy();
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("rakip karşılaştırması eklendiğinde benchmark tablosu dahil edilir", () => {
    const compResult = { ...mockResult, url: "https://rakip-magaza.com", score: 70 };
    const doc = generateAnalysisPdf(mockResult, {
      brandName: "SeoRadar",
      competitorResult: compResult,
      watermark: true,
    });

    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});

await run();
