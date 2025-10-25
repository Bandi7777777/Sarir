"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import "./reports.neon.css";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Calendar, Download, Search, SortAsc, SortDesc, BarChart2,
  Users, FileText, TrendingUp, Edit, Trash, Plus,
  AlertTriangle, CheckSquare, Square, RotateCcw, ListFilter,
  Settings2, Columns, Layers, Share2, X, Check, Pencil, Play, Clock, Building2, Filter,
  Activity, Briefcase, UserCheck, DollarSign, Globe, Star, AlertOctagon, PieChartIcon,
  UsersRound, BadgeCheck, BriefcaseBusiness, Rotate3D, BarChart3, LineChartIcon, RadarIcon,
  FileWarning, Cake, Stethoscope, ClipboardCheck, Award, ClipboardList, HeartPulse, Brain, Upload
} from "lucide-react";
import { motion } from "framer-motion";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

/* UI kit پروژه */
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

/* Recharts فقط کلاینت */
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const Line       = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const XAxis      = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis      = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const Grid       = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const TooltipR   = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const LegendR    = dynamic(() => import("recharts").then(m => m.Legend), { ssr: false });
const BarChart   = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar        = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const PieChart   = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie        = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const RadarChart = dynamic(() => import("recharts").then(m => m.RadarChart), { ssr: false });
const Radar      = dynamic(() => import("recharts").then(m => m.Radar), { ssr: false });
const RadialBarChart = dynamic(() => import("recharts").then(m => m.RadialBarChart), { ssr: false });
const RadialBar  = dynamic(() => import("recharts").then(m => m.RadialBar), { ssr: false });
const ScatterChart = dynamic(() => import("recharts").then(m => m.ScatterChart), { ssr: false });
const Scatter    = dynamic(() => import("recharts").then(m => m.Scatter), { ssr: false });
const AreaChart  = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area       = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });

/* Types & Mock API pipe */
import { api } from "@/lib/api";
import type { Report } from "@/app/api/reports/route";

type Density = "comfort" | "dense" | "compact";
type ColumnsVisibility = { category: boolean; count: boolean; description: boolean; trend: boolean; alert: boolean; subMetrics: boolean };
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

type Trend = { month: string; count: number; secondary: number };
const trendData: Trend[] = [
  { month: "فروردین", count: 20, secondary: 15 }, { month: "اردیبهشت", count: 30, secondary: 25 }, { month: "خرداد", count: 25, secondary: 20 },
  { month: "تیر", count: 40, secondary: 35 }, { month: "مرداد", count: 35, secondary: 30 }, { month: "شهریور", count: 50, secondary: 45 }
];

const STORAGE_KEY = "sarir_reports_filters_hr_board_neon";
const VIEWS_KEY   = "sarir_reports_saved_views_hr_board_neon";

const reportsKey = ["reports"];
async function getReports() { return api<Report[]>("/api/reports"); }
async function createReport(body: Omit<Report, "id">) { return api<Report>("/api/reports", { method: "POST", body: JSON.stringify(body) }); }
async function updateReport(body: Report) { return api<Report>("/api/reports", { method: "PUT", body: JSON.stringify(body) }); }
async function removeReport(id: number) { return api<{ id: number }>("/api/reports", { method: "DELETE", body: JSON.stringify({ id }) }); }

