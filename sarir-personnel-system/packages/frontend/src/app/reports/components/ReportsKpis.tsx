"use client";

import { ReportsCard } from "../ui/ReportsCard";

type KPI = { label: string; value: number | string; hint?: string };

type Props = {
  kpis: KPI[];
};

export function ReportsKpis({ kpis }: Props) {
  return (
    <ReportsCard className="p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
          >
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {typeof item.value === "number" && Number.isFinite(item.value)
                ? item.value.toLocaleString("fa-IR")
                : item.value}
            </div>
            {item.hint ? <div className="mt-1 text-[11px] text-teal-300">{item.hint}</div> : null}
          </div>
        ))}
      </div>
    </ReportsCard>
  );
}
