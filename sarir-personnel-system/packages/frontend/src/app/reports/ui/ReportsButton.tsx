"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function ReportsButton({ className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1 rounded-full bg-[#07657E] px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(7,101,126,0.6)] transition hover:bg-[#055369] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    />
  );
}
