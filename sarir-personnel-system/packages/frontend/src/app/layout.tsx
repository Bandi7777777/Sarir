import type { Metadata } from "next";
import "../styles/globals.css";
import LayoutClient from "@/components/layout/LayoutClient";

export const metadata: Metadata = {
  title: "Sarir Personnel System",
  description: "سیستم مدیریت پرسنل سریر",
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
      className="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body
        className="theme-light min-h-dvh antialiased"
        suppressHydrationWarning
      >
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
