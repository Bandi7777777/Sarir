"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";  // وارد کردن کامپوننت سایدبار (کلاینتی)

interface LayoutClientProps {
  children: ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  const isLoginPath = pathname === "/login";  // تشخیص اینکه مسیر جاری صفحه لاگین است یا خیر

  if (isLoginPath) {
    // در صفحه لاگین سایدباری نمایش داده نمی‌شود
    return <main>{children}</main>;
  }

  // در سایر صفحات، سایدبار به همراه محتوای اصلی نمایش داده می‌شود
  return (
    <main className="flex">
      <Sidebar />               {/* نمایش سایدبار در صورت غیر از لاگین */}
      <div className="flex-1">{children}</div> {/* محتوای اصلی در کنار سایدبار */}
    </main>
  );
}
