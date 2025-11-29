"use client";

import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function ImportCard({ className = "", ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.65)] ${className}`}
    />
  );
}
