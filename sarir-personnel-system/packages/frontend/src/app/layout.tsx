import type { Metadata } from "next";
import "../styles/globals.css";
import ClientProviders from "./ClientProviders";
import AppShell from "@/components/layout/AppShell";

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
      <body
        className="theme-light min-h-dvh antialiased"
        style={{
          background: "linear-gradient(to bottom, #E0F4FA, #F9FDFF)",
        }}
        suppressHydrationWarning
      >
        <ClientProviders>
          <AppShell>{children}</AppShell>
        </ClientProviders>
      </body>
    </html>
  );
}
