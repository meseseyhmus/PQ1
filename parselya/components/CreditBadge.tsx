"use client";

import { Coins, Zap } from "lucide-react";
import { useEditor } from "@/state/EditorContext";
import { cn } from "@/lib/cn";

export function CreditBadge({ onUpgrade }: { onUpgrade: () => void }) {
  const { state } = useEditor();
  const low = state.credits <= 1;
  return (
    <button
      onClick={onUpgrade}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60",
        low
          ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
          : "border-white/10 bg-chrome-800 text-white/70 hover:bg-chrome-700",
      )}
      aria-label={`Kalan kredi: ${state.credits}. Paket yükseltmek için tıklayın.`}
    >
      {low ? (
        <Zap className="h-3.5 w-3.5" />
      ) : (
        <Coins className="h-3.5 w-3.5 text-neon-bright" />
      )}
      <span className="font-medium">
        {state.credits} Kredi Kaldı
      </span>
      <span className={cn("font-semibold", low ? "text-amber-300" : "text-neon-bright")}>
        — Paket Yükselt
      </span>
    </button>
  );
}
