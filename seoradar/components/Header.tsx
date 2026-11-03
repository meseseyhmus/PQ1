"use client";

import { useState } from "react";
import { Menu, Radar, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "#analiz", label: "Analiz" },
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#fiyatlandirma", label: "Fiyatlandırma" },
];

export function Header({ onUpgrade }: { onUpgrade?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#analiz" className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
            <Radar className="size-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-extrabold tracking-tight text-ink-950">
              Seo<span className="text-brand-600">Radar</span>
            </span>
            <span className="micro-label mt-0.5">SEO Analiz Platformu</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 hover:text-ink-950"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={onUpgrade}
            className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-900"
          >
            <Sparkles className="size-4 text-amber-300" />
            Pro&apos;ya Yükselt
          </button>
        </nav>

        <button
          className="grid size-10 place-items-center rounded-xl border border-ink-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-ink-200/70 bg-white transition-[max-height] duration-300 md:hidden",
          open ? "max-h-64" : "max-h-0"
        )}
      >
        <div className="container-x flex flex-col gap-1 py-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onUpgrade?.();
            }}
            className="btn-dark mt-1"
          >
            <Sparkles className="size-4" />
            Pro&apos;ya Yükselt
          </button>
        </div>
      </div>
    </header>
  );
}