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
        "flex flex-col items-stretch justify-between gap-2 md:flex-row md:items-center",
        "rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/92 px-3 py-2 shadow-[0_6px_12px_rgba(6,30,48,0.08)] backdrop-blur-xl text-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
