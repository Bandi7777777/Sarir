"use client";

import jsPDF from "jspdf";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Columns,
  Download,
  Edit,
  Filter,
  ListFilter,
  Play,
  Plus,
  Search,
  Settings2,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as XLSX from "xlsx";
import "jspdf-autotable";

import type { Report } from "@/app/api/reports/route";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { ListHeader } from "@/components/list/ListHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";

import { ReportsCharts } from "./components/ReportsCharts";
import { ReportsTable } from "./components/ReportsTable";
import { ReportsToolbar } from "./components/ReportsToolbar";
import type { ColumnsVisibility, Density } from "./types";

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

type TrendPoint = { month: string; count: number; secondary: number };
const trendData: TrendPoint[] = [
  { month: "فروردین", count: 20, secondary: 15 },
  { month: "اردیبهشت", count: 30, secondary: 25 },
  { month: "خرداد", count: 25, secondary: 20 },
  { month: "تیر", count: 40, secondary: 35 },
  { month: "مرداد", count: 35, secondary: 30 },
  { month: "شهریور", count: 50, secondary: 45 },
];

const reportsKey = ["reports"];

async function getReports() {
  return api<Report[]>("/api/reports");
}
async function addReport(body: Omit<Report, "id">) {
  return api<Report>("/api/reports", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
async function updateReport(body: Report) {
  return api<Report>("/api/reports", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
async function removeReport(id: number) {
  return api<{ id: number }>("/api/reports", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

type ReadyReport = {
  id: string;
  title: string;
  icon: JSX.Element;
  type: "personnel" | "board";
  apply: (ctx: { setSelectedCategory: any; setColumns: any; setSortOrder?: any }) => void;
};

const READY_REPORTS: ReadyReport[] = [
  {
    id: "birthdays-month",
    title: "تولدهای ماه",
    icon: <Calendar size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("birthdays-month");
      setColumns({ category: true, count: false, description: true, trend: false, alert: false, subMetrics: false });
    },
  },
  {
    id: "file-deficiencies",
    title: "کمبود مدارک",
    icon: <ListFilter size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("file-deficiencies");
      setColumns({ category: true, count: true, description: true, trend: false, alert: true, subMetrics: true });
    },
  },
  {
    id: "attendance-month",
    title: "حضور/غیاب ماه",
    icon: <Filter size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns, setSortOrder }) => {
      setSelectedCategory("attendance-month");
      setColumns({ category: true, count: true, description: true, trend: true, alert: true, subMetrics: true });
      setSortOrder("desc");
    },
  },
  {
    id: "headcount-by-unit",
    title: "تعداد به تفکیک واحد",
    icon: <Columns size={16} />,
    type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("headcount-by-unit");
      setColumns({ category: true, count: true, description: false, trend: true, alert: false, subMetrics: true });
    },
  },
  {
    id: "board-meetings",
    title: "جلسات هیئت مدیره",
    icon: <Calendar size={16} />,
    type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("board-meetings");
      setColumns({ category: true, count: false, description: true, trend: false, alert: true, subMetrics: false });
    },
  },
  {
    id: "compliance-alerts",
    title: "هشدارهای تطبیق",
    icon: <Settings2 size={16} />,
    type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("compliance-alerts");
      setColumns({ category: true, count: true, description: true, trend: false, alert: true, subMetrics: true });
    },
  },
  {
    id: "risk-reports",
    title: "گزارش‌های ریسک",
    icon: <Settings2 size={16} />,
    type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("risk-reports");
      setColumns({ category: true, count: true, description: true, trend: true, alert: true, subMetrics: true });
    },
  },
];

