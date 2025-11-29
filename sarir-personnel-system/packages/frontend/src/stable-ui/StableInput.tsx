import * as React from "react";

import { cn } from "@/lib/utils";

type StableInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function StableInput({ className, ...props }: StableInputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400 focus:outline-none focus:border-[#07657E] focus:ring-2 focus:ring-[#07657E]/20",
        className
      )}
      {...props}
    />
  );
}
