"use client";

import { useMemo } from "react";

type Employee = { first_name?: string; last_name?: string; hire_date?: string; created_at?: string };
type AnniversaryRow = { name: string; date: Date; daysLeft: number; years: number; milestone?: number };

function nextAnniversary(src?: string) {
  if (!src) return null;
  const t = Date.parse(src);
  if (!Number.isFinite(t)) return null;
  const start = new Date(t);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let ann = new Date(start);
  ann.setFullYear(start.getFullYear() + years);
  if (ann < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    years += 1;
    ann = new Date(start);
    ann.setFullYear(start.getFullYear() + years);
  }
  const daysLeft = Math.ceil((ann.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const milestone = [1, 3, 5, 10, 15, 20, 25, 30].includes(years) ? years : undefined;
  return { date: ann, daysLeft, years, milestone };
}

export default function Anniversaries({ employees }: { employees: Employee[] }) {
  const rows = useMemo<AnniversaryRow[]>(() => {
    const arr: AnniversaryRow[] = [];
    for (const e of employees || []) {
      const a = nextAnniversary(e.hire_date || e.created_at);
      if (a) arr.push({ name: `${e.first_name || ""} ${e.last_name || ""}`.trim(), ...a });
    }
    return arr.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8);
  }, [employees]);

  return (
    <div className="grid gap-2">
      {rows.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 p-3 text-sm text-[var(--color-text-muted)]">
          سالگردی ثبت نشده است.
        </div>
      ) : (
        rows.map((x, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/85 p-3 shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
          >
            <div className="min-w-0">
              <div className="truncate font-bold text-[var(--color-text-main)]">{x.name || "-"}</div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {x.date.toLocaleDateString("fa-IR")} - سال {x.years}
                {x.milestone ? ` (مناسبت ${x.milestone} سالگی)` : ""}
              </div>
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">{x.daysLeft} روز تا سالگرد</div>
          </div>
        ))
      )}
    </div>
  );
}
