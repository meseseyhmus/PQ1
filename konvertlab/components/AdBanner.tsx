import { Megaphone } from "lucide-react";
import { cn } from "@/lib/cn";

interface AdBannerProps {
  slot: "left" | "right" | "bottom";
  className?: string;
}

const SLOT_INFO: Record<AdBannerProps["slot"], { size: string; note: string }> = {
  left: { size: "300×600", note: "Yarım sayfa" },
  right: { size: "300×250", note: "Orta dikdörtgen" },
  bottom: { size: "728×90", note: "Leaderboard" },
}

/**
 * Visual placeholder for a Google AdSense unit. No real ad code is injected —
 * replace the inner content with the AdSense <ins> snippet when going live.
 */
export default function AdBanner({ slot, className }: AdBannerProps) {
  const info = SLOT_INFO[slot];
  const isBottom = slot === "bottom";

  return (
    <div
      aria-label={`Reklam alanı (${info.size})`}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 text-slate-500",
        isBottom ? "min-h-[100px] px-4 py-6" : "min-h-[250px] w-full p-4",
        className
      )}
    >
      <Megaphone className="h-6 w-6 text-slate-600" aria-hidden="true" />
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider">Reklam Alanı</p>
        <p className="text-[11px] text-slate-600">Google AdSense — {info.size}</p>
        <p className="text-[10px] text-slate-700">{info.note}</p>
      </div>
    </div>
  );
}
