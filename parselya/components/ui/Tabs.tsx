"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex border-b border-white/10 bg-chrome-900", className)}
    >
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-medium uppercase tracking-wider transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60 focus-visible:-m-1",
            active === t.id
              ? "border-b-2 border-neon-green text-neon-bright"
              : "border-b-2 border-transparent text-white/40 hover:text-white/70",
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
