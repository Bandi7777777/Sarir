import React from "react";

import { cn } from "@/lib/utils";

type TableShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function TableShell({ children, className }: TableShellProps) {
  return (
    <div
      className={cn(
        "relative overflow-x-auto rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 shadow-[0_6px_14px_rgba(6,30,48,0.08)] backdrop-blur-lg text-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
