import { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-[--card] border border-[--border] p-6 shadow-sm {className}">
      {children}
    </div>
  );
}