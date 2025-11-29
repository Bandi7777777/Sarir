"use client";

import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";

import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { DashboardButton } from "../ui/DashboardButton";
import { DashboardCard } from "../ui/DashboardCard";
import { DashboardChip } from "../ui/DashboardChip";
import { DashboardInput } from "../ui/DashboardInput";

type Tab = { label: string; href: string; active?: boolean };

type Props = {
  tabs: Tab[];
  onRefresh: () => void;
  refreshing: boolean;
  search: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
};

export function DashboardHeader({ tabs, onRefresh, refreshing, search, onSearchChange }: Props) {
  return (
    <DashboardCard className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <DashboardChip className="px-3 py-1">Sarir HR</DashboardChip>
        <span className="text-slate-400">خانه / داشبورد</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-semibold text-white">داشبورد منابع انسانی</h1>
          <p className="text-sm text-slate-300">مرور شاخص‌های کلیدی، وضعیت پرسنل و یادآورها در یک نما.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <DashboardButton
                className={
                  tab.active
                    ? "h-9 px-4"
                    : "h-9 px-4 bg-transparent border border-slate-700/80 text-slate-300 shadow-none hover:bg-slate-800/70"
                }
              >
                {tab.label}
              </DashboardButton>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <DashboardButton
          onClick={onRefresh}
          disabled={refreshing}
          className="h-10 gap-2 bg-slate-800/70 text-slate-200 shadow-none hover:bg-slate-800"
        >
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>به‌روزرسانی</span>
        </DashboardButton>
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
          <DashboardInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجوی پرسنل"
            className="pr-10"
          />
        </div>
      </div>
    </DashboardCard>
  );
}
