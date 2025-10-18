"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, TruckIcon } from "@heroicons/react/24/solid";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type Driver = {
  id?: number | string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  plate?: string | null;
  created_at?: string | null;
};

const API_URL = "/api/drivers";

export default function DriverList() {
  const [rows, setRows] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let stop = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(API_URL, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        const data: Driver[] = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
        if (!stop) setRows(data);
      } catch (e: any) {
        if (!stop) setErr(e?.message || "خطا در دریافت داده");
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, []);

  const debounced = useDebounced(q, 250);

  const filtered = useMemo(() => {
    const base = Array.isArray(rows) ? rows : [];
    const k = debounced.trim().toLowerCase();
    const res = k
      ? base.filter((d) => {
          const s = [
            d.first_name ?? "", d.last_name ?? "", d.phone ?? "", d.plate ?? "",
          ].join(" ").toLowerCase();
          return s.includes(k);
        })
      : base;

    return [...res].sort(
      (a, b) =>
        new Date(b?.created_at ?? 0).getTime() -
        new Date(a?.created_at ?? 0).getTime(),
    );
  }, [rows, debounced]);

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.header
          initial={{ y: -26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: .35 }}
          className="card px-6 py-4"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">لیست رانندگان</h1>
              <p className="mt-1 text-xs opacity-70 ltr">GET {API_URL}</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/drivers/register"><Button variant="primary">ثبت راننده</Button></Link>
              <Link href="/tools/import"><Button variant="accent">ورود از اکسل</Button></Link>
            </div>
          </div>
        </motion.header>

        {/* Search */}
        <section className="card p-5">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-80" />
            <Input
              placeholder="جستجو (نام/پلاک/تلفن)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pr-11"
            />
          </div>
        </section>

        {/* List */}
        {loading && (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 card animate-pulse" />
            ))}
          </div>
        )}

        {err && (
          <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm">
            خطا: {err}
          </div>
        )}

        {!loading && !err && (
          <ul className="grid sm:grid-cols-2 gap-3">
            {filtered.length === 0 ? (
              <li className="card p-4 text-sm opacity-80">موردی یافت نشد.</li>
            ) : (
              filtered.map((d, idx) => {
                // ✅ کلید یکتا و پایدار: id نرمالایز → fallback به plate → fallback به ترکیب نام+idx
                const normId = d.id != null && d.id !== "" ? String(d.id) : undefined;
                const key =
                  normId ??
                  (d.plate ? `plate:${d.plate}` : `${d.first_name ?? "?"}-${d.last_name ?? "?"}-${idx}`);

                const fullName = `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() || "—";

                return (
                  <li
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-white/70 card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl grid place-items-center bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow">
                        <TruckIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{fullName}</div>
                        <div className="text-xs opacity-70 truncate">
                          {d.phone || "—"} {d.plate ? `• ${d.plate}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {normId && (
                        <Link href={`/drivers/view/${encodeURIComponent(normId)}`}>
                          <Button variant="outline" size="sm">جزئیات</Button>
                        </Link>
                      )}
                      <Link href={normId ? `/drivers/edit/${encodeURIComponent(normId)}` : "/drivers/register"}>
                        <Button variant="primary" size="sm">{normId ? "ویرایش" : "ثبت"}</Button>
                      </Link>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function useDebounced(value: string, delay = 250) {
  const [v, setV] = useState(value);
  const t = useRef<any>(null);
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);
  return v;
}
