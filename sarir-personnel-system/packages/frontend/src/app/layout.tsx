import type { Metadata } from "next";
import "../styles/globals.css";
import ClientProviders from "./ClientProviders";

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
          <div className="layout">
            <main>{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}