import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function ReportsCard(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/70 bg-slate-950/75 backdrop-blur-xl",
        "shadow-[0_20px_70px_rgba(15,23,42,0.85)] text-slate-100",
        "px-4 py-4 lg:px-5 lg:py-5",
        className
      )}
      {...rest}
    />
  );
}

export function ReportsButton({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full",
        "h-9 px-3 text-xs font-semibold transition",
        "bg-[#07657E] text-white shadow-[0_0_18px_rgba(7,101,126,0.9)] hover:bg-[#055369]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    />
  );
}

export function ReportsChip(props: HTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs text-slate-200",
        "hover:bg-slate-800/70 transition",
        className
      )}
      {...rest}
    />
  );
}
