"use client";

import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { ContractForm, type ContractFormValues } from "@/components/contracts/ContractForm";
import { FormPageLayout } from "@/components/layouts/FormPageLayout";
import { FilterBar } from "@/components/list/FilterBar";
import { ListActionBar } from "@/components/list/ListActionBar";
import { ListHeader } from "@/components/list/ListHeader";
import { TableShell } from "@/components/list/TableShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Contract = {
  id: number;
  title: string;
  party: string;
  date: string;
  amount: number;
};

const initialContracts: Contract[] = [
  { id: 1, title: "قرارداد خرید تجهیزات", party: "شرکت تجهیز ایرانیان", date: "2025-07-01", amount: 10_000_000 },
  { id: 2, title: "قرارداد پشتیبانی IT", party: "شرکت رایان", date: "2025-06-15", amount: 5_000_000 },
];

const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeInOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: "easeInOut" } },
};

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function RegisterContract() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [formData, setFormData] = useState<ContractFormValues>({
    title: "",
    party: "",
    date: "",
    amount: "",
  });
  const [editForm, setEditForm] = useState<ContractFormValues>({
    title: "",
    party: "",
    date: "",
    amount: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const parties = useMemo(
    () => ["all", ...Array.from(new Set(contracts.map((c) => c.party)))],
    [contracts]
  );

  const filteredContracts = useMemo(() => {
    let data = contracts.slice();
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (c) => c.title.toLowerCase().includes(q) || c.party.toLowerCase().includes(q)
      );
    }
    if (filterParty !== "all") data = data.filter((c) => c.party === filterParty);
    if (filterFrom) data = data.filter((c) => new Date(c.date) >= new Date(filterFrom));
    if (filterTo) data = data.filter((c) => new Date(c.date) <= new Date(filterTo));
    return data;
  }, [contracts, searchTerm, filterParty, filterFrom, filterTo]);

  const totalAmount = useMemo(
    () => filteredContracts.reduce((sum, c) => sum + c.amount, 0),
    [filteredContracts]
  );

  const handleCreate = (values: ContractFormValues) => {
    if (!values.title || !values.party || !values.date || !values.amount) {
      toast.error("لطفاً همه فیلدها را تکمیل کنید.");
      return;
    }

    const newId = Math.max(0, ...contracts.map((c) => c.id)) + 1;
    const newContract: Contract = {
      id: newId,
      title: values.title,
      party: values.party,
      date: values.date,
      amount: Number(values.amount),
    };
    setContracts((prev) => [...prev, newContract]);
    toast.success("قرارداد جدید ثبت شد.");
    setFormData({ title: "", party: "", date: "", amount: "" });
  };

  const exportCSV = () => {
    const header = ["عنوان", "طرف قرارداد", "تاریخ", "مبلغ"];
    const rows = filteredContracts.map((c) => [c.title, c.party, c.date, String(c.amount)]);
    const csvContent = "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contracts.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("فایل CSV با موفقیت آماده شد!");
  };

  const openEditModal = (contract: Contract) => {
    setSelectedContract(contract);
    setEditForm({
      title: contract.title,
      party: contract.party,
      date: contract.date,
      amount: String(contract.amount),
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (contract: Contract) => {
    setSelectedContract(contract);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedContract) {
      setContracts((prev) => prev.filter((c) => c.id !== selectedContract.id));
      toast.success("قرارداد حذف شد");
    }
    setDeleteModalOpen(false);
    setSelectedContract(null);
  };

  const handleEditSubmit = (values: ContractFormValues) => {
    if (!selectedContract) return;
    if (!values.title || !values.party || !values.date || !values.amount) {
      toast.error("لطفاً همه فیلدها را تکمیل کنید.");
      return;
    }

    setContracts((prev) =>
      prev.map((c) =>
        c.id === selectedContract.id
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
    toast.success("ویرایش قرارداد ذخیره شد!");
    setEditModalOpen(false);
    setSelectedContract(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterParty("all");
    setFilterFrom("");
    setFilterTo("");
    toast("فیلترها بازنشانی شد.");
  };

  const toolbar = (
    <FilterBar>
      <div className="flex flex-1 items-center gap-3">
        <Input
          placeholder="جستجو در قراردادها..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          dir="rtl"
        />
      </div>
      <ListActionBar>
        <Select value={filterParty} onValueChange={setFilterParty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="همه طرف‌ها" />
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
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="w-[140px]"
          />
          <Input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="w-[140px]"
          />
        </div>

        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <ArrowPathIcon className="h-4 w-4" />
          <span className="hidden sm:inline">بازنشانی</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <DocumentArrowDownIcon className="h-4 w-4" />
          خروجی CSV
        </Button>
      </ListActionBar>
    </FilterBar>
  );

  return (
    <div dir="rtl">
      <FormPageLayout
        title="ثبت و مدیریت قراردادها"
        description="قراردادهای فعال را ثبت، جستجو و مدیریت کنید"
        actions={
          <Button asChild size="sm">
            <Link href="/contracts/list">مشاهده فهرست قراردادها</Link>
          </Button>
        }
      >
        <div className="space-y-6">
          <ContractForm
            values={formData}
            onChange={setFormData}
            onSubmit={handleCreate}
            submitLabel="ثبت قرارداد"
          />

          <ListHeader
            title="قراردادهای ثبت‌شده"
            description="مرور و ویرایش قراردادهای اخیر"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  <DocumentTextIcon className="h-4 w-4" />
                  {filteredContracts.length} قرارداد ثبت‌شده
                </span>
                <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  مجموع: {nf.format(totalAmount)} ریال
                </span>
              </div>
            }
          />

          {toolbar}

          <TableShell>
            <div className="p-4">
              {filteredContracts.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                  هیچ قراردادی ثبت نشده است.
                </div>
              ) : (
                <motion.ul
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  <AnimatePresence>
                    {filteredContracts.map((contract) => (
                      <ContractCard
                        key={contract.id}
                        contract={contract}
                        variants={listItem}
                        onEdit={() => openEditModal(contract)}
                        onDelete={() => openDeleteModal(contract)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>
          </TableShell>
        </div>
      </FormPageLayout>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش قرارداد</DialogTitle>
            <DialogDescription>اطلاعات قرارداد را ویرایش کنید</DialogDescription>
          </DialogHeader>
          <ContractForm
            values={editForm}
            onChange={setEditForm}
            onSubmit={handleEditSubmit}
            submitLabel="ذخیره تغییرات"
            onCancel={() => setEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف قرارداد</DialogTitle>
            <DialogDescription>
              آیا از حذف این قرارداد مطمئن هستید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContractCard({
  contract,
  onEdit,
  onDelete,
  variants,
}: {
  contract: Contract;
  onEdit: () => void;
  onDelete: () => void;
  variants?: Variants;
}) {
  return (
    <motion.li
      variants={variants}
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
        <Button asChild variant="ghost" size="icon-sm" aria-label="نمایش قرارداد">
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
