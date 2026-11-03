"use client";

import { useMemo } from "react";
import { Zap, HelpCircle, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, TrendingUp, Cpu, Layout, Activity } from "lucide-react";
import type { CoreWebVitals, CwvRating } from "@/types";

interface CoreWebVitalsCardsProps {
  cwv: CoreWebVitals;
  scriptCount?: number;
}

interface ThresholdInfo {
  goodMax: number;
  warnMax: number;
  goodLabel: string;
  warnLabel: string;
  poorLabel: string;
  unit: string;
  formatVal: (val: number) => string;
}

const THRESHOLDS: Record<"lcp" | "cls" | "fid" | "inp", ThresholdInfo> = {
  lcp: {
    goodMax: 2500,
    warnMax: 4000,
    goodLabel: "≤ 2.5 sn",
    warnLabel: "2.5 - 4.0 sn",
    poorLabel: "> 4.0 sn",
    unit: "saniye",
    formatVal: (v) => `${(v / 1000).toFixed(2)} sn`,
  },
  cls: {
    goodMax: 0.1,
    warnMax: 0.25,
    goodLabel: "≤ 0.10",
    warnLabel: "0.10 - 0.25",
    poorLabel: "> 0.25",
    unit: "kayma skoru",
    formatVal: (v) => v.toFixed(3),
  },
  fid: {
    goodMax: 100,
    warnMax: 300,
    goodLabel: "≤ 100 ms",
    warnLabel: "100 - 300 ms",
    poorLabel: "> 300 ms",
    unit: "milisaniye",
    formatVal: (v) => `${v} ms`,
  },
  inp: {
    goodMax: 200,
    warnMax: 500,
    goodLabel: "≤ 200 ms",
    warnLabel: "200 - 500 ms",
    poorLabel: "> 500 ms",
    unit: "milisaniye",
    formatVal: (v) => `${v} ms`,
  },
};

function getScoreColor(rating: CwvRating) {
  switch (rating) {
    case "good":
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        stroke: "#0cce6b",
        badgeBg: "bg-emerald-100 text-emerald-800",
        label: "İyi",
        icon: CheckCircle2,
      };
    case "needs-improvement":
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        stroke: "#ffa400",
        badgeBg: "bg-amber-100 text-amber-800",
        label: "Geliştirilmeli",
        icon: AlertTriangle,
      };
    case "poor":
    default:
      return {
        text: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-200",
        stroke: "#ff4e42",
        badgeBg: "bg-rose-100 text-rose-800",
        label: "Zayıf",
        icon: AlertCircle,
      };
  }
}

/**
 * Google PageSpeed tarzı dairesel skor göstergesi SVG
 */
