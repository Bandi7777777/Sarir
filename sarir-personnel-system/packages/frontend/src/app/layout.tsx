import "../styles/globals.css";
import type { ReactNode } from "react";
import Sidebar from "@/components/ui/Sidebar";

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
      {/* هیچ تمی روی body نگذار؛ تم پیش‌فرض را روی .layout اعمال می‌کنیم */}
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        {/* پیش‌فرض = روشنِ ملایم → theme-light روی خودِ layout */}
        <div className="layout theme-light">
          <aside>
            <Sidebar />
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
