'use client';
import { useMemo, useState } from "react";
type Employee = { first_name?: string; last_name?: string; email?: string; position?: string; created_at?: string; };
export default function LatestEmployees({ employees }: { employees: Employee[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...(employees||[])]
      .sort((a,b) => new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime())
      .filter(e => !s || `${e.first_name||""} ${e.last_name||""} ${e.email||""} ${e.position||""}`.toLowerCase().includes(s))
      .slice(0, 10);
  }, [employees, q]);
  return (
    <div className="space-y-2">
      <input className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none ring-1 ring-white/15 focus:ring-white/30" placeholder="جستجو..." value={q} onChange={e => setQ(e.target.value)} />
      <div className="grid gap-2">
        {list.length === 0 ? <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm opacity-70">داده‌ای موجود نیست.</div> :
          list.map((e,i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-bold">{e.first_name||""} {e.last_name||""}</div>
                <div className="text-xs opacity-75">{e.position||"—"}</div>
              </div>
              <div className="text-xs opacity-70">{e.created_at ? new Date(e.created_at).toLocaleDateString("fa-IR") : "—"}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
