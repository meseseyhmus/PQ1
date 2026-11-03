"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface ScoreRingProps {
  score: number;
  grade: string;
  size?: number;
  className?: string;
}

function colorFor(score: number): { stroke: string; text: string; track: string } {
  if (score >= 80) return { stroke: "#16a34a", text: "text-emerald-600", track: "#dcfce7" };
  if (score >= 55) return { stroke: "#d97706", text: "text-amber-600", track: "#fef3c7" };
  return { stroke: "#dc2626", text: "text-rose-600", track: "#fee2e2" };
}

export function ScoreRing({ score, grade, size = 190, className }: ScoreRingProps) {
  const [display, setDisplay] = useState(0);
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = Math.max(0, Math.min(100, score));
  const offset = c - (target / 100) * c;
  const palette = colorFor(score);

  useEffect(() => {
    setDisplay(0);
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`SEO skoru ${score} / 100, not ${grade}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={palette.track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={palette.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="score-ring-value"
          style={{
            filter: `drop-shadow(0 6px 14px ${palette.stroke}55)`,
          }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span
          className={cn(
            "text-5xl font-extrabold tabular-nums tracking-tight",
            palette.text
          )}
        >
          {display}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-400">
          / 100
        </span>
        <span className="mt-1.5 rounded-full bg-ink-950 px-3 py-1 text-sm font-bold text-white">
          Not {grade}
        </span>
      </div>
    </div>
  );
}