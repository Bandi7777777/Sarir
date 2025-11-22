"use client";

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Edit,
  Trash,
  CheckSquare,
  Square,
  ListFilter,
  Settings2,
  Columns,
  Filter,
  Play,
} from "lucide-react";

// 🔴🔴 اینجا اصلاح شده:
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { api } from "@/lib/api";
import type { Report } from "@/app/api/reports/route";

// بقیه کد مثل قبل...

// انواع کمکی برای وضعیت رابط (تراکم جدول، فیلتر ستون‌ها و نماهای ذخیره‌شده)
type Density = "comfort" | "dense" | "compact";
type ColumnsVisibility = {
  category: boolean;
  count: boolean;
  description: boolean;
  trend: boolean;
  alert: boolean;
  subMetrics: boolean;
};
type ViewPreset = {
  name: string;
  sortOrder: "asc" | "desc";
  searchTerm: string;
  selectedCategory: string | null;
  countRange: [number, number];
  density: Density;
  columns: ColumnsVisibility;
  builderDims: string[];
  builderMs: string[];
  customFilters: { [key: string]: string };
};

// داده‌های نمونه برای نمودار روند (Trend) – ماه‌های سال با اعداد نمونه
type TrendPoint = { month: string; count: number; secondary: number };
const trendData: TrendPoint[] = [
  { month: "فروردین", count: 20, secondary: 15 },
  { month: "اردیبهشت", count: 30, secondary: 25 },
  { month: "خرداد", count: 25, secondary: 20 },
  { month: "تیر", count: 40, secondary: 35 },
  { month: "مرداد", count: 35, secondary: 30 },
  { month: "شهریور", count: 50, secondary: 45 }
];

// کلید Query برای React Query
const reportsKey = ["reports"];

// توابع API برای گرفتن و به‌روزرسانی داده‌ها
async function getReports() {
  return api<Report[]>("/api/reports");
}
async function addReport(body: Omit<Report, "id">) {
  return api<Report>("/api/reports", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
async function updateReport(body: Report) {
  return api<Report>("/api/reports", {
    method: "PUT",
    body: JSON.stringify(body)
  });
}
async function removeReport(id: number) {
  return api<{ id: number }>("/api/reports", {
    method: "DELETE",
    body: JSON.stringify({ id })
  });
}

// لیست گزارش‌های آماده (پیش‌فرض) با تنظیمات از پیش تعریف‌شده برای فیلتر (جهت بخش "گزارش‌های آماده")
type ReadyReport = { id: string; title: string; icon: JSX.Element; type: "personnel" | "board"; apply: (ctx: { setSelectedCategory: any; setColumns: any; setSortOrder?: any }) => void };
const READY_REPORTS: ReadyReport[] = [
  // نمونه‌های پرسنلی
  {
    id: "birthdays-month",
    title: "تولدهای ماه جاری",
    icon: <Calendar size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("birthdays-month");
      setColumns({ category: true, count: false, description: true, trend: false, alert: false, subMetrics: false });
    }
  },
  {
    id: "file-deficiencies",
    title: "نواقص پرونده پرسنلی",
    icon: <ListFilter size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("file-deficiencies");
      setColumns({ category: true, count: true, description: true, trend: false, alert: true, subMetrics: true });
    }
  },
  {
    id: "attendance-month",
    title: "خلاصه غیبت/اضافه‌کار (ماه)",
    icon: <Filter size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns, setSortOrder }) => {
      setSelectedCategory("attendance-month");
      setColumns({ category: true, count: true, description: true, trend: true, alert: true, subMetrics: true });
      setSortOrder("desc");
    }
  },
  {
    id: "headcount-by-unit",
    title: "نفرات به تفکیک واحد",
    icon: <Columns size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("headcount-by-unit");
      setColumns({ category: true, count: true, description: false, trend: true, alert: false, subMetrics: true });
    }
  },
  // نمونه‌های هیئت‌مدیره
  {
    id: "board-meetings",
    title: "تقویم جلسات هیئت‌مدیره",
    icon: <Calendar size={16} />,
    type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("board-meetings");
      setColumns({ category: true, count: false, description: true, trend: false, alert: true, subMetrics: false });
    }
  },
  {
    id: "compliance-alerts",
    title: "هشدارهای انطباق قانونی",
    icon: <Settings2 size={16} />,
    type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("compliance-alerts");
      setColumns({ category: true, count: true, description: true, trend: false, alert: true, subMetrics: true });
    }
  },
  {
    id: "risk-reports",
    title: "گزارش‌های ریسک منابع انسانی",
    icon: <Settings2 size={16} />,
    type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("risk-reports");
      setColumns({ category: true, count: true, description: true, trend: true, alert: true, subMetrics: true });
    }
  }
  // ... (سایر موارد می‌توانند اضافه شوند)
];

