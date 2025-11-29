"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import QuickActions from "@/app/dashboard/components/QuickActions";
import { RemindersProvider } from "@/app/dashboard/components/RemindersContext";
import RemindersPanel from "@/app/dashboard/components/RemindersPanel";

import { DashboardCard } from "../ui/DashboardCard";
import { DashboardShell as DashboardPageShell } from "../ui/DashboardShell";
import { DashboardContent } from "./DashboardContent";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardKPIs } from "./DashboardKPIs";

const LatestEmployees = dynamic(() => import("@/app/dashboard/components/LatestEmployees"), { ssr: false });
const DeptDonut = dynamic(() => import("@/app/dashboard/components/DeptDonut"), { ssr: false });
const GenderDonut = dynamic(() => import("@/app/dashboard/components/GenderDonut"), { ssr: false });
const CalendarWidget = dynamic(() => import("@/app/dashboard/components/Calendar"), { ssr: false });
const UpcomingBirthdays = dynamic(() => import("@/app/dashboard/components/UpcomingBirthdays"), { ssr: false });
const Anniversaries = dynamic(() => import("@/app/dashboard/components/Anniversaries"), { ssr: false });

type EmployeeRow = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  created_at?: string;
  position?: string | null;
  department?: string | null;
  birth_date?: string | null;
  hire_date?: string | null;
  gender?: string | null;
  role?: string | null;
};

const BOARD_KEYWORDS = [/هیئت/iu, /رییس/iu, /Board/i, /Chair(man|woman)?/i, /\bCEO\b/i, /\bCOO\b/i, /\bCFO\b/i];
const MANAGER_KEYWORDS = [/\bManager\b/i, /مدیر/iu, /Head/i];
const DRIVER_KEYWORDS = [/راننده/iu, /\bDriver\b/i];

const matches = (s: string, arr: RegExp[]) => arr.some((rx) => rx.test(s));

export function DashboardShell() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "withEmail" | "noEmail">("all");

  const {
    data: employees = [],
    isLoading,
    error,
    refetch,
  } = useQuery<EmployeeRow[]>({
    queryKey: ["dashboard-employees"],
    queryFn: async () => {
      const r = await fetch("/api/employees", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      return Array.isArray(j) ? j : [];
    },
  });

  const latest = useMemo(
    () =>
      [...employees]
        .sort((a, b) => new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime())
        .slice(0, 12),
    [employees]
  );

  const normalizedEmployees = useMemo(
    () =>
      employees.map((e) => ({
        ...e,
        position: e.position || undefined,
        email: e.email || undefined,
        department: e.department || undefined,
        birth_date: e.birth_date || undefined,
        hire_date: e.hire_date || undefined,
        gender: e.gender || undefined,
      })),
    [employees]
  );

  const filteredLatest = useMemo(() => {
    let list = latest;
    if (filter === "withEmail") list = list.filter((x) => x.email);
    if (filter === "noEmail") list = list.filter((x) => !x.email);
    if (search.trim()) {
      const k = search.trim().toLowerCase();
      list = list.filter((x) =>
        `${x.first_name} ${x.last_name} ${x.email || ""} ${x.position || ""}`.toLowerCase().includes(k)
      );
    }
    return list;
  }, [latest, filter, search]);

  const filteredNormalized = useMemo(
    () =>
      filteredLatest.map((e) => ({
        ...e,
        position: e.position || undefined,
        email: e.email || undefined,
        department: e.department || undefined,
        birth_date: e.birth_date || undefined,
        hire_date: e.hire_date || undefined,
        gender: e.gender || undefined,
      })),
    [filteredLatest]
  );

  const kpis = useMemo(() => {
    const total = employees.length;
    const withEmail = employees.filter((e) => e.email).length;
    const withoutEmail = Math.max(0, total - withEmail);
    const board = employees.filter((e) => matches(`${e.role || ""} ${e.position || ""}`, BOARD_KEYWORDS)).length;
    const managers = employees.filter((e) => matches(`${e.role || ""} ${e.position || ""}`, MANAGER_KEYWORDS)).length;
    const drivers = employees.filter((e) => matches(`${e.role || ""} ${e.position || ""}`, DRIVER_KEYWORDS)).length;
    const now = new Date();
    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 30);
    const recent = employees.filter((e) => {
      const d = e.created_at ? new Date(e.created_at) : undefined;
      return d && d >= d30;
    }).length;

    return [
      { label: "کل نیروی انسانی", value: total, trend: "+۸٪ نسبت به ماه قبل" },
      { label: "دارای ایمیل", value: withEmail, trend: "پوشش ارتباطی" },
      { label: "فاقد ایمیل", value: withoutEmail, trend: "نیاز به تکمیل اطلاعات" },
      { label: "هیئت مدیره", value: board, trend: "اعضای کلیدی" },
      { label: "مدیران / سرپرست‌ها", value: managers, trend: "رهبران تیم‌ها" },
      { label: "رانندگان و ناوگان", value: drivers, trend: "عملیات ناوگان" },
      { label: "ورودی ۳۰ روز اخیر", value: recent, trend: "استخدام‌های تازه" },
    ];
  }, [employees]);

  const tabs = [
    { label: "داشبورد", href: "/dashboard", active: true },
    { label: "گزارش‌ها", href: "/reports", active: false },
    { label: "اعلان‌ها", href: "/notifications", active: false },
  ];

  return (
    <DashboardPageShell>
      <DashboardHeader tabs={tabs} onRefresh={refetch} refreshing={isLoading} search={search} onSearchChange={setSearch} />
      <DashboardKPIs kpis={kpis} />

      <RemindersProvider storageKey="sarir_dashboard_reminders_v2">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr,1fr]">
          <DashboardContent
            tableError={error ? (error as Error).message : ""}
            rows={filteredNormalized}
            search={search}
            filter={filter}
            onFilterChange={setFilter}
          />
          <div className="space-y-4">
            <DashboardCard className="p-4">
              <LatestEmployees employees={filteredNormalized} />
            </DashboardCard>
            <DashboardCard className="p-4">
              <QuickActions />
            </DashboardCard>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <DashboardCard className="p-4">
              <DeptDonut employees={normalizedEmployees} />
            </DashboardCard>
            <DashboardCard className="p-4">
              <GenderDonut employees={normalizedEmployees} />
            </DashboardCard>
          </div>
          <DashboardCard className="p-4">
            <CalendarWidget />
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DashboardCard className="p-4">
            <RemindersPanel />
          </DashboardCard>
          <DashboardCard className="p-4">
            <UpcomingBirthdays employees={normalizedEmployees} />
          </DashboardCard>
          <DashboardCard className="p-4">
            <Anniversaries employees={normalizedEmployees} />
          </DashboardCard>
        </div>
      </RemindersProvider>
    </DashboardPageShell>
  );
}
