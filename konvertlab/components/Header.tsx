"use client";

import { FileDigit } from "lucide-react";

interface HeaderProps {
  onOpenPricing: () => void;
}

export default function Header({ onOpenPricing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
            <FileDigit className="h-5 w-5 text-slate-950" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            Konvert<span className="text-cyan-400">Lab</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex" aria-label="Ana menü">
          <a href="#donusturucu" className="transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded">
            Dönüştürücü
          </a>
          <a href="#nasil-calisir" className="transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded">
            Nasıl Çalışır?
          </a>
        </nav>

        <button
          type="button"
          onClick={onOpenPricing}
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Pro Üyelik
        </button>
      </div>
    </header>
  );
}
