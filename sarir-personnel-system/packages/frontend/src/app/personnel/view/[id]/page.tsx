"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowRightIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";

type Employee = {
  id: number;
  personnel_code?: string | null;
  employee_code?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  mobile_phone?: string | null;
  national_id?: string | null;
  position?: string | null;
  created_at?: string;
  [k: string]: any;
};

export default function EmployeeViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<Employee | null>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ---- fetch details
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const r = await fetch(`/api/employees/${id}`, { cache: "no-store" });
        let j = await r.json();
        if (Array.isArray(j)) j = j.find((x: any) => String(x?.id) === String(id)) ?? null;
        if (!r.ok || !j) throw new Error(j?.error || `HTTP ${r.status}`);
        if (!off) setData(j);
      } catch (e: any) {
        if (!off) setErr(e?.message || "خطا");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [id]);

  const fullName = useMemo(
    () => `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim() || "—",
    [data]
  );

  // ---- skeleton
  if (loading)
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 p-6 md:p-10"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-20 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );

  // ---- error
  if (err)
    return (
      <main
        dir="rtl"
        className="min-h-screen p-8 bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800"
      >
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-800/90 text-red-600 shadow-xl">
            خطا: {err}
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
            >
              بازگشت
            </button>
          </div>
        </div>
      </main>
    );

  // ---- view
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6 md:p-10"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0A8A9F] to-[#66B2FF] flex items-center justify-center shadow-lg">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
              <p className="text-sm opacity-70">جزئیات پرسنل #{id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                alert("TODO: ویرایش—در مرحلهٔ بعد فرم اینلاین و ذخیره (PUT) را فعال می‌کنیم")
              }
              className="flex items-center gap-2 bg-[#0A8A9F] hover:bg-[#09768a] text-white px-4 py-2 rounded-xl shadow"
            >
              <PencilIcon className="h-5 w-5" />
              ویرایش
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-xl"
            >
              <ArrowRightIcon className="h-5 w-5" />
              بازگشت
            </button>
          </div>
        </motion.header>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="اطلاعات اصلی">
            <Field label="نام">{fullName}</Field>
            <Field label="سمت">{data?.position || "—"}</Field>
            <Field label="کُد پرسنلی">
              {data?.personnel_code || data?.employee_code || "—"}
            </Field>
            <Field label="کُد ملی">{data?.national_id || "—"}</Field>
            <Field label="تاریخ ایجاد">
              {data?.created_at ? new Date(data?.created_at).toLocaleString("fa-IR") : "—"}
            </Field>
          </Card>

          <Card title="راه‌های تماس">
            <Item icon={<EnvelopeIcon className="h-5 w-5" />} value={data?.email || "—"} />
            <Item icon={<PhoneIcon className="h-5 w-5" />} value={data?.mobile_phone || "—"} />
          </Card>

          <Card title="اقدامات">
            <div className="flex gap-3">
              <Link
                href="/personnel/list"
                className="bg-[#0A8A9F] hover:bg-[#09768a] text-white px-4 py-2 rounded-xl shadow"
              >
                بازگشت به لیست
              </Link>
              <button
                onClick={() => alert("TODO: حذف—بعد از تاییدت دکمه حذف را وصل می‌کنم")}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow"
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

// --------- UI helpers ---------
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl p-6"
    >
      <h3 className="font-semibold mb-4 text-[#0A8A9F] dark:text-[#66B2FF]">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 py-2">
      <span className="opacity-60">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function Item({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0A8A9F] to-[#66B2FF] text-white flex items-center justify-center shadow">
        {icon}
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}


