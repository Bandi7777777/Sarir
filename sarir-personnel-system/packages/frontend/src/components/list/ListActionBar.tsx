import React from "react";

import { cn } from "@/lib/utils";

type ListActionBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function ListActionBar({ children, className }: ListActionBarProps) {
  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      {children}
    </div>
  );
}
