"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const ImportInput = forwardRef<HTMLInputElement, Props>(
  ({ className = "", ...rest }, ref) => (
    <input
      ref={ref}
      {...rest}
      className={`w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-[#07657E] focus:ring-2 focus:ring-[#07657E]/25 ${className}`}
    />
  ),
);

ImportInput.displayName = "ImportInput";
