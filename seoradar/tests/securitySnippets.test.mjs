/**
 * HTTP Güvenlik Başlıkları Yapılandırma Snippet Üreticisi Testleri
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  generateNginxSnippet,
  generateNextJsSnippet,
  generateApacheSnippet,
  getTargetHeaderKeys,
} from "../lib/securitySnippets.ts";

describe("securitySnippets — Nginx, Next.js ve Apache Başlık Yapılandırmaları", () => {
  const mockSecurityMissing = {
    score: 35,
    grade: "F",
    headers: {
      hsts: {
        name: "HSTS",
        headerKey: "Strict-Transport-Security",
        present: false,
        value: null,
        severity: "error",
        rating: "poor",
        score: 0,
        description: "HSTS eksik",
        recommendation: "HSTS ekleyin",
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
        present: false,
        value: null,
        severity: "warning",
        rating: "poor",
        score: 0,
        description: "nosniff eksik",
        recommendation: "nosniff ekleyin",
      },
      referrerPolicy: {
        name: "Referrer-Policy",
        headerKey: "Referrer-Policy",
        present: true,
        value: "strict-origin",
        severity: "success",
        rating: "good",
        score: 1,
        description: "Tanımlı",
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
    passedCount: 2,
    totalCount: 6,
  };

  it("getTargetHeaderKeys yalnızca eksik olanları döner", () => {
    const missingKeys = getTargetHeaderKeys(mockSecurityMissing, true);
    expect(missingKeys).toContain("hsts");
    expect(missingKeys).toContain("csp");
    expect(missingKeys).toContain("xContentTypeOptions");
    expect(missingKeys).toContain("permissionsPolicy");
    expect(missingKeys).not.toContain("xFrameOptions");
    expect(missingKeys).not.toContain("referrerPolicy");
  });

  it("getTargetHeaderKeys onlyMissing=false iken 6 başlığı da döner", () => {
    const allKeys = getTargetHeaderKeys(mockSecurityMissing, false);
    expect(allKeys.length).toBe(6);
    expect(allKeys).toContain("hsts");
    expect(allKeys).toContain("xFrameOptions");
  });

  it("generateNginxSnippet geçerli Nginx konfigürasyonu üretir", () => {
    const snippet = generateNginxSnippet(mockSecurityMissing, true);
    expect(snippet).toContain("server {");
    expect(snippet).toContain("add_header Strict-Transport-Security");
    expect(snippet).toContain("add_header Content-Security-Policy");
    expect(snippet).not.toContain("add_header X-Frame-Options"); // Çünkü zaten mevcut
  });

  it("generateNextJsSnippet geçerli Next.js headers() konfigürasyonu üretir", () => {
    const snippet = generateNextJsSnippet(mockSecurityMissing, true);
    expect(snippet).toContain("async headers()");
    expect(snippet).toContain("source: '/:path*'");
    expect(snippet).toContain("Strict-Transport-Security");
    expect(snippet).toContain("Content-Security-Policy");
    expect(snippet).toContain("module.exports = nextConfig;");
  });

  it("generateApacheSnippet geçerli .htaccess konfigürasyonu üretir", () => {
    const snippet = generateApacheSnippet(mockSecurityMissing, true);
    expect(snippet).toContain("<IfModule mod_headers.c>");
    expect(snippet).toContain("Header always set Strict-Transport-Security");
    expect(snippet).toContain("Header always set Content-Security-Policy");
    expect(snippet).toContain("</IfModule>");
  });

  it("tüm başlıklar tam olduğunda tebrik mesajı döner", () => {
    const allPassed = {
      score: 100,
      grade: "A+",
      headers: {
        hsts: { present: true },
        csp: { present: true },
        xFrameOptions: { present: true },
        xContentTypeOptions: { present: true },
        referrerPolicy: { present: true },
        permissionsPolicy: { present: true },
      },
      passedCount: 6,
      totalCount: 6,
    };

    const nginx = generateNginxSnippet(allPassed, true);
    expect(nginx).toContain("Tüm güvenlik başlıkları sunucunuzda zaten tanımlı");
  });
});

await run();
