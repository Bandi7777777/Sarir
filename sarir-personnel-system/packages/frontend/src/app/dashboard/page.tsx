"use client";

import {
  ArrowPathIcon,
  BellIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { FilterBar } from "@/components/list/FilterBar";
import { ListActionBar } from "@/components/list/ListActionBar";
import { ListHeader } from "@/components/list/ListHeader";
import { TableShell } from "@/components/list/TableShell";
import QuickActions from "@/app/dashboard/components/QuickActions";
import RemindersPanel from "@/app/dashboard/components/RemindersPanel";
import { RemindersProvider } from "@/app/dashboard/components/RemindersContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const KPIs = dynamic(() => import("@/app/dashboard/components/KPIs"), { ssr: false });
const LatestEmployees = dynamic(() => import("@/app/dashboard/components/LatestEmployees"), { ssr: false });
const DeptDonut = dynamic(() => import("@/app/dashboard/components/DeptDonut"), { ssr: false });
const GenderDonut = dynamic(() => import("@/app/dashboard/components/GenderDonut"), { ssr: false });
const UpcomingBirthdays = dynamic(() => import("@/app/dashboard/components/UpcomingBirthdays"), { ssr: false });
const Anniversaries = dynamic(() => import("@/app/dashboard/components/Anniversaries"), { ssr: false });
const CalendarWidget = dynamic(() => import("@/app/dashboard/components/Calendar"), { ssr: false });

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
};

export default function Dashboard() {
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
        .sort(
          (a, b) =>
            new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime()
        )
        .slice(0, 10),
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
        `${x.first_name} ${x.last_name} ${x.email || ""} ${x.position || ""}`
          .toLowerCase()
          .includes(k)
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

  function exportCSV() {
    const rows = [
      ["نام", "ایمیل", "تاریخ ایجاد"],
      ...filteredLatest.map((e) => [`${e.first_name} ${e.last_name}`, e.email || "", e.created_at || ""]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "latest_employees.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const headerSlot = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="جستجو..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9 w-56"
        />
      </div>
      <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
        <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      </Button>
      <Button asChild size="sm">
        <Link href="/personnel/register">
          <UserPlusIcon className="ml-1 h-4 w-4" />
          ثبت پرسنل
        </Link>
      </Button>
    </div>
  );

  return (
    <div dir="rtl" style={{ ["--dashboard-bg" as string]: "#0b1220" }}>
      <DashboardPageLayout
        title="داشبورد سازمان"
        description="نما و خلاصه وضعیت پرسنل، جلسات و اعلان‌های اخیر"
        headerSlot={headerSlot}
      >
        <RemindersProvider storageKey="sarir_dashboard_reminders_v1">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <Card className="border-white/10 bg-white/5 p-4">
                <ListHeader
                  title="شاخص‌های اصلی"
                  description="وضعیت پرسنل بر اساس نقش و جذب اخیر"
                actions={
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                    <BellIcon className="h-4 w-4 text-amber-300" />
                    اعلان‌های خودکار فعال است
                  </div>
                }
              />
                <KPIs employees={normalizedEmployees} />
              </Card>

              <Card className="border-white/10 bg-white/5 p-0">
                <FilterBar className="border-b border-white/10">
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <FunnelIcon className="h-5 w-5 text-cyan-300" />
                    <Button
                      variant={filter === "all" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("all")}
                    >
                      همه
                    </Button>
                    <Button
                      variant={filter === "withEmail" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("withEmail")}
                    >
                      دارای ایمیل
                    </Button>
                    <Button
                      variant={filter === "noEmail" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("noEmail")}
                    >
                      بدون ایمیل
                    </Button>
                  </div>
                  <ListActionBar>
                    <Button variant="outline" size="sm" onClick={exportCSV}>
                      خروجی CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => refetch()}>
                      <ArrowPathIcon className="h-4 w-4" />
                      بروزرسانی
                    </Button>
                  </ListActionBar>
                </FilterBar>

                <TableShell className="border-0 border-t border-white/10 bg-transparent">
                  <div className="p-4">
                    {error ? (
                      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
                        {(error as Error).message || "خطا در دریافت داده"}
                      </div>
                    ) : isLoading ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-14 rounded-2xl bg-white/10 animate-pulse" />
                        ))}
                      </div>
                    ) : filteredLatest.length === 0 ? (
                      <div className="rounded-xl border border-dashed p-6 text-center text-slate-200">
                        داده‌ای یافت نشد.
                      </div>
                    ) : (
                      <LatestEmployees employees={filteredNormalized} />
                    )}
                  </div>
                </TableShell>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-white/10 bg-white/5 p-4">
                  <ListHeader title="تقویم حضور و مرخصی" />
                  <CalendarWidget />
                </Card>
                <Card className="border-white/10 bg-white/5 p-4">
                  <ListHeader title="اقدامات سریع" />
                  <QuickActions />
                </Card>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <Card className="border-white/10 bg-white/5 p-4">
                <ListHeader title="یادآورها" />
                <RemindersPanel />
              </Card>

              <Card className="border-white/10 bg-white/5 p-4">
                <ListHeader title="توزیع پرسنل" />
                <div className="grid gap-4 md:grid-cols-2">
                  <DeptDonut employees={normalizedEmployees} />
                  <GenderDonut employees={normalizedEmployees} />
                </div>
              </Card>

              <Card className="border-white/10 bg-white/5 p-4">
                <ListHeader title="مناسبت‌ها" />
                <div className="space-y-4">
                  <UpcomingBirthdays employees={normalizedEmployees} />
                  <Anniversaries employees={normalizedEmployees} />
                </div>
              </Card>
            </div>
          </section>
        </RemindersProvider>
      </DashboardPageLayout>
    </div>
  );
}
