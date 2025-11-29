import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div data-page="dashboard" className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 lg:px-4 lg:py-6">
      {children}
    </div>
  );
}
