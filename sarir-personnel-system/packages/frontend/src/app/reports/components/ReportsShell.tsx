"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Report } from "@/app/api/reports/route";
import { api } from "@/lib/api";

import { ReportsShell as ReportsPageShell } from "../ui/ReportsShell";
import { ReportsHeader } from "./ReportsHeader";
import { ReportsCharts } from "./ReportsCharts";
import { ReportsKpis } from "./ReportsKpis";
import { ReportsTable } from "./ReportsTable";
import { ReportsToolbar } from "./ReportsToolbar";

async function fetchReports() {
  return api<Report[]>("/api/reports");
}

export function ReportsShell() {
  const { data: reports = [], isLoading } = useQuery({ queryKey: ["reports"], queryFn: fetchReports });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "personnel" | "board">("all");

  const inferType = (category?: string) => {
    if (!category) return "personnel";
    return /هیئت|مدیره/i.test(category) ? "board" : "personnel";
  };

  const filtered = useMemo(() => {
    return (reports ?? [])
      .filter((r) => r.category?.includes(searchTerm))
      .filter((r) => {
        if (selectedType === "all") return true;
        return inferType(r.category) === selectedType;
      });
  }, [reports, searchTerm, selectedType]);

  const exportCSV = () => {
    const headers = ["دسته", "تعداد", "توضیحات"];
    const lines = [headers.join(",")];
    filtered.forEach((r) => {
      lines.push(
        [
          (r.category || "").replace(/,/g, " "),
          r.count ?? "",
          (r.description || "").replace(/,/g, " "),
        ].join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = useMemo(() => {
    const count = filtered.length;
    const total = filtered.reduce((sum, r) => sum + (r.count || 0), 0);
    const avg = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
    const maxItem = filtered.reduce((max, r) => (r.count > (max?.count || 0) ? r : max), filtered[0]);
    const lastUpdated = new Date().toLocaleDateString("fa-IR");
    return [
      { label: "تعداد کل گزارش‌ها", value: count, hint: "کل ورودی‌ها" },
      { label: "مجموع رکوردها", value: total, hint: "جمع ستون count" },
      { label: "میانگین مقادیر", value: avg, hint: "میانگین ستون count" },
      { label: "آخرین به‌روزرسانی", value: lastUpdated, hint: maxItem?.category ? `جدیدترین: ${maxItem.category}` : "بدون داده" },
    ];
  }, [filtered]);

  const barData = filtered.map((item) => ({ name: item.category, count: item.count }));
  const pieData = filtered.map((item) => ({ name: item.category, value: item.count }));
  const trendData = filtered.slice(0, 8).map((r, idx) => ({ month: r.category || `گزارش ${idx + 1}`, count: r.count, secondary: (r.count || 0) / 2 }));
  const radarData = [
    { subject: "کیفیت", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    { subject: "زمان", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    { subject: "هزینه", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
    { subject: "ریسک", A: Math.random() * 100, B: Math.random() * 100, fullMark: 100 },
  ];

  return (
    <ReportsPageShell>
      <ReportsHeader />
      <ReportsKpis kpis={kpis} />
      <ReportsToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        loading={isLoading}
        onExportCSV={exportCSV}
        onExportJSON={exportJSON}
        onNewReport={() => alert("ثبت گزارش جدید به‌زودی افزوده می‌شود")}
      />
      <ReportsCharts trendData={trendData} barData={barData} pieData={pieData} radarData={radarData} />
      <ReportsTable rows={filtered} isLoading={isLoading} />
    </ReportsPageShell>
  );
}
