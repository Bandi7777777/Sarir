"use client";

import { ReportsBadge } from "../ui/ReportsBadge";
import { ReportsCard } from "../ui/ReportsCard";

export function ReportsHeader() {
  return (
    <ReportsCard className="p-5 space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <ReportsBadge className="px-3 py-1">Sarir Analytics</ReportsBadge>
        <span className="text-slate-400">خانه / گزارش‌ها</span>
      </div>
      <div className="space-y-1 text-right">
        <h1 className="text-2xl font-semibold text-white">گزارش‌ها</h1>
        <p className="text-sm text-slate-300">تحلیل داده‌های منابع انسانی و هیئت‌مدیره با نمودارها و فیلترهای پویا.</p>
      </div>
    </ReportsCard>
  );
}
