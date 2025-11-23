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
        "relative overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
