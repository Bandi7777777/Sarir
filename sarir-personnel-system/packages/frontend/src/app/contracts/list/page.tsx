"use client";

import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { ContractForm, type ContractFormValues } from "@/components/contracts/ContractForm";
import { ListPageLayout } from "@/components/layouts/ListPageLayout";
import { FilterBar } from "@/components/list/FilterBar";
import { ListActionBar } from "@/components/list/ListActionBar";
import { ListHeader } from "@/components/list/ListHeader";
import { TableShell } from "@/components/list/TableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  { id: 1, title: "قرارداد خرید تجهیزات", party: "شرکت تجهیز ایرانیان", date: "2025-03-12", amount: 120_000_000 },
  { id: 2, title: "قرارداد پشتیبانی IT", party: "شرکت رایان", date: "2025-05-21", amount: 48_000_000 },
  { id: 3, title: "قرارداد حمل‌ونقل داخلی", party: "شرکت ارسلان", date: "2025-06-01", amount: 265_000_000 },
];

/* ---------------- Animations ---------------- */
const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeInOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: "easeInOut" } },
};
const stagger: Variants = {
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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.section
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-border bg-background shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <Button
                aria-label="بستن"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </header>
            <div className="p-5">{children}</div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ContractsListPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [contracts, setContracts] = useState<Contract[]>(initialContracts);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // form (drawer)
  const [editing, setEditing] = useState<Contract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<ContractFormValues>({ title: "", party: "", date: "", amount: "" });

  const parties = useMemo(
    () => ["all", ...Array.from(new Set(contracts.map((c) => c.party)))],
    [contracts]
  );

  const filtered = useMemo(() => {
    let res = contracts.slice();

    const query = searchTerm.trim().toLowerCase();
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
  }, [contracts, searchTerm, partyFilter, fromDate, toDate]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, c) => sum + c.amount, 0),
    [filtered]
  );

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

  const handleSubmit = (values: ContractFormValues) => {
    if (!values.title || !values.party || !values.date || !values.amount) {
      toast.error("لطفا همه فیلدها را تکمیل کنید.");
      return;
    }

    if (editing) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                title: values.title,
                party: values.party,
                date: values.date,
                amount: Number(values.amount),
              }
            : c
        )
      );
      toast.success("قرارداد ویرایش شد.");
    } else {
      const newId = Math.max(0, ...contracts.map((c) => c.id)) + 1;
      setContracts((prev) => [
        ...prev,
        {
          id: newId,
          title: values.title,
          party: values.party,
          date: values.date,
          amount: Number(values.amount),
        },
      ]);
      toast.success("قرارداد جدید اضافه شد.");
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
    toast.success("خروجی CSV آماده شد.");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setPartyFilter("all");
    setFromDate("");
    setToDate("");
    toast("فیلترها ریست شد.");
  };

  const toolbar = (
    <FilterBar>
      <div className="flex flex-1 items-center gap-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="جستجو در عنوان یا طرف قرارداد"
          className="w-full"
          dir="rtl"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </div>

      <ListActionBar>
        <Select value={partyFilter} onValueChange={setPartyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="طرف قرارداد" />
          </SelectTrigger>
          <SelectContent align="end">
            {parties.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "all" ? "همه طرف‌ها" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)}
            className="w-[140px]"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)}
            className="w-[140px]"
          />
        </div>

        <Button variant="ghost" size="sm" onClick={resetFilters} title="بازنشانی فیلترها">
          <ArrowPathIcon className="h-4 w-4" />
          <span className="hidden sm:inline">بازنشانی</span>
        </Button>

        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <DocumentArrowDownIcon className="h-4 w-4" />
          خروجی CSV
        </Button>

        <Button size="sm" onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          قرارداد جدید
        </Button>
      </ListActionBar>
    </FilterBar>
  );

  if (!mounted) {
    return (
      <div dir="rtl">
        <ListPageLayout
          title="مدیریت قراردادها"
          description="نمایش و ثبت قراردادهای سازمان"
          toolbar={toolbar}
        >
          <ListHeader title="قراردادها" description="در حال بارگذاری..." />
          <TableShell>
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-muted/60 animate-pulse" />
              ))}
            </div>
          </TableShell>
        </ListPageLayout>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <ListPageLayout
        title="مدیریت قراردادها"
        description="جستجو، فیلتر و ثبت قراردادهای سازمان"
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/contracts/register">ثبت قرارداد جدید</Link>
          </Button>
        }
        toolbar={toolbar}
      >
        <ListHeader
          title="قراردادهای جاری"
          description="لیست قراردادها به همراه امکان ویرایش سریع"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <DocumentTextIcon className="h-4 w-4" />
                {filtered.length} قرارداد
              </span>
              <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                مجموع: {nf.format(totalAmount)} ریال
              </span>
            </div>
          }
        />

        <TableShell>
          <div className="p-4">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                قراردادی یافت نشد.
              </div>
            ) : (
              <motion.ul
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence>
                  {filtered.map((c) => (
                    <ContractCard
                      key={c.id}
                      contract={c}
                      onEdit={() => openEdit(c)}
                      onDelete={() => confirmDelete(c.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>
        </TableShell>

        <Drawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            resetForm();
          }}
          title={editing ? "ویرایش قرارداد" : "قرارداد جدید"}
        >
          <ContractForm
            values={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            submitLabel={editing ? "ذخیره تغییرات" : "ثبت قرارداد"}
            onCancel={() => {
              setDrawerOpen(false);
              resetForm();
            }}
          />
        </Drawer>
      </ListPageLayout>
    </div>
  );
}

function ContractCard({
  contract,
  onEdit,
  onDelete,
}: {
  contract: Contract;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.li
      variants={listItem}
      exit="exit"
      whileHover={{ scale: 1.02 }}
      className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DocumentTextIcon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold leading-tight text-foreground">{contract.title}</p>
          <p className="text-sm text-muted-foreground">
            طرف: {contract.party} • تاریخ: {contract.date} • مبلغ: {nf.format(contract.amount)} ریال
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="icon-sm" aria-label="مشاهده قرارداد">
          <Link href={`/contracts/view/${contract.id}`}>
            <EyeIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="ویرایش" onClick={onEdit}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="حذف"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </motion.li>
  );
}
