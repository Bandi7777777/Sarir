"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { motion } from "framer-motion";
import { toast } from "react-hot-toast"; // اضافه برای toast error/success
import {
  UsersIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid";

/* ─────────────── Theme helpers ─────────────── */
const GLASS = "backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,.25)] glow-border";
const GLASS2 = "backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.2)] glow-border-soft";
const PANELBG = "bg-white/10 dark:bg-white/10";
const PANELBG2 = "bg-white/8 dark:bg-white/8";

type EmployeeRow = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  created_at?: string;
};

/* ─────────────── Small pieces ─────────────── */
function Metric({
  title, value, hint, accent = "from-cyan-400 to-indigo-500",
}: { title: string; value: string | number; hint?: string; accent?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${GLASS2} ${PANELBG2} p-5 relative overflow-hidden cursor-pointer transition-all duration-300`}
    >
      <div className={`absolute -left-10 -top-10 size-44 rounded-full bg-gradient-to-br ${accent} opacity-20`} />
      <div className="text-xs text-cyan-200/70 font-medium">{title}</div>
      <div className="text-4xl font-extrabold tracking-tight text-cyan-50 mt-1">{value}</div>
      {hint && <div className="text-xs opacity-60 mt-1 text-cyan-200/70">{hint}</div>}
    </motion.div>
  );
}

function Chip({
  active, onClick, children,
}: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs transition-all font-medium ${
        active ? "bg-cyan-400 text-[#0b1220] shadow-sm" : "bg-white/10 text-cyan-100 hover:bg-white/15"
      }`}
    >
      {children}
    </motion.button>
  );
}

