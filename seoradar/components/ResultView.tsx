"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Info,
  Lock,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { AnalysisResult, PageMetrics } from "@/types";
import { formatBytes, formatDuration, formatNumberTR } from "@/lib/format";
import { ScoreRing } from "@/components/ScoreRing";
import { SummaryStats } from "@/components/SummaryStats";
import { CheckAccordion } from "@/components/CheckAccordion";
import { AdBanner } from "@/components/AdBanner";

export interface ResultViewProps {
  result: AnalysisResult;
  onUpgrade: () => void;
  onNewAnalysis: () => void;
  onDownloadPdf: () => void;
}

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Info;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="size-4.5" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-ink-950">{title}</h2>
      </div>
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

function TechTable({ metrics }: { metrics: PageMetrics }) {
  const rows: { label: string; value: string; ok?: boolean }[] = [
    {
      label: "Protokol",
      value: metrics.technical.isHttps ? "HTTPS" : "HTTP",
      ok: metrics.technical.isHttps,
    },
    { label: "Title", value: `${metrics.titleLength} karakter`, ok: metrics.titleLength >= 30 && metrics.titleLength <= 60 },
    {
      label: "Meta description",
      value: `${metrics.metaDescriptionLength} karakter`,
      ok: metrics.metaDescriptionLength >= 70 && metrics.metaDescriptionLength <= 160,
    },
    { label: "Canonical", value: metrics.canonical ?? "Yok", ok: !!metrics.canonical },
    { label: "html lang", value: metrics.lang ?? "Yok", ok: !!metrics.lang },
    { label: "Viewport", value: metrics.viewport ? "Tanımlı" : "Yok", ok: !!metrics.viewport },
    { label: "robots.txt", value: metrics.technical.hasRobotsTxt ? "Mevcut" : "Eksik", ok: metrics.technical.hasRobotsTxt },
    { label: "sitemap.xml", value: metrics.technical.hasSitemapXml ? "Mevcut" : "Eksik", ok: metrics.technical.hasSitemapXml },
    { label: "Favicon", value: metrics.technical.hasFavicon ? "Var" : "Yok", ok: metrics.technical.hasFavicon },
    { label: "Open Graph", value: metrics.technical.hasOpenGraph ? `${metrics.technical.openGraphKeys.length} etiket` : "Yok", ok: metrics.technical.hasOpenGraph },
    { label: "Twitter Card", value: metrics.technical.hasTwitterCard ? "Var" : "Yok", ok: metrics.technical.hasTwitterCard },
    {
      label: "Yapısal veri",
      value: metrics.technical.hasStructuredData
        ? metrics.technical.structuredDataTypes.join(", ")
        : "Yok",
      ok: metrics.technical.hasStructuredData,
    },
    { label: "Script", value: `${metrics.technical.scriptCount} adet` },
    { label: "Stil dosyası", value: `${metrics.technical.stylesheetCount} adet` },
    { label: "HTML boyutu", value: formatBytes(metrics.htmlSizeBytes) },
    { label: "Yanıt süresi", value: formatDuration(metrics.loadTimeMs) },
    { label: "Kelime sayısı", value: formatNumberTR(metrics.wordCount) },
    { label: "Metin/HTML oranı", value: `%${metrics.textToHtmlRatio}` },
    {
      label: "Görseller",
      value: `${metrics.images.total} (eksik alt: ${metrics.images.missingAlt})`,
      ok: metrics.images.missingAlt === 0,
    },
    {
      label: "Linkler",
      value: `iç ${metrics.links.internal} · dış ${metrics.links.external} · nofollow ${metrics.links.noFollow}`,
    },
    {
      label: "Kırık link",
      value: `${metrics.links.broken.length} / ${metrics.links.checked} kontrol`,
      ok: metrics.links.broken.length === 0,
    },
    { label: "hreflang", value: metrics.technical.hasHreflang ? "Var" : "Yok" },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-ink-50/95 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Ölçüm</th>
              <th className="px-4 py-2.5 font-semibold">Değer</th>
              <th className="w-24 px-4 py-2.5 font-semibold">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((r) => (
              <tr key={r.label} className="bg-white hover:bg-ink-50/60">
                <td className="px-4 py-2.5 font-medium text-ink-700">{r.label}</td>
                <td className="max-w-[280px] truncate px-4 py-2.5 text-ink-600" title={r.value}>
                  {r.value}
                </td>
                <td className="px-4 py-2.5">
                  {r.ok === undefined ? (
                    <span className="text-xs text-ink-400">—</span>
                  ) : r.ok ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="size-3.5" /> İyi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                      <TriangleAlert className="size-3.5" /> Dikkat
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeadingTree({ metrics }: { metrics: PageMetrics }) {
  const entries = [
    ...metrics.headings.h1.map((t) => ({ level: 1, text: t })),
    ...metrics.headings.h2.map((t) => ({ level: 2, text: t })),
    ...metrics.headings.h3.map((t) => ({ level: 3, text: t })),
  ].slice(0, 40);

  if (entries.length === 0) {
    return (
      <div className="card p-6 text-sm text-ink-500">
        Sayfada analiz edilecek başlık etiketi bulunamadı.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <ul className="space-y-1.5">
        {entries.map((e, i) => (
          <li
            key={`${e.level}-${i}`}
            className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-ink-50"
          >
            <span
              className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                e.level === 1
                  ? "bg-brand-100 text-brand-700"
                  : e.level === 2
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-ink-100 text-ink-600"
              }`}
            >
              H{e.level}
            </span>
            <span className="text-sm text-ink-700">{e.text || "(boş başlık)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrokenLinks({ metrics }: { metrics: PageMetrics }) {
  if (metrics.links.broken.length === 0) {
    return (
      <div className="card flex items-center gap-3 border-emerald-200 bg-emerald-50/60 p-5">
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
        <p className="text-sm text-emerald-800">
          {metrics.links.checked > 0
            ? `${metrics.links.checked} bağlantı kontrol edildi, kırık bağlantı bulunamadı.`
            : "Kontrol edilecek bağlantı bulunamadı."}
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-rose-100 bg-rose-50 px-5 py-3.5">
        <ShieldAlert className="size-5 text-rose-600" />
        <p className="text-sm font-semibold text-rose-800">
          {metrics.links.broken.length} bağlantı yanıt vermiyor
        </p>
      </div>
      <ul className="max-h-72 divide-y divide-ink-100 overflow-y-auto">
        {metrics.links.broken.map((b) => (
          <li key={b.href} className="flex items-center gap-3 px-5 py-2.5">
            <span
              className={`inline-flex min-w-14 justify-center rounded-md px-2 py-1 text-xs font-bold ${
                b.status && b.status >= 400
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {b.status ?? "HATA"}
            </span>
            <span className="truncate text-sm text-ink-600" title={b.href}>
              {b.href}
            </span>
            <a
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 text-ink-400 hover:text-brand-600"
              aria-label="Bağlantıyı yeni sekmede aç"
            >
              <ExternalLink className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResultView({
  result,
  onUpgrade,
  onNewAnalysis,
  onDownloadPdf,
}: ResultViewProps) {
  const locked = result.plan === "free";
  const host = (() => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return result.url;
    }
  })();

  return (
    <section className="container-x pb-16 pt-6">
      {/* Üst şerit */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="micro-label">Analiz tamamlandı</p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink-950">
            {host}
          </h1>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-brand-600"
          >
            {result.url}
            <ExternalLink className="size-3" />
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onNewAnalysis} className="btn-ghost">
            <ArrowLeft className="size-4" />
            Yeni Analiz
          </button>
          <button onClick={onDownloadPdf} className="btn-primary">
            {locked ? (
              <>
                <Lock className="size-4" />
                PDF İndir (Pro)
              </>
            ) : (
              <>
                <Download className="size-4" />
                PDF Raporu İndir
              </>
            )}
          </button>
          {locked && (
            <button onClick={onUpgrade} className="btn-dark">
              <Sparkles className="size-4 text-amber-300" />
              Pro&apos;ya Yükselt
            </button>
          )}
        </div>
      </div>

      {/* Skor kartı */}
      <div className="card mb-6 overflow-hidden">
        <div className="grid gap-8 p-8 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex justify-center">
            <ScoreRing score={result.score} grade={result.grade} />
          </div>
          <div className="space-y-4">
            <div>
              <p className="micro-label">Genel SEO Skoru</p>
              <h2 className="mt-1 text-2xl font-bold text-ink-950">
                {result.score >= 80
                  ? "Harika! Sayfanız arama motorlarına çok iyi durumda."
                  : result.score >= 55
                    ? "Fena değil — ama hızla kazanabileceğiniz puanlar var."
                    : "Kritik iyileştirmeler gerekiyor."}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
                {result.summary.errors > 0
                  ? `${result.summary.errors} kritik hata ve ${result.summary.warnings} uyarı tespit edildi. Aşağıdaki "Nasıl Çözülür?" önerileriyle her birini giderebilirsiniz.`
                  : `${result.summary.warnings} uyarı bulunuyor. Küçük dokunuşlarla skorunuzu daha da yukarı taşıyabilirsiniz.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                {result.summary.passed} başarılı
              </span>
              <span className="badge border border-amber-200 bg-amber-50 text-amber-700">
                <TriangleAlert className="size-3.5" />
                {result.summary.warnings} uyarı
              </span>
              <span className="badge border border-rose-200 bg-rose-50 text-rose-700">
                <ShieldAlert className="size-3.5" />
                {result.summary.errors} hata
              </span>
              <span className="badge border border-ink-200 bg-ink-50 text-ink-600">
                <Info className="size-3.5" />
                {result.summary.total} kontrol
              </span>
            </div>

            <p className="text-xs text-ink-400">
              Tarama zamanı:{" "}
              {new Date(result.metrics.fetchedAt).toLocaleString("tr-TR")} · Yanıt:{" "}
              {formatDuration(result.metrics.loadTimeMs)} · Kullanım:{" "}
              {result.dailyUsage.used}/{result.dailyUsage.limit}
              {locked ? " (ücretsiz plan)" : " (pro plan)"}
            </p>
          </div>
        </div>
      </div>

      {/* Özet istatistikler */}
      <SummaryStats summary={result.summary} metrics={result.metrics} />

      {/* Reklam + kontroller */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <SectionTitle
            icon={FileText}
            title="Detaylı Kontroller"
            hint="Renk kodlu sonuçlar · genişletmek için tıklayın"
          />
          <CheckAccordion checks={result.checks} locked={locked} />
        </div>

        <aside className="space-y-4">
          <AdBanner slot="result-sidebar" variant="sidebar" />
          {locked && (
            <div className="card overflow-hidden border-brand-200 bg-gradient-to-b from-brand-50 to-white p-5">
              <div className="mb-2 grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
                <Sparkles className="size-5" />
              </div>
              <h3 className="text-base font-bold text-ink-950">Pro analizleri açın</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                {[
                  "Sınırsız analiz",
                  "Filigransız PDF rapor",
                  "Derin kırık link taraması",
                  "Rakip & anahtar kelime analizi",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
              <button onClick={onUpgrade} className="btn-primary mt-4 w-full">
                Hemen Yükselt
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Teknik tablo */}
      <div className="mt-10">
        <SectionTitle icon={Info} title="Teknik Ölçümler" hint="Ham veriler" />
        <TechTable metrics={result.metrics} />
      </div>

      {/* Başlık ağacı */}
      <div className="mt-10">
        <SectionTitle icon={FileText} title="Başlık Yapısı (H1–H3)" />
        <HeadingTree metrics={result.metrics} />
      </div>

      {/* Kırık linkler */}
      <div className="mt-10">
        <SectionTitle icon={ShieldAlert} title="Kırık Bağlantılar" />
        <BrokenLinks metrics={result.metrics} />
      </div>

      {/* Alt reklam */}
      <div className="mt-10">
        <AdBanner slot="result-bottom" variant="leaderboard" />
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-ink-200 bg-ink-950 p-8 text-white sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold">
            Analizi ekip arkadaşlarınızla paylaşın
          </h3>
          <p className="mt-1.5 max-w-xl text-sm text-ink-300">
            White-label PDF raporu, marka logonuzla üretebilir, müşterilerinize
            gönderebilirsiniz. Pro planda filigran kaldırılır.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button onClick={onDownloadPdf} className="btn-primary">
            <Download className="size-4" />
            PDF Raporu
          </button>
          <button onClick={onNewAnalysis} className="btn border border-white/15 bg-white/10 text-white hover:bg-white/15">
            <RefreshCw className="size-4" />
            Yeni Analiz
          </button>
        </div>
      </div>
    </section>
  );
}