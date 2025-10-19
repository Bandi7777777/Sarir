"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ─────────────── Theme helpers ─────────────── */
const GLASS = "backdrop-blur-xl border border-gray-400 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,.25)] glow-border";
const GLASS2 = "backdrop-blur-xl border border-gray-400 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,.2)] glow-border-soft";
const PANELBG = "bg-white/40 dark:bg-gray-900/60";
const PANELBG2 = "bg-white/30 dark:bg-gray-900/50";

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

/* ─────────────── Types ─────────────── */
type Driver = {
  id?: number | string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  plate?: string | null;
  created_at?: string | null;
};

const API_URL = "/api/drivers";

/* ─────────────── Modal Components ─────────────── */
function EditModal({ isOpen, onClose, driver }: { isOpen: boolean; onClose: () => void; driver: Driver | null }) {
  if (!isOpen || !driver) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ویرایش ذخیره شد! (placeholder)");
    onClose();
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={modalVariants}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/90 p-6 rounded-xl shadow-2xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-turquoise-900">ویرایش راننده</h2>
          <Button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Input defaultValue={driver.first_name || ""} placeholder="نام" className="mb-4" />
          <Input defaultValue={driver.last_name || ""} placeholder="نام خانوادگی" className="mb-4" />
          <Input defaultValue={driver.phone || ""} placeholder="شماره تماس" className="mb-4" />
          <Input defaultValue={driver.plate || ""} placeholder="پلاک" className="mb-4" />
          <Button type="submit" className="w-full bg-gradient-to-r from-turquoise-400 to-orange-500 text-white">
            ذخیره تغییرات
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={modalVariants}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/90 p-6 rounded-xl shadow-2xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-turquoise-900">تایید حذف</h2>
          <Button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <p className="mb-4 text-turquoise-800">آیا مطمئن هستید که می‌خواهید این راننده را حذف کنید؟</p>
        <div className="flex gap-4">
          <Button onClick={onClose} className="flex-1 bg-gray-300 text-gray-900 hover:bg-gray-400">
            لغو
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 text-white hover:bg-red-600">
            حذف
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Small pieces ─────────────── */
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
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-md"
          : "bg-gray-300 text-turquoise-900 hover:bg-gray-400 hover:shadow-md"
      }`}
      aria-label={children.toString()}
    >
      {children}
    </motion.button>
  );
}

function DriverCard({ driver, onEdit, onDelete }: { driver: Driver; onEdit: () => void; onDelete: () => void }) {
  const fullName = `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim() || "نامشخص";
  return (
    <motion.li
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 12, ease: "easeInOut" }}
      className="p-6 rounded-2xl border border-gray-400 bg-white/40 flex items-center justify-between group hover:bg-white/50 transition-all duration-300 glow-border-soft"
      data-tooltip-id={`tooltip-${driver.id}`}
      aria-label={`کارت راننده: ${fullName}`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="size-12 rounded-xl grid place-items-center bg-gradient-to-br from-turquoise-400 to-orange-500 text-white shadow-lg"
        >
          <TruckIcon className="h-6 w-6" />
        </motion.div>
        <div>
          <div className="font-bold text-turquoise-900 text-lg">{fullName}</div>
          <div className="text-sm opacity-70 text-turquoise-800">{driver.phone || "—"}</div>
          <div className="text-xs opacity-60 text-turquoise-700">{driver.plate || "—"}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="p-2 rounded-full bg-transparent text-turquoise-600 hover:text-turquoise-900 hover:bg-turquoise-200/80 transition-all duration-300"
          onClick={onEdit}
          aria-label={`ویرایش راننده: ${fullName}`}
        >
          <PencilIcon className="h-5 w-5" />
        </Button>
        <Button
          className="p-2 rounded-full bg-transparent text-red-600 hover:text-red-900 hover:bg-red-200/80 transition-all duration-300"
          onClick={onDelete}
          aria-label={`حذف راننده: ${fullName}`}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
        <Link
          href={`/drivers/view/${driver.id}`}
          className="text-turquoise-600 hover:text-orange-500 font-semibold transition-colors"
          aria-label={`جزئیات راننده: ${fullName}`}
        >
          جزئیات →
        </Link>
      </div>
      <ReactTooltip
        id={`tooltip-${driver.id}`}
        place="top"
        content={`پلاک: ${driver.plate || "موجود نیست"}`}
        className="bg-gray-800 text-white p-2 rounded-md"
      />
    </motion.li>
  );
}

