"use client";

import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type Employee = { department?: string };

export default function DeptDonut({ employees }: { employees: Employee[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of employees || []) {
      const dep = (e.department || "بدون واحد").trim() || "بدون واحد";
      map.set(dep, (map.get(dep) || 0) + 1);
    }
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [employees]);

  const colors = ["#0f92b1", "#14a3c5", "#4fc9de", "#7ddff0", "#0c4c63", "#f8aa44"];

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
