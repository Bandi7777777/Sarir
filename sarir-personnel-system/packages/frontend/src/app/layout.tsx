import type { Metadata } from "next";
import "../styles/globals.css";
import ClientProviders from "./ClientProviders";
import LayoutClient from "@/components/layout/LayoutClient";

export const metadata: Metadata = {
  title: "سامانه پرسنلی سریر",
  description: "سیستم مدیریت منابع انسانی سریر لجستیک",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body className="theme-light min-h-dvh antialiased" suppressHydrationWarning>
        <ClientProviders>
          {/* همهٔ صفحات از اینجا می‌گذرند و LayoutClient تشخیص می‌دهد لاگین هست یا نه */}
          <LayoutClient>{children}</LayoutClient>
        </ClientProviders>
      </body>
    </html>
  );
}
