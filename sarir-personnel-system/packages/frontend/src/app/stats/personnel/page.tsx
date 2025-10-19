"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
const DonutChart = dynamic(() => import("@/app/dashboard/DonutChart"), { ssr: false });

type Row = { id:number; first_name:string; last_name:string; email?:string|null; position?:string|null; created_at?:string };

export default function PersonnelStatsPage() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch("/api/employees", { cache: "no-store" });
      const j = await r.json();
      setList(Array.isArray(j) ? j : []);
      setLoading(false);
    })();
  }, []);

  const total = list.length;
  const drivers = useMemo(
    () =>
      list.filter(
        (r) =>
          (r.position || "").toLowerCase().includes("driver") ||
          (r.position || "").includes("راننده")
      ).length,
    [list]
  );
  const staff = Math.max(0, total - drivers);

  const donuts = [
    { category: "پرسنل غیرراننده", count: staff, color: "#0A8A9F" },
    { category: "رانندگان", count: drivers, color: "#66B2FF" },
  ];

  const latest = useMemo(
    () =>
      [...list]
        .sort(
          (a, b) =>
            new Date(b?.created_at ?? 0).getTime() -
            new Date(a?.created_at ?? 0).getTime()
        )
        .slice(0, 8),
    [list]
  );

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-slate-900 bg-gradient-to-br from-[#F2FAFD] via-[#E9F4FA] to-[#DDEEF7]"
    >
      <main
        className="flex-1 p-6 md:p-10 space-y-8"
        style={{ paddingRight: expanded ? "280px" : "80px" }}
      >
        <header className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A8A9F]">آمار پرسنل</h1>
          <p className="opacity-70 mt-1">نمای کلی تعداد و نسبت‌ها (تم روشن‌تر از داشبورد)</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow">
            <h3 className="font-semibold text-[#0A8A9F] mb-3">نسبت راننده/پرسنل</h3>
            {loading ? <div>در حال بارگذاری…</div> : <DonutChart data={donuts as any} />}
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow">
            <h3 className="font-semibold text-[#0A8A9F] mb-2">شاخص‌ها</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>کل پرسنل</span>
                <b>{total}</b>
              </li>
              <li className="flex items-center justify-between">
                <span>رانندگان</span>
                <b>{drivers}</b>
              </li>
              <li className="flex items-center justify-between">
                <span>غیررانندگان</span>
                <b>{staff}</b>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow">
            <h3 className="font-semibold text-[#0A8A9F] mb-2">تازه‌ترین‌ها</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-white/60 animate-pulse" />
                ))}
              </div>
            ) : latest.length === 0 ? (
              <div className="opacity-60">موردی نیست</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {latest.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-white/80 p-2 border border-white/70"
                  >
                    <span className="truncate">
                      {r.first_name} {r.last_name}
                    </span>
                    <span className="opacity-60 text-xs">{r.email || "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}



