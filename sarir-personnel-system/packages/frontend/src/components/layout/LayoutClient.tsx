"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { Toaster } from "react-hot-toast";

import ClientProviders from "@/app/ClientProviders";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/ui/Sidebar";


type LayoutClientProps = {
  children: React.ReactNode;
};

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname() || "";
  const isAuthRoute = pathname.startsWith("/auth") || pathname === "/login";

  // Determine page tone (dark shell for dashboards/reports).
  const isDarkPage =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/reports");

  // Flip body classes to keep global styles in sync.
  React.useEffect(() => {
    const body = document.body;
    if (isDarkPage) {
      body.classList.add("dark");
      body.classList.remove("light");
    } else {
      body.classList.add("light");
      body.classList.remove("dark");
    }
  }, [isDarkPage]);

  if (isAuthRoute) {
    return (
      <ClientProviders>
        <main className="h-screen w-screen overflow-hidden bg-background" dir="rtl">
          {children}
        </main>
      </ClientProviders>
    );
  }

  const mainBgStyle = {
    background: `var(${isDarkPage ? "--shell-bg-dark" : "--shell-bg-light"})`,
    color: `var(${isDarkPage ? "--shell-fg-dark" : "--shell-fg-light"})`,
  };

  return (
    <ClientProviders>
      <div className="flex min-h-screen w-full overflow-hidden" dir="rtl" style={mainBgStyle}>
        <Sidebar theme={isDarkPage ? "dark" : "light"} />

        <div className="relative flex min-h-screen flex-1 flex-col">
          <Topbar variant={isDarkPage ? "dark" : "light"} />
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full w-full">{children}</div>
          </main>
        </div>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </ClientProviders>
  );
}
