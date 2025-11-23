// packages/frontend/src/app/vehicles/list/page.tsx
"use client";

import "@/lib/leaflet-fix"; // فقط تابع ensure دارد؛ SSR-safe
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TruckIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ─────────────── dynamic imports مخصوص نقشه برای SSR-safe ─────────────── */
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster").then((m) => m.default),
  { ssr: false }
);

/* ─────────────── Theme helpers ─────────────── */
const GLASS2 =
  "backdrop-blur-xl border border-gray-400 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,.2)] glow-border-soft";
const PANELBG2 = "bg-white/30 dark:bg-gray-900/50";

/* ─────────────── Animations ─────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

/* ─────────────── Types ─────────────── */
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

/* ─────────────── Modals ─────────────── */
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
    toast.success("ویرایش ذخیره شد! (placeholder)");
    onClose();
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/90 p-6 rounded-xl shadow-2xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-turquoise-900">ویرایش خودرو</h2>
          <Button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Input defaultValue={vehicle.model || ""} placeholder="مدل" className="mb-4" />
          <Input defaultValue={vehicle.plate || ""} placeholder="پلاک" className="mb-4" />
          <Input defaultValue={vehicle.chassis_number || ""} placeholder="شماره شاسی" className="mb-4" />
          <Input defaultValue={vehicle.driver_id || ""} placeholder="شناسه راننده" className="mb-4" type="number" />
          <select
            defaultValue={vehicle.status || "active"}
            className="mb-4 w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="active">فعال</option>
            <option value="maintenance">در تعمیر</option>
            <option value="inactive">غیرفعال</option>
          </select>
          <Input
            defaultValue={vehicle.latitude || ""}
            placeholder="عرض جغرافیایی"
            className="mb-4"
            type="number"
            step="0.000001"
          />
          <Input
            defaultValue={vehicle.longitude || ""}
            placeholder="طول جغرافیایی"
            className="mb-4"
            type="number"
            step="0.000001"
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-turquoise-400 to-orange-500 text-white"
          >
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
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/90 p-6 rounded-xl shadow-2xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-turquoise-900">تایید حذف</h2>
          <Button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <p className="mb-4 text-turquoise-800">
          آیا مطمئن هستید که می‌خواهید این خودرو را حذف کنید؟
        </p>
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
      initial={false}
      whileHover={{ scale: 1.05, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-md"
          : "bg-gray-300 text-turquoise-900 hover:bg-gray-400 hover:shadow-md"
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
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      className="p-6 rounded-2xl border border-gray-400 bg-white/40 flex flex-col gap-4 group hover:bg-white/50 transition-all duration-300 glow-border-soft"
      data-tooltip-id={`tooltip-${vehicle.id}`}
      aria-label={`کارت خودرو: ${model}`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={false}
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="size-12 rounded-xl grid place-items-center bg-gradient-to-br from-turquoise-400 to-orange-500 text-white shadow-lg"
        >
          <TruckIcon className="h-6 w-6" />
        </motion.div>
        <div>
          <div className="font-bold text-turquoise-900 text-lg">{model}</div>
          <div className="text-sm opacity-70 text-turquoise-800">
            {vehicle.plate || "—"}
          </div>
          <div className="text-xs opacity-60 text-turquoise-700">
            شاسی: {vehicle.chassis_number || "—"}
          </div>
          <div className="text-xs opacity-60 text-turquoise-700">
            راننده: {vehicle.driver_id || "—"}
          </div>
          <div className="text-xs opacity-60 text-turquoise-700">
            وضعیت: {vehicle.status || "—"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button
          className="p-2 rounded-full bg-transparent text-turquoise-600 hover:text-turquoise-900 hover:bg-turquoise-200/80 transition-all duration-300"
          onClick={onEdit}
          aria-label={`ویرایش خودرو: ${model}`}
        >
          <PencilIcon className="h-5 w-5" />
        </Button>
        <Button
          className="p-2 rounded-full bg-transparent text-red-600 hover:text-red-900 hover:bg-red-200/80 transition-all duration-300"
          onClick={onDelete}
          aria-label={`حذف خودرو: ${model}`}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
        <Button
          className="p-2 rounded-full bg-transparent text-green-600 hover:text-green-900 hover:bg-green-200/80 transition-all duration-300"
          onClick={onZoom}
          aria-label={`پیگیری GPS: ${model}`}
          disabled={!vehicle.latitude || !vehicle.longitude}
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </Button>
        <Link
          href={`/vehicles/view/${vehicle.id}`}
          className="text-turquoise-600 hover:text-orange-500 font-semibold transition-colors"
          aria-label={`جزئیات خودرو: ${model}`}
        >
          جزئیات →
        </Link>
      </div>
      <ReactTooltip
        id={`tooltip-${vehicle.id}`}
        place="top"
        content={`پلاک: ${vehicle.plate || "موجود نیست"}`}
        className="bg-gray-800 text-white p-2 rounded-md"
      />
    </motion.li>
  );
}

/* ─────────────── Stats Card ─────────────── */
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
      className={`${GLASS2} ${PANELBG2} p-6 grid grid-cols-1 md:grid-cols-2 gap-6`}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-turquoise-50/50 border border-turquoise-100 shadow-inner">
          <ChartBarIcon className="h-6 w-6 text-turquoise-600" />
          <div>
            <div className="text-xl font-bold text-turquoise-900">{stats.total}</div>
            <div className="text-xs text-turquoise-700">تعداد خودروها</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50/50 border border-orange-100 shadow-inner">
          <TruckIcon className="h-6 w-6 text-orange-500" />
          <div>
            <div className="text-xl font-bold text-turquoise-900">{stats.withDriver}</div>
            <div className="text-xs text-turquoise-700">با راننده</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50/50 border border-red-100 shadow-inner">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <div className="text-xl font-bold text-turquoise-900">{stats.withoutDriver}</div>
            <div className="text-xs text-turquoise-700">بدون راننده</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50/50 border border-green-100 shadow-inner">
          <ChartBarIcon className="h-6 w-6 text-green-500" />
          <div>
            <div className="text-xl font-bold text-turquoise-900">{stats.active}</div>
            <div className="text-xs text-turquoise-700">فعال</div>
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

/* ─────────────── GPS Map (همیشه نقشه را نشان بده؛ z-index fix) ─────────────── */
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
    <motion.div
      initial={false}
      className={`${GLASS2} ${PANELBG2} p-6 h-96 relative z-0`}
    >
      <h2 className="text-xl font-bold text-turquoise-900 mb-4">پیگیری GPS خودروها</h2>
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
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-700 bg-white/80 px-2 py-1 rounded-md border">
          دادهٔ GPS موجود نیست؛ نقشه بدون مارکر نمایش داده شد.
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────── Page ─────────────── */
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
  const [sortBy, setSortBy] = useState<"model" | "plate" | "created_at">(
    "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );
  const itemsPerPage = 10;

  const {
    data: rows = [],
    isLoading,
    error,
  } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
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
    let list = base.filter((v) => {
      const s = [v.model ?? "", v.plate ?? "", v.chassis_number ?? ""]
        .join(" ")
        .toLowerCase();
      return s.includes(k);
    });

    if (filterType === "with-driver") list = list.filter((v) => v.driver_id);
    if (filterType === "no-driver") list = list.filter((v) => !v.driver_id);
    if (filterType === "active") list = list.filter((v) => v.status === "active");
    if (filterType === "maintenance")
      list = list.filter((v) => v.status === "maintenance");
    if (filterType === "inactive")
      list = list.filter((v) => v.status === "inactive");

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
      ...filtered.map((v) => [
        v.model || "",
        v.plate || "",
        v.chassis_number || "",
        v.driver_id || "",
      ]),
    ];
    const csv = rowsCSV.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vehicles.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("دانلود شد!");
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
    toast.error("خودرو حذف شد! (placeholder)");
    setDeleteModalOpen(false);
  }
  function zoomToVehicle(id: number | string | null) {
    if (id) setSelectedVehicleId(Number(id));
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-turquoise-900 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120rem 70rem at 120% -10%, rgba(7,101,126,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(242,153,31,.18), transparent), #a0aec0",
      }}
      suppressHydrationWarning
    >
      <div className="pointer-events-none absolute inset-0 opacity-[.08] [background:repeating-linear-gradient(90deg,rgba(0,0,0,.25)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(0,0,0,.2)_0_1px,transparent_1px_28px)]" />

      <div className="flex-1 p-6 md:p-8 gap-6 overflow-hidden flex flex-col">
        {/* Header */}
        <motion.header
          initial={false}
          className="backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 p-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-turquoise-900">
              مدیریت ناوگان خودرو ({filtered.length})
            </h1>
            <p className="text-sm text-turquoise-600 mt-1">مدیریت و نظارت</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-300 btn-add"
              onClick={() => toast("در حال توسعه!")}
            >
              <TruckIcon className="h-4 w-4 mr-2" /> افزودن خودرو
            </Button>
          </div>
        </motion.header>

        {/* Stats */}
        <StatsCard vehicles={filtered} />

        {/* نوار جست‌وجو/فیلتر/CSV */}
        <motion.div
          initial={false}
          className="relative z-20 backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 p-3 flex items-center gap-3"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-turquoise-600" />
          <Input
            placeholder="جستجو مدل، پلاک، شاسی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none text-turquoise-900 placeholder:text-turquoise-500 focus:outline-none text-sm"
          />
          <div className="flex gap-2">
            <Chip active={filterType === "all"} onClick={() => setFilterType("all")}>
              همه
            </Chip>
            <Chip
              active={filterType === "with-driver"}
              onClick={() => setFilterType("with-driver")}
            >
              با راننده
            </Chip>
            <Chip
              active={filterType === "no-driver"}
              onClick={() => setFilterType("no-driver")}
            >
              بدون راننده
            </Chip>
            <Chip
              active={filterType === "active"}
              onClick={() => setFilterType("active")}
            >
              فعال
            </Chip>
            <Chip
              active={filterType === "maintenance"}
              onClick={() => setFilterType("maintenance")}
            >
              تعمیر
            </Chip>
            <Chip
              active={filterType === "inactive"}
              onClick={() => setFilterType("inactive")}
            >
              غیرفعال
            </Chip>
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

        {/* کادر مرتب‌سازی */}
        <div className="relative z-20 flex gap-4 mb-4">
          <select
            onChange={(e) =>
              setSortBy(e.target.value as "model" | "plate" | "created_at")
            }
            className="p-2 border rounded-md"
          >
            <option value="created_at">مرتب‌سازی بر اساس تاریخ</option>
            <option value="model">مرتب‌سازی بر اساس مدل</option>
            <option value="plate">مرتب‌سازی بر اساس پلاک</option>
          </select>
          <select
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="p-2 border rounded-md"
          >
            <option value="desc">نزولی</option>
            <option value="asc">صعودی</option>
          </select>
        </div>

        {/* نقشهٔ GPS با z-0 و نمایش حتی بدون مارکر */}
        <GPSMap vehicles={filtered} selectedVehicleId={selectedVehicleId} />

        {/* لیست کارت‌ها */}
        <motion.section
          initial={false}
          variants={stagger}
          className="flex-1 overflow-y-auto space-y-6"
        >
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-8 text-turquoise-600">موردی یافت نشد.</div>
          )}

          {!isLoading && filtered.length > 0 && (
            <>
              <motion.ul variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {paginated.map((v) => (
                    <VehicleCard
                      key={v.id ?? `${v.model}-${v.plate}`}
                      vehicle={v}
                      onEdit={() => openEditModal(v)}
                      onDelete={() => openDeleteModal(v)}
                      onZoom={() => setSelectedVehicleId(Number(v.id))}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    قبلی
                  </Button>
                  <span>
                    صفحه {currentPage} از {totalPages}
                  </span>
                  <Button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    بعدی
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.section>

        <EditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          vehicle={selectedVehicle}
        />
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
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
