"use client";

import React, { useEffect, useMemo, useState } from "react";

const API = "/api/employees"; // هم‌مبدأ

type Form = {
  emp_code: string;        // = personnel_code/employee_code
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  position?: string;
  // national_id?: string; // اگر بعداً فیلد اضافه شد، این را هم فعال کن
};

export default function RegisterPersonnel() {
  const [form, setForm] = useState<Form>({
    emp_code: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    position: "",
  });

  // وضعیت‌های تکراری
  const [dupEmail, setDupEmail] = useState<null | boolean>(null);
  const [dupPCode, setDupPCode] = useState<null | boolean>(null);
  const [dupNID, setDupNID] = useState<null | boolean>(null); // برای آینده

  const [msg, setMsg] = useState("");

  const canSubmit = useMemo(() => {
    if (!form.first_name.trim() || !form.last_name.trim()) return false;
    if (dupEmail === true || dupPCode === true || dupNID === true) return false;
    return true;
  }, [form.first_name, form.last_name, dupEmail, dupPCode, dupNID]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function checkDuplicate(query: Record<string, string | undefined>) {
    const q = Object.entries(query)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!.trim())}`)
      .join("&");
    if (!q) return [];
    const r = await fetch(`${API}?${q}`, { cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as any[];
  }

  // onBlurها
  async function onBlurEmail() {
    if (!form.email?.trim()) { setDupEmail(null); return; }
    const list = await checkDuplicate({ email: form.email });
    setDupEmail(list.length > 0);
  }

  async function onBlurPCode() {
    if (!form.emp_code?.trim()) { setDupPCode(null); return; }
    const list = await checkDuplicate({ personnel_code: form.emp_code });
    setDupPCode(list.length > 0);
  }

  // اگر national_id به فرم اضافه شد:
  // async function onBlurNID() {
  //   if (!form.national_id?.trim()) { setDupNID(null); return; }
  //   const list = await checkDuplicate({ national_id: form.national_id });
  //   setDupNID(list.length > 0);
  // }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("در حال ارسال…");

    // یک بار دیگر قبل از ارسال بررسی سریع
    if (form.email) {
      const l = await checkDuplicate({ email: form.email });
      if (l.length > 0) { setDupEmail(true); setMsg("ایمیل تکراری است."); return; }
    }
    if (form.emp_code) {
      const l = await checkDuplicate({ personnel_code: form.emp_code });
      if (l.length > 0) { setDupPCode(true); setMsg("کُد پرسنلی تکراری است."); return; }
    }

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emp_code: form.emp_code || null,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        position: form.position?.trim() || null,
      }),
    });

    const txt = await res.text();
    if (!res.ok) {
      try {
        const j = JSON.parse(txt);
        if (res.status === 409 && j?.error === "duplicate") {
          const map: Record<string, string> = {
            email: "ایمیل",
            national_id: "کُد ملی",
            personnel_code: "کُد پرسنلی",
            employee_code: "کُد کارمندی",
            unknown: "فیلد یکتا",
          };
          setMsg(`تکراری: ${map[j.field] || "فیلد"} (409)`);
          if (j.field === "email") setDupEmail(true);
          if (j.field === "personnel_code" || j.field === "employee_code") setDupPCode(true);
          if (j.field === "national_id") setDupNID(true);
          return;
        }
        setMsg(`ثبت ناموفق ❌ (Status ${res.status})`);
      } catch {
        setMsg(`ثبت ناموفق ❌ (Status ${res.status})`);
      }
      return;
    }

    setMsg("ثبت موفق ✅");
    setForm({ emp_code: "", first_name: "", last_name: "", phone: "", email: "", position: "" });
    setDupEmail(null); setDupPCode(null); setDupNID(null);
  }

  return (
    <main dir="rtl" className="min-h-screen p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">ثبت پرسنل</h1>

      {msg && <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">{msg}</pre>}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
        <div>
          <label className="block mb-1">کُد پرسنلی</label>
          <input
            name="emp_code" value={form.emp_code} onChange={onChange} onBlur={onBlurPCode}
            className="border rounded px-3 py-2 w-full"
          />
          {dupPCode === true && <p className="text-red-600 text-sm mt-1">کُد پرسنلی تکراری است.</p>}
        </div>

        <div>
          <label className="block mb-1">نام *</label>
          <input
            name="first_name" required value={form.first_name} onChange={onChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">نام خانوادگی *</label>
          <input
            name="last_name" required value={form.last_name} onChange={onChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">موبایل</label>
          <input
            name="phone" value={form.phone} onChange={onChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">ایمیل</label>
          <input
            name="email" type="email" value={form.email} onChange={onChange} onBlur={onBlurEmail}
            className="border rounded px-3 py-2 w-full"
          />
          {dupEmail === true && <p className="text-red-600 text-sm mt-1">ایمیل تکراری است.</p>}
        </div>

        <div>
          <label className="block mb-1">سمت</label>
          <input
            name="position" value={form.position} onChange={onChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="col-span-1 md:col-span-3 bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ثبت
        </button>
      </form>
    </main>
  );
}






