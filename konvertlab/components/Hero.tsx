"use client";

import { ArrowDown, ShieldCheck, Zap, Languages } from "lucide-react";

interface HeroProps {
  onCta: () => void;
}

const BADGES = [
  { icon: ShieldCheck, label: "100% İstemci Taraflı — Sıfır Sunucu İletimi" },
  { icon: Zap, label: "1-Tık Örnek Dosya ile Anında Test" },
  { icon: Languages, label: "Tam Türkçe OCR & Karakter Desteği" },
];

export default function Hero({ onCta }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(34,211,238,0.12),transparent)]"
      />
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-20">
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
          Dokümanlarınızı <span className="text-cyan-400">saniyeler içinde</span> dönüştürün
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
          PDF, Word (DOCX), Excel (XLSX), Görseller, WebP ve Tesseract OCR ile tam kapsamlı dönüştürme.
          Tüm işlemler tarayıcınızda gerçekleşir — hiçbir dosya sunucuya yüklenmez.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {BADGES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300"
            >
              <Icon className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onCta}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Dönüştürücüye Başla
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
