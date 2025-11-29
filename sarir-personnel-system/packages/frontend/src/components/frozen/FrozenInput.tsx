import * as React from "react";

import { cn } from "@/lib/utils";

export const FrozenInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-slate-700/80 bg-slate-900/85 px-3 text-sm text-slate-50",
      "placeholder:text-slate-500",
      "focus:outline-none focus:border-[#07657E] focus:ring-2 focus:ring-[#07657E]/40",
      className
    )}
    {...props}
  />
));

FrozenInput.displayName = "FrozenInput";
