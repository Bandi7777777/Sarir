// packages/frontend/src/app/dashboard/layout.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const segments = pathname
    ?.replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white">
      {/* Top Toolbar شیشه‌ای */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#020617]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* راست: عنوان و breadcrumb */}
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Link href="/dashboard" className="hover:text-cyan-300">
                داشبورد
              </Link>
              {segments.slice(1).map((seg, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-slate-500">/</span>
                  <span className="capitalize text-slate-300">
                    {decodeURIComponent(seg)}
                  </span>
                </span>
              ))}
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              سیستم مدیریت پرسنل{" "}
              <span className="text-cyan-400">سریر لجستیک</span>
            </h1>
          </div>

          {/* چپ: اکشن‌ها و پروفایل */}
          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-100 shadow-sm hover:bg-white/10">
              + ثبت پرسنل جدید
            </button>
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10">
              <span className="absolute -top-0.5 -left-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold">
                3
              </span>
              <span aria-hidden>🔔</span>
            </button>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 text-[10px] font-semibold">
                N
              </div>
              <div className="hidden text-[11px] leading-tight text-slate-100 md:block">
                <div>محمد شمْلو</div>
                <div className="text-[10px] text-slate-400">مدیر سامانه</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* بدنه داشبورد */}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
