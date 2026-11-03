"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  onValueChange: (value: number) => void;
}

export function Slider({ className, value, onValueChange, ...props }: SliderProps) {
  return (
    <input
      type="range"
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className={cn(
        "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10",
        "accent-neon-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60 rounded-full",
        "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none",
        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-green",
        "[&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,197,94,0.6)]",
        className,
      )}
      {...props}
    />
  );
}
