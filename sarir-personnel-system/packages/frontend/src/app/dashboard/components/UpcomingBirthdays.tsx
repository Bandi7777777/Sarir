"use client";

import { useMemo } from "react";

type Employee = { first_name?: string; last_name?: string; birth_date?: string };

function nextBirthday(dateStr?: string) {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  const now = new Date();
  const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
  const days = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { date: next, days };
}

export default function UpcomingBirthdays({ employees }: { employees: Employee[] }) {
  const list = useMemo(() => {
    const arr = [];
    for (const e of employees || []) {
      const nb = nextBirthday(e.birth_date);
      if (nb) arr.push({ name: `${e.first_name || ""} ${e.last_name || ""}`.trim(), ...nb });
    }
    return arr.sort((a, b) => a.days - b.days).slice(0, 8);
  }, [employees]);

  return (
    <div className="grid gap-2">
      {list.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 p-3 text-sm text-[var(--color-text-muted)]">
          تولدی در راه نیست.
        </div>
      ) : (
        list.map((x, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/85 p-3 shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
          >
            <div className="font-bold truncate text-[var(--color-text-main)]">{x.name || "-"}</div>
            <div className="text-xs opacity-80 text-[var(--color-text-muted)]">
              {x.date.toLocaleDateString("fa-IR")} • {x.days} روز باقی مانده
            </div>
          </div>
        ))
      )}
    </div>
  );
}
