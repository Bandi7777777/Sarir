"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * PageFrame (Light Pages Frame)
 * - برای همهٔ مسیرهای غیر از /dashboard:
 *    • تم روشن را «اجباری» می‌کند (theme-light) تا تم داشبورد نشت نکند.
 *    • پس‌زمینهٔ روشنِ گرادیانی و gutters استاندارد.
 *    • Kill-Switch: هر «ریل/پنل/ساید شناور راست» را خاموش می‌کند.
 * - برای /dashboard: هیچ قاب/قانونی اعمال نمی‌کند و children خام برمی‌گرداند.
 */
export default function PageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  if (isDashboard) return <>{children}</>;

  return (
    <div
      className="min-h-screen light-frame theme-light"
      style={{
        background:
          "radial-gradient(1000px 380px at 10% -10%, rgba(7,101,126,0.10), rgba(255,255,255,0.00)), linear-gradient(180deg, rgba(7,101,126,0.06) 0%, rgba(255,255,255,0.78) 100%)",
      }}
    >
      {/* Kill-Switch: هر ریل/ساید/پنلِ شناور سمت راست در صفحات روشن حذف شود */}
      <style>{`
        .light-frame aside[role="complementary"],
        .light-frame .sidebar,
        .light-frame .side-bar,
        .light-frame .SideBar,
        .light-frame [data-sidebar],
        .light-frame [data-rail],
        .light-frame .rail,
        .light-frame .action-rail,
        .light-frame .floating-rail,
        .light-frame .quick-rail,
        .light-frame .dock,
        .light-frame .floating-dock,
        /* الگوی عمومی: هر چیز fixed/absolute در راست (غالباً همون ریل دکمه‌هاست) */
        .light-frame [class*="fixed"][class*="right-"],
        .light-frame [class*="absolute"][class*="right-"] {
          display: none !important;
        }

        /* اگر کسی aside اضافه در محتوا گذاشته، فقط اولین را حفظ کن و بقیه را حذف کن */
        .light-frame aside:not(:first-of-type) { display: none !important; }

        /* هر تمِ تیره‌ای که داخل صفحه تزریق شده (حالت تم داشبورد) را خنثی کن */
        .light-frame .theme-dashboard { all: unset; }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
