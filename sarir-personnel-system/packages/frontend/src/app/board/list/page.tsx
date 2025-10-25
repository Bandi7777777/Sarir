"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  UserPlusIcon, MagnifyingGlassIcon, ArrowPathIcon, BuildingOffice2Icon,
  PencilIcon, TrashIcon, XMarkIcon, CalendarIcon, BellAlertIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/solid";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/* Colors + tiny UI */
const CC = { teal: "#07657E", cyan: "#1FB4C8", orange: "#F2991F", dark: "#2E3234" };
const card = "bg-white/85 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      suppressHydrationWarning
      autoComplete="off"
      data-1p-ignore
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring w-full ${className || ""}`}
    />
  );
}
function Btn(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" | "danger" }) {
  const { className, variant = "solid", ...rest } = props;
  const base =
    variant === "ghost" ? "px-3 py-2 rounded-md hover:bg-gray-100" :
    variant === "danger" ? "px-3 py-2 rounded-md text-white bg-red-500 hover:bg-red-600" :
    "px-3 py-2 rounded-md text-white";
  return <button {...rest} className={`${base} ${className || ""}`} style={variant==="solid" ? { background: `linear-gradient(90deg, ${CC.teal}, ${CC.cyan})` } : {}} />;
}

/* Types */
type BoardRow = { id: number; name: string; role: string; phone?: string };
type AssemblyType = "annual" | "ordinaryExtra" | "extraordinary";
type AssemblyStatus = "planned" | "held" | "published";
type Assembly = { id: number; title: string; type: AssemblyType; year?: number; date: string; time: string; status: AssemblyStatus };

/* CSV / ICS */
function downloadCSV(rows: string[][], name = "export.csv") {
  const csv = rows.map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
function downloadICS(as: Assembly) {
  const dt = `${as.date.replaceAll("-", "")}T${as.time.replaceAll(":", "")}00`;
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SARIR-BOARD//FA","METHOD:PUBLISH","BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@sarir.local`,`DTSTAMP:${dt}Z`,`DTSTART:${dt}Z`,`DTEND:${dt}Z`,
    `SUMMARY:${as.title}`,`DESCRIPTION:نوع: ${as.type} | وضعیت: ${as.status}${as.year ? " | سال " + as.year : ""}`,
    "END:VEVENT","END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  a.download = `${as.title || "meeting"}.ics`; a.click(); URL.revokeObjectURL(a.href);
  toast("iCal ساخته شد");
}

