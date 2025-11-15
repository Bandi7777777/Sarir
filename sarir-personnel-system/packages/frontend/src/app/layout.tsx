import type { Metadata } from "next";
import "../styles/globals.css";
import ClientProviders from "./ClientProviders";
import LayoutClient from "./LayoutClient";  // اضافه‌شده: وارد کردن کامپوننت کلاینتی جدید

export const metadata: Metadata = {
  title: "سامانه پرسنلی سریر",
  description: "سیستم مدیریت منابع انسانی سریر لجستیک",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className="theme-light min-h-dvh antialiased" suppressHydrationWarning>
        <ClientProviders>
          {/* استفاده از کامپوننت کلاینتی برای بخش‌های داینامیک (مثلاً نمایش شرطی سایدبار) */}
          <div className="layout">
            <LayoutClient>{children}</LayoutClient>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
