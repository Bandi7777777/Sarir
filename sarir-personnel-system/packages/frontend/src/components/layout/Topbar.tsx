"use client";

import { HomeIcon, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

type TopbarProps = {
  variant?: "light" | "dark";
};

export default function Topbar({ variant = "light" }: TopbarProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  const shellStyles = isDark
    ? "border-b border-slate-800/70 bg-slate-950/85 text-slate-50 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-xl"
    : "border-b border-slate-200/70 bg-white/85 text-[var(--color-text-main)] shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl";

  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-3 px-3 py-2 lg:px-6 lg:py-3",
        shellStyles
      )}
    >
      <Breadcrumbs pathname={pathname ?? "/"} tone={isDark} />

      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] sm:gap-3">
        <span className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/80 px-3 py-1 text-[var(--color-text-main)]">
          Sarir Logistic
        </span>
        <div className="flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/70 px-2.5 py-1 text-[var(--color-text-main)] shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
          <UserCircle2 className="h-5 w-5 text-[var(--color-brand-primary)]" />
          <span className="text-sm font-semibold">مدیر سیستم</span>
        </div>
      </div>
    </header>
  );
}

function Breadcrumbs({ pathname, tone }: { pathname: string; tone: boolean }) {
  const parts = pathname.split("/").filter(Boolean);
  const textMuted = tone ? "text-white/70" : "text-[var(--color-text-muted)]";
  const textStrong = tone ? "text-white" : "text-[var(--color-text-main)]";

  const crumbs = [
    { href: "/", label: "خانه" },
    ...parts.map((p, idx) => ({
      href: "/" + parts.slice(0, idx + 1).join("/"),
      label: decodeURIComponent(p).replace(/-/g, " "),
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
      <div className="flex h-8 items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/70 px-3 text-[var(--color-text-main)] shadow-[0_6px_16px_rgba(15,23,42,0.12)]">
        <HomeIcon className="h-4 w-4 text-[var(--color-brand-primary)]" />
        <span className="text-xs font-semibold text-[var(--color-brand-primary)]">خانه</span>
      </div>
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={c.href}>
            {idx > 0 && <span className={cn("text-xs", textMuted)}>/</span>}
            {isLast ? (
              <span className={cn("font-semibold", textStrong)}>{c.label}</span>
            ) : (
              <Link href={c.href} className={cn("transition-colors hover:text-[var(--color-brand-primary)]", textMuted)}>
                {c.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
