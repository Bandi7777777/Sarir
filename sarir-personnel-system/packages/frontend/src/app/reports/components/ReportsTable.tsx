"use client";

import type { Report } from "@/app/api/reports/route";

import { ReportsCard } from "../ui/ReportsCard";

type Props = {
  rows: Report[];
  isLoading: boolean;
};

export function ReportsTable({ rows, isLoading }: Props) {
  return (
    <ReportsCard className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">جدول گزارش‌ها</h2>
        <span className="text-xs text-slate-400">{rows.length.toLocaleString("fa-IR")} مورد</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/70 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-300">در حال بارگذاری...</div>
        ) : (
          <table className="min-w-full text-right text-sm">
            <thead className="bg-slate-900 text-slate-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium">دسته / عنوان</th>
                <th className="px-4 py-3 text-right font-medium">تعداد</th>
                <th className="px-4 py-3 text-right font-medium">توضیحات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`transition ${idx % 2 === 0 ? "bg-slate-950" : "bg-slate-900/70"} hover:bg-slate-900/60`}
                >
                  <td className="px-4 py-3 text-slate-100">{r.category}</td>
                  <td className="px-4 py-3 text-slate-100">{r.count?.toLocaleString("fa-IR")}</td>
                  <td className="px-4 py-3 text-slate-300">{r.description || "—"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    گزارشی برای نمایش وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {!isLoading && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>مجموع گزارش‌های نمایش داده شده: {rows.length.toLocaleString("fa-IR")}</span>
          <span>مرور صفحه‌ای ساده</span>
        </div>
      )}
    </ReportsCard>
  );
}
