"use client";

import type { Dispatch, SetStateAction } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { ReportsButton } from "../ui/ReportsButton";
import { ReportsCard } from "../ui/ReportsCard";
import { ReportsInput } from "../ui/ReportsInput";

type Props = {
  search: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  selectedType: "all" | "personnel" | "board";
  onTypeChange: Dispatch<SetStateAction<"all" | "personnel" | "board">>;
  loading: boolean;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onNewReport: () => void;
};

export function ReportsToolbar({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  loading,
  onExportCSV,
  onExportJSON,
  onNewReport,
}: Props) {
  return (
    <ReportsCard className="p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        {[
          { key: "all", label: "همه" },
          { key: "personnel", label: "پرسنل" },
          { key: "board", label: "هیئت‌مدیره" },
        ].map((item) => (
          <ReportsButton
            key={item.key}
            onClick={() => onTypeChange(item.key as typeof selectedType)}
            className={
              selectedType === item.key
                ? "h-9 px-3 text-xs"
                : "h-9 px-3 text-xs bg-transparent border border-slate-700/80 text-slate-300 shadow-none hover:bg-slate-800/70"
            }
          >
            {item.label}
          </ReportsButton>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <ReportsButton onClick={onNewReport} className="h-9 px-3 text-xs">
            گزارش جدید
          </ReportsButton>
          <select
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (val === "csv") onExportCSV();
              if (val === "json") onExportJSON();
              if (val === "pdf") alert("خروجی PDF به‌زودی افزوده می‌شود");
              e.currentTarget.selectedIndex = 0;
            }}
            className="h-9 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 text-xs text-slate-200 shadow-[0_10px_35px_rgba(0,0,0,0.35)] focus:border-[#07657E] focus:ring-2 focus:ring-[#07657E]/25"
          >
            <option value="" disabled>
              خروجی
            </option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      <div className="relative w-full">
        <MagnifyingGlassIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
        <ReportsInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجوی عنوان گزارش"
          disabled={loading}
          className="pr-10"
        />
      </div>
    </ReportsCard>
  );
}
