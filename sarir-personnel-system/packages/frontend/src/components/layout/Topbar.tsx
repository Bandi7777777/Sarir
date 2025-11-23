"use client";

import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

/**
 * Topbar (Light pages)
 * - روی همهٔ مسیرها به جز /dashboard نمایش داده می‌شود.
 * - روشن اما نه سفیدِ تخت؛ گرادیان خیلی ملایم + سایهٔ لطیف.
 * - دکمه‌ها هماهنگ با .btn-primary ( #07657E ) و .btn-accent ( #F2991F ).
 */

export default function Topbar({ variant = "light" }: { variant?: "light" | "dark" }) {
  const pathname = usePathname();

  const bg =
    variant === "dark"
      ? "bg-white/5 border-white/10 text-white"
      : "bg-white/70 border-black/10 text-slate-900";

  return (
    <header
      role="banner"
      className={`sticky top-0 z-40 mb-2 border-b backdrop-blur-md ${bg}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" aria-label="Sarir Logistic" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow">
              <HomeIcon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">Sarir Logistic</span>
          </Link>
          <Breadcrumbs pathname={pathname ?? "/"} />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/notifications" className="btn btn-outline">
            اعلان‌ها
          </Link>
          <Link href="/reports" className="btn btn-accent">
            گزارش‌ها
          </Link>
          <Link href="/" className="btn btn-primary">
            خانه
          </Link>
        </div>
      </div>
    </header>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-foreground/70 truncate">
        <span className="font-medium text-foreground">Home</span>
      </nav>
    );
  }

  const items = parts.map((p, idx) => {
    const label = decodeURIComponent(p).replace(/-/g, " ");
    const isLast = idx === parts.length - 1;
    const href = "/" + parts.slice(0, idx + 1).join("/");

    return (
      <span key={href} className="truncate">
        <span className="mx-2 text-foreground/40">/</span>
        {isLast ? (
          <span className="font-medium text-foreground truncate">{label}</span>
        ) : (
          <Link href={href} className="text-foreground/70 transition-colors hover:text-foreground truncate">
            {label}
          </Link>
        )}
      </span>
    );
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm flex items-center min-w-0 truncate">
      <Link href="/" className="font-medium text-foreground transition-opacity hover:opacity-80">
        Home
      </Link>
      {items}
    </nav>
  );
}
