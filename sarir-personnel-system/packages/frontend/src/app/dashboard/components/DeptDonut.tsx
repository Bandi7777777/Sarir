'use client';
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";
type Employee = { department?: string };
export default function DeptDonut({ employees }: { employees: Employee[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of employees || []) {
      const dep = (e.department || "نامشخص").trim() || "نامشخص";
      map.set(dep, (map.get(dep) || 0) + 1);
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
