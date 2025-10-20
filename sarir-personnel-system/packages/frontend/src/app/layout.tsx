import ChunkReload from './_components/ChunkReload';

import "../styles/globals.css";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";

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
      <body className="theme-light min-h-dvh antialiased" suppressHydrationWarning>
        <ToastProvider>
          <div className="layout">
            <main>{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
