"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as TooltipChart,
  Legend as LegendChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Cell,
} from "recharts";

import { ReportsCard } from "../ui/ReportsCard";

type Props = {
  trendData: any[];
  barData: any[];
  pieData: any[];
  radarData: any[];
};

const palette = ["#0f92b1", "#14a3c5", "#4fc9de", "#7ddff0", "#0c4c63", "#f8aa44"];

export function ReportsCharts({ trendData, barData, pieData, radarData }: Props) {
  return (
    <ReportsCard className="p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">روند ماهانه</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <TooltipChart />
              <LegendChart />
              <Line type="monotone" dataKey="count" name="تعداد" stroke={palette[1]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="secondary" name="داده ثانویه" stroke={palette[5]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">تعداد بر اساس دسته</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <TooltipChart />
              <Bar dataKey="count" fill={palette[2]} name="تعداد" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">سهم دسته‌ها</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <TooltipChart />
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={palette[idx % palette.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">مقایسه شاخص‌های کیفی</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
              <Radar name="شاخص A" dataKey="A" stroke={palette[0]} fill={palette[0]} fillOpacity={0.35} />
              <Radar name="شاخص B" dataKey="B" stroke={palette[5]} fill={palette[5]} fillOpacity={0.25} />
              <LegendChart />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportsCard>
  );
}
