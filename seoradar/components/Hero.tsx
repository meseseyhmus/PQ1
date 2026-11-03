"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  FileText,
  Gauge,
  Link2Off,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { isValidUrl, normalizeUrl } from "@/lib/format";

export interface HeroProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string | null;
  disabled?: boolean;
  usage?: { used: number; limit: number };
}

const badges = [
  { icon: Gauge, text: "0–100 Ağırlıklı SEO Skoru" },
  { icon: Link2Off, text: "Kırık Link Tarayıcı" },
  { icon: FileText, text: "PDF Rapor (Pro)" },
  { icon: ShieldCheck, text: "Teknik SEO Kontrolü" },
];

export function Hero({ onSubmit, loading, error, disabled, usage }: HeroProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || loading || disabled) return;
    onSubmit(normalizeUrl(value));
  }

  return (
    <section id="analiz" className="relative overflow-hidden pt-14 pb-10 sm:pt-20">
      {/* dekor */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute right-[-10%] top-24 size-72 rounded-full bg-indigo-400/15 blur-3xl" />
      </div>

      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="badge mx-auto mb-5 w-fit border border-brand-200 bg-brand-50 text-brand-700">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
            </span>
            Tamamen ücretsiz başlayın · Kredi kartı gerekmez
          </div>

          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
            Web sitenizin{" "}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              SEO sağlığını
            </span>{" "}
            30 saniyede öğrenin
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ink-600 sm:text-lg">
            URL&apos;nizi girin; SeoRadar sayfa içi ve teknik SEO kontrollerini,
            görsel &amp; link analizini çalıştırıp size aksiyon alınabilir bir
            rapor hazırlasın.
          </p>
        </div>

        {/* URL formu */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 max-w-2xl animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="card flex flex-col gap-3 p-2.5 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-ink-50 px-3.5">
              <Search className="size-4 shrink-0 text-ink-400" />
              <input
                type="text"
                inputMode="url"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://ornek.com"
                className="w-full bg-transparent py-3 text-sm text-ink-950 placeholder:text-ink-400 focus:outline-none"
                aria-label="Analiz edilecek URL"
                disabled={loading || disabled}
              />
            </div>
            <button
              type="submit"
              disabled={loading || disabled || !value.trim() || !isValidUrl(value)}
              className="btn-primary h-12 shrink-0 px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analiz Ediliyor…
                </>
              ) : (
                <>
                  Ücretsiz Analiz Et
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>

          {/* Hızlı Örnek Siteler */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-ink-500">Örnek sitelerle hemen dene:</span>
            {[
              { label: "trendyol.com", badge: "🛍️ Trendyol", url: "https://trendyol.com" },
              { label: "hepsiburada.com", badge: "🛒 Hepsiburada", url: "https://hepsiburada.com" },
              { label: "github.com", badge: "🐙 GitHub", url: "https://github.com" },
              { label: "example.com", badge: "🌐 RFC Demo", url: "https://example.com" },
            ].map((sample) => (
              <button
                key={sample.url}
                type="button"
                onClick={() => {
                  setValue(sample.url);
                  onSubmit(sample.url);
                }}
                disabled={loading || disabled}
                title={`${sample.label} adresini hemen tara`}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-brand-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-brand-500 hover:bg-brand-50/80 hover:text-brand-700 active:scale-95 disabled:opacity-50"
              >
                <span>{sample.badge}</span>
                <span className="font-mono text-[11px] font-bold text-brand-700">{sample.label}</span>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
            {badges.map((b) => (
              <span key={b.text} className="inline-flex items-center gap-1.5">
                <b.icon className="size-3.5 text-brand-600" />
                {b.text}
              </span>
            ))}
          </div>

          {usage && (
            <p className="mt-3 text-center text-xs text-ink-500">
              Bugün kullanılan ücretsiz analiz:{" "}
              <strong className="text-ink-800">
                {usage.used}/{usage.limit}
              </strong>
              {usage.used >= usage.limit && (
                <span className="ml-2 font-semibold text-rose-600">
                  Limit doldu — Pro&apos;ya yükseltin
                </span>
              )}
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}