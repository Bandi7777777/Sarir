"use client";

import { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BellIcon,
  UserPlusIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
} from "@heroicons/react/24/solid";
import Sidebar from "@/components/ui/Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // صفحاتی که نباید شِل داشبورد (سایدبار و تولبار) داشته باشند
  // (مثلاً صفحه‌ی لاگین، صفحات احراز هویت مانند reset password، verify email و ...)
  const isPlain = pathname === "/login" || pathname?.startsWith("/auth");

  if (isPlain) {
    return <main>{children}</main>;
  }

  const segments = useMemo(() => {
    if (!pathname) return [];
    return pathname.replace(/^\/+|\/+$/g, "").split("/");
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4]" dir="ltr">
      {/* ستون محتوای اصلی */}
      <div className="flex-1 flex flex-col" dir="rtl">
        {/* 🔹 تولبار بهینه‌شده */}
        <header className="sticky top-0 z-20 border-b border-white/40 bg-white/85 backdrop-blur-xl shadow-[0_6px_18px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
            {/* راست: عنوان + breadcrumb */}
            <div className="flex flex-col gap-1">
              {/* breadcrumb */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] md:text-xs text-slate-500">
                <Link
                  href="/dashboard"
                  className="hover:text-sky-600 transition-colors"
                >
                  داشبورد
                </Link>
                {segments
                  .filter((seg) => seg && seg !== "dashboard")
                  .map((seg, idx) => {
                    const href =
                      "/" +
                      segments
                        .slice(0, segments.indexOf(seg) + 1)
                        .join("/");
                    const label = decodeURIComponent(seg)
                      .replace(/-/g, " ")
                      .trim();
                    return (
                      <span
                        key={`${href}-${idx}`}
                        className="flex items-center gap-1"
                      >
                        <span className="text-slate-400">/</span>
                        <Link
                          href={href}
                          className="hover:text-sky-600 transition-colors"
                        >
                          {label || "صفحه"}
                        </Link>
                      </span>
                    );
                  })}
              </div>

              {/* عنوان اصلی */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm md:text-base font-semibold text-slate-800">
                  سیستم مدیریت پرسنل{" "}
                  <span className="text-sky-600">سریر لجستیک</span>
                </h1>
                <span className="hidden md:inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-100">
                  نسخه آزمایشی محیط داخلی
                </span>
              </div>

              {/* توضیح زیرعنوان */}
              <p className="hidden md:block text-[11px] text-slate-500">
                دسترسی سریع به پرسنل، پرونده‌ها، قراردادها و گزارش‌ها در یک
                پنل یکپارچه.
              </p>
            </div>

            {/* چپ: اکشن‌های سریع + اعلان‌ها + پروفایل */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* گروه اکشن‌های سریع */}
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2 py-1 shadow-sm">
                <Link
                  href="/personnel/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 text-white text-[11px] px-3 py-1 shadow-sm hover:bg-sky-500 transition-colors"
                >
                  <UserPlusIcon className="h-3.5 w-3.5" />
                  <span>ثبت پرسنل جدید</span>
                </Link>

                <span className="h-4 w-px bg-slate-200" />

                <Link
                  href="/personnel/list"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <UsersIcon className="h-3.5 w-3.5 text-sky-500" />
                  <span>پرونده‌های پرسنلی</span>
                </Link>

                <Link
                  href="/contracts/list"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ClipboardDocumentListIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>قراردادها</span>
                </Link>

                <Link
                  href="/reports"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ChartPieIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <span>گزارش‌ها</span>
                </Link>
              </div>

              {/* اعلان‌ها */}
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-sky-300 transition-colors shadow-sm"
              >
                <BellIcon className="h-4.5 w-4.5 text-slate-600" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow">
                  3
                </span>
              </button>

              {/* پروفایل کاربر */}
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
        </header>

        {/* بدنه صفحات */}
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* سایدبار سمت راست */}
      <Sidebar />
    </div>
  );
}
