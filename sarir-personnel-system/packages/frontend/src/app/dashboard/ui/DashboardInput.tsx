"use client";

import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function DashboardInput({ className = "", ...rest }: Props) {
  return (
    <input
      {...rest}
      className={`w-full rounded-full border border-slate-700 bg-[#0b1a2c] px-4 py-2 text-sm text-slate-100 shadow-inner focus:border-[#07657E] focus:ring-2 focus:ring-[#07657E]/25 ${className}`}
    />
  );
}
