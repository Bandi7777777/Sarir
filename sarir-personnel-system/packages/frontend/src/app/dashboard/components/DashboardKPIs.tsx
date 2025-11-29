"use client";

import { DashboardCard } from "../ui/DashboardCard";
import { DashboardKpiCard } from "../ui/DashboardKpiCard";

type KPI = { label: string; value: number; trend?: string };

type Props = {
  kpis: KPI[];
};

export function DashboardKPIs({ kpis }: Props) {
  return (
    <DashboardCard className="p-5">
      <div className="mb-3 text-sm font-semibold text-slate-200">شاخص‌های کلیدی</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {kpis.map((item, idx) => (
          <DashboardKpiCard key={idx}>
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {Number.isFinite(item.value) ? item.value.toLocaleString("fa-IR") : "-"}
            </div>
            {item.trend ? <div className="mt-1 text-[11px] text-teal-300">{item.trend}</div> : null}
          </DashboardKpiCard>
        ))}
      </div>
    </DashboardCard>
  );
}
