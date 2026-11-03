export type Severity = "success" | "warning" | "error" | "info";
export type CheckCategory = "onpage" | "technical" | "content" | "links";

export interface CheckItem {
  id: string;
  title: string;
  category: CheckCategory;
  severity: Severity;
  /** Kısa özet — kartın ilk satırı */
  summary: string;
  /** Ölçülen değer (opsiyonel) */
  value?: string;
  /** "Nasıl Çözülür?" önerileri */
  howToFix: string[];
  /** Pro plana özel detaylar (ücretsiz planda bulanıklaştırılır) */
  proDetail?: string;
  /** 0–100 arası bu kontrolün skora katkısının hedefi */
  weight: number;
  /** 0 veya 1 — skor hesabında kullanılan başarı oranı */
  score: number;
}

export type CwvRating = "good" | "needs-improvement" | "poor";

export interface CoreWebVitalsMetric {
  value: number;
  unit: string;
  rating: CwvRating;
  score: number;
  description: string;
  recommendation: string;
}

export interface CoreWebVitals {
  lcp: CoreWebVitalsMetric & { element: string };
  cls: CoreWebVitalsMetric & { unconstrainedImages: number };
  fid: CoreWebVitalsMetric;
  inp: CoreWebVitalsMetric;
  overallScore: number;
  overallRating: CwvRating;
}

export interface SecurityHeaderItem {
  name: string;
  headerKey: string;
  present: boolean;
  value: string | null;
  severity: Severity;
  rating: "good" | "warning" | "poor";
  score: number;
  description: string;
  recommendation: string;
}

export interface SecurityHeadersAnalysis {
  score: number;
  grade: string;
  headers: {
    hsts: SecurityHeaderItem;
    csp: SecurityHeaderItem;
    xFrameOptions: SecurityHeaderItem;
    xContentTypeOptions: SecurityHeaderItem;
    referrerPolicy: SecurityHeaderItem;
    permissionsPolicy: SecurityHeaderItem;
  };
  passedCount: number;
  totalCount: number;
}

export interface HeadingOrderItem {
  tag: string;
  level: number;
  text: string;
}

export interface HeadingSkipItem {
  fromLevel: number;
  toLevel: number;
  text: string;
}

export interface PageMetrics {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  loadTimeMs: number;
  htmlSizeBytes: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonical: string | null;
  lang: string | null;
  viewport: string | null;
  charset: string | null;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
    order: HeadingOrderItem[];
    skips: HeadingSkipItem[];
  };
  images: {
    total: number;
    missingAlt: number;
    missingAltSrcs: string[];
    emptyAlt: number;
    missingDimensions: number;
    lazyLoaded: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
    noFollow: number;
    empty: number;
    checked: number;
    broken: { href: string; status: number | null; error?: string }[];
  };
  technical: {
    isHttps: boolean;
    hasRobotsTxt: boolean;
    robotsTxtContent: string | null;
    hasSitemapXml: boolean;
    hasFavicon: boolean;
    hasOpenGraph: boolean;
    openGraphKeys: string[];
    hasTwitterCard: boolean;
    hasStructuredData: boolean;
    structuredDataTypes: string[];
    hasHreflang: boolean;
    inlineStyles: number;
    scriptCount: number;
    stylesheetCount: number;
  };
  cwv: CoreWebVitals;
  security: SecurityHeadersAnalysis;
  wordCount: number;
  textToHtmlRatio: number;
  contentLength: number;
}

export interface AnalysisResult {
  url: string;
  score: number;
  grade: string;
  checks: CheckItem[];
  metrics: PageMetrics;
  cwv: CoreWebVitals;
  securityHeaders: SecurityHeadersAnalysis;
  summary: {
    passed: number;
    warnings: number;
    errors: number;
    total: number;
  };
  plan: "free" | "pro";
  dailyUsage: { used: number; limit: number };
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeError {
  error: string;
  code?: "INVALID_URL" | "FETCH_FAILED" | "TIMEOUT" | "NOT_HTML" | "RATE_LIMIT";
}