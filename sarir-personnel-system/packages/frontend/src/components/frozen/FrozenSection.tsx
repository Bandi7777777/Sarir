import * as React from "react";

import { cn } from "@/lib/utils";

export function FrozenSection({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-800/60",
        "bg-gradient-to-br from-[#020617] via-[#020a16] to-[#041421]",
        "shadow-[0_50px_150px_rgba(0,0,0,0.95)]",
        "px-5 py-5 lg:px-6 lg:py-6",
        className
      )}
      {...props}
    />
  );
}
