"use client";

import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
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

type Vehicle = {
  id: number;
  model: string;
  plate: string;
  chassisNumber: string;
  driverId: string;
  status: "active" | "maintenance" | "inactive";
  latitude?: number;
  longitude?: number;
};

const initialVehicles: Vehicle[] = [
  {
    id: 1,
    model: "FH500",
    plate: "12الف345",
    chassisNumber: "CH-001",
    driverId: "101",
    status: "active",
    latitude: 35.6892,
    longitude: 51.389,
  },
  {
    id: 2,
    model: "FM460",
    plate: "67ب678",
    chassisNumber: "CH-002",
    driverId: "102",
    status: "maintenance",
    latitude: 35.72,
    longitude: 51.41,
  },
];

export default function RegisterVehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [formData, setFormData] = useState<VehicleFormValues>({
    model: "",
    plate: "",
    chassisNumber: "",
    driverId: "",
    status: "active",
    latitude: "",
    longitude: "",
  });
  const [editForm, setEditForm] = useState<VehicleFormValues>({
    model: "",
    plate: "",
    chassisNumber: "",
    driverId: "",
    status: "active",
    latitude: "",
    longitude: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Vehicle["status"]>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return vehicles.filter((v) => {
      const matchesSearch =
        !q ||
        [v.model, v.plate, v.chassisNumber, v.driverId].some((field) =>
          field.toLowerCase().includes(q)
        );
      const matchesStatus = statusFilter === "all" ? true : v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const totalActive = filteredVehicles.filter((v) => v.status === "active").length;

  const handleCreate = (values: VehicleFormValues) => {
    if (!values.model || !values.plate) {
      toast.error("مدل و پلاک را وارد کنید.");
      return;
    }

    const newId = Math.max(0, ...vehicles.map((v) => v.id)) + 1;
    setVehicles((prev) => [
      ...prev,
      {
        id: newId,
        model: values.model,
        plate: values.plate,
        chassisNumber: values.chassisNumber,
        driverId: values.driverId,
        status: values.status,
        latitude: values.latitude ? Number(values.latitude) : undefined,
        longitude: values.longitude ? Number(values.longitude) : undefined,
      },
    ]);
    setFormData({
      model: "",
      plate: "",
      chassisNumber: "",
      driverId: "",
      status: "active",
      latitude: "",
      longitude: "",
    });
    toast.success("وسیله جدید ثبت شد.");
  };

  const handleExport = () => {
    const header = ["مدل", "پلاک", "شماره شاسی", "راننده", "وضعیت"];
    const rows = filteredVehicles.map((v) => [
      v.model,
      v.plate,
      v.chassisNumber,
      v.driverId,
      v.status,
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vehicles.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("خروجی CSV آماده شد.");
  };

  const openEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditForm({
      model: vehicle.model,
      plate: vehicle.plate,
      chassisNumber: vehicle.chassisNumber,
      driverId: vehicle.driverId,
      status: vehicle.status,
      latitude: vehicle.latitude?.toString() || "",
      longitude: vehicle.longitude?.toString() || "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = (values: VehicleFormValues) => {
    if (!selectedVehicle) return;
    if (!values.model || !values.plate) {
      toast.error("مدل و پلاک را وارد کنید.");
      return;
    }
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === selectedVehicle.id
          ? {
              ...v,
              model: values.model,
              plate: values.plate,
              chassisNumber: values.chassisNumber,
              driverId: values.driverId,
              status: values.status,
              latitude: values.latitude ? Number(values.latitude) : undefined,
              longitude: values.longitude ? Number(values.longitude) : undefined,
            }
          : v
      )
    );
    setEditOpen(false);
    setSelectedVehicle(null);
    toast.success("ویرایش انجام شد.");
  };

  const handleDelete = () => {
    if (!selectedVehicle) return;
    setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle.id));
    setDeleteOpen(false);
    setSelectedVehicle(null);
    toast.success("وسیله حذف شد.");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const toolbar = (
    <FilterBar>
      <div className="flex flex-1 items-center gap-3">
        <Input
          placeholder="جستجو بر اساس مدل، پلاک یا راننده..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          dir="rtl"
        />
      </div>
      <ListActionBar>
        <Select value={statusFilter} onValueChange={(v: "all" | Vehicle["status"]) => setStatusFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="همه وضعیت‌ها" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            <SelectItem value="active">فعال</SelectItem>
            <SelectItem value="maintenance">در تعمیر</SelectItem>
            <SelectItem value="inactive">غیرفعال</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <ArrowPathIcon className="h-4 w-4" />
          <span className="hidden sm:inline">بازنشانی</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <DocumentArrowDownIcon className="h-4 w-4" />
          خروجی CSV
        </Button>
      </ListActionBar>
    </FilterBar>
  );

  return (
    <div dir="rtl">
      <FormPageLayout
        title="ثبت وسیله نقلیه"
        description="اطلاعات وسیله را ثبت کنید و لیست ثبت‌شده‌ها را در جدول زیر ببینید."
        actions={
          <Button asChild size="sm">
            <Link href="/vehicles/list">بازگشت به لیست</Link>
          </Button>
        }
      >
        <div className="space-y-6">
          <VehicleForm values={formData} onChange={setFormData} onSubmit={handleCreate} submitLabel="ثبت وسیله" />

          <ListHeader
            title="لیست ثبت‌شده‌ها"
            description="نمایش سریع آخرین وسایل وارد شده"
            actions={
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{filteredVehicles.length} وسیله</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">{totalActive} فعال</span>
              </div>
            }
          />

          {toolbar}

          <TableShell>
            <div className="p-4 space-y-4">
              {filteredVehicles.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                  وسیله‌ای ثبت نشده است.
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredVehicles.map((vehicle) => (
                    <li
                      key={vehicle.id}
                      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="font-semibold text-foreground">{vehicle.model}</div>
                        <div>پلاک: {vehicle.plate}</div>
                        <div>راننده: {vehicle.driverId || "-"}</div>
                        <div>وضعیت: {vehicle.status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(vehicle)} aria-label="ویرایش">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setDeleteOpen(true);
                          }}
                          aria-label="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TableShell>
        </div>
      </FormPageLayout>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش وسیله</DialogTitle>
            <DialogDescription>تغییرات مورد نظر را اعمال کنید.</DialogDescription>
          </DialogHeader>
          <VehicleForm
            values={editForm}
            onChange={setEditForm}
            onSubmit={handleEditSubmit}
            submitLabel="ذخیره تغییرات"
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف وسیله</DialogTitle>
            <DialogDescription>آیا از حذف این وسیله اطمینان دارید؟</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
