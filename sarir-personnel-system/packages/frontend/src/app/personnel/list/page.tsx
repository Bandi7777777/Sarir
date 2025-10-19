"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  UserIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  documents?: { complete: boolean; missing: string[] };
  insurance?: { status: "valid" | "expired" | "missing"; expiryDate?: string };
};

const EMPLOYEES_URL = "/api/employees";

/* ─────────────── Animations ─────────────── */
const rise = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 18, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};
const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};

export default function PersonnelList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "docs_missing" | "insurance_expired">("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // For mobile filter toggle

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
        const enhancedData = data.map((emp) => ({
          ...emp,
          documents: { complete: Math.random() > 0.3, missing: Math.random() > 0.5 ? ["کارت ملی", "شناسنامه", "گواهی عدم سوء پیشینه"] : [] },
          insurance: { status: Math.random() > 0.7 ? "valid" : Math.random() > 0.5 ? "expired" : "missing", expiryDate: new Date(Date.now() + Math.random() * 10000000000).toISOString().split('T')[0] },
        }));
        if (!cancelled) setRows(enhancedData);
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
    let list = base.filter((r) =>
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
    );

    if (filterStatus === "docs_missing") {
      list = list.filter((r) => !r.documents?.complete);
    } else if (filterStatus === "insurance_expired") {
      list = list.filter((r) => r.insurance?.status !== "valid");
    }

    return [...list].sort(
      (a, b) =>
        new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime(),
    );
  }, [rows, debounced, filterStatus]);

  const stats = useMemo(() => {
    const total = rows.length;
    const docsMissing = rows.filter((r) => !r.documents?.complete).length;
    const insuranceIssues = rows.filter((r) => r.insurance?.status !== "valid").length;
    const complianceRate = ((total - docsMissing - insuranceIssues) / total * 100).toFixed(1);
    return { total, docsMissing, insuranceIssues, complianceRate };
  }, [rows]);

  const barChartData = [
    { name: "کل", value: stats.total, fill: "#07657E" },
    { name: "مدارک", value: stats.docsMissing, fill: "#F2991F" },
    { name: "بیمه", value: stats.insuranceIssues, fill: "#1FB4C8" },
  ];

  const pieChartData = [
    { name: "کامل", value: stats.total - stats.docsMissing - stats.insuranceIssues, fill: "#07657E" },
    { name: "نواقص", value: stats.docsMissing + stats.insuranceIssues, fill: "#F2991F" },
  ];

  const notifyMissing = (employee: Employee) => {
    if (!employee.documents?.complete) {
      toast.error(`نواقص مدارک: ${employee.documents.missing.join(", ")}`);
    }
    if (employee.insurance?.status !== "valid") {
      toast.error(`بیمه: ${employee.insurance.status} (انقضا: ${employee.insurance?.expiryDate || "نامشخص"})`);
    }
  };

  const openDetailsModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  function exportCSV() {
    const rowsCSV = [
      ["نام", "نام خانوادگی", "کد", "سمت", "دپارتمان", "ایمیل", "تلفن", "مدارک", "نواقص", "بیمه", "انقضا"],
      ...filtered.map((m) => [
        m.first_name,
        m.last_name,
        m.emp_code || "",
        m.position || "",
        m.department || "",
        m.email || "",
        m.phone || "",
        m.documents?.complete ? "کامل" : "ناقص",
        m.documents?.missing.join(", ") || "",
        m.insurance?.status || "",
        m.insurance?.expiryDate || "",
      ]),
    ];
    const csv = rowsCSV.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "personnel.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("دانلود شد!");
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-turquoise-900 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120rem 70rem at 120% -10%, rgba(7,101,126,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(242,153,31,.18), transparent), #a0aec0",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[.08] [background:repeating-linear-gradient(90deg,rgba(0,0,0,.25)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(0,0,0,.2)_0_1px,transparent_1px_28px)]" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-sm border-b border-gray-200/30 shadow-sm bg-white/80 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0"
        >
          <div>
            <h1 className="text-2xl font-bold text-turquoise-900">
              پرسنل ({filtered.length})
            </h1>
            <p className="text-sm text-turquoise-600 mt-1">مدیریت و نظارت</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Button
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-300 btn-add"
              onClick={() => toast("در حال توسعه!")}
            >
              <UserPlusIcon className="h-4 w-4 mr-2" /> افزودن
            </Button>
            <Link href="/tools/import">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-300 btn-import">
                اکسل
              </Button>
            </Link>
          </div>
        </motion.header>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 bg-white/80 border-b border-gray-200/30 justify-between"
        >
          <div className="flex gap-3 flex-wrap md:flex-nowrap items-center order-2 md:order-1">
            <Button
              className="md:hidden text-turquoise-600 hover:text-turquoise-800 p-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-5 w-5" />
            </Button>
            <div className={`${showFilters ? 'flex' : 'hidden'} md:flex gap-2`}>
              <Chip active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>همه</Chip>
              <Chip active={filterStatus === "docs_missing"} onClick={() => setFilterStatus("docs_missing")}>مدارک</Chip>
              <Chip active={filterStatus === "insurance_expired"} onClick={() => setFilterStatus("insurance_expired")}>بیمه</Chip>
            </div>
            <Button
              className="text-turquoise-600 hover:text-turquoise-800 p-2 btn-refresh"
              onClick={() => toast("رفرش شد!")}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={exportCSV}
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-300 btn-export"
            >
              خروجی CSV
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-1 md:flex-none md:w-1/3 order-1 md:order-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-turquoise-600" />
            <Input
              placeholder="جستجو نام یا نقش..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white border border-turquoise-300 rounded-md p-2 text-turquoise-900 placeholder:text-turquoise-700 focus:outline-none focus:border-turquoise-500 text-sm font-bold"
            />
          </div>
        </motion.div>

        {/* Main Content: Stats and Charts in row for desktop, column for mobile */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col lg:flex-row gap-6 mb-6"
          >
            {/* Stats */}
            <motion.div variants={rise} className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-turquoise-50/50 border border-turquoise-100 shadow-inner">
                <h3 className="text-xs font-medium text-turquoise-700">کل پرسنل</h3>
                <p className="text-xl font-bold text-turquoise-900">{stats.total}</p>
              </div>
              <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-100 shadow-inner">
                <h3 className="text-xs font-medium text-rose-700">نواقص مدارک</h3>
                <p className="text-xl font-bold text-rose-900">{stats.docsMissing}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100 shadow-inner">
                <h3 className="text-xs font-medium text-amber-700">مشکلات بیمه</h3>
                <p className="text-xl font-bold text-amber-900">{stats.insuranceIssues}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50/50 border border-green-100 shadow-inner">
                <h3 className="text-xs font-medium text-green-700">نرخ انطباق</h3>
                <p className="text-xl font-bold text-green-900">{stats.complianceRate}%</p>
              </div>
            </motion.div>

            {/* Charts */}
            <motion.div variants={rise} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-white/50 rounded-lg p-2">
                <ResponsiveContainer>
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" stroke="#07657E" fontSize={12} />
                    <YAxis stroke="#07657E" fontSize={12} />
                    <Tooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="value" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-48 bg-white/50 rounded-lg p-2">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieChartData} dataKey="value" outerRadius={60} label={false}>
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>

          {/* Employee List */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-32 rounded-xl" />
              ))}
            </div>
          )}
          {err && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm shadow-sm m-4">
              خطا: {err}
            </div>
          )}

          {!loading && !err && (
            <motion.section
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="p-4"
            >
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-turquoise-600">
                  موردی یافت نشد.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filtered.map((e) => (
                      <motion.div
                        key={e.id ?? `${e.first_name}-${e.email}`}
                        variants={listItemVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        layout
                        whileHover={{ scale: 1.02, boxShadow: "0 6px 16px rgba(7,101,126,0.1)" }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        className="p-4 rounded-xl border border-gray-200/50 bg-white/80 flex flex-col gap-2 hover:bg-white/90 transition-all duration-300 shadow-sm"
                        onClick={() => openDetailsModal(e)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-turquoise-50 grid place-items-center shadow-inner">
                            <UserIcon className="h-5 w-5 text-turquoise-600" />
                          </div>
                          <div>
                            <div className="font-medium text-turquoise-900 text-sm">
                              {e.first_name} {e.last_name}
                            </div>
                            <div className="text-xs text-turquoise-600">
                              {e.position || "—"} • {e.department || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <DocumentTextIcon className={`h-4 w-4 ${e.documents?.complete ? "text-green-500" : "text-red-500"}`} />
                          <ShieldCheckIcon className={`h-4 w-4 ${e.insurance?.status === "valid" ? "text-green-500" : "text-red-500"}`} />
                        </div>
                        <div className="flex gap-2 text-xs mt-2">
                          <Link href={`/personnel/view/${e.id}`} className="text-turquoise-600 hover:text-turquoise-800">
                            جزئیات
                          </Link>
                          <Link href={`/personnel/edit/${e.id}`} className="text-orange-500 hover:text-orange-600">
                            ویرایش
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDetailsModal && selectedEmployee && (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={modalVariants}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
          >
            <div className="bg-white p-6 rounded-xl shadow-md w-80 max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-turquoise-900">جزئیات نواقص</h2>
                <Button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700 p-1">
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-3 text-sm text-turquoise-800">
                <p><span className="font-medium">نام:</span> {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                <p><span className="font-medium">مدارک:</span> {selectedEmployee.documents?.complete ? "کامل" : selectedEmployee.documents?.missing.join(", ")}</p>
                <p><span className="font-medium">بیمه:</span> {selectedEmployee.insurance?.status} (انقضا: {selectedEmployee.insurance?.expiryDate || "نامشخص"})</p>
              </div>
              <Button
                onClick={() => { setShowDetailsModal(false); notifyMissing(selectedEmployee); }}
                className="w-full mt-4 bg-turquoise-500 text-white rounded-lg py-2 text-sm transition-all btn-reminder"
              >
                ارسال یادآوری
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      whileHover={{ scale: 1.05, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-md"
          : "bg-gray-300 text-turquoise-900 hover:bg-gray-400 hover:shadow-md"
      }`}
    >
      {children}
    </motion.button>
  );
}