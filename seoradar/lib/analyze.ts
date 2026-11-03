import * as cheerio from "cheerio";
import type {
  AnalysisResult,
  CheckItem,
  CoreWebVitals,
  CwvRating,
  HeadingOrderItem,
  HeadingSkipItem,
  PageMetrics,
  SecurityHeadersAnalysis,
  Severity,
} from "@/types";
import { normalizeUrl } from "@/lib/format";
import { assertPublicHttpUrl } from "@/lib/urlGuard";

const FETCH_TIMEOUT_MS = 12_000;
const LINK_CHECK_TIMEOUT_MS = 5_000;
const MAX_LINKS_TO_CHECK = 25;
const MAX_REDIRECTS = 5;
// Dev HTML gövdesinin belleği patlatmasını önlemek için okuma üst sınırı.
const MAX_HTML_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROBOTS_BYTES = 256 * 1024; // 256 KB
const USER_AGENT =
  "Mozilla/5.0 (compatible; SeoRadarBot/1.0; +https://seoradar.example/bot)";

/* -------------------------------------------------------------------------- */
/*  Yardımcılar                                                                */
/* -------------------------------------------------------------------------- */

function absoluteUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

function isSkippableHref(href: string): boolean {
  return (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:") ||
    href.startsWith("data:")
  );
}

/**
 * SSRF-safe fetch: her adımda (yönlendirmeler dahil) hedefin iç ağ olmadığını
 * doğrular. `redirect: "manual"` ile zincir bizim kontrolümüzde yürütülür —
 * aksi halde "https://ornek.com" → 302 → "http://169.254.169.254" bypass'ı
 * mümkün olurdu.
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs = FETCH_TIMEOUT_MS,
  method: "GET" | "HEAD" = "GET"
): Promise<Response> {
  // İlk hedef ve her yönlendirme hedefi burada doğrulanır.
  let current = assertPublicHttpUrl(url).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const res = await fetch(current, {
        method,
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location || hop === MAX_REDIRECTS) {
          throw Object.assign(
            new Error("Çok fazla yönlendirme veya yönlendirme hedefi eksik."),
            { code: "BLOCKED_TARGET" }
          );
        }
        // Göreli Location'ı mevcut URL'ye göre çözümle, sonra doğrula.
        const next = new URL(location, current).toString();
        current = assertPublicHttpUrl(next).toString();
        // Gövdeyi tüketmeden devam et (bağlantıyı serbest bırak).
        try {
          await res.body?.cancel();
        } catch {
          /* yoksay */
        }
        continue;
      }
      return res;
    }
    throw Object.assign(new Error("Çok fazla yönlendirme."), {
      code: "BLOCKED_TARGET",
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Yanıt gövdesini akış halinde okur ve `maxBytes` sınırını aşarsa hata fırlatır.
 * `res.text()` kullanılsaydı 200 MB'lık bir gövde olduğu gibi belleğe inerdi.
 */
async function readBodyText(res: Response, maxBytes: number): Promise<string> {
  const declared = Number(res.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw Object.assign(
      new Error(`Sayfa çok büyük (>${Math.round(maxBytes / 1024 / 1024)} MB sınırı).`),
      { code: "FETCH_FAILED" }
    );
  }
  if (!res.body) return res.text();

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  const decoder = new TextDecoder("utf-8", { fatal: false });
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          /* yoksay */
        }
        throw Object.assign(
          new Error(`Sayfa çok büyük (>${Math.round(maxBytes / 1024 / 1024)} MB sınırı).`),
          { code: "FETCH_FAILED" }
        );
      }
      chunks.push(value);
    }
  }
  let text = "";
  for (const c of chunks) text += decoder.decode(c, { stream: true });
  text += decoder.decode();
  return text;
}

/* -------------------------------------------------------------------------- */
/*  Metrik çıkarma                                                             */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Güvenlik Başlıkları Denetimi                                               */
/* -------------------------------------------------------------------------- */

