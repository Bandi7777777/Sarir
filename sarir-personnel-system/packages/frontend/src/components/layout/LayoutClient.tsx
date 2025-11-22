"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import ClientProviders from "@/app/ClientProviders";
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

  const mainBgClass = isDarkPage ? "bg-[#020617] text-white" : "bg-[#F8FAFC] text-slate-900";

  return (
    <ClientProviders>
      <div className={`flex h-screen w-full overflow-hidden ${mainBgClass}`} dir="rtl">
        <Sidebar theme={isDarkPage ? "dark" : "light"} />

        <main className="flex-1 relative flex flex-col min-w-0 h-full">
          <div className="flex-1 overflow-y-auto scroll-smooth w-full h-full">
            <div className="w-full min-h-full">{children}</div>
          </div>
        </main>
      </div>
    </ClientProviders>
  );
}
