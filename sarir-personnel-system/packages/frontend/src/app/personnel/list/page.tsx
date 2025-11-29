"use client";
/* eslint-disable import/order */ // TODO: revisit import sorting

import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { UserPlus, Edit, Trash2, RotateCcw, Briefcase, CornerDownLeft, UserCheck, DollarSign, ChevronUp, ChevronDown, ListFilter, Table, LayoutList } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { ListPageLayout } from "@/components/layouts/ListPageLayout";
import { FilterBar } from "@/components/list/FilterBar";
import { ListActionBar } from "@/components/list/ListActionBar";
import { ListHeader } from "@/components/list/ListHeader";
import { TableShell } from "@/components/list/TableShell";

/* فرض بر وجود کامپوننت‌های UI در مسیرهای زیر: */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
// import { cn } from "@/lib/utils"; // برای ترکیب کلاس‌ها

// --- Type Definitions ---
type Personnel = {
    id: number;
    fullName: string;
    nationalId: string;
    department: 'فناوری اطلاعات' | 'مالی' | 'تولید' | 'منابع انسانی' | 'بازرگانی';
    position: string;
    salary: number; // به تومان
    startDate: string;
    status: 'Active' | 'On Leave' | 'Terminated';
    mobile: string;
};

// --- Mock Data and API Function ---
const mockPersonnel: Personnel[] = [
    { id: 1001, fullName: "علی ناصری", nationalId: "0012345678", department: "فناوری اطلاعات", position: "مدیر بخش", salary: 55000000, startDate: "1397/04/01", status: "Active", mobile: "09121111111" },
    { id: 1002, fullName: "مریم احمدی", nationalId: "0023456789", department: "مالی", position: "کارشناس ارشد", salary: 32000000, startDate: "1400/11/15", status: "Active", mobile: "09122222222" },
    { id: 1003, fullName: "رضا کریمی", nationalId: "0034567890", department: "تولید", position: "سرپرست خط", salary: 25000000, startDate: "1395/02/20", status: "Active", mobile: "09123333333" },
    { id: 1004, fullName: "نسیم حسینی", nationalId: "0045678901", department: "منابع انسانی", position: "کارشناس استخدام", salary: 28000000, startDate: "1402/08/10", status: "On Leave", mobile: "09124444444" },
    { id: 1005, fullName: "محمد یوسفی", nationalId: "0056789012", department: "بازرگانی", position: "مدیر بازرگانی", salary: 48000000, startDate: "1399/01/05", status: "Active", mobile: "09125555555" },
    { id: 1006, fullName: "زهرا مرادی", nationalId: "0067890123", department: "تولید", position: "اپراتور", salary: 18000000, startDate: "1403/05/25", status: "Active", mobile: "09126666666" },
    { id: 1007, fullName: "امیرحسین پارسا", nationalId: "0078901234", department: "فناوری اطلاعات", position: "برنامه‌نویس", salary: 35000000, startDate: "1401/02/01", status: "Active", mobile: "09127777777" },
    { id: 1008, fullName: "لیلا زمانی", nationalId: "0089012345", department: "منابع انسانی", position: "مدیر منابع انسانی", salary: 50000000, startDate: "1396/10/01", status: "Active", mobile: "09128888888" },
    { id: 1009, fullName: "فرهاد سلیمی", nationalId: "0090123456", department: "مالی", position: "حسابدار", salary: 22000000, startDate: "1403/01/01", status: "Terminated", mobile: "09129999999" },
    // 10 آیتم دیگر برای تست بهتر
    { id: 1010, fullName: "مینا سعیدی", nationalId: "0101234567", department: "بازرگانی", position: "کارشناس فروش", salary: 24000000, startDate: "1402/05/01", status: "Active", mobile: "09351000000" },
    { id: 1011, fullName: "کامیار نادری", nationalId: "0112345678", department: "فناوری اطلاعات", position: "پشتیبان شبکه", salary: 30000000, startDate: "1401/10/10", status: "Active", mobile: "09191000000" },
    { id: 1012, fullName: "پریسا شایگان", nationalId: "0123456789", department: "تولید", position: "مدیر تولید", salary: 60000000, startDate: "1394/01/01", status: "Active", mobile: "09120000001" },
];

