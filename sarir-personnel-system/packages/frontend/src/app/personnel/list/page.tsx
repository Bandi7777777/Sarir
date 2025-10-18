"use client";

import Sidebar from "@/components/ui/Sidebar";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { UserIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

type Employee = {
  id: number | string;
  first_name: string;
  last_name: string;
  emp_code?: string | null;
  phone?: string | null;
  email?: string | null;
  position?: string | null;
  department?: string | null;
  created_at?: string | null;
};

const EMPLOYEES_URL = "/api/employees";

export default function PersonnelList() {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(EMPLOYEES_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const data: Employee[] = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
        if (!cancelled) setRows(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "خطا در دریافت داده");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const debounced = useDebounced(searchTerm, 300);

  const filtered: Employee[] = useMemo(() => {
    const base = Array.isArray(rows) ? rows : [];
    const q = debounced.trim().toLowerCase();
    const list = q
      ? base.filter((r) =>
          [
            r.first_name ?? "",
            r.last_name ?? "",
            r.emp_code ?? "",
            r.position ?? "",
            r.department ?? "",
            r.email ?? "",
            r.phone ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : base;

    return [...list].sort(
      (a, b) =>
        new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime(),
    );
  }, [rows, debounced]);

  return (
    <div
      dir="rtl"
      className="min-h-screen text-gray-900 dark:text-white bg-[radial-gradient(40rem_30rem_at_110%_-10%,rgba(7,101,126,.12),transparent),radial-gradient(40rem_30rem_at_-10%_120%,rgba(242,153,31,.10),transparent)] bg-[#0b1220]/96"
    >
      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      <div
        className="page-shell transition-[padding] duration-300 ease-out"
        style={{
          paddingInlineEnd: expanded ? "256px" : "72px",
          paddingInlineStart: "24px",
          paddingTop: "24px",
          paddingBottom: "24px",
        }}
      >
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="sticky top-0 z-30 rounded-b-xl glass-soft px-6 py-4 mb-6"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                لیست پرسنل
              </h1>
              <p className="mt-1 text-xs opacity-70 ltr">GET {EMPLOYEES_URL}</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/personnel/new">
                <Button variant="primary" size="md">افزودن پرسنل</Button>
              </Link>
              <Link href="/tools/import">
                <Button variant="accent" size="md">ورود از اکسل</Button>
              </Link>
            </div>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="card-muted p-6 mb-6"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-brand/90" />
            <Input
              aria-label="جستجو"
              type="text"
              placeholder="جستجو…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 text-base"
            />
          </div>
        </motion.section>

        {loading && (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        )}
        {err && (
          <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm">
            خطا: {err}
          </div>
        )}

        {!loading && !err && (
          <ul className="space-y-3">
            {filtered.length === 0 ? (
              <li className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm opacity-70">
                موردی یافت نشد.
              </li>
            ) : (
              filtered.map((e) => (
                <motion.li
                  key={e.id ?? `${e.first_name}-${e.email}`}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 24px rgba(0,0,0,.18)" }}
                  transition={{ duration: 0.1 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="inline-grid place-items-center h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/15">
                      <UserIcon className="h-6 w-6 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold">
                        {(e.first_name ?? "") + " " + (e.last_name ?? "")}
                      </div>
                      <div className="text-xs opacity-80">
                        {e.position || "—"} {e.emp_code ? `• ${e.emp_code}` : ""}{" "}
                        {e.department ? `• ${e.department}` : ""}{" "}
                        {e.email ? `• ${e.email}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/personnel/view/${e.id}`} className="focus:outline-none">
                      <Button variant="ghost" size="sm">جزئیات</Button>
                    </Link>
                    <Link href={`/personnel/edit/${e.id}`}>
                      <Button variant="accent" size="sm">ویرایش</Button>
                    </Link>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function useDebounced(value: string, delay = 300) {
  const [v, setV] = useState(value);
  const t = useRef<any>(null);
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);
  return v;
}
