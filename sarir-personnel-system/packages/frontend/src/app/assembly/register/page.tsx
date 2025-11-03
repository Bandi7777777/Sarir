"use client";
import { useState } from "react";

export default function AssemblyRegisterPage() {
  const [title, setTitle] = useState("");
  const [fiscal_year, setFiscalYear] = useState("");
  const [scheduled_at, setScheduledAt] = useState("");
  const [status, setStatus] = useState("planned");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body: any = { title, status };
    if (fiscal_year) body.fiscal_year = fiscal_year;
    if (scheduled_at) body.scheduled_at = new Date(scheduled_at).toISOString();
    const r = await fetch("/api/assemblies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) location.href = "/assembly/list";
    else alert("ثبت ناموفق");
  }

  return (
    <div dir="rtl" className="p-6 text-cyan-50 space-y-4">
      <h1 className="text-xl font-bold">ثبت مجمع</h1>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-3 max-w-3xl">
        <input className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm" placeholder="عنوان مجمع" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm" placeholder="سال مالی (اختیاری)" value={fiscal_year} onChange={e => setFiscalYear(e.target.value)} />
        <input type="datetime-local" className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm" value={scheduled_at} onChange={e => setScheduledAt(e.target.value)} />
        <select className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="planned">planned</option>
          <option value="held">held</option>
          <option value="published">published</option>
        </select>
        <div className="col-span-full">
          <button className="px-3 py-2 rounded bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220]">ثبت</button>
        </div>
      </form>
    </div>
  );
}
