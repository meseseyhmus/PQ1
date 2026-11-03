"use client";

import { useEffect, useRef } from "react";
import { Check, X, Crown, Sparkles } from "lucide-react";

interface PricingModalProps {
  onClose: () => void;
}

const FREE_FEATURES = [
  { text: "Günde 5 dönüşüm", included: true },
  { text: "Aynı anda tek dosya", included: true },
  { text: "Filigranlı PDF çıktısı", included: true },
  { text: "Reklamlı deneyim", included: true },
  { text: "Toplu dönüşüm (50 dosyaya kadar)", included: false },
  { text: "Reklamsız deneyim", included: false },
  { text: "Öncelikli işlem kuyruğu", included: false },
  { text: "Filigransız PDF çıktısı", included: false },
];

export default function PricingModal({ onClose }: PricingModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    // Move focus into the dialog for keyboard users.
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pro üyelik seçenekleri"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:p-8"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
            <Crown className="h-6 w-6 text-slate-950" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Pro Üyelik</h2>
          <p className="mt-1 text-sm text-slate-400">
            Toplu Dönüştürme (50 Dosyaya Kadar) ve Reklamsız Deneyim
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Sparkles className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Ücretsiz
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-100">₺0</p>
            <p className="text-xs text-slate-500">sonsuza kadar</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {FREE_FEATURES.slice(0, 4).map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-slate-400">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl border-2 border-cyan-500 bg-gradient-to-b from-cyan-500/10 to-transparent p-5">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-xs font-bold text-slate-950">
              Önerilen
            </span>
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
              <Crown className="h-4 w-4" aria-hidden="true" />
              Pro
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-100">
              ₺149<span className="text-sm font-normal text-slate-400">/ay</span>
            </p>
            <p className="text-xs text-slate-500">veya ₺1.490/yıl (2 ay bedava)</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f.text}
                  className={`flex items-start gap-2 ${f.included ? "text-slate-300" : "text-slate-200"}`}
                >
                  {f.included ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Vazgeç
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Pro&apos;ya Geç — ₺149/ay
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-600">
          Yıllık plan: ₺1.490/yıl. İstediğiniz zaman iptal edebilirsiniz.
        </p>
      </div>
    </div>
  );
}
