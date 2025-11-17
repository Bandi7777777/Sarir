"use client";

import { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  UserPlus,
  Users,
  ClipboardList,
  PieChart,
} from "lucide-react";
import Sidebar from "@/components/ui/Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // صفحاتی که نباید شِل داشبورد داشته باشند (مثلاً لاگین)
  const isPlain = pathname === "/login";
  if (isPlain) {
    return <main>{children}</main>;
  }

  const isDashboard = pathname === "/dashboard";
  const segments = useMemo(() => {
    if (!pathname) return [];
    return pathname.replace(/^\/+|\/+$/g, "").split("/");
  }, [pathname]);

  return (
    <div dir="ltr" className="flex w-screen h-screen overflow-hidden bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4]">
      <Sidebar />
      <div className="flex-1 flex flex-col" dir="rtl">
        <header className="sticky top-0 z-20 border-b border-white/40 bg-white/85 backdrop-blur-xl shadow-[0_6px_18px_rgba(15,23,42,0.12)]">
          {isDashboard ? (
            /* هدر در صفحه داشبورد (تولبار وسط‌چین) */
            <div className="flex items-center justify-center gap-4 px-4 py-3 md:px-6 md:py-4">
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2 py-1 shadow-sm">
                <Link
                  href="/personnel/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 text-white text-[11px] px-3 py-1 shadow-sm hover:bg-sky-500 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>ثبت پرسنل جدید</span>
                </Link>
                <span className="h-4 w-px bg-slate-200" />
                <Link
                  href="/personnel/list"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-sky-500" />
                  <span>پرونده‌های پرسنلی</span>
                </Link>
                <Link
                  href="/contracts/list"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ClipboardList className="h-3.5 w-3.5 text-amber-500" />
                  <span>قراردادها</span>
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <PieChart className="h-3.5 w-3.5 text-emerald-500" />
                  <span>گزارش‌ها</span>
                </Link>
              </div>
            </div>
          ) : (
            /* هدر در سایر صفحات (عنوان وbreadcrumb راست، پروفایل چپ) */
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
              {/* راست: Breadcrumb مسیر */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1 text-[11px] md:text-xs text-slate-500">
                  <Link href="/dashboard" className="hover:text-sky-600 transition-colors">
                    داشبورد
                  </Link>
                  {segments
                    .filter((seg) => seg && seg !== "dashboard")
                    .map((seg, idx) => {
                      const href = "/" + segments.slice(0, segments.indexOf(seg) + 1).join("/");
                      const label = decodeURIComponent(seg).replace(/-/g, " ").trim();
                      return (
                        <span key={`${href}-${idx}`} className="flex items-center gap-1">
                          <span className="text-slate-400">/</span>
                          <Link href={href} className="hover:text-sky-600 transition-colors">
                            {label || "صفحه"}
                          </Link>
                        </span>
                      );
                    })}
                </div>
                {/* عنوان صفحه (مثال) */}
                {segments[0] && segments[0] !== "dashboard" && (
                  <h1 className="text-sm md:text-base font-semibold text-slate-800">
                    {segments[segments.length - 1] ? decodeURIComponent(segments[segments.length - 1]).replace(/-/g, " ") : ""}
                  </h1>
                )}
              </div>
              {/* چپ: اعلان‌ها + پروفایل کاربر */}
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  type="button"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-sky-300 transition-colors shadow-sm"
                >
                  <Bell className="h-4.5 w-4.5 text-slate-600" />
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow">
                    3
                  </span>
                </button>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                    م
                  </div>
                  <div className="hidden sm:block text-[11px] leading-tight text-slate-700">
                    <div className="font-semibold">محمد شاملو</div>
                    <div className="text-slate-500">مدیر سامانه</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
        <main className="flex-1 py-4 md:py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
