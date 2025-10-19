"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Sidebar from "@/components/ui/Sidebar";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

type Row = Record<string, any>;
type DbColumn = { name: string; type: string; nullable: boolean; primary_key: boolean };

const norm = (s: string) =>
  s.trim().toLowerCase().replace(/[‌\u200c]/g, "").replace(/\s+/g, "_");

function inferKind(values: any[]) {
  const sample = values.slice(0, 200).map((v) => String(v ?? "").trim());
  const notEmpty = sample.filter((v) => v !== "");
  const ratio = (n: number) => (sample.length ? n / sample.length : 0);
  const emailC = notEmpty.filter((v) => /.+@.+\..+/.test(v)).length;
  if (ratio(emailC) > 0.6) return "email";
  const natIdC = notEmpty.filter((v) => /^\d{10}$/.test(v)).length;
  if (ratio(natIdC) > 0.6) return "national_id";
  const phoneC = notEmpty.filter((v) => /^(\+?\d{8,15}|0\d{9,11})$/.test(v)).length;
  if (ratio(phoneC) > 0.6) return "phone";
  const dateC = notEmpty.filter((v) => {
    const d = new Date(v);
    return !isNaN(d as any) || /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(v);
  }).length;
  if (ratio(dateC) > 0.6) return "date";
  const imageC = notEmpty.filter((v) => /\.(jpg|jpeg|png|gif|webp)$/i.test(v) || /^https?:\/\//i.test(v)).length;
  if (ratio(imageC) > 0.5) return "image";
  const codeC = notEmpty.filter((v) => /^[A-Za-z0-9\-_\/]+$/.test(v) && v.length <= 20).length;
  if (ratio(codeC) > 0.6) return "code";
  const firstNameC = notEmpty.filter((v) => /^[\p{L}\s'-]{2,24}$/u.test(v) && !v.includes("@") && !/\d/.test(v)).length;
  if (ratio(firstNameC) > 0.5) return "name_like";
  return "text";
}

function autoMap(headers: string[], rows: Row[], dbFields: string[]) {
  const m: Record<string, string> = {};
  const candidates = new Set(dbFields.map(norm));
  const synonyms: Record<string, string[]> = {
    national_id_image: ["تصویر_کارت_ملی","کارت_ملی","national_id_image","national_card_image","id_card_image"],
    birth_certificate_image: ["شناسنامه","تصویر_شناسنامه","birth_certificate_image","shenasnameh_image"],
    personal_photo: ["عکس","عکس_پرسنلی","photo","avatar","personal_photo","image"],
    national_id: ["کد_ملی","کدملی","national_id"],
    personnel_code: ["کد_پرسنلی","personnel_code","emp_code","employee_code"],
    first_name: ["نام","first_name","firstname"],
    last_name: ["نام_خانوادگی","last_name","family","lastname"],
    email: ["ایمیل","email","mail"],
    mobile_phone: ["موبایل","تلفن","شماره","mobile","phone","cell"],
    position: ["سمت","position","role","title"],
    birth_date: ["تاریخ_تولد","birth_date","dob","تولد"],
    created_at: ["تاریخ_ایجاد","created_at","createdon"],
  };

  const columnValues: Record<string, any[]> = {};
  headers.forEach((h) => (columnValues[h] = rows.map((r) => r[h])));

  const scoreField = (header: string, field: string) => {
    let sc = 0;
    const H = norm(header);
    const F = norm(field);
    if (H === F) sc += 5;
    if (H.includes(F) || F.includes(H)) sc += 2;
    for (const [dbf, keys] of Object.entries(synonyms)) {
      if (norm(dbf) === F) {
        if (keys.some((k) => H.includes(norm(k)))) sc += 4;
      }
    }
    const kind = inferKind(columnValues[header] || []);
    const kindToField: Record<string, string[]> = {
      email: ["email"],
      national_id: ["national_id"],
      phone: ["mobile_phone", "phone", "tel"],
      date: ["birth_date","created_at","issue_date","effective_employee_date","effective_marital_date","service_start_date","service_end_date"],
      image: ["personal_photo","national_id_image","birth_certificate_image","image","avatar"],
      code: ["personnel_code","employee_code","work_id_code"],
      name_like: ["first_name","last_name","full_name","name"],
      text: ["address","city","position","role","religion","sect","citizenship","nationality"],
    };
    if (kindToField[kind]?.some((f) => f === F)) sc += 3;
    return sc;
  };

  headers.forEach((h) => {
    let best: { f: string; sc: number } | null = null;
    dbFields.forEach((f) => {
      const sc = scoreField(h, f);
      if (!best || sc > best.sc) best = { f, sc };
    });
    if (best && best.sc >= 3) m[h] = best.f; else m[h] = "";
  });
  return m;
}

export default function ImportEmployeesPage() {
  const [expanded, setExpanded] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);

  const [dbCols, setDbCols] = useState<DbColumn[]>([]);
  const dbFieldNames = useMemo(()=> dbCols.map(c=>c.name), [dbCols]);

  const [mapping, setMapping] = useState<Record<string,string>>({});
  const [required, setRequired] = useState<string[]>([]);
  const [log, setLog] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(()=>{
    (async ()=>{
      try{
        setSchemaError(null);
        const r = await fetch("/api/employees/schema", { cache:"no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setDbCols(j?.columns || []);
      }catch(e:any){
        setSchemaError(e?.message || "اسکیما از سرور دریافت نشد. از هدرهای اکسل به‌عنوان لیست فیلد استفاده می‌شود.");
        setDbCols([]); // fallback → بعد از خواندن فایل هدرها جایگزین می‌شوند
      }
    })();
  },[]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
  }

  function readXLSX(f: File) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
      setRows(json);
      const hdr = Object.keys(json[0] || []);
      setExcelHeaders(hdr);

      // اگر اسکیما نداشتیم، برای UI از هدرها به‌عنوان DB fields استفاده کن
      let dbFields = dbFieldNames;
      if (!dbFields.length) dbFields = hdr.map(norm);

      const auto = autoMap(hdr, json, dbFields);
      setMapping(auto);
      const req = Object.values(auto).filter(Boolean);
      setRequired(req);
    };
    reader.readAsArrayBuffer(f);
  }

  useEffect(()=>{ if(file) readXLSX(file); },[file]);

  async function submit() {
    if (!rows.length) return;
    setBusy(true); setLog(null);
    const res = await fetch("/api/import/employees", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ rows, required_fields: required, mapping }),
    });
    const j = await res.json();
    setLog({ status: res.status, ...j });
    setBusy(false);
  }

  return (
    <div dir="rtl"
         className="flex min-h-screen text-cyan-50 bg-[radial-gradient(120rem_70rem_at_120%_-10%,rgba(34,211,238,.18),transparent),radial-gradient(100rem_60rem_at_-10%_120%,rgba(99,102,241,.18),transparent),#0b1220]">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main className="flex-1 p-6 md:p-10 space-y-8" style={{ paddingRight: expanded ? "256px" : "72px" }}>
        <header className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow text-white">
          <h1 className="text-2xl md:text-3xl font-bold">ورود اطلاعات پرسنل از اکسل</h1>
          <p className="opacity-80 mt-1 text-sm">
            فایل اکسل را انتخاب کن؛ مپینگ هدرها به فیلدهای دیتابیس <b>(خودکار)</b> تنظیم می‌شود. در صورت نیاز دستی تغییر بده.
          </p>
          {schemaError && <div className="mt-2 text-amber-300 text-sm">⚠ {schemaError}</div>}
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow text-white space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <Input type="file" accept=".xlsx,.xls" onChange={onFile} className="bg-white/20 border-white/20" />
            <Button disabled={!file} onClick={() => file && readXLSX(file)} className="bg-cyan-400 text-[#0b1220] hover:brightness-110">
              خواندن فایل
            </Button>
            <Button disabled={!rows.length || busy} onClick={submit} className="bg-indigo-500 text-white hover:brightness-110">
              {busy ? "در حال ارسال…" : "ارسال به سرور"}
            </Button>
          </div>

          {!file && (
            <div className="text-white/80 text-sm">
              برای شروع، فایل اکسل «مشخصات پرسنل» را انتخاب کن. پس از خواندن، پیش‌نمایش و مپینگ خودکار نمایش داده می‌شود.
            </div>
          )}

          {/* مپینگ (با پیش‌فرض خودکار، قابل ویرایش) */}
          {excelHeaders.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm"><b>۱) مپینگ خودکار هدرهای اکسل → فیلد دیتابیس</b></div>
              <div className="overflow-auto border border-white/10 rounded-xl bg-white/5">
                <table className="min-w-[720px] text-sm">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="px-3 py-2 text-right border-b border-white/10">هدر اکسل</th>
                      <th className="px-3 py-2 text-right border-b border-white/10">فیلد دیتابیس</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelHeaders.map((h)=>(
                      <tr key={h} className="odd:bg-white/5">
                        <td className="px-3 py-2 border-b border-white/10">{h}</td>
                        <td className="px-3 py-2 border-b border-white/10">
                          <select
                            value={mapping[h] || ""}
                            onChange={(e)=>setMapping(m=>({ ...m, [h]: e.target.value }))}
                            className="border border-white/20 rounded-md px-2 py-1 bg-white/10"
                          >
                            <option value="">— انتخاب کن —</option>
                            {(dbFieldNames.length? dbFieldNames : excelHeaders.map(norm)).map(n=>(
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Required fields */}
              <div className="text-sm mt-4"><b>۲) فیلدهای اجباری</b></div>
              <div className="flex flex-wrap gap-2">
                {(dbFieldNames.length? dbFieldNames : excelHeaders.map(norm)).map((n)=> {
                  const on = required.includes(n);
                  return (
                    <button key={n}
                      onClick={()=>setRequired(arr => on ? arr.filter(x=>x!==n) : [...arr, n])}
                      className={`px-3 py-1 rounded-full text-xs border ${on ? "bg-cyan-400 text-[#0b1220] border-cyan-400" : "bg-white/10 border-white/20"}`}
                    >{n}</button>
                  );
                })}
              </div>

              {/* Preview */}
              <div className="text-sm mt-4"><b>۳) پیش‌نمایش 10 ردیف</b></div>
              <div className="overflow-auto border border-white/10 rounded-xl bg-white/5">
                <table className="min-w-[720px] text-xs">
                  <thead>
                    <tr className="bg-white/10">
                      {excelHeaders.map((h) => (
                        <th key={h} className="px-3 py-2 text-right border-b border-white/10">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="odd:bg-white/5">
                        {excelHeaders.map((h) => (
                          <td key={h} className="px-3 py-1 border-b border-white/10">
                            {String(r[h] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* گزارش */}
          {log && (
            <section className="space-y-3">
              <div><b>نتیجه:</b> وضعیت {log.status}</div>
              {"inserted" in log && (
                <ul className="text-sm space-y-1">
                  <li>افزوده‌شده: {log.inserted}</li>
                  <li>به‌روزشده: {log.updated}</li>
                  <li>ناموفق: {log.failed}</li>
                  <li>تعداد کل نواقص: {log.deficiencies_total}</li>
                </ul>
              )}
              {Array.isArray(log.report) && log.report.length > 0 && (
                <>
                  <div className="text-sm mt-2"><b>گزارش:</b> (۱۰ مورد اول)</div>
                  <div className="overflow-auto border border-white/10 rounded-xl bg-white/5">
                    <table className="min-w-[720px] text-xs">
                      <thead>
                        <tr className="bg-white/10">
                          <th className="px-3 py-2 text-right border-b border-white/10">ردیف</th>
                          <th className="px-3 py-2 text-right border-b border-white/10">کلید</th>
                          <th className="px-3 py-2 text-right border-b border-white/10">نواقص</th>
                          <th className="px-3 py-2 text-right border-b border-white/10">خطا</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.report.slice(0, 10).map((r:any, i:number)=>(
                          <tr key={i} className="odd:bg-white/5">
                            <td className="px-3 py-1 border-b border-white/10">{r.row_index ?? ""}</td>
                            <td className="px-3 py-1 border-b border-white/10">{r.key ?? ""}</td>
                            <td className="px-3 py-1 border-b border-white/10">{Array.isArray(r.missing_fields) ? r.missing_fields.join(", ") : ""}</td>
                            <td className="px-3 py-1 border-b border-white/10">{r.error ?? ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}






