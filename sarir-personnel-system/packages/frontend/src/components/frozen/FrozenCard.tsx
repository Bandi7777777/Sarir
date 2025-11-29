import * as React from "react";

import { cn } from "@/lib/utils";

export function FrozenCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/60 bg-slate-950/90",
        "shadow-[0_40px_120px_rgba(0,0,0,0.9)]",
        "px-4 py-4 lg:px-5 lg:py-5",
        className
      )}
      {...props}
    />
  );
}
