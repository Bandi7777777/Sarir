"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { memo } from "react";
import { Pie } from "react-chartjs-2";

// ثبت اجزای لازم برای Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

type PieChartProps = {
  labels: string[];
  values: number[];
  title?: string;
};

const BRAND_COLORS = [
  "#07657E", "#2E90A1", "#4AA6B8", "#7BC0CB", "#A6D7DE",
  "#F2991F", "#F5A94A", "#F7BB72", "#F9CC9A",
];

function buildData(labels: string[], values: number[], title?: string) {
  return {
    labels,
    datasets: [
      {
        label: title || "سهم",
        data: values,
        backgroundColor: BRAND_COLORS.slice(0, Math.max(values.length, 2)),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
}

export default memo(function PieChart({ labels, values, title }: PieChartProps) {
  const data = buildData(labels, values, title);
  const options = { plugins: { legend: { position: "bottom" as const } }, maintainAspectRatio: false };
  return (
    <div className="w-full h-full min-h-[260px]">
      <Pie data={data} options={options} />
    </div>
  );
});