async function getPersonnelData(): Promise<Personnel[]> { 
    // تأخیر عمدی برای شبیه سازی بارگذاری
    return new Promise(resolve => setTimeout(() => resolve(mockPersonnel), 800)); 
}

const KPISection = ({ data }: { data: Personnel[] }) => {
    const activeCount = data.filter(p => p.status === 'Active').length;
    const avgSalary = data.length > 0
        ? data.reduce((sum, p) => sum + p.salary, 0) / data.length
        : 0;
    const itDepartment = data[0]?.department;
    const itCount = itDepartment ? data.filter(p => p.department === itDepartment).length : 0;

    const toneStyles = {
        primary: "bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]",
        accent: "bg-[var(--color-brand-accent-soft)] text-[var(--color-brand-accent)]",
        success: "bg-emerald-50 text-emerald-600",
    } as const;

    const StatCard = ({ icon, title, value, tone }: { icon: React.ReactNode, title: string, value: string, tone: keyof typeof toneStyles }) => (
        <motion.div
            className="rounded-2xl shadow-[var(--sarir-shadow-soft)]"
            whileHover={{ scale: 1.02, y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        >
            <Card className="p-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</span>
                    <div className={`p-2 rounded-xl ${toneStyles[tone]}`}>
                        {icon}
                    </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight">{value}</p>
            </Card>
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mb-8">
            <StatCard
                icon={<UserCheck size={20} className="text-emerald-600"/>}
                title="کارکنان فعال"
                value={activeCount.toLocaleString('fa-IR')}
                tone="success"
            />
            <StatCard
                icon={<DollarSign size={20} className="text-[var(--color-brand-accent)]"/>}
                title="میانگین حقوق"
                value={`${(avgSalary / 1_000_000).toLocaleString("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} م.ت`}
                tone="accent"
            />
            <StatCard
                icon={<Briefcase size={20} className="text-[var(--color-brand-primary)]"/>}
                title="نیروی IT"
                value={itCount.toLocaleString('fa-IR')}
                tone="primary"
            />
        </div>
    );
};

// --- Custom Components ---


// وضعیت: فعال، مرخصی، اخراج شده (ثابت می‌ماند)
const StatusBadge = ({ status }: { status: Personnel['status'] }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    let style = "";
    switch (status) {
        case 'Active':
            style = "bg-green-500/10 text-green-400 border border-green-500/30";
            break;
        case 'On Leave':
            style = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
            break;
        case 'Terminated':
            style = "bg-red-500/10 text-red-400 border border-red-500/30";
            break;
    }
    return <span className={`${baseClasses} ${style}`}>{status === 'Active' ? 'فعال' : status === 'On Leave' ? 'مرخصی' : 'ترک کار'}</span>;
};

// --- Add/Edit Modal (Placeholder) ---
const PersonnelFormDialog = ({ isOpen, onClose, personnel }: { isOpen: boolean, onClose: () => void, personnel: Personnel | null }) => {
    const isEdit = !!personnel;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[var(--color-surface-glass)] text-[var(--color-text-main)] border-[var(--color-brand-primary)]/50 reports-panel max-w-2xl">
                <DialogHeader>
                    {/* استفاده از متغیر تم برای عنوان */}
                    <DialogTitle className="text-2xl font-extrabold text-[var(--color-brand-primary)]">
                        {isEdit ? `ویرایش پرسنل: ${personnel?.fullName}` : "افزودن پرسنل جدید"}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <Input defaultValue={personnel?.fullName} placeholder="نام و نام خانوادگی" className="col-span-2"/>
                    <Input defaultValue={personnel?.nationalId} placeholder="کد ملی" />
                    <Input defaultValue={personnel?.mobile} placeholder="شماره تماس" />
                    <Input defaultValue={personnel?.position} placeholder="سمت سازمانی" />
                    <Select defaultValue={personnel?.department}>
                        <SelectTrigger className="bg-transparent border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:border-[var(--color-brand-primary)]">
                            <SelectValue placeholder="بخش / دپارتمان" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--color-surface-glass)] border-[var(--color-border-subtle)] text-[var(--color-text-main)]">
                            {['فناوری اطلاعات', 'مالی', 'تولید', 'منابع انسانی', 'بازرگانی'].map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input defaultValue={personnel?.salary?.toString()} placeholder="حقوق (تومان)" />
                    <Input defaultValue={personnel?.startDate} placeholder="تاریخ شروع به کار (مثال: 1402/01/01)" />
                    <Select defaultValue={personnel?.status}>
                        <SelectTrigger className="bg-transparent border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:border-[var(--color-brand-primary)]">
                            <SelectValue placeholder="وضعیت" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--color-surface-glass)] border-[var(--color-border-subtle)] text-[var(--color-text-main)]">
                            {['Active', 'On Leave', 'Terminated'].map(s => (
                                <SelectItem key={s} value={s}>{s === 'Active' ? 'فعال' : s === 'On Leave' ? 'مرخصی' : 'ترک کار'}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <Button onClick={onClose} variant="ghost" className="text-[var(--color-text-muted)] hover:bg-[var(--color-surface-glass)]">انصراف</Button>
                    {/* استفاده از متغیر تم برای دکمه اصلی */}
                    <Button className="bg-[var(--color-brand-primary)] text-slate-900 hover:bg-[var(--color-brand-primary)]/90">
                        {isEdit ? "ذخیره تغییرات" : "ثبت پرسنل"}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
};


// --- Main Page Component ---
export default function PersonnelListPage() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [grouping, setGrouping] = useState<string[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table'); // حالت نمایش جدول/کارت

    const { data: personnelData, isLoading, isError, refetch } = useQuery({
        queryKey: ['personnelList'],
        queryFn: getPersonnelData,
    });
    
    const data = personnelData ?? [];

    const columnHelper = createColumnHelper<Personnel>();

    // تعریف ستون‌ها برای TanStack Table
    const columns = useMemo(() => [
        columnHelper.accessor('fullName', {
            header: () => <div className="text-right">نام پرسنل</div>,
            cell: info => <div className="font-semibold text-[var(--color-text-main)]">{info.getValue()}</div>,
            footer: props => props.column.id,
            enableGrouping: false,
        }),
        columnHelper.accessor('department', {
            header: () => <div>دپارتمان</div>,
            // حفظ رنگ آبی/فیروزه‌ای برای دپارتمان به عنوان رنگ فرعی (Brand Secondary)
            cell: info => <span className="text-[var(--brand-secondary)]">{info.getValue()}</span>, 
            footer: props => props.column.id,
            enableGrouping: true,
        }),
        columnHelper.accessor('position', {
            header: 'سمت',
            cell: info => <span className="text-[var(--color-text-muted)]">{info.getValue()}</span>,
            footer: props => props.column.id,
            enableGrouping: true,
        }),
        columnHelper.accessor('salary', {
            header: () => <div className="text-left">حقوق (م.ت)</div>,
            cell: info => <div className="text-left font-mono text-green-400">{(info.getValue() / 1000000).toLocaleString('fa-IR', { minimumFractionDigits: 1 })}</div>,
            footer: props => props.column.id,
        }),
        columnHelper.accessor('startDate', {
            header: 'تاریخ شروع',
            cell: info => <span className="text-[var(--color-text-muted)]">{info.getValue()}</span>,
            footer: props => props.column.id,
            enableGrouping: false,
        }),
        columnHelper.accessor('status', {
            header: 'وضعیت',
            cell: info => <StatusBadge status={info.getValue()} />,
            footer: props => props.column.id,
            enableGrouping: true,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 justify-end">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        // استفاده از متغیر تم برای ویرایش
                        className="text-[var(--color-brand-primary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-brand-primary)]/20"
                        onClick={() => { setSelectedPersonnel(row.original); setIsFormOpen(true); }}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-400 hover:text-[var(--color-text-main)] hover:bg-red-400/20"
                        onClick={() => toast.error(`حذف ${row.original.fullName} انجام نشد!`)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ),
            enableGrouping: false,
        }),
    ], [columnHelper]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            grouping,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onGroupingChange: setGrouping,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        globalFilterFn: 'includesString', 
        enableGrouping: true,
    });
    
    // --- Table Renderer ---
    const PersonnelTable = () => (
        <div className="relative overflow-x-auto rounded-2xl">
            <table className="table text-sm">
                <thead className="sticky top-0 z-10 bg-[color-mix(in_srgb,var(--color-brand-primary)_6%,white)]">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id} 
                                    scope="col" 
                                    className="px-6 py-3 cursor-pointer select-none"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className="flex items-center justify-between">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                        {/* استفاده از متغیر تم برای آیکون گروه بندی */}
                                        {header.column.getIsGrouped() && <Briefcase size={14} className="ml-1 text-[var(--color-brand-primary)]" />}
                                        {header.column.getIsSorted() === 'asc' ? <ChevronUp size={14} /> : header.column.getIsSorted() === 'desc' ? <ChevronDown size={14} /> : null}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="text-[var(--color-text-main)]">
                    {table.getRowModel().rows.map(row => (
                        <tr 
                            key={row.id} 
                            className={`border-b border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-surface-glass)] ${row.getIsGrouped() ? 'bg-[var(--color-surface-glass)] font-bold' : ''}`}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td 
                                    key={cell.id} 
                                    className="px-6 py-4 whitespace-nowrap"
                                >
                                     {cell.getIsGrouped() ? (
                                        // نمایش ردیف‌های گروه‌بندی شده
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={row.getToggleExpandedHandler()}>
                                            {/* استفاده از متغیر تم برای آیکون گروه بندی */}
                                            <CornerDownLeft size={16} className="text-[var(--color-brand-primary)]" />
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())} 
                                            <span className="text-[var(--color-text-muted)] text-xs">({row.subRows.length.toLocaleString('fa-IR')} نفر)</span>
                                        </div>
                                    ) : cell.getIsAggregated() ? (
                                        // نمایش داده‌های تجمیعی (مثلاً مجموع حقوق)
                                        <div className="font-bold text-lg text-[var(--color-brand-primary)]">{/* Aggregate Data Here if needed */}</div>
                                    ) : cell.getIsPlaceholder() ? null : (
                                        // نمایش داده‌های عادی
                                        flexRender(cell.column.columnDef.cell, cell.getContext())
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    // --- Card Renderer (Mobile/Alternative View) ---
    const PersonnelCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {table.getRowModel().rows.map(row => {
                if (row.getIsGrouped()) return null; 
                const p = row.original;
                return (
                    <motion.div 
                        key={p.id} 
                        // استفاده از متغیر تم برای border و رنگ عنوان
                        className="reports-panel p-5 rounded-xl border-t-4 border-[var(--color-brand-primary)]/50 flex flex-col space-y-3 shadow-lg"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-[var(--color-brand-primary)]">{p.fullName}</h3>
                            <StatusBadge status={p.status} />
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                            <Briefcase size={14} className="text-[var(--color-text-muted)]"/>
                            {p.position} - {p.department}
                        </p>
                        <div className="pt-3 border-t border-[var(--color-border-subtle)] space-y-2 text-sm">
                             <div className="flex justify-between text-[var(--color-text-muted)]">
                                 <span className="font-medium">حقوق (م.ت):</span>
                                 <span className="text-green-400 font-mono">{(p.salary / 1000000).toLocaleString('fa-IR', { minimumFractionDigits: 1 })}</span>
                             </div>
                             <div className="flex justify-between text-[var(--color-text-muted)]">
                                 <span className="font-medium">تاریخ شروع:</span>
                                 <span>{p.startDate}</span>
                             </div>
                        </div>
                        <div className="flex gap-2 pt-3 justify-end">
                            <Button 
                                size="sm" 
                                // استفاده از متغیر تم برای دکمه ویرایش
                                className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                                onClick={() => { setSelectedPersonnel(p); setIsFormOpen(true); }}
                            >
                                <Edit size={14} className="ml-2"/> ویرایش
                            </Button>
                        </div>
                    </motion.div>
                );
            })}
            {data.length === 0 && <p className="text-[var(--color-text-muted)] col-span-full">هیچ کارمندی یافت نشد.</p>}
        </div>
    );

    return (
        <ListPageLayout
            title="فهرست پرسنل"
            description="مدیریت و جستجوی اطلاعات پرسنل"
            className="space-y-6 pb-10"
        >

            <ListHeader
                title="فهرست پرسنل"
                description="نمایش وضعیت و گزارش سریع"
                actions={
                    <Button
                        className="h-10 px-4 flex items-center gap-2"
                        onClick={() => { setSelectedPersonnel(null); setIsFormOpen(true); }}
                    >
                        <UserPlus size={18} />
                        افزودن پرسنل
                    </Button>
                }
            />

            <KPISection data={data} />

            <FilterBar className="reports-toolbar-panel mt-4">
                <Input
                    placeholder="جستجوی عمومی (نام، کد ملی، دپارتمان...)"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full md:w-96"
                />

                <ListActionBar>
                    <Select value={grouping[0] || 'none'} onValueChange={(val) => setGrouping(val === 'none' ? [] : [val])}>
                        <SelectTrigger className="w-40 h-10">
                            <ListFilter size={16} className="text-[var(--color-brand-primary)] ml-2" />
                            <SelectValue placeholder="گروه‌بندی" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--color-surface-glass)] border-[var(--color-border-subtle)] text-[var(--color-text-main)]">
                            <SelectItem value="none">بدون گروه‌بندی</SelectItem>
                            <SelectItem value="department">دپارتمان</SelectItem>
                            <SelectItem value="position">سمت</SelectItem>
                            <SelectItem value="status">وضعیت</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                        variant="ghost"
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] h-10"
                    >
                        {viewMode === 'table' ? <LayoutList size={20} /> : <Table size={20} />}
                    </Button>

                    <Button
                        onClick={() => refetch()}
                        variant="ghost"
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] h-10"
                        disabled={isLoading}
                    >
                        {isLoading ? <RotateCcw size={20} className="animate-spin" /> : <RotateCcw size={20} />}
                    </Button>
                </ListActionBar>
            </FilterBar>

            <div className="mt-4 px-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-[200px] rounded-xl bg-[var(--color-surface-glass)]" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center p-20 reports-panel text-red-400">
                        <RotateCcw size={48} />
                        <p className="mt-4 text-xl">خطا در بارگذاری اطلاعات پرسنل. لطفا دوباره تلاش کنید.</p>
                        <Button onClick={() => refetch()} className="mt-4 bg-red-600 hover:bg-red-700">تلاش مجدد</Button>
                    </div>
                ) : viewMode === 'table' ? (
                    <TableShell className="mt-6">
                        <PersonnelTable />
                    </TableShell>
                ) : (
                    <PersonnelCards />
                )}
            </div>

            <PersonnelFormDialog
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setSelectedPersonnel(null); }}
                personnel={selectedPersonnel}
            />
        </ListPageLayout>
    );
}
