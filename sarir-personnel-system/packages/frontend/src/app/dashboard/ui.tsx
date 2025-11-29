import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function DashCard(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/70 bg-slate-950/80 backdrop-blur-xl",
        "shadow-[0_22px_80px_rgba(15,23,42,0.9)] text-slate-100",
        "px-4 py-4 lg:px-5 lg:py-5",
        className
      )}
      {...rest}
    />
  );
}

export function DashButton({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1",
        "h-9 px-3 text-xs font-medium rounded-full",
        "bg-[#07657E] text-white shadow-[0_0_18px_rgba(7,101,126,0.9)]",
        "hover:bg-[#055369] transition disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    />
  );
}

export function DashPill(props: HTMLAttributes<HTMLSpanElement>) {
  const { className, ...rest } = props;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1",
        "text-xs font-medium text-slate-200",
        className
      )}
      {...rest}
    />
  );
}
