import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-[11px] text-white/30">{hint}</span> : null}
    </label>
  );
}
