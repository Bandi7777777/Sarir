"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowRightIcon,
  PencilIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";

type Employee = {
  id: string | number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  mobile_phone?: string | null;
  national_id?: string | null;
  personnel_code?: string | null;
  employee_code?: string | null;
  position?: string | null;
  created_at?: string | null;
};

export default function EmployeeViewPage() {
  const { id } = useParams() as { id: string };
  const pathname = usePathname();
  const router = useRouter();

  const [data, setData] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(`/api/employees/${id}`, { cache: "no-store" });
        let j = await r.json();
        if (Array.isArray(j)) {
          j = j.find((x: any) => String(x?.id) === String(id)) ?? null;
        }
        if (!r.ok || !j) throw new Error(j?.detail || `HTTP ${r.status}`);
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

  const tabs = [
    { key: "profile", label: "پروفایل", href: `/personnel/view/${id}` },
    { key: "docs", label: "مدارک", href: `/personnel/view/${id}/documents`, icon: <PaperClipIcon className="h-4 w-4" /> },
  ];
  const activeKey = pathname?.endsWith("/documents") ? "docs" : "profile";

  if (loading) return <div dir="rtl" className="p-6">در حال بارگذاری…</div>;
  if (err) return <div dir="rtl" className="p-6 text-rose-300">خطا: {err}</div>;
  if (!data) return <div dir="rtl" className="p-6">موردی یافت نشد.</div>;

  return (
    <div
      dir="rtl"
      className="min-h-screen p-6 md:p-10 text-cyan-50"
      style={{ background: "radial-gradient(120rem 70rem at 120% -10%, rgba(34,211,238,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(99,102,241,.18), transparent), #0b1220"}}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
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

            {/* Segmented tabs */}
            <nav className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-xl p-1">
              {tabs.map(t => (
                <Link
                  key={t.key}
                  href={t.href}
                  className={
                    "px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition " +
                    (activeKey === t.key
                      ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] font-semibold shadow"
                      : "text-cyan-100 hover:bg-white/10")
                  }
                >
                  {t.icon}{t.label}
                </Link>
              ))}
            </nav>

            <div className="flex gap-2">
              <button
                onClick={() => alert("TODO: ویرایش — در مرحله بعد فرم PUT اضافه می‌شود")}
                className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-2 rounded-xl hover:bg-white/15"
              >
                <PencilIcon className="h-5 w-5" />
                ویرایش
              </button>
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

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="اطلاعات اصلی">
            <Field label="نام">{fullName}</Field>
            <Field label="سمت">{data?.position || "—"}</Field>
            <Field label="کُد پرسنلی">{data?.personnel_code || data?.employee_code || "—"}</Field>
            <Field label="کُد ملی">{data?.national_id || "—"}</Field>
            <Field label="تاریخ ایجاد">
              {data?.created_at ? new Date(data.created_at).toLocaleString("fa-IR") : "—"}
            </Field>
          </Card>

          <Card title="راه‌های تماس">
            <Item icon={<EnvelopeIcon className="h-5 w-5" />} value={data?.email || "—"} />
            <Item icon={<PhoneIcon className="h-5 w-5" />} value={data?.mobile_phone || "—"} />
          </Card>

          <Card title="اقدامات">
            <div className="flex flex-col gap-3">
              <Link
                href="/personnel/list"
                className="text-center bg-white/10 border border-white/15 px-4 py-2 rounded-xl hover:bg-white/15"
              >
                بازگشت به لیست
              </Link>
              <Link
                href={`/personnel/view/${id}/documents`}
                className="text-center bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] px-4 py-2 rounded-xl font-semibold shadow flex items-center justify-center gap-2"
              >
                <PaperClipIcon className="h-5 w-5" />
                مدارک این پرسنل
              </Link>
              <button
                onClick={() => alert("TODO: حذف — بعد از تأیید شما وصل می‌کنم")}
                className="text-center bg-rose-500/80 hover:bg-rose-500 text-[#0b1220] px-4 py-2 rounded-xl font-semibold"
              >
                حذف
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-white/10 border border-white/10 p-5"
    >
      <h3 className="font-semibold mb-3 text-cyan-100">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2">
      <span className="opacity-70">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function Item({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white grid place-items-center">
        {icon}
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}
