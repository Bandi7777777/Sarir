"use client";

import {
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ListPageLayout } from "@/components/layouts/ListPageLayout";
import { FilterBar } from "@/components/list/FilterBar";
import { ListActionBar } from "@/components/list/ListActionBar";
import { TableShell } from "@/components/list/TableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Driver = {
  id?: number | string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  plate?: string | null;
  created_at?: string | null;
};

const API_URL = "/api/drivers";
const queryClient = new QueryClient();

export default function DriverList() {
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

  const { data: rows = [], isLoading, error, refetch } = useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (error) toast.error(error.message || "خطا در دریافت اطلاعات");
  }, [error]);

  const debounced = useDebounced(searchTerm, 300);

  const filtered = useMemo(() => {
    const k = debounced.trim().toLowerCase();
    let list = rows.filter((d) => {
      const s = [d.first_name ?? "", d.last_name ?? "", d.phone ?? "", d.plate ?? ""]
        .join(" ")
        .toLowerCase();
      return s.includes(k);
    });

    if (filterType === "plate") list = list.filter((d) => d.plate);
    if (filterType === "no-plate") list = list.filter((d) => !d.plate);

    return list.sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
  }, [debounced, rows, filterType]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  function exportCSV() {
    const rowsCSV = [
      ["نام", "نام خانوادگی", "شماره تماس", "پلاک"],
      ...filtered.map((d) => [d.first_name || "", d.last_name || "", d.phone || "", d.plate || ""]),
    ];
    const csv = rowsCSV.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "drivers.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("خروجی CSV آماده شد");
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
    toast.error("حذف در حال پیاده‌سازی است (placeholder)");
    setDeleteModalOpen(false);
  }

  const toolbar = (
    <FilterBar>
      <div className="flex flex-1 items-center gap-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="جستجو در نام، تلفن یا پلاک..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-xl"
          dir="rtl"
        />
      </div>
      <ListActionBar>
        <Chip active={filterType === "all"} onClick={() => setFilterType("all")}>
          همه
        </Chip>
        <Chip active={filterType === "plate"} onClick={() => setFilterType("plate")}>
          دارای پلاک
        </Chip>
        <Chip active={filterType === "no-plate"} onClick={() => setFilterType("no-plate")}>
          بدون پلاک
        </Chip>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          بروزرسانی
        </Button>
        <Button size="sm" onClick={exportCSV}>
          خروجی CSV
        </Button>
      </ListActionBar>
    </FilterBar>
  );

  return (
    <div dir="rtl">
      <ListPageLayout
        title="لیست رانندگان"
        description="مدیریت اطلاعات رانندگان و وضعیت پلاک‌ها"
        actions={
          <Button asChild size="sm">
            <Link href="/drivers/register">ثبت راننده جدید</Link>
          </Button>
        }
        toolbar={toolbar}
      >
        <StatsCard drivers={filtered} />

        <TableShell>
          <div className="space-y-4 p-4">
            {isLoading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                خطا: {error.message}
              </div>
            )}

            {!isLoading && !error && (
              <div className="space-y-6">
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                    راننده‌ای پیدا نشد.
                  </div>
                ) : (
                  <motion.ul
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
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
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      قبلی
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      صفحه {currentPage} از {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      بعدی
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TableShell>

        <EditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} driver={selectedDriver} />
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </ListPageLayout>
    </div>
  );
}

function DriverCard({ driver, onEdit, onDelete }: { driver: Driver; onEdit: () => void; onDelete: () => void }) {
  const fullName = `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim() || "نامشخص";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
      data-tooltip-id={`tooltip-${driver.id}`}
      aria-label={`راننده: ${fullName}`}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
          <TruckIcon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-semibold text-foreground">{fullName}</div>
          <div className="text-sm text-muted-foreground">{driver.phone || "-"}</div>
          <div className="text-xs text-muted-foreground/80">پلاک: {driver.plate || "-"}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`ویرایش: ${fullName}`}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={`حذف: ${fullName}`}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
        <Button asChild variant="link" size="sm" className="px-0 text-primary">
          <Link href={`/drivers/view/${driver.id}`}>مشاهده</Link>
        </Button>
      </div>
      <ReactTooltip
        id={`tooltip-${driver.id}`}
        place="top"
        content={`پلاک: ${driver.plate || "ثبت نشده"}`}
        className="bg-gray-800 text-white p-2 rounded-md"
      />
    </motion.li>
  );
}

function EditModal({
  isOpen,
  onClose,
  driver,
}: {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
}) {
  if (!isOpen || !driver) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ویرایش راننده ثبت شد (placeholder)");
    onClose();
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={modalVariants}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-96 rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">ویرایش راننده</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <span aria-hidden>×</span>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input defaultValue={driver.first_name || ""} placeholder="نام" />
          <Input defaultValue={driver.last_name || ""} placeholder="نام خانوادگی" />
          <Input defaultValue={driver.phone || ""} placeholder="شماره تماس" />
          <Input defaultValue={driver.plate || ""} placeholder="پلاک" />
          <Button type="submit" className="w-full">
            ثبت ویرایش
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={modalVariants}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-96 rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">حذف راننده</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <span aria-hidden>×</span>
          </Button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">آیا از حذف این راننده مطمئن هستید؟</p>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            انصراف
          </Button>
          <Button onClick={onConfirm} variant="destructive" className="flex-1">
            حذف
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function StatsCard({ drivers }: { drivers: Driver[] }) {
  const stats = useMemo(() => {
    const total = drivers.length;
    const withPlate = drivers.filter((d) => d.plate).length;
    return { total, withPlate, withoutPlate: total - withPlate };
  }, [drivers]);

  const barChartData = [
    { name: "کل", value: stats.total, fill: "#07657E" },
    { name: "دارای پلاک", value: stats.withPlate, fill: "#F2991F" },
    { name: "فاقد پلاک", value: stats.withoutPlate, fill: "#1FB4C8" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4 rounded-xl border bg-card/80 p-4 shadow-sm lg:grid-cols-4"
    >
      <StatTile icon={<ChartBarIcon className="h-6 w-6 text-primary" />} title="کل رانندگان" value={stats.total} />
      <StatTile icon={<TruckIcon className="h-6 w-6 text-amber-500" />} title="دارای پلاک" value={stats.withPlate} />
      <StatTile
        icon={<ExclamationCircleIcon className="h-6 w-6 text-sky-500" />}
        title="فاقد پلاک"
        value={stats.withoutPlate}
      />
      <div className="h-28 w-full">
        <ResponsiveContainer>
          <BarChart data={barChartData}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
            <Bar dataKey="value" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function StatTile({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/80 p-3">
      <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-lg font-semibold text-foreground">{value.toLocaleString("fa-IR")}</div>
      </div>
    </div>
  );
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
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

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
