"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon, UploadIcon, CheckIcon, XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Row = Record<string, any>;
type DbColumn = { name: string; type: string; nullable: boolean; primary_key: boolean };

const norm = (s: string) =>
  s.trim().toLowerCase().replace(/[‌\u200c]/g, "").replace(/\s+/g, "_");

function levenshtein(a: string, b: string): number {
  a = norm(a);
  b = norm(b);
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

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
  const addressC = notEmpty.filter((v) => v.length > 20 && /[\p{L}\d\s\-\/]+/u.test(v) && !/@|\d{10}/.test(v)).length;
  if (ratio(addressC) > 0.5) return "address";
  const numberC = notEmpty.filter((v) => !isNaN(parseFloat(v)) && isFinite(Number(v))).length;
  if (ratio(numberC) > 0.7) return "number";
  const boolC = notEmpty.filter((v) => /^(true|false|yes|no|1|0)$/i.test(v)).length;
  if (ratio(boolC) > 0.8) return "boolean";
  return "text";
}

function autoMap(headers: string[], rows: Row[], dbFields: string[]) {
  const m: Record<string, string> = {};
  const synonyms: Record<string, string[]> = {
    national_id_image: ["تصویر_کارت_ملی", "کارت_ملی", "national_id_image", "national_card_image", "id_card_image", "تصویر_کارت", "id_image", "nat_id_img"],
    birth_certificate_image: ["شناسنامه", "تصویر_شناسنامه", "birth_certificate_image", "shenasnameh_image", "birth_cert_image", "birth_id_image", "birth_cert"],
    personal_photo: ["عکس", "عکس_پرسنلی", "photo", "avatar", "personal_photo", "image", "portrait", "profile_pic", "pers_photo"],
    national_id: ["کد_ملی", "کدملی", "national_id", "nat_id", "id_number", "national_code", "nat_code"],
    personnel_code: ["کد_پرسنلی", "personnel_code", "emp_code", "employee_code", "staff_id", "personnel_id", "pers_code"],
    first_name: ["نام", "first_name", "firstname", "given_name", "f_name", "fname"],
    last_name: ["نام_خانوادگی", "last_name", "family", "lastname", "surname", "l_name", "lname"],
    full_name: ["نام_کامل", "full_name", "name", "complete_name", "fullname"],
    email: ["ایمیل", "email", "mail", "e-mail", "email_address", "e_mail"],
    mobile_phone: ["موبایل", "تلفن", "شماره", "mobile", "phone", "cell", "tel", "mobile_number", "phone_number"],
    position: ["سمت", "position", "role", "title", "job_title", "job_position", "job_role"],
    birth_date: ["تاریخ_تولد", "birth_date", "dob", "تولد", "birthdate", "date_of_birth", "bdate"],
    created_at: ["تاریخ_ایجاد", "created_at", "createdon", "creation_date", "create_date", "created"],
    address: ["آدرس", "address", "location", "residence", "home_address", "addr"],
    city: ["شهر", "city", "town", "province", "cty"],
    postal_code: ["کد_پستی", "postal_code", "zip_code", "post_code"],
    gender: ["جنسیت", "gender", "sex"],
    marital_status: ["وضعیت_تاهل", "marital_status", "marriage_status"],
  };

  const columnValues: Record<string, any[]> = {};
  headers.forEach((h) => (columnValues[h] = rows.map((r) => r[h])));

  const assignedFields = new Set<string>();

  const scoreField = (header: string, field: string) => {
    let sc = 0;
    const H = norm(header);
    const F = norm(field);
    if (H === F) sc += 15;
    if (H.includes(F) || F.includes(H)) sc += 6;
    const levDist = levenshtein(H, F);
    if (levDist <= 3) sc += 10 - levDist;
    for (const [dbf, keys] of Object.entries(synonyms)) {
      if (norm(dbf) === F) {
        if (keys.some((k) => H.includes(norm(k)) || levenshtein(H, norm(k)) <= 3)) sc += 12;
      }
    }
    const kind = inferKind(columnValues[header] || []);
    const kindToField: Record<string, string[]> = {
      email: ["email"],
      national_id: ["national_id"],
      phone: ["mobile_phone", "phone", "tel"],
      date: ["birth_date", "created_at", "issue_date", "effective_employee_date", "effective_marital_date", "service_start_date", "service_end_date"],
      image: ["personal_photo", "national_id_image", "birth_certificate_image", "image", "avatar"],
      code: ["personnel_code", "employee_code", "work_id_code", "postal_code"],
      name_like: ["first_name", "last_name", "full_name", "name"],
      address: ["address", "residence", "location"],
      number: ["age", "salary", "experience_years", "children_count"],
      boolean: ["is_active", "is_married", "has_children"],
      text: ["city", "position", "role", "religion", "sect", "citizenship", "nationality", "gender", "marital_status"],
    };
    if (kindToField[kind]?.some((f) => norm(f) === F)) sc += 8;
    return sc;
  };

  headers.sort((a, b) => {
    const maxA = Math.max(...dbFields.map((f) => scoreField(a, f)));
    const maxB = Math.max(...dbFields.map((f) => scoreField(b, f)));
    return maxB - maxA;
  });

  headers.forEach((h) => {
    let best: { f: string; sc: number } | null = null;
    dbFields.forEach((f) => {
      if (assignedFields.has(f)) return;
      const sc = scoreField(h, f);
      if (!best || sc > best.sc) best = { f, sc };
    });
    if (best && best.sc >= 7) {
      m[h] = best.f;
      assignedFields.add(best.f);
    } else m[h] = "";
  });
  return m;
}

