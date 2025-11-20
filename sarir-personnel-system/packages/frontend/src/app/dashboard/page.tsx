"use client";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  UsersIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ArrowPathIcon,
  FunnelIcon,
  TruckIcon, // برای تم لجستیک
} from "@heroicons/react/24/solid";

/* ─────────────── تم لوکس و حرفه‌ای ۲۰۲۵ ─────────────── */
const GLASS = "backdrop-blur-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500";

const GLASS2 = "backdrop-blur-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/70 border border-cyan-500/20 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-cyan-400/50";

type EmployeeRow = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  created_at?: string;
};

/* ─────────────── 3D Tilt Effect ─────────────── */
const useTilt = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["-8deg", "8deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["8deg", "-8deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    mouseX.set((e.clientX - rect.left) / width - 0.5);
    mouseY.set((e.clientY - rect.top) / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
};

/* ─────────────── Small pieces ─────────────── */

function Metric({
  title,
  value,
  hint,
  accent = "from-cyan-400 to-indigo-500",
  href,
}: {
  title: string;
  value: string | number;
  hint?: string;
  accent?: string;
  href?: string;
}) {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();

  const content = (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
      className={`${GLASS2} p-6 relative overflow-hidden cursor-pointer`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10`} />
      <div className="text-sm text-cyan-200/80 font-semibold">{title}</div>
      <div className="text-5xl font-black tracking-tighter text-cyan-50 mt-2">{value}</div>
      {hint && <div className="text-xs opacity-70 mt-2 text-cyan-200/70">{hint}</div>}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        active ? "bg-cyan-400 text-[#0b1220] shadow-md" : "bg-white/10 text-cyan-100 hover:bg-white/20"
      }`}
    >
      {children}
    </motion.button>
  );
}

function PersonCard({ e }: { e: EmployeeRow }) {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();

  return (
    <motion.li
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
      className="p-5 rounded-2xl border border-white/15 bg-white/8 flex items-center justify-between group transition-all duration-300 glow-border-soft"
    >
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full grid place-items-center bg-gradient-to-br from-cyan-400 to-indigo-500 text-[#0b1220] shadow-md">
          <UsersIcon className="h-6 w-6" />
        </div>
        <div>
          <div className="font-bold text-cyan-50 text-lg">{e.first_name} {e.last_name}</div>
          <div className="text-sm text-cyan-200/70">{e.email || "—"}</div>
        </div>
      </div>
      <Link href={`/personnel/view/${e.id}`} className="text-cyan-300 group-hover:text-cyan-100 text-sm font-semibold transition-colors duration-200">
        جزئیات →
      </Link>
    </motion.li>
  );
}

/* ─────────────── Page ─────────────── */

export default function Dashboard() {
  const [q, setQ] = useState("");
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [errEmp, setErrEmp] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [filter, setFilter] = useState<"all" | "withEmail" | "noEmail">("all");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function loadEmployees() {
    try {
      setErrEmp(null);
      setLoadingEmp(true);
      const r = await fetch("/api/employees", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setEmployees(Array.isArray(j) ? j : []);
      setLastUpdated(new Date().toLocaleTimeString("fa-IR"));
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
            new Date(a?.created_at ?? 0).getTime()
        )
        .slice(0, 10),
    [employees]
  );

  const filteredLatest = useMemo(() => {
    let list = latest;
    if (filter === "withEmail") list = list.filter((x) => x.email);
    if (filter === "noEmail") list = list.filter((x) => !x.email);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter((x) =>
        `${x.first_name} ${x.last_name} ${x.email || ""}`
          .toLowerCase()
          .includes(k)
      );
    }
    return list;
  }, [latest, filter, q]);

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
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "latest_employees.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-cyan-50 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(150rem 90rem at 130% -20%, rgba(34,211,238,0.22), transparent), radial-gradient(120rem 80rem at -20% 130%, rgba(99,102,241,0.22), transparent), #0b1220",
      }}
    >
      {/* گرید پس‌زمینه */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "repeating-linear-gradient(90deg,rgba(255,255,255,0.16)_0_1px,transparent_1px_32px),repeating-linear-gradient(0deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_32px)",
        }}
      />

      <div className="flex-1 p-6 md:p-10 gap-8 grid grid-cols-1 lg:grid-cols-12">
        {/* ستون چپ (فیلتر و متریک‌ها) */}
        <aside suppressHydrationWarning className="lg:col-span-3 space-y-6">
          {/* جستجو + ثبت پرسنل + ریفرش */}
          <div className={`${GLASS} p-6 space-y-4`}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-cyan-300/80" />
              <Input
                placeholder="جستجو…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-12 pr-4 bg-white/5 border-white/10 text-cyan-50 placeholder:text-cyan-200/50 focus:ring-cyan-400/50"
              />
            </div>
            <div className="flex gap-3">
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

          {/* متریک‌ها */}
          <Metric
            title="تعداد کل پرسنل"
            value={loadingEmp ? "…" : total}
            hint={lastUpdated ? `بروزرسانی: ${lastUpdated}` : ""}
            href="/personnel/list"
          />
          <div className="grid grid-cols-2 gap-3">
            <Metric
              title="مدارک جدید"
              value="8"
              accent="from-rose-400 to-orange-400"
              href="/personnel/files"
            />
            <Metric
              title="جلسات و مجامع"
              value="3"
              accent="from-emerald-400 to-lime-400"
              href="/board/meetings"
            />
          </div>

          {/* پرونده‌ها / گزارش‌ها */}
          <div className={`${GLASS2} p-4 space-y-3`}>
            <Link href="/personnel/files">
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

        {/* ستون وسط (هدر و لیست) */}
        <main className="lg:col-span-6 space-y-6">
          {/* هدر نئونی */}
          <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className={`${GLASS} relative overflow-hidden p-6`}
          >
            <style jsx>{`
              @keyframes aurora {
                0% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
                100% { transform: translateY(0); }
              }
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
                <path d="M0,120 C120,60 260,180 420,120 C600,60 760,140 1000,90 L1000,0 L0,0 Z" fill="url(#wave)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-cyan-100">
                  سیستم مدیریت پرسنل سریر لجستیک
                </h1>
                <p className="text-cyan-200/70 text-sm mt-1">
                  دسترسی سریع، آمار زنده، آخرین تغییرات
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs text-cyan-100 shadow-sm">
                  <BellIcon className="h-4 w-4 text-cyan-300" />
                  ۳ اعلان جدید
                </div>
                <Link href="/personnel/list">
                  <Button className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220]">
                    <UsersIcon className="h-5 w-5 ml-2" />
                    مرکز پرونده‌های پرسنلی
                  </Button>
                </Link>
              </div>
            </div>
          </motion.header>

          {/* فیلتر + خروجی CSV */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className={`${GLASS2} p-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-cyan-300/80" />
              <Chip active={filter === "all"} onClick={() => setFilter("all")}>
                همه
              </Chip>
              <Chip
                active={filter === "withEmail"}
                onClick={() => setFilter("withEmail")}
              >
                دارای ایمیل
              </Chip>
              <Chip
                active={filter === "noEmail"}
                onClick={() => setFilter("noEmail")}
              >
                بدون ایمیل
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-white/20"
                onClick={exportCSV}
              >
                خروجی CSV
              </Button>
            </div>
          </motion.div>

          {/* لیست آخرین پرسنل */}
          <motion.section
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className={`${GLASS} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-cyan-100">
                آخرین پرسنل ثبت‌شده
              </h3>
              <Link href="/personnel/list">
                <Button
                  variant="outline"
                  className="border-white/20 text-cyan-50"
                >
                  مشاهده همه
                </Button>
              </Link>
            </div>
            {errEmp && (
              <div className="text-rose-300 text-sm mb-4">{errEmp}</div>
            )}
            {loadingEmp ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-2xl bg-white/8 border border-white/10 animate-pulse"
                  />
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

        {/* ستون راست: اقدامات امروز + اعلان‌ها */}
        <aside className="lg:col-span-3 space-y-6">
          <div className={`${GLASS} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-cyan-100 text-xl">اقدامات امروز</h3>
              <ArrowPathIcon className="h-6 w-6 text-cyan-300/80" />
            </div>
            <ul className="space-y-4 text-sm">
              <li className="p-4 rounded-2xl bg-white/10 border border-white/15 transition-all hover:bg-white/15 hover:border-cyan-400/50">
                بررسی تکمیل مدارک ۳ نفر
              </li>
              <li className="p-4 rounded-2xl bg-white/10 border border-white/15 transition-all hover:bg-white/15 hover:border-cyan-400/50">
                آپلود ۲ سند جدید در پرونده‌ها
              </li>
              <li className="p-4 rounded-2xl bg-white/10 border border-white/15 transition-all hover:bg-white/15 hover:border-cyan-400/50">
                ثبت قرارداد جدید واحد اداری
              </li>
            </ul>
          </div>

          <div className={`${GLASS} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <BellIcon className="h-6 w-6 text-cyan-300/80" />
              <h3 className="font-semibold text-cyan-100 text-xl">اعلان‌ها</h3>
            </div>
            <ul className="space-y-4 text-sm">
              <li className="p-4 rounded-2xl bg-white/10 border border-white/15 transition-all hover:bg-white/15 hover:border-cyan-400/50">
                تمدید بیمه ۵ نفر تا ۳۰ روز آینده
              </li>
              <li className="p-4 rounded-2xl bg-white/10 border border-white/15 transition-all hover:bg-white/15 hover:border-cyan-400/50">
                بارگذاری ۲ سند جدید در پرونده‌های پرسنلی
              </li>
              <li className="p-4 rounded-2xl bg-white/10 border border-white/15 transition-all hover:bg-white/15 hover:border-cyan-400/50">
                ویرایش اطلاعات «مرجان خورشید نیا»
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}