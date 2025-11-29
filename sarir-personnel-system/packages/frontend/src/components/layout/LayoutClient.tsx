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
  const pageTheme = React.useMemo(() => {
    if (pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname.startsWith("/reports")) return "reports";
    if (pathname.startsWith("/personnel")) return "personnel";
    if (pathname.startsWith("/drivers") || pathname.startsWith("/vehicles")) return "fleet";
    if (pathname.startsWith("/contracts")) return "contracts";
    if (pathname.startsWith("/board")) return "board";
    return "app";
  }, [pathname]);
  const isDarkPage = pageTheme === "dashboard" || pageTheme === "reports";

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.page = isAuthRoute ? "auth" : pageTheme;
    }
  }, [isAuthRoute, pageTheme]);

  if (isAuthRoute) {
    return (
      <ClientProviders>
        <main data-page="auth" className="min-h-screen" dir="rtl">
          {children}
        </main>
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <div className="min-h-screen bg-slate-950 text-slate-50" dir="rtl" data-page={pageTheme}>
        <Sidebar theme={isDarkPage ? "dark" : "light"} />

        <div className="flex min-h-screen flex-col pr-[80px]">
          <Topbar variant={isDarkPage ? "dark" : "light"} />
          <main className="flex-1 overflow-y-auto px-3 py-4 lg:px-6 lg:py-6">{children}</main>
        </div>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </ClientProviders>
  );
}
