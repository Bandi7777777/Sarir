import "../styles/globals.css";
import type { ReactNode } from "react";
import Sidebar from "@/components/ui/Sidebar";

export const metadata = {
  title: "سامانه پرسنلی سریر",
  description: "سیستم مدیریت منابع انسانی سریر لجستیک",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      {/* تم پیش‌فرضِ سراسریِ همهٔ صفحات = روشنِ ملایم */}
      <body className="theme-light min-h-dvh antialiased">
        <div className="flex min-h-dvh">
          {/* سایدبار فقط همین‌جا (Singleton داخل خودش رعایت شده) */}
          <aside className="shrink-0">
            <Sidebar />
          </aside>

          {/* محتوای اصلی */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
