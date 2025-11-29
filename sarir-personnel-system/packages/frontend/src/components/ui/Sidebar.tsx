"use client";

import { Car, FileText, LayoutDashboard, LogOut, Settings, ShieldCheck, Truck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

type NavChild = { label: string; route: string };
type NavSection = {
  label: string;
  route?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children?: NavChild[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "داشبورد",
    route: "/dashboard",
    icon: LayoutDashboard,
    children: [
      { label: "داشبورد منابع انسانی", route: "/dashboard" },
      { label: "گزارش‌ها", route: "/reports" },
      { label: "اعلان‌ها", route: "/notifications" },
    ],
  },
  {
    label: "پرسنل",
    icon: Users,
    children: [
      { label: "لیست پرسنل", route: "/personnel/list" },
      { label: "ثبت پرسنل جدید", route: "/personnel/register" },
      { label: "آمار پرسنل", route: "/stats/personnel" },
    ],
  },
  {
    label: "رانندگان",
    icon: Truck,
    children: [
      { label: "لیست رانندگان", route: "/drivers/list" },
      { label: "ثبت راننده", route: "/drivers/register" },
      { label: "آمار رانندگان", route: "/stats/drivers" },
    ],
  },
  {
    label: "ناوگان",
    icon: Car,
    children: [
      { label: "لیست خودروها", route: "/vehicles/list" },
      { label: "ثبت خودرو", route: "/vehicles/register" },
    ],
  },
  {
    label: "قراردادها",
    icon: FileText,
    children: [
      { label: "لیست قراردادها", route: "/contracts/list" },
      { label: "ثبت قرارداد", route: "/contracts/register" },
    ],
  },
  {
    label: "هیئت مدیره",
    icon: ShieldCheck,
    children: [
      { label: "لیست اعضا", route: "/board/list" },
      { label: "ثبت عضو جدید", route: "/board/register" },
    ],
  },
  {
    label: "تنظیمات و ابزارها",
    icon: Settings,
    children: [
      { label: "تنظیمات سامانه", route: "/settings" },
      { label: "ورود داده‌ها", route: "/tools/import" },
      { label: "اعلان‌ها و هشدارها", route: "/notifications" },
      { label: "گزارش‌های مدیریتی", route: "/reports" },
    ],
  },
];

type SidebarProps = {
  theme?: "dark" | "light";
};

export default function Sidebar({ theme: _theme = "light" }: SidebarProps) {
  const pathname = usePathname() || "";

  const isActiveRoute = (route?: string, children?: NavChild[]) => {
    if (!route && !children) return false;
    if (route && (pathname === route || pathname.startsWith(`${route}/`))) return true;
    if (children) {
      return children.some((child) => pathname === child.route || pathname.startsWith(`${child.route}/`));
    }
    return false;
  };

  const baseItem =
    "flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition";
  const activeItem = "bg-[#07657E] text-white shadow-[0_0_18px_rgba(7,101,126,0.9)]";

  return (
    <aside
      role="navigation"
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-[80px] flex-col items-center justify-between py-4",
        "border-l border-slate-800/80 bg-gradient-to-b from-[#050b16]/92 via-[#040a14]/92 to-[#060d1b]/95 text-slate-100 shadow-[0_0_35px_rgba(15,23,42,0.85)] backdrop-blur-xl ring-1 ring-slate-900/70"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="mt-2 mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900 text-xs font-semibold text-slate-100 shadow-[0_0_18px_rgba(7,101,126,0.55)]">
          <Link
            href="/dashboard"
            className="text-sm font-black tracking-tight"
            aria-label="ساریر"
          >
            S
          </Link>
        </div>

        <nav className="flex w-full flex-1 flex-col items-center gap-3">
          {NAV_SECTIONS.map((section) => {
            const active = isActiveRoute(section.route, section.children);
            const Icon = section.icon;
            const primaryRoute = section.route || section.children?.[0]?.route || "#";
            return (
              <div key={section.label} className="group relative w-full">
                <Link
                  href={primaryRoute}
                  className={cn(baseItem, active && activeItem)}
                  aria-label={section.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>

                <div
                  className={cn(
                    "pointer-events-none absolute left-[calc(100%+10px)] top-0 z-30 hidden min-w-[220px] -translate-y-2 rounded-2xl border border-slate-700/70 bg-slate-900/90 shadow-[0_14px_30px_rgba(6,30,48,0.18)] backdrop-blur-xl",
                    "group-hover:block group-focus-within:block group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
                  )}
                >
                  <div className="flex flex-col gap-1 p-3">
                    {(section.children || []).map((child) => {
                      const childActive = pathname === child.route || pathname.startsWith(`${child.route}/`);
                      return (
                        <Link
                          key={child.route}
                          href={child.route}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors",
                            childActive ? "bg-[#07657E]/10 text-white" : "text-slate-200 hover:text-white hover:bg-slate-800/70"
                          )}
                        >
                          <span>{child.label}</span>
                          {childActive ? <span className="h-2 w-2 rounded-full bg-[var(--color-brand-accent)]" /> : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mb-3 flex flex-col items-center gap-3">
        <Link
          href="/settings"
          className={cn(baseItem, "h-11 w-11 border border-slate-800/80 hover:border-slate-700")}
          aria-label="تنظیمات"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <Link
          href="/login"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-800/80 text-rose-300 transition hover:border-rose-400 hover:text-rose-200 hover:bg-slate-800/80"
          aria-label="خروج"
        >
          <LogOut className="h-5 w-5" />
        </Link>
      </div>
    </aside>
  );
}
