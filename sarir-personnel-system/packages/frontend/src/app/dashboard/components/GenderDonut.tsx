"use client";

import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type Employee = { gender?: string };

export default function GenderDonut({ employees }: { employees: Employee[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of employees || []) {
      let g = (e.gender || "نامشخص").toString().trim().toLowerCase();
      if (/^m(ale)?$/.test(g) || g === "مرد") g = "مرد";
      else if (/^f(emale)?$/.test(g) || g === "زن") g = "زن";
      else g = "نامشخص";
      map.set(g, (map.get(g) || 0) + 1);
    }
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [employees]);

  const colors = ["#0f92b1", "#4fc9de", "#f8aa44"];

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" nameKey="name" data={data} innerRadius="55%" outerRadius="80%" paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
