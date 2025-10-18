"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Topbar (Light pages)
 * - روی همهٔ مسیرها به جز /dashboard نمایش داده می‌شود.
 * - روشن اما نه سفیدِ تخت؛ گرادیان خیلی ملایم + سایهٔ لطیف.
 * - دکمه‌ها هماهنگ با .btn-primary ( #07657E ) و .btn-accent ( #F2991F ).
 */

export default function Topbar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <header
      role="banner"
      className="card mb-4 px-4 py-3 sticky top-0 z-30"
      style={{
        background:
          "linear-gradient(180deg, rgba(7,101,126,0.07) 0%, rgba(255,255,255,0.70) 100%)",
        backdropFilter: "saturate(1.1) blur(4px)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Logo + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <a href="/" aria-label="Sarir Logistic" className="shrink-0">
            <img
              src="/Logo-Sarir.png"
              alt="SARIR LOGISTIC"
              className="h-8 w-auto object-contain"
              onError={(e) => ((e.currentTarget.style.display = "none"))}
            />
          </a>
          <Breadcrumbs pathname={pathname ?? "/"} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="btn btn-outline" type="button">Notifications</button>
          <div className="flex items-center gap-1" aria-label="Language switcher">
            <button className="btn btn-accent" type="button">EN</button>
            <button className="btn btn-outline" type="button">FA</button>
            <button className="btn btn-outline" type="button">DE</button>
          </div>
          <a href="/" className="btn btn-primary">Home</a>
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
          <a href={href} className="text-foreground/70 hover:text-foreground transition-colors truncate">
            {label}
          </a>
        )}
      </span>
    );
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm flex items-center min-w-0 truncate">
      <a href="/" className="font-medium text-foreground hover:opacity-80 transition-opacity">
        Home
      </a>
      {items}
    </nav>
  );
}
