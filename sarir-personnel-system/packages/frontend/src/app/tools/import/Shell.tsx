import type { ReactNode } from "react";

export function ImportShell({ children }: { children: ReactNode }) {
  return (
    <div data-page="tools-import" className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 lg:px-4 lg:py-6">
      {children}
    </div>
  );
}
