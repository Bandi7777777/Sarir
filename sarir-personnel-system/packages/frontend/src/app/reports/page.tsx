"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Calendar, Download, Search, SortAsc, SortDesc, BarChart2, Users, FileText,
  TrendingUp, Edit, Trash, Plus, AlertTriangle
} from "lucide-react";
import {
  useMutation, useQuery, useQueryClient
} from "@tanstack/react-query";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { api } from "@/lib/api";
import type { Report } from "@/app/api/reports/route";

// شِد‌سی‌ان / UI-kit شما
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

// Recharts (فقط کلاینت)
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(m => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });

/* ─────────────── Theme helpers ─────────────── */
const GLASS = "backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,.3)]";
const PANELBG = "bg-white/10 dark:bg-white/10";
const rise = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };

type Trend = { month: string; count: number };
const trendData: Trend[] = [
  { month: "فروردین", count: 20 }, { month: "اردیبهشت", count: 30 }, { month: "خرداد", count: 25 },
  { month: "تیر", count: 40 }, { month: "مرداد", count: 35 }, { month: "شهریور", count: 50 }
];

/* ====== Data hooks (API) ====== */
const reportsKey = ["reports"];

async function getReports() { return api<Report[]>("/api/reports"); }
async function createReport(body: Omit<Report, "id">) { return api<Report>("/api/reports", { method: "POST", body: JSON.stringify(body) }); }
async function updateReport(body: Report) { return api<Report>("/api/reports", { method: "PUT", body: JSON.stringify(body) }); }
async function removeReport(id: number) { return api<{ id: number }>("/api/reports", { method: "DELETE", body: JSON.stringify({ id }) }); }

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { data: reportData = [], isLoading } = useQuery({ queryKey: reportsKey, queryFn: getReports });

  // Optimistic mutations
  const addMutation = useMutation({
    mutationFn: createReport,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: reportsKey });
      const prev = queryClient.getQueryData<Report[]>(reportsKey) || [];
      const optimistic: Report = { id: Date.now(), ...newItem };
      queryClient.setQueryData(reportsKey, [optimistic, ...prev]);
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(reportsKey, ctx.prev); toast.error("ثبت ناموفق بود"); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: reportsKey }),
    onSuccess: () => toast.success("گزارش جدید اضافه شد!")
  });

  const updateMutation = useMutation({
    mutationFn: updateReport,
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: reportsKey });
      const prev = queryClient.getQueryData<Report[]>(reportsKey) || [];
      queryClient.setQueryData<Report[]>(reportsKey, prev.map(r => (r.id === updated.id ? updated : r)));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(reportsKey, ctx.prev); toast.error("به‌روزرسانی ناموفق بود"); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: reportsKey }),
    onSuccess: () => toast.success("گزارش به‌روزرسانی شد!")
  });

  const deleteMutation = useMutation({
    mutationFn: removeReport,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: reportsKey });
      const prev = queryClient.getQueryData<Report[]>(reportsKey) || [];
      queryClient.setQueryData<Report[]>(reportsKey, prev.filter(r => r.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(reportsKey, ctx.prev); toast.error("حذف ناموفق بود"); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: reportsKey }),
    onSuccess: () => toast.success("گزارش حذف شد!")
  });

  // UI state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [countRange, setCountRange] = useState<[number, number]>([0, 100]);
  const [realTime, setRealTime] = useState(false);
  const [editingItem, setEditingItem] = useState<Report | null>(null);
  const [newItem, setNewItem] = useState<Omit<Report, "id">>({ category: "", count: 0, description: "" });
  const [drillDownData, setDrillDownData] = useState<Report[] | null>(null);

  // Real-time demo
  useEffect(() => {
    if (!realTime) return;
    const t = setInterval(() => {
      queryClient.setQueryData<Report[]>(reportsKey, (prev = []) =>
        prev.map(i => ({ ...i, count: Math.max(0, i.count + Math.floor(Math.random() * 5 - 2)) }))
      );
    }, 5000);
    return () => clearInterval(t);
  }, [realTime, queryClient]);

  const data = reportData;

  const filteredData = useMemo(() => {
    return data
      .filter(i => i.category.includes(searchTerm) && i.count >= countRange[0] && i.count <= countRange[1])
      .sort((a, b) => (sortOrder === "asc" ? a.count - b.count : b.count - a.count));
  }, [data, searchTerm, countRange, sortOrder]);

  const filteredTrendData = useMemo(() => {
    if (!selectedCategory) return trendData;
    return trendData.map(d => ({ ...d, count: Math.floor(d.count * (0.7 + Math.random())) }));
  }, [selectedCategory]);

  const pieData = useMemo(() => filteredData.map(i => ({ name: i.category, value: i.count })), [filteredData]);

  // Virtualized Table
  const columns: ColumnDef<Report>[] = useMemo(() => ([
    { accessorKey: "category", header: "دسته‌بندی" },
    { accessorKey: "count", header: "تعداد" },
    { accessorKey: "description", header: "توضیحات" },
    {
      id: "actions",
      header: "اقدامات",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditingItem(row.original)}><Edit size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: row.original.id })}><Trash size={16} /></Button>
          {row.original.subData && (
            <Button variant="ghost" size="sm" onClick={() => { setDrillDownData(row.original.subData!); setSelectedCategory(row.original.category); }}>
              <BarChart2 size={16} />
            </Button>
          )}
        </div>
      )
    }
  ]), [deleteMutation]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  if (isLoading) return <div className="flex justify-center items-center h-screen">در حال بارگذاری...</div>;

  const toggleSort = () => setSortOrder(p => (p === "asc" ? "desc" : "asc"));
  const saveEdit = () => editingItem && updateMutation.mutate(editingItem);
  const add = () => newItem.category.trim() ? addMutation.mutate(newItem) : toast.error("دسته‌بندی را وارد کنید");

  const metrics = useMemo(() => ([
    { title: "تعداد گزارش‌ها", value: filteredData.length.toString(), icon: <FileText className="w-6 h-6" />, iconColor: "#07657E" },
    { title: "مجموع تعداد", value: filteredData.reduce((acc, i) => acc + i.count, 0).toString(), icon: <Users className="w-6 h-6" />, iconColor: "#4DA8FF" },
    { title: "میانگین تعداد", value: (filteredData.reduce((a,i)=>a+i.count,0) / (filteredData.length || 1)).toFixed(2), icon: <TrendingUp className="w-6 h-6" />, iconColor: "#FF6B6B" },
    { title: "بالاترین دسته", value: filteredData[0]?.category || "نامشخص", icon: <BarChart2 className="w-6 h-6" />, iconColor: "#34D399" },
    { title: "هشدارها", value: filteredData.filter(i => i.count > 40).length.toString(), icon: <AlertTriangle className="w-6 h-6" />, iconColor: "#EF4444" }
  ]), [filteredData]);

  return (
    <div className="theme-light flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white" dir="rtl">
      <div className="flex-1 p-4 md:p-8 space-y-8 transition-all duration-300">
        <motion.header initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration: .5 }}
          className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-b-xl shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[#07657E] dark:text-[#66B2FF]">داشبورد گزارش‌های پرسنلی پیشرفته</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">تحلیل داده‌های سازمانی با CRUD، Real-time، Drill-down</p>
        </motion.header>

        {/* KPI cards */}
        <motion.section initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={i} variants={rise} whileHover={{ scale: 1.05 }}>
              <Card className={`${GLASS} ${PANELBG}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{m.title}</CardTitle>
                  <div style={{ color: m.iconColor }}>{m.icon}</div>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold" style={{ color: m.iconColor }}>{m.value}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* Controls */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="جستجو دسته‌بندی..." className="pl-4 pr-10" />
          </div>

          <Button onClick={toggleSort} variant="outline" className="text-[#07657E] border-[#07657E] flex items-center gap-2">
            {sortOrder === "asc" ? <SortAsc size={16}/> : <SortDesc size={16}/>}
            مرتب‌سازی ({sortOrder === "asc" ? "صعودی" : "نزولی"})
          </Button>

          <Select value={selectedCategory || "all"} onValueChange={(v)=>setSelectedCategory(v==="all"?null:v)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="انتخاب دسته" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {data.map(i => <SelectItem key={i.id} value={i.category}>{i.category}</SelectItem>)}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-[#07657E] border-[#07657E] flex items-center gap-2">
                <Calendar size={16}/> محدوده تاریخ
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent mode="range" selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range)=>setDateRange({ from: range?.from, to: range?.to })} />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <Label>فیلتر تعداد: {countRange[0]} - {countRange[1]}</Label>
            <Slider defaultValue={[0,100]} max={100} step={1} className="w-40"
              onValueChange={(val)=>setCountRange(val as [number,number])} />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={realTime} onCheckedChange={setRealTime} />
            <Label>به‌روزرسانی Real-time</Label>
          </div>

          {/* Add dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white flex items-center gap-2">
                <Plus size={16}/> اضافه کردن گزارش
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>گزارش جدید</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="دسته‌بندی" value={newItem.category} onChange={e=>setNewItem(s=>({ ...s, category:e.target.value }))}/>
                <Input type="number" placeholder="تعداد" value={newItem.count} onChange={e=>setNewItem(s=>({ ...s, count:Number(e.target.value) }))}/>
                <Input placeholder="توضیحات" value={newItem.description} onChange={e=>setNewItem(s=>({ ...s, description:e.target.value }))}/>
                <Button onClick={add}>ذخیره</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Exports */}
          <Button onClick={()=>downloadPDF(filteredData)} className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white flex items-center gap-2">
            <Download size={16}/> PDF
          </Button>
          <Button onClick={()=>downloadExcel(filteredData)} className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white flex items-center gap-2">
            <Download size={16}/> Excel
          </Button>
          <Button onClick={()=>downloadCSV(filteredData)} className="bg-gradient-to-r from-[#07657E] to-[#4DA8FF] text-white flex items-center gap-2">
            <Download size={16}/> CSV
          </Button>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table">جدول پیشرفته</TabsTrigger>
            <TabsTrigger value="chart">چارت‌ها</TabsTrigger>
            <TabsTrigger value="summary">خلاصه و هشدارها</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
              className="bg-white/80 backdrop-blur-md rounded-lg shadow-md overflow-hidden">
              <div ref={parentRef} style={{ height: 440, overflow: "auto" }}>
                <table className="w-full text-sm text-gray-800 table-auto">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-gray-100">
                      {table.getHeaderGroups().map(hg =>
                        hg.headers.map(h => (
                          <th key={h.id} className="py-3 px-4 text-right">
                            {h.isPlaceholder ? null : (h.column.columnDef.header as string)}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paddingTop > 0 && <tr><td style={{ height: paddingTop }} colSpan={table.getAllColumns().length} /></tr>}
                    {rowVirtualizer.getVirtualItems().map(vRow => {
                      const row = table.getRowModel().rows[vRow.index];
                      return (
                        <tr key={row.id} className="border-b hover:bg-gray-50">
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="py-3 px-4 text-right">
                              {cell.getValue() as React.ReactNode}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    {paddingBottom > 0 && <tr><td style={{ height: paddingBottom }} colSpan={table.getAllColumns().length} /></tr>}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="chart">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title={`روند تغییرات ماهانه ${selectedCategory ? `برای ${selectedCategory}` : "کلی"}`}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={filteredTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="month" stroke="#333" />
                    <YAxis stroke="#333" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#4DA8FF" activeDot={{ r: 7 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="توزیع دسته‌بندی‌ها (Pie)">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="مقایسه تعداد (Bar)">
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
              </ChartCard>

              {drillDownData && (
                <ChartCard title={`Drill-down برای ${selectedCategory}`}>
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
                </ChartCard>
              )}

              {selectedCategory && !drillDownData && (
                <Button onClick={() => setSelectedCategory(null)} className="mt-4 bg-[#FF6B6B] text-white">
                  بازگشت به روند کلی
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className={`${GLASS} ${PANELBG} p-6 space-y-4`}>
              <h2 className="text-lg font-semibold text-[#07657E]">خلاصه گزارش‌ها</h2>
              <ul className="list-disc pr-4 space-y-2">
                {filteredData.slice(0, 5).map(item => (
                  <li key={item.id}><span className="font-semibold">{item.category}:</span> {item.count} مورد — {item.description}</li>
                ))}
              </ul>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800">هشدارهای کلیدی</h3>
                <ul className="list-disc pr-4">
                  {filteredData.filter(i => i.count > 40).map(i => (
                    <li key={i.id}>{i.category} بیش از حد انتظار ({i.count})</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>ویرایش گزارش</DialogTitle></DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <Input value={editingItem.category} onChange={e=>setEditingItem(s=> s ? ({ ...s, category:e.target.value }) : s)} />
                <Input type="number" value={editingItem.count} onChange={e=>setEditingItem(s=> s ? ({ ...s, count:Number(e.target.value) }) : s)} />
                <Input value={editingItem.description} onChange={e=>setEditingItem(s=> s ? ({ ...s, description:e.target.value }) : s)} />
                <Button onClick={saveEdit}>ذخیره تغییرات</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ====== Helpers ====== */
function downloadPDF(rows: Report[]) {
  const doc = new jsPDF();
  doc.text("گزارش پرسنلی", 105, 10, { align: "center" });
  const tableData = rows.map(i => [i.count, i.category, i.description]);
  (doc as any).autoTable({ head: [["تعداد", "دسته‌بندی", "توضیحات"]], body: tableData });
  doc.save("reports.pdf");
  toast.success("PDF دانلود شد!");
}
function downloadExcel(rows: Report[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "گزارش‌ها");
  XLSX.writeFile(wb, "reports.xlsx");
  toast.success("Excel دانلود شد!");
}
function downloadCSV(rows: Report[]) {
  const csv = rows.map(i => `${i.category},${i.count},${i.description}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "reports.csv"; a.click();
  toast.success("CSV دانلود شد!");
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} className={`${GLASS} ${PANELBG} p-6`}>
      <h2 className="text-lg font-semibold mb-4 text-[#07657E]">{title}</h2>
      {children}
    </motion.div>
  );
}