/* URL sync ساده */
function useURLSync(state: {
  searchTerm: string; setSearchTerm: (v: string) => void;
  selectedCategory: string | null; setSelectedCategory: (v: string | null) => void;
  sortOrder: "asc" | "desc"; setSortOrder: (v: "asc" | "desc") => void;
}) {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("q", state.searchTerm);
    url.searchParams.set("cat", state.selectedCategory ?? "");
    url.searchParams.set("sort", state.sortOrder);
    history.replaceState(null, "", url.toString());
  }, [state.searchTerm, state.selectedCategory, state.sortOrder]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const q   = url.searchParams.get("q") ?? "";
    const cat = url.searchParams.get("cat");
    const srt = (url.searchParams.get("sort") as "asc" | "desc") ?? "desc";
    state.setSearchTerm(q);
    state.setSelectedCategory(cat || null);
    state.setSortOrder(srt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* گزارش‌های آماده: Focused on Personnel Management and Board */
const READY_REPORTS: { id: string; title: string; icon: JSX.Element; apply: (ctx: ApplyContext) => void; type: "personnel" | "board" }[] = [
  // Personnel Management Reports
  { id: "birthdays-month", title: "تولدهای ماه جاری", icon: <Cake size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("birthdays-month"); setColumns({ category:true, count:false, description:true, trend: false, alert: false, subMetrics: false });
    } },
  { id: "file-deficiencies", title: "نواقص پرونده پرسنلی", icon: <FileWarning size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("file-deficiencies"); setColumns({ category:true, count:true, description:true, trend: false, alert: true, subMetrics: true });
    } },
  { id: "contract-expiry-30d", title: "پایان قراردادها (≤۳۰ روز)", icon: <Clock size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns, setSortOrder }) => {
      setSelectedCategory("contract-expiry-30d"); setColumns({ category:true, count:false, description:true, trend: false, alert: true, subMetrics: false }); setSortOrder("asc");
    } },
  { id: "probation-30d", title: "پایان دوره آزمایشی (≤۳۰ روز)", icon: <Clock size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("probation-30d"); setColumns({ category:true, count:false, description:true, trend: false, alert: true, subMetrics: true });
    } },
  { id: "training-expiry-30d", title: "گواهی/آموزش رو به انقضا", icon: <FileText size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("training-expiry-30d"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "attendance-month", title: "خلاصه غیبت/اضافه‌کار (ماه)", icon: <TrendingUp size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns, setSortOrder }) => {
      setSelectedCategory("attendance-month"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true }); setSortOrder("desc");
    } },
  { id: "headcount-by-unit", title: "نفرات به تفکیک واحد", icon: <Building2 size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("headcount-by-unit"); setColumns({ category:true, count:true, description:false, trend: true, alert: false, subMetrics: true });
    } },
  { id: "performance-evaluations", title: "ارزیابی عملکرد پرسنل", icon: <ClipboardCheck size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("performance-evaluations"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "incentive-programs", title: "برنامه‌های تشویقی و پاداش", icon: <Award size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("incentive-programs"); setColumns({ category:true, count:true, description:true, trend: true, alert: false, subMetrics: true });
    } },
  { id: "employee-surveys", title: "نتایج نظرسنجی پرسنل", icon: <ClipboardList size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("employee-surveys"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "health-wellness", title: "برنامه‌های سلامت و تندرستی", icon: <HeartPulse size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("health-wellness"); setColumns({ category:true, count:true, description:true, trend: true, alert: false, subMetrics: true });
    } },
  { id: "turnover-rate", title: "نرخ جابجایی کارکنان", icon: <Activity size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("turnover-rate"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "recruitment-metrics", title: "معیارهای استخدام و نگهداری", icon: <Briefcase size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("recruitment-metrics"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "diversity-index", title: "شاخص تنوع نیروی کار", icon: <Globe size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("diversity-index"); setColumns({ category:true, count:true, description:true, trend: true, alert: false, subMetrics: true });
    } },
  { id: "training-effectiveness", title: "اثربخشی آموزش‌ها", icon: <Star size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("training-effectiveness"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "employee-engagement", title: "سطح تعامل کارکنان", icon: <UserCheck size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("employee-engagement"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "cost-per-hire", title: "هزینه هر استخدام", icon: <DollarSign size={16}/>, type: "personnel",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("cost-per-hire"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  // Board Reports
  { id: "board-meetings", title: "تقویم جلسات هیئت‌مدیره", icon: <Calendar size={16}/>, type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("board-meetings"); setColumns({ category:true, count:false, description:true, trend: false, alert: true, subMetrics: false });
    } },
  { id: "board-resolutions", title: "مصوبات هیئت‌مدیره", icon: <Check size={16}/>, type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("board-resolutions"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "compliance-alerts", title: "هشدارهای انطباق قانونی", icon: <AlertOctagon size={16}/>, type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("compliance-alerts"); setColumns({ category:true, count:true, description:true, trend: false, alert: true, subMetrics: true });
    } },
  { id: "hr-financial-reports", title: "گزارش‌های مالی HR", icon: <DollarSign size={16}/>, type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("hr-financial-reports"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "risk-reports", title: "گزارش‌های ریسک منابع انسانی", icon: <AlertTriangle size={16}/>, type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("risk-reports"); setColumns({ category:true, count:true, description:true, trend: true, alert: true, subMetrics: true });
    } },
  { id: "strategic-hr-plans", title: "برنامه‌های استراتژیک HR", icon: <ClipboardList size={16}/>, type: "board",
    apply: ({ setSelectedCategory, setColumns }) => {
      setSelectedCategory("strategic-hr-plans"); setColumns({ category:true, count:true, description:true, trend: true, alert: false, subMetrics: true });
    } },
];

/* Main */
export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { data: reports, isLoading } = useQuery({ queryKey: reportsKey, queryFn: getReports });
  const addMutation = useMutation({ mutationFn: createReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: reportsKey }) });
  const updateMutation = useMutation({ mutationFn: updateReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: reportsKey }) });
  const deleteMutation = useMutation({ mutationFn: removeReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: reportsKey }) });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [countRange, setCountRange] = useState<[number, number]>([0, 100]);
  const [density, setDensity] = useState<Density>("comfort");
  const [columnsVis, setColumnsVis] = useState<ColumnsVisibility>({ category: true, count: true, description: true, trend: true, alert: true, subMetrics: true });
  const [savedViews, setSavedViews] = useState<ViewPreset[]>([]);
  const [editing, setEditing] = useState<Report | null>(null);
  const [newItem, setNewItem] = useState<Omit<Report, "id">>({ category: "", count: 0, description: "" });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [realTime, setRealTime] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "charts" | "summary" | "advanced">("table");
  const [customFilter, setCustomFilter] = useState<{ [key: string]: string }>({});
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv" | "json">("pdf");
  const [selectedType, setSelectedType] = useState<"personnel" | "board" | "all">("all");
  const [drillDownItem, setDrillDownItem] = useState<Report | null>(null);
  const [aiPrediction, setAiPrediction] = useState<string>("");
  const [importFile, setImportFile] = useState<File | null>(null);

  useURLSync({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, sortOrder, setSortOrder });

  useEffect(() => {
    if (realTime) {
      const interval = setInterval(() => queryClient.invalidateQueries({ queryKey: reportsKey }), 5000);
      return () => clearInterval(interval);
    }
  }, [realTime, queryClient]);

  useEffect(() => {
    // Load saved views from storage
    const stored = localStorage.getItem(VIEWS_KEY);
    if (stored) setSavedViews(JSON.parse(stored));
  }, []);

  const filteredReports = useMemo(() => READY_REPORTS.filter(r => selectedType === "all" || r.type === selectedType), [selectedType]);

  const filteredData = useMemo(() => (reports ?? [])
    .filter(i => i.category.includes(searchTerm) && (!selectedCategory || i.category === selectedCategory) && i.count >= countRange[0] && i.count <= countRange[1] && Object.entries(customFilter).every(([k, v]) => String(i[k as keyof Report]).includes(v)))
    .sort((a, b) => sortOrder === "asc" ? a.count - b.count : b.count - a.count), [reports, searchTerm, selectedCategory, sortOrder, countRange, customFilter]);

  const filteredTrendData = useMemo(() => trendData.map(d => ({ ...d, count: selectedCategory ? d.count * Math.random() * 1.2 : d.count, secondary: d.secondary * Math.random() })), [selectedCategory]);
  const pieData = useMemo(() => filteredData.map(i => ({ name: i.category, value: i.count })), [filteredData]);
  const radarData = useMemo(() => [
    { subject: "Diversity", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    { subject: "Engagement", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    { subject: "Performance", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    { subject: "Retention", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    { subject: "Cost Efficiency", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
  ], []);
  const radialData = useMemo(() => [
    { name: "Engagement", value: Math.random() * 100, fill: "#7ad7f0" },
    { name: "Satisfaction", value: Math.random() * 100, fill: "#ffc78a" },
  ], []);
  const scatterData = useMemo(() => filteredData.map(i => ({ x: i.count, y: Math.random() * i.count, z: i.category })), [filteredData]);
  const areaData = useMemo(() => trendData.map(d => ({ ...d, area1: d.count * 0.8, area2: d.secondary * 1.2 })), []);

  const columns: ColumnDef<Report>[] = [
    { accessorKey: "category", header: "عنوان/گروه" },
    { accessorKey: "count", header: "عدد" },
    { accessorKey: "description", header: "توضیحات" },
    { id: "trend", header: "روند", cell: () => <TrendingUp size={16} className="badge-teal" /> },
    { id: "alert", header: "هشدار", cell: ({ row }) => row.original.count > 50 ? <AlertTriangle size={16} className="text-red-400" /> : null },
    { id: "subMetrics", header: "زیرمعیارها", cell: ({ row }) => <button onClick={() => setDrillDownItem(row.original)}><BarChart2 size={16} className="badge-orange" /></button> },
    { id: "actions", cell: ({ row }) => (
      <div className="flex gap-1">
        <button className="chip" onClick={() => setEditing(row.original)}><Pencil size={14}/></button>
        <button className="chip" onClick={() => deleteMutation.mutate(row.original.id)}><Trash size={14}/></button>
      </div>
    ) }
  ];

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => density === "dense" ? 36 : density === "compact" ? 28 : 48, overscan: 30 });
  const { getVirtualItems, getTotalSize } = rowVirtualizer;
  const paddingTop = getVirtualItems().length > 0 ? getVirtualItems()[0]?.start ?? 0 : 0;
  const paddingBottom = getVirtualItems().length > 0 ? getTotalSize() - (getVirtualItems()[getVirtualItems().length - 1]?.end ?? 0) : 0;

  const toggleOne = (id: number) => setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const saveView = (name: string) => {
    const view: ViewPreset = { name, sortOrder, searchTerm, selectedCategory, countRange, density, columns: columnsVis, builderDims: [], builderMs: [], customFilters: customFilter };
    setSavedViews([...savedViews, view]);
    localStorage.setItem(VIEWS_KEY, JSON.stringify([...savedViews, view]));
  };

  const loadView = (view: ViewPreset) => {
    setSortOrder(view.sortOrder);
    setSearchTerm(view.searchTerm);
    setSelectedCategory(view.selectedCategory);
    setCountRange(view.countRange);
    setDensity(view.density);
    setColumnsVis(view.columns);
    setCustomFilter(view.customFilters);
  };

  const generateAiPrediction = () => {
    // Simulate AI prediction for turnover or deficiencies
    setAiPrediction("پیش‌بینی AI: نرخ جابجایی ۱۰% افزایش خواهد یافت اگر نواقص پرونده رفع نشود.");
    toast.success("پیش‌بینی AI تولید شد!");
  };

  const handleImport = () => {
    if (importFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const importedData = XLSX.utils.sheet_to_json(sheet);
        // Simulate adding to API
        importedData.forEach((item: any) => addMutation.mutate(item));
        toast.success("داده‌ها ایمپورت شد!");
      };
      reader.readAsBinaryString(importFile);
    }
  };

  const exportData = () => {
    const data = filteredData;
    if (exportFormat === "pdf") downloadPDF(data);
    else if (exportFormat === "excel") downloadExcel(data);
    else if (exportFormat === "csv") downloadCSV(data);
    else if (exportFormat === "json") {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "reports.json"; a.click();
      toast.success("JSON دانلود شد!");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen text-[#cfe3ff]">در حال بارگذاری...</div>;

  return (
    <div className="reports-neon">
      <div className="orb orb--teal" />
      <div className="orb orb--orange" />
      <div className="orb orb--blue" />
      <div className="orb orb--purple" />
      <div className="orb orb--green" />
      <main className="container mx-auto p-6 md:p-8">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 neon-glow-text"
        >
          <h1 className="text-3xl font-bold text-[#e6f0ff] mb-2">داشبورد مدیریت پرسنلی و هیئت مدیره</h1>
          <p className="text-sm text-[#9aa5b1]">تمرکز روی مدیریت پرسنل: مدیریت تولدها، نواقص پرونده، قراردادها، و مسائل هیئت مدیره - با قابلیت‌های حرفه‌ای</p>
        </motion.header>

        {/* Report Type Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <Select value={selectedType} onValueChange={(v: "personnel" | "board" | "all") => setSelectedType(v)}>
            <SelectTrigger className="chip"><SelectValue placeholder="نوع گزارش" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="personnel">مدیریت پرسنلی</SelectItem>
              <SelectItem value="board">هیئت مدیره</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* KPI Cards - Focused on personnel and board */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="kpi p-4">
            <p className="kpi__title">تعداد گزارش‌ها</p>
            <p className="kpi__value">{filteredData.length}</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="kpi p-4">
            <p className="kpi__title">نواقص پرونده</p>
            <p className="kpi__value">12</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="kpi p-4">
            <p className="kpi__title">تولدهای ماه</p>
            <p className="kpi__value">8</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="kpi p-4">
            <p className="kpi__title">پایان قراردادها</p>
            <p className="kpi__value">5</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="kpi p-4">
            <p className="kpi__title">جلسات هیئت</p>
            <p className="kpi__value">3</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="kpi p-4">
            <p className="kpi__title">مصوبات</p>
            <p className="kpi__value">7</p>
          </motion.div>
        </motion.section>

        {/* Toolbar - Enhanced with custom filters and export options */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="toolbar mb-6"
        >
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa5b1]" />
            <Input placeholder="جستجو..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none" />
          </div>
          <Select value={selectedCategory || "all"} onValueChange={v => setSelectedCategory(v === "all" ? null : v)}>
            <SelectTrigger className="chip"><SelectValue placeholder="دسته" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              {filteredReports.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <button className="chip" onClick={() => setSortOrder(p => p === "asc" ? "desc" : "asc")}>
            {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />} مرتب‌سازی
          </button>
          <Popover>
            <PopoverTrigger asChild><button className="chip"><Filter size={16} /> فیلتر تعداد</button></PopoverTrigger>
            <PopoverContent className="glass p-4">
              <Slider value={countRange} onValueChange={setCountRange} min={0} max={100} step={1} className="w-48" />
              <p className="text-center text-sm mt-2">{countRange[0]} - {countRange[1]}</p>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2">
            <Switch checked={realTime} onCheckedChange={setRealTime} />
            <Label className="text-sm">به‌روزرسانی زنده</Label>
          </div>
          <Popover>
            <PopoverTrigger asChild><button className="chip"><Columns size={16} /> ستون‌ها</button></PopoverTrigger>
            <PopoverContent className="glass p-4"><ColumnToggles columns={columnsVis} onChange={setColumnsVis} /></PopoverContent>
          </Popover>
          <button className="chip" onClick={() => setDensity(p => p === "dense" ? "comfort" : p === "comfort" ? "compact" : "dense")}>
            <Layers size={16} /> {density}
          </button>
          <Popover>
            <PopoverTrigger asChild><button className="chip"><Settings2 size={16} /> فیلتر سفارشی</button></PopoverTrigger>
            <PopoverContent className="glass p-4 space-y-2">
              <Input placeholder="فیلتر category" onChange={e => setCustomFilter({...customFilter, category: e.target.value})} />
              <Input placeholder="فیلتر description" onChange={e => setCustomFilter({...customFilter, description: e.target.value})} />
            </PopoverContent>
          </Popover>
          <Select value={exportFormat} onValueChange={(v: "pdf" | "excel" | "csv" | "json") => setExportFormat(v)}>
            <SelectTrigger className="chip"><SelectValue placeholder="فرمت اکسپورت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <button className="chip" onClick={exportData}><Download size={16} /> اکسپورت</button>
          <button className="chip" onClick={() => toast.success("اشتراک‌گذاری لینک")}><Share2 size={16} /> اشتراک</button>
          <button className="chip" onClick={generateAiPrediction}><Brain size={16} /> پیش‌بینی AI</button>
          <Input type="file" accept=".csv,.xlsx" onChange={e => setImportFile(e.target.files?.[0] || null)} className="chip" />
          <button className="chip" onClick={handleImport}><Upload size={16} /> ایمپورت داده</button>
        </motion.section>

        {/* Tabs - Added advanced tab for custom views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="tablist mb-6 grid-cols-4"
        >
          <button className="tab" data-active={viewMode === "table"} onClick={() => setViewMode("table")}>جدول</button>
          <button className="tab" data-active={viewMode === "charts"} onClick={() => setViewMode("charts")}>چارت‌ها</button>
          <button className="tab" data-active={viewMode === "summary"} onClick={() => setViewMode("summary")}>خلاصه</button>
          <button className="tab" data-active={viewMode === "advanced"} onClick={() => setViewMode("advanced")}>پیشرفته</button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {viewMode === "table" && (
            <div className="table-wrap">
              <div className="table-head p-4 flex justify-between">
                <h2 className="text-sm font-medium text-[#cfe3ff]">گزارش‌ها ({filteredData.length})</h2>
                <button className="chip" onClick={()=>{
                  if (selectedIds.size === filteredData.length) setSelectedIds(new Set());
                  else setSelectedIds(new Set(filteredData.map(x=>x.id)));
                }}>
                  {selectedIds.size === filteredData.length && filteredData.length>0 ? <CheckSquare size={16}/> : <Square size={16}/>}
                  انتخاب همه
                </button>
              </div>

              <div ref={parentRef} style={{height: density === "dense" ? 360 : density === "compact" ? 300 : 460, overflow:'auto'}}>
                <table className="w-full text-sm">
                  <thead><tr>
                    <th className="py-3 px-4 w-[42px] text-right"></th>
                    {table.getHeaderGroups().map(hg => hg.headers.map(h => (
                      <th key={h.id} className="py-3 px-4 text-right">{h.isPlaceholder ? null : (h.column.columnDef.header as string)}</th>
                    )))}
                  </tr></thead>
                  <tbody>
                    {paddingTop>0 && <tr><td style={{height:paddingTop}} colSpan={table.getAllColumns().length+1}/></tr>}
                    {rowVirtualizer.getVirtualItems().map(vRow=>{
                      const row = table.getRowModel().rows[vRow.index];
                      const r = row.original as Report;
                      const checked = selectedIds.has(r.id);
                      return (
                        <motion.tr 
                          key={row.id} 
                          className="border-t border-[color:var(--sarir-border)] table-row"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <td className="py-2 px-4">
                            <button className="chip" onClick={()=>toggleOne(r.id)}>{checked ? <CheckSquare size={16}/> : <Square size={16}/>}</button>
                          </td>
                          {row.getVisibleCells().map(cell=>{
                            const key = cell.column.id as keyof Report;
                            const val = String(cell.getValue() ?? "");
                            return (
                              <td key={cell.id} className={`px-4 ${density === "dense" ? "py-2" : density === "compact" ? "py-1" : "py-3"} text-right`}>
                                {["category","count","description"].includes(key)
                                  ? <span>{val}</span>
                                  : (cell.getValue() as React.ReactNode)}
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                    {paddingBottom>0 && <tr><td style={{height:paddingBottom}} colSpan={table.getAllColumns().length+1}/></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === "charts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass p-4 neon-glow-panel"
              >
                <h3 className="mb-3 text-sm text-[#cfe3ff]">روند ماهانه {selectedCategory ? `— ${selectedCategory}` : ""}</h3>
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={areaData}>
                    <Grid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)"/>
                    <XAxis dataKey="month" stroke="#9aa5b1"/><YAxis stroke="#9aa5b1"/>
                    <TooltipR/><LegendR/>
                    <Area type="monotone" dataKey="area1" stackId="1" stroke="#7ad7f0" fill="#07657E" />
                    <Area type="monotone" dataKey="area2" stackId="1" stroke="#ffc78a" fill="#F2991F" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="glass p-4 neon-glow-panel"
              >
                <h3 className="mb-3 text-sm text-[#cfe3ff]">توزیع دسته‌ها</h3>
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130} fill="#ffc78a" label innerRadius={60} />
                    <TooltipR/>
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="glass p-4 neon-glow-panel"
              >
                <h3 className="mb-3 text-sm text-[#cfe3ff]">شاخص تنوع</h3>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#9aa5b1" />
                    <PolarAngleAxis dataKey="subject" stroke="#cfe3ff" />
                    <PolarRadiusAxis stroke="#cfe3ff" />
                    <Radar name="Current" dataKey="A" stroke="#7ad7f0" fill="#07657E" fillOpacity={0.6} />
                    <Radar name="Target" dataKey="B" stroke="#ffc78a" fill="#F2991F" fillOpacity={0.6} />
                    <LegendR />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="glass p-4 neon-glow-panel"
              >
                <h3 className="mb-3 text-sm text-[#cfe3ff]">سطح تعامل</h3>
                <ResponsiveContainer width="100%" height={340}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={20} data={radialData}>
                    <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                    <LegendR />
                  </RadialBarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="glass p-4 neon-glow-panel"
              >
                <h3 className="mb-3 text-sm text-[#cfe3ff]">نرخ جابجایی</h3>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={filteredData.slice(0,5)}>
                    <Grid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis dataKey="category" stroke="#9aa5b1" />
                    <YAxis stroke="#9aa5b1" />
                    <TooltipR />
                    <LegendR />
                    <Bar dataKey="count" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="glass p-4 neon-glow-panel"
              >
                <h3 className="mb-3 text-sm text-[#cfe3ff]">همبستگی معیارها</h3>
                <ResponsiveContainer width="100%" height={340}>
                  <ScatterChart>
                    <Grid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis type="number" dataKey="x" name="Count" stroke="#9aa5b1" />
                    <YAxis type="number" dataKey="y" name="Secondary" stroke="#9aa5b1" />
                    <TooltipR cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Metrics" data={scatterData} fill="#7ad7f0" />
                  </ScatterChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          )}

          {viewMode === "summary" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass p-4 neon-glow-panel"
            >
              <h3 className="text-sm text-[#cfe3ff] mb-2">خلاصهٔ گزارش‌ها</h3>
              <ul className="list-disc pr-5 space-y-1 text-[13px]">
                {filteredData.slice(0, 15).map(item => (
                  <li key={item.id}><span className="badge-teal">{item.category}:</span> {item.count} — {item.description}</li>
                ))}
              </ul>
              <div className="mt-4 bg-[rgba(242,153,31,0.1)] p-3 rounded-lg">
                <h4 className="text-sm font-medium text-[#ffc78a]">هشدارها:</h4>
                <ul className="space-y-1 text-[13px]">
                  {filteredData.filter(i => i.count > 50).map(item => (
                    <li key={item.id}>{item.category} بیش از آستانه ({item.count}) - اقدام پیشنهادی: بررسی فوری</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 bg-[rgba(7,101,126,0.1)] p-3 rounded-lg">
                <h4 className="text-sm font-medium text-[#7ad7f0]">بینش‌های کلیدی:</h4>
                <ul className="space-y-1 text-[13px]">
                  <li>روند افزایشی در تعامل کارکنان مشاهده می‌شود.</li>
                  <li>تنوع نیروی کار نیاز به بهبود دارد (کمتر از 70%).</li>
                  <li>نرخ جابجایی در 3 ماه اخیر 15% افزایش یافته.</li>
                </ul>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-[rgba(77,168,255,0.1)]">
                <h4 className="text-sm font-medium text-[#4DA8FF]">پیش‌بینی AI:</h4>
                <p>{aiPrediction}</p>
              </div>
            </motion.div>
          )}

          {viewMode === "advanced" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass p-4 neon-glow-panel space-y-4"
            >
              <h3 className="text-sm text-[#cfe3ff]">ویوهای ذخیره‌شده</h3>
              <div className="grid grid-cols-2 gap-4">
                {savedViews.map((view, i) => (
                  <button key={i} className="chip" onClick={() => loadView(view)}>{view.name}</button>
                ))}
              </div>
              <Input placeholder="نام ویو جدید" onKeyDown={(e) => e.key === "Enter" && saveView(e.target.value)} />
              <button className="chip" onClick={() => toast.success("ویو ذخیره شد")}>ذخیره ویو فعلی</button>
            </motion.div>
          )}
        </motion.section>

        {/* Drill-down Modal for Sub-Metrics */}
        {drillDownItem && (
          <Dialog open={!!drillDownItem} onOpenChange={() => setDrillDownItem(null)}>
            <DialogContent className="glass neon-glow-panel">
              <DialogHeader><DialogTitle>زیرمعیارهای {drillDownItem.category}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <p>جزئیات نواقص یا زیرگزارش‌ها اینجا نمایش داده می‌شود (داده‌های نمونه).</p>
                <ul className="list-disc pr-5">
                  <li>نواقص پرونده: ۵ مورد</li>
                  <li>تولدهای نزدیک: ۳ پرسنل</li>
                  <li>پیشنهاد AI: بررسی پرونده‌ها و برنامه‌ریزی جشن تولد.</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* FAB */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="chip neon-glow-fab" style={{position:'fixed', left:16, bottom:16}}>
              <Plus size={16}/> ردیف جدید
            </button>
          </DialogTrigger>
          <DialogContent className="glass neon-glow-panel">
            <DialogHeader><DialogTitle>افزودن ردیف</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="عنوان/گروه" value={newItem.category} onChange={e=>setNewItem(s=>({ ...s, category:e.target.value }))} className="bg-transparent"/>
              <Input type="number" placeholder="عدد" value={newItem.count} onChange={e=>setNewItem(s=>({ ...s, count:Number(e.target.value) }))} className="bg-transparent"/>
              <Input placeholder="توضیحات" value={newItem.description} onChange={e=>setNewItem(s=>({ ...s, description:e.target.value }))} className="bg-transparent"/>
              <button className="chip" onClick={()=> addMutation.mutate(newItem)}><Check size={16}/> ذخیره</button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        {editing && (
          <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
            <DialogContent className="glass neon-glow-panel">
              <DialogHeader><DialogTitle>ویرایش ردیف</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input value={editing.category} onChange={e=>setEditing(s=>({ ...s, category:e.target.value }))} className="bg-transparent"/>
                <Input type="number" value={editing.count} onChange={e=>setEditing(s=>({ ...s, count:Number(e.target.value) }))} className="bg-transparent"/>
                <Input value={editing.description} onChange={e=>setEditing(s=>({ ...s, description:e.target.value }))} className="bg-transparent"/>
                <button className="chip" onClick={()=> { updateMutation.mutate(editing); setEditing(null); }}><Check size={16}/> بروزرسانی</button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}

/* Toggles - Expanded with new column */
function ColumnToggles({ columns, onChange }: { columns: ColumnsVisibility; onChange: (v: ColumnsVisibility)=>void }) {
  return (
    <div className="space-y-2 text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" checked={columns.category}    onChange={e=>onChange({ ...columns, category: e.target.checked })}/> عنوان/گروه</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={columns.count}       onChange={e=>onChange({ ...columns, count: e.target.checked })}/> عدد</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={columns.description} onChange={e=>onChange({ ...columns, description: e.target.checked })}/> توضیحات</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={columns.trend}       onChange={e=>onChange({ ...columns, trend: e.target.checked })}/> روند</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={columns.alert}       onChange={e=>onChange({ ...columns, alert: e.target.checked })}/> هشدار</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={columns.subMetrics}  onChange={e=>onChange({ ...columns, subMetrics: e.target.checked })}/> زیرمعیارها</label>
    </div>
  );
}

/* Types */
type ApplyContext = {
  setSelectedCategory: (v: string | null) => void;
  setColumns: (v: ColumnsVisibility) => void;
  setSortOrder: (v: "asc" | "desc") => void;
};

/* Exports - Added JSON */
function downloadPDF(rows: Report[]) {
  const doc = new jsPDF();
  doc.text("گزارش مدیریت پرسنلی", 105, 10, { align: "center" });
  const tableData = rows.map(i => [i.count, i.category, i.description]);
  (doc as any).autoTable({ head: [["عدد", "عنوان/گروه", "توضیحات"]], body: tableData });
  doc.save("personnel-reports.pdf");
  toast.success("PDF دانلود شد!");
}
function downloadExcel(rows: Report[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Personnel Reports");
  XLSX.writeFile(wb, "personnel-reports.xlsx");
  toast.success("Excel دانلود شد!");
}
function downloadCSV(rows: Report[]) {
  const csv = rows.map(i => `${i.category},${i.count},${i.description}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "personnel-reports.csv"; a.click();
  toast.success("CSV دانلود شد!");
}