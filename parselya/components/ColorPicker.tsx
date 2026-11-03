"use client";

import { Check } from "lucide-react";
import { COLOR_PRESETS } from "@/config/siteConfig";
import { cn } from "@/lib/cn";

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Sınır rengi">
      {COLOR_PRESETS.map((c) => {
        const active = c.value.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={c.id}
            role="radio"
            aria-checked={active}
            title={c.name}
            onClick={() => onChange(c.value)}
            className={cn(
              "group relative flex h-9 items-center justify-center rounded-md border transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60",
              active ? "border-white/40" : "border-white/10 hover:border-white/25",
            )}
          >
            <span
              className="h-5 w-5 rounded-full"
              style={{
                backgroundColor: c.value,
                boxShadow: active ? `0 0 12px ${c.value}` : undefined,
              }}
            />
            {active && (
              <Check className="absolute right-0.5 top-0.5 h-3 w-3 text-white drop-shadow" />
            )}
            <span className="sr-only">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}
