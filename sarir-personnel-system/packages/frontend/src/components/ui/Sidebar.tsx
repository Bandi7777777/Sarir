"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  UserPlus,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subItems?: { href: string; label: string }[];
};

const MAIN_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { 
    href: "/dashboard/personnel", 
    label: "مدیریت پرسنل", 
    icon: Users,
    subItems: [
      { href: "/dashboard/personnel/list", label: "لیست کارکنان" },
      { href: "/dashboard/personnel/add", label: "استخدام جدید" },
    ]
  },
  { href: "/dashboard/drivers", label: "ناوگان و رانندگان", icon: Truck },
  { href: "/dashboard/contracts", label: "مدیریت قراردادها", icon: FileText },
  { href: "/dashboard/insurance", label: "بیمه و سوابق", icon: ShieldCheck },
  { href: "/dashboard/recruitment", label: "هسته گزینش", icon: UserPlus },
  { href: "/reports", label: "گزارشات آماری", icon: BarChart3 },
];

type SidebarProps = {
  theme: "dark" | "light";
};

export default function Sidebar({ theme }: SidebarProps) {
  const pathname = usePathname() || "";
  const isDark = theme === "dark";

  // --- استایل‌های کانتینر اصلی ---
  const sidebarClass = isDark
    ? "bg-slate-950/50 backdrop-blur-xl border-white/5 text-slate-400"
    : "bg-white border-slate-200 text-slate-600 shadow-lg"; // سایه قوی‌تر برای تم روشن

  // --- استایل آیتم‌های فعال و هاور ---
  const activeItemClass = isDark
    ? "bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/30"
    : "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-bold"; // رنگ تیره‌تر برای خوانایی در روشن

  const hoverItemClass = isDark
    ? "hover:bg-white/10 hover:text-white"
    : "hover:bg-slate-100 hover:text-slate-900";

  // --- استایل منوی شناور (Popover) - اصلاح شده برای تم روشن ---
  const popoverClass = isDark
    ? "bg-[#0f172a] border border-white/10 text-slate-200 shadow-2xl"
    : "bg-white border border-slate-200 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"; // سایه و بوردر مشخص برای تم روشن

  return (
    <aside
      className={cn(
        "relative z-50 flex flex-col items-center py-4 h-screen w-16 border-l transition-all duration-300",
        sidebarClass
      )}
    >
      {/* لوگو */}
      <div className="mb-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
        <span className="text-lg font-black text-white">S</span>
      </div>

      {/* لیست منوها */}
      <nav className="flex-1 flex flex-col gap-3 w-full px-2">
        {MAIN_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <div key={item.href} className="group relative flex items-center justify-center">
              {/* دکمه اصلی */}
              <Link
                href={item.href}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                  isActive ? activeItemClass : hoverItemClass
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </Link>

              {/* --- منوی شناور (زیرمنو) --- */}
              {/* این بخش نامرئی برای جلوگیری از قطع شدن موس هنگام حرکت به سمت منو */}
              <div className="absolute right-full top-0 h-full w-6 -mr-4 z-40 pointer-events-none group-hover:pointer-events-auto" />

              <div className="absolute right-full top-0 pr-2 pointer-events-none opacity-0 -translate-x-2 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out z-50 flex items-start">
                
                <div className={cn(
                  "min-w-[170px] rounded-xl p-2 backdrop-blur-sm ml-1",
                  popoverClass
                )}>
                  {/* عنوان منو */}
                  <div className={cn(
                    "px-3 py-2 text-sm font-bold mb-1 border-b",
                    isDark ? "border-white/10" : "border-slate-100 text-slate-900"
                  )}>
                    {item.label}
                  </div>

                  {/* آیتم‌های زیرمنو */}
                  {item.subItems && item.subItems.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
                            pathname === sub.href 
                              ? (isDark ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800 font-bold")
                              : (isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900")
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            pathname === sub.href ? "bg-current" : "bg-gray-400"
                          )} />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 pb-1">
                      <span className="text-[10px] opacity-50">مشاهده صفحه اصلی</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* فوتر */}
      <div className="mt-auto flex flex-col gap-2 w-full px-2 pb-2">
        <Link
          href="/settings"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
            hoverItemClass
          )}
        >
          <Settings className="h-5 w-5" />
        </Link>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}