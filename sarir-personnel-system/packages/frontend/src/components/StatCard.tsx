// packages/frontend/src/components/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  iconColor?: string;      // اختیاری شد؛ پیش‌فرض برند
  actionLabel?: string;
  onActionClick?: () => void;
  badgeCount?: number;
}

export default function StatCard({
  title,
  value,
  iconColor,
  actionLabel,
  onActionClick,
  badgeCount,
}: StatCardProps) {
  return (
    <div className="card p-4 relative transition-transform duration-150 hover:translate-y-[-2px]">
      {badgeCount ? (
        <span className="absolute top-2 left-2 min-w-6 h-6 px-2 bg-[var(--brand-accent)] text-[#0b1020] text-xs rounded-full flex items-center justify-center font-extrabold">
          {badgeCount}
        </span>
      ) : null}

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span
          className="text-lg"
          style={{ color: iconColor || "#07657E" }}
          aria-hidden
        >
          📊
        </span>
      </div>

      <p className="text-xs opacity-85 mb-2">{value}</p>

      {actionLabel && onActionClick ? (
        <button
          onClick={onActionClick}
          className="btn btn-primary h-8 px-3 text-xs"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
