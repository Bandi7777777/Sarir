"use client";

import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#020617] via-[#03101d] to-[#020815] text-slate-50 flex flex-row-reverse">
      <div className="flex-1 pr-[80px]">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}
