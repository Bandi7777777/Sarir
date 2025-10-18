'use client';
import type { FC } from "react";
type Employee = { role?: string; position?: string; department?: string; created_at?: string; hire_date?: string; };
function safeDate(v?: string){ const t=v?Date.parse(v):NaN; return Number.isFinite(t)?new Date(t):undefined; }

// قابل‌سفارشی‌سازی بر اساس نام‌گذاری واقعی سازمان
const BOARD_KEYWORDS   = [/هیئت.?مدیره/, /عضو.?هیئت.?مدیره/, /رئیس.?هیئت.?مدیره/, /\bBoard\b/i, /Chair(man|woman)?/i, /\bCEO\b/i, /\bCOO\b/i, /\bCFO\b/i];
const MANAGER_KEYWORDS = [/\bManager\b/i, /مدیر/, /Head/i];
const DRIVER_KEYWORDS  = [/راننده/, /\bDriver\b/i];
const matches = (s:string, arr:RegExp[]) => arr.some(rx=>rx.test(s));

const KPIs: FC<{ employees: Employee[] }> = ({ employees }) => {
  const total = employees.length;
  const roleStr = (e:Employee)=>((e.role||"")+" "+(e.position||"")).trim();

  const board    = employees.filter(e => matches(roleStr(e), BOARD_KEYWORDS)).length;
  const managers = employees.filter(e => matches(roleStr(e), MANAGER_KEYWORDS) && !matches(roleStr(e), BOARD_KEYWORDS)).length;
  const drivers  = employees.filter(e => matches(roleStr(e), DRIVER_KEYWORDS)).length;
  const staff    = Math.max(0, total - board - managers - drivers);

  const d30 = new Date(); d30.setDate(d30.getDate()-30);
  const recent = employees.filter(e => { const d=safeDate(e.created_at||e.hire_date); return d? d>=d30 : false; }).length;

  const Item = ({label, value}:{label:string; value:number})=>(
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl font-extrabold">{value.toLocaleString("fa-IR")}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <Item label="کل پرسنل" value={total} />
      <Item label="هیئت‌مدیره" value={board} />
      <Item label="مدیران" value={managers} />
      <Item label="رانندگان" value={drivers} />
      <Item label="کارکنان" value={staff} />
      <Item label="ورودی ۳۰ روز اخیر" value={recent} />
    </div>
  );
};
export default KPIs;
