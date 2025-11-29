"use client";

type Employee = {
  role?: string;
  position?: string;
  department?: string;
  created_at?: string;
  hire_date?: string;
};

const BOARD_KEYWORDS = [/هیئت/iu, /عضو/iu, /Board/i, /Chair(man|woman)?/i, /\bCEO\b/i, /\bCOO\b/i, /\bCFO\b/i];
const MANAGER_KEYWORDS = [/\bManager\b/i, /مدیر/iu, /Head/i];
const DRIVER_KEYWORDS = [/راننده/iu, /\bDriver\b/i];

const matches = (s: string, arr: RegExp[]) => arr.some((rx) => rx.test(s));

const safeDate = (v?: string) => {
  const t = v ? Date.parse(v) : NaN;
  return Number.isFinite(t) ? new Date(t) : undefined;
};

export default function KPIs({ employees }: { employees: Employee[] }) {
  const total = employees.length;
  const roleStr = (e: Employee) => ((e.role || "") + " " + (e.position || "")).trim();

  const board = employees.filter((e) => matches(roleStr(e), BOARD_KEYWORDS)).length;
  const managers = employees.filter((e) => matches(roleStr(e), MANAGER_KEYWORDS) && !matches(roleStr(e), BOARD_KEYWORDS)).length;
  const drivers = employees.filter((e) => matches(roleStr(e), DRIVER_KEYWORDS)).length;
  const staff = Math.max(0, total - board - managers - drivers);

  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const recent = employees.filter((e) => {
    const d = safeDate(e.created_at || e.hire_date);
    return d ? d >= d30 : false;
  }).length;

  const Item = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/90 p-3.5 shadow-[0_8px_18px_rgba(0,0,0,0.2)] backdrop-blur-lg">
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
      <div className="text-xl font-semibold text-[var(--color-text-main)]">{value.toLocaleString("fa-IR")}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      <Item label="کل نفرات" value={total} />
      <Item label="اعضای هیئت‌مدیره" value={board} />
      <Item label="مدیران" value={managers} />
      <Item label="رانندگان" value={drivers} />
      <Item label="سایر پرسنل" value={staff} />
      <Item label="ورودی ۳۰ روز اخیر" value={recent} />
    </div>
  );
}
