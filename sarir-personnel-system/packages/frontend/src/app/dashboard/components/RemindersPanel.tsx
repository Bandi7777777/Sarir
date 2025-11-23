'use client';
import { useMemo, useState } from "react";

import { useReminders } from "./RemindersContext";
function fmtDate(iso: string) {
  try { const [y,m,d] = iso.split('-').map(Number); const dt = new Date(y, m-1, d);
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn', { calendar: 'persian', year:'numeric', month:'2-digit', day:'2-digit' }).format(dt);
  } catch { return iso; }
}
export default function RemindersPanel() {
  const { reminders, removeReminder, toggleImportant, clearAll } = useReminders();
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [...reminders].sort((a,b) => a.date.localeCompare(b.date) || (a.time||"").localeCompare(b.time||""));
    return q ? base.filter(r => (r.title + " " + (r.note||"")).toLowerCase().includes(q)) : base;
  }, [reminders, query]);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none ring-1 ring-white/15 focus:ring-white/30" placeholder="جستجو در یادآورها..." value={query} onChange={e => setQuery(e.target.value)} />
        <button onClick={clearAll} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs hover:bg-rose-500/20">حذف همه</button>
      </div>
      <div className="grid gap-2">
        {list.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm opacity-70">یادآوری ثبت نشده است.</div>
        ) : list.map(r => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-bold">{r.title}</div>
                <div className="text-xs opacity-75">{fmtDate(r.date)}{r.time ? (" - " + r.time) : ""}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleImportant(r.id)} className={"rounded-lg px-2 py-1 text-xs ring-1 " + (r.important ? "ring-amber-400/50 bg-amber-400/10" : "ring-white/15 bg-white/5")} aria-label="نشانه‌گذاری اهمیت">مهم</button>
                <button onClick={() => removeReminder(r.id)} className="rounded-lg px-2 py-1 text-xs ring-1 ring-rose-400/40 bg-rose-400/10 hover:bg-rose-400/20" aria-label="حذف">حذف</button>
              </div>
            </div>
            {r.note && <div className="mt-2 text-sm opacity-80">{r.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
