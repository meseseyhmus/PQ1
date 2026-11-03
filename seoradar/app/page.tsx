"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PartnerSection } from "@/components/PartnerSection";
import { ScoreRing } from "@/components/ScoreRing";
import { AgencyContactModal } from "@/components/AgencyContactModal";
import { CoreWebVitalsCards } from "@/components/CoreWebVitalsCards";
import { SecurityHeaderSnippet } from "@/components/SecurityHeaderSnippet";
import { generateAnalysisPdf } from "@/lib/pdf";
import { formatBytes, formatDuration } from "@/lib/format";
import type { AnalysisResult, CheckCategory, CheckItem, Severity } from "@/types";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Link2,
  Lock,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
  BarChart3,
  AlignLeft,
  Copy,
  Check,
} from "lucide-react";

const CATEGORY_NAMES: Record<CheckCategory | "all" | "errors", string> = {
  all: "Tüm Kontroller",
  errors: "Kritik Hatalar",
  onpage: "On-Page SEO",
  technical: "Teknik SEO",
  content: "İçerik & Metin",
  links: "Link Yapısı",
};

type ViewTab = "checks" | "vitals" | "security" | "headings" | "images" | "links" | "social" | "keywords" | "competitor";

export default function SeoRadarPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("checks");
  const [selectedCategory, setSelectedCategory] = useState<CheckCategory | "all" | "errors">("all");
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [agencyModalOpen, setAgencyModalOpen] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 3 });

  // Competitor comparison state
  const [compUrl, setCompUrl] = useState("");
  const [compResult, setCompResult] = useState<AnalysisResult | null>(null);
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);

  // Copied alert
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem("seoradar_usage");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setUsage({ used: parsed.used, limit: 3 });
          return;
        }
      }
      localStorage.setItem("seoradar_usage", JSON.stringify({ date: today, used: 0 }));
    } catch {
      // ignore
    }
  }, []);

  async function handleAnalyze(url: string) {
    if (usage.used >= usage.limit && !isPro) {
      setProModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setCompResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analiz sırasında bir hata oluştu.");
      }

      setResult({ ...data, plan: isPro ? "pro" : "free" });

      const newUsed = usage.used + 1;
      setUsage((prev) => ({ ...prev, used: newUsed }));
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem("seoradar_usage", JSON.stringify({ date: today, used: newUsed }));

      setTimeout(() => {
        document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompareCompetitor() {
    if (!compUrl.trim()) return;
    setCompLoading(true);
    setCompError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: compUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rakip analiz edilemedi.");
      setCompResult(data);
    } catch (err: unknown) {
      setCompError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setCompLoading(false);
    }
  }

  function handleDownloadPdf() {
    if (!result) return;
    const doc = generateAnalysisPdf(result, {
      brandName: isPro ? "SeoRadar Pro" : "SeoRadar",
      planLabel: isPro ? "Pro Rapor (Beyaz Etiket)" : "Ücretsiz Denetim Raporu",
      watermark: !isPro,
      competitorResult: compResult,
    });
    const hostname = new URL(result.url).hostname.replace(/[^a-z0-9]/gi, "_");
    doc.save(`seoradar_rapor_${hostname}.pdf`);
  }

  // Calculate mock keyword density from title, description and headings
  const keywordDensity = useMemo(() => {
    if (!result) return [];
    const text = [
      result.metrics.title || "",
      result.metrics.metaDescription || "",
      ...result.metrics.headings.h1,
      ...result.metrics.headings.h2,
      ...result.metrics.headings.h3,
    ].join(" ").toLowerCase();

    const stopWords = new Set(["ve", "ile", "için", "bir", "bu", "şu", "o", "da", "de", "gibi", "daha", "en", "çok", "kadar", "olan", "the", "and", "or", "in", "on", "at", "to", "for", "of", "a", "an", "is", "it"]);
    const words = text
      .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const counts: Record<string, number> = {};
    for (const w of words) counts[w] = (counts[w] || 0) + 1;

    const total = words.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / total) * 100).toFixed(1),
      }));
  }, [result]);

  const filteredChecks = result
    ? result.checks.filter((c) => {
        if (selectedCategory === "all") return true;
        if (selectedCategory === "errors") return c.severity === "error";
        return c.category === selectedCategory;
      })
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onUpgrade={() => setProModalOpen(true)} />

      <Hero
        onSubmit={handleAnalyze}
        loading={loading}
        error={error}
        disabled={usage.used >= usage.limit && !isPro}
        usage={usage}
      />

      {loading && (
        <div className="container-x my-8">
          <div className="rounded-3xl border border-brand-200 bg-brand-50/70 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex size-12 animate-spin items-center justify-center rounded-full border-4 border-brand-600 border-t-transparent text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">Web Sitesi Taranıyor...</h3>
            <p className="mt-1 text-sm text-slate-600">
              HTML kaynak kodu, başlık hiyerarşisi, görsel alt etiketleri, teknik dosyalar (robots/sitemap) ve kırık linkler kontrol ediliyor.
            </p>
          </div>
        </div>
      )}

      {result && !loading && (
        <section id="sonuclar" className="container-x my-12 scroll-mt-20">
          {/* Main Score Header */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="flex flex-col items-center sm:flex-row sm:gap-8">
                <ScoreRing score={result.score} grade={result.grade} size={180} />
                <div className="mt-4 text-center sm:mt-0 sm:text-left">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    <Globe className="size-3.5" />
                    {result.url}
                  </span>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    SEO Analiz Raporu
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Tarih: {new Date(result.metrics.fetchedAt).toLocaleString("tr-TR")} • Yanıt Süresi:{" "}
                    {formatDuration(result.metrics.loadTimeMs)}
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 sm:w-auto sm:gap-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
                  <div className="flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-emerald-700">{result.summary.passed}</div>
                  <div className="text-xs font-semibold text-emerald-800">Başarılı</div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-center">
                  <div className="flex items-center justify-center text-amber-600">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-amber-700">{result.summary.warnings}</div>
                  <div className="text-xs font-semibold text-amber-800">Uyarı</div>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-center">
                  <div className="flex items-center justify-center text-rose-600">
                    <AlertCircle className="size-5" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-rose-700">{result.summary.errors}</div>
                  <div className="text-xs font-semibold text-rose-800">Hata</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheck className="size-4 text-emerald-500" />
                Toplam {result.summary.total} denetim noktası incelendi
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Download className="size-4" />
                  PDF Rapor İndir {isPro ? "" : "(Pro)"}
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw className="size-4" />
                  Yeni Analiz
                </button>
              </div>
            </div>

            {/* Quick Sample Switcher */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-semibold text-slate-400">Diğer örnek sitelerle dene:</span>
              {[
                { label: "trendyol.com", badge: "🛍️", url: "https://trendyol.com" },
                { label: "hepsiburada.com", badge: "🛒", url: "https://hepsiburada.com" },
                { label: "github.com", badge: "🐙", url: "https://github.com" },
                { label: "example.com", badge: "🌐", url: "https://example.com" },
              ].map((s) => (
                <button
                  key={s.url}
                  type="button"
                  onClick={() => handleAnalyze(s.url)}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition disabled:opacity-50"
                >
                  <span>{s.badge}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Sayfa Boyutu</span>
              <p className="mt-1 text-lg font-bold text-slate-800">{formatBytes(result.metrics.htmlSizeBytes)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Kelime Sayısı</span>
              <p className="mt-1 text-lg font-bold text-slate-800">{result.metrics.wordCount.toLocaleString("tr-TR")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Toplam Görsel</span>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {result.metrics.images.total}{" "}
                {result.metrics.images.missingAlt > 0 && (
                  <span className="text-xs font-medium text-rose-600">({result.metrics.images.missingAlt} alt eksik)</span>
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">İç Linkler</span>
              <p className="mt-1 text-lg font-bold text-slate-800">{result.metrics.links.internal}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Dış Linkler</span>
              <p className="mt-1 text-lg font-bold text-slate-800">{result.metrics.links.external}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">SSL / HTTPS</span>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {result.metrics.technical.isHttps ? <span className="text-emerald-600">Aktif</span> : <span className="text-rose-600">Yok</span>}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Core Web Vitals</span>
              <p className="mt-1 text-lg font-bold text-slate-800">
                <span className={result.cwv?.overallRating === "good" ? "text-emerald-600" : result.cwv?.overallRating === "needs-improvement" ? "text-amber-600" : "text-rose-600"}>
                  {result.cwv?.overallScore ?? 0}/100
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Güvenlik Skoru</span>
              <p className="mt-1 text-lg font-bold text-slate-800">
                <span className={(result.securityHeaders?.score ?? 0) >= 70 ? "text-emerald-600" : (result.securityHeaders?.score ?? 0) >= 40 ? "text-amber-600" : "text-rose-600"}>
                  {result.securityHeaders?.score ?? 0}/100
                </span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs for Deep Dive */}
          <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "checks", label: "Kontrol Listesi", icon: ShieldCheck },
              { id: "vitals", label: `Core Web Vitals (${result.cwv?.overallScore ?? 0}/100)`, icon: Zap },
              { id: "security", label: `Güvenlik Başlıkları (${result.securityHeaders?.score ?? 0}/100)`, icon: Lock },
              { id: "competitor", label: "Rakip Karşılaştırma", icon: BarChart3 },
              { id: "headings", label: "Başlık Hiyerarşisi (H1-H6)", icon: AlignLeft },
              { id: "images", label: `Görsel Denetimi (${result.metrics.images.total})`, icon: ImageIcon },
              { id: "links", label: `Linkler & Kırık Bağlantılar (${result.metrics.links.broken.length})`, icon: Link2 },
              { id: "social", label: "Sosyal Paylaşım Önizleme", icon: Share2 },
              { id: "keywords", label: "Anahtar Kelime Yoğunluğu", icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ViewTab)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === id
                    ? "bg-slate-900 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* TAB 1: Detailed Checks */}
          {activeTab === "checks" && (
            <div className="mt-6">
              {/* Filter Categories */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {(["all", "errors", "onpage", "technical", "content", "links"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedCategory === cat
                        ? "bg-brand-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {CATEGORY_NAMES[cat]}
                    {cat === "errors" && result.summary.errors > 0 && (
                      <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
                        {result.summary.errors}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Accordion list */}
              <div className="space-y-3">
                {filteredChecks.map((item) => {
                  const isExpanded = expandedCheck === item.id;
                  const isError = item.severity === "error";
                  const isWarning = item.severity === "warning";
                  const isSuccess = item.severity === "success";

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-slate-300"
                    >
                      <button
                        onClick={() => setExpandedCheck(isExpanded ? null : item.id)}
                        className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50/50"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="shrink-0">
                            {isSuccess && <CheckCircle2 className="size-5 text-emerald-500" />}
                            {isWarning && <AlertTriangle className="size-5 text-amber-500" />}
                            {isError && <AlertCircle className="size-5 text-rose-500" />}
                            {item.severity === "info" && <HelpCircle className="size-5 text-blue-500" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  isSuccess
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isWarning
                                    ? "bg-amber-50 text-amber-700"
                                    : isError
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {item.severity === "success"
                                  ? "Başarılı"
                                  : item.severity === "warning"
                                  ? "Uyarı"
                                  : item.severity === "error"
                                  ? "Hata"
                                  : "Bilgi"}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">{item.summary}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.value && (
                            <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 sm:inline-block">
                              {item.value}
                            </span>
                          )}
                          <ChevronDown
                            className={`size-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                          {item.value && (
                            <div className="mb-4">
                              <span className="text-xs font-semibold text-slate-500">Ölçülen Değer:</span>
                              <div className="mt-1 rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800">
                                {item.value}
                              </div>
                            </div>
                          )}

                          {item.howToFix.length > 0 && (
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Çözüm Önerileri:
                              </span>
                              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                                {item.howToFix.map((fix, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-500" />
                                    <span>{fix}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.proDetail && (
                            <div className="relative mt-4 overflow-hidden rounded-xl border border-brand-200 bg-white p-4">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-brand-700">
                                  <Sparkles className="size-3.5 text-amber-500" />
                                  Pro İnceleme & Kod Örneği
                                </span>
                                {!isPro && (
                                  <button
                                    onClick={() => setProModalOpen(true)}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                                  >
                                    <Lock className="size-3" /> Kilidi Aç
                                  </button>
                                )}
                              </div>
                              <div className={`mt-2 font-mono text-xs text-slate-700 ${!isPro ? "blur-sm select-none" : ""}`}>
                                {item.proDetail}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: Core Web Vitals */}
          {activeTab === "vitals" && result.cwv && (
            <CoreWebVitalsCards
              cwv={result.cwv}
              scriptCount={result.metrics.technical.scriptCount}
            />
          )}

          {/* TAB: HTTP Security Headers */}
          {activeTab === "security" && result.securityHeaders && (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <Lock className="size-3.5" />
                      HTTP Güvenlik ve Şifreleme Standartları
                    </div>
                    <h3 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                      HTTP Güvenlik Başlıkları Denetimi
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                      Web sunucunuzun HTTP yanıt başlıkları XSS, Clickjacking, MIME koklama ve MITM saldırılarına karşı taranmıştır.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500">Güvenlik Skoru</div>
                      <div className="text-3xl font-black text-slate-900">{result.securityHeaders.score}<span className="text-sm font-normal text-slate-400">/100</span></div>
                    </div>
                    <span className={`rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase ${
                      result.securityHeaders.score >= 70
                        ? "bg-emerald-100 text-emerald-800"
                        : result.securityHeaders.score >= 40
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      Not: {result.securityHeaders.grade}
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {Object.entries(result.securityHeaders.headers).map(([key, sec]) => (
                    <div
                      key={key}
                      className={`rounded-2xl border p-5 transition ${
                        sec.present
                          ? "border-emerald-200 bg-emerald-50/20"
                          : "border-slate-200 bg-slate-50/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                            sec.present
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-100 text-rose-700 border border-rose-200"
                          }`}>
                            {sec.present ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{sec.name}</h4>
                            <span className="font-mono text-[11px] text-slate-500">{sec.headerKey}</span>
                          </div>
                        </div>

                        <span className={`self-start sm:self-auto rounded-full px-3 py-1 text-xs font-bold ${
                          sec.present
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {sec.present ? "Tanımlı" : "Eksik"}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-slate-600">{sec.description}</p>

                      {sec.value && (
                        <div className="mt-2.5 rounded-xl bg-white border border-slate-200 px-3 py-2 font-mono text-[11px] text-slate-800 truncate">
                          <span className="font-bold text-slate-400">Değer: </span>{sec.value}
                        </div>
                      )}

                      {!sec.present && (
                        <div className="mt-3 rounded-xl bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900">
                          <span className="font-bold text-amber-800">Çözüm Önerisi: </span>
                          {sec.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Tıkla Kopyalama Yapılandırma Paneli (Nginx, Next.js, Apache) */}
              <SecurityHeaderSnippet security={result.securityHeaders} />
            </div>
          )}

          {/* TAB 2: Headings Hierarchy */}
          {activeTab === "headings" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Sayfa Başlık Ağacı (H1-H6)</h3>
                  <p className="text-xs text-slate-500">Google botlarının içeriğinizi tararken takip ettiği başlık iskeleti</p>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-blue-800">H1: {result.metrics.headings.h1.length}</span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-800">H2: {result.metrics.headings.h2.length}</span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-800">H3: {result.metrics.headings.h3.length}</span>
                </div>
              </div>

              {result.metrics.headings.skips && result.metrics.headings.skips.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    Başlık Hiyerarşisinde Seviye Atlama Uyarısı ({result.metrics.headings.skips.length} adet)
                  </div>
                  <p className="text-amber-700">
                    Aşağıdaki başlıklar H1 → H2 → H3 sırasını bozarak seviye atlamıştır:
                  </p>
                  <ul className="list-disc pl-5 pt-1 space-y-0.5">
                    {result.metrics.headings.skips.map((s, idx) => (
                      <li key={idx}>
                        <strong>H{s.fromLevel}</strong> ardından doğrudan <strong>H{s.toLevel}</strong> geliyor: &ldquo;{s.text}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.metrics.headings.h1.length === 0 && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                  Kritik Hata: Sayfada &lt;h1&gt; etiketi bulunamadı! Arama motorları sayfanın ana konusunu anlayamaz.
                </div>
              )}

              <div className="mt-6 space-y-3">
                {result.metrics.headings.h1.map((txt, i) => (
                  <div key={`h1-${i}`} className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3.5">
                    <span className="shrink-0 rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">H1</span>
                    <span className="text-sm font-bold text-slate-900">{txt}</span>
                  </div>
                ))}

                {result.metrics.headings.h2.map((txt, i) => (
                  <div key={`h2-${i}`} className="ml-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <span className="shrink-0 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-bold text-white">H2</span>
                    <span className="text-xs font-semibold text-slate-800">{txt}</span>
                  </div>
                ))}

                {result.metrics.headings.h3.map((txt, i) => (
                  <div key={`h3-${i}`} className="ml-12 flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-2.5">
                    <span className="shrink-0 rounded-md bg-slate-400 px-1.5 py-0.5 text-[10px] font-bold text-white">H3</span>
                    <span className="text-xs text-slate-700">{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Images & Alt Tags */}
          {activeTab === "images" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Görsel Analizi & Alt Metinleri</h3>
                  <p className="text-xs text-slate-500">Görsellerin arama motorları ve ekran okuyucular tarafından taranabilirliği</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-700">Toplam: {result.metrics.images.total}</span>
                  <span className="rounded-lg bg-rose-100 px-3 py-1 font-bold text-rose-700">Eksik Alt: {result.metrics.images.missingAlt}</span>
                </div>
              </div>

              {result.metrics.images.missingAltSrcs.length > 0 ? (
                <div className="mt-6 space-y-2">
                  <span className="text-xs font-bold text-rose-700">Alt Etiketi Eksik Görseller:</span>
                  <div className="divide-y divide-slate-100 rounded-2xl border border-rose-100 bg-rose-50/30">
                    {result.metrics.images.missingAltSrcs.map((src, i) => (
                      <div key={i} className="flex items-center justify-between p-3 text-xs">
                        <span className="truncate max-w-xl font-mono text-slate-700">{src}</span>
                        <span className="rounded-full bg-rose-200/70 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                          Alt Eksik
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="mx-auto mb-2 size-6 text-emerald-600" />
                  Tebrikler! Sayfadaki tüm görseller geçerli bir alt açıklamasına sahip.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Links & Broken links */}
          {activeTab === "links" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Bağlantı & Kırık Link Raporu</h3>
                  <p className="text-xs text-slate-500">İç/dış link dengesi ve 404/500 yanıt veren kırık bağlantılar</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700">İç: {result.metrics.links.internal}</span>
                  <span className="rounded-lg bg-purple-50 px-2.5 py-1 font-bold text-purple-700">Dış: {result.metrics.links.external}</span>
                  <span className="rounded-lg bg-rose-50 px-2.5 py-1 font-bold text-rose-700">Kırık: {result.metrics.links.broken.length}</span>
                </div>
              </div>

              {result.metrics.links.broken.length > 0 ? (
                <div className="mt-6 space-y-2">
                  <span className="text-xs font-bold text-rose-700">Tespit Edilen Kırık Bağlantılar:</span>
                  <div className="divide-y divide-slate-100 rounded-2xl border border-rose-200 bg-white">
                    {result.metrics.links.broken.map((b, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 text-xs">
                        <span className="truncate max-w-lg font-mono text-slate-800">{b.href}</span>
                        <span className="rounded-lg bg-rose-100 px-2.5 py-1 font-bold text-rose-800">
                          {b.status ? `HTTP ${b.status}` : "Ulaşılamadı"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="mx-auto mb-2 size-6 text-emerald-600" />
                  Taranan bağlantılar arasında hiçbir kırık (404/500) bağlantı bulunamadı.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Social Sharing Previews */}
          {activeTab === "social" && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Facebook / LinkedIn OG Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Facebook & LinkedIn Paylaşım Kartı</span>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="aspect-[1.91/1] w-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    {result.metrics.technical.hasOpenGraph ? "Open Graph Görseli" : "Görsel Belirtilmemiş"}
                  </div>
                  <div className="p-4 bg-white">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">{new URL(result.url).hostname}</span>
                    <h4 className="mt-1 font-bold text-sm text-slate-900 line-clamp-1">{result.metrics.title || "Başlık Yok"}</h4>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{result.metrics.metaDescription || "Açıklama belirtilmemiş."}</p>
                  </div>
                </div>
              </div>

              {/* Twitter Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Twitter / X Kart Önizlemesi</span>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="aspect-[2/1] w-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-semibold">
                    Twitter Large Image Card
                  </div>
                  <div className="p-4 bg-white">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{result.metrics.title || "Başlık Yok"}</h4>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{result.metrics.metaDescription || "Açıklama belirtilmemiş."}</p>
                    <span className="mt-2 block text-[11px] text-slate-400">🔗 {new URL(result.url).hostname}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Keyword Density */}
          {activeTab === "keywords" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-bold text-base text-slate-900">Anahtar Kelime Frekans & Yoğunluk Tablosu</h3>
                <p className="text-xs text-slate-500">Başlıklar ve ana metin içinde en sık tekrar eden kelimeler</p>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Anahtar Kelime</th>
                      <th className="pb-3 font-semibold text-center">Tekrar Sayısı</th>
                      <th className="pb-3 font-semibold text-center">Yoğunluk (%)</th>
                      <th className="pb-3 font-semibold">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keywordDensity.map((k, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-800">{k.word}</td>
                        <td className="py-3 text-center font-mono font-semibold text-slate-700">{k.count}</td>
                        <td className="py-3 text-center font-mono font-bold text-brand-600">%{k.density}</td>
                        <td className="py-3">
                          {parseFloat(k.density) > 5 ? (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">Aşırı Yoğun</span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">İdeal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: Competitor Comparison */}
          {activeTab === "competitor" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  <BarChart3 className="size-3.5" />
                  Birebir Karşılaştırma & Benchmark
                </div>
                <h3 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">Rakip URL ile Derinlemesine Karşılaştırma</h3>
                <p className="text-xs text-slate-500">Sitenizi rakiplerinizle yan yana koyun, Core Web Vitals, Güvenlik ve SEO metriklerinde kimin önde olduğunu anında görün.</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  placeholder="https://rakip-site.com"
                  value={compUrl}
                  onChange={(e) => setCompUrl(e.target.value)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleCompareCompetitor}
                  disabled={compLoading || !compUrl.trim()}
                  className="rounded-2xl bg-brand-600 px-7 py-3 text-xs font-bold text-white shadow-glow hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {compLoading ? (
                    <>
                      <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Rakip Taranıyor...
                    </>
                  ) : (
                    <>
                      <Zap className="size-3.5" />
                      Karşılaştır
                    </>
                  )}
                </button>
              </div>

              {compError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                  {compError}
                </div>
              )}

              {compResult && (
                <div className="mt-8 space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Your site */}
                    <div className="rounded-2xl border-2 border-brand-500 bg-brand-50/20 p-6 relative">
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800">
                          Sizin Siteniz
                        </span>
                        {result.score >= compResult.score && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                            👑 Önde
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900 truncate">{result.url}</h4>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900">{result.score}</span>
                        <span className="text-xl font-bold text-slate-400">/100 (Not: {result.grade})</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Core Web Vitals:</span>
                          <div className="font-bold text-slate-800">{result.cwv?.overallScore ?? 0}/100 ({result.cwv?.overallRating.toUpperCase()})</div>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Güvenlik Başlıkları:</span>
                          <div className="font-bold text-slate-800">{result.securityHeaders?.score ?? 0}/100 (Not: {result.securityHeaders?.grade})</div>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Yanıt Süresi:</span>
                          <div className="font-bold text-slate-800">{result.metrics.loadTimeMs} ms</div>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Kelime Sayısı:</span>
                          <div className="font-bold text-slate-800">{result.metrics.wordCount} kelime</div>
                        </div>
                      </div>
                    </div>

                    {/* Competitor */}
                    <div className="rounded-2xl border-2 border-purple-400 bg-purple-50/20 p-6 relative">
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800">
                          Rakip Web Sitesi
                        </span>
                        {compResult.score > result.score && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                            👑 Önde
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900 truncate">{compResult.url}</h4>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900">{compResult.score}</span>
                        <span className="text-xl font-bold text-slate-400">/100 (Not: {compResult.grade})</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Core Web Vitals:</span>
                          <div className="font-bold text-slate-800">{compResult.cwv?.overallScore ?? 0}/100 ({compResult.cwv?.overallRating.toUpperCase()})</div>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Güvenlik Başlıkları:</span>
                          <div className="font-bold text-slate-800">{compResult.securityHeaders?.score ?? 0}/100 (Not: {compResult.securityHeaders?.grade})</div>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Yanıt Süresi:</span>
                          <div className="font-bold text-slate-800">{compResult.metrics.loadTimeMs} ms</div>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                          <span className="text-slate-400">Kelime Sayısı:</span>
                          <div className="font-bold text-slate-800">{compResult.metrics.wordCount} kelime</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benchmark Matrix Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                          <th className="p-3.5">Metrik</th>
                          <th className="p-3.5 text-brand-700">Siteniz ({new URL(result.url).hostname})</th>
                          <th className="p-3.5 text-purple-700">Rakip ({new URL(compResult.url).hostname})</th>
                          <th className="p-3.5 text-center">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          {
                            label: "Genel SEO Skoru",
                            valA: `${result.score}/100 (${result.grade})`,
                            valB: `${compResult.score}/100 (${compResult.grade})`,
                            better: result.score >= compResult.score ? "A" : "B",
                          },
                          {
                            label: "Core Web Vitals Skoru",
                            valA: `${result.cwv?.overallScore ?? 0}/100`,
                            valB: `${compResult.cwv?.overallScore ?? 0}/100`,
                            better: (result.cwv?.overallScore ?? 0) >= (compResult.cwv?.overallScore ?? 0) ? "A" : "B",
                          },
                          {
                            label: "LCP (En Büyük Boyama)",
                            valA: `${((result.cwv?.lcp.value ?? 0) / 1000).toFixed(2)} sn`,
                            valB: `${((compResult.cwv?.lcp.value ?? 0) / 1000).toFixed(2)} sn`,
                            better: (result.cwv?.lcp.value ?? 0) <= (compResult.cwv?.lcp.value ?? 0) ? "A" : "B",
                          },
                          {
                            label: "CLS (Sayfa Kayması)",
                            valA: `${result.cwv?.cls.value ?? 0}`,
                            valB: `${compResult.cwv?.cls.value ?? 0}`,
                            better: (result.cwv?.cls.value ?? 0) <= (compResult.cwv?.cls.value ?? 0) ? "A" : "B",
                          },
                          {
                            label: "FID (Giriş Gecikmesi)",
                            valA: `${result.cwv?.fid.value ?? 0} ms`,
                            valB: `${compResult.cwv?.fid.value ?? 0} ms`,
                            better: (result.cwv?.fid.value ?? 0) <= (compResult.cwv?.fid.value ?? 0) ? "A" : "B",
                          },
                          {
                            label: "Güvenlik Başlıkları Skoru",
                            valA: `${result.securityHeaders?.score ?? 0}/100 (${result.securityHeaders?.grade})`,
                            valB: `${compResult.securityHeaders?.score ?? 0}/100 (${compResult.securityHeaders?.grade})`,
                            better: (result.securityHeaders?.score ?? 0) >= (compResult.securityHeaders?.score ?? 0) ? "A" : "B",
                          },
                          {
                            label: "Sunucu Yanıt Süresi",
                            valA: `${result.metrics.loadTimeMs} ms`,
                            valB: `${compResult.metrics.loadTimeMs} ms`,
                            better: result.metrics.loadTimeMs <= compResult.metrics.loadTimeMs ? "A" : "B",
                          },
                          {
                            label: "İçerik Kelime Sayısı",
                            valA: `${result.metrics.wordCount} kelime`,
                            valB: `${compResult.metrics.wordCount} kelime`,
                            better: result.metrics.wordCount >= compResult.metrics.wordCount ? "A" : "B",
                          },
                          {
                            label: "Kritik Teknik Hatalar",
                            valA: `${result.summary.errors} hata`,
                            valB: `${compResult.summary.errors} hata`,
                            better: result.summary.errors <= compResult.summary.errors ? "A" : "B",
                          },
                          {
                            label: "Kırık Bağlantılar",
                            valA: `${result.metrics.links.broken.length} kırık`,
                            valB: `${compResult.metrics.links.broken.length} kırık`,
                            better: result.metrics.links.broken.length <= compResult.metrics.links.broken.length ? "A" : "B",
                          },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3.5 font-bold text-slate-800">{row.label}</td>
                            <td className={`p-3.5 font-mono ${row.better === "A" ? "font-bold text-emerald-700" : "text-slate-600"}`}>
                              {row.valA}
                            </td>
                            <td className={`p-3.5 font-mono ${row.better === "B" ? "font-bold text-purple-700" : "text-slate-600"}`}>
                              {row.valB}
                            </td>
                            <td className="p-3.5 text-center">
                              {row.better === "A" ? (
                                <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Siteniz Önde
                                </span>
                              ) : (
                                <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                                  Rakip Önde
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PDF Export Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white">
                    <div>
                      <h4 className="font-bold text-base">Karşılaştırmalı Beyaz Etiket PDF Raporu Hazır</h4>
                      <p className="mt-1 text-xs text-slate-300">
                        Siteniz ve rakibinizin Core Web Vitals, Güvenlik ve SEO metriklerini içeren resmi benchmark raporunu indirin.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadPdf}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-xs font-bold text-white shadow-glow hover:bg-brand-600 transition"
                    >
                      <Download className="size-4" />
                      Benchmark PDF İndir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* AdSense Placement Area */}
      <div className="container-x my-12">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Sponsorlu Reklam Alanı (Google AdSense 728x90 Leaderboard)
          </span>
          <div className="mx-auto mt-2 flex h-20 max-w-2xl items-center justify-center rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 font-medium text-slate-400 text-sm border border-slate-200/60">
            Hosting & Domain İndirimleri — %60&apos;a Varan Avantajlı Fırsatlar
          </div>
        </div>
      </div>

      <PartnerSection />

      {/* Pricing Table Section */}
      <section id="fiyatlandirma" className="border-t border-slate-200 bg-white py-16">
        <div className="container-x">
          <div className="text-center">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              Esnek Paketler
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900">SEO Başarınızı Hızlandırın</h2>
            <p className="mt-2 text-sm text-slate-600">
              İster bireysel web sitenizi optimize edin, ister ajans müşterilerinize rapor sunun.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-900">
              <h3 className="font-bold">Ücretsiz</h3>
              <p className="mt-1 text-xs text-slate-500">Temel SEO kontrolleri ve anlık skor</p>
              <div className="mt-4 text-3xl font-black">
                0 ₺<span className="text-xs font-normal text-slate-500"> / sonsuza kadar</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Günde 3 URL analizi
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> 0-100 Ağırlıklı SEO Skoru
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> On-Page & Meta etiket kontrolü
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  Kapsamlı PDF Rapor
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  Kırık link derin taraması
                </li>
              </ul>
              <button
                disabled
                className="mt-8 w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-500"
              >
                Mevcut Plan
              </button>
            </div>

            <div className="relative rounded-3xl border-2 border-brand-600 bg-white p-6 shadow-xl ring-4 ring-brand-500/10">
              <span className="absolute -top-3 right-6 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-extrabold uppercase text-white">
                En Popüler
              </span>
              <h3 className="font-bold text-slate-900">Pro</h3>
              <p className="mt-1 text-xs text-slate-500">Büyüyen siteler ve içerik üreticileri için</p>
              <div className="mt-4 text-3xl font-black text-brand-600">
                149 ₺<span className="text-xs font-normal text-slate-500"> / ay</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-brand-600" /> Sınırsız günlük URL analizi
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-brand-600" /> Detaylı PDF SEO Raporu
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-brand-600" /> Kırık link derin tarama
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-brand-600" /> İleri düzey teknik SEO önerileri
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-brand-600" /> Reklamsız arayüz deneyimi
                </li>
              </ul>
              <button
                onClick={() => {
                  setIsPro(true);
                  setProModalOpen(false);
                  if (result) setResult({ ...result, plan: "pro" });
                }}
                className="mt-8 w-full rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-brand-700"
              >
                {isPro ? "Pro Aktif" : "Hemen Pro'ya Geç"}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-900">
              <h3 className="font-bold">Ajans</h3>
              <p className="mt-1 text-xs text-slate-500">Müşterilerine SEO raporu sunan ajanslar</p>
              <div className="mt-4 text-3xl font-black">
                499 ₺<span className="text-xs font-normal text-slate-500"> / ay</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Tüm Pro özellikleri
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Kendi logonuzla PDF rapor (White-Label)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Toplu site tarama
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Öncelikli e-posta & WhatsApp desteği
                </li>
              </ul>
              <button
                onClick={() => setAgencyModalOpen(true)}
                className="mt-8 w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100"
              >
                İletişime Geç & Teklif Al
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Kurumsal / Ajans Teklif Modalı */}
      <AgencyContactModal
        isOpen={agencyModalOpen}
        onClose={() => setAgencyModalOpen(false)}
        defaultUrl={result?.url ?? ""}
        auditScore={result?.score}
        cwvRating={result?.cwv?.overallRating}
        securityScore={result?.securityHeaders?.score}
      />

      {/* Pro Modal */}
      {proModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Sparkles className="size-6" />
              </span>
              <h3 className="mt-4 text-xl font-black text-slate-900">SeoRadar Pro Avantajları</h3>
              <p className="mt-1 text-xs text-slate-500">
                Detaylı PDF indirme, sınırsız analiz ve derinlemesine teknik denetim kilidini açın.
              </p>
            </div>

            <div className="mt-6 space-y-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <div className="flex items-center justify-between font-medium text-slate-700">
                <span>Aylık Pro Abonelik</span>
                <span className="font-bold text-slate-900">149 ₺ / ay</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Günlük Kota</span>
                <span className="font-semibold text-emerald-600">Sınırsız</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>PDF Rapor İndirme</span>
                <span className="font-semibold text-emerald-600">Aktif</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsPro(true);
                  setProModalOpen(false);
                  if (result) setResult({ ...result, plan: "pro" });
                }}
                className="w-full rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-brand-700"
              >
                Demo Olarak Pro&apos;yu Etkinleştir (Ücretsiz)
              </button>
              <button
                onClick={() => setProModalOpen(false)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="container-x flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} SeoRadar. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <a href="#analiz" className="hover:text-slate-900">Analiz</a>
            <a href="#fiyatlandirma" className="hover:text-slate-900">Fiyatlandırma</a>
            <button
              onClick={() => setAgencyModalOpen(true)}
              className="hover:text-slate-900 transition"
            >
              İletişim
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
