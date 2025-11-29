import * as React from "react";

import { cn } from "@/lib/utils";

type StableCardProps = React.HTMLAttributes<HTMLElement>;

export function StableCard({ className, ...props }: StableCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-100 bg-white px-4 py-4 text-slate-900 shadow-sm lg:px-5 lg:py-5",
        className
      )}
      {...props}
    />
  );
}
