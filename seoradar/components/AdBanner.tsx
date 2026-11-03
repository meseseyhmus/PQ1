"use client";

import { Megaphone } from "lucide-react";

export interface AdBannerProps {
  /** Reklam biriminin konumu (AdSense benzeri slot anahtarı) */
  slot: string;
  variant?: "sidebar" | "leaderboard";
}

/**
 * Yer tutucu reklam birimi. Gerçek bir reklam ağı (ör. AdSense)
 * bağlanana kadar nötr bir yer tutucu gösterir.
 */
export function AdBanner({ slot, variant = "leaderboard" }: AdBannerProps) {
  const isSidebar = variant === "sidebar";

  return (
    <div
      data-ad-slot={slot}
      className={`card flex flex-col items-center justify-center gap-2 border-dashed text-center ${
        isSidebar ? "min-h-[250px] p-5" : "min-h-[90px] p-6"
      }`}
      role="complementary"
      aria-label="Reklam alanı"
    >
      <Megaphone className="size-5 text-ink-300" />
      <p className="text-xs font-medium text-ink-400">Reklam alanı</p>
    </div>
  );
}
