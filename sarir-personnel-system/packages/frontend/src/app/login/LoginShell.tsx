import type { ReactNode } from "react";

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div data-page="login" className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 lg:px-6">
      {children}
    </div>
  );
}
