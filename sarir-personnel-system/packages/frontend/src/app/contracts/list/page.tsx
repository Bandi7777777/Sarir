"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

/* ---------------- Types ---------------- */
type Contract = {
  id: number;
  title: string;
  party: string;
  date: string; // YYYY-MM-DD
  amount: number;
};

/* ---------------- Sample Data ---------------- */
const initialContracts: Contract[] = [
  { id: 1, title: "قرارداد حمل و نقل", party: "شرکت آلفا", date: "2025-03-12", amount: 120_000_000 },
  { id: 2, title: "قرارداد خدمات IT", party: "شرکت بتا", date: "2025-05-21", amount: 48_000_000 },
  { id: 3, title: "قرارداد لجستیک معدن", party: "چادرملو", date: "2025-06-01", amount: 265_000_000 },
];

/* ---------------- Animations ---------------- */
const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/* ---------------- Helpers ---------------- */
const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Drawer (Form) */
function Drawer({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />
          <motion.section
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white/90 backdrop-blur-xl shadow-2xl border-l border-[#07657E]/20"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-[#07657E]/10 bg-white/70">
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-[#07657E]">{title}</h2>
              <button
                aria-label="بستن"
                className="p-2 rounded-lg hover:bg-black/5"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6 text-[#2E3234]" />
              </button>
            </header>
            <div className="p-5">{children}</div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ContractsListPage() {
  // Hydration guard برای جلوگیری از mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // data
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);

  // filters
  const [q, setQ] = useState("");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // form (drawer)
  const [editing, setEditing] = useState<Contract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; party: string; date: string; amount: string }>({
    title: "",
    party: "",
    date: "",
    amount: "",
  });

  const parties = useMemo(
    () => ["all", ...Array.from(new Set(contracts.map((c) => c.party)))],
    [contracts]
  );

  const filtered = useMemo(() => {
    let res = contracts.slice();

    const query = q.trim().toLowerCase();
    if (query) {
      res = res.filter(
        (c) => c.title.toLowerCase().includes(query) || c.party.toLowerCase().includes(query)
      );
    }

    if (partyFilter !== "all") {
      res = res.filter((c) => c.party === partyFilter);
    }

    if (fromDate) res = res.filter((c) => new Date(c.date) >= new Date(fromDate));
    if (toDate) res = res.filter((c) => new Date(c.date) <= new Date(toDate));

    return res;
  }, [contracts, q, partyFilter, fromDate, toDate]);

  const resetForm = () => {
    setEditing(null);
    setForm({ title: "", party: "", date: "", amount: "" });
  };

  const openCreate = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({ title: c.title, party: c.party, date: c.date, amount: String(c.amount) });
    setDrawerOpen(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.party || !form.date || !form.amount) {
      toast.error("لطفاً تمام فیلدها را تکمیل کنید.");
      return;
    }

    if (editing) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, title: form.title, party: form.party, date: form.date, amount: Number(form.amount) }
            : c
        )
      );
      toast.success("قرارداد ویرایش شد.");
    } else {
      const newId = Math.max(0, ...contracts.map((c) => c.id)) + 1;
      setContracts((prev) => [
        ...prev,
        { id: newId, title: form.title, party: form.party, date: form.date, amount: Number(form.amount) },
      ]);
      toast.success("قرارداد ثبت شد.");
    }
    setDrawerOpen(false);
    resetForm();
  };

  const confirmDelete = (id: number) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    toast.success("قرارداد حذف شد.");
  };

  const exportCSV = () => {
    const header = ["عنوان قرارداد", "طرف قرارداد", "تاریخ", "مبلغ"];
    const rows = filtered.map((c) => [c.title, c.party, c.date, String(c.amount)]);
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contracts.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("خروجی CSV دانلود شد.");
  };

  if (!mounted) {
    // Skeleton SSR-safe (نور ملایم و شبکه ظریف)
    return (
      <div
        dir="rtl"
        className="min-h-screen relative overflow-hidden"
        style={{
          background:
            "radial-gradient(90rem 60rem at 120% -10%, rgba(7,101,126,0.18), transparent), radial-gradient(80rem 50rem at -10% 120%, rgba(242,153,31,0.18), transparent), #f3f7fb",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[.06] [background:repeating-linear-gradient(90deg,rgba(0,0,0,.25)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(0,0,0,.2)_0_1px,transparent_1px_28px)]" />
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="h-10 w-64 rounded-lg bg-black/10 mb-4" />
          <div className="h-16 rounded-xl bg-white/70 backdrop-blur-md border border-[#07657E]/20" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-white/70 backdrop-blur-md border border-[#07657E]/20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen relative overflow-hidden text-[#0b1220]"
      style={{
        // پس‌زمینه گلس + نئون سازمانی
        background:
          "radial-gradient(90rem 60rem at 120% -10%, rgba(7,101,126,0.18), transparent), radial-gradient(80rem 50rem at -10% 120%, rgba(242,153,31,0.18), transparent), #f6f9fc",
      }}
    >
      {/* Grid overlay subtle */}
      <div className="pointer-events-none absolute inset-0 opacity-[.06] [background:repeating-linear-gradient(90deg,rgba(0,0,0,.25)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(0,0,0,.2)_0_1px,transparent_1px_28px)]" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-[#07657E]/15">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#07657E]">
              مدیریت قراردادها
            </h1>
            <p className="text-sm text-[#2E3234]/70 mt-0.5">ثبت، جستجو، فیلتر و خروجی</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              className="rounded-full bg-gradient-to-r from-[#07657E] to-[#0b7f9b] text-white px-4 py-2 shadow"
              onClick={openCreate}
            >
              <PlusIcon className="h-5 w-5 ml-1" />
              قرارداد جدید
            </Button>
            <Button onClick={exportCSV} className="rounded-full bg-[#F2991F] text-white px-4 py-2 shadow">
              خروجی CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <section className="max-w-7xl mx-auto px-5 py-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#07657E]/20 shadow-sm p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-[#07657E] absolute top-1/2 left-3 -translate-y-1/2" />
            <Input
              placeholder="جستجو در عنوان یا طرف قرارداد…"
              className="pl-10"
              value={q}
              onChange={(e: any) => setQ(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-[#07657E]" />
            <select
              className="px-3 py-2 rounded-xl bg-white border border-[#07657E]/30 text-sm"
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
            >
              {parties.map((p) => (
                <option key={p} value={p}>
                  {p === "all" ? "همه طرف‌ها" : p}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#2E3234]/70">از</span>
              <Input type="date" value={fromDate} onChange={(e: any) => setFromDate(e.target.value)} />
              <span className="text-xs text-[#2E3234]/70">تا</span>
              <Input type="date" value={toDate} onChange={(e: any) => setToDate(e.target.value)} />
            </div>

            <Button
              className="p-2 bg-white hover:bg-[#F2991F]/10"
              onClick={() => {
                setQ("");
                setPartyFilter("all");
                setFromDate("");
                setToDate("");
                toast("فیلترها ریست شد.");
              }}
              aria-label="ریست فیلترها"
              title="ریست فیلترها"
            >
              <ArrowPathIcon className="h-5 w-5 text-[#07657E]" />
            </Button>

            <Button onClick={exportCSV} className="bg-[#F2991F] text-white rounded-xl">
              خروجی CSV
            </Button>

            {/* موبایل: دکمه ثبت */}
            <Button
              className="lg:hidden rounded-xl bg-gradient-to-r from-[#07657E] to-[#0b7f9b] text-white"
              onClick={openCreate}
            >
              <PlusIcon className="h-5 w-5 ml-1" />
              جدید
            </Button>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="max-w-7xl mx-auto px-5 pb-10">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[#07657E]/70">موردی یافت نشد.</div>
        ) : (
          <motion.ul
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-1"
          >
            <AnimatePresence>
              {filtered.map((c) => (
                <motion.li
                  key={c.id}
                  variants={listItem}
                  exit="exit"
                  whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(7,101,126,0.15)" }}
                  className="group bg-white/85 backdrop-blur-md border border-[#07657E]/20 rounded-2xl p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#07657E]/10 flex items-center justify-center group-hover:bg-[#07657E]/15 transition">
                      <DocumentTextIcon className="h-6 w-6 text-[#07657E]" />
                    </div>
                    <div>
                      <p className="font-extrabold tracking-tight text-[#0b1220]">{c.title}</p>
                      <p className="text-sm text-[#2E3234]">
                        طرف: {c.party} ・ تاریخ: {c.date} ・ مبلغ: {nf.format(c.amount)} تومان
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/contracts/view/${c.id}`}
                      className="p-2 rounded-full hover:bg-[#07657E]/10 text-[#07657E]"
                      aria-label="مشاهده"
                      title="مشاهده"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Button
                      className="p-2 rounded-full bg-transparent hover:bg-[#07657E]/10 text-[#07657E]"
                      onClick={() => openEdit(c)}
                      aria-label="ویرایش"
                      title="ویرایش"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      className="p-2 rounded-full bg-transparent hover:bg-red-50 text-red-600"
                      onClick={() => confirmDelete(c.id)}
                      aria-label="حذف"
                      title="حذف"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>

      {/* Drawer (Create/Edit) */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          resetForm();
        }}
        title={editing ? "ویرایش قرارداد" : "قرارداد جدید"}
      >
        <form onSubmit={submitForm} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#07657E] mb-1">عنوان قرارداد</label>
            <Input
              placeholder="مثال: قرارداد حمل و نقل"
              value={form.title}
              onChange={(e: any) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#07657E] mb-1">طرف قرارداد</label>
            <Input
              placeholder="مثال: شرکت آلفا"
              value={form.party}
              onChange={(e: any) => setForm((p) => ({ ...p, party: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#07657E] mb-1">تاریخ</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e: any) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#07657E] mb-1">مبلغ (تومان)</label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="مثال: 120000000"
                value={form.amount}
                onChange={(e: any) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            >
              انصراف
            </Button>
            <Button type="submit" className="rounded-lg bg-[#07657E] text-white">
              {editing ? "ذخیره تغییرات" : "ثبت قرارداد"}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
