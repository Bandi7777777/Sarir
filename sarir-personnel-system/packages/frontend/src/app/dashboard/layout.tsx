// File: src/app/(dashboard)/layout.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/app/dashboard/components/TopBar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // حالت باز/بسته بودن سایدبار را در state نگهداری می‌کنیم
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      dir="rtl"
      className="theme-dashboard flex flex-row-reverse min-h-screen"
      style={{ 
        "--sidebar-w": expanded ? "256px" : "72px",   // عرض سایدبار (برای TopBar)
        "--topbar-h": "64px"                          // ارتفاع تقریبی TopBar جهت فاصله‌دهی عمودی
      }}
    >
      {/* سایدبار */}
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      {/* بخش محتوای اصلی داشبورد */}
      <div className="flex-1 flex flex-col">
        <TopBar />  {/* سرصفحه‌ی ثابت بالای داشبورد */}
        <main className="flex-1 pt-[var(--topbar-h)] p-6 md:p-10 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