export function inspectSecurityHeaders(
  headers?: Headers | Record<string, string | null | undefined> | null,
  isHttps = true
): SecurityHeadersAnalysis {
  const getHeader = (key: string): string | null => {
    if (!headers) return null;
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(key);
    }
    const rec = headers as Record<string, string | null | undefined>;
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(rec)) {
      if (k.toLowerCase() === lower) return v ?? null;
    }
    return null;
  };

  const hstsVal = getHeader("strict-transport-security");
  const cspVal = getHeader("content-security-policy");
  const xfoVal = getHeader("x-frame-options");
  const xctoVal = getHeader("x-content-type-options");
  const refVal = getHeader("referrer-policy");
  const permVal = getHeader("permissions-policy") || getHeader("feature-policy");

  // HSTS
  const hstsPresent = Boolean(hstsVal);
  let hstsRating: "good" | "warning" | "poor" = "poor";
  let hstsScore = 0;
  let hstsSev: Severity = "error";
  if (hstsPresent) {
    const maxAgeMatch = hstsVal!.match(/max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
    if (maxAge >= 15552000) {
      hstsRating = "good";
      hstsScore = 100;
      hstsSev = "success";
    } else {
      hstsRating = "warning";
      hstsScore = 60;
      hstsSev = "warning";
    }
  } else if (!isHttps) {
    hstsRating = "warning";
    hstsScore = 30;
    hstsSev = "warning";
  }

  // CSP
  const cspPresent = Boolean(cspVal);
  const cspRating: "good" | "warning" | "poor" = cspPresent ? "good" : "poor";
  const cspScore = cspPresent ? 100 : 0;
  const cspSev: Severity = cspPresent ? "success" : "error";

  // X-Frame-Options
  const xfoPresent = Boolean(xfoVal);
  let xfoRating: "good" | "warning" | "poor" = "poor";
  let xfoScore = 0;
  let xfoSev: Severity = "error";
  if (xfoPresent) {
    const upper = xfoVal!.trim().toUpperCase();
    if (upper === "DENY" || upper === "SAMEORIGIN") {
      xfoRating = "good";
      xfoScore = 100;
      xfoSev = "success";
    } else {
      xfoRating = "warning";
      xfoScore = 60;
      xfoSev = "warning";
    }
  }

  // X-Content-Type-Options
  const isNosniff = Boolean(xctoVal?.toLowerCase().includes("nosniff"));
  const xctoRating: "good" | "warning" | "poor" = isNosniff ? "good" : "poor";
  const xctoScore = isNosniff ? 100 : 0;
  const xctoSev: Severity = isNosniff ? "success" : "error";

  // Referrer-Policy
  const refPresent = Boolean(refVal);
  let refRating: "good" | "warning" | "poor" = "warning";
  let refScore = 40;
  let refSev: Severity = "warning";
  if (refPresent) {
    if (refVal?.toLowerCase().includes("unsafe-url")) {
      refRating = "poor";
      refScore = 15;
      refSev = "error";
    } else {
      refRating = "good";
      refScore = 100;
      refSev = "success";
    }
  }

  // Permissions-Policy
  const permPresent = Boolean(permVal);
  const permRating: "good" | "warning" | "poor" = permPresent ? "good" : "warning";
  const permScore = permPresent ? 100 : 40;
  const permSev: Severity = permPresent ? "success" : "warning";

  const headersMap = {
    hsts: {
      name: "Strict-Transport-Security (HSTS)",
      headerKey: "strict-transport-security",
      present: hstsPresent,
      value: hstsVal,
      severity: hstsSev,
      rating: hstsRating,
      score: hstsScore,
      description: hstsPresent
        ? "Tarayıcıları sadece güvenli HTTPS protokolünü kullanmaya zorlar."
        : "HSTS başlığı eksik — kullanıcılar SSL ayrıştırma ve ortadaki adam (MITM) saldırılarına açık olabilir.",
      recommendation: "Sunucu yanıt başlıklarına 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' ekleyin.",
    },
    csp: {
      name: "Content-Security-Policy (CSP)",
      headerKey: "content-security-policy",
      present: cspPresent,
      value: cspVal,
      severity: cspSev,
      rating: cspRating,
      score: cspScore,
      description: cspPresent
        ? "İçerik Güvenliği Politikası aktif (XSS ve yetkisiz veri çekme koruması)."
        : "CSP başlığı tanımlanmamış — siteniz XSS ve veri sızdırma açıklarına karşı savunmasız kalabilir.",
      recommendation: "XSS ve kod enjeksiyonunu engellemek için güvenilir kaynakları belirten bir Content-Security-Policy başlığı oluşturun.",
    },
    xFrameOptions: {
      name: "X-Frame-Options (Clickjacking Koruması)",
      headerKey: "x-frame-options",
      present: xfoPresent,
      value: xfoVal,
      severity: xfoSev,
      rating: xfoRating,
      score: xfoScore,
      description: xfoPresent
        ? `Sayfanın iframe içinde gömülme kuralı: ${xfoVal}.`
        : "X-Frame-Options eksik — siteniz kötü niyetli bir sitede iframe içinde gösterilip clickjacking yapılabilir.",
      recommendation: "Sayfanın başka sitelerde iframe ile açılmasını önlemek için 'X-Frame-Options: SAMEORIGIN' veya 'DENY' ekleyin.",
    },
    xContentTypeOptions: {
      name: "X-Content-Type-Options (MIME Koruması)",
      headerKey: "x-content-type-options",
      present: isNosniff,
      value: xctoVal,
      severity: xctoSev,
      rating: xctoRating,
      score: xctoScore,
      description: isNosniff
        ? "MIME türü koklama (sniffing) koruması 'nosniff' ile aktif."
        : "X-Content-Type-Options nosniff eksik — tarayıcılar dosya türlerini yanlış yorumlayıp güvenlik açığı oluşturabilir.",
      recommendation: "Yanıt başlıklarına 'X-Content-Type-Options: nosniff' direktifini ekleyin.",
    },
    referrerPolicy: {
      name: "Referrer-Policy (Yönlendiren Bilgisi)",
      headerKey: "referrer-policy",
      present: refPresent,
      value: refVal,
      severity: refSev,
      rating: refRating,
      score: refScore,
      description: refPresent
        ? `Giden bağlantılardaki referrer politikası: ${refVal}.`
        : "Referrer-Policy belirtilmemiş — hassas URL parametreleri harici sitelere sızabilir.",
      recommendation: "Gizlilik ve analitik dengesi için 'Referrer-Policy: strict-origin-when-cross-origin' ekleyin.",
    },
    permissionsPolicy: {
      name: "Permissions-Policy (Tarayıcı İzinleri)",
      headerKey: "permissions-policy",
      present: permPresent,
      value: permVal,
      severity: permSev,
      rating: permRating,
      score: permScore,
      description: permPresent
        ? "Tarayıcı donanım ve API erişim izinleri sınırlandırılmış."
        : "Permissions-Policy başlığı yok — kamera, mikrofon, coğrafi konum gibi API'ler kısıtlanmamış.",
      recommendation: "Kullanılmayan tarayıcı API'lerini kısıtlamak için 'Permissions-Policy: camera=(), microphone=(), geolocation=()' tanımlayın.",
    },
  };

  const weights = {
    hsts: 20,
    csp: 25,
    xFrameOptions: 20,
    xContentTypeOptions: 15,
    referrerPolicy: 10,
    permissionsPolicy: 10,
  };

  let totalScore = 0;
  let passedCount = 0;
  for (const [key, item] of Object.entries(headersMap)) {
    const w = weights[key as keyof typeof weights] ?? 10;
    totalScore += (item.score / 100) * w;
    if (item.present && item.score >= 60) passedCount += 1;
  }
  const score = Math.round(totalScore);

  let grade = "F";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 40) grade = "D";

  return {
    score,
    grade,
    headers: headersMap,
    passedCount,
    totalCount: 6,
  };
}

/* -------------------------------------------------------------------------- */
/*  Core Web Vitals Hesabı                                                     */
/* -------------------------------------------------------------------------- */

