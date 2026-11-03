"use client";

import { Plus } from "lucide-react";
import { OVERLAY_PRESETS } from "@/config/siteConfig";
import type { OverlayType } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const typeLabels: Record<OverlayType, string> = {
  badge: "Etiket",
  price: "Fiyat",
  area: "Alan",
  imar: "İmar",
  distance: "Mesafe",
};

export function OverlayPresetPicker({
  onAdd,
}: {
  onAdd: (preset: Omit<import("@/types").OverlayItem, "id">) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
        Hazır Etiket Şablonları
      </p>
      <div className="grid grid-cols-1 gap-1.5">
        {OVERLAY_PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => onAdd({ ...p, position: { ...p.position } })}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md border border-white/10 bg-chrome-850 px-2.5 py-2 text-left",
              "transition-colors hover:border-neon-green/40 hover:bg-neon-green/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60",
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <span className="truncate text-xs text-white/80">{p.label}</span>
              <Badge>{typeLabels[p.type]}</Badge>
            </span>
            <Plus className="h-3.5 w-3.5 shrink-0 text-neon-bright" />
          </button>
        ))}
      </div>
    </div>
  );
}
