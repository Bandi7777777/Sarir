"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */ // TODO: refine personnel edit types

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { publishEmployeeUpdated } from "@/lib/bus";

const schema = z.object({
  personnel_code: z.string().optional(),
  employee_code: z.string().optional(),
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  national_id: z.string().min(1, "کد ملی الزامی است"),
  email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("").transform(() => undefined)),
  mobile_phone: z.string().regex(/^\d{10,11}$/, "شماره موبایل 10 یا 11 رقمی وارد کنید").optional().or(z.literal("").transform(() => undefined)),
  position: z.string().optional(), department: z.string().optional(), education_level: z.string().optional(),
  date_of_birth: z.string().optional(), hire_date: z.string().optional(),
  marital_status: z.enum(["single","married","divorced","widowed"]).optional().or(z.literal("").transform(() => undefined)),
  address: z.string().optional(),
});
type FormData = z.input<typeof schema>;

export default function EditPersonnelPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      personnel_code: "", employee_code: "", first_name: "", last_name: "", national_id: "",
      email: "", mobile_phone: "", position: "", department: "", education_level: "",
      date_of_birth: "", hire_date: "", marital_status: undefined, address: "",
    },
  });

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const r = await fetch(`/api/employees/${id}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok || !j) throw new Error(j?.detail || `HTTP ${r.status}`);
        const dto: FormData = {
          personnel_code: j.personnel_code ?? j.employee_code ?? "", employee_code: j.employee_code ?? "",
          first_name: j.first_name ?? "", last_name: j.last_name ?? "", national_id: j.national_id ?? "",
          email: j.email ?? "", mobile_phone: j.mobile_phone ?? "", position: j.position ?? "", department: j.department ?? "",
          education_level: j.education_level ?? "", date_of_birth: j.date_of_birth ? j.date_of_birth.slice(0,10) : "",
          hire_date: j.hire_date ? j.hire_date.slice(0,10) : "", marital_status: j.marital_status || undefined, address: j.address ?? "",
        };
        if (!off) reset(dto);
      } catch (e:any) { if (!off) setErr(e?.message || "خطا در دریافت اطلاعات"); }
      finally { if (!off) setLoading(false); }
    })();
    return () => { off = true; };
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true); setMsg(null); setErr(null);
    try {
      const payload = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, v === "" ? undefined : v]));
      const r = await fetch(`/api/employees/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) { const t = await r.text().catch(()=> ""); throw new Error(t || `HTTP ${r.status}`); }
      setMsg("ویرایش با موفقیت ذخیره شد.");
      publishEmployeeUpdated(id);
      router.push("/personnel/list"); router.refresh();
    } catch (e:any) { setErr(e?.message || "خطا در ذخیره اطلاعات"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 text-cyan-50" style={{ background: "radial-gradient(#07657E,#012C3E)" }}>
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl border shadow-lg text-black">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">ویرایش اطلاعات پرسنل</h1>
          <button onClick={() => router.back()} className="px-3 py-2 rounded border bg-gray-50 hover:bg-gray-100 text-sm">بازگشت</button>
        </div>

        {loading ? (
          <div className="p-4 rounded border">در حال بارگذاری…</div>
        ) : err ? (
          <div className="p-4 rounded border border-rose-300 bg-rose-50 text-rose-700 text-sm">{err}</div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="کد پرسنلی">
                <input {...register("personnel_code")} className="w-full rounded border p-2" placeholder="مثال: 120045" />
              </Field>
              <Field label="نام *" error={errors.first_name?.message}>
                <input {...register("first_name")} className="w-full rounded border p-2" placeholder="نام" />
              </Field>
              <Field label="نام خانوادگی *" error={errors.last_name?.message}>
                <input {...register("last_name")} className="w-full rounded border p-2" placeholder="نام خانوادگی" />
              </Field>
              <Field label="کد ملی *" error={errors.national_id?.message}>
                <input {...register("national_id")} className="w-full rounded border p-2" placeholder="1234567890" />
              </Field>
              <Field label="ایمیل" error={errors.email?.message}>
                <input {...register("email")} className="w-full rounded border p-2 ltr" placeholder="name@example.com" />
              </Field>
              <Field label="شماره موبایل" error={errors.mobile_phone?.message}>
                <input {...register("mobile_phone")} className="w-full rounded border p-2" placeholder="09xxxxxxxxx" />
              </Field>
              <Field label="سمت"><input {...register("position")} className="w-full rounded border p-2" /></Field>
              <Field label="دپارتمان"><input {...register("department")} className="w-full rounded border p-2" /></Field>
              <Field label="مدرک تحصیلی"><input {...register("education_level")} className="w-full rounded border p-2" /></Field>
              <Field label="تاریخ تولد"><input type="date" {...register("date_of_birth")} className="w-full rounded border p-2" /></Field>
              <Field label="تاریخ استخدام"><input type="date" {...register("hire_date")} className="w-full rounded border p-2" /></Field>
              <Field label="وضعیت تأهل">
                <select {...register("marital_status")} className="w-full rounded border p-2">
                  <option value="">انتخاب کنید…</option>
                  <option value="single">مجرد</option>
                  <option value="married">متأهل</option>
                  <option value="divorced">طلاق‌گرفته</option>
                  <option value="widowed">بیوه</option>
                </select>
              </Field>
              <div className="lg:col-span-3 md:col-span-2">
                <label className="mb-1 block text-sm font-medium">آدرس</label>
                <textarea {...register("address")} className="w-full rounded border p-2 h-24" placeholder="نشانی کامل…" />
              </div>
              <div className="lg:col-span-3 md:col-span-2">
                <button type="submit" disabled={!isValid || saving} className="w-full bg-gradient-to-r from-cyan-600 to-orange-500 text-white py-3 rounded font-medium disabled:opacity-50">
                  {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
                </button>
              </div>
            </form>
            {msg && <div className="mt-4 p-3 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 text-sm">{msg}</div>}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
