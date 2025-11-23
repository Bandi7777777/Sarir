"use client";

import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowRightIcon,
  PencilIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/** ───────── schema ───────── **/
const schema = z.object({
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  national_id: z.string().min(1, "کد ملی الزامی است"),
  email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("").transform(() => undefined)),
  mobile_phone: z
    .string()
    .regex(/^\d{10,11}$/, "شماره موبایل 10 یا 11 رقمی وارد کنید")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  position: z.string().optional(),
  department: z.string().optional(),
  education_level: z.string().optional(),
  marital_status: z.enum(["single", "married", "divorced", "widowed"]).optional().or(z.literal("").transform(() => undefined)),
  address: z.string().optional(),
});
type FormData = z.input<typeof schema>;

type Employee = {
  id: string | number;
  personnel_code?: string | null;
  employee_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  national_id?: string | null;
  email?: string | null;
  mobile_phone?: string | null;
  position?: string | null;
  department?: string | null;
  education_level?: string | null;
  marital_status?: string | null;
  address?: string | null;
  created_at?: string | null;
};

export default function EmployeeViewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /** inline editing state */
  const [editing, setEditing] = useState(false);
  /** modal editing state */
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(`/api/employees/${id}`, { cache: "no-store" });
        const j: Employee = await r.json();
        if (!r.ok || !j) throw new Error((j as any)?.detail || `HTTP ${r.status}`);
        if (!off) setData(j);
      } catch (e: any) {
        if (!off) setErr(e?.message || "خطا در دریافت اطلاعات");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [id]);

  const fullName = useMemo(
    () => `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim() || "—",
    [data]
  );

  /** react-hook-form برای inline و modal (یک فرم مشترک) */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });

  useEffect(() => {
    if (!data) return;
    reset({
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      national_id: data.national_id ?? "",
      email: data.email ?? "",
      mobile_phone: data.mobile_phone ?? "",
      position: data.position ?? "",
      department: data.department ?? "",
      education_level: data.education_level ?? "",
      marital_status: (data.marital_status as any) ?? "",
      address: data.address ?? "",
    });
  }, [data, reset]);

  const onSave = async (formData: FormData) => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v === "" ? undefined : v])
      );
      const r = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `HTTP ${r.status}`);
      }
      setMsg("ذخیره شد.");
      setEditing(false);
      setModalOpen(false);
      router.refresh(); // داده‌های صفحه تازه می‌شود
    } catch (e: any) {
      setMsg(e?.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div dir="rtl" className="p-6">در حال بارگذاری…</div>;
  if (err) return <div dir="rtl" className="p-6 text-rose-300">خطا: {err}</div>;
  if (!data) return <div dir="rtl" className="p-6">موردی یافت نشد.</div>;

  return (
    <div
      dir="rtl"
      className="min-h-screen p-6 md:p-10 text-cyan-50"
      style={{
        background:
          "radial-gradient(120rem 70rem at 120% -10%, rgba(34,211,238,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(99,102,241,.18), transparent), #0b1220",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header (glass & neon) */}
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="border border-white/10 bg-white/10 rounded-2xl p-5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 grid place-items-center">
                <UserIcon className="h-7 w-7 text-[#0b1220]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <div className="text-sm opacity-70">جزئیات پرسنل #{id}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing((p) => !p)}
                className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-2 rounded-xl hover:bg-white/15"
              >
                <PencilIcon className="h-5 w-5" />
                {editing ? "لغو ویرایش" : "ویرایش اینلاین"}
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-2 rounded-xl hover:bg-white/15"
              >
                <PencilIcon className="h-5 w-5" />
                مودال ویرایش
              </button>
              <Link
                href={`/personnel/view/${id}/documents`}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] px-3 py-2 rounded-xl font-semibold shadow"
              >
                <PaperClipIcon className="h-5 w-5" />
                مدارک
              </Link>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-2 rounded-xl hover:bg-white/15"
              >
                <ArrowRightIcon className="h-5 w-5" />
                بازگشت
              </button>
            </div>
          </div>
        </motion.header>

        {/* Info / Inline Edit */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* کارت اطلاعات پایه */}
          <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
            <h3 className="font-semibold mb-3 text-cyan-100">اطلاعات پایه</h3>

            {!editing ? (
              <div className="space-y-2 text-sm">
                <Row label="نام">{fullName}</Row>
                <Row label="کُد ملی">{data?.national_id || "—"}</Row>
                <Row label="ایمیل">{data?.email || "—"}</Row>
                <Row label="موبایل">{data?.mobile_phone || "—"}</Row>
                <Row label="سمت">{data?.position || "—"}</Row>
                <Row label="دپارتمان">{data?.department || "—"}</Row>
                <Row label="مدرک">{data?.education_level || "—"}</Row>
                <Row label="وضعیت تأهل">{data?.marital_status || "—"}</Row>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSave)} className="grid grid-cols-1 gap-3">
                <Field label="نام *" error={errors.first_name?.message}>
                  <input {...register("first_name")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                         placeholder="نام" />
                </Field>
                <Field label="نام خانوادگی *" error={errors.last_name?.message}>
                  <input {...register("last_name")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                         placeholder="نام خانوادگی" />
                </Field>
                <Field label="کُد ملی *" error={errors.national_id?.message}>
                  <input {...register("national_id")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50"
                         placeholder="1234567890" />
                </Field>
                <Field label="ایمیل" error={errors.email?.message}>
                  <input {...register("email")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50 ltr"
                         placeholder="name@example.com" />
                </Field>
                <Field label="موبایل" error={errors.mobile_phone?.message}>
                  <input {...register("mobile_phone")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50"
                         placeholder="09xxxxxxxxx" />
                </Field>
                <Field label="سمت">
                  <input {...register("position")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50" />
                </Field>
                <Field label="دپارتمان">
                  <input {...register("department")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50" />
                </Field>
                <Field label="مدرک">
                  <input {...register("education_level")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50" />
                </Field>
                <Field label="وضعیت تأهل">
                  <select {...register("marital_status")}
                          className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50">
                    <option value="">انتخاب کنید…</option>
                    <option value="single">مجرد</option>
                    <option value="married">متأهل</option>
                    <option value="divorced">طلاق‌گرفته</option>
                    <option value="widowed">بیوه</option>
                  </select>
                </Field>
                <Field label="آدرس">
                  <textarea {...register("address")}
                            className="w-full h-20 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50" />
                </Field>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={!isValid || saving}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] font-semibold disabled:opacity-50"
                  >
                    {saving ? "در حال ذخیره…" : "ذخیره"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(false); reset(); }}
                    className="px-4 py-2 rounded-md border border-white/15 bg-white/10 hover:bg-white/15"
                  >
                    انصراف
                  </button>
                  {msg && <span className="text-xs text-emerald-300">{msg}</span>}
                </div>
              </form>
            )}
          </div>

          {/* کارت تماس */}
          <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
            <h3 className="font-semibold mb-3 text-cyan-100">راه‌های تماس</h3>
            <div className="space-y-2 text-sm">
              <Row icon={<EnvelopeIcon className="h-5 w-5" />} label="ایمیل">{data?.email || "—"}</Row>
              <Row icon={<PhoneIcon className="h-5 w-5" />} label="موبایل">{data?.mobile_phone || "—"}</Row>
            </div>
          </div>

          {/* میانبرها */}
          <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
            <h3 className="font-semibold mb-3 text-cyan-100">میانبرها</h3>
            <div className="flex flex-col gap-3">
              <Link href="/personnel/list" className="text-center bg-white/10 border border-white/15 px-4 py-2 rounded-xl hover:bg-white/15">
                بازگشت به لیست
              </Link>
              <Link href={`/personnel/view/${id}/documents`} className="text-center bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] px-4 py-2 rounded-xl font-semibold shadow flex items-center justify-center gap-2">
                <PaperClipIcon className="h-5 w-5" />
                مدارک این پرسنل
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[min(700px,95vw)] rounded-2xl bg-[#0b1220] text-cyan-50 p-5 border border-white/15"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold">ویرایش سریع</div>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSave)} className="grid md:grid-cols-2 gap-3">
                <Field label="نام *" error={errors.first_name?.message}>
                  <input {...register("first_name")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50" />
                </Field>
                <Field label="نام خانوادگی *" error={errors.last_name?.message}>
                  <input {...register("last_name")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50" />
                </Field>
                <Field label="ایمیل" error={errors.email?.message}>
                  <input {...register("email")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50 ltr" />
                </Field>
                <Field label="موبایل" error={errors.mobile_phone?.message}>
                  <input {...register("mobile_phone")}
                         className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-cyan-50" />
                </Field>
                <div className="md:col-span-2 flex items-center justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="px-4 py-2 rounded-md border border-white/15 bg-white/10 hover:bg-white/15"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || saving}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] font-semibold disabled:opacity-50"
                  >
                    {saving ? "در حال ذخیره…" : "ذخیره"}
                  </button>
                </div>
                {msg && <div className="md:col-span-2 text-xs text-emerald-300">{msg}</div>}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Helpers */
function Row({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2 text-sm">
      <span className="opacity-70 flex items-center gap-2">{icon}{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
