"use client";

import { useMemo, useState } from "react";

type Employee = {
  first_name?: string;
  last_name?: string;
  email?: string;
  position?: string;
  created_at?: string;
};

export default function LatestEmployees({ employees }: { employees: Employee[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...(employees || [])]
      .sort((a, b) => new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime())
      .filter((e) =>
        !s || `${e.first_name || ""} ${e.last_name || ""} ${e.email || ""} ${e.position || ""}`.toLowerCase().includes(s)
      )
      .slice(0, 10);
  }, [employees, q]);

  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/80 px-3 py-2 text-sm text-[var(--color-text-main)] outline-none shadow-[0_4px_14px_rgba(0,0,0,0.25)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[color:var(--color-brand-primary)]/20"
        placeholder="جستجو بین آخرین افراد..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid gap-2">
        {list.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 p-3 text-sm text-[var(--color-text-muted)]">
            رکوردی یافت نشد.
          </div>
        ) : (
          list.map((e, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/85 p-3 shadow-[0_14px_26px_rgba(0,0,0,0.28)]"
            >
              <div className="min-w-0">
                <div className="truncate font-bold text-[var(--color-text-main)]">
                  {e.first_name || ""} {e.last_name || ""}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">{e.position || "-"}</div>
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {e.created_at ? new Date(e.created_at).toLocaleDateString("fa-IR") : "-"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
