"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/Sidebar";

import {
  Home,
  Users,
  Truck,
  FileText,
  BarChart3,
  Settings,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LayoutClientProps = {
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const MAIN_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "داشبورد", icon: Home },
  { href: "/personnel/list", label: "پرسنل", icon: Users },
  { href: "/drivers/list", label: "رانندگان", icon: Truck },
  { href: "/contracts/list", label: "قراردادها", icon: FileText },
  { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/profile", label: "پروفایل", icon: UserCircle2 },
  { href: "/settings", label: "تنظیمات", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname() || "";

  // صفحه‌های بدون سایدبار (مثلاً لاگین)
  const isAuthRoute =
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/login/";

  if (isAuthRoute) {
    return (
      <main
        className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-[#EAF7FF] to-[#F9FDFF]"
        dir="rtl"
      >
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider
      defaultOpen={false}
      className="flex min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-[#020617] to-[#050922]"
      dir="rtl"
    >
      {/* محتوای اصلی (داشبورد و صفحات) */}
      <main className="flex-1 min-w-0" dir="rtl">
        {children}
      </main>

      {/* سایدبار نئونی سمت راست */}
      <Sidebar
        side="right"
        variant="floating"
        collapsible="icon"
        className="border-none"
      >
        <div className="flex h-full w-full flex-col rounded-2xl bg-gradient-to-b from-[#020617] via-[#050922] to-[#020617] text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
          {/* لوگوی بالای سایدبار */}
          <div className="flex items-center justify-center py-4 border-b border-white/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.8)]">
              SR
            </div>
          </div>

          <SidebarContent className="flex-1 px-2 py-3 flex flex-col justify-between">
            {/* آیتم‌های اصلی */}
            <SidebarMenu className="space-y-2">
              {MAIN_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="rounded-full px-1.5 data-[active=true]:bg-transparent"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={cn(
                            "inline-flex h-10 w-10 items-center justify-center rounded-full border text-slate-200 transition-all",
                            "border-white/15 bg-white/5 shadow-[0_0_18px_rgba(0,0,0,0.6)] group-data-[collapsible=icon]:mx-auto",
                            active &&
                              "border-cyan-400/80 bg-cyan-500/25 text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.8)]"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="truncate text-[13px]">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* آیتم‌های پایین (پروفایل / تنظیمات) */}
            <SidebarMenu className="mt-4 space-y-2">
              {BOTTOM_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="rounded-full px-1.5 data-[active=true]:bg-transparent"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-full border text-slate-200 transition-all",
                            "border-white/10 bg-white/5 shadow-[0_0_14px_rgba(0,0,0,0.5)] group-data-[collapsible=icon]:mx-auto",
                            active &&
                              "border-cyan-400/80 bg-cyan-500/25 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate text-[12px]">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
