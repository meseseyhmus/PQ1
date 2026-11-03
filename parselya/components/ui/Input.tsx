"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-md border border-white/10 bg-chrome-900 px-2.5 text-sm text-white/90",
        "placeholder:text-white/25",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60 focus-visible:border-neon-green/50",
        "transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
