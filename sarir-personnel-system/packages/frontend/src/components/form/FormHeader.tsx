"use client";

import React from "react";

type Props = {
  variant: "personnel" | "driver";
  title: string;
  subtitle?: string;
  badge?: string; // e.g., "Manual" | "Excel"
};

export default function FormHeader({ variant, title, subtitle, badge }: Props) {
  const Logo = variant === "driver" ? TruckLogo : PersonBadgeLogo;

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 rounded-2xl bg-white/70 dark:bg-white/10 border border-gray-200/70 dark:border-white/10 shadow-sm flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#07657E]/10 to-[#F2991F]/10" />
          <Logo className="relative h-7 w-7 text-[#07657E]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#07657E] dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>

      {badge && (
        <span className="inline-flex items-center rounded-full border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
          {badge}
        </span>
      )}
    </header>
  );
}

/* ─────────────── Logos (inline SVG) ─────────────── */

function PersonBadgeLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.5 20a7.5 7.5 0 0 0-15 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3" y="2.5" width="18" height="19" rx="3" stroke="currentColor" strokeWidth="1.4" opacity=".45"/>
    </svg>
  );
}

function TruckLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M6 20h28v16H6z" stroke="currentColor" strokeWidth="2" />
      <path d="M34 24h11l7 8v4H34V24Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="42" r="4.5" stroke="currentColor" strokeWidth="2" fill="white"/>
      <circle cx="44" cy="42" r="4.5" stroke="currentColor" strokeWidth="2" fill="white"/>
      <path d="M6 36h42" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
