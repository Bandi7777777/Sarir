import {
  Calendar,
  Columns,
  Download,
  ListFilter,
  Play,
  Search,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import type { ColumnsVisibility } from "../types";

type Density = "comfort" | "dense" | "compact";

type ReportsToolbarProps = {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedType: "personnel" | "board" | "all";
  onTypeChange: (v: "personnel" | "board" | "all") => void;
  countRange: [number, number];
  onCountRangeChange: (range: [number, number]) => void;
  density: Density;
  onDensityChange: (v: Density) => void;
  exportFormat: "pdf" | "excel" | "csv" | "json";
  onExportFormatChange: (v: "pdf" | "excel" | "csv" | "json") => void;
  onExport: () => void;
  onAddClick: () => void;
  realTime: boolean;
  onRealTimeChange: (val: boolean) => void;
  columnsVis: ColumnsVisibility;
  onColumnsChange: (v: ColumnsVisibility) => void;
  viewMode: "table" | "charts" | "summary" | "advanced";
  onViewModeChange: (v: "table" | "charts" | "summary" | "advanced") => void;
};

export function ReportsToolbar({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  countRange,
  onCountRangeChange,
  density,
  onDensityChange,
  exportFormat,
  onExportFormatChange,
  onExport,
  onAddClick,
  realTime,
  onRealTimeChange,
  columnsVis,
  onColumnsChange,
  viewMode,
  onViewModeChange,
}: ReportsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white">
      <div className="flex items-center gap-2">
        <Search size={18} />
        <Input
          type="text"
          placeholder="جستجو..."
          className="w-48 bg-transparent"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onTypeChange("all")}
          className={`chip ${selectedType === "all" ? "neon-glow-panel" : ""}`}
        >
          همه
        </button>
        <button
          onClick={() => onTypeChange("personnel")}
          className={`chip ${selectedType === "personnel" ? "neon-glow-panel" : ""}`}
        >
          پرسنل
        </button>
        <button
          onClick={() => onTypeChange("board")}
          className={`chip ${selectedType === "board" ? "neon-glow-panel" : ""}`}
        >
          هیئت مدیره
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Calendar size={16} />
        <span>بازه:</span>
        <Input
          type="number"
          className="w-20 bg-transparent text-center"
          value={countRange[0]}
          onChange={(e) => onCountRangeChange([+e.target.value || 0, countRange[1]])}
        />
        <span>-</span>
        <Input
          type="number"
          className="w-20 bg-transparent text-center"
          value={countRange[1]}
          onChange={(e) => onCountRangeChange([countRange[0], +e.target.value || 0])}
        />
      </div>

      <Select value={density} onValueChange={(v: Density) => onDensityChange(v)}>
        <SelectTrigger className="w-28 bg-transparent">
          <SelectValue placeholder="تراکم" />
        </SelectTrigger>
        <SelectContent side="bottom" align="start">
          <SelectItem value="comfort">معمولی</SelectItem>
          <SelectItem value="dense">فشرده</SelectItem>
          <SelectItem value="compact">ساده</SelectItem>
        </SelectContent>
      </Select>

      <Select value={exportFormat} onValueChange={(v: typeof exportFormat) => onExportFormatChange(v)}>
        <SelectTrigger className="w-24 bg-transparent">
          <SelectValue placeholder="خروجی" />
        </SelectTrigger>
        <SelectContent side="bottom" align="start">
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="excel">Excel</SelectItem>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="json">JSON</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onExport} variant="secondary" size="sm">
        <Download size={16} className="mr-1" /> خروجی
      </Button>

      <Button onClick={onAddClick} size="sm">
        <ListFilter size={16} className="mr-1" /> افزودن گزارش
      </Button>

      <Select value={viewMode} onValueChange={(v: typeof viewMode) => onViewModeChange(v)}>
        <SelectTrigger className="w-28 bg-transparent">
          <SelectValue placeholder="نمایش" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="table">جدول</SelectItem>
          <SelectItem value="charts">نمودار</SelectItem>
          <SelectItem value="summary">خلاصه</SelectItem>
          <SelectItem value="advanced">پیشرفته</SelectItem>
        </SelectContent>
      </Select>

      <label className="ml-auto flex items-center gap-2">
        <Switch checked={realTime} onCheckedChange={onRealTimeChange} />
        <span>به‌روزرسانی لحظه‌ای</span>
      </label>

      <Popover>
        <PopoverTrigger asChild>
          <button className="chip flex items-center gap-1">
            <Columns size={16} />
            ستون‌ها
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 bg-[#1e293b] text-gray-100 text-sm">
          <div className="space-y-2">
            {Object.entries(columnsVis).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onColumnsChange({ ...columnsVis, [key]: e.target.checked })}
                />
                {key}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
