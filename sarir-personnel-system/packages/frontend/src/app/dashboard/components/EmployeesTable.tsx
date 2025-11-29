
"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  role: string;
  unit: string;
  birth?: string;
};

export default function EmployeesTable(){
  const [data, setData] = useState<Employee[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try{
        const r = await fetch("/api/employees", { cache: "no-store" });
        if (!r.ok) throw new Error("خطا در دریافت لیست پرسنل");
        const j = (await r.json()) as { data?: Employee[] };
        if (alive) setData(Array.isArray(j.data) ? j.data : []);
      }catch(e){
        if (alive) setErr(e instanceof Error ? e.message : "خطای ناشناخته");
      }finally{
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; }
  }, []);

  if (loading){
    return (
      <div className="overflow-hidden">
        <div className="skeleton h-8 w-40 mb-3"></div>
        <div className="skeleton h-10 w-full mb-2"></div>
        <div className="skeleton h-10 w-11/12 mb-2"></div>
        <div className="skeleton h-10 w-10/12"></div>
      </div>
    );
  }

  if (err){
    return (
      <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
        {err}
      </div>
    );
  }

  if (!data || data.length === 0){
    return <div className="text-sm opacity-70">داده‌ای برای نمایش وجود ندارد.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="opacity-70">
          <tr className="text-right">
            <th className="py-2 px-3">نام</th>
            <th className="py-2 px-3">سمت</th>
            <th className="py-2 px-3">واحد</th>
            <th className="py-2 px-3 ltr">تاریخ تولد</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((e) => (
            <tr key={e.id}>
              <td className="py-2 px-3">{e.name}</td>
              <td className="py-2 px-3">{e.role}</td>
              <td className="py-2 px-3">{e.unit}</td>
              <td className="py-2 px-3 ltr">{e.birth ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
