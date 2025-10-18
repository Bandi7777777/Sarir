'use client';
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";
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
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" nameKey="name" data={data} innerRadius="50%" outerRadius="80%" />
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
