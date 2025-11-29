"use client";

import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function ReportsCard({ className = "", ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] ${className}`}
    />
  );
}