export default function ReportsPage() {
  const queryClient = useQueryClient();

  // دریافت لیست گزارش‌ها با React Query
  const { data: reports, isLoading } = useQuery({ queryKey: reportsKey, queryFn: getReports });

  // Mutationها برای افزودن، ویرایش و حذف گزارش‌ها
  const addMutation = useMutation({
    mutationFn: addReport,
    onSuccess: (newItem) => {
      toast.success("گزارش جدید با موفقیت افزوده شد");
      queryClient.invalidateQueries({ queryKey: reportsKey });
    },
    onError: () => {
      toast.error("افزودن گزارش جدید با خطا مواجه شد");
    }
  });
  const updateMutation = useMutation({
    mutationFn: updateReport,
    onSuccess: () => {
      toast.success("گزارش با موفقیت به‌روزرسانی شد");
      queryClient.invalidateQueries({ queryKey: reportsKey });
    },
    onError: () => {
      toast.error("ویرایش گزارش با خطا مواجه شد");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: removeReport,
    onSuccess: () => {
      toast.success("گزارش حذف شد");
      queryClient.invalidateQueries({ queryKey: reportsKey });
    },
    onError: () => {
      toast.error("حذف گزارش با خطا مواجه شد");
    }
  });

  // Stateهای رابط کاربری
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"personnel" | "board" | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [countRange, setCountRange] = useState<[number, number]>([0, 100]);
  const [density, setDensity] = useState<Density>("comfort");
  const [columnsVis, setColumnsVis] = useState<ColumnsVisibility>({
    category: true, count: true, description: true, trend: true, alert: true, subMetrics: true
  });
  const [savedViews, setSavedViews] = useState<ViewPreset[]>([]);
  const [editing, setEditing] = useState<Report | null>(null);   // گزارش در حال ویرایش (برای Dialog ویرایش)
  const [showAdd, setShowAdd] = useState(false);                // نمایش Dialog افزودن جدید
  const [newItem, setNewItem] = useState<Omit<Report, "id">>({ category: "", count: 0, description: "" });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());  // مجموعه انتخاب‌شده‌ها در جدول (انتخاب همه/تکی)
  const [realTime, setRealTime] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "charts" | "summary" | "advanced">("table");
  const [drillDownItem, setDrillDownItem] = useState<Report | null>(null); // برای نمایش جزئیات زیرمعیارها
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv" | "json">("pdf");

  // همگام‌سازی برخی فیلترها با URL (مثلاً query string)
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("q", searchTerm);
    url.searchParams.set("cat", selectedCategory ?? "");
    url.searchParams.set("sort", sortOrder);
    history.replaceState(null, "", url.toString());
  }, [searchTerm, selectedCategory, sortOrder]);
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q") ?? "";
    const cat = url.searchParams.get("cat");
    const srt = (url.searchParams.get("sort") as "asc" | "desc") ?? "desc";
    setSearchTerm(q);
    setSelectedCategory(cat || null);
    setSortOrder(srt);
  }, []);  // بار اول مقادیر URL را به state ها تزریق می‌کند

  // بارگذاری نماهای ذخیره‌شده از localStorage (اگر قبلاً فیلترهایی ذخیره شده باشد)
  useEffect(() => {
    const stored = localStorage.getItem("sarir_reports_saved_views_hr_board_neon");
    if (stored) setSavedViews(JSON.parse(stored));
  }, []);

  // فیلتر کردن لیست گزارش‌های آماده بر اساس نوع انتخاب‌شده (personnel/board/all)
  const filteredReadyReports = useMemo(() => 
    READY_REPORTS.filter(r => selectedType === "all" || r.type === selectedType),
    [selectedType]
  );

  // فیلتر کردن داده‌های گزارش بر اساس term جستجو، دسته‌بندی انتخابی، محدوده اعداد و ... 
  const filteredData = useMemo(() => 
    (reports ?? []).filter(item =>
      item.category.includes(searchTerm) &&
      (!selectedCategory || item.category === selectedCategory) &&
      item.count >= countRange[0] && item.count <= countRange[1] &&
      Object.entries({}).every(([k, v]) => String(item[k as keyof Report]).includes(v))
    ).sort((a, b) =>
      sortOrder === "asc" ? a.count - b.count : b.count - a.count
    ),
    [reports, searchTerm, selectedCategory, sortOrder, countRange]
  );

  // داده‌های نمودار خطی (Trend) بر اساس دسته‌بندی انتخاب‌شده (افزایش یا کاهش تصادفی برای نمایش حالت‌های مختلف)
  const filteredTrendData = useMemo(() => 
    trendData.map(d => ({
      ...d,
      count: selectedCategory ? d.count * (Math.random() * 1.2) : d.count,
      secondary: d.secondary * Math.random()
    })),
    [selectedCategory]
  );
  // داده‌های نمودار دایره‌ای (Pie) بر اساس داده‌های فیلترشده (نسبت هر دسته)
  const pieData = useMemo(() =>
    filteredData.map(item => ({ name: item.category, value: item.count })),
    [filteredData]
  );
  // داده‌های نمودار رادار (Radar) نمونه (تصادفی)
  const radarData = useMemo(() => [
      { subject: "تنوع",        A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "مشارکت",     A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "عملکرد",     A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "ماندگاری",   A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "صرفه‌جویی",  A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 }
    ],
    []
  );

  // تعریف ستون‌های جدول (برای کتابخانه React Table)
  const columns = useMemo<ColumnDef<Report>[]>(() => [
    { accessorKey: "category", header: "عنوان/گروه" },
    { accessorKey: "count", header: "عدد" },
    { accessorKey: "description", header: "توضیحات" },
    { 
      id: "trend", header: "روند",
      cell: () => <span className="text-teal-400"><Play size={16} /></span>  // آیکن روند (نمادین)
    },
    { 
      id: "alert", header: "هشدار",
      cell: ({ row }) => row.original.count > 50 
        ? <span className="text-red-500"><ChevronUp size={16} /></span> 
        : (row.original.count < 30 
            ? <span className="text-yellow-500"><ChevronDown size={16} /></span> 
            : null)
    },
    { 
      id: "subMetrics", header: "زیرمعیارها",
      cell: ({ row }) => (
        <button className="chip" onClick={() => setDrillDownItem(row.original)}>
          {/* آیکن نمودار میله‌ای کوچک برای نمایش زیرمعیارها */}
          <Columns size={16} className="text-orange-300" />
        </button>
      )
    },
    { 
      id: "actions", header: "",   // ستونی برای دکمه‌های ویرایش/حذف
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button className="chip" onClick={() => setEditing(row.original)}>
            <Edit size={14} />
          </button>
          <button className="chip" onClick={() => deleteMutation.mutate(row.original.id)}>
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ], [deleteMutation]);

  // ایجاد instance جدول با داده‌ها و ستون‌ها
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  const { rows } = table.getRowModel();

  // تنظیمات Virtualizer برای اسکرول مجازی جدول
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (density === "dense" ? 36 : density === "compact" ? 28 : 48),
    overscan: 30
  });
  const { getVirtualItems, getTotalSize } = rowVirtualizer;
  const virtualItems = getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start ?? 0 : 0;
  const paddingBottom = virtualItems.length > 0 
    ? getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
    : 0;

  // توابع کمکی برای انتخاب (Toggle) موارد
  const toggleOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (filteredData.length === 0) return;
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());  // همه را غیرفعال کن
    } else {
      setSelectedIds(new Set(filteredData.map(item => item.id)));  // همه را انتخاب کن
    }
  };

  // ذخیره یک نمای فیلتر/تنظیم به نام مشخص
  const saveView = (name: string) => {
    const newView: ViewPreset = {
      name,
      sortOrder,
      searchTerm,
      selectedCategory,
      countRange,
      density,
      columns: columnsVis,
      builderDims: [], builderMs: [], customFilters: {}
    };
    const updatedViews = [...savedViews, newView];
    setSavedViews(updatedViews);
    localStorage.setItem("sarir_reports_saved_views_hr_board_neon", JSON.stringify(updatedViews));
    toast.success("نمای فعلی ذخیره شد");
  };

  // تابع خروجی‌گرفتن داده‌ها بر اساس فرمت انتخابی (PDF, Excel, CSV, JSON)
  const handleExport = () => {
    if (!filteredData.length) return;
    if (exportFormat === "pdf") {
      downloadPDF(filteredData);
    } else if (exportFormat === "excel" || exportFormat === "csv") {
      const sheet = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "Reports");
      XLSX.writeFile(wb, exportFormat === "excel" ? "reports.xlsx" : "reports.csv", { bookType: exportFormat === "excel" ? "xlsx" : "csv" });
    } else if (exportFormat === "json") {
      const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reports.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // تابع خروجی PDF با استفاده از jsPDF
  function downloadPDF(rows: Report[]) {
    const doc = new jsPDF();
    doc.text("گزارش مدیریت پرسنلی", 105, 10, { align: "center" });
    const tableData = rows.map(i => [i.count, i.category, i.description]);
    (doc as any).autoTable({
      head: [["عدد", "عنوان/گروه", "توضیحات"]],
      body: tableData
    });
    doc.save("reports.pdf");
  }

  // اگر هنوز داده‌ها در حال لود شدن باشند، نمایش پیام بارگذاری
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-[#cfe3ff]">
        در حال بارگذاری...
      </div>
    );
  }

  // رندر اصلی صفحه
  return (
    <div className="reports-neon relative">
      {/* اورب‌های پس‌زمینه برای افکت‌های نئونی */}
      <div className="orb orb--teal" />
      <div className="orb orb--orange" />
      <div className="orb orb--blue" />
      <div className="orb orb--purple" />
      <div className="orb orb--green" />

      <main className="container mx-auto p-6 md:p-8">
        {/* سربرگ صفحه */}
        <header className="mb-6 text-right">
          <h1 className="text-2xl font-bold neon-glow-text">گزارش‌ها</h1>
          <p className="text-sm text-gray-300">در این بخش گزارش‌های تجمعی و شاخص‌های کلیدی سیستم را مشاهده می‌کنید.</p>
        </header>

        {/* کارت‌های KPI خلاصه */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="kpi p-4 text-center text-white">
            <div className="kpi__title">تعداد گزارش‌ها</div>
            <div className="kpi__value">{reports ? reports.length : 0}</div>
          </div>
          <div className="kpi p-4 text-center text-white">
            <div className="kpi__title">مجموع اعداد</div>
            <div className="kpi__value">{reports ? reports.reduce((sum, r) => sum + r.count, 0) : 0}</div>
          </div>
          <div className="kpi p-4 text-center text-white">
            <div className="kpi__title">میانگین مقادیر</div>
            <div className="kpi__value">
              {reports && reports.length > 0 
                ? (reports.reduce((sum, r) => sum + r.count, 0) / reports.length).toFixed(1) 
                : 0}
            </div>
          </div>
        </div>

        {/* نوار ابزار فیلتر و تنظیمات */}
        <div className="toolbar flex flex-wrap items-center gap-3 mb-6 text-white text-sm">
          {/* ورودی جستجو */}
          <div className="flex items-center gap-2">
            <Search size={18} />
            <Input 
              type="text" 
              placeholder="جستجو..." 
              className="max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* فیلتر نوع گزارش (همه/پرسنلی/هیئت‌مدیره) */}
          <div className="flex items-center gap-1 ml-auto"> 
            <button 
              onClick={() => setSelectedType("all")}
              className={`chip ${selectedType === "all" ? "neon-glow-panel" : ""}`}
            >
              همه
            </button>
            <button 
              onClick={() => setSelectedType("personnel")}
              className={`chip ${selectedType === "personnel" ? "neon-glow-panel" : ""}`}
            >
              پرسنلی
            </button>
            <button 
              onClick={() => setSelectedType("board")}
              className={`chip ${selectedType === "board" ? "neon-glow-panel" : ""}`}
            >
              هیئت‌مدیره
            </button>
          </div>
          {/* محدوده بازه عدد (min-max) */}
          <div className="flex items-center gap-2">
            <span>بازه عدد:</span>
            <Input 
              type="number" 
              className="w-20 text-center" 
              value={countRange[0]} 
              onChange={(e) => setCountRange([+e.target.value || 0, countRange[1]])}
            />
            <span>-</span>
            <Input 
              type="number" 
              className="w-20 text-center" 
              value={countRange[1]} 
              onChange={(e) => setCountRange([countRange[0], +e.target.value || 0])}
            />
          </div>
          {/* انتخاب تراکم نمایش جدول */}
          <Select value={density} onValueChange={(v: Density) => setDensity(v)}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="تراکم نما" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectItem value="comfort">عادی</SelectItem>
              <SelectItem value="dense">متراکم</SelectItem>
              <SelectItem value="compact">فشرده</SelectItem>
            </SelectContent>
          </Select>
          {/* دکمه افزودن گزارش جدید */}
          <Button onClick={() => setShowAdd(true)} className="ml-2">
            <Plus size={16} className="mr-1" /> افزودن گزارش
          </Button>
          {/* انتخاب فرمت و دکمه خروجی */}
          <Select value={exportFormat} onValueChange={(v: typeof exportFormat) => setExportFormat(v)}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="فرمت" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="secondary">
            <Download size={16} className="mr-1" /> خروجی
          </Button>
          {/* سوئیچ به‌روزرسانی خودکار */}
          <label className="flex items-center gap-2 ml-4">
            <Switch checked={realTime} onCheckedChange={(val: boolean) => setRealTime(val)} />
            <span>به‌روزرسانی خودکار</span>
          </label>
          {/* دکمه نمایش/عدم نمایش ستون‌ها */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="chip flex items-center gap-1">
                <Columns size={16} />
                ستون‌ها
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-4 bg-[#1e293b] text-gray-100 text-sm">
              {/* چک‌باکس‌های انتخاب ستون (استفاده از تابع کمکی ColumnToggles) */}
              <div className="space-y-2">
                {/* باکس‌های تیک برای هر ستون */}
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={columnsVis.category} 
                    onChange={e => setColumnsVis({ ...columnsVis, category: e.target.checked })} 
                  />
                  عنوان/گروه
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={columnsVis.count} 
                    onChange={e => setColumnsVis({ ...columnsVis, count: e.target.checked })} 
                  />
                  عدد
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={columnsVis.description} 
                    onChange={e => setColumnsVis({ ...columnsVis, description: e.target.checked })} 
                  />
                  توضیحات
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={columnsVis.trend} 
                    onChange={e => setColumnsVis({ ...columnsVis, trend: e.target.checked })} 
                  />
                  روند
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={columnsVis.alert} 
                    onChange={e => setColumnsVis({ ...columnsVis, alert: e.target.checked })} 
                  />
                  هشدار
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={columnsVis.subMetrics} 
                    onChange={e => setColumnsVis({ ...columnsVis, subMetrics: e.target.checked })} 
                  />
                  زیرمعیارها
                </label>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* لیست گزارش‌های آماده (فیلترهای سریع) */}
        <div className="mb-4 overflow-auto space-x-2 pb-2">
          {filteredReadyReports.map(report => (
            <button 
              key={report.id} 
              className="chip flex items-center gap-1"
              onClick={() => report.apply({ setSelectedCategory, setColumns: setColumnsVis, setSortOrder })}
            >
              {report.icon}
              <span>{report.title}</span>
            </button>
          ))}
        </div>

        {/* محتوای اصلی: جدول یا نمودار بر اساس viewMode */}
        {viewMode === "table" && (
          <div className="table-wrap glass p-2">
            {/* سربرگ جدول */}
            <div className="table-head p-4 flex justify-between items-center">
              <h2 className="text-sm font-medium text-[#cfe3ff]">
                گزارش‌ها ({filteredData.length})
              </h2>
              <button className="chip" onClick={toggleSelectAll}>
                {selectedIds.size === filteredData.length && filteredData.length > 0 
                  ? <CheckSquare size={16} /> 
                  : <Square size={16} />
                }
                انتخاب همه
              </button>
            </div>
            {/* بدنه جدول با اسکرول مجازی */}
            <div ref={parentRef} style={{ height: density === "dense" ? 360 : density === "compact" ? 300 : 460, overflow: "auto" }}>
              <table className="w-full text-sm text-right">
                <thead className="sticky top-0 bg-[#0b1220]">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {/* ستونی برای چک‌باکس انتخاب */}
                      <th className="py-3 px-4 w-8" />
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="py-3 px-4">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {paddingTop > 0 && (
                    <tr><td style={{ height: `${paddingTop}px` }} colSpan={table.getAllColumns().length + 1}></td></tr>
                  )}
                  {virtualItems.map(virtualRow => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    const r = row.original;
                    const checked = selectedIds.has(r.id);
                    return (
                      <tr 
                        key={row.id} 
                        className="border-t border-[color:var(--sarir-border)] transition hover:bg-white/5"
                        style={{ transform: `translateY(${virtualRow.start}px)` }}  // موقعیت دهی ردیف مجازی
                      >
                        <td className="py-2 px-4">
                          <button className="chip" onClick={() => toggleOne(r.id)}>
                            {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        </td>
                        {row.getVisibleCells().map(cell => {
                          const cellKey = cell.column.id as keyof Report;
                          const cellValue = cell.getValue<any>();
                          return (
                            <td 
                              key={cell.id} 
                              className={`px-4 ${density === "dense" ? "py-2" : density === "compact" ? "py-1" : "py-3"}`}
                            >
                              {["category", "count", "description"].includes(cellKey)
                                ? String(cellValue ?? "")
                                : (cellValue as React.ReactNode)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr><td style={{ height: `${paddingBottom}px` }} colSpan={table.getAllColumns().length + 1}></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === "charts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* نمودار خطی روند در طول ماه‌ها */}
            <div className="glass p-4 text-white">
              <h3 className="text-sm mb-2">روند ماهانه</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={filteredTrendData}>
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <TooltipChart />
                  <LegendChart />
                  <Line type="monotone" dataKey="count" name="شاخص اصلی" stroke="#4DA8FF" strokeWidth={2} />
                  <Line type="monotone" dataKey="secondary" name="شاخص ثانویه" stroke="#F2991F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* نمودار میله‌ای توزیع دسته‌ها */}
            <div className="glass p-4 text-white">
              <h3 className="text-sm mb-2">توزیع بر اساس دسته</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={filteredData}>
                  <XAxis dataKey="category" stroke="#888" />
                  <YAxis stroke="#888" />
                  <TooltipChart />
                  <Bar dataKey="count" fill="#7ad7f0" name="تعداد" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* نمودار دایره‌ای (Pie) */}
            <div className="glass p-4 text-white flex flex-col items-center">
              <h3 className="text-sm mb-2">سهم هر گروه</h3>
              <PieChart width={220} height={220}>
                <TooltipChart />
                <Pie 
                  data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" 
                  outerRadius={80} fill="#F2991F" label 
                />
              </PieChart>
            </div>
            {/* نمودار رادار (Radar) */}
            <div className="glass p-4 text-white">
              <h3 className="text-sm mb-2">شاخص‌های کیفی (مثال)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ccc" />
                  <PolarAngleAxis dataKey="subject" stroke="#ccc" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ccc" />
                  <Radar name="گروه A" dataKey="A" stroke="#4DA8FF" fill="#4DA8FF" fillOpacity={0.6} />
                  <Radar name="گروه B" dataKey="B" stroke="#F2991F" fill="#F2991F" fillOpacity={0.4} />
                  <LegendChart />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === "summary" && (
          <div className="text-center text-gray-300 py-8">
            {/* در این نما می‌توان خلاصه‌ای متنی یا ترکیبی از شاخص‌ها نمایش داد */}
            <p>یک گزارش را انتخاب کنید تا خلاصه‌ی آن نمایش داده شود.</p>
          </div>
        )}

        {viewMode === "advanced" && (
          <div className="text-center text-gray-300 py-8">
            {/* این بخش می‌تواند برای فیلترها و گزارش‌ساز پیشرفته استفاده شود */}
            <p>بخش پیشرفته در دست توسعه...</p>
          </div>
        )}
      </main>

      {/* Dialog افزودن گزارش جدید */}
      <Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
        <DialogContent className="bg-[#0b1220] text-gray-100">
          <DialogHeader>
            <DialogTitle>افزودن گزارش جدید</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div>
              <Label>عنوان گزارش</Label>
              <Input 
                type="text" 
                value={newItem.category} 
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} 
              />
            </div>
            <div>
              <Label>عدد</Label>
              <Input 
                type="number" 
                value={newItem.count} 
                onChange={(e) => setNewItem({ ...newItem, count: Number(e.target.value) || 0 })} 
              />
            </div>
            <div>
              <Label>توضیحات</Label>
              <Input 
                type="text" 
                value={newItem.description} 
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} 
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>انصراف</Button>
            <Button 
              onClick={() => {
                addMutation.mutate(newItem);
                setShowAdd(false);
                setNewItem({ category: "", count: 0, description: "" });
              }}
            >
              افزودن
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ویرایش گزارش */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="bg-[#0b1220] text-gray-100">
          <DialogHeader>
            <DialogTitle>ویرایش گزارش</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2 text-sm">
              <div>
                <Label>عنوان گزارش</Label>
                <Input 
                  type="text" 
                  value={editing.category} 
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </div>
              <div>
                <Label>عدد</Label>
                <Input 
                  type="number" 
                  value={editing.count} 
                  onChange={(e) => setEditing({ ...editing, count: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>توضیحات</Label>
                <Input 
                  type="text" 
                  value={editing.description} 
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>انصراف</Button>
            <Button 
              onClick={() => {
                if (editing) updateMutation.mutate(editing);
                setEditing(null);
              }}
            >
              ذخیره
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog نمایش جزئیات زیرمعیارها (در صورت وجود) */}
      <Dialog open={!!drillDownItem} onOpenChange={(open) => { if (!open) setDrillDownItem(null); }}>
        <DialogContent className="bg-[#0b1220] text-gray-100 max-w-lg">
          <DialogHeader>
            <DialogTitle>جزئیات گزارش</DialogTitle>
          </DialogHeader>
          {drillDownItem && (
            <div className="py-2 text-sm">
              <p className="mb-2">
                <span className="font-medium">عنوان:</span> {drillDownItem.category} – 
                <span className="font-medium"> مجموع:</span> {drillDownItem.count}
              </p>
              {drillDownItem.subData ? (
                <ul className="list-inside list-disc space-y-1">
                  {drillDownItem.subData.map(sub => (
                    <li key={sub.id}>
                      {sub.category}: <span className="text-teal-400">{sub.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>هیچ جزئیات بیشتری برای این مورد وجود ندارد.</p>
              )}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setDrillDownItem(null)}>بستن</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
