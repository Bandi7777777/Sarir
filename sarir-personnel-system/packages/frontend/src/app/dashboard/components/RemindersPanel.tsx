"use client";

import { useMemo, useState } from "react";

import { useReminders } from "./RemindersContext";

function fmtDate(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
      calendar: "persian",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dt);
  } catch {
    return iso;
  }
}

export default function RemindersPanel() {
  const { reminders, removeReminder, toggleImportant, clearAll } = useReminders();
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [...reminders].sort(
      (a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "")
    );
    return q ? base.filter((r) => (r.title + " " + (r.note || "")).toLowerCase().includes(q)) : base;
  }, [reminders, query]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/80 px-3 py-2 text-sm text-[var(--color-text-main)] outline-none shadow-[0_4px_14px_rgba(0,0,0,0.25)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[color:var(--color-brand-primary)]/20"
          placeholder="جستجو در یادآورها..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={clearAll}
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-[var(--color-text-main)] shadow-[0_6px_18px_rgba(248,156,42,0.08)] hover:bg-rose-500/20"
        >
          حذف همه
        </button>
      </div>
      <div className="grid gap-2">
        {list.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 p-3 text-sm text-[var(--color-text-muted)]">
            یادآوری ثبت نشده است.
          </div>
        ) : (
          list.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/85 p-3 shadow-[0_6px_18px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-bold text-[var(--color-text-main)]">{r.title}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {fmtDate(r.date)}
                    {r.time ? " - " + r.time : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggleImportant(r.id)}
                    className={
                      "rounded-lg px-2 py-1 text-xs ring-1 transition-colors " +
                      (r.important
                        ? "ring-amber-400/50 bg-amber-400/10 text-[var(--color-text-main)]"
                        : "ring-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/70 text-[var(--color-text-muted)] hover:bg-[var(--color-brand-primary-soft)]/20")
                    }
                    aria-label="مهم"
                  >
                    مهم
                  </button>
                  <button
                    onClick={() => removeReminder(r.id)}
                    className="rounded-lg px-2 py-1 text-xs ring-1 ring-rose-400/40 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20"
                    aria-label="حذف"
                  >
                    حذف
                  </button>
                </div>
              </div>
              {r.note && <div className="mt-2 text-sm text-[var(--color-text-muted)]">{r.note}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
