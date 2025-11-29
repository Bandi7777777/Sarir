"use client";

import {
  ArrowUpOnSquareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ListBulletIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type Action = { href: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; subtle?: boolean };

const actions: Action[] = [
  { href: "/personnel/register", label: "ثبت پرسنل جدید", Icon: UserPlusIcon },
  { href: "/personnel/list", label: "فهرست پرسنل", Icon: ListBulletIcon },
  { href: "/reports", label: "گزارش‌ها", Icon: ChartBarIcon },
  { href: "/documents/upload", label: "بارگذاری اسناد", Icon: ArrowUpOnSquareIcon },
  { href: "/admin/settings", label: "تنظیمات پیشرفته", Icon: Cog6ToothIcon, subtle: true },
];

export default function QuickActions() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {actions.map((a, i) => (
        <Link
          key={i}
          href={a.href}
          className={
            "flex items-center gap-3 rounded-xl border p-3 transition shadow-[0_12px_28px_rgba(0,0,0,0.28)] " +
            (a.subtle
              ? "border-[var(--color-border-subtle)] bg-[var(--color-surface)]/70 hover:bg-[var(--color-surface)]/90"
              : "border-[var(--color-border-subtle)] bg-[var(--color-surface)]/85 hover:bg-[var(--color-brand-primary-soft)]/12")
          }
        >
          <div className="grid place-items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/70 p-2">
            <a.Icon className="h-5 w-5 text-[var(--color-text-main)]" />
          </div>
          <div className="font-medium text-[var(--color-text-main)]">{a.label}</div>
        </Link>
      ))}
    </div>
  );
}
