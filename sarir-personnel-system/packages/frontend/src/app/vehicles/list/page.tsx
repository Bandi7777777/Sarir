// packages/frontend/src/app/vehicles/list/page.tsx
"use client";

import "@/lib/leaflet-fix"; // keep SSR-safe leaflet setup
import {
  ArrowPathIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ListPageLayout } from "@/components/layouts/ListPageLayout";
import { FilterBar } from "@/components/list/FilterBar";
import { ListActionBar } from "@/components/list/ListActionBar";
import { ListHeader } from "@/components/list/ListHeader";
import { TableShell } from "@/components/list/TableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------------- Leaflet dynamic imports (SSR safe) ---------------- */
const MapContainer = dynamic<any>(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic<any>(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic<any>(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic<any>(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const MarkerClusterGroup = dynamic<any>(
  () => import("react-leaflet-cluster").then((m) => m.default),
  { ssr: false }
);

/* ---------------- Theme helpers ---------------- */
const GLASS2 =
  "backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,.08)]";
const PANELBG2 = "bg-card/80";

/* ---------------- Animations ---------------- */
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/* ---------------- Types ---------------- */
type Vehicle = {
  id?: number | string | null;
  model?: string | null;
  plate?: string | null;
  chassis_number?: string | null;
  driver_id?: number | null;
  created_at?: string | null;
  status?: "active" | "maintenance" | "inactive";
  latitude?: number;
  longitude?: number;
};

const API_URL = "/api/vehicles";

/* ---------------- Modals ---------------- */
function EditModal({
  isOpen,
  onClose,
  vehicle,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}) {
  if (!isOpen || !vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ویرایش انجام شد! (placeholder)");
    onClose();
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-96 rounded-xl bg-white/95 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">ویرایش وسیله</h2>
          <Button onClick={onClose} variant="ghost" size="icon-sm">
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input defaultValue={vehicle.model || ""} placeholder="مدل" />
          <Input defaultValue={vehicle.plate || ""} placeholder="پلاک" />
          <Input defaultValue={vehicle.chassis_number || ""} placeholder="شماره شاسی" />
          <Input defaultValue={vehicle.driver_id || ""} placeholder="شناسه راننده" type="number" />
          <select
            defaultValue={vehicle.status || "active"}
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
          >
            <option value="active">فعال</option>
            <option value="maintenance">در تعمیر</option>
            <option value="inactive">غیرفعال</option>
          </select>
          <Input
            defaultValue={vehicle.latitude || ""}
            placeholder="عرض جغرافیایی"
            type="number"
            step="0.000001"
          />
          <Input
            defaultValue={vehicle.longitude || ""}
            placeholder="طول جغرافیایی"
            type="number"
            step="0.000001"
          />
          <Button type="submit" className="w-full">
            ذخیره تغییرات
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
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-96 rounded-xl bg-white/95 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">حذف مورد</h2>
          <Button onClick={onClose} variant="ghost" size="icon-sm">
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          آیا مطمئنید می‌خواهید این وسیله نقلیه را حذف کنید؟
        </p>
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            خیر
          </Button>
          <Button onClick={onConfirm} variant="destructive" className="flex-1">
            بله، حذف شود
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Small pieces ---------------- */
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
      initial={false}
      whileHover={{ scale: 1.05, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-md"
          : "bg-muted text-foreground hover:bg-muted/80"
      }`}
      aria-label={children?.toString()}
    >
      {children}
    </motion.button>
  );
}

function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onZoom,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
  onZoom: () => void;
}) {
  const model = vehicle.model || "نامشخص";
  return (
    <motion.li
      initial={false}
      whileHover={{ scale: 1.02, y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm"
      data-tooltip-id={`tooltip-${vehicle.id}`}
      aria-label={`کارت وسیله: ${model}`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={false}
          whileHover={{ rotate: 360, scale: 1.05 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg"
        >
          <TruckIcon className="h-6 w-6" />
        </motion.div>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-foreground">{model}</div>
          <div className="text-sm text-muted-foreground">{vehicle.plate || "-"}</div>
          <div className="text-xs text-muted-foreground">شاسی: {vehicle.chassis_number || "-"}</div>
          <div className="text-xs text-muted-foreground">راننده: {vehicle.driver_id || "-"}</div>
          <div className="text-xs text-muted-foreground">وضعیت: {vehicle.status || "-"}</div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`ویرایش ${model}`}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={`حذف ${model}`}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onZoom}
          aria-label={`نمایش روی نقشه ${model}`}
          disabled={!vehicle.latitude || !vehicle.longitude}
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </Button>
        <Button asChild variant="ghost" size="sm" aria-label={`مشاهده ${model}`}>
          <Link href={`/vehicles/view/${vehicle.id}`}>مشاهده</Link>
        </Button>
      </div>
      <ReactTooltip
        id={`tooltip-${vehicle.id}`}
        place="top"
        content={`پلاک: ${vehicle.plate || "ثبت نشده"}`}
        className="bg-gray-800 text-white"
      />
    </motion.li>
  );
}

/* ---------------- Stats Card ---------------- */
function StatsCard({ vehicles }: { vehicles: Vehicle[] }) {
  const stats = useMemo(() => {
    const total = vehicles.length;
    const withDriver = vehicles.filter((v) => v.driver_id).length;
    const active = vehicles.filter((v) => v.status === "active").length;
    return { total, withDriver, withoutDriver: total - withDriver, active };
  }, [vehicles]);

  const barChartData = [
    { name: "کل", value: stats.total, fill: "#07657E" },
    { name: "با راننده", value: stats.withDriver, fill: "#F2991F" },
    { name: "بدون راننده", value: stats.withoutDriver, fill: "#1FB4C8" },
    { name: "فعال", value: stats.active, fill: "#4CAF50" },
  ];

  const pieChartData = [
    { name: "با راننده", value: stats.withDriver, fill: "#F2991F" },
    { name: "بدون راننده", value: stats.withoutDriver, fill: "#1FB4C8" },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      className={`${GLASS2} ${PANELBG2} grid grid-cols-1 gap-6 p-6 md:grid-cols-2`}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4">
          <ChartBarIcon className="h-6 w-6 text-primary" />
          <div>
            <div className="text-xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">تعداد وسایل</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <TruckIcon className="h-6 w-6 text-orange-500" />
          <div>
            <div className="text-xl font-bold text-foreground">{stats.withDriver}</div>
            <div className="text-xs text-muted-foreground">با راننده</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <div className="text-xl font-bold text-foreground">{stats.withoutDriver}</div>
            <div className="text-xs text-muted-foreground">بدون راننده</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <ChartBarIcon className="h-6 w-6 text-green-500" />
          <div>
            <div className="text-xl font-bold text-foreground">{stats.active}</div>
            <div className="text-xs text-muted-foreground">فعال</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-32">
          <ResponsiveContainer>
            <BarChart data={barChartData}>
              <XAxis dataKey="name" stroke="#07657E" fontSize={12} />
              <YAxis stroke="#07657E" fontSize={12} />
              <Tooltip
                wrapperStyle={{
                  fontSize: "12px",
                  background: "white",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar dataKey="value" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-32">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieChartData} dataKey="value" outerRadius={60} label={false}>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{
                  fontSize: "12px",
                  background: "white",
                  border: "1px solid #e5e7eb",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- GPS Map ---------------- */
function GPSMap({
  vehicles,
  selectedVehicleId,
}: {
  vehicles: Vehicle[];
  selectedVehicleId: number | null;
}) {
  const validVehicles = vehicles.filter((v) => v.latitude && v.longitude);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (selectedVehicleId) {
      const selected = validVehicles.find((v) => v.id === selectedVehicleId);
      if (selected && mapRef.current) {
        mapRef.current.setView([selected.latitude!, selected.longitude!], 15);
      }
    }
  }, [selectedVehicleId, validVehicles]);

  return (
    <motion.div initial={false} className={`${GLASS2} ${PANELBG2} relative z-0 h-96 p-6`}>
      <h2 className="mb-4 text-xl font-bold text-foreground">موقعیت GPS وسایل</h2>
      <div className="relative z-0 h-full w-full">
        <MapContainer
          center={[35.6892, 51.389]}
          zoom={10}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MarkerClusterGroup>
            {validVehicles.map((v) => (
              <Marker key={v.id} position={[v.latitude!, v.longitude!]}>
                <Popup>
                  {v.model} - {v.plate}
                  <br />
                  وضعیت: {v.status}
                  <br />
                  راننده: {v.driver_id}
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      {validVehicles.length === 0 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md border bg-white/80 px-2 py-1 text-xs text-muted-foreground">
          مختصات GPS برای نمایش روی نقشه موجود نیست.
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- Page ---------------- */
export default function VehicleList() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <VehicleListContent />
    </QueryClientProvider>
  );
}

function VehicleListContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "with-driver" | "no-driver" | "active" | "maintenance" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"model" | "plate" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const {
    data: rows = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (error) toast.error(error.message || "خطا در دریافت وسایل");
  }, [error]);

  const debounced = useDebounced(searchTerm, 300);

  const filtered = useMemo(() => {
    const base = rows;
    const k = debounced.trim().toLowerCase();
    let list = base.filter((v) => {
      const s = [v.model ?? "", v.plate ?? "", v.chassis_number ?? ""].join(" ").toLowerCase();
      return s.includes(k);
    });

    if (filterType === "with-driver") list = list.filter((v) => v.driver_id);
    if (filterType === "no-driver") list = list.filter((v) => !v.driver_id);
    if (filterType === "active") list = list.filter((v) => v.status === "active");
    if (filterType === "maintenance") list = list.filter((v) => v.status === "maintenance");
    if (filterType === "inactive") list = list.filter((v) => v.status === "inactive");

    list.sort((a, b) => {
      let valA: any = a[sortBy] || 0;
      let valB: any = b[sortBy] || 0;
      if (sortBy === "created_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [debounced, rows, filterType, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  function exportCSV() {
    const rowsCSV = [
      ["مدل", "پلاک", "شماره شاسی", "شناسه راننده"],
      ...filtered.map((v) => [v.model || "", v.plate || "", v.chassis_number || "", v.driver_id || ""]),
    ];
    const csv = rowsCSV.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vehicles.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("فایل CSV آماده شد!");
  }

  function openEditModal(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setEditModalOpen(true);
  }
  function openDeleteModal(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setDeleteModalOpen(true);
  }
  function handleDeleteConfirm() {
    toast.error("حذف واقعی پیاده‌سازی نشده است (placeholder)");
    setDeleteModalOpen(false);
  }
  function zoomToVehicle(id: number | string | null) {
    if (id) setSelectedVehicleId(Number(id));
  }

  const filterChips = (
    <>
      <Chip active={filterType === "all"} onClick={() => setFilterType("all")}>
        همه
      </Chip>
      <Chip active={filterType === "with-driver"} onClick={() => setFilterType("with-driver")}>
        با راننده
      </Chip>
      <Chip active={filterType === "no-driver"} onClick={() => setFilterType("no-driver")}>
        بدون راننده
      </Chip>
      <Chip active={filterType === "active"} onClick={() => setFilterType("active")}>
        فعال
      </Chip>
      <Chip active={filterType === "maintenance"} onClick={() => setFilterType("maintenance")}>
        در تعمیر
      </Chip>
      <Chip active={filterType === "inactive"} onClick={() => setFilterType("inactive")}>
        غیرفعال
      </Chip>
    </>
  );

  const toolbar = (
    <FilterBar>
      <div className="flex flex-1 items-center gap-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="جستجو بر اساس مدل، پلاک یا شاسی..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          dir="rtl"
        />
      </div>
      <ListActionBar>
        {filterChips}
        <Select value={sortBy} onValueChange={(v: "model" | "plate" | "created_at") => setSortBy(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="مرتب‌سازی" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="created_at">مرتب‌سازی بر اساس تاریخ</SelectItem>
            <SelectItem value="model">مرتب‌سازی بر اساس مدل</SelectItem>
            <SelectItem value="plate">مرتب‌سازی بر اساس پلاک</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="ترتیب" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="desc">نزولی</SelectItem>
            <SelectItem value="asc">صعودی</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">به‌روزرسانی</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <DocumentArrowDownIcon className="h-4 w-4" />
          خروجی CSV
        </Button>
        <Button asChild size="sm">
          <Link href="/vehicles/register">ثبت وسیله جدید</Link>
        </Button>
      </ListActionBar>
    </FilterBar>
  );

  const stats = useMemo(() => {
    const total = filtered.length;
    const withDriver = filtered.filter((v) => v.driver_id).length;
    const active = filtered.filter((v) => v.status === "active").length;
    return { total, withDriver, active };
  }, [filtered]);

  return (
    <div dir="rtl">
      <ListPageLayout
        title="مدیریت ناوگان"
        description="جستجو، فیلتر، مشاهده نقشه و لیست وسایل نقلیه"
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/vehicles/register">ثبت وسیله جدید</Link>
          </Button>
        }
        toolbar={toolbar}
      >
        <ListHeader
          title="وسایل نقلیه"
          description="کارت‌ها، آمار و نقشه زنده وسایل"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {stats.total} وسیله
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                {stats.withDriver} با راننده
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                {stats.active} فعال
              </span>
            </div>
          }
        />

        <StatsCard vehicles={filtered} />
        <GPSMap vehicles={filtered} selectedVehicleId={selectedVehicleId} />

        <TableShell>
          <div className="p-4">
            {isLoading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-muted/60 animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                وسیله‌ای یافت نشد.
              </div>
            )}

            {!isLoading && filtered.length > 0 && (
              <>
                <motion.ul
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  <AnimatePresence>
                    {paginated.map((v) => (
                      <VehicleCard
                        key={v.id ?? `${v.model}-${v.plate}`}
                        vehicle={v}
                        onEdit={() => openEditModal(v)}
                        onDelete={() => openDeleteModal(v)}
                        onZoom={() => zoomToVehicle(v.id ?? null)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-3">
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
              </>
            )}
          </div>
        </TableShell>

        <EditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} vehicle={selectedVehicle} />
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </ListPageLayout>
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
