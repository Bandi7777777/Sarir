// src/components/ui/input.tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-200 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-fg)] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-colors",
          "outline-none ring-0 placeholder:text-[var(--input-muted)]",
          "focus:border-[#07657E] focus:ring-2 focus:ring-[#07657E]/20 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        ref={ref}
        suppressHydrationWarning={true}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
