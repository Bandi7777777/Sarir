import * as React from "react";

import { cn } from "@/lib/utils";

type FrozenButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function FrozenButton({
  variant = "primary",
  className,
  ...props
}: FrozenButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-950";
  const variants: Record<NonNullable<FrozenButtonProps["variant"]>, string> = {
    primary:
      "h-9 px-4 bg-[#07657E] text-white hover:bg-[#055670] shadow-[0_16px_50px_rgba(7,101,126,0.9)]",
    secondary:
      "h-9 px-4 border border-slate-600/80 bg-slate-900/80 text-slate-100 hover:bg-slate-900",
    ghost: "h-9 px-3 text-slate-300 hover:bg-slate-900/70 hover:text-white",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
