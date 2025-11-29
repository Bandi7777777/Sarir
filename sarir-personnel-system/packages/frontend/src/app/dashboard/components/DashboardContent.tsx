"use client";

import { FunnelIcon } from "@heroicons/react/24/solid";
import type { Dispatch, SetStateAction } from "react";

import { DashboardButton } from "../ui/DashboardButton";
import { DashboardCard } from "../ui/DashboardCard";

type Props = {
  tableError: string;
  rows: { id: number; first_name: string; last_name: string; email?: string; created_at?: string }[];
  search: string;
  filter: "all" | "withEmail" | "noEmail";
  onFilterChange: Dispatch<SetStateAction<"all" | "withEmail" | "noEmail">>;
};

export function DashboardContent({ tableError, rows, filter, onFilterChange }: Props) {
  return (
    <DashboardCard className="space-y-3 p-4">
      <div className="flex items-center gap-2 text-slate-200">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f2235] text-slate-100">
          <FunnelIcon className="h-5 w-5" />
        </span>
        <span className="text-sm">فیلتر پرسنل</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "همه" },
          { key: "withEmail", label: "با ایمیل" },
          { key: "noEmail", label: "بدون ایمیل" },
        ].map((item) => (
          <DashboardButton
            key={item.key}
            onClick={() => onFilterChange(item.key as typeof filter)}
            className={
              filter === item.key
                ? "h-8 px-3 text-xs"
                : "h-8 px-3 text-xs bg-transparent border border-slate-700/70 text-slate-300 shadow-none hover:bg-slate-800/70"
            }
          >
            {item.label}
          </DashboardButton>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/70 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        {tableError ? (
          <div className="p-4 text-sm text-rose-200">{tableError || "خطا در دریافت داده"}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900 text-slate-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium">نام و نام‌خانوادگی</th>
                <th className="px-4 py-3 text-right font-medium">ایمیل</th>
                <th className="px-4 py-3 text-right font-medium">تاریخ ایجاد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3">{`${row.first_name || ""} ${row.last_name || ""}`}</td>
                  <td className="px-4 py-3 text-slate-300">{row.email || "-"}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString("fa-IR") : "-"}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    هیچ ردیفی برای نمایش وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardCard>
  );
}
