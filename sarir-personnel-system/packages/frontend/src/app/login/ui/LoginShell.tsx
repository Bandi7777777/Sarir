"use client";

import type { ReactNode } from "react";

type LoginShellProps = {
  children: ReactNode;
};

export function LoginShell({ children }: LoginShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031627] via-[#04253c] to-[#041226] text-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/15 bg-white/5 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div dir="rtl" className="grid w-full grid-cols-1 md:grid-cols-[1.15fr_0.9fr]">
          {children}
        </div>
      </div>
    </div>
  );
}
