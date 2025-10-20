"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Calendar, Download, Search, SortAsc, SortDesc, BarChart2, Users, FileText, TrendingUp, Edit, Trash, Plus, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Added for data fetching and mutations
import { ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table"; // Added for advanced table

// Assuming these are from Shadcn/UI or similar; adjust imports as needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Added for modals
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider"; // Added for range filters
import { Switch } from "@/components/ui/switch"; // Added for toggles

const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false }); // Added
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false }); // Added
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false }); // Added
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false }); // Added
const Sector = dynamic(() => import("recharts").then(mod => mod.Sector), { ssr: false }); // For interactive pie

/* ─────────────── Theme helpers ─────────────── */
const GLASS = "backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,.3)] glow-border";
const PANELBG = "bg-white/10 dark:bg-white/10";

/* ─────────────── Animations ─────────────── */
const rise = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };

interface ReportData {
  id: number; // Added for unique keys and CRUD
  category: string;
  count: number;
  description: string;
  subData?: ReportData[]; // For drill-down
}

interface TrendData {
  month: string;
  count: number;
}

const initialReportData: ReportData[] = [
  { id: 1, category: "داخلی", count: 50, description: "گزارش‌های داخلی سازمان", subData: [{ id: 11, category: "زیرمجموعه 1", count: 20, description: "" }, { id: 12, category: "زیرمجموعه 2", count: 30, description: "" }] },
  { id: 2, category: "قراردادها", count: 30, description: "اطلاعات قراردادهای پرسنلی", subData: [{ id: 21, category: "زیرمجموعه A", count: 15, description: "" }, { id: 22, category: "زیرمجموعه B", count: 15, description: "" }] },
  { id: 3, category: "اطلاعات پرسنلی", count: 45, description: "جزئیات شخصی کارکنان" },
  { id: 4, category: "اطلاعات آدرس و تماس", count: 40, description: "آدرس و اطلاعات تماس" },
  { id: 5, category: "اطلاعات بانکی", count: 35, description: "جزئیات حساب‌های بانکی" },
  { id: 6, category: "پزشکی", count: 25, description: "گزارش‌های پزشکی و سلامت" },
];

const trendData: TrendData[] = [
  { month: "فروردین", count: 20 },
  { month: "اردیبهشت", count: 30 },
  { month: "خرداد", count: 25 },
  { month: "تیر", count: 40 },
  { month: "مرداد", count: 35 },
  { month: "شهریور", count: 50 },
];

// Simulate API fetch function
const fetchReports = async (): Promise<ReportData[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(initialReportData), 500));
};