export function calculateCoreWebVitals(params: {
  loadTimeMs: number;
  htmlSizeBytes: number;
  images: { total: number; missingDimensions: number };
  technical: { scriptCount: number; stylesheetCount: number; inlineStyles: number };
  headings: { h1: string[] };
  domElementsCount: number;
}): CoreWebVitals {
  const { loadTimeMs, htmlSizeBytes, images, technical, headings, domElementsCount } = params;

  // 1. Largest Contentful Paint (LCP)
  const heroImageDelay = images.total > 0
    ? 300 + Math.min(1800, images.total * 30 + images.missingDimensions * 60)
    : 150;
  const htmlSizeOverhead = Math.min(1200, (htmlSizeBytes / 1024) * 1.5);
  let lcpValue = Math.round(loadTimeMs + heroImageDelay + htmlSizeOverhead);
  lcpValue = Math.max(320, lcpValue);

  let lcpRating: CwvRating = "good";
  let lcpScore = 95;
  let lcpRec = "LCP süresi mükemmel (2.5 sn altında). Bu performansı korumak için CDN ve tarayıcı önbellekleme kullanmaya devam edin.";
  if (lcpValue > 4000) {
    lcpRating = "poor";
    lcpScore = Math.max(15, Math.round(50 - ((lcpValue - 4000) / 3000) * 35));
    lcpRec = "LCP kritik derecede yavaş (>4.0 sn). Sunucu yanıt süresini (TTFB) düşürün, ana hero görseli için fetchpriority=\"high\" kullanın ve büyük CSS/JS dosyalarını sıkıştırın.";
  } else if (lcpValue > 2500) {
    lcpRating = "needs-improvement";
    lcpScore = Math.round(85 - ((lcpValue - 2500) / 1500) * 35);
    lcpRec = "LCP iyileştirilmeli (2.5–4.0 sn). Görselleri WebP/AVIF formatına çevirin ve kritik CSS'i satır içi (inline) yükleyin.";
  } else {
    lcpScore = Math.round(100 - (lcpValue / 2500) * 15);
  }

  const lcpElement = images.total > 0
    ? "Öne Çıkan Görsel (Hero Image / <img>)"
    : headings.h1.length > 0
      ? "Ana Başlık Bloğu (<h1>)"
      : "Ana İçerik Paragrafı (<p>)";

  // 2. Cumulative Layout Shift (CLS)
  const dimRatio = images.total > 0 ? (images.missingDimensions / images.total) : 0;
  const unconstrainedShift = dimRatio * 0.16;
  const dynamicScriptShift = Math.min(0.08, (technical.scriptCount / 40) * 0.05);
  const baseCls = images.total === 0 ? 0.005 : (images.missingDimensions === 0 ? 0.015 : 0.035);
  let clsValue = Number((baseCls + unconstrainedShift + dynamicScriptShift).toFixed(3));
  clsValue = Math.min(0.85, Math.max(0.005, clsValue));

  let clsRating: CwvRating = "good";
  let clsScore = 95;
  let clsRec = "Yerleşim kayması (CLS) 0.1 altında ve oldukça stabil. Sayfa yüklenirken içerikler sıçramıyor.";
  if (clsValue > 0.25) {
    clsRating = "poor";
    clsScore = Math.max(15, Math.round(50 - ((clsValue - 0.25) / 0.25) * 35));
    clsRec = "Ciddi sayfa kayması (>0.25). Tüm <img> ve iframe etiketlerine açıkça width ve height veya CSS aspect-ratio ekleyin.";
  } else if (clsValue > 0.1) {
    clsRating = "needs-improvement";
    clsScore = Math.round(85 - ((clsValue - 0.1) / 0.15) * 35);
    clsRec = "CLS 0.1-0.25 aralığında. Boyutsuz görsellere ve dinamik reklam alanlarına rezerv alan (min-height) ayırın.";
  } else {
    clsScore = Math.round(100 - (clsValue / 0.1) * 15);
  }

  // 3. First Input Delay (FID)
  const scriptBlockTime = Math.min(200, technical.scriptCount * 8);
  const domComplexity = Math.min(100, Math.round(domElementsCount / 25));
  const htmlWeight = Math.min(80, Math.round((htmlSizeBytes / 1024) * 0.3));
  const fidValue = Math.round(18 + scriptBlockTime * 0.35 + domComplexity * 0.25 + htmlWeight * 0.2);

  let fidRating: CwvRating = "good";
  let fidScore = 95;
  let fidRec = "İlk Giriş Gecikmesi (FID) mükemmel (<100 ms). Ana iş parçacığı serbest ve kullanıcı etkileşimlerine anında yanıt veriyor.";
  if (fidValue > 300) {
    fidRating = "poor";
    fidScore = Math.max(15, Math.round(50 - ((fidValue - 300) / 300) * 35));
    fidRec = "FID yavaş (>300 ms). Uzun JavaScript görevlerini parçalayın (code splitting) ve kullanılmayan üçüncü parti script'leri kaldırın.";
  } else if (fidValue > 100) {
    fidRating = "needs-improvement";
    fidScore = Math.round(85 - ((fidValue - 100) / 200) * 35);
    fidRec = "FID orta düzeyde (100–300 ms). Ağır JS kütüphanelerini dinamik import ile yükleyin ve defer/async kullanın.";
  } else {
    fidScore = Math.round(100 - (fidValue / 100) * 15);
  }

  // 4. Interaction to Next Paint (INP)
  const inpValue = Math.round(fidValue * 1.6 + domComplexity * 0.4);
  let inpRating: CwvRating = "good";
  let inpScore = 95;
  let inpRec = "Sonraki Boyamayla Etkileşim (INP) mükemmel (<200 ms). Kullanıcı tıklama ve girişleri takılmadan işleniyor.";
  if (inpValue > 500) {
    inpRating = "poor";
    inpScore = Math.max(15, Math.round(50 - ((inpValue - 500) / 500) * 35));
    inpRec = "INP kritik düzeyde yüksek (>500 ms). Olay işleyicilerini (event handlers) optimize edin ve requestAnimationFrame kullanın.";
  } else if (inpValue > 200) {
    inpRating = "needs-improvement";
    inpScore = Math.round(85 - ((inpValue - 200) / 300) * 35);
    inpRec = "INP orta düzeyde (200–500 ms). DOM ağacını küçültün ve CSS seçici karmaşıklığını azaltın.";
  } else {
    inpScore = Math.round(100 - (inpValue / 200) * 15);
  }

  const overallScore = Math.round(lcpScore * 0.35 + clsScore * 0.30 + fidScore * 0.20 + inpScore * 0.15);
  let overallRating: CwvRating = "good";
  if (lcpRating === "poor" || clsRating === "poor" || fidRating === "poor" || inpRating === "poor") {
    overallRating = "poor";
  } else if (lcpRating === "needs-improvement" || clsRating === "needs-improvement" || fidRating === "needs-improvement" || inpRating === "needs-improvement") {
    overallRating = "needs-improvement";
  }

  return {
    lcp: {
      value: lcpValue,
      unit: "ms",
      rating: lcpRating,
      score: lcpScore,
      description: `${(lcpValue / 1000).toFixed(2)} sn — En Büyük İçerikli Boyama (LCP)`,
      recommendation: lcpRec,
      element: lcpElement,
    },
    cls: {
      value: clsValue,
      unit: "skor",
      rating: clsRating,
      score: clsScore,
      description: `${clsValue} — Kümülatif Düzen Kayması (CLS)`,
      recommendation: clsRec,
      unconstrainedImages: images.missingDimensions,
    },
    fid: {
      value: fidValue,
      unit: "ms",
      rating: fidRating,
      score: fidScore,
      description: `${fidValue} ms — İlk Giriş Gecikmesi (FID)`,
      recommendation: fidRec,
    },
    inp: {
      value: inpValue,
      unit: "ms",
      rating: inpRating,
      score: inpScore,
      description: `${inpValue} ms — Etkileşimden Sonraki Boyama (INP)`,
      recommendation: inpRec,
    },
    overallScore,
    overallRating,
  };
}

/* -------------------------------------------------------------------------- */
/*  Metrik çıkarma                                                             */
/* -------------------------------------------------------------------------- */

export function extractMetrics(
  html: string,
  requestedUrl: string,
  finalUrl: string,
  loadTimeMs: number,
  headers?: Headers | Record<string, string | null | undefined> | null
): PageMetrics {
  const $ = cheerio.load(html);

  const readText = (sel: string) => {
    const v = $(sel).first().attr("content") ?? $(sel).first().text().trim();
    return v ? v.trim() : null;
  };

  const title = readText("title");
  const metaDescription = readText('meta[name="description"]');
  const canonical =
    $('link[rel="canonical"]').first().attr("href")?.trim() ?? null;
  const lang = $("html").attr("lang")?.trim() ?? null;
  const viewport = readText('meta[name="viewport"]');
  const charset =
    $("meta[charset]").attr("charset")?.trim() ??
    $('meta[http-equiv="Content-Type"]').attr("content")?.trim() ??
    null;

  /* Başlıklar & Sıralı Hiyerarşi */
  const headingElements = $("h1, h2, h3, h4, h5, h6");
  const headingOrder: HeadingOrderItem[] = [];
  const headingSkips: HeadingSkipItem[] = [];
  let lastLevel = 0;

  headingElements.each((_, el) => {
    const tag = (el.tagName || "").toLowerCase();
    const level = parseInt(tag.replace("h", ""), 10);
    const text = $(el).text().trim().replace(/\s+/g, " ").slice(0, 100);
    headingOrder.push({ tag, level, text });

    if (lastLevel > 0 && level > lastLevel + 1) {
      headingSkips.push({
        fromLevel: lastLevel,
        toLevel: level,
        text,
      });
    }
    lastLevel = level;
  });

  const headings = {
    h1: $("h1").map((_, el) => $(el).text().trim()).get(),
    h2: $("h2").map((_, el) => $(el).text().trim()).get(),
    h3: $("h3").map((_, el) => $(el).text().trim()).get(),
    h4: $("h4").map((_, el) => $(el).text().trim()).get(),
    h5: $("h5").map((_, el) => $(el).text().trim()).get(),
    h6: $("h6").map((_, el) => $(el).text().trim()).get(),
    order: headingOrder,
    skips: headingSkips,
  };

  /* Görseller */
  const imgs = $("img");
  const missingAltSrcs: string[] = [];
  let missingAlt = 0;
  let emptyAlt = 0;
  let missingDimensions = 0;
  let lazyLoaded = 0;
  imgs.each((_, el) => {
    const alt = $(el).attr("alt");
    const src = $(el).attr("src") ?? $(el).attr("data-src") ?? "(bilinmiyor)";
    if (alt === undefined) {
      missingAlt += 1;
      if (missingAltSrcs.length < 15) missingAltSrcs.push(src);
    } else if (alt.trim() === "") {
      emptyAlt += 1;
    }
    if (!$(el).attr("width") && !$(el).attr("height")) missingDimensions += 1;
    const loading = $(el).attr("loading");
    if (loading === "lazy" || $(el).attr("data-src")) lazyLoaded += 1;
  });

  /* Linkler */
  const anchors = $("a[href]");
  const linkRecords: { href: string; internal: boolean; noFollow: boolean }[] =
    [];
  let empty = 0;
  anchors.each((_, el) => {
    const raw = $(el).attr("href") ?? "";
    if (isSkippableHref(raw)) {
      if (raw === "" || raw === "#") empty += 1;
      return;
    }
    const abs = absoluteUrl(raw, finalUrl);
    if (!abs) return;
    const noFollow = ($(el).attr("rel") ?? "")
      .toLowerCase()
      .split(/\s+/)
      .includes("nofollow");
    linkRecords.push({
      href: abs,
      internal: sameOrigin(abs, finalUrl),
      noFollow,
    });
  });

  /* Teknik */
  const ogKeys: string[] = [];
  $('meta[property^="og:"]').each((_, el) => {
    const k = $(el).attr("property");
    if (k) ogKeys.push(k);
  });

  const structuredDataTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text() || "null");
      const collect = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        const obj = node as Record<string, unknown>;
        if (typeof obj["@type"] === "string") structuredDataTypes.push(obj["@type"]);
        if (Array.isArray(obj["@graph"])) obj["@graph"].forEach(collect);
        if (Array.isArray(obj)) obj.forEach(collect);
      };
      collect(parsed);
    } catch {
      /* bozuk JSON-LD — yoksay */
    }
  });

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
  const htmlSizeBytes = Buffer.byteLength(html, "utf8");
  const contentLength = bodyText.length;
  const textToHtmlRatio =
    htmlSizeBytes > 0 ? Math.min(100, (contentLength / htmlSizeBytes) * 100) : 0;

  const technical = {
    isHttps: finalUrl.startsWith("https://"),
    hasRobotsTxt: false,
    robotsTxtContent: null,
    hasSitemapXml: false,
    hasFavicon: $('link[rel*="icon"]').length > 0,
    hasOpenGraph: ogKeys.length > 0,
    openGraphKeys: ogKeys,
    hasTwitterCard: $('meta[name^="twitter:"]').length > 0,
    hasStructuredData: structuredDataTypes.length > 0,
    structuredDataTypes: [...new Set(structuredDataTypes)],
    hasHreflang: $('link[rel="alternate"][hreflang]').length > 0,
    inlineStyles: $("[style]").length,
    scriptCount: $("script").length,
    stylesheetCount: $('link[rel="stylesheet"]').length,
  };

  const cwv = calculateCoreWebVitals({
    loadTimeMs,
    htmlSizeBytes,
    images: {
      total: imgs.length,
      missingDimensions,
    },
    technical,
    headings,
    domElementsCount: $("*").length,
  });

  const security = inspectSecurityHeaders(headers, technical.isHttps);

  return {
    url: requestedUrl,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    loadTimeMs,
    htmlSizeBytes,
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    canonical,
    lang,
    viewport,
    charset,
    headings,
    images: {
      total: imgs.length,
      missingAlt,
      missingAltSrcs,
      emptyAlt,
      missingDimensions,
      lazyLoaded,
    },
    links: {
      total: linkRecords.length,
      internal: linkRecords.filter((l) => l.internal).length,
      external: linkRecords.filter((l) => !l.internal).length,
      noFollow: linkRecords.filter((l) => l.noFollow).length,
      empty,
      checked: 0,
      broken: [],
    },
    technical,
    cwv,
    security,
    wordCount,
    textToHtmlRatio: Number(textToHtmlRatio.toFixed(2)),
    contentLength,
    // link kayıtları checks aşamasında kullanılır, PageMetrics'e sığmaz
  };
}

/* -------------------------------------------------------------------------- */
/*  Kırık link kontrolü                                                        */
/* -------------------------------------------------------------------------- */

export async function checkBrokenLinks(
  html: string,
  finalUrl: string
): Promise<PageMetrics["links"]["broken"] & { checked: number }> {
  const $ = cheerio.load(html);
  const candidates = new Set<string>();

  $("a[href]").each((_, el) => {
    const raw = $(el).attr("href") ?? "";
    if (isSkippableHref(raw)) return;
    const abs = absoluteUrl(raw, finalUrl);
    if (abs) candidates.add(abs);
  });

  const list = [...candidates].slice(0, MAX_LINKS_TO_CHECK);
  const results: PageMetrics["links"]["broken"] = [];

  await Promise.all(
    list.map(async (href) => {
      try {
        // Sayfa içeriği saldırgan kontrolünde olabilir: sayfadaki linkler de
        // iç ağ hedefine işaret edebilir (ikinci derece SSRF). fetchWithTimeout
        // her hedefi doğruladığı için buradaki çağrılar de zaten güvence altında.
        assertPublicHttpUrl(href);
        let res = await fetchWithTimeout(href, LINK_CHECK_TIMEOUT_MS, "HEAD");
        if (res.status === 405 || res.status === 501) {
          res = await fetchWithTimeout(href, LINK_CHECK_TIMEOUT_MS, "GET");
        }
        if (res.status >= 400) {
          results.push({ href, status: res.status });
        }
      } catch (err) {
        results.push({
          href,
          status: null,
          error: err instanceof Error ? err.message : "Bilinmeyen hata",
        });
      }
    })
  );

  return Object.assign(results, { checked: list.length });
}

/* -------------------------------------------------------------------------- */
/*  robots.txt / sitemap.xml                                                   */
/* -------------------------------------------------------------------------- */

async function checkRobotsAndSitemap(origin: string) {
  let hasRobotsTxt = false;
  let robotsTxtContent: string | null = null;
  let hasSitemapXml = false;

  try {
    const res = await fetchWithTimeout(`${origin}/robots.txt`, 6_000);
    if (res.ok) {
      hasRobotsTxt = true;
      // robots.txt de sınırlı okunur (dev dosya belleği patlatmasın).
      const text = await readBodyText(res, MAX_ROBOTS_BYTES);
      robotsTxtContent = text.slice(0, 4000);
      hasSitemapXml = /^sitemap:/im.test(text);
    }
  } catch {
    /* yok say */
  }

  if (!hasSitemapXml) {
    try {
      const res = await fetchWithTimeout(`${origin}/sitemap.xml`, 6_000, "HEAD");
      if (res.ok) hasSitemapXml = true;
    } catch {
      /* yok say */
    }
  }

  return { hasRobotsTxt, robotsTxtContent, hasSitemapXml };
}

/* -------------------------------------------------------------------------- */
/*  Skor + Kontrol listesi                                                     */
/* -------------------------------------------------------------------------- */

function sev(score: number): Severity {
  if (score >= 0.8) return "success";
  if (score >= 0.4) return "warning";
  return "error";
}

function check(partial: Omit<CheckItem, "severity">): CheckItem {
  return { ...partial, severity: sev(partial.score) };
}

