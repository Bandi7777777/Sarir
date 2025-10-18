'use client';

import Breadcrumbs from "./breadcrumbs/Breadcrumbs";
import Link from "next/link";
import { PlusIcon, BellIcon, DownloadIcon, Settings2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [elevated, setElevated] = useState(false);
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 pl-[var(--sidebar-w,0px)] transition-[padding-left] duration-300 ease-out">
      <div className={`mx-auto w-full max-w-[1600px] px-4 md:px-6 2xl:px-8 py-3 rounded-b-2xl backdrop-blur-xl
        ${elevated ? "bg-[rgba(17,24,39,.65)] border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.25)]"
                   : "bg-[rgba(17,24,39,.45)] border-b border-white/5"}`}>
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <div className="text-sm opacity-70">Sarir Logistics</div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">داشبورد سریر</h1>
              <div className="hidden md:block opacity-80"><Breadcrumbs /></div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/personnel/new" className="btn-brand" title="افزودن پرسنل جدید">
              <PlusIcon className="w-4 h-4 ml-2" /> افزودن پرسنل
            </Link>
            <Link href="/reports" className="btn-ghost" title="دریافت گزارش PDF">
              <DownloadIcon className="w-4 h-4 ml-2" /> خروجی PDF
            </Link>
            <Link href="/notifications" className="icon-btn" aria-label="اعلان‌ها" title="اعلان‌ها">
              <BellIcon className="w-5 h-5" />
            </Link>
            <Link href="/admin/settings" className="icon-btn" aria-label="تنظیمات" title="تنظیمات">
              <Settings2Icon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
