"use client";

import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement>;

export function DashboardChip({ className = "", ...rest }: Props) {
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-200 ${className}`}
    />
  );
}
