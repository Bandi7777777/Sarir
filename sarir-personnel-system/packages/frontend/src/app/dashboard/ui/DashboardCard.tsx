"use client";

import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function DashboardCard({ className = "", ...rest }: Props) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-[0_28px_90px_rgba(0,0,0,0.78)] ring-1 ring-[#07657E]/10 ${className}`}
      {...rest}
    />
  );
}