export default function ImportEmployeesPage() {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const previewPerPage = 10;

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);

  const [dbCols, setDbCols] = useState<DbColumn[]>([]);
  const dbFieldNames = useMemo(() => dbCols.map((c) => c.name), [dbCols]);

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [required, setRequired] = useState<string[]>([]);
  const [log, setLog] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSchemaError(null);
        const r = await fetch("/api/employees/schema", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setDbCols(j?.columns || []);
      } catch (e: any) {
        setSchemaError(e?.message || "اسکیما از سرور دریافت نشد. از هدرهای اکسل به‌عنوان لیست فیلد استفاده می‌شود.");
        setDbCols([]);
      }
    })();
  }, []);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  }, []);

  const readXLSX = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setReadingProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" });
        const hdr = rawData[0] as string[];
        const json: Row[] = [];
        for (let i = 1; i < rawData.length; i++) {
          const row: Row = {};
          hdr.forEach((h, j) => (row[h] = rawData[i][j]));
          json.push(row);
        }
        setRows(json);
        setExcelHeaders(hdr);

        let dbFields = dbFieldNames;
        if (!dbFields.length) dbFields = hdr.map(norm);

        const auto = autoMap(hdr, json, dbFields);
        setMapping(auto);
        const req = Object.values(auto).filter(Boolean);
        setRequired(req);
      } catch (err) {
        console.error(err);
        alert("خطا در خواندن فایل اکسل");
      } finally {
        setReadingProgress(0);
      }
    };
    reader.readAsArrayBuffer(f);
  }, [dbFieldNames]);

  useEffect(() => {
    if (file) readXLSX(file);
  }, [file, readXLSX]);

  const submit = useCallback(async () => {
    if (!rows.length) return;
    if (!validateMapping()) return;
    setBusy(true);
    setLog(null);
    setFetchError(null);
    try {
      const res = await fetch("/api/import/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, required_fields: required, mapping }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setLog({ status: res.status, ...j });
    } catch (e: any) {
      setFetchError(e?.message || "خطا در ارسال به سرور");
    } finally {
      setBusy(false);
    }
  }, [rows, required, mapping]);

  function validateMapping() {
    const mappedFields = Object.values(mapping).filter(Boolean);
    const duplicates = mappedFields.filter((item, index) => mappedFields.indexOf(item) !== index);
    if (duplicates.length > 0) {
      alert(`فیلدهای تکراری در مپینگ: ${duplicates.join(", ")}`);
      return false;
    }
    return true;
  }

  const filteredDbFields = useMemo(() => {
    const fields = dbFieldNames.length ? dbFieldNames : excelHeaders.map(norm);
    return fields.filter((f) => norm(f).includes(norm(searchTerm)));
  }, [searchTerm, dbFieldNames, excelHeaders]);

  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([dbFieldNames.length ? dbFieldNames : []]);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "employee_template.xlsx");
  }, [dbFieldNames]);

  const downloadMapping = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const wsData = [["Excel Header", "DB Field"]];
    excelHeaders.forEach((h) => wsData.push([h, mapping[h] || ""]));
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Mapping");
    XLSX.writeFile(wb, "mapping.xlsx");
  }, [excelHeaders, mapping]);

  const totalPreviewPages = Math.ceil(rows.length / previewPerPage);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-gray-50 bg-gradient-to-br from-gray-900 to-indigo-900"
    >
      <motion.main
        className="flex-1 p-6 md:p-10 space-y-8 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border border-indigo-500/50 bg-gradient-to-br from-gray-800/80 to-indigo-900/80 backdrop-blur-md shadow-2xl text-gray-50">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-indigo-300">ورود اطلاعات پرسنل از اکسل</CardTitle>
            <p className="text-sm text-gray-300">
              فایل اکسل را انتخاب کن؛ مپینگ هدرها به فیلدهای دیتابیس <b className="text-indigo-300">(خودکار)</b> تنظیم می‌شود. در صورت نیاز دستی تغییر بده.
            </p>
            {schemaError && <div className="mt-2 text-amber-400 text-sm">⚠ {schemaError}</div>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={onFile}
                className="bg-gray-700/50 border-indigo-500/50 text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
              />
              <Button
                disabled={!file}
                onClick={() => file && readXLSX(file)}
                className="bg-indigo-600 text-gray-50 hover:bg-indigo-500 flex items-center gap-2 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50"
              >
                <UploadIcon className="w-4 h-4" />
                خواندن فایل
              </Button>
              {readingProgress > 0 && (
                <div className="w-full max-w-md">
                  <Progress value={readingProgress} className="h-2 bg-gray-700" indicatorClassName="bg-indigo-500" />
                </div>
              )}
              <Button
                disabled={!rows.length || busy}
                onClick={submit}
                className="bg-cyan-600 text-gray-50 hover:bg-cyan-500 flex items-center gap-2 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
              >
                {busy ? "در حال ارسال…" : "ارسال به سرور"}
              </Button>
              <Button
                onClick={downloadTemplate}
                className="bg-green-600 text-gray-50 hover:bg-green-500 flex items-center gap-2 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50"
              >
                <DownloadIcon className="w-4 h-4" />
                دانلود تمپلیت
              </Button>
              {excelHeaders.length > 0 && (
                <Button
                  onClick={downloadMapping}
                  className="bg-blue-600 text-gray-50 hover:bg-blue-500 flex items-center gap-2 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
                >
                  <DownloadIcon className="w-4 h-4" />
                  دانلود مپینگ
                </Button>
              )}
            </div>
            {fetchError && <div className="text-red-400 text-sm">⚠ {fetchError}</div>}

            {!file && (
              <motion.div
                className="text-gray-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                برای شروع، فایل اکسل «مشخصات پرسنل» را انتخاب کن. پس از خواندن، پیش‌نمایش و مپینگ خودکار نمایش داده می‌شود.
              </motion.div>
            )}

            <AnimatePresence>
              {excelHeaders.length > 0 && (
                <motion.div
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <Card className="border border-indigo-500/50 bg-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm text-indigo-300">۱) مپینگ خودکار هدرهای اکسل → فیلد دیتابیس</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-end mb-4">
                        <Input
                          placeholder="جستجو فیلد..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-48 bg-gray-700/50 border-indigo-500/50 text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="overflow-auto rounded-lg max-h-[400px] shadow-md">
                        <table className="min-w-full text-sm divide-y divide-indigo-500/30">
                          <thead className="sticky top-0 bg-indigo-900/50">
                            <tr>
                              <th className="px-4 py-3 text-right font-medium text-indigo-300">هدر اکسل</th>
                              <th className="px-4 py-3 text-right font-medium text-indigo-300">فیلد دیتابیس</th>
                              <th className="px-4 py-3 text-right font-medium text-indigo-300">نوع استنباطی</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-indigo-500/30">
                            <AnimatePresence>
                              {excelHeaders.map((h) => (
                                <motion.tr
                                  key={h}
                                  className="hover:bg-indigo-900/30 transition duration-200"
                                  variants={tableRowVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                >
                                  <td className="px-4 py-3 text-gray-50">{h}</td>
                                  <td className="px-4 py-3">
                                    <select
                                      value={mapping[h] || ""}
                                      onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                                      className="border border-indigo-500/50 rounded-md px-2 py-1 bg-gray-700/50 w-full text-gray-50 focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
                                    >
                                      <option value="">— انتخاب کن —</option>
                                      {filteredDbFields.map((n) => (
                                        <option key={n} value={n}>
                                          {n}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-cyan-400 cursor-help">
                                          {inferKind(rows.map((r) => r[h]))}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="bg-gray-800 text-gray-50 border-gray-700">
                                        نوع داده استنباطی بر اساس نمونه‌ها
                                      </TooltipContent>
                                    </Tooltip>
                                  </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-indigo-500/50 bg-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm text-indigo-300">۲) فیلدهای اجباری</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {filteredDbFields.map((n) => {
                          const on = required.includes(n);
                          return (
                            <motion.button
                              key={n}
                              onClick={() => setRequired((arr) => (on ? arr.filter((x) => x !== n) : [...arr, n]))}
                              className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-1 transition-all duration-300 hover:shadow-md ${
                                on
                                  ? "bg-cyan-500 text-gray-900 border-cyan-500 hover:shadow-cyan-500/50"
                                  : "bg-gray-700/50 border-indigo-500/50 text-gray-50 hover:bg-gray-600/50"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {on ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                              {n}
                            </motion.button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-indigo-500/50 bg-gray-800/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm text-indigo-300">
                        ۳) پیش‌نمایش {previewPerPage} ردیف (از {rows.length} ردیف)
                      </CardTitle>
                      <motion.button
                        onClick={() => setExpanded(!expanded)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        {expanded ? "کوچک کن" : "بزرگ کن"}
                        {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                      </motion.button>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className={`overflow-auto rounded-lg max-h-[300px] md:max-h-[600px] transition-max-height duration-500 ease-in-out ${
                          expanded ? "max-h-[600px]" : "max-h-[300px]"
                        }`}
                        animate={{ maxHeight: expanded ? 600 : 300 }}
                        transition={{ duration: 0.5 }}
                      >
                        <table className="min-w-full text-xs divide-y divide-indigo-500/30">
                          <thead className="sticky top-0 bg-indigo-900/50">
                            <tr>
                              {excelHeaders.map((h) => (
                                <th key={h} className="px-4 py-3 text-right font-medium text-indigo-300">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-indigo-500/30">
                            <AnimatePresence>
                              {rows
                                .slice((previewPage - 1) * previewPerPage, previewPage * previewPerPage)
                                .map((r, i) => (
                                  <motion.tr
                                    key={i}
                                    className="hover:bg-indigo-900/30 transition duration-200"
                                    variants={tableRowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                  >
                                    {excelHeaders.map((h) => (
                                      <td key={h} className="px-4 py-2 text-gray-50 truncate max-w-[200px]">
                                        {String(r[h] ?? "")}
                                      </td>
                                    ))}
                                  </motion.tr>
                                ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </motion.div>

                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (previewPage > 1) setPreviewPage(previewPage - 1);
                              }}
                              className={previewPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#" isActive>
                              {previewPage}
                            </PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (previewPage < totalPreviewPages) setPreviewPage(previewPage + 1);
                              }}
                              className={previewPage >= totalPreviewPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {log && (
                <motion.div
                  className="space-y-6 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border border-indigo-500/50 bg-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm text-indigo-300 flex items-center gap-2">
                        نتیجه: وضعیت {log.status}{" "}
                        {log.status === 200 ? (
                          <CheckIcon className="w-5 h-5 text-green-400" />
                        ) : (
                          <XIcon className="w-5 h-5 text-red-400" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {"inserted" in log && (
                        <ul className="text-sm space-y-2 list-disc pl-5 text-gray-300">
                          <li>افزوده‌شده: {log.inserted}</li>
                          <li>به‌روزشده: {log.updated}</li>
                          <li>ناموفق: {log.failed}</li>
                          <li>تعداد کل نواقص: {log.deficiencies_total}</li>
                        </ul>
                      )}
                      {Array.isArray(log.report) && log.report.length > 0 && (
                        <>
                          <h4 className="text-sm mt-4 text-indigo-300">گزارش: (۱۰ مورد اول)</h4>
                          {/* فیکس: این خط قبلاً اشتباه بود؛ حالا صحیح است */}
                          <div className="overflow-auto rounded-lg mt-2 max-h-[400px]">
                            <table className="min-w-full text-xs divide-y divide-indigo-500/30">
                              <thead className="sticky top-0 bg-indigo-900/50">
                                <tr>
                                  <th className="px-4 py-3 text-right font-medium text-indigo-300">ردیف</th>
                                  <th className="px-4 py-3 text-right font-medium text-indigo-300">کلید</th>
                                  <th className="px-4 py-3 text-right font-medium text-indigo-300">نواقص</th>
                                  <th className="px-4 py-3 text-right font-medium text-indigo-300">خطا</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-indigo-500/30">
                                <AnimatePresence>
                                  {log.report.slice(0, 10).map((r: any, i: number) => (
                                    <motion.tr
                                      key={i}
                                      className="hover:bg-indigo-900/30 transition duration-200"
                                      variants={tableRowVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                    >
                                      <td className="px-4 py-2 text-gray-50">{r.row_index ?? ""}</td>
                                      <td className="px-4 py-2 text-gray-50">{r.key ?? ""}</td>
                                      <td className="px-4 py-2 text-gray-50">
                                        {Array.isArray(r.missing_fields) ? r.missing_fields.join(", ") : ""}
                                      </td>
                                      <td className="px-4 py-2 text-red-400">{r.error ?? ""}</td>
                                    </motion.tr>
                                  ))}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
