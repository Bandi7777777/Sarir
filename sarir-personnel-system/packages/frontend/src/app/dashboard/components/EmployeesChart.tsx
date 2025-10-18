'use client';
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
type Employee = { created_at?: string; hire_date?: string; };
function monthKey(d: Date) { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); return `${y}-${m}`; }
export default function EmployeesChart({ employees }: { employees: Employee[] }) {
  const data = useMemo(() => { const map = new Map<string, number>(); const now = new Date(); for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); map.set(monthKey(d), 0); } for (const e of employees || []) { const t = Date.parse(e.created_at || e.hire_date || ""); if (!Number.isFinite(t)) continue; const k = monthKey(new Date(t)); if (map.has(k)) map.set(k, (map.get(k) || 0) + 1); } return Array.from(map, ([name, value]) => ({ name, value })); }, [employees]);
  return (<div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" /></BarChart></ResponsiveContainer></div>);
}
