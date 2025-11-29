"use client";

import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function DashboardKpiCard({ className = "", ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.45)] ring-1 ring-[#07657E]/20 after:absolute after:left-3 after:top-3 after:h-[3px] after:w-10 after:rounded-full after:bg-gradient-to-r after:from-[#07657E] after:to-[#F89C2A] relative overflow-hidden ${className}`}
    />
  );
}
