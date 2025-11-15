"use client";

import type { Metadata } from "next";
import "../styles/globals.css";
import ClientProviders from "./ClientProviders";
import Sidebar from "@/components/ui/Sidebar";
import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "سامانه پرسنلی سریر",
  description: "سیستم مدیریت منابع انسانی سریر لجستیک",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <html lang="fa" dir="rtl" className="light" style={{ colorScheme: "light" }}>
      <body className="theme-light min-h-dvh antialiased">
        <ClientProviders>
          {path.startsWith("/login") ? (
            <>{children}</>
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          )}
        </ClientProviders>
      </body>
    </html>
  );
}
