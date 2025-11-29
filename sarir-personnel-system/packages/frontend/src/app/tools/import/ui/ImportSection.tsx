"use client";

import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function ImportSection({ className = "", ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-slate-800/60 bg-slate-900/65 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)] ${className}`}
    />
  );
}