export function buildChecks(m: PageMetrics): CheckItem[] {
  const t = m.technical;

  /* ---- Title ---- */
  const titleScore = !m.title
    ? 0
    : m.titleLength >= 30 && m.titleLength <= 60
      ? 1
      : m.titleLength < 20 || m.titleLength > 70
        ? 0.25
        : 0.6;

  const titleCheck = check({
    id: "title",
    title: "Sayfa Başlığı (Title)",
    category: "onpage",
    weight: 12,
    score: titleScore,
    summary: !m.title
      ? "Sayfada <title> etiketi bulunamadı."
      : `Title ${m.titleLength} karakter. İdeal aralık 30–60 karakter.`,
    value: m.title ?? "—",
    howToFix: [
      "Her sayfa için özgün bir title yazın.",
      "Ana anahtar kelimeyi başlığın ilk 60 karakterine yerleştirin.",
      "Marka adını sonda tutun: “Anahtar Kelime — Başlık | Marka”.",
    ],
    proDetail: m.title
      ? `Yoğunluk analizi: "${m.title}" içindeki kelime frekansı ve rakip karşılaştırma verisi Pro planda açıktır.`
      : undefined,
  });

  /* ---- Meta description ---- */
  const descScore = !m.metaDescription
    ? 0
    : m.metaDescriptionLength >= 70 && m.metaDescriptionLength <= 160
      ? 1
      : m.metaDescriptionLength < 50 || m.metaDescriptionLength > 170
        ? 0.3
        : 0.65;

  const descCheck = check({
    id: "meta-description",
    title: "Meta Açıklama (Description)",
    category: "onpage",
    weight: 10,
    score: descScore,
    summary: !m.metaDescription
      ? "Meta description eksik — arama sonuçlarında otomatik özet gösterilir."
      : `Meta description ${m.metaDescriptionLength} karakter (ideal: 70–160).`,
    value: m.metaDescription ?? "—",
    howToFix: [
      "Her sayfaya özgün, tıklanabilir bir meta açıklama yazın.",
      "150–160 karakter aralığında tutun ve eylem çağrısı ekleyin.",
      "Ana anahtar kelimeyi açıklamanın ilk yarısında kullanın.",
    ],
  });

  /* ---- H1 ---- */
  const h1Count = m.headings.h1.length;
  const h1Score = h1Count === 1 ? 1 : h1Count === 0 ? 0 : h1Count <= 3 ? 0.45 : 0.15;
  const h1Check = check({
    id: "h1",
    title: "H1 Etiketi",
    category: "onpage",
    weight: 10,
    score: h1Score,
    summary:
      h1Count === 0
        ? "Sayfada H1 başlığı yok."
        : `Sayfada ${h1Count} adet H1 var (ideal: 1 adet).`,
    value: m.headings.h1[0] ?? "—",
    howToFix: [
      "Her sayfaya tam olarak bir tane H1 verin.",
      "H1'i sayfanın ana konusuyla ve title ile uyumlu tutun.",
      "Fazladan H1'leri H2/H3 olarak yeniden etiketleyin.",
    ],
  });

  /* ---- Heading hiyerarşisi ---- */
  const totalHeadings =
    h1Count +
    m.headings.h2.length +
    m.headings.h3.length +
    m.headings.h4.length +
    m.headings.h5.length +
    m.headings.h6.length;

  const skipCount = m.headings.skips?.length ?? 0;
  let hierarchyScore = totalHeadings === 0 ? 0.2 : m.headings.h2.length > 0 ? 1 : 0.5;
  if (skipCount > 0) {
    hierarchyScore = Math.max(0.25, hierarchyScore - skipCount * 0.25);
  }

  const headingCheck = check({
    id: "heading-hierarchy",
    title: "Başlık Hiyerarşisi (H1–H6)",
    category: "content",
    weight: 7,
    score: hierarchyScore,
    summary:
      skipCount > 0
        ? `Başlık hiyerarşisinde ${skipCount} seviye atlama hatası tespit edildi (${m.headings.skips[0]?.fromLevel} → ${m.headings.skips[0]?.toLevel}).`
        : `Toplam ${totalHeadings} başlık. Düzenli H1-H6 hiyerarşisi (H1:${h1Count} · H2:${m.headings.h2.length} · H3:${m.headings.h3.length}).`,
    value: `H1×${h1Count} H2×${m.headings.h2.length} H3×${m.headings.h3.length} H4×${m.headings.h4.length}${skipCount > 0 ? ` · ${skipCount} Atlanmış Seviye` : ""}`,
    howToFix: [
      "Başlıkları içeriğin yapısını yansıtacak şekilde H1 → H2 → H3 sırasıyla kullanın.",
      skipCount > 0
        ? `Seviye atlamalarını düzeltin: H${m.headings.skips[0]?.fromLevel} başlığından doğrudan H${m.headings.skips[0]?.toLevel}'e atlamayın, araya ara başlık ekleyin.`
        : "Seviye atlayarak (örn. H2'den H4'e) geçiş yapmayın.",
      "Ana bölümlere H2, alt bölümlere H3 verin.",
    ],
    proDetail:
      "Pro planda başlık ağacı görselleştirmesi ve rakip sitelerin başlık yapısıyla karşılaştırma sunulur.",
  });

  /* ---- Görseller ---- */
  const imgTotal = m.images.total;
  const altProblem = m.images.missingAlt + m.images.emptyAlt;
  const imgScore =
    imgTotal === 0
      ? 0.6
      : altProblem === 0
        ? 1
        : altProblem / imgTotal > 0.4
          ? 0.15
          : 0.5;
  const imgCheck = check({
    id: "images-alt",
    title: "Görsel ALT Etiketleri",
    category: "onpage",
    weight: 9,
    score: imgScore,
    summary:
      imgTotal === 0
        ? "Sayfada <img> etiketi bulunmuyor."
        : `${imgTotal} görselin ${altProblem} tanesinde ALT etiketi eksik/boş.`,
    value: `${m.images.missingAlt} eksik · ${m.images.emptyAlt} boş · ${m.images.total} toplam`,
    howToFix: [
      "Her anlamlı görsele kısa ve açıklayıcı bir alt metni yazın.",
      "Süsleme görsellerinde alt=\"\" bırakın (ekran okuyucular atlar).",
      "Alt metinlerinde anahtar kelime doldurma yapmayın, doğal yazın.",
    ],
    proDetail:
      m.images.missingAltSrcs.length > 0
        ? `Eksik ALT'li görseller: ${m.images.missingAltSrcs.join(", ")}`
        : undefined,
  });

  /* ---- Boyut/CLS ---- */
  const dimScore =
    imgTotal === 0 ? 0.7 : 1 - Math.min(1, m.images.missingDimensions / imgTotal);
  const dimCheck = check({
    id: "images-dimensions",
    title: "Görsel Boyutları (CLS)",
    category: "technical",
    weight: 4,
    score: dimScore,
    summary: `${m.images.missingDimensions} görselde width/height tanımı yok — bu sayfa kayması (CLS) riskini artırır.`,
    value: `${m.images.lazyLoaded}/${imgTotal} görsel lazy-load`,
    howToFix: [
      "Tüm <img> etiketlerine width ve height nitelikleri ekleyin.",
      "Kritik olmayan görsellerde loading=\"lazy\" kullanın.",
      "Modern formatlar için <picture> / WebP / AVIF dönüşümü uygulayın.",
    ],
  });

  /* ---- Link dağılımı ---- */
  const linkScore =
    m.links.total === 0 ? 0.3 : m.links.internal >= 3 ? 1 : m.links.internal >= 1 ? 0.6 : 0.35;
  const linkCheck = check({
    id: "links-structure",
    title: "Link Yapısı",
    category: "links",
    weight: 6,
    score: linkScore,
    summary: `${m.links.total} link: ${m.links.internal} iç, ${m.links.external} dış, ${m.links.noFollow} nofollow.`,
    value: `İç: ${m.links.internal} · Dış: ${m.links.external}`,
    howToFix: [
      "İç linklerle ilgili sayfaları birbirine bağlayarak keşfedilebilirliği artırın.",
      "Kırık/boş href'leri temizleyin.",
      "Sponsor/ücretli linklere rel=\"nofollow\" veya rel=\"sponsored\" verin.",
    ],
    proDetail:
      "Pro planda iç link grafiği, en çok linklenen sayfalar ve yetki (authority) dağılımı raporlanır.",
  });

  /* ---- Kırık linkler ---- */
  const brokenCount = m.links.broken.length;
  const brokenScore =
    m.links.checked === 0 ? 0.7 : brokenCount === 0 ? 1 : brokenCount / m.links.checked > 0.15 ? 0.1 : 0.45;
  const brokenCheck = check({
    id: "links-broken",
    title: "Kırık Link Kontrolü",
    category: "links",
    weight: 8,
    score: brokenScore,
    summary:
      m.links.checked === 0
        ? "Kontrol edilecek link bulunamadı."
        : brokenCount === 0
          ? `${m.links.checked} link kontrol edildi, kırık link yok.`
          : `${m.links.checked} linkten ${brokenCount} tanesi yanıt vermiyor.`,
    value: brokenCount
      ? m.links.broken
          .slice(0, 5)
          .map((b) => `${b.status ?? "ERR"} ${b.href}`)
          .join("\n")
      : "Temiz",
    howToFix: [
      "404 dönen linkleri kaldırın veya doğru hedefe yönlendirin.",
      "Geçici sunucu hatalarını (5xx) altyapı tarafında araştırın.",
      "Otomatik kırık link taraması için bir cron/görev zamanlayın.",
    ],
    proDetail:
      brokenCount > 0
        ? `Tam kırık link listesi: ${m.links.broken.map((b) => b.href).join(", ")}`
        : undefined,
  });

  /* ---- HTTPS ---- */
  const httpsScore = t.isHttps ? 1 : 0;
  const httpsCheck = check({
    id: "https",
    title: "SSL / HTTPS",
    category: "technical",
    weight: 10,
    score: httpsScore,
    summary: t.isHttps
      ? "Sayfa HTTPS üzerinden yayınlanıyor."
      : "Sayfa HTTP üzerinden yayınlanıyor — arama motorları güvenli olmayan siteleri cezalandırır.",
    value: m.finalUrl,
    howToFix: [
      "Geçerli bir SSL sertifikası yükleyin (Let's Encrypt ücretsizdir).",
      "HTTP → HTTPS için 301 yönlendirmesi tanımlayın.",
      "HSTS başlığı ekleyin ve iç linklerde mutlak HTTPS URL kullanın.",
    ],
  });

  /* ---- robots.txt ---- */
  const robotsScore = t.hasRobotsTxt ? 1 : 0;
  const robotsCheck = check({
    id: "robots-txt",
    title: "robots.txt",
    category: "technical",
    weight: 6,
    score: robotsScore,
    summary: t.hasRobotsTxt
      ? "robots.txt dosyası mevcut."
      : "robots.txt dosyası bulunamadı.",
    value: t.hasRobotsTxt ? "Mevcut" : "Eksik",
    howToFix: [
      "Kök dizine /robots.txt dosyası ekleyin.",
      "Sitemap konumunuzu robots.txt içinde bildirin: Sitemap: https://site.com/sitemap.xml",
      "Yönetim ve gizli klasörleri Disallow ile engelleyin.",
    ],
    proDetail: t.robotsTxtContent
      ? `robots.txt içeriği (ilk 500 karakter): ${t.robotsTxtContent.slice(0, 500)}`
      : undefined,
  });

  /* ---- sitemap ---- */
  const sitemapScore = t.hasSitemapXml ? 1 : 0;
  const sitemapCheck = check({
    id: "sitemap",
    title: "sitemap.xml",
    category: "technical",
    weight: 6,
    score: sitemapScore,
    summary: t.hasSitemapXml
      ? "sitemap.xml tespit edildi."
      : "sitemap.xml bulunamadı.",
    value: t.hasSitemapXml ? "Mevcut" : "Eksik",
    howToFix: [
      "XML site haritası üretin (Next.js için next-sitemap veya benzeri).",
      "robots.txt içinde bildirin ve Search Console'a gönderin.",
      "Yeni sayfalar eklendiğinde otomatik güncelleyin.",
    ],
  });

  /* ---- Open Graph ---- */
  const ogScore = t.hasOpenGraph ? (t.openGraphKeys.length >= 4 ? 1 : 0.6) : 0;
  const ogCheck = check({
    id: "open-graph",
    title: "Open Graph Etiketleri",
    category: "onpage",
    weight: 5,
    score: ogScore,
    summary: t.hasOpenGraph
      ? `${t.openGraphKeys.length} OG etiketi bulundu.`
      : "Open Graph etiketleri yok — sosyal medya paylaşımları zayıf görünür.",
    value: t.openGraphKeys.join(", ") || "—",
    howToFix: [
      "og:title, og:description, og:image ve og:url etiketlerini ekleyin.",
      "og:image görselini 1200×630 px olarak hazırlayın.",
      "Twitter/X için twitter:card ekleyin.",
    ],
  });

  /* ---- Twitter Card ---- */
  const twScore = t.hasTwitterCard ? 1 : t.hasOpenGraph ? 0.5 : 0;
  const twCheck = check({
    id: "twitter-card",
    title: "Twitter / X Kartı",
    category: "onpage",
    weight: 3,
    score: twScore,
    summary: t.hasTwitterCard
      ? "Twitter kart etiketleri mevcut."
      : "twitter:card etiketi eksik.",
    value: t.hasTwitterCard ? "Mevcut" : "Eksik",
    howToFix: [
      'Etiketleri ekleyin: <meta name="twitter:card" content="summary_large_image">',
      "twitter:title, twitter:description ve twitter:image tanımlayın.",
    ],
  });

  /* ---- Yapısal veri ---- */
  const sdScore = t.hasStructuredData ? 1 : 0.25;
  const sdCheck = check({
    id: "structured-data",
    title: "Yapısal Veri (Schema.org)",
    category: "technical",
    weight: 5,
    score: sdScore,
    summary: t.hasStructuredData
      ? `JSON-LD tespit edildi: ${t.structuredDataTypes.join(", ")}`
      : "Uygulama/JSON-LD yapısal verisi bulunamadı.",
    value: t.structuredDataTypes.join(", ") || "—",
    howToFix: [
      "Sayfa türüne uygun schema.org etiketi ekleyin (Organization, Product, Article, FAQPage, LocalBusiness).",
      "Google Zengin Sonuçlar Testi ile doğrulayın.",
      "Hatalı/eksik alanları Search Console uyarılarından takip edin.",
    ],
    proDetail:
      "Pro planda tüm sayfaların schema kapsamı taranır ve eksik alan listesi çıkarılır.",
  });

  /* ---- Viewport / mobil ---- */
  const vpScore = m.viewport ? 1 : 0;
  const vpCheck = check({
    id: "viewport",
    title: "Mobil Viewport",
    category: "technical",
    weight: 7,
    score: vpScore,
    summary: m.viewport
      ? "viewport meta etiketi tanımlı."
      : "viewport meta etiketi yok — mobil uyumluluk testinde başarısız olur.",
    value: m.viewport ?? "—",
    howToFix: [
      '<head> içine ekleyin: <meta name="viewport" content="width=device-width, initial-scale=1">',
      "Sabit genişlikli yerleşimlerden kaçının.",
      "Mobilde dokunma hedeflerini en az 44×44 px yapın.",
    ],
  });

  /* ---- Dil ---- */
  const langScore = m.lang ? 1 : 0.3;
  const langCheck = check({
    id: "html-lang",
    title: "Dil Tanımı (html lang)",
    category: "onpage",
    weight: 3,
    score: langScore,
    summary: m.lang
      ? `Sayfa dili "${m.lang}" olarak tanımlı.`
      : "<html> etiketinde lang niteliği yok.",
    value: m.lang ?? "—",
    howToFix: [
      '<html lang="tr"> gibi doğru ISO kodunu kullanın.',
      "Çok dilli sitelerde hreflang etiketleri ekleyin.",
    ],
  });

  /* ---- Canonical ---- */
  const cScore = m.canonical ? 1 : 0.35;
  const cCheck = check({
    id: "canonical",
    title: "Canonical URL",
    category: "technical",
    weight: 5,
    score: cScore,
    summary: m.canonical
      ? "Canonical etiketi tanımlı."
      : "Canonical etiketi yok — yinelenen içerik riski.",
    value: m.canonical ?? "—",
    howToFix: [
      'Her sayfaya <link rel="canonical" href="..." /> ekleyin.',
      "Canonical'ı kendine referans veren mutlak URL yapın.",
      "URL parametreli sayfaları ana sürüme yönlendirin.",
    ],
  });

  /* ---- İçerik uzunluğu ---- */
  const wc = m.wordCount;
  const wcScore = wc >= 600 ? 1 : wc >= 300 ? 0.7 : wc >= 100 ? 0.4 : 0.12;
  const contentCheck = check({
    id: "content-length",
    title: "İçerik Uzunluğu",
    category: "content",
    weight: 8,
    score: wcScore,
    summary: `Sayfada yaklaşık ${wc} kelime metin içeriği var.`,
    value: `${wc} kelime · ${m.contentLength} karakter · metin/HTML oranı %${m.textToHtmlRatio}`,
    howToFix: [
      "Hedef konu için en az 600–1000 kelimelik derin içerik üretin.",
      "Kısa/ince (thin) sayfaları birleştirin veya genişletin.",
      "Anahtar kelimeyi zenginleştirmek için LSI/ilişkili terimler kullanın.",
    ],
    proDetail:
      "Pro planda anahtar kelime yoğunluğu, okunabilirlik skoru ve TF-IDF tabanlı rakip içerik karşılaştırması sunulur.",
  });

  /* ---- Hreflang ---- */
  const hrefScore = t.hasHreflang ? 1 : 0.55;
  const hrefCheck = check({
    id: "hreflang",
    title: "Hreflang (Çoklu Dil)",
    category: "technical",
    weight: 2,
    score: hrefScore,
    summary: t.hasHreflang
      ? "hreflang etiketleri bulundu."
      : "hreflang yok — çok dilli bir site için önerilir, tek dilli sitede kritik değildir.",
    value: t.hasHreflang ? "Mevcut" : "Yok",
    howToFix: [
      "Her dil/alternatif için <link rel=\"alternate\" hreflang=\"...\"> ekleyin.",
      "Kendine referans veren hreflang (x-default dahil) kullanın.",
    ],
  });

  /* ---- Sayfa hızı (HTML boyutu) ---- */
  const sizeKb = m.htmlSizeBytes / 1024;
  const speedScore = sizeKb < 100 ? 1 : sizeKb < 250 ? 0.75 : sizeKb < 500 ? 0.5 : 0.25;
  const speedCheck = check({
    id: "html-weight",
    title: "HTML Boyutu & İstemci Ağırlığı",
    category: "technical",
    weight: 5,
    score: speedScore,
    summary: `Ham HTML ${sizeKb.toFixed(1)} KB, ${m.technical.scriptCount} script, ${m.technical.stylesheetCount} stil dosyası.`,
    value: `${m.loadTimeMs} ms yanıt süresi`,
    howToFix: [
      "Kritik olmayan script'leri erteleyin (defer/async).",
      "CSS/JS'i sıkıştırın ve kullanılmayan kodları temizleyin.",
      "Sunucu yanıt süresini (TTFB) 200 ms altına indirmeyi hedefleyin.",
    ],
    proDetail:
      "Pro planda gerçek tarayıcı ölçümü (Lighthouse / Core Web Vitals: LCP, CLS, INP) raporu eklenir.",
  });

  /* ---- Core Web Vitals ---- */
  const cwvCheck = check({
    id: "core-web-vitals",
    title: "Core Web Vitals Performansı",
    category: "technical",
    weight: 9,
    score: m.cwv.overallScore / 100,
    summary: `CWV Skoru: ${m.cwv.overallScore}/100 (${m.cwv.overallRating.toUpperCase()}). LCP: ${(m.cwv.lcp.value / 1000).toFixed(2)}s · CLS: ${m.cwv.cls.value} · FID: ${m.cwv.fid.value}ms.`,
    value: `LCP ${m.cwv.lcp.value}ms · CLS ${m.cwv.cls.value} · FID ${m.cwv.fid.value}ms`,
    howToFix: [
      m.cwv.lcp.recommendation,
      m.cwv.cls.recommendation,
      m.cwv.fid.recommendation,
    ],
    proDetail: `En büyük içerikli boyama öğesi: ${m.cwv.lcp.element}. Boyutsuz görsel sayısı: ${m.cwv.cls.unconstrainedImages}.`,
  });

  /* ---- Güvenlik Başlıkları ---- */
  const secCheck = check({
    id: "security-headers",
    title: "HTTP Güvenlik Başlıkları",
    category: "technical",
    weight: 7,
    score: m.security.score / 100,
    summary: `${m.security.passedCount}/6 temel güvenlik başlığı tanımlı (Güvenlik Skoru: ${m.security.score}/100, Not: ${m.security.grade}).`,
    value: `HSTS: ${m.security.headers.hsts.present ? "Var" : "Yok"} · CSP: ${m.security.headers.csp.present ? "Var" : "Yok"} · X-Frame: ${m.security.headers.xFrameOptions.present ? "Var" : "Yok"}`,
    howToFix: [
      !m.security.headers.hsts.present ? m.security.headers.hsts.recommendation : "",
      !m.security.headers.csp.present ? m.security.headers.csp.recommendation : "",
      !m.security.headers.xFrameOptions.present ? m.security.headers.xFrameOptions.recommendation : "",
      !m.security.headers.xContentTypeOptions.present ? m.security.headers.xContentTypeOptions.recommendation : "",
    ].filter(Boolean),
    proDetail: `Tanımlı başlıklar: ${Object.entries(m.security.headers).filter(([, h]) => h.present).map(([k]) => k).join(", ") || "Hiçbiri"}`,
  });

  return [
    titleCheck,
    descCheck,
    h1Check,
    headingCheck,
    imgCheck,
    dimCheck,
    linkCheck,
    brokenCheck,
    httpsCheck,
    robotsCheck,
    sitemapCheck,
    ogCheck,
    twCheck,
    sdCheck,
    vpCheck,
    langCheck,
    cCheck,
    contentCheck,
    hrefCheck,
    speedCheck,
    cwvCheck,
    secCheck,
  ];
}