/* ─────────────── Stats Card ─────────────── */
function StatsCard({ drivers }: { drivers: Driver[] }) {
  const stats = useMemo(() => {
    const total = drivers.length;
    const withPlate = drivers.filter(d => d.plate).length;
    return { total, withPlate, withoutPlate: total - withPlate };
  }, [drivers]);

  const barChartData = [
    { name: "کل", value: stats.total, fill: "#07657E" },
    { name: "با پلاک", value: stats.withPlate, fill: "#F2991F" },
    { name: "بدون پلاک", value: stats.withoutPlate, fill: "#1FB4C8" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${GLASS2} ${PANELBG2} p-6 flex flex-col md:flex-row gap-4 justify-around`}
    >
      <div className="flex items-center gap-3">
        <ChartBarIcon className="h-8 w-8 text-turquoise-600" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">{stats.total}</div>
          <div className="text-sm text-turquoise-700">تعداد رانندگان</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TruckIcon className="h-8 w-8 text-orange-500" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">{stats.withPlate}</div>
          <div className="text-sm text-turquoise-700">با پلاک</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">{stats.withoutPlate}</div>
          <div className="text-sm text-turquoise-700">بدون پلاک</div>
        </div>
      </div>
      <div className="h-32 w-full md:w-48">
        <ResponsiveContainer>
          <BarChart data={barChartData}>
            <XAxis dataKey="name" stroke="#07657E" fontSize={12} />
            <YAxis stroke="#07657E" fontSize={12} />
            <Tooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
            <Bar dataKey="value" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ─────────────── Page ─────────────── */
export default function DriverList() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DriverListContent />
    </QueryClientProvider>
  );
}

function DriverListContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "plate" | "no-plate">("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: rows = [], isLoading, error } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (error) toast.error(error.message || "خطا در دریافت داده");
  }, [error]);

  const debounced = useDebounced(searchTerm, 300);

  const filtered = useMemo(() => {
    const base = rows;
    const k = debounced.trim().toLowerCase();
    let list = base.filter((d) => {
      const s = [d.first_name ?? "", d.last_name ?? "", d.phone ?? "", d.plate ?? ""].join(" ").toLowerCase();
      return s.includes(k);
    });

    if (filterType === "plate") list = list.filter((d) => d.plate);
    if (filterType === "no-plate") list = list.filter((d) => !d.plate);

    return list.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
  }, [debounced, rows, filterType]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  function exportCSV() {
    const rowsCSV = [
      ["نام", "نام خانوادگی", "شماره تماس", "پلاک"],
      ...filtered.map((d) => [
        d.first_name || "",
        d.last_name || "",
        d.phone || "",
        d.plate || "",
      ]),
    ];
    const csv = rowsCSV.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "drivers.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("دانلود شد!");
  }

  function openEditModal(driver: Driver) {
    setSelectedDriver(driver);
    setEditModalOpen(true);
  }

  function openDeleteModal(driver: Driver) {
    setSelectedDriver(driver);
    setDeleteModalOpen(true);
  }

  function handleDeleteConfirm() {
    toast.error("راننده حذف شد! (placeholder)");
    setDeleteModalOpen(false);
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

      <div className="flex-1 p-6 md:p-8 gap-6 overflow-hidden flex flex-col">
        <motion.header
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 p-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-turquoise-900">
              لیست رانندگان ({filtered.length})
            </h1>
            <p className="text-sm text-turquoise-600 mt-1">مدیریت و نظارت</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-300 btn-add"
              onClick={() => toast("در حال توسعه!")}
            >
              <TruckIcon className="h-4 w-4 mr-2" /> افزودن راننده
            </Button>
          </div>
        </motion.header>

        <StatsCard drivers={filtered} />

        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 p-3 flex items-center gap-3"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-turquoise-600" />
          <Input
            placeholder="جستجو نام، نام خانوادگی، پلاک..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none text-turquoise-900 placeholder:text-turquoise-500 focus:outline-none text-sm"
          />
          <div className="flex gap-2">
            <Chip active={filterType === "all"} onClick={() => setFilterType("all")}>همه</Chip>
            <Chip active={filterType === "plate"} onClick={() => setFilterType("plate")}>با پلاک</Chip>
            <Chip active={filterType === "no-plate"} onClick={() => setFilterType("no-plate")}>بدون پلاک</Chip>
          </div>
          <Button
            className="text-turquoise-600 hover:text-turquoise-800 p-1 btn-refresh"
            onClick={() => toast("رفرش شد!")}
          >
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
          <Button
            onClick={exportCSV}
            className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white rounded-lg py-2 px-4 text-sm shadow-sm transition-all duration-300 btn-export"
          >
            خروجی CSV
          </Button>
        </motion.div>

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm shadow-sm">
            خطا: {error.message}
          </div>
        )}

        {!isLoading && !error && (
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="flex-1 overflow-y-auto space-y-6"
          >
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-turquoise-600">
                موردی یافت نشد.
              </div>
            ) : (
              <motion.ul variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {paginated.map((d) => (
                    <DriverCard
                      key={d.id ?? `${d.first_name}-${d.phone}`}
                      driver={d}
                      onEdit={() => openEditModal(d)}
                      onDelete={() => openDeleteModal(d)}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  قبلی
                </Button>
                <span>صفحه {currentPage} از {totalPages}</span>
                <Button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  بعدی
                </Button>
              </div>
            )}
          </motion.section>
        )}
      </div>

      <EditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} driver={selectedDriver} />
      <DeleteModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} />
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