function PersonCard({ e }: { e: EmployeeRow }) {
  return (
    <motion.li
      whileHover={{ scale: 1.02, y: -1 }}
      className="p-4 rounded-2xl border border-white/10 bg-white/8 flex items-center justify-between group transition-all duration-300 hover:shadow-[0_12px_36px_rgba(0,0,0,.35)] glow-border-soft"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl grid place-items-center bg-gradient-to-br from-cyan-400 to-indigo-500 text-[#0b1220] shadow-md">
          <UsersIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold text-cyan-50">
            {e.first_name} {e.last_name}
          </div>
          <div className="text-xs text-cyan-200/70">{e.email || "—"}</div>
        </div>
      </div>
      <Link
        href={`/personnel/view/${e.id}`}
        className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-colors"
      >
        جزئیات →
      </Link>
    </motion.li>
  );
}

/* ─────────────── Page ─────────────── */
export default function Dashboard() {
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [errEmp, setErrEmp] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [filter, setFilter] = useState<"all" | "withEmail" | "noEmail">("all");

  async function loadEmployees() {
    try {
      setErrEmp(null);
      setLoadingEmp(true);
      const r = await fetch("/api/employees", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setEmployees(Array.isArray(j) ? j : []);
    } catch (e: any) {
      setErrEmp(e?.message || "خطا در دریافت داده");
    } finally {
      setLoadingEmp(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const total = employees.length;

  const latest = useMemo(
    () =>
      [...employees]
        .sort(
          (a, b) =>
            new Date(b?.created_at ?? 0).getTime() -
            new Date(a?.created_at ?? 0).getTime(),
        )
        .slice(0, 10),
    [employees],
  );

  const filteredLatest = useMemo(
    () => {
      let list = latest;
      if (filter === "withEmail") list = list.filter((x) => x.email);
      if (filter === "noEmail") list = list.filter((x) => !x.email);
      if (q.trim()) {
        const k = q.trim().toLowerCase();
        list = list.filter((x) =>
          `${x.first_name} ${x.last_name} ${x.email || ""}`
            .toLowerCase()
            .includes(k),
        );
      }
      return list;
    },
    [latest, filter, q],
  );

  /* CSV export */
  function exportCSV() {
    const rows = [
      ["نام", "ایمیل", "تاریخ ایجاد"],
      ...filteredLatest.map((e) => [
        `${e.first_name} ${e.last_name}`,
        e.email || "",
        e.created_at || "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "latest_employees.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-cyan-50 relative"
      style={{
        background:
          "radial-gradient(120rem 70rem at 120% -10%, rgba(34,211,238,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(99,102,241,.18), transparent), #0b1220",
      }}
    >
      {/* خطوط مش‌بک‌گراند برای عمق بصری */}
      <div className="pointer-events-none absolute inset-0 opacity-[.10] [background:repeating-linear-gradient(90deg,rgba(255,255,255,.14)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(255,255,255,.10)_0_1px,transparent_1px_28px)]" />

      <div
        className="flex-1 p-4 md:p-8 gap-6 grid grid-cols-1 xl:grid-cols-12"
        style={{ paddingRight: expanded ? "280px" : "80px" }}
      >
        {/* ───────── Left rail: Search + Actions + Metrics ───────── */}
        <aside className="xl:col-span-3 space-y-4">
          {/* Search + quick actions */}
          <div className={`${GLASS} ${PANELBG} p-5 space-y-3`}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-300/80" />
              <Input
                placeholder="جستجو…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10 pr-3 bg-white/5 border-white/10 text-cyan-50 placeholder:text-cyan-200/50 focus:ring-cyan-400/50"
              />
            </div>
            <div className="flex gap-2">
              <Link href="/personnel/register" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220]">
                  <UserPlusIcon className="h-5 w-5 ml-2" />
                  ثبت پرسنل
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={loadEmployees}
                className="border-white/20"
                title="به‌روزرسانی"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <Metric
            title="تعداد کل پرسنل"
            value={loadingEmp ? "…" : total}
            hint={loadingEmp ? "" : `بروزرسانی: ${new Date().toLocaleTimeString("fa-IR")}`}
          />
          <div className="grid grid-cols-2 gap-3">
            <Metric title="درخواست‌ها" value="12" accent="from-rose-400 to-orange-400" />
            <Metric title="جلسات" value="3" accent="from-emerald-400 to-lime-400" />
          </div>

          {/* Quick links */}
          <div className={`${GLASS2} ${PANELBG2} p-4 space-y-3`}>
            <Link href="/personnel/list">
              <Button variant="outline" className="w-full border-white/20 text-cyan-50">
                پرونده‌های پرسنلی
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="w-full border-white/20 text-cyan-50">
                گزارش‌ها
              </Button>
            </Link>
          </div>
        </aside>

        {/* ───────── Center: Hero + Latest list ───────── */}
        <main className="xl:col-span-6 space-y-6">
          {/* Hero (Aurora panel) */}
          <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className={`${GLASS} ${PANELBG} relative overflow-hidden p-6`}
          >
            <style jsx>{`
              @keyframes aurora { 0% { transform: translateY(0)} 50% { transform: translateY(-8px)} 100% { transform: translateY(0)} }
            `}</style>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ animation: "aurora 12s ease-in-out infinite" }}
            >
              <svg width="100%" height="100%">
                <defs>
                  <linearGradient id="wave" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity=".18" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity=".14" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,120 C120,60 260,180 420,120 C600,60 760,140 1000,90 L1000,0 L0,0 Z"
                  fill="url(#wave)"
                />
              </svg>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-cyan-100">
                 سیستم مدیریت پرسنل سریر لجستیک
                </h1>
                <p className="text-cyan-200/70 text-sm mt-1">
                  دسترسی سریع، آمار زنده, آخرین تغییرات
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-cyan-200/70">
                  <BellIcon className="h-5 w-5" />
                  ۳ اعلان خوانده نشده
                </div>
                <Link href="/personnel/register">
                  <Button className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220]">
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                    شروع سریع
                  </Button>
                </Link>
              </div>
            </div>
          </motion.header>

          {/* Controls over list */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className={`${GLASS2} ${PANELBG2} p-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-cyan-300/80" />
              <Chip active={filter === "all"} onClick={() => setFilter("all")}>همه</Chip>
              <Chip active={filter === "withEmail"} onClick={() => setFilter("withEmail")}>دارای ایمیل</Chip>
              <Chip active={filter === "noEmail"} onClick={() => setFilter("noEmail")}>بدون ایمیل</Chip>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-white/20" onClick={exportCSV}>خروجی CSV</Button>
            </div>
          </motion.div>

          {/* Latest people list */}
          <motion.section
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className={`${GLASS} ${PANELBG} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-cyan-100">آخرین پرسنل ثبت‌شده</h3>
              <Link href="/personnel/list">
                <Button variant="outline" className="border-white/20 text-cyan-50">
                  <UsersIcon className="h-5 w-5 ml-2" />
                  مشاهده همه
                </Button>
              </Link>
            </div>
            {errEmp && <div className="text-rose-300 text-sm mb-4">{errEmp}</div>}
            {loadingEmp ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl bg-white/8 border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : filteredLatest.length === 0 ? (
              <div className="opacity-70">موردی یافت نشد.</div>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-3">
                {filteredLatest.map((e) => (
                  <PersonCard key={e.id} e={e} />
                ))}
              </ul>
            )}
          </motion.section>
        </main>

        {/* ───────── Right: Actions / Alerts ───────── */}
        <aside className="xl:col-span-3 space-y-4">
          <div className={`${GLASS} ${PANELBG} p-5`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-cyan-100">اقدامات امروز</h3>
              <ArrowPathIcon className="h-5 w-5 text-cyan-300/80" />
            </div>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="p-3 rounded-2xl bg-white/8 border border-white/10">تایید ۲ درخواست مرخصی</li>
              <li className="p-3 rounded-2xl bg-white/8 border border-white/10">ثبت قرارداد جدید واحد اداری</li>
              <li className="p-3 rounded-2xl bg-white/8 border border-white/10">بررسی تکمیل مدارک ۳ نفر</li>
            </ul>
          </div>

          <div className={`${GLASS} ${PANELBG} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <BellIcon className="h-5 w-5 text-cyan-300/80" />
              <h3 className="font-semibold text-cyan-100">اعلان‌ها</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="p-3 rounded-2xl bg-white/8 border border-white/10">تمدید بیمه ۵ نفر تا ۳۰ روز آینده</li>
              <li className="p-3 rounded-2xl bg-white/8 border border-white/10">ویرایش اطلاعات «مرجان خورشید نیها»</li>
              <li className="p-3 rounded-2xl bg-white/8 border border-white/10">ثبت درخواست اضافه‌کار</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
