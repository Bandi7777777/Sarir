import React from "react";

import { cn } from "@/lib/utils";

type FilterBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4",
        "p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
