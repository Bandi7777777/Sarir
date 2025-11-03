"use client";
import { useEffect, useState } from "react";

type A = { id: string; title: string; fiscal_year?: string | null; scheduled_at?: string | null; status?: string | null; is_active: boolean; created_at: string; };

export default function AssemblyListPage() {
  const [rows, setRows] = useState<A[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const r = await fetch("/api/assemblies", { cache: "no-store" });
    const j = await r.json();
    setRows(Array.isArray(j) ? j : []);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(x => (x.title || "").includes(q));

  return (
    <div dir="rtl" className="p-6 space-y-4 text-cyan-50">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">مجامع</h1>
        <a href="/assembly/register" className="px-3 py-2 rounded bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220]">ثبت مجمع</a>
      </div>
      <input className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm" placeholder="جستجو…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="border border-white/15 rounded-2xl bg-white/8 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr><th className="p-2 text-right">عنوان</th><th className="p-2 text-right">سال مالی</th><th className="p-2 text-right">زمان</th><th className="p-2 text-right">وضعیت</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr><td className="p-3 opacity-70" colSpan={4}>موردی نیست.</td></tr> :
              filtered.map(a => <tr key={a.id} className="border-t border-white/10"><td className="p-2">{a.title}</td><td className="p-2">{a.fiscal_year || "—"}</td><td className="p-2">{a.scheduled_at ? new Date(a.scheduled_at).toLocaleString("fa-IR") : "—"}</td><td className="p-2">{a.status || "—"}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