// Simulate CRUD mutations
const updateReport = async (updated: ReportData): Promise<ReportData> => updated;
const deleteReport = async (id: number): Promise<number> => id;
const addReport = async (newReport: Omit<ReportData, "id">): Promise<ReportData> => ({ ...newReport, id: Date.now() });

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { data: reportData, isLoading } = useQuery({ queryKey: ["reports"], queryFn: fetchReports });
  const updateMutation = useMutation({ mutationFn: updateReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }) });
  const deleteMutation = useMutation({ mutationFn: deleteReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }) });
  const addMutation = useMutation({ mutationFn: addReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }) });

  const [data, setData] = useState<ReportData[]>(reportData || []);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [viewMode, setViewMode] = useState<"table" | "chart" | "summary">("table");
  const [countRange, setCountRange] = useState<[number, number]>([0, 100]); // Added for slider filter
  const [realTime, setRealTime] = useState(false); // Toggle for simulated real-time
  const [editingItem, setEditingItem] = useState<ReportData | null>(null); // For edit modal
  const [newItem, setNewItem] = useState<Omit<ReportData, "id">>({ category: "", count: 0, description: "" }); // For add modal
  const [drillDownData, setDrillDownData] = useState<ReportData[] | null>(null); // For drill-down

  useEffect(() => {
    if (reportData) setData(reportData);
  }, [reportData]);

  useEffect(() => {
    if (realTime) {
      const interval = setInterval(() => {
        setData(prev => prev.map(item => ({ ...item, count: item.count + Math.floor(Math.random() * 5 - 2) })));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [realTime]);

  const filteredData = useMemo(() => {
    return data
      .filter(item => item.category.includes(searchTerm) && item.count >= countRange[0] && item.count <= countRange[1])
      .sort((a, b) => sortOrder === "asc" ? a.count - b.count : b.count - a.count);
  }, [data, searchTerm, sortOrder, countRange]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("گزارش پرسنلی", 105, 10, { align: "center" });
    const tableData = filteredData.map((item) => [item.count, item.category, item.description]);
    (doc as any).autoTable({
      head: [["تعداد", "دسته‌بندی", "توضیحات"]],
      body: tableData,
    });
    doc.save("reports.pdf");
    toast.success("PDF دانلود شد!");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش‌ها");
    XLSX.writeFile(workbook, "reports.xlsx");
    toast.success("Excel دانلود شد!");
  };

  const downloadCSV = () => {
    const csv = filteredData.map(item => `${item.category},${item.count},${item.description}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    toast.success("CSV دانلود شد!");
  };

  const metrics = useMemo(() => [
    { title: "تعداد گزارش‌ها", value: filteredData.length.toString(), icon: <FileText className="w-6 h-6" />, iconColor: "#07657E" },
    { title: "مجموع تعداد", value: filteredData.reduce((acc, item) => acc + item.count, 0).toString(), icon: <Users className="w-6 h-6" />, iconColor: "#4DA8FF" },
    { title: "میانگین تعداد", value: (filteredData.reduce((acc, item) => acc + item.count, 0) / filteredData.length || 0).toFixed(2), icon: <TrendingUp className="w-6 h-6" />, iconColor: "#FF6B6B" },
    { title: "بالاترین دسته", value: filteredData[0]?.category || "نامشخص", icon: <BarChart2 className="w-6 h-6" />, iconColor: "#34D399" },
    { title: "هشدارها", value: filteredData.filter(item => item.count > 40).length.toString(), icon: <AlertTriangle className="w-6 h-6" />, iconColor: "#EF4444" }, // Added alert metric
  ], [filteredData]);

  const filteredTrendData = useMemo(() => {
    if (!selectedCategory) return trendData;
    return trendData.map(data => ({ ...data, count: Math.floor(data.count * Math.random() * 1.5) }));
  }, [selectedCategory]);

  const pieData = useMemo(() => filteredData.map(item => ({ name: item.category, value: item.count })), [filteredData]);

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleEdit = (item: ReportData) => {
    setEditingItem(item);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    toast.success("گزارش حذف شد!");
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      updateMutation.mutate(editingItem);
      setEditingItem(null);
      toast.success("گزارش به‌روزرسانی شد!");
    }
  };

  const handleAdd = () => {
    addMutation.mutate(newItem);
    setNewItem({ category: "", count: 0, description: "" });
    toast.success("گزارش جدید اضافه شد!");
  };

  const handleDrillDown = (item: ReportData) => {
    if (item.subData) {
      setDrillDownData(item.subData);
      setSelectedCategory(item.category);
    }
  };

  // TanStack Table columns
  const columns: ColumnDef<ReportData>[] = [
    { accessorKey: "category", header: "دسته‌بندی" },
    { accessorKey: "count", header: "تعداد" },
    { accessorKey: "description", header: "توضیحات" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}><Edit size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)}><Trash size={16} /></Button>
          {row.original.subData && <Button variant="ghost" size="sm" onClick={() => handleDrillDown(row.original)}><BarChart2 size={16} /></Button>}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen">در حال بارگذاری...</div>;

  return (
    <div className="theme-light flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white animate-gradient-bg" dir="rtl">
      <div className="flex-1 p-4 md:p-8 space-y-8 transition-all duration-300">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-b-xl shadow-xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#07657E] dark:text-[#66B2FF] animate-neon-text">
            داشبورد گزارش‌های پرسنلی پیشرفته
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">تحلیل داده‌های سازمانی با ویژگی‌های حرفه‌ای: CRUD، Real-time، Drill-down</p>
        </motion.header>

        {/* Hero Stats with Cards */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              variants={rise}
              whileHover={{ scale: 1.05 }}
            >
              <Card className={`${GLASS} ${PANELBG}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{m.title}</CardTitle>
                  <div style={{ color: m.iconColor }}>{m.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: m.iconColor }}>{m.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* Advanced Controls */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-wrap gap-4 items-center"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="جستجو دسته‌بندی..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-[#07657E]"
            />
          </div>
          <Button
            onClick={toggleSort}
            variant="outline"
            className="text-[#07657E] border-[#07657E] flex items-center gap-2"
          >
            {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
            مرتب‌سازی ({sortOrder === "asc" ? "صعودی" : "نزولی"})
          </Button>
          <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="انتخاب دسته" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {data.map(item => (
                <SelectItem key={item.id} value={item.category}>{item.category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-[#07657E] border-[#07657E] flex items-center gap-2">
                <Calendar size={16} />
                محدوده تاریخ
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              />
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2">
            <Label>فیلتر تعداد: {countRange[0]} - {countRange[1]}</Label>
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              className="w-40"
              onValueChange={(val) => setCountRange(val as [number, number])}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={realTime} onCheckedChange={setRealTime} />
            <Label>به‌روزرسانی real-time</Label>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white flex items-center gap-2">
                <Plus size={16} /> اضافه کردن گزارش
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>اضافه کردن گزارش جدید</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="دسته‌بندی" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                <Input type="number" placeholder="تعداد" value={newItem.count} onChange={e => setNewItem({ ...newItem, count: Number(e.target.value) })} />
                <Input placeholder="توضیحات" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                <Button onClick={handleAdd}>ذخیره</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={downloadPDF}
            className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Download size={16} />
            PDF
          </Button>
          <Button
            onClick={downloadExcel}
            className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Download size={16} />
            Excel
          </Button>
          <Button
            onClick={downloadCSV}
            className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Download size={16} />
            CSV
          </Button>
        </motion.div>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="table" className="space-y-4" onValueChange={(val) => setViewMode(val as "table" | "chart" | "summary")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table">جدول پیشرفته</TabsTrigger>
            <TabsTrigger value="chart">چارت‌ها</TabsTrigger>
            <TabsTrigger value="summary">خلاصه و هشدارها</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="bg-white/80 backdrop-blur-md rounded-lg shadow-md overflow-x-auto mb-8"
            >
              <table className="w-full text-sm text-gray-800 table-auto">
                <thead>
                  <tr className="border-b bg-gray-100 dark:bg-gray-700">
                    {table.getHeaderGroups().map(headerGroup => (
                      headerGroup.headers.map(header => (
                        <th key={header.id} className="py-3 px-4 text-right">
                          {header.isPlaceholder ? null : header.column.columnDef.header}
                        </th>
                      ))
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <motion.tr
                      key={row.id}
                      whileHover={{ backgroundColor: "#F0FAFB" }}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="py-3 px-4 text-right">
                          {cell.renderValue() as React.ReactNode}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between p-4">
                <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>قبلی</Button>
                <span>صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}</span>
                <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>بعدی</Button>
              </div>
            </motion.div>
          </TabsContent>
          <TabsContent value="chart">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={stagger}
                className={`${GLASS} ${PANELBG} p-6`}
              >
                <h2 className="text-lg font-semibold mb-4 text-[#07657E]">روند تغییرات ماهانه {selectedCategory ? `برای ${selectedCategory}` : "کلی"}</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={filteredTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="month" stroke="#333" />
                    <YAxis stroke="#333" />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px", padding: "10px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#4DA8FF" activeDot={{ r: 7 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={stagger}
                className={`${GLASS} ${PANELBG} p-6`}
              >
                <h2 className="text-lg font-semibold mb-4 text-[#07657E]">توزیع دسته‌بندی‌ها (Pie Chart)</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={stagger}
                className={`${GLASS} ${PANELBG} p-6`}
              >
                <h2 className="text-lg font-semibold mb-4 text-[#07657E]">مقایسه تعداد (Bar Chart)</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#4DA8FF" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              {drillDownData && (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={stagger}
                  className={`${GLASS} ${PANELBG} p-6`}
                >
                  <h2 className="text-lg font-semibold mb-4 text-[#07657E]">Drill-down برای {selectedCategory}</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={drillDownData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#34D399" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Button onClick={() => setDrillDownData(null)} className="mt-4 bg-[#FF6B6B] text-white">بازگشت</Button>
                </motion.div>
              )}
              {selectedCategory && !drillDownData && (
                <Button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 bg-[#FF6B6B] text-white"
                >
                  بازگشت به روند کلی
                </Button>
              )}
            </div>
          </TabsContent>
          <TabsContent value="summary">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className={`${GLASS} ${PANELBG} p-6 space-y-4`}
            >
              <h2 className="text-lg font-semibold text-[#07657E]">خلاصه گزارش‌ها</h2>
              <p className="text-gray-700 dark:text-gray-300">این بخش خلاصه‌ای از داده‌های کلیدی ارائه می‌دهد. بیشترین تغییرات در ماه شهریور مشاهده شده است.</p>
              <ul className="list-disc pr-4 space-y-2">
                {filteredData.slice(0, 5).map(item => (
                  <li key={item.id} className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">{item.category}:</span> {item.count} مورد - {item.description}
                  </li>
                ))}
              </ul>
              <div className="bg-yellow-100 dark:bg-yellow-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">هشدارهای کلیدی:</h3>
                <ul className="list-disc pr-4">
                  {filteredData.filter(item => item.count > 40).map(item => (
                    <li key={item.id}>{item.category} بیش از حد انتظار ({item.count})</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ویرایش گزارش</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <Input value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} />
                <Input type="number" value={editingItem.count} onChange={e => setEditingItem({ ...editingItem, count: Number(e.target.value) })} />
                <Input value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} />
                <Button onClick={handleSaveEdit}>ذخیره تغییرات</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}