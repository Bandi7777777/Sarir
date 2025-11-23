"use client";

import { usePathname } from "next/navigation";
import React from "react";

/**
 * Legacy light-page frame (kept for reference).
 * Canonical shell now lives in LayoutClient with Sidebar + Topbar.
 */
export default function PageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  if (isDashboard) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[var(--shell-bg-light)] text-[var(--shell-fg-light)]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
