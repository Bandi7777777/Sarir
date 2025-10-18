"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
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

/* ─────────────── Animations ─────────────── */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* ─────────────── Small pieces ─────────────── */
function Metric({
  title, value, hint, accent = "from-cyan-400 to-indigo-500",
}: { title: string; value: string | number; hint?: string; accent?: string }) {
  return (
    <motion.div
      variants={fadeIn}
      whileHover={{ scale: 1.05, y: -4 }}
      className={`${GLASS2} ${PANELBG2} p-6 relative overflow-hidden cursor-pointer transition-all duration-500`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10 animate-gradient-bg`} />
      <div className="relative z-10">
        <div className="text-sm text-cyan-200/80 font-medium uppercase tracking-wide">{title}</div>
        <div className="text-5xl font-black tracking-tight text-cyan-50 mt-2">{value}</div>
        {hint && <div className="text-sm opacity-70 mt-3 text-cyan-200/80">{hint}</div>}
      </div>
    </motion.div>
  );
}

function Chip({
  active, onClick, children,
}: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-lg"
          : "bg-white/10 text-cyan-100 hover:bg-white/20"
      }`}
    >
      {children}
    </motion.button>
  );
}

function PersonCard({ e }: { e: EmployeeRow }) {
  return (
    <motion.li
      variants={fadeIn}
      whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      className="p-6 rounded-3xl border border-white/10 bg-white/10 flex items-center justify-between group transition-all duration-500 hover:bg-white/20 glow-border-soft"
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="size-14 rounded-2xl grid place-items-center bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-xl"
        >
          <UsersIcon className="h-7 w-7" />
        </motion.div>
        <div>
          <div className="font-bold text-cyan-50 text-xl">{e.first_name} {e.last_name}</div>
          <div className="text-sm opacity-80 text-cyan-200">{e.email || "—"}</div>
          <div className="text-xs opacity-60 text-cyan-300">ثبت: {new Date(e.created_at || "").toLocaleDateString("fa-IR")}</div>
        </div>
      </div>
      <Link
        href={`/personnel/view/${e.id}`}
        className="text-cyan-300 hover:text-indigo-400 text-lg font-bold transition-colors"
      >
        → جزئیات
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
      toast.success("داده‌ها بروزرسانی شد!");
    } catch (e: any) {
      setErrEmp(e?.message || "خطا در دریافت داده");
      toast.error("خطا در بارگذاری");
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
    toast.success("فایل CSV دانلود شد");
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

      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      <div
        className="flex-1 p-4 md:p-8 gap-6 grid grid-cols-1 xl:grid-cols-12"
        style={{ paddingRight: expanded ? "280px" : "80px" }}
      >
        {/* ───────── Left rail: Search + Actions + Metrics ───────── */}
        <aside className="xl:col-span-3 space-y-6">
          {/* Search + quick actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            className={`${GLASS} ${PANELBG} p-6 space-y-4`}
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-cyan-300/80" />
              <Input
                placeholder="جستجو در پرسنل..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-16 pr-4 py-4 bg-white/5 border-white/10 text-cyan-50 placeholder:text-cyan-200/50 focus:ring-cyan-400/50 rounded-2xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/personnel/register">
                <Button className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] shadow-lg hover:shadow-xl">
                  <UserPlusIcon className="h-5 w-5 mr-2" /> ثبت
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={loadEmployees}
                className="border-white/20 text-cyan-50 hover:bg-white/10"
                title="به‌روزرسانی"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          {/* Metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 80 }}
            className="space-y-4"
          >
            <Metric
              title="تعداد کل پرسنل"
              value={loadingEmp ? "…" : total}
              hint={loadingEmp ? "" : `به‌روزرسانی: ${new Date().toLocaleTimeString("fa-IR")}`}
            />
            <div className="grid grid-cols-2 gap-4">
              <Metric title="درخواست‌ها" value="12" accent="from-rose-400 to-orange-400" />
              <Metric title="جلسات" value="3" accent="from-emerald-400 to-lime-400" />
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 80 }}
            className={`${GLASS2} ${PANELBG2} p-6 space-y-4`}
          >
            <Link href="/personnel/list">
              <Button variant="outline" className="w-full border-white/20 text-cyan-50 hover:bg-white/10">
                پرونده‌های پرسنلی
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="w-full border-white/20 text-cyan-50 hover:bg-white/10">
                گزارش‌ها
              </Button>
            </Link>
          </motion.div>
        </aside>

        {/* ───────── Center: Hero + Latest list ───────── */}
        <main className="xl:col-span-6 space-y-6">
          {/* Hero (Aurora panel) */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
            className={`${GLASS} ${PANELBG} relative overflow-hidden p-8`}
          >
            <style jsx>{`
              @keyframes aurora { 0% { transform: translateY(0)} 50% { transform: translateY(-10px)} 100% { transform: translateY(0)} }
            `}</style>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ animation: "aurora 12s ease-in-out infinite" }}
            >
              <svg width="100%" height="100%">
                <defs>
                  <linearGradient id="wave" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#07657E" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#F2991F" stopOpacity=".2" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,150 C150,50 300,200 450,120 C600,50 750,150 900,100 L900,0 L0,0 Z"
                  fill="url(#wave)"
                />
              </svg>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-turquoise-100 neon-text">
                  داشبورد پرسنل
                </h1>
                <p className="text-turquoise-200/80 text-xl mt-3">مدیریت هوشمند و جامع</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-lg text-turquoise-200/80">
                  <BellIcon className="h-8 w-8 animate-glow-border" />
                  ۳ اعلان
                </div>
                <Link href="/personnel/register">
                  <Button className="bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-lg hover:shadow-xl px-8 py-4 rounded-xl">
                    <ArrowRightIcon className="h-6 w-6 mr-3" /> شروع سریع
                  </Button>
                </Link>
              </div>
            </div>
          </motion.header>

          {/* Controls over list */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 80 }}
            className={`${GLASS2} ${PANELBG2} p-8 flex items-center justify-between`}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-cyan-300/80" />
                <Input
                  placeholder="جستجو در پرسنل..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-20 pr-5 py-4 bg-white/10 border-white/20 text-cyan-50 placeholder:text-cyan-200/80 focus:border-cyan-400/50 focus:ring-cyan-400/50 rounded-2xl"
                />
              </div>
              <div className="flex items-center gap-3">
                <FunnelIcon className="h-7 w-7 text-cyan-300/80" />
                <Chip active={filter === "all"} onClick={() => setFilter("all")}>همه</Chip>
                <Chip active={filter === "withEmail"} onClick={() => setFilter("withEmail")}>دارای ایمیل</Chip>
                <Chip active={filter === "noEmail"} onClick={() => setFilter("noEmail")}>بدون ایمیل</Chip>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl"
              onClick={exportCSV}
            >
              خروجی CSV
            </Button>
          </motion.div>

          {/* Latest people list */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className={`${GLASS} ${PANELBG} p-8`}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-cyan-100">آخرین پرسنل ثبت‌شده</h3>
              <Link href="/personnel/list">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl"
                >
                  <UsersIcon className="h-6 w-6 mr-3" /> مشاهده همه
                </Button>
              </Link>
            </div>
            {errEmp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-rose-300 text-lg p-6 mb-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl"
              >
                {errEmp}
              </motion.div>
            )}
            {loadingEmp ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-32 rounded-3xl bg-white/10 border border-white/10 animate-pulse-glow"
                  />
                ))}
              </motion.div>
            ) : filteredLatest.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-cyan-200/70 text-xl"
              >
                موردی یافت نشد.
              </motion.div>
            ) : (
              <motion.ul variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredLatest.map((e) => (
                  <PersonCard key={e.id} e={e} />
                ))}
              </motion.ul>
            )}
          </motion.section>
        </main>

        {/* ───────── Right: Actions / Alerts ───────── */}
        <aside className="xl:col-span-3 space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 80 }}
            className={`${GLASS} ${PANELBG} p-8`}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-cyan-100">اقدامات امروز</h3>
              <ArrowPathIcon className="h-8 w-8 text-cyan-300/80 animate-glow-border" />
            </div>
            <ul className="space-y-6 text-xl">
              <li className="p-8 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer glow-border-soft">
                تایید ۲ درخواست مرخصی
              </li>
              <li className="p-8 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer glow-border-soft">
                ثبت قرارداد جدید واحد اداری
              </li>
              <li className="p-8 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer glow-border-soft">
                بررسی تکمیل مدارک ۳ نفر
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 80 }}
            className={`${GLASS} ${PANELBG} p-8`}
          >
            <div className="flex items-center gap-4 mb-8">
              <BellIcon className="h-8 w-8 text-cyan-300/80 animate-glow-border" />
              <h3 className="text-3xl font-bold text-cyan-100">اعلان‌ها</h3>
            </div>
            <ul className="space-y-6 text-xl">
              <li className="p-8 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer glow-border-soft">
                تمدید بیمه ۵ نفر تا ۳۰ روز آینده
              </li>
              <li className="p-8 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer glow-border-soft">
                ویرایش اطلاعات «مرجان خورشید نیها»
              </li>
              <li className="p-8 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer glow-border-soft">
                ثبت درخواست اضافه‌کار
              </li>
            </ul>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}