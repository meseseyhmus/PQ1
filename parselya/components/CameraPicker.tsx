"use client";

import { Orbit, ZoomIn, MoveHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { CAMERA_PRESETS } from "@/config/siteConfig";
import type { CameraMotion } from "@/types";
import { cn } from "@/lib/cn";

const icons: Record<CameraMotion, ReactNode> = {
  "zoom-in": <ZoomIn className="h-5 w-5" />,
  orbit: <Orbit className="h-5 w-5" />,
  pan: <MoveHorizontal className="h-5 w-5" />,
};

export function CameraPicker({
  value,
  onChange,
}: {
  value: CameraMotion;
  onChange: (m: CameraMotion) => void;
}) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Kamera hareketi">
      {CAMERA_PRESETS.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60",
              active
                ? "border-neon-green/60 bg-neon-green/10"
                : "border-white/10 bg-chrome-850 hover:border-white/20",
            )}
          >
            <span className={active ? "text-neon-bright" : "text-white/40"}>
              {icons[p.id]}
            </span>
            <span>
              <span
                className={cn(
                  "block text-sm font-medium",
                  active ? "text-neon-bright" : "text-white/80",
                )}
              >
                {p.name}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-white/40">
                {p.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
