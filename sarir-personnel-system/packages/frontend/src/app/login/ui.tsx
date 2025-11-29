import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function LoginCard(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white/95 shadow-[0_30px_120px_rgba(15,23,42,0.25)]",
        "p-6 lg:p-8 text-slate-900",
        className
      )}
      {...rest}
    />
  );
}

export function LoginButton({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-10 w-full rounded-full bg-[#07657E] text-white text-sm font-semibold",
        "shadow-[0_14px_50px_rgba(7,101,126,0.45)] hover:bg-[#055369] transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    />
  );
}
