"use client";

import { useMemo, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
  type PieProps,
  type TooltipProps,
} from "recharts";

interface DonutDatum {
  category: string;
  count: number;
  color: string;
  [key: string]: string | number;
}
interface Props {
  data: DonutDatum[];
}
type ActiveShapeProps = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: DonutDatum;
  value: number;
};

/* Tooltip سفارشی با زبان فارسی */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: DonutDatum; value?: number }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.96)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 8px 22px rgba(0,0,0,.15)",
        direction: "rtl",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{p?.payload?.category}</div>
      <div style={{ opacity: 0.85 }}>تعداد: {p?.value}</div>
    </div>
  );
}

/* Active Shape برای هایلایت بخش فعال */
function renderActiveShape(props: ActiveShapeProps) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.16}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy} dy={outerRadius + 24} textAnchor="middle" fill="#2b2b2b" style={{ fontSize: 12 }}>
        {payload.category}: {value}
      </text>
    </g>
  );
}

export default function DonutChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = useMemo(() => data.reduce((s, d) => s + (Number.isFinite(d.count) ? d.count : 0), 0), [data]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const blurAnyFocus = () => {
    const el = document.activeElement as HTMLElement | null;
    if (el && el.blur) el.blur();
  };

  const onEnter = (_: DonutDatum, index: number) => setActiveIndex(index);
  const onLeave = () => setActiveIndex(null);

  const pieProps: PieProps & { activeIndex?: number | number[] } = {
    data,
    cx: "50%",
    cy: "50%",
    innerRadius: 70,
    outerRadius: 110,
    dataKey: "count",
    nameKey: "category",
    paddingAngle: 2,
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    activeIndex: activeIndex ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- recharts activeShape expects flexible prop shape
    activeShape: renderActiveShape as any,
    isAnimationActive: true,
  };

  return (
    <div
      ref={wrapRef}
      className="relative select-none"
      onMouseDown={blurAnyFocus}
      onClick={blurAnyFocus}
      onKeyDown={blurAnyFocus}
      onTouchStart={blurAnyFocus}
    >
      <style jsx global>{`
        .recharts-wrapper,
        .recharts-surface,
        .recharts-sector,
        .recharts-pie,
        .recharts-legend-item,
        .recharts-wrapper * {
          outline: none !important;
        }
        .recharts-wrapper,
        .recharts-surface,
        svg {
          -webkit-tap-highlight-color: transparent !important;
        }
        .recharts-sector:focus,
        .recharts-surface:focus,
        .recharts-wrapper:focus,
        svg:focus {
          outline: none !important;
        }
      `}</style>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie {...pieProps}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} className="outline-none focus:outline-none" />
            ))}
          </Pie>

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontWeight: 800, fontSize: 22, fill: "var(--color-brand-primary)" }}
          >
            {activeIndex != null ? data[activeIndex].count : total}
          </text>
          <text
            x="50%"
            y="50%"
            dy="22"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: 12, opacity: 0.7, fill: "var(--color-text-main)" }}
          >
            {activeIndex != null ? data[activeIndex].category : "مجموع"}
          </text>

          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={28} wrapperStyle={{ direction: "rtl", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
