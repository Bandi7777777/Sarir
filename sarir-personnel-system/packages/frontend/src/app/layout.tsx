import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "سامانه پرسنلی سریر",
  description: "سیستم مدیریت منابع انسانی سریر لجستیک",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      {/* تم سراسری فقط روی صفحات غیر از داشبورد */}
      <body className="theme-light min-h-dvh antialiased" suppressHydrationWarning>
        {/* سایدبار فعلاً حذف شده؛ صفحه‌ها تمام عرض می‌شن */}
        <div className="layout">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