export default function ReportsPage() {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({ queryKey: reportsKey, queryFn: getReports });

  const addMutation = useMutation({
    mutationFn: addReport,
    onSuccess: () => {
      toast.success("گزارش جدید ثبت شد");
      queryClient.invalidateQueries({ queryKey: reportsKey });
    },
    onError: () => toast.error("خطا در ثبت گزارش"),
  });
  const updateMutation = useMutation({
    mutationFn: updateReport,
    onSuccess: () => {
      toast.success("ویرایش شد");
      queryClient.invalidateQueries({ queryKey: reportsKey });
    },
    onError: () => toast.error("خطا در ویرایش"),
  });
  const deleteMutation = useMutation({
    mutationFn: removeReport,
    onSuccess: () => {
      toast.success("گزارش حذف شد");
      queryClient.invalidateQueries({ queryKey: reportsKey });
    },
    onError: () => toast.error("حذف ناموفق"),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"personnel" | "board" | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [countRange, setCountRange] = useState<[number, number]>([0, 100]);
  const [density, setDensity] = useState<Density>("comfort");
  const [columnsVis, setColumnsVis] = useState<ColumnsVisibility>({
    category: true,
    count: true,
    description: true,
    trend: true,
    alert: true,
    subMetrics: true,
  });
  const [savedViews, setSavedViews] = useState<ViewPreset[]>([]);
  const [editing, setEditing] = useState<Report | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Omit<Report, "id">>({ category: "", count: 0, description: "" });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [realTime, setRealTime] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "charts" | "summary" | "advanced">("table");
  const [drillDownItem, setDrillDownItem] = useState<Report | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv" | "json">("pdf");

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
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("sarir_reports_saved_views_hr_board_neon");
    if (stored) setSavedViews(JSON.parse(stored));
  }, []);

  const filteredReadyReports = useMemo(
    () => READY_REPORTS.filter((r) => selectedType === "all" || r.type === selectedType),
    [selectedType]
  );

  const filteredData = useMemo(
    () =>
      (reports ?? [])
        .filter(
          (item) =>
            item.category.includes(searchTerm) &&
            (!selectedCategory || item.category === selectedCategory) &&
            item.count >= countRange[0] &&
            item.count <= countRange[1]
        )
        .sort((a, b) => (sortOrder === "asc" ? a.count - b.count : b.count - a.count)),
    [reports, searchTerm, selectedCategory, sortOrder, countRange]
  );

  const filteredTrendData = useMemo(
    () =>
      trendData.map((d) => ({
        ...d,
        count: selectedCategory ? d.count * (Math.random() * 1.2) : d.count,
        secondary: d.secondary * Math.random(),
      })),
    [selectedCategory]
  );
  const pieData = useMemo(() => filteredData.map((item) => ({ name: item.category, value: item.count })), [filteredData]);
  const radarData = useMemo(
    () => [
      { subject: "عملکرد", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "کیفیت", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "زمان", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "هزینه", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
      { subject: "ریسک", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    ],
    []
  );

  const columns = useMemo<ColumnDef<Report>[]>(() => {
    const cols: ColumnDef<Report>[] = [];
    if (columnsVis.category) cols.push({ accessorKey: "category", header: "دسته/عنوان" });
    if (columnsVis.count) cols.push({ accessorKey: "count", header: "تعداد" });
    if (columnsVis.description) cols.push({ accessorKey: "description", header: "توضیحات" });
    if (columnsVis.trend)
      cols.push({
        id: "trend",
        header: "روند",
        cell: () => <span className="text-teal-400"><Play size={16} /></span>,
      });
    if (columnsVis.alert)
      cols.push({
        id: "alert",
        header: "هشدار",
        cell: ({ row }) =>
          row.original.count > 50 ? (
            <span className="text-red-500">
              <ChevronUp size={16} />
            </span>
          ) : row.original.count < 30 ? (
            <span className="text-yellow-500">
              <ChevronDown size={16} />
            </span>
          ) : null,
      });
    if (columnsVis.subMetrics)
      cols.push({
        id: "subMetrics",
        header: "جزئیات",
        cell: ({ row }) => (
          <button className="chip" onClick={() => setDrillDownItem(row.original)}>
            <Columns size={16} className="text-orange-300" />
          </button>
        ),
      });
    cols.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button className="chip" onClick={() => setEditing(row.original)}>
            <Edit size={14} />
          </button>
          <button className="chip" onClick={() => deleteMutation.mutate(row.original.id)}>
            <Trash size={14} />
          </button>
        </div>
      ),
    });
    return cols;
  }, [columnsVis, deleteMutation]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const rows = table.getRowModel().rows;

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (density === "dense" ? 36 : density === "compact" ? 28 : 48),
    overscan: 30,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start ?? 0 : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
      : 0;

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (filteredData.length === 0) return;
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map((item) => item.id)));
    }
  };

  const saveView = (name: string) => {
    const newView: ViewPreset = {
      name,
      sortOrder,
      searchTerm,
      selectedCategory,
      countRange,
      density,
      columns: columnsVis,
      builderDims: [],
      builderMs: [],
      customFilters: {},
    };
    const updatedViews = [...savedViews, newView];
    setSavedViews(updatedViews);
    localStorage.setItem("sarir_reports_saved_views_hr_board_neon", JSON.stringify(updatedViews));
    toast.success("نمای ذخیره شد");
  };

  const handleExport = () => {
    if (!filteredData.length) return;
    if (exportFormat === "pdf") {
      downloadPDF(filteredData);
    } else if (exportFormat === "excel" || exportFormat === "csv") {
      const sheet = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "Reports");
      XLSX.writeFile(wb, exportFormat === "excel" ? "reports.xlsx" : "reports.csv", {
        bookType: exportFormat === "excel" ? "xlsx" : "csv",
      });
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

  function downloadPDF(rows: Report[]) {
    const doc = new jsPDF();
    doc.text("گزارش‌های سامانه", 105, 10, { align: "center" });
    const tableData = rows.map((i) => [i.count, i.category, i.description]);
    (doc as any).autoTable({
      head: [["تعداد", "دسته/عنوان", "توضیحات"]],
      body: tableData,
    });
    doc.save("reports.pdf");
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-[#cfe3ff]">
        در حال بارگذاری گزارش‌ها...
      </div>
    );
  }

  const headerSlot = (
    <div className="flex items-center gap-2">
      <Button onClick={() => setShowAdd(true)} size="sm">
        <Plus size={16} className="ml-1" />
        گزارش جدید
      </Button>
      <Button variant="outline" size="sm" onClick={() => saveView(`View ${savedViews.length + 1}`)}>
        ذخیره نما
      </Button>
    </div>
  );

  return (
    <div dir="rtl" className="reports-neon relative">
      <div className="orb orb--teal" />
      <div className="orb orb--orange" />
      <div className="orb orb--blue" />
      <div className="orb orb--purple" />
      <div className="orb orb--green" />

      <DashboardPageLayout
        title="گزارش‌ها"
        description="تحلیل داده‌های منابع انسانی و هیئت مدیره با فیلترها و خروجی‌های متنوع"
        headerSlot={headerSlot}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="kpi p-4 text-center text-white">
            <div className="kpi__title">تعداد گزارش‌ها</div>
            <div className="kpi__value">{reports ? reports.length : 0}</div>
          </div>
          <div className="kpi p-4 text-center text-white">
            <div className="kpi__title">مجموع مقادیر</div>
            <div className="kpi__value">{reports ? reports.reduce((sum, r) => sum + r.count, 0) : 0}</div>
          </div>
          <div className="kpi p-4 text-center text-white">
            <div className="kpi__title">میانگین</div>
            <div className="kpi__value">
              {reports && reports.length > 0 ? (reports.reduce((sum, r) => sum + r.count, 0) / reports.length).toFixed(1) : 0}
            </div>
          </div>
        </div>

        <ReportsToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          countRange={countRange}
          onCountRangeChange={setCountRange}
          density={density}
          onDensityChange={setDensity}
          exportFormat={exportFormat}
          onExportFormatChange={setExportFormat}
          onExport={handleExport}
          onAddClick={() => setShowAdd(true)}
          realTime={realTime}
          onRealTimeChange={setRealTime}
          columnsVis={columnsVis}
          onColumnsChange={setColumnsVis}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="mb-2 overflow-auto space-x-2 pb-2">
          {filteredReadyReports.map((report) => (
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

        {viewMode === "table" && (
          <ReportsTable
            table={table}
            virtualItems={virtualItems}
            paddingTop={paddingTop}
            paddingBottom={paddingBottom}
            density={density}
            selectedIds={selectedIds}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            scrollRef={parentRef}
          />
        )}

        {viewMode === "charts" && (
          <ReportsCharts trendData={filteredTrendData} barData={filteredData} pieData={pieData} radarData={radarData} />
        )}

        {viewMode === "summary" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">
            خلاصه‌سازی و ذخیره نماهای آینده در این بخش اضافه می‌شود.
          </div>
        )}

        {viewMode === "advanced" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">
            قابلیت‌های پیشرفته بعداً تکمیل می‌شود.
          </div>
        )}
      </DashboardPageLayout>

      <Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
        <DialogContent className="bg-[#0b1220] text-gray-100">
          <DialogHeader>
            <DialogTitle>افزودن گزارش جدید</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div>
              <Label>عنوان</Label>
              <Input type="text" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
            </div>
            <div>
              <Label>تعداد</Label>
              <Input
                type="number"
                value={newItem.count}
                onChange={(e) => setNewItem({ ...newItem, count: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>توضیحات</Label>
              <Input type="text" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              بستن
            </Button>
            <Button
              onClick={() => {
                addMutation.mutate(newItem);
                setShowAdd(false);
                setNewItem({ category: "", count: 0, description: "" });
              }}
            >
              ذخیره
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="bg-[#0b1220] text-gray-100">
          <DialogHeader>
            <DialogTitle>ویرایش گزارش</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2 text-sm">
              <div>
                <Label>عنوان</Label>
                <Input type="text" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div>
                <Label>تعداد</Label>
                <Input
                  type="number"
                  value={editing.count}
                  onChange={(e) => setEditing({ ...editing, count: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>توضیحات</Label>
                <Input type="text" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              بستن
            </Button>
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

      <Dialog open={!!drillDownItem} onOpenChange={(open) => { if (!open) setDrillDownItem(null); }}>
        <DialogContent className="bg-[#0b1220] text-gray-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>جزئیات گزارش</DialogTitle>
          </DialogHeader>
          {drillDownItem && (
            <div className="py-2 text-sm">
              <p className="mb-2">
                <span className="font-medium">عنوان:</span> {drillDownItem.category} -<span className="font-medium"> مقدار:</span>{" "}
                {drillDownItem.count}
              </p>
              {drillDownItem.subData ? (
                <ul className="list-inside list-disc space-y-1">
                  {drillDownItem.subData.map((sub) => (
                    <li key={sub.id}>
                      {sub.category}: <span className="text-teal-400">{sub.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>داده جزئی وجود ندارد.</p>
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
