"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Gauge,
  ListChecks,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { AnalysisResult, PageMetrics } from "@/types";
import { formatDuration, formatNumberTR } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface SummaryStatsProps {
  summary: AnalysisResult["summary"];
  metrics: PageMetrics;
}

interface Tile {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  iconColor: string;
}

export function SummaryStats({ summary, metrics }: SummaryStatsProps) {
  const tiles: Tile[] = [
    {
      label: "Kritik Hatalar",
      value: formatNumberTR(summary.errors),
      icon: XCircle,
      accent: "border-l-rose-500",
      iconColor: "text-rose-600",
    },
    {
      label: "Uyarılar",
      value: formatNumberTR(summary.warnings),
      icon: AlertTriangle,
      accent: "border-l-amber-500",
      iconColor: "text-amber-600",
    },
    {
      label: "Başarılı Testler",
      value: formatNumberTR(summary.passed),
      icon: CheckCircle2,
      accent: "border-l-emerald-500",
      iconColor: "text-emerald-600",
    },
    {
      label: "Toplam Kontrol",
      value: formatNumberTR(summary.total),
      icon: ListChecks,
      accent: "border-l-brand-500",
      iconColor: "text-brand-600",
    },
    {
      label: "Sayfa Yükleme",
      value: formatDuration(metrics.loadTimeMs),
      icon: Gauge,
      accent: "border-l-indigo-500",
      iconColor: "text-indigo-600",
    },
    {
      label: "Kelime Sayısı",
      value: formatNumberTR(metrics.wordCount),
      icon: FileText,
      accent: "border-l-ink-500",
      iconColor: "text-ink-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => (
        <div key={t.label} className={cn("card border-l-4 p-4", t.accent)}>
          <div className="flex items-center justify-between gap-2">
            <span className="micro-label">{t.label}</span>
            <t.icon className={cn("size-4 shrink-0", t.iconColor)} aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums tracking-tight text-ink-950">
            {t.value}
          </p>
        </div>
      ))}
    </div>
  );
}