function RadialGauge({
  score,
  rating,
  size = 72,
}: {
  score: number;
  rating: CwvRating;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  const color = getScoreColor(rating);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-base font-black ${color.text}`}>{clampedScore}</span>
      </div>
    </div>
  );
}

/**
 * Google PageSpeed tarzı 3-kademeli eşik çubuğu (İyi / Geliştirilmeli / Zayıf)
 */
function ThresholdBar({
  value,
  metricKey,
}: {
  value: number;
  metricKey: "lcp" | "cls" | "fid" | "inp";
}) {
  const t = THRESHOLDS[metricKey];

  // Cursor pozisyonunu 0-100% aralığında hesapla
  let percent = 0;
  if (value <= t.goodMax) {
    percent = (value / t.goodMax) * 33.3;
  } else if (value <= t.warnMax) {
    percent = 33.3 + ((value - t.goodMax) / (t.warnMax - t.goodMax)) * 33.3;
  } else {
    const extra = Math.min(1, (value - t.warnMax) / (t.warnMax * 1.5));
    percent = 66.6 + extra * 33.3;
  }
  percent = Math.max(2, Math.min(98, percent));

  return (
    <div className="mt-3">
      {/* Çubuk */}
      <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
        <div className="h-full w-1/3 bg-emerald-500" title="İyi" />
        <div className="h-full w-1/3 bg-amber-400" title="Geliştirilmeli" />
        <div className="h-full w-1/3 bg-rose-500" title="Zayıf" />
      </div>

      {/* Pin / Gösterge imleci */}
      <div className="relative w-full h-3">
        <div
          className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
          style={{ left: `${percent}%` }}
        >
          <div className="size-2.5 rotate-45 bg-slate-900 shadow-sm" />
        </div>
      </div>

      {/* Eşik Etiketleri */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-0.5">
        <span className="text-emerald-700">{t.goodLabel}</span>
        <span className="text-amber-700">{t.warnLabel}</span>
        <span className="text-rose-700">{t.poorLabel}</span>
      </div>
    </div>
  );
}

export function CoreWebVitalsCards({ cwv, scriptCount }: CoreWebVitalsCardsProps) {
  const overallColor = getScoreColor(cwv.overallRating);

  return (
    <div className="mt-6 space-y-6">
      {/* CWV Genel Bakış & Google Lighthouse Skoru Banner'ı */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <Zap className="size-3.5 text-brand-600" />
              Google PageSpeed &amp; Core Web Vitals 2024+
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
              Gerçek Kullanıcı Deneyimi &amp; Hız Metrikleri
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Google arama sıralamasında doğrudan sıralama sinyali olarak kabul edilen Core Web Vitals (CWV)
              metrikleri; sayfa yükleme hızı (LCP), görsel kararlılık (CLS) ve kullanıcı etkileşim tepkisi (FID &amp; INP)
              algoritmik olarak denetlenmiştir.
            </p>
          </div>

          {/* Overall Score Dial */}
          <div className="flex items-center gap-5 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 shrink-0">
            <RadialGauge score={cwv.overallScore} rating={cwv.overallRating} size={84} />
            <div>
              <div className="text-xs font-semibold text-slate-500">CWV Genel Puanı</div>
              <div className="text-2xl font-black text-slate-900">
                {cwv.overallScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
              <span className={`inline-block mt-1 rounded-lg px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${overallColor.badgeBg}`}>
                {overallColor.label}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid: LCP, CLS, FID, INP */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* 1. LCP CARD */}
          {(() => {
            const color = getScoreColor(cwv.lcp.rating);
            const Icon = color.icon;
            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Activity className="size-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Largest Contentful Paint</h4>
                        <span className="font-mono text-[11px] text-slate-400">LCP</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${color.badgeBg}`}>
                      <Icon className="size-3" />
                      {color.label}
                    </span>
                  </div>

                  {/* Value and Gauge */}
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">
                          {(cwv.lcp.value / 1000).toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">saniye</span>
                      </div>
                      <span className="font-mono text-xs text-slate-400">({cwv.lcp.value} milisaniye)</span>
                    </div>
                    <RadialGauge score={cwv.lcp.score} rating={cwv.lcp.rating} size={64} />
                  </div>

                  {/* Threshold Bar */}
                  <ThresholdBar value={cwv.lcp.value} metricKey="lcp" />

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-medium">
                    {cwv.lcp.description}
                  </p>

                  {/* Diagnostic Detail Box */}
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">En Büyük İçerik Öğesi:</span>{" "}
                    <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono text-brand-700 border border-slate-200">
                      {cwv.lcp.element}
                    </code>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    Optimizasyon Tavsiyesi:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {cwv.lcp.recommendation}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 2. CLS CARD */}
          {(() => {
            const color = getScoreColor(cwv.cls.rating);
            const Icon = color.icon;
            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <Layout className="size-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Cumulative Layout Shift</h4>
                        <span className="font-mono text-[11px] text-slate-400">CLS</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${color.badgeBg}`}>
                      <Icon className="size-3" />
                      {color.label}
                    </span>
                  </div>

                  {/* Value and Gauge */}
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">
                          {cwv.cls.value}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">kayma skoru</span>
                      </div>
                      <span className="text-xs text-slate-400">Görsel kararlılık puanı</span>
                    </div>
                    <RadialGauge score={cwv.cls.score} rating={cwv.cls.rating} size={64} />
                  </div>

                  {/* Threshold Bar */}
                  <ThresholdBar value={cwv.cls.value} metricKey="cls" />

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-medium">
                    {cwv.cls.description}
                  </p>

                  {/* Diagnostic Detail Box */}
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Boyutsuz Görseller:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {cwv.cls.unconstrainedImages} adet görselde width/height niteliği eksik
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    Optimizasyon Tavsiyesi:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {cwv.cls.recommendation}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 3. FID CARD */}
          {(() => {
            const color = getScoreColor(cwv.fid.rating);
            const Icon = color.icon;
            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Cpu className="size-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">First Input Delay</h4>
                        <span className="font-mono text-[11px] text-slate-400">FID</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${color.badgeBg}`}>
                      <Icon className="size-3" />
                      {color.label}
                    </span>
                  </div>

                  {/* Value and Gauge */}
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">
                          {cwv.fid.value}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">milisaniye</span>
                      </div>
                      <span className="text-xs text-slate-400">İlk etkileşim yanıt gecikmesi</span>
                    </div>
                    <RadialGauge score={cwv.fid.score} rating={cwv.fid.rating} size={64} />
                  </div>

                  {/* Threshold Bar */}
                  <ThresholdBar value={cwv.fid.value} metricKey="fid" />

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-medium">
                    {cwv.fid.description}
                  </p>

                  {/* Diagnostic Detail Box */}
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Ana İş Parçacığı Yükü:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {typeof scriptCount === "number" ? `${scriptCount} script etiketi ayrıştırıldı` : "JavaScript kod blokları taranıyor"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    Optimizasyon Tavsiyesi:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {cwv.fid.recommendation}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 4. INP CARD */}
          {(() => {
            const color = getScoreColor(cwv.inp.rating);
            const Icon = color.icon;
            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <TrendingUp className="size-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Interaction to Next Paint</h4>
                        <span className="font-mono text-[11px] text-slate-400">INP (Google 2024+)</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${color.badgeBg}`}>
                      <Icon className="size-3" />
                      {color.label}
                    </span>
                  </div>

                  {/* Value and Gauge */}
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">
                          {cwv.inp.value}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">milisaniye</span>
                      </div>
                      <span className="text-xs text-slate-400">Tüm sayfa ömrü boyunca etkileşim</span>
                    </div>
                    <RadialGauge score={cwv.inp.score} rating={cwv.inp.rating} size={64} />
                  </div>

                  {/* Threshold Bar */}
                  <ThresholdBar value={cwv.inp.value} metricKey="inp" />

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-medium">
                    {cwv.inp.description}
                  </p>

                  {/* Diagnostic Detail Box */}
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Yeni Nesil Metrik:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      Mart 2024 itibarıyla resmi Core Web Vitals metriği
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    Optimizasyon Tavsiyesi:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {cwv.inp.recommendation}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
