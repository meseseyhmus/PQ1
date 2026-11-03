/**
 * lib/analyze.ts saf fonksiyon testleri (ağ yok).
 *   - extractMetrics : HTML → PageMetrics
 *   - buildChecks    : PageMetrics → CheckItem[]
 *   - computeScore   : CheckItem[] → 0..100
 *   - gradeFor       : skor → harf notu
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  extractMetrics,
  buildChecks,
  computeScore,
  gradeFor,
} from "../lib/analyze.ts";

const URL = "https://ornek.com/";
const GOOD_HTML = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Örnek Sayfa — SEO Dostu Başlık</title>
  <meta name="description" content="Bu bir örnek meta açıklamasıdır ve yeterince uzundur.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="https://ornek.com/">
  <meta property="og:title" content="Örnek Sayfa">
  <meta property="og:description" content="Örnek açıklama">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">{"@type":"WebPage"}</script>
</head>
<body>
  <h1>Ana Başlık</h1>
  <h2>Alt Başlık 1</h2>
  <h2>Alt Başlık 2</h2>
  <p>${"İçerik ".repeat(60)}</p>
  <img src="/a.png" alt="A" width="10" height="10">
  <img src="/b.png" alt="B" width="10" height="10">
  <a href="/hakkimizda">Hakkımızda</a>
  <a href="/iletisim">İletişim</a>
  <a href="https://dis.example/x">Dış</a>
</body>
</html>`;

const BAD_HTML = `<!doctype html>
<html>
<head></head>
<body>
  <h2>Yanlış sırada</h2>
  <h1>İki H1 olabilir</h1>
  <img src="/x.png">
  <img src="/y.png" width="5" height="5">
</body>
</html>`;

describe("extractMetrics — iyi sayfa", () => {
  const m = extractMetrics(GOOD_HTML, URL, URL, 120);

  it("url / finalUrl / loadTime", () => {
    expect(m.url).toBe(URL);
    expect(m.finalUrl).toBe(URL);
    expect(m.loadTimeMs).toBe(120);
  });

  it("title ve meta description çıkarılır", () => {
    expect(m.title).toContain("Örnek Sayfa");
    expect(m.titleLength).toBeGreaterThan(10);
    expect(m.metaDescription).toContain("meta açıklaması");
    expect(m.metaDescriptionLength).toBeGreaterThan(20);
  });

  it("canonical / lang / viewport / charset", () => {
    expect(m.canonical).toBe("https://ornek.com/");
    expect(m.lang).toBe("tr");
    expect(m.viewport).toContain("width=device-width");
    expect(m.charset).toBe("utf-8");
  });

  it("başlık hiyerarşisi sayılır", () => {
    expect(m.headings.h1.length).toBe(1);
    expect(m.headings.h2.length).toBe(2);
    expect(m.headings.h3.length).toBe(0);
  });

  it("görseller: alt metni ve boyut", () => {
    expect(m.images.total).toBe(2);
    expect(m.images.missingAlt).toBe(0);
    expect(m.images.missingDimensions).toBe(0);
  });

  it("bağlantılar: iç / dış", () => {
    expect(m.links.total).toBe(3);
    expect(m.links.internal).toBe(2);
    expect(m.links.external).toBe(1);
    expect(m.links.empty).toBe(0);
  });

  it("teknik: https / og / twitter / structured data", () => {
    expect(m.technical.isHttps).toBeTruthy();
    expect(m.technical.hasOpenGraph).toBeTruthy();
    expect(m.technical.hasTwitterCard).toBeTruthy();
    expect(m.technical.hasStructuredData).toBeTruthy();
    expect(m.technical.openGraphKeys).toContain("og:title");
    expect(m.technical.structuredDataTypes).toContain("WebPage");
  });

  it("sözcük sayısı ve içerik uzunluğu > 0", () => {
    expect(m.wordCount).toBeGreaterThan(10);
    expect(m.contentLength).toBeGreaterThan(50);
  });
});

describe("extractMetrics — kötü sayfa", () => {
  const m = extractMetrics(BAD_HTML, URL, URL, 50);

  it("title / meta yok", () => {
    expect(m.title).toBe(null);
    expect(m.metaDescription).toBe(null);
    expect(m.titleLength).toBe(0);
    expect(m.metaDescriptionLength).toBe(0);
  });

  it("lang / canonical / viewport yok", () => {
    expect(m.lang).toBe(null);
    expect(m.canonical).toBe(null);
    expect(m.viewport).toBe(null);
  });

  it("eksik alt metni ve eksik boyut yakalanır", () => {
    expect(m.images.total).toBe(2);
    expect(m.images.missingAlt).toBeGreaterThanOrEqual(1);
    expect(m.images.missingDimensions).toBeGreaterThanOrEqual(1);
  });

  it("http girdi → isHttps false", () => {
    const m2 = extractMetrics(BAD_HTML, "http://ornek.com/", "http://ornek.com/", 10);
    expect(m2.technical.isHttps).toBeFalsy();
  });
});

describe("buildChecks", () => {
  const m = extractMetrics(GOOD_HTML, URL, URL, 120);
  const checks = buildChecks(m);

  it("en az 10 kontrol döner", () => {
    expect(checks.length).toBeGreaterThanOrEqual(10);
  });

  it("stabil id'ler yerinde", () => {
    const ids = checks.map((c) => c.id);
    for (const id of ["title", "meta-description", "h1", "https", "robots-txt", "canonical"]) {
      expect(ids).toContain(id);
    }
  });

  it("her kontrolde zorunlu alanlar var", () => {
    for (const c of checks) {
      expect(typeof c.id).toBe("string");
      expect(typeof c.title).toBe("string");
      expect(typeof c.summary).toBe("string");
      expect(Array.isArray(c.howToFix)).toBeTruthy();
      expect(typeof c.weight).toBe("number");
      expect(typeof c.score).toBe("number");
      // score kısmi puandır: [0, 1] aralığında ondalık olabilir (ör. 0.65).
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(1);
      expect(["onpage", "technical", "content", "links"]).toContain(c.category);
      expect(["success", "warning", "error", "info"]).toContain(c.severity);
      expect(c.weight).toBeGreaterThan(0);
    }
  });

  it("kötü sayfada hatalar (error) bulunur", () => {
    const bad = buildChecks(extractMetrics(BAD_HTML, URL, URL, 10));
    expect(bad.some((c) => c.severity === "error")).toBeTruthy();
  });
});

describe("computeScore", () => {
  it("tüm kontroller başarılı → 100", () => {
    const checks = [
      { weight: 10, score: 1 },
      { weight: 20, score: 1 },
      { weight: 30, score: 1 },
    ];
    expect(computeScore(checks)).toBe(100);
  });

  it("yarısı başarılı → 50", () => {
    const checks = [
      { weight: 10, score: 1 },
      { weight: 10, score: 0 },
    ];
    expect(computeScore(checks)).toBe(50);
  });

  it("ağırlıklı ortalama", () => {
    const checks = [
      { weight: 3, score: 1 },
      { weight: 1, score: 0 },
    ];
    // 3/4 = 75
    expect(computeScore(checks)).toBe(75);
  });

  it("ağırlık toplamı 0 → 0", () => {
    expect(computeScore([])).toBe(0);
    expect(computeScore([{ weight: 0, score: 1 }])).toBe(0);
  });

  it("gerçek sayfa skoru 0..100 aralığında", () => {
    const good = computeScore(buildChecks(extractMetrics(GOOD_HTML, URL, URL, 120)));
    const bad = computeScore(buildChecks(extractMetrics(BAD_HTML, URL, URL, 10)));
    expect(good).toBeGreaterThanOrEqual(0);
    expect(good).toBeLessThanOrEqual(100);
    expect(bad).toBeGreaterThanOrEqual(0);
    expect(bad).toBeLessThanOrEqual(100);
    expect(good).toBeGreaterThan(bad);
  });
});

describe("gradeFor", () => {
  it("eşik değerler", () => {
    expect(gradeFor(100)).toBe("A+");
    expect(gradeFor(95)).toBe("A+");
    expect(gradeFor(90)).toBe("A+");
    expect(gradeFor(89)).toBe("A");
    expect(gradeFor(80)).toBe("A");
    expect(gradeFor(79)).toBe("B");
    expect(gradeFor(70)).toBe("B");
    expect(gradeFor(69)).toBe("C");
    expect(gradeFor(60)).toBe("C");
    expect(gradeFor(59)).toBe("D");
    expect(gradeFor(50)).toBe("D");
    expect(gradeFor(49)).toBe("F");
    expect(gradeFor(0)).toBe("F");
  });
});

await run();