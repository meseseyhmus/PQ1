import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "pro" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tone === "default" && "bg-white/10 text-white/60",
        tone === "pro" && "bg-amber-400/15 text-amber-300 border border-amber-400/30",
        tone === "success" && "bg-neon-green/15 text-neon-bright border border-neon-green/30",
        className,
      )}
    >
      {children}
    </span>
  );
}
