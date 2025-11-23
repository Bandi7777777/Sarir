"use client";

import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: (cls?: string) => JSX.Element;
};

const primaryItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "داشبورد",
    icon: (c = "h-5 w-5") => <HomeIcon className={c} />,
  },
  {
    href: "/personnel/list",
    label: "پرسنل",
    icon: (c = "h-5 w-5") => <UsersIcon className={c} />,
  },
  {
    href: "/drivers/list",
    label: "رانندگان",
    icon: (c = "h-5 w-5") => <TruckIcon className={c} />,
  },
];

const actionItems: NavItem[] = [
  {
    href: "/personnel/register",
    label: "ثبت پرسنل",
    icon: (c = "h-5 w-5") => <UserPlusIcon className={c} />,
  },
  {
    href: "/reports",
    label: "گزارش‌ها",
    icon: (c = "h-5 w-5") => <ClipboardDocumentListIcon className={c} />,
  },
  {
    href: "/notifications",
    label: "اعلان‌ها",
    icon: (c = "h-5 w-5") => <BellIcon className={c} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="
        fixed inset-y-0 right-0 z-30
        w-[78px]
        border-l border-white/10
        bg-[#020617]/95
        bg-[radial-gradient(circle_at_0_0,#0ea5e944,transparent_55%),radial-gradient(circle_at_100%_100%,#f9731644,transparent_55%)]
        backdrop-blur-xl
        px-2 py-4
        flex flex-col justify-between items-center
      "
    >
      {/* لوگو */}
      <Link
        href="/dashboard"
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 shadow-inner shadow-black/50 ring-1 ring-white/20 mb-3"
      >
        <span className="text-xs font-extrabold tracking-tight text-white">
          SR
        </span>
      </Link>

      {/* منوی اصلی */}
      <nav className="flex flex-col items-center gap-2">
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ${
                active
                  ? "bg-cyan-500/90 text-white shadow-[0_0_20px_rgba(34,211,238,0.7)]"
                  : "bg-white/5 text-slate-200 hover:bg-white/12 hover:text-white"
              }`}
              title={item.label}
            >
              {item.icon("h-5 w-5")}
            </Link>
          );
        })}
      </nav>

      {/* اکشن‌ها + پروفایل پایین */}
      <div className="flex flex-col items-center gap-3">
        <nav className="flex flex-col items-center gap-2">
          {actionItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 ${
                  active
                    ? "bg-cyan-500/80 text-white shadow-[0_0_18px_rgba(34,211,238,0.7)]"
                    : "bg-white/5 text-slate-200 hover:bg-white/12 hover:text-white"
                }`}
                title={item.label}
              >
                {item.icon("h-4 w-4")}
              </Link>
            );
          })}
        </nav>

        {/* آواتار کاربر */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 text-[10px] font-semibold text-white shadow-lg shadow-cyan-500/40">
          N
        </div>
      </div>
    </aside>
  );
}
