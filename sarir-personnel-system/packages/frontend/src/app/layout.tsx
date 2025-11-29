import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

import "../styles/globals.css";
import LayoutClient from "@/components/layout/LayoutClient";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarir Personnel System",
  description: "سیستم پرسنل سرير",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[var(--color-shell-bg)] text-[var(--color-text-main)] antialiased"
        suppressHydrationWarning
      >
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
