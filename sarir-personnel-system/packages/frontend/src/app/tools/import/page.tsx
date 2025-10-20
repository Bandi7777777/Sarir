"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import * as XLSX from "xlsx";
import {
  ChevronDownIcon, ChevronUpIcon, DownloadIcon, UploadIcon, CheckIcon, XIcon, RefreshCwIcon,
  SaveIcon, FolderOpenIcon, Trash2Icon, PlusIcon, RotateCcwIcon, RotateCwIcon, PlayIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/toast";

type Row = Record<string, any>;
type DbColumn = { name: string; type: string; nullable: boolean; primary_key: boolean };
type Composite = { headers: string[]; sep: string };

const SARIR = {
  brand: "#07657E",
  accent: "#F2991F",
  dark: "#2E3234",
  brandSoft: "rgba(7,101,126,0.25)",
  accentSoft: "rgba(242,153,31,0.25)",
};

const norm = (s: string) => s.trim().toLowerCase().replace(/[‌\u200c]/g, "").replace(/\s+/g, "_");

function levenshtein(a: string, b: string): number {
  a = norm(a); b = norm(b);
  const m = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1, m[i-1][j-1] + cost);
    }
  return m[a.length][b.length];
}

function inferKind(values: any[]) {
  const sample = values.slice(0, 200).map((v) => String(v ?? "").trim());
  const notEmpty = sample.filter((v) => v !== "");
  const r = (n: number) => (sample.length ? n / sample.length : 0);
  const emailC = notEmpty.filter((v) => /.+@.+\..+/.test(v)).length;      if (r(emailC) > 0.6) return "email";
  const natIdC = notEmpty.filter((v) => /^\d{10}$/.test(v)).length;        if (r(natIdC) > 0.6) return "national_id";
  const phoneC = notEmpty.filter((v) => /^(\+?\d{8,15}|0\d{9,11})$/.test(v)).length; if (r(phoneC) > 0.6) return "phone";
  const dateC = notEmpty.filter((v) => { const d = new Date(v); return !isNaN(d as any) || /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(v); }).length;
  if (r(dateC) > 0.6) return "date";
  const imageC = notEmpty.filter((v) => /\.(jpg|jpeg|png|gif|webp)$/i.test(v) || /^https?:\/\//i.test(v)).length;
  if (r(imageC) > 0.5) return "image";
  const codeC = notEmpty.filter((v) => /^[A-Za-z0-9\-_\/]+$/.test(v) && v.length <= 20).length;
  if (r(codeC) > 0.6) return "code";
  const firstNameC = notEmpty.filter((v) => /^[\p{L}\s'-]{2,24}$/u.test(v) && !v.includes("@") && !/\d/.test(v)).length;
  if (r(firstNameC) > 0.5) return "name_like";
  const addressC = notEmpty.filter((v) => v.length > 20 && /[\p{L}\d\s\-\/]+/u.test(v) && !/@|\d{10}/.test(v)).length;
  if (r(addressC) > 0.5) return "address";
  const numberC = notEmpty.filter((v) => !isNaN(parseFloat(v)) && isFinite(Number(v))).length;
  if (r(numberC) > 0.7) return "number";
  const boolC = notEmpty.filter((v) => /^(true|false|yes|no|1|0)$/i.test(v)).length;
  if (r(boolC) > 0.8) return "boolean";
  return "text";
}

/* ---------- Scorer (Auto-map + Confidence) ---------- */
function buildScorer(headers: string[], rows: Row[], dbFields: string[]) {
  const synonyms: Record<string, string[]> = {
    national_id_image: ["تصویر_کارت_ملی","کارت_ملی","national_id_image","national_card_image","id_card_image","تصویر_کارت","id_image","nat_id_img"],
    birth_certificate_image: ["شناسنامه","تصویر_شناسنامه","birth_certificate_image","shenasnameh_image","birth_cert_image","birth_id_image","birth_cert"],
    personal_photo: ["عکس","عکس_پرسنلی","photo","avatar","personal_photo","image","portrait","profile_pic","pers_photo"],
    national_id: ["کد_ملی","کدملی","national_id","nat_id","id_number","national_code","nat_code"],
    personnel_code: ["کد_پرسنلی","personnel_code","emp_code","employee_code","staff_id","personnel_id","pers_code"],
    first_name: ["نام","first_name","firstname","given_name","f_name","fname"],
    last_name: ["نام_خانوادگی","last_name","family","lastname","surname","l_name","lname"],
    full_name: ["نام_کامل","full_name","name","complete_name","fullname"],
    email: ["ایمیل","email","mail","e-mail","email_address","e_mail"],
    mobile_phone: ["موبایل","تلفن","شماره","mobile","phone","cell","tel","mobile_number","phone_number"],
    position: ["سمت","position","role","title","job_title","job_position","job_role"],
    birth_date: ["تاریخ_تولد","birth_date","dob","تولد","birthdate","date_of_birth","bdate"],
    created_at: ["تاریخ_ایجاد","created_at","createdon","creation_date","create_date","created"],
    address: ["آدرس","address","location","residence","home_address","addr"],
    city: ["شهر","city","town","province","cty"],
    postal_code: ["کد_پستی","postal_code","zip_code","post_code"],
    gender: ["جنسیت","gender","sex"],
    marital_status: ["وضعیت_تاهل","marital_status","marriage_status"],
  };

  const columnValues: Record<string, any[]> = {};
  headers.forEach((h) => (columnValues[h] = rows.map((r) => r[h])));

  const kindToField: Record<string, string[]> = {
    email: ["email"],
    national_id: ["national_id"],
    phone: ["mobile_phone","phone","tel"],
    date: ["birth_date","created_at","issue_date","effective_employee_date","effective_marital_date","service_start_date","service_end_date"],
    image: ["personal_photo","national_id_image","birth_certificate_image","image","avatar"],
    code: ["personnel_code","employee_code","work_id_code","postal_code"],
    name_like: ["first_name","last_name","full_name","name"],
    address: ["address","residence","location"],
    number: ["age","salary","experience_years","children_count"],
    boolean: ["is_active","is_married","has_children"],
    text: ["city","position","role","religion","sect","citizenship","nationality","gender","marital_status"],
  };

  function scoreField(header: string, field: string) {
    let sc = 0;
    const H = norm(header), F = norm(field);
    if (H === F) sc += 15;
    if (H.includes(F) || F.includes(H)) sc += 6;
    const lev = levenshtein(H, F);
    if (lev <= 3) sc += 10 - lev;

    for (const [dbf, keys] of Object.entries(synonyms)) {
      if (norm(dbf) === F) {
        if (keys.some((k) => H.includes(norm(k)) || levenshtein(H, norm(k)) <= 3)) sc += 12;
      }
    }
    const kind = inferKind(columnValues[header] || []);
    if (kindToField[kind]?.some((f) => norm(f) === F)) sc += 8;
    return sc; // approx 0..40
  }

  function autoMap() {
    const m: Record<string,string> = {};
    const assigned = new Set<string>();
    headers.forEach((h) => {
      let best: { f: string; sc: number } | null = null;
      dbFields.forEach((f) => {
        if (assigned.has(f)) return;
        const sc = scoreField(h, f);
        if (!best || sc > best.sc) best = { f, sc };
      });
      if (best && best.sc >= 7) { m[h] = best.f; assigned.add(best.f); }
      else m[h] = "";
    });
    return m;
  }

  function confidence(header: string, field?: string) {
    if (!field) return 0;
    const sc = scoreField(header, field);
    return Math.max(0, Math.min(100, Math.round((sc / 40) * 100)));
  }

  return { autoMap, confidence };
}

/* ---------- LocalStorage Keys ---------- */
const LS = {
  MAPPING: "sarir_import_mapping",
  REQUIRED: "sarir_import_required",
  HEADERS: "sarir_import_last_headers",
  PROFILES: "sarir_import_profiles",
  RESUME: "sarir_import_resume",
};

const saveMappingLS = (mapping: Record<string,string>, required: string[], headers: string[]) => {
  localStorage.setItem(LS.MAPPING, JSON.stringify(mapping));
  localStorage.setItem(LS.REQUIRED, JSON.stringify(required));
  localStorage.setItem(LS.HEADERS, JSON.stringify(headers));
};
const loadMappingLS = () => {
  try {
    const m = JSON.parse(localStorage.getItem(LS.MAPPING) || "{}");
    const r = JSON.parse(localStorage.getItem(LS.REQUIRED) || "[]");
    const h = JSON.parse(localStorage.getItem(LS.HEADERS) || "[]");
    return { mapping: m as Record<string,string>, required: r as string[], headers: h as string[] };
  } catch { return { mapping:{}, required:[], headers:[] }; }
};
const readProfiles = (): Record<string, { mapping:Record<string,string>; required:string[]; headers:string[] }> => {
  try { return JSON.parse(localStorage.getItem(LS.PROFILES) || "{}"); } catch { return {}; }
};
const writeProfiles = (p: Record<string, { mapping:Record<string,string>; required:string[]; headers:string[] }>) =>
  localStorage.setItem(LS.PROFILES, JSON.stringify(p));

export default function ImportEmployeesPage() {
  const { toast } = useToast();

  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [phase, setPhase] = useState<"idle"|"reading"|"parsing"|"uploading"|"done">("idle");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const previewPerPage = 10;

  const [file, setFile] = useState<File|null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [asDragMap, setAsDragMap] = useState(true);
  const [dryRun, setDryRun] = useState(true);
  const [chunked, setChunked] = useState(true);
  const [chunkSize] = useState(500);
  const [resumeKey, setResumeKey] = useState<string>("");

  const [dbCols, setDbCols] = useState<DbColumn[]>([]);
  const dbFieldNames = useMemo(() => dbCols.map((c) => c.name), [dbCols]);

  const [mapping, setMapping] = useState<Record<string,string>>({});
  const [required, setRequired] = useState<string[]>([]);
  const [log, setLog] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [schemaError, setSchemaError] = useState<string|null>(null);
  const [fetchError, setFetchError] = useState<string|null>(null);

  const [composites, setComposites] = useState<Record<string, Composite>>({});
  const [bulkSelected, setBulkSelected] = useState<Record<string, boolean>>({});
  const [bulkTarget, setBulkTarget] = useState<string>("");
  const [bulkSep, setBulkSep] = useState<string>(" - ");

  const [profiles, setProfiles] = useState(readProfiles());
  const [selectedProfile, setSelectedProfile] = useState<string>("");

  type Hist = { mapping: Record<string,string>; required: string[] };
  const [history, setHistory] = useState<Hist[]>([]);
  const [future, setFuture] = useState<Hist[]>([]);

  const [draggingHeader, setDraggingHeader] = useState<string|null>(null);
  const [hoverField, setHoverField] = useState<string|null>(null);

  const dropRef = useRef<HTMLDivElement|null>(null);
  const searchRef = useRef<HTMLInputElement|null>(null);

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

  useEffect(() => {
    const el = dropRef.current; if (!el) return;
    const onOver = (e: DragEvent) => { e.preventDefault(); el.classList.add("ring-2"); };
    const onLeave = (e: DragEvent) => { e.preventDefault(); el.classList.remove("ring-2"); };
    const onDrop = (e: DragEvent) => {
      e.preventDefault(); el.classList.remove("ring-2");
      const f = e.dataTransfer?.files?.[0]; if (f) setFile(f);
    };
    el.addEventListener("dragover", onOver);
    el.addEventListener("dragleave", onLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onOver);
      el.removeEventListener("dragleave", onLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveMappingLS(mapping, required, excelHeaders); toast({ title:"Saved", description:"مپینگ ذخیره شد." }); }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(); }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapping, required, excelHeaders, rows]);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  }, []);

  const readWithWorker = useCallback((f: File) => {
    setPhase("reading"); setPhaseProgress(0);
    const worker = new Worker(new URL("./xlsx.worker.ts", import.meta.url));
    const key = `${f.name}:${f.size}`;
    setResumeKey(key);

    worker.onmessage = (ev: MessageEvent) => {
      const msg = ev.data || {};
      if (msg.type === "progress") {
        setPhase(msg.phase || "parsing");
        setPhaseProgress(msg.progress ?? 0);
      } else if (msg.type === "parsed") {
        const { headers, rows } = msg.payload as { headers: string[]; rows: Row[] };
        setRows(rows); setExcelHeaders(headers);

        let dbFields = dbFieldNames; if (!dbFields.length) dbFields = headers.map(norm);
        const scorer = buildScorer(headers, rows, dbFields);
        const auto = scorer.autoMap();
        setMapping(auto);
        setRequired(Object.values(auto).filter(Boolean));

        setPhase("idle"); setPhaseProgress(0);
        toast({ title:"Parsed", description:`${rows.length} ردیف خوانده شد.` });
      } else if (msg.type === "error") {
        setPhase("idle"); setPhaseProgress(0);
        alert("خطا در خواندن فایل: " + (msg.error || ""));
      }
    };

    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "csv" || ext === "tsv") {
      const reader = new FileReader();
      reader.onload = () => worker.postMessage({ type:"parse-text", payload: { text: reader.result as string, isTSV: ext==="tsv" } });
      reader.readAsText(f);
    } else {
      const reader = new FileReader();
      reader.onprogress = (e) => { if (e.lengthComputable) setPhaseProgress(Math.round((e.loaded/e.total)*40)); };
      reader.onload = () => { setPhase("parsing"); worker.postMessage({ type:"parse-arraybuffer", payload: reader.result }, [reader.result as ArrayBuffer]); };
      reader.readAsArrayBuffer(f);
    }
  }, [dbFieldNames]);

  useEffect(() => { if (file) readWithWorker(file); }, [file, readWithWorker]);

  const filteredDbFields = useMemo(() => {
    const fields = dbFieldNames.length ? dbFieldNames : excelHeaders.map(norm);
    return fields.filter((f) => norm(f).includes(norm(searchTerm)));
  }, [searchTerm, dbFieldNames, excelHeaders]);
// یکتا و بدون مقدار خالی
const uniqueDbFields = useMemo(
  () =>
    Array.from(
      new Set(
        filteredDbFields
          .map((f) => (f ?? "").trim())
          .filter((f) => f.length > 0)
      )
    ),
  [filteredDbFields]
);
  const scorer = useMemo(() => {
    let dbFields = dbFieldNames.length ? dbFieldNames : excelHeaders.map(norm);
    return buildScorer(excelHeaders, rows, dbFields);
  }, [excelHeaders, rows, dbFieldNames]);

  const mappedTargets = useMemo(() => new Set(Object.values(mapping).filter(Boolean)), [mapping]);
  const compositeTargets = useMemo(() => new Set(Object.keys(composites)), [composites]);
  const missingRequired = useMemo(
    () => required.filter((f) => !mappedTargets.has(f) && !compositeTargets.has(f)),
    [required, mappedTargets, compositeTargets]
  );

  function pushHistory(next?: Partial<Hist>) {
    setHistory((h) => [...h, { mapping: { ...mapping, ...(next?.mapping||{}) }, required: next?.required || [...required] }]);
    setFuture([]);
  }
  function undo() {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length-1];
      setFuture((f) => [{ mapping:{...mapping}, required:[...required] }, ...f]);
      setMapping(last.mapping); setRequired(last.required);
      return h.slice(0, -1);
    });
  }
  function redo() {
    setFuture((f) => {
      if (!f.length) return f;
      const first = f[0];
      setHistory((h)=> [...h, { mapping:{...mapping}, required:[...required] }]);
      setMapping(first.mapping); setRequired(first.required);
      return f.slice(1);
    });
  }

  const formatCell = (header: string, value: any) => {
    const k = inferKind(rows.map((r) => r[header]));
    const raw = String(value ?? "").trim();
    if (k === "date") {
      const d = new Date(raw);
      if (!isNaN(d as any)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth()+1).padStart(2,"0");
        const dd = String(d.getDate()).padStart(2,"0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    if (k === "number" && raw !== "" && !isNaN(Number(raw))) {
      try { return new Intl.NumberFormat(undefined,{ maximumFractionDigits:4 }).format(Number(raw)); }
      catch { return raw; }
    }
    return raw;
  };

  const buildRowsForSubmit = () => {
    const result = rows.map((r) => ({ ...r }));
    for (const [target, { headers, sep }] of Object.entries(composites)) {
      for (const row of result) {
        const joined = headers.map((h) => String(row[h] ?? "").trim()).filter(Boolean).join(sep);
        if (joined && !mappedTargets.has(target)) (row as any)[target] = joined;
      }
    }
    return result;
  };

  const overallProgress = useMemo(() => {
    switch (phase) {
      case "reading":   return Math.min(40, phaseProgress);
      case "parsing":   return 40 + Math.round((phaseProgress/100)*30);
      case "uploading": return 70 + Math.round((phaseProgress/100)*30);
      case "done":      return 100;
      default:          return 0;
    }
  }, [phase, phaseProgress]);

  function validateMapping() {
    if (missingRequired.length > 0) {
      toast({ title:"نیاز به مپینگ", description:`فیلدهای اجباری: ${missingRequired.join("، ")}`, variant:"warning" });
      return false;
    }
    const mapped = Object.values(mapping).filter(Boolean);
    const duplicates = mapped.filter((v,i) => mapped.indexOf(v) !== i);
    if (duplicates.length) {
      toast({ title:"تداخل مپینگ", description:`فیلدهای تکراری: ${duplicates.join(", ")}`, variant:"destructive" });
      return false;
    }
    return true;
  }

  const CHUNK_RESUME = {
    get: (key: string) => {
      try { return JSON.parse(localStorage.getItem(LS.RESUME)||"{}")[key] as {chunk:number,total:number}; } catch { return null; }
    },
    set: (key: string, data: any) => {
      const all = JSON.parse(localStorage.getItem(LS.RESUME)||"{}"); all[key] = data;
      localStorage.setItem(LS.RESUME, JSON.stringify(all));
    },
    clear: (key: string) => {
      const all = JSON.parse(localStorage.getItem(LS.RESUME)||"{}"); delete all[key];
      localStorage.setItem(LS.RESUME, JSON.stringify(all));
    }
  };

  const submit = useCallback(async () => {
    if (!rows.length) return;
    if (!validateMapping()) return;

    const rowsToSend = buildRowsForSubmit();
    const totalChunks = chunked ? Math.max(1, Math.ceil(rowsToSend.length / chunkSize)) : 1;

    setBusy(true); setLog(null); setFetchError(null);
    setPhase("uploading"); setPhaseProgress(0);

    let startChunk = 0;
    const key = resumeKey;
    if (chunked && key) {
      const rs = CHUNK_RESUME.get(key);
      if (rs && rs.total === totalChunks) startChunk = rs.chunk;
    }

    try {
      for (let c = startChunk; c < totalChunks; c++) {
        const chunkRows = chunked ? rowsToSend.slice(c*chunkSize, (c+1)*chunkSize) : rowsToSend;

        const res = await fetch("/api/import/employees", {
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({
            rows: chunkRows,
            required_fields: required,
            mapping,
            dry_run: !!dryRun,
            chunk_index: c,
            chunk_total: totalChunks,
          }),
        });

        const pct = Math.round(((c+1)/totalChunks)*100);
        setPhaseProgress(pct);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        setLog((prev:any) => (!prev ? { status:200, reports:[j] } : { status:200, reports:[...(prev.reports||[]), j] }));

        if (chunked && key) CHUNK_RESUME.set(key, { chunk: c+1, total: totalChunks });
      }

      setPhase("done");
      toast({ title: dryRun ? "Dry-Run OK" : "Import OK", description: chunked? "همهٔ چانک‌ها ارسال شد." : "ارسال کامل انجام شد." });
      if (resumeKey) CHUNK_RESUME.clear(resumeKey);
    } catch (e:any) {
      setFetchError(e?.message || "خطا در ارسال");
      toast({ title:"خطا در ارسال", description:String(e?.message||""), variant:"destructive" });
    } finally {
      setBusy(false);
      setTimeout(()=> setPhase("idle"), 700);
    }
  }, [rows, required, mapping, composites, mappedTargets, dryRun, chunked, chunkSize, resumeKey]);

  const exportReportCSV = () => {
    const reports = log?.reports || (Array.isArray(log?.report) ? [{ report: log.report }] : []);
    if (!reports.length) return;
    const headers = ["chunk","row_index","key","missing_fields","error"];
    const lines = [headers.join(",")];
    reports.forEach((blk:any, idx:number) => {
      (blk.report||[]).forEach((r:any) => {
        const row = [
          idx,
          r.row_index ?? "",
          (r.key ?? "").toString().replace(/,/g," "),
          Array.isArray(r.missing_fields)? r.missing_fields.join("|").replace(/,/g," ") : "",
          (r.error ?? "").toString().replace(/,/g," "),
        ];
        lines.push(row.map((v)=> `"${String(v).replace(/"/g,'""')}"`).join(","));
      });
    });
    const blob = new Blob([lines.join("\n")], { type:"text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="import_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const saveProfile = () => {
    const name = prompt("نام پروفایل مپینگ:", "HR-Basic")?.trim(); if (!name) return;
    const all = readProfiles(); all[name] = { mapping, required, headers: excelHeaders };
    writeProfiles(all); setProfiles(all); setSelectedProfile(name);
    toast({ title:"Saved", description:`پروفایل «${name}» ذخیره شد.` });
  };
  const loadProfile = (name: string) => {
    const p = readProfiles()[name]; if (!p) return;
    if (p.headers?.length && excelHeaders.join("|") !== p.headers.join("|"))
      toast({ title:"هشدار", description:"هدرهای پروفایل با فایل فعلی متفاوت است.", variant:"warning" });
    pushHistory(); setMapping(p.mapping || {}); setRequired(p.required || []);
    toast({ title:"Loaded", description:`پروفایل «${name}» اعمال شد.` });
  };
  const deleteProfile = (name: string) => {
    const all = readProfiles(); delete all[name]; writeProfiles(all);
    setProfiles(all); if (selectedProfile===name) setSelectedProfile("");
    toast({ title:"Deleted", description:`پروفایل «${name}» حذف شد.` });
  };

  const containerVariants = { hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0, transition:{ duration:0.5, staggerChildren:0.1 } } };
  const tableRowVariants = { hidden:{ opacity:0, scale:0.95 }, visible:{ opacity:1, scale:1, transition:{ duration:0.2 } } };

  const KindBadge = ({ k }: { k: string }) => {
    const palette: Record<string,string> = {
      email:"bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      national_id:"bg-teal-500/20 text-teal-300 border-teal-500/40",
      phone:"bg-sky-500/20 text-sky-300 border-sky-500/40",
      date:"bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      image:"bg-amber-500/20 text-amber-300 border-amber-500/40",
      code:"bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
      name_like:"bg-pink-500/20 text-pink-300 border-pink-500/40",
      address:"bg-orange-500/20 text-orange-300 border-orange-500/40",
      number:"bg-lime-500/20 text-lime-300 border-lime-500/40",
      boolean:"bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      text:"bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${palette[k] || palette.text}`}>{k}</span>;
  };

  const onHeaderDragStart = (h: string) => setDraggingHeader(h);
  const onFieldDragEnter = (f: string) => setHoverField(f);
  const onFieldDragLeave = () => setHoverField(null);
  const onFieldDrop = (f: string) => {
    if (!draggingHeader) return;
    pushHistory();
    setMapping((m) => ({ ...m, [draggingHeader!]: f }));
    setDraggingHeader(null); setHoverField(null);
  };

  return (
    <div dir="rtl" className="min-h-screen text-gray-50" style={{
      background:
        `radial-gradient(1200px 800px at 10% -10%, ${SARIR.brandSoft}, transparent 60%),` +
        `radial-gradient(1000px 700px at 110% 10%, ${SARIR.accentSoft}, transparent 55%),` +
        `linear-gradient(135deg, #0b1220 0%, ${SARIR.dark} 100%)`,
    }}>
      <motion.main className="flex-1 p-6 md:p-10 space-y-8 max-w-7xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
        <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-black" style={{ color: SARIR.accent }}>
                  ورود اطلاعات پرسنل از اکسل
                </CardTitle>
                <p className="text-sm text-gray-300 mt-1">
                  مپینگ خودکار + Drag & Drop + Dry-Run + Resume. <b style={{ color: SARIR.brand }}>SARIR</b>
                </p>
                {schemaError && <div className="mt-2 text-amber-400 text-sm">⚠ {schemaError}</div>}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={()=>{ saveMappingLS(mapping, required, excelHeaders); toast({ title:"Saved", description:"مپینگ ذخیره شد." }); }} className="bg-[var(--sarir-brand,#07657E)] hover:brightness-110" title="Ctrl+S">
                  <SaveIcon className="w-4 h-4" /> ذخیره مپینگ
                </Button>
                <Button onClick={()=>{
                    const { mapping:m, required:r, headers:h } = loadMappingLS();
                    if (h.length && excelHeaders.join("|") !== h.join("|")) toast({ title:"هشدار", description:"هدرهای ذخیره‌شده با فایل فعلی متفاوت است.", variant:"warning" });
                    pushHistory(); setMapping(m); setRequired(r);
                  }} className="bg-[#1f6e84] hover:brightness-110">
                  <FolderOpenIcon className="w-4 h-4" /> بارگذاری مپینگ
                </Button>
                <Button onClick={()=>{ pushHistory({ mapping:{}, required:[] }); setMapping({}); setRequired([]); toast({ title:"پاک‌سازی", description:"مپینگ و اجباری‌ها خالی شد." }); }} className="bg-[#3B3F41] hover:brightness-110">
                  <Trash2Icon className="w-4 h-4" /> پاک‌سازی
                </Button>

                <select value={selectedProfile} onChange={(e)=> setSelectedProfile(e.target.value)} className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm">
                  <option value="">— پروفایل‌ها —</option>
                  {Object.keys(profiles).map((name)=> <option key={name} value={name}>{name}</option>)}
                </select>
                <Button onClick={()=> selectedProfile && loadProfile(selectedProfile)} className="bg-slate-700 hover:brightness-110">بارگذاری پروفایل</Button>
                <Button onClick={saveProfile} className="bg-emerald-700 hover:brightness-110">ذخیره به‌عنوان پروفایل</Button>
                <Button onClick={()=> selectedProfile && deleteProfile(selectedProfile)} className="bg-rose-700 hover:brightness-110">حذف پروفایل</Button>

                <Button onClick={undo} className="bg-slate-600 hover:brightness-110" title="Ctrl+Z"><RotateCcwIcon className="w-4 h-4"/></Button>
                <Button onClick={redo} className="bg-slate-600 hover:brightness-110" title="Ctrl+Y"><RotateCwIcon className="w-4 h-4"/></Button>

                <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={asDragMap} onChange={(e)=> setAsDragMap(e.target.checked)} /> مپینگ Drag & Drop</label>
                <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={dryRun} onChange={(e)=> setDryRun(e.target.checked)} /> Dry-Run</label>
                <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={chunked} onChange={(e)=> setChunked(e.target.checked)} /> Chunked (۵۰۰)</label>

                <Button onClick={()=> document.getElementById("excel-file-input")?.click()} className="bg-[color:var(--sarir-accent,#F2991F)] text-gray-900 hover:brightness-110">
                  <UploadIcon className="w-4 h-4" /> انتخاب فایل
                </Button>
              </div>
            </div>

            {phase !== "idle" && (
              <div className="mt-4">
                <div className="text-xs text-gray-300 mb-1">
                  {phase==="reading" && "در حال خواندن فایل…"}
                  {phase==="parsing" && "در حال پردازش و ساخت پیش‌نمایش…"}
                  {phase==="uploading" && "در حال ارسال به سرور…"}
                  {phase==="done" && "انجام شد."}
                </div>
                <Progress value={overallProgress} className="h-2 bg-white/10" indicatorClassName="bg-[color:var(--sarir-accent,#F2991F)]"/>
              </div>
            )}

            {missingRequired.length > 0 && (
              <div className="mt-3 text-xs px-3 py-2 rounded border" style={{ color:SARIR.accent, borderColor:SARIR.accent }}>
                فیلدهای اجباری مپ‌نشده: {missingRequired.join("، ")}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div ref={dropRef} className="rounded-xl border border-dashed border-white/15 p-6 md:p-8 bg-white/5 hover:bg-white/10 transition-all" style={{ boxShadow:`inset 0 0 0 1px ${SARIR.brandSoft}` }}>
              <div className="flex items-center gap-4 flex-wrap">
                <Input id="excel-file-input" type="file" accept=".xlsx,.xls,.csv,.tsv"
                  onChange={onFile}
                  className="bg-white/10 border-white/15 text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-[color:var(--sarir-accent,#F2991F)]"/>
                <Button disabled={!file} onClick={()=> file && readWithWorker(file)} className="bg-[var(--sarir-brand,#07657E)] hover:brightness-110 flex items-center gap-2">
                  <UploadIcon className="w-4 h-4"/> خواندن فایل
                </Button>
                {resumeKey && chunked && (
                  <Button onClick={()=> { submit(); }} className="bg-amber-600 hover:brightness-110 flex items-center gap-2">
                    <PlayIcon className="w-4 h-4"/> ادامه از آخرین چانک
                  </Button>
                )}
              </div>
              {!file && (
                <motion.div className="text-gray-300 text-sm mt-4" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  می‌تونی فایل اکسل/CSV/TSV را اینجا <b>بکِشی و رها کنی</b> یا از «انتخاب فایل» استفاده کنی.
                </motion.div>
              )}
            </div>

            {fetchError && <div className="text-red-400 text-sm">⚠ {fetchError}</div>}

            <AnimatePresence>
              {excelHeaders.length > 0 && (
                <motion.div className="space-y-6" initial="hidden" animate="visible" exit="hidden" variants={containerVariants}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full border border-white/15 bg-white/5">ستون‌ها: <b>{excelHeaders.length}</b></span>
                    <span className="text-xs px-3 py-1 rounded-full border border-white/15 bg-white/5">ردیف‌ها: <b>{rows.length}</b></span>
                    <span className="text-xs px-3 py-1 rounded-full border border-white/15" style={{ background:SARIR.brandSoft }}>
                      فیلدهای اجباری: <b>{required.length}</b>
                    </span>
                  </div>

                  <Card className="border border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="text-sm" style={{ color:SARIR.accent }}>
                        ۱) مپینگ هدرهای اکسل → فیلد دیتابیس {asDragMap ? "(Drag & Drop)" : "(Select)"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                        <Input ref={searchRef as any} placeholder="جستجو فیلد... ( / برای فوکوس )"
                          value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}
                          className="w-56 bg-white/10 border-white/15 text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-[color:var(--sarir-accent,#F2991F)]"/>
                        <div className="flex items-center gap-2 flex-wrap">
                          <select value={bulkTarget} onChange={(e)=> setBulkTarget(e.target.value)}
                            className="bg-white/10 border border-white/15 rounded px-2 py-1 text-sm"><option value="">— فیلد مقصد —</option>
                            {filteredDbFields.map((n)=> <option key={n} value={n}>{n}</option>)}
                          </select>
                          <Input placeholder="جداکننده (مثلاً « - »)" value={bulkSep} onChange={(e)=> setBulkSep(e.target.value)}
                            className="w-32 bg-white/10 border-white/15 text-gray-50 placeholder-gray-400"/>
                          <Button onClick={()=>{
                              const headers = Object.entries(bulkSelected).filter(([,on])=>on).map(([h])=>h);
                              if (!bulkTarget || headers.length < 2) { alert("حداقل دو هدر و یک فیلد مقصد انتخاب کن."); return; }
                              setComposites((c)=> ({ ...c, [bulkTarget]: { headers, sep: bulkSep || " " } }));
                              setBulkSelected({});
                            }} className="bg-sky-700 hover:brightness-110 flex items-center gap-1">
                            <PlusIcon className="w-4 h-4"/> ساخت فیلد ترکیبی
                          </Button>
                        </div>
                      </div>

                      {Object.keys(composites).length > 0 && (
                        <div className="mb-4 text-xs space-y-2">
                          {Object.entries(composites).map(([t,{headers,sep}])=> (
                            <div key={t} className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-white/10 border border-white/15">{t} = {headers.join(` ${sep} `)}</span>
                              <Button onClick={()=> setComposites((c)=> { const cp={...c}; delete cp[t]; return cp; })}
                                className="bg-rose-700 hover:brightness-110">حذف</Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {asDragMap ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs mb-2">هدرهای اکسل</h4>
                            <div className="rounded-lg border border-white/15 bg-white/5 p-2 max-h-[420px] overflow-auto">
                              {excelHeaders.map((h)=> {
                                const target = mapping[h] || "";
                                const conf = scorer.confidence(h, target);
                                const confColor = conf >= 70 ? "text-emerald-300" : conf >= 40 ? "text-amber-300" : "text-rose-300";
                                return (
                                  <div key={h} draggable onDragStart={()=> setDraggingHeader(h)}
                                    className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-grab">
                                    <span className="truncate">{h}</span>
                                    <span className={`text-[10px] ${confColor}`}>{target? `${target} • ${conf}%` : "—"}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs mb-2">فیلدهای دیتابیس (بکش و رها کن)</h4>
                            <div className="rounded-lg border border-white/15 bg-white/5 p-2 max-h-[420px] overflow-auto">
                              {filteredDbFields.map((f)=> {
                                const isHover = hoverField === f;
                                return (
                                  <div key={f}
                                    onDragEnter={()=> setHoverField(f)}
                                    onDragOver={(e)=> e.preventDefault()}
                                    onDragLeave={()=> setHoverField(null)}
                                    onDrop={()=> onFieldDrop(f)}
                                    className={`px-2 py-1 rounded mb-1 border ${isHover? "border-[color:var(--sarir-accent,#F2991F)] bg-white/10" : "border-white/10"}`}>
                                    <div className="flex items-center justify-between gap-2">
                                      <span>{f}</span>
                                      {required.includes(f) && <span className="text-[10px] text-amber-300">required</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-auto rounded-lg max-h-[420px] shadow-md">
                          <table className="min-w-full text-sm divide-y divide-white/10">
                            <thead className="sticky top-0" style={{ background:SARIR.dark }}>
                              <tr>
                                <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>هدر اکسل</th>
                                <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>فیلد دیتابیس</th>
                                <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>نوع</th>
                                <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>انتخاب برای ترکیب</th>
                                <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>اعتماد</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              <AnimatePresence>
                                {excelHeaders.map((h) => {
                                  const target = mapping[h] || "";
                                  const highlight = target && missingRequired.includes(target);
                                  const conf = scorer.confidence(h, target);
                                  return (
                                    <motion.tr key={h} className={`transition duration-200 ${highlight? "bg-rose-900/20":"hover:bg-white/5"}`}
                                      variants={tableRowVariants} initial="hidden" animate="visible" exit="hidden">
                                      <td className="px-4 py-3 text-gray-50">{h}</td>
                                      <td className="px-4 py-3">
                                        <select value={mapping[h] || ""} onChange={(e)=>{ pushHistory(); setMapping((m)=> ({ ...m, [h]: e.target.value })); }}
                                          className="border rounded-md px-2 py-1 bg-white/10 w-full text-gray-50 focus:ring-2 focus:ring-[color:var(--sarir-accent,#F2991F)] border-white/15">
                                          <option value="">— انتخاب کن —</option>
                                          {filteredDbFields.map((n)=> <option key={n} value={n}>{n}</option>)}
                                        </select>
                                      </td>
                                      <td className="px-4 py-3">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="cursor-help"><KindBadge k={inferKind(rows.map((r)=> r[h]))}/></span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="bg-gray-900 text-gray-50 border-gray-800">نوع داده استنباطی</TooltipContent>
                                        </Tooltip>
                                      </td>
                                      <td className="px-4 py-3">
                                        <label className="inline-flex items-center gap-2 text-xs">
                                          <input type="checkbox" checked={!!bulkSelected[h]} onChange={(e)=> setBulkSelected((s)=> ({ ...s, [h]: e.target.checked }))}/>
                                          افزودن برای ترکیب
                                        </label>
                                      </td>
                                      <td className="px-4 py-3 text-xs">
                                        <span className={conf>=70? "text-emerald-300" : conf>=40? "text-amber-300":"text-rose-300"}>{conf}%</span>
                                      </td>
                                    </motion.tr>
                                  );
                                })}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="text-sm" style={{ color:SARIR.accent }}>۲) فیلدهای اجباری</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {filteredDbFields.map((n)=> {
                          const on = required.includes(n);
                          return (
                            <motion.button key={n} onClick={()=>{ pushHistory(); setRequired((arr)=> on? arr.filter((x)=> x!==n): [...arr,n]); }}
                              className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-1 transition-all duration-300 hover:shadow-md ${
                                on? "bg-[color:var(--sarir-accent,#F2991F)] text-gray-900 border-transparent" : "bg-white/10 border-white/15 text-gray-50 hover:bg-white/15"
                              }`} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
                              {on ? <CheckIcon className="w-4 h-4"/> : <XIcon className="w-4 h-4"/>}{n}
                            </motion.button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm" style={{ color:SARIR.accent }}>۳) پیش‌نمایش {previewPerPage} ردیف (از {rows.length} ردیف)</CardTitle>
                      <motion.button onClick={()=> setExpanded(!expanded)} className="text-[color:var(--sarir-accent,#F2991F)] hover:brightness-110 flex items-center gap-1 transition-colors duration-300" whileHover={{ scale:1.05 }}>
                        {expanded ? "کوچک کن" : "بزرگ کن"} {expanded ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}
                      </motion.button>
                    </CardHeader>
                    <CardContent>
                      <motion.div className={`overflow-auto rounded-lg max-h-[300px] md:max-h-[600px] transition-max-height duration-500 ease-in-out ${expanded? "max-h-[600px]" : "max-h-[300px]"}`}
                        animate={{ maxHeight: expanded? 600: 300 }} transition={{ duration:0.5 }}>
                        <table className="min-w-full text-xs divide-y divide-white/10">
                          <thead className="sticky top-0" style={{ background:SARIR.dark }}>
                            <tr>{excelHeaders.map((h)=> <th key={h} className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>{h}</th>)}</tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            <AnimatePresence>
                              {rows.slice((previewPage-1)*previewPerPage, previewPage*previewPerPage).map((r,i)=> (
                                <motion.tr key={i} className="hover:bg-white/5 transition duration-200" variants={tableRowVariants} initial="hidden" animate="visible" exit="hidden">
                                  {excelHeaders.map((h)=> <td key={h} className="px-4 py-2 text-gray-50 truncate max-w-[240px]">{formatCell(h, r[h])}</td>)}
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </motion.div>

                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e)=>{ e.preventDefault(); if (previewPage>1) setPreviewPage(previewPage-1); }}
                              className={previewPage<=1? "pointer-events-none opacity-50": ""}/>
                          </PaginationItem>
                          <PaginationItem><PaginationLink href="#" isActive>{previewPage}</PaginationLink></PaginationItem>
                          <PaginationItem>
                            <PaginationNext href="#" onClick={(e)=>{ e.preventDefault(); const total = Math.ceil(rows.length/previewPerPage); if (previewPage<total) setPreviewPage(previewPage+1); }}
                              className={previewPage>=Math.ceil(rows.length/previewPerPage)? "pointer-events-none opacity-50": ""}/>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {log && (
                      <motion.div className="space-y-6 mt-2" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }} transition={{ duration:0.5 }}>
                        <Card className="border border-white/10 bg-white/5">
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2" style={{ color:SARIR.accent }}>
                              نتیجه: {dryRun? "Dry-Run": "Import"} — {log.status ?? 200} {log.status===200? <CheckIcon className="w-5 h-5 text-emerald-400"/> : <XIcon className="w-5 h-5 text-red-400"/>}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {Array.isArray(log.reports) && log.reports.length>0 && (
                              <>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-300">تعداد بلوک گزارش: {log.reports.length}</div>
                                  <Button onClick={exportReportCSV} className="bg-emerald-700 hover:brightness-110">خروجی CSV گزارش</Button>
                                </div>
                                <div className="overflow-auto rounded-lg mt-2 max-h-[400px]">
                                  <table className="min-w-full text-xs divide-y divide-white/10">
                                    <thead className="sticky top-0" style={{ background:SARIR.dark }}>
                                      <tr>
                                        <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>چانک</th>
                                        <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>ردیف</th>
                                        <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>کلید</th>
                                        <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>نواقص</th>
                                        <th className="px-4 py-3 text-right font-medium" style={{ color:SARIR.accent }}>خطا</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                      <AnimatePresence>
                                        {log.reports.map((blk:any, ci:number)=> (blk.report||[]).slice(0, 10).map((r:any,i:number)=> (
                                          <motion.tr key={`${ci}-${i}`} className="hover:bg-white/5 transition duration-200" variants={tableRowVariants} initial="hidden" animate="visible" exit="hidden">
                                            <td className="px-4 py-2 text-gray-50">{ci}</td>
                                            <td className="px-4 py-2 text-gray-50">{r.row_index ?? ""}</td>
                                            <td className="px-4 py-2 text-gray-50">{r.key ?? ""}</td>
                                            <td className="px-4 py-2 text-gray-50">{Array.isArray(r.missing_fields)? r.missing_fields.join(", "): ""}</td>
                                            <td className="px-4 py-2 text-red-400">{r.error ?? ""}</td>
                                          </motion.tr>
                                        )))}
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

                  <div className="flex items-center justify-end gap-2">
                    <Button disabled={!rows.length || busy || missingRequired.length>0}
                      onClick={submit}
                      className="bg-[color:var(--sarir-accent,#F2991F)] text-gray-900 hover:brightness-110 flex items-center gap-2"
                      title={missingRequired.length>0? "برخی فیلدهای اجباری هنوز مپ نشده‌اند":"ارسال به سرور (Ctrl+Enter)"}>
                      {busy ? (<><RefreshCwIcon className="w-4 h-4 animate-spin"/> در حال ارسال…</>) : (<><CheckIcon className="w-4 h-4"/> ارسال</>)}
                    </Button>
                    <Button onClick={()=> {
                        const wb = XLSX.utils.book_new();
                        const wsData = [["Excel Header","DB Field"]]; excelHeaders.forEach((h)=> wsData.push([h, mapping[h] || ""]));
                        const ws = XLSX.utils.aoa_to_sheet(wsData); XLSX.utils.book_append_sheet(wb, ws, "Mapping");
                        XLSX.writeFile(wb, "mapping.xlsx");
                      }} className="bg-sky-600 hover:bg-sky-500 flex items-center gap-2">
                      <DownloadIcon className="w-4 h-4"/> دانلود مپینگ
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
