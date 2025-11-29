import * as React from "react";

import { cn } from "@/lib/utils";

type StablePageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function StablePageShell({ children, className }: StablePageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-4 px-4 py-6 lg:px-0", className)}>
      {children}
    </div>
  );
}
