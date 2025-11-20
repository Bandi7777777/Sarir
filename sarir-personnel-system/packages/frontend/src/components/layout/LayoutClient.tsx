"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import SliderSidebar from "../ui/slider"; // سایدبار عمودی سمت راست

type LayoutClientProps = {
  children: React.ReactNode;
};

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname() || "";

  // صفحاتی که سایدبار نمی‌خوای (مثلاً لاگین)
  const isAuthRoute =
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/login/";

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-[#020617] to-[#050922]"
      dir="rtl"
    >
      {/* محتوای اصلی؛ همون داشبورد و صفحات خودت */}
      <main className="flex-1 min-w-0" dir="rtl">
        {children}
      </main>

      {/* سایدبار عمودی سمت راست */}
      <SliderSidebar />
    </div>
  );
}
