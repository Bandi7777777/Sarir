"use client";

import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const MAIN_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/personnel/list", label: "پرسنل", icon: Users },
  { href: "/drivers/list", label: "رانندگان", icon: Truck },
  { href: "/vehicles/list", label: "ناوگان", icon: Truck },
  { href: "/contracts/list", label: "قراردادها", icon: FileText },
  { href: "/board/list", label: "هیئت مدیره", icon: ShieldCheck },
  { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
];

type SidebarProps = {
  theme?: "dark" | "light";
};

export default function Sidebar({ theme = "light" }: SidebarProps) {
  const pathname = usePathname() || "";
  const isDark = theme === "dark";

  const containerClass = isDark
    ? "bg-slate-950/60 text-slate-200 border-white/10"
    : "bg-white text-slate-800 border-slate-200 shadow-lg";

  const activeClass = isDark
    ? "bg-[rgba(7,101,126,0.18)] text-white border border-white/20 shadow-[0_0_12px_rgba(7,101,126,0.35)]"
    : "bg-[rgba(7,101,126,0.08)] text-[var(--brand-primary)] border border-[rgba(7,101,126,0.25)] shadow-sm";

  const hoverClass = isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-slate-100 hover:text-slate-900";

  return (
    <aside
      role="complementary"
      className={cn(
        "relative z-30 flex h-screen w-16 flex-col items-center border-l py-4 transition-colors duration-300",
        containerClass
      )}
    >
      <Link
        href="/dashboard"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-lg shadow-[var(--brand-primary)]/30"
        aria-label="لوگوی ساریر"
      >
        <span className="text-lg font-black">S</span>
      </Link>

      <nav className="flex w-full flex-1 flex-col items-center gap-3">
        {MAIN_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200", isActive ? activeClass : hoverClass)}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2 px-2 pb-2">
        <Link
          href="/settings"
          className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-all", hoverClass)}
          aria-label="تنظیمات"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
          aria-label="خروج"
          type="button"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
