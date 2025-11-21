"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";

type LayoutClientProps = {
  children: React.ReactNode;
};

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname() || "";
  const isAuthRoute = pathname.startsWith("/auth") || pathname === "/login";

  // تشخیص صفحات تیره (داشبورد و گزارشات)
  const isDarkPage =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/reports");

  // اعمال تم به Body
  React.useEffect(() => {
    const body = document.body;
    if (isDarkPage) {
      body.classList.add("dark");
      body.classList.remove("light");
    } else {
      body.classList.add("light");
      body.classList.remove("dark");
    }
  }, [isDarkPage]);

  if (isAuthRoute) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-background" dir="rtl">
        {children}
      </main>
    );
  }

  // تنظیم پس‌زمینه برای تم‌های مختلف
  const mainBgClass = isDarkPage
    ? "bg-[#020617] text-white" // پس‌زمینه مشکی عمیق برای داشبورد
    : "bg-[#F8FAFC] text-slate-900"; // پس‌زمینه خاکستری خیلی روشن برای صفحات سفید

  return (
    // حذف overflow-hidden از اینجا برای جلوگیری از مشکلات اسکرول داخلی
    <div className={`flex h-screen w-full overflow-hidden ${mainBgClass}`} dir="rtl">
      
      {/* سایدبار */}
      <Sidebar theme={isDarkPage ? "dark" : "light"} />

      {/* کانتینر محتوا - بدون هیچ پدینگ یا فاصله اضافه */}
      <main className="flex-1 relative flex flex-col min-w-0 h-full">
        {/* اسکرول فقط در این بخش فعال است */}
        <div className="flex-1 overflow-y-auto scroll-smooth w-full h-full">
          {/* اینجا هم پدینگ را حذف کردیم تا محتوا بتواند تمام صفحه باشد */}
          {/* خود صفحات داخلی (Page.tsx) مسئول فاصله‌دهی محتوای خود هستند */}
          <div className="w-full min-h-full"> 
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}