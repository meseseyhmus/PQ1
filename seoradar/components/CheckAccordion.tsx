"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Info,
  Lock,
  ShieldAlert,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import type { CheckItem, Severity } from "@/types";

export interface CheckAccordionProps {
  checks: CheckItem[];
  locked?: boolean;
}

const severityStyles: Record<
  Severity,
  { icon: typeof Info; badge: string; ring: string; label: string }
> = {
  success: {
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-700",
    ring: "border-emerald-200",
    label: "Başarılı",
  },
  warning: {
    icon: TriangleAlert,
    badge: "bg-amber-100 text-amber-800",
    ring: "border-amber-200",
    label: "Uyarı",
  },
  error: {
    icon: ShieldAlert,
    badge: "bg-rose-100 text-rose-700",
    ring: "border-rose-200",
    label: "Hata",
  },
  info: {
    icon: Info,
    badge: "bg-ink-100 text-ink-600",
    ring: "border-ink-200",
    label: "Bilgi",
  },
};

const categoryLabels: Record<CheckItem["category"], string> = {
  onpage: "On-Page",
  technical: "Teknik",
  content: "İçerik",
  links: "Bağlantılar",
};

export function CheckAccordion({ checks, locked = false }: CheckAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(
    checks.find((c) => c.severity === "error")?.id ?? null,
  );

  return (
    <div className="space-y-2.5">
      {checks.map((check) => {
        const style = severityStyles[check.severity];
        const Icon = style.icon;
        const open = openId === check.id;

        return (
          <div
            key={check.id}
            className={`card overflow-hidden transition-shadow ${style.ring} ${
              open ? "shadow-md" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : check.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-ink-50/60"
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-lg ${style.badge}`}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink-950">
                  {check.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-500">
                  {check.summary}
                  {check.value ? ` · ${check.value}` : ""}
                </span>
              </span>
              <span className="hidden shrink-0 rounded-md bg-ink-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-500 sm:inline-block">
                {categoryLabels[check.category]}
              </span>
              <ChevronDown
                className={`size-4 shrink-0 text-ink-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
              <div className="border-t border-ink-100 px-5 py-4">
                {check.howToFix.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-500">
                      <Wrench className="size-3.5" />
                      Nasıl Çözülür?
                    </p>
                    <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-700">
                      {check.howToFix.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {check.proDetail && (
                  <div
                    className={`relative overflow-hidden rounded-xl border border-ink-200 bg-ink-50 p-4 ${
                      locked ? "select-none" : ""
                    }`}
                  >
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-600">
                      <Lock className="size-3.5" />
                      Pro Detayı
                    </p>
                    <p
                      className={`text-sm leading-relaxed text-ink-700 ${
                        locked
                          ? "blur-[5px]"
                          : ""
                      }`}
                      aria-hidden={locked}
                    >
                      {check.proDetail}
                    </p>
                    {locked && (
                      <p className="mt-2 text-center text-xs font-semibold text-brand-600">
                        Bu detayı görmek için Pro plana yükseltin.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