export default function BoardMembersList() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all"|"chair"|"member">("all");
  const [sortBy, setSortBy] = useState<"name"|"role">("name");

  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [selected, setSelected] = useState<BoardRow | null>(null);

  const [members, setMembers] = useState<BoardRow[]>([
    { id: 1, name: "علی محمدی", role: "رئیس هیئت‌مدیره", phone: "09123456789" },
    { id: 2, name: "سارا احمدی", role: "عضو هیئت‌مدیره", phone: "09187654321" },
    { id: 3, name: "رضا کریمی", role: "عضو هیئت‌مدیره" },
  ]);

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();
    let list = members;
    if (roleFilter === "chair") list = list.filter(x => x.role.includes("رئیس"));
    if (roleFilter === "member") list = list.filter(x => x.role.includes("عضو"));
    if (k) list = list.filter(x => (`${x.name} ${x.role} ${x.phone || ""}`).toLowerCase().includes(k));
    list = [...list].sort((a, b) => (a[sortBy] || "").localeCompare((b as any)[sortBy] || ""));
    return list;
  }, [members, roleFilter, search, sortBy]);

  const stats = useMemo(() => {
    const total = members.length;
    const chairs = members.filter(x => x.role.includes("رئیس")).length;
    const m = members.filter(x => x.role.includes("عضو")).length;
    return { total, chairs, members: m };
  }, [members]);
  const barData = [{ name: "کل", value: stats.total }, { name: "رئیس", value: stats.chairs }, { name: "عضو", value: stats.members }];
  const pieData = [{ value: stats.chairs, fill: CC.orange }, { value: stats.members, fill: CC.teal }];

  /* KPI Strip */
  const kpis = [
    { t:"کل اعضا", v: stats.total },
    { t:"رئیس", v: stats.chairs },
    { t:"اعضا", v: stats.members },
    { t:"مجامع باز", v: 0 }, // بعداً با API
  ];

  /* Meetings */
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newAsm, setNewAsm] = useState<{ title: string; type: AssemblyType; year?: number; date: string; time: string; status: AssemblyStatus }>({
    title: "جلسه هیئت‌مدیره", type: "annual", year: undefined, date: "", time: "10:00", status: "planned",
  });

  /* Filters for assemblies */
  const [asmType, setAsmType] = useState<"all"|AssemblyType>("all");
  const [asmStatus, setAsmStatus] = useState<"all"|AssemblyStatus>("all");
  const filteredAsm = assemblies.filter(a =>
    (asmType==="all" || a.type===asmType) && (asmStatus==="all" || a.status===asmStatus)
  );

  /* Warn for near meetings ≤ 72h */
  useEffect(() => {
    const now = new Date();
    assemblies.forEach((m) => {
      const dt = new Date(`${m.date}T${m.time}`);
      const diffH = (dt.getTime() - now.getTime()) / 36e5;
      if (m.status === "planned" && diffH >= 0 && diffH <= 72) {
        toast.custom(
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900 flex items-center gap-2">
            <BellAlertIcon className="h-5 w-5" />
            <span>اخطار: جلسه نزدیک — {dt.toLocaleString("fa-IR")}</span>
          </div>
        );
      }
    });
  }, [assemblies]);

  function exportMembersCSV() {
    downloadCSV([["نام","نقش","شماره تلفن"], ...filtered.map(m => [m.name, m.role, m.phone || ""])], "board_members.csv");
    toast.success("CSV دانلود شد");
  }
  function exportAssembliesCSV() {
    const rows = [["عنوان","نوع","سال/تاریخ","ساعت","وضعیت"], ...filteredAsm.map(a=>[
      a.title, a.type, a.year?`سال ${a.year}`:a.date, a.time, a.status
    ])];
    downloadCSV(rows, "assemblies.csv"); toast.success("CSV مجامع دانلود شد");
  }
  function createAssembly() {
    if (!newAsm.date) return toast.error("تاریخ را وارد کن");
    if (!newAsm.time) return toast.error("ساعت را وارد کن");
    if (newAsm.type === "annual" && !newAsm.year) return toast.error("سال مالی لازم است");
    const id = assemblies.length ? Math.max(...assemblies.map(a => a.id)) + 1 : 1;
    setAssemblies(s => [{ id, ...newAsm }, ...s]);
    setCreateOpen(false); toast.success("مجمع ایجاد شد");
  }
  function deleteMember() {
    if (!selected) return;
    setMembers(s => s.filter(x => x.id !== selected.id));
    setDelOpen(false); toast("حذف شد");
  }

  return (
    <div dir="rtl" className="min-h-screen relative"
      style={{ background: "radial-gradient(110rem 60rem at 110% -20%, rgba(7,101,126,.14), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(242,153,31,.14), transparent), #eef3f7" }}>
      <div className="pointer-events-none absolute inset-0 opacity-[.06]" style={{ background: "repeating-linear-gradient(90deg,rgba(0,0,0,.2) 0 1px,transparent 1px 28px),repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 28px)" }} />

      {/* Header */}
      <header className={`${card} mx-4 md:mx-8 mt-6 p-4 flex items-center justify-between`}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: CC.teal }}>اعضای هیئت‌مدیره ({filtered.length})</h1>
          <p className="text-sm" style={{ color: `${CC.teal}CC` }}>مدیریت اعضا | ایجاد مجمع | اخطار جلسات نزدیک</p>
        </div>
        <div className="flex gap-2">
          <Link href="/board/register"><Btn><UserPlusIcon className="h-4 w-4 mr-2 inline-block" /> افزودن عضو</Btn></Link>
          <Btn onClick={() => setCreateOpen(true)}><CalendarIcon className="h-4 w-4 mr-2 inline-block" /> ایجاد مجمع</Btn>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="mx-4 md:mx-8 mt-4 grid md:grid-cols-4 gap-3">
        {[
          { t:"کل اعضا", v: stats.total },
          { t:"رئیس", v: stats.chairs },
          { t:"اعضا", v: stats.members },
          { t:"مجامع باز", v: assemblies.filter(a=>a.status==="planned").length },
        ].map((k,i)=>(
          <div key={i} className="p-3 rounded-xl bg-white/80 border shadow text-center">
            <div className="text-xs text-gray-500">{k.t}</div>
            <div className="text-xl font-bold" style={{ color: CC.teal }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Stats + Charts */}
      <section className={`${card} mx-4 md:mx-8 mt-4 p-4 grid md:grid-cols-2 gap-6`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[#07657E]/20 bg-[#07657E]/10">
              <h3 className="text-xs" style={{ color: `${CC.teal}CC` }}>تعداد اعضا</h3>
              <p className="text-xl font-bold" style={{ color: CC.dark }}>{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg border border-[#F2991F]/25 bg-[#F2991F]/10">
              <h3 className="text-xs" style={{ color: `${CC.orange}CC` }}>رئیس هیئت</h3>
              <p className="text-xl font-bold" style={{ color: CC.dark }}>{stats.chairs}</p>
            </div>
            <div className="p-3 rounded-lg border border-[#1FB4C8]/25 bg-[#1FB4C8]/10">
              <h3 className="text-xs" style={{ color: `${CC.teal}CC` }}>اعضای عادی</h3>
              <p className="text-xl font-bold" style={{ color: CC.dark }}>{stats.members}</p>
            </div>
            <div className="p-3 rounded-lg border border-blue-500/25 bg-blue-500/10">
              <h3 className="text-xs text-blue-700/80">گزارش‌ها</h3>
              <p className="text-xl font-bold" style={{ color: CC.dark }}>12</p>
            </div>
          </div>
          <Btn onClick={exportMembersCSV}>خروجی CSV اعضا</Btn>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-white/70 rounded-lg border border-white/40">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke={CC.teal} fontSize={12} />
                <YAxis stroke={CC.teal} fontSize={12} />
                <ChartTooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
                <Bar dataKey="value" radius={4} fill={CC.teal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-32 bg-white/70 rounded-lg border border-white/40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ value: stats.chairs, fill: CC.orange }, { value: stats.members, fill: CC.teal }]} dataKey="value" outerRadius={60} label={false}>
                  <Cell fill={CC.orange} /><Cell fill={CC.teal} />
                </Pie>
                <ChartTooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className={`${card} mx-4 md:mx-8 mt-4 p-3 flex flex-wrap gap-3 items-center`}>
        <MagnifyingGlassIcon className="h-5 w-5" style={{ color: CC.teal }} />
        <Input placeholder="جستجو نام/نقش/شماره…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent border-none placeholder:text-gray-500" />
        <div className="flex gap-2">
          <button onClick={() => setRoleFilter("all")}    className={`px-3 py-1 rounded-full text-sm ${roleFilter==="all"?"bg-[#07657E] text-white":"bg-gray-200 text-[#07657E]"}`}>همه</button>
          <button onClick={() => setRoleFilter("chair")}  className={`px-3 py-1 rounded-full text-sm ${roleFilter==="chair"?"bg-[#07657E] text-white":"bg-gray-200 text-[#07657E]"}`}>رئیس</button>
          <button onClick={() => setRoleFilter("member")} className={`px-3 py-1 rounded-full text-sm ${roleFilter==="member"?"bg-[#07657E] text-white":"bg-gray-200 text-[#07657E]"}`}>عضو</button>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setSortBy(sortBy === "name" ? "role" : "name")} className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 text-sm">
            <ArrowsUpDownIcon className="h-4 w-4 inline-block ml-1" /> سورت: {sortBy === "name" ? "نام" : "نقش"}
          </button>
          <Btn variant="ghost" onClick={() => toast("رفرش شد")}><ArrowPathIcon className="h-5 w-5" /></Btn>
        </div>
      </section>

      {/* Members */}
      <section className="mx-4 md:mx-8 my-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((m) => (
          <motion.li key={m.id} whileHover={{ y: -4 }} className={`${card} p-5 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl grid place-items-center text-white shadow" style={{ background: `linear-gradient(135deg, ${CC.teal}, ${CC.cyan})` }}>
                <BuildingOffice2Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold" style={{ color: CC.dark }}>{m.name}</div>
                <div className="text-sm" style={{ color: CC.teal }}>{m.role}</div>
                <div className="text-xs text-gray-600">{m.phone || "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Btn variant="ghost" onClick={() => { setSelected(m); setEditOpen(true); }} aria-label={`ویرایش ${m.name}`}><PencilIcon className="h-5 w-5" /></Btn>
              <Btn variant="ghost" onClick={() => { setSelected(m); setDelOpen(true); }} aria-label={`حذف ${m.name}`}><TrashIcon className="h-5 w-5 text-red-500" /></Btn>
              <Link href={`/board/view/${m.id}`} className="font-semibold" style={{ color: CC.teal }}>جزئیات →</Link>
            </div>
          </motion.li>
        ))}
        {filtered.length === 0 && <div className={`${card} p-10 text-center`} style={{ color: `${CC.teal}CC` }}>موردی یافت نشد.</div>}
      </section>

      {/* Assemblies */}
      <section className={`${card} mx-4 md:mx-8 mb-10 p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold" style={{ color: CC.teal }}>مجامع ({assemblies.length})</h2>
          <div className="flex items-center gap-2">
            <select value={asmType} onChange={e=>setAsmType(e.target.value as any)} className="border rounded-md px-2 py-1 text-sm">
              <option value="all">همهٔ انواع</option>
              <option value="annual">عادی سالانه</option>
              <option value="ordinaryExtra">به‌طور فوق‌العاده</option>
              <option value="extraordinary">فوق‌العاده</option>
            </select>
            <select value={asmStatus} onChange={e=>setAsmStatus(e.target.value as any)} className="border rounded-md px-2 py-1 text-sm">
              <option value="all">همهٔ وضعیت‌ها</option>
              <option value="planned">برنامه‌ریزی‌شده</option>
              <option value="held">برگزارشده</option>
              <option value="published">منتشرشده</option>
            </select>
            <button onClick={exportAssembliesCSV} className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 text-sm">CSV مجامع</button>
            <Btn onClick={() => setCreateOpen(true)}><CalendarIcon className="h-5 و-5 mr-2 inline-block" /> ایجاد مجمع جدید</Btn>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-right">عنوان</th>
                <th className="px-3 py-2 text-right">نوع</th>
                <th className="px-3 py-2 text-right">سال/تاریخ</th>
                <th className="px-3 py-2 text-right">ساعت</th>
                <th className="px-3 py-2 text-right">وضعیت</th>
                <th className="px-3 py-2 text-right">خروجی</th>
                <th className="px-3 py-2 text-right">اقدامات</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsm.length === 0 && <tr><td className="px-3 py-3 text-center text-gray-500" colSpan={7}>موردی برای نمایش نیست.</td></tr>}
              {filteredAsm.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{a.title}</td>
                  <td className="px-3 py-2">{a.type === "annual" ? "عادی سالانه" : a.type === "ordinaryExtra" ? "به‌طور فوق‌العاده" : "فوق‌العاده"}</td>
                  <td className="px-3 py-2">{a.year ? `سال ${a.year}` : a.date}</td>
                  <td className="px-3 py-2">{a.time}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.status==="planned"?"bg-amber-100 text-amber-800":a.status==="held"?"bg-emerald-100 text-emerald-800":"bg-blue-100 text-blue-800"}`}>
                      {a.status==="planned"?"برنامه‌ریزی‌شده":a.status==="held"?"برگزارشده":"منتشرشده"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => downloadICS(a)} className="px-2 py-1 rounded-md border bg-white hover:bg-gray-50 text-xs">iCal</button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Btn variant="ghost"><PencilIcon className="h-5 w-5" /></Btn>
                      <Btn variant="danger"><TrashIcon className="h-5 w-5" /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Assembly Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: CC.teal }}>ایجاد مجمع جدید</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm">عنوان</label>
                <Input value={newAsm.title} onChange={(e)=> setNewAsm(p=>({ ...p, title:e.target.value }))} placeholder="جلسه هیئت‌مدیره" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm">نوع مجمع</label>
                <select value={newAsm.type} onChange={(e)=> setNewAsm(p=>({ ...p, type: e.target.value as AssemblyType }))} className="border rounded-md px-3 py-2">
                  <option value="annual">مجمع عمومی عادی سالانه</option>
                  <option value="ordinaryExtra">مجمع عمومی به‌طور فوق‌العاده</option>
                  <option value="extraordinary">مجمع عمومی فوق‌العاده</option>
                </select>
              </div>
              {newAsm.type === "annual" && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm">سال مالی</label>
                  <Input type="number" placeholder="مثلاً 1404" onChange={(e)=> setNewAsm(p=>({ ...p, year: Number(e.target.value)||undefined }))} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm">تاریخ</label>
                <Input type="date" onChange={(e)=> setNewAsm(p=>({ ...p, date: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm">ساعت</label>
                <Input type="time" value={newAsm.time} onChange={(e)=> setNewAsm(p=>({ ...p, time: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm">وضعیت</label>
                <select value={newAsm.status} onChange={(e)=> setNewAsm(p=>({ ...p, status: e.target.value as AssemblyStatus }))} className="border rounded-md px-3 py-2">
                  <option value="planned">برنامه‌ریزی‌شده</option>
                  <option value="held">برگزارشده</option>
                  <option value="published">منتشرشده</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={()=> setCreateOpen(false)} className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50">انصراف</button>
              <Btn onClick={createAssembly}>ثبت مجمع</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold" style={{ color: CC.teal }}>حذف عضو</div>
              <button onClick={() => setDelOpen(false)}><XMarkIcon className="h-6 w-6 text-gray-600" /></button>
            </div>
            <p className="text-sm">آیا از حذف <b>{selected?.name}</b> مطمئنی؟</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDelOpen(false)} className="px-3 py-1.5 rounded-md border">انصراف</button>
              <Btn variant="danger" onClick={deleteMember}>حذف</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold" style={{ color: CC.teal }}>ویرایش: {selected?.name}</div>
              <button onClick={() => setEditOpen(false)}><XMarkIcon className="h-6 w-6 text-gray-600" /></button>
            </div>
            <div className="grid gap-3">
              <Input defaultValue={selected?.name} placeholder="نام" />
              <Input defaultValue={selected?.role} placeholder="نقش" />
              <Input defaultValue={selected?.phone} placeholder="شماره تماس" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditOpen(false)} className="px-3 py-1.5 rounded-md border">بستن</button>
              <Btn onClick={() => { toast.success("ذخیره شد (نمونه)"); setEditOpen(false); }}>ذخیره</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