export function computeScore(checks: CheckItem[]): number {
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return 0;
  const earned = checks.reduce((s, c) => s + c.weight * c.score, 0);
  return Math.round((earned / totalWeight) * 100);
}

export function gradeFor(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

/* -------------------------------------------------------------------------- */
/*  Ana giriş noktası                                                          */
/* -------------------------------------------------------------------------- */

export async function analyzeUrl(rawUrl: string): Promise<AnalysisResult> {
  const url = normalizeUrl(rawUrl);
  const started = Date.now();

  // Girdiyi fetch'ten ÖNCE doğrula: iç ağ / metadata hedefleri 400 INVALID_URL
  // olarak dönsün, 502 FETCH_FAILED değil.
  assertPublicHttpUrl(url);

  let res: Response;
  try {
    res = await fetchWithTimeout(url);
  } catch (err) {
    // Yönlendirme zincirinde yakalanan engelli hedef kodu aynen taşınır.
    const blocked = (err as { code?: string }).code === "BLOCKED_TARGET";
    if (blocked) throw err;
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "İstek zaman aşımına uğradı (12 sn)."
        : `Siteye ulaşılamadı: ${err instanceof Error ? err.message : "bilinmeyen hata"}`;
    throw Object.assign(new Error(message), { code: "FETCH_FAILED" });
  }

  const finalUrl = res.url || url;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html") && !contentType.includes("xhtml")) {
    throw Object.assign(
      new Error(`Hedef bir HTML sayfası değil (content-type: ${contentType || "bilinmiyor"}).`),
      { code: "NOT_HTML" }
    );
  }

  // Gövde akış halinde ve üst sınırla okunur (SSRF-safe fetch + boyut sınırı).
  const html = await readBodyText(res, MAX_HTML_BYTES);
  const loadTimeMs = Date.now() - started;

  const metrics = extractMetrics(html, url, finalUrl, loadTimeMs, res.headers);

  const [broken, robots] = await Promise.all([
    checkBrokenLinks(html, finalUrl),
    checkRobotsAndSitemap(new URL(finalUrl).origin),
  ]);

  metrics.links.broken = broken;
  metrics.links.checked = broken.checked;
  metrics.technical.hasRobotsTxt = robots.hasRobotsTxt;
  metrics.technical.robotsTxtContent = robots.robotsTxtContent;
  metrics.technical.hasSitemapXml = robots.hasSitemapXml;

  const checks = buildChecks(metrics);
  const score = computeScore(checks);

  const passed = checks.filter((c) => c.severity === "success").length;
  const warnings = checks.filter((c) => c.severity === "warning").length;
  const errors = checks.filter((c) => c.severity === "error").length;

  return {
    url,
    score,
    grade: gradeFor(score),
    checks,
    metrics,
    cwv: metrics.cwv,
    securityHeaders: metrics.security,
    summary: { passed, warnings, errors, total: checks.length },
    plan: "free",
    dailyUsage: { used: 1, limit: 3 },
  };
}