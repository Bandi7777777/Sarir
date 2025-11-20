"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/Sidebar";
import {
  BellIcon,
  UserPlusIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
} from "@heroicons/react/24/solid";
import { PanelLeft } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // برای breadcrumb
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ستون محتوای اصلی (هدر + صفحه) */}
      <div className="flex flex-1 flex-col" dir="rtl">
        {/* Header بالا */}
        <header className="sticky top-0 z-20 border-b border-white/40 bg-white/85 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
            {/* بخش راست: عنوان و breadcrumb */}
            <div className="flex flex-col gap-1">
              <nav className="flex flex-wrap items-center gap-1 text-[11px] md:text-xs text-slate-500">
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
                      segments.slice(0, segments.indexOf(seg) + 1).join("/");
                    const label = decodeURIComponent(seg)
                      .replace(/-/g, " ")
                      .trim();
                    return (
                      <span key={idx} className="flex items-center gap-1">
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
              </nav>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="text-sm md:text-base font-semibold text-slate-800">
                  سیستم مدیریت پرسنل{" "}
                  <span className="text-sky-600">سریر لجستیک</span>
                </h1>
                <span className="hidden md:inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-100">
                  نسخه آزمایشی
                </span>
              </div>

              <p className="hidden md:block text-[11px] text-slate-500">
                دسترسی سریع به پرسنل، پرونده‌ها، قراردادها و گزارش‌ها در یک
                پنل یکپارچه
              </p>
            </div>

            {/* بخش چپ: دکمه‌ها و اعلان‌ها */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* شورتکات‌ها (ثبت پرسنل، قراردادها، گزارش‌ها) */}
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2 py-1 shadow-sm">
                <Link
                  href="/personnel/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 text-white text-[11px] px-3 py-1 shadow hover:bg-sky-500"
                >
                  <UserPlusIcon className="h-3.5 w-3.5" />
                  <span>افزودن پرسنل</span>
                </Link>
                <span className="h-4 w-px bg-slate-200" />
                <Link
                  href="/personnel/list"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  <UsersIcon className="h-3.5 w-3.5 text-sky-500" />
                  <span>پرسنل</span>
                </Link>
                <Link
                  href="/contracts/list"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  <ClipboardDocumentListIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>قراردادها</span>
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  <ChartPieIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <span>گزارش‌ها</span>
                </Link>
              </div>

              {/* اعلان‌ها */}
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
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

        {/* محتوای صفحه (همون داشبورد خودت) */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          {children}
        </main>
      </div>

      {/* سایدبار سمت راست؛ نسخه تیره و نئونی */}
      <Sidebar
        side="right"
        collapsible="icon"
        variant="floating"
        className="border-none"
      >
        <div className="flex h-full w-full flex-col rounded-xl bg-gradient-to-b from-[#050b24] via-[#050b24] to-[#010417] text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.85)]">
          {/* لوگو و عنوان کناری */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-cyan-400/60 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-1">
                <img
                  src="/Logo-Sarir.png"
                  alt="Sarir"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    if (!el.src.endsWith(".png")) el.src = "/logo.png";
                  }}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold text-cyan-100">
                  سیستم مدیریت پرسنل
                </span>
                <span className="text-[11px] text-slate-300/80">
                  سریر لجستیک
                </span>
              </div>
            </Link>
          </div>

          <SidebarContent className="flex-1 px-2 pb-3">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard")}
                  className="data-[active=true]:bg-cyan-500/25 data-[active=true]:text-cyan-50"
                >
                  <Link href="/dashboard">
                    <PanelLeft className="h-4 w-4 rotate-90" />
                    <span>داشبورد</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/personnel")}
                >
                  <Link href="/personnel/list">
                    <UsersIcon className="h-4 w-4" />
                    <span>پرسنل</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/contracts")}
                >
                  <Link href="/contracts/list">
                    <ClipboardDocumentListIcon className="h-4 w-4" />
                    <span>قراردادها</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/reports")}
                >
                  <Link href="/reports">
                    <ChartPieIcon className="h-4 w-4" />
                    <span>گزارش‌ها</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </div>
      </Sidebar>
    </>
  );
}
