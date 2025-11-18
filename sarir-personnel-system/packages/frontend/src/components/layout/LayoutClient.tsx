"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";

type Props = { children: ReactNode };

export default function LayoutClient({ children }: Props) {
  const pathname = usePathname() || "";
  const isAuth = pathname === "/login" || pathname === "/login/" || pathname.startsWith("/auth");

  if (isAuth) {
    // صفحه لاگین بدون سایدبار/تولبار
    return (
      <main className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-[#EAF7FF] to-[#F9FDFF]" dir="rtl">
        {children}
      </main>
    );
  }

  // نکته مهم: چون container در RTL است، «فرزند اول» سمت راست می‌ایستد
  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-[#EAF7FF] to-[#F9FDFF]" dir="rtl">
      <Sidebar side="right" />                         {/* سمت راست قطعی */}
      <main className="flex-1 min-w-0" dir="rtl">{children}</main>
    </div>
  );
}
