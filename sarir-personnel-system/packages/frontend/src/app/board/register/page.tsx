"use client";
import
import {
  DocumentTextIcon,
  EnvelopeIcon,
  NewspaperIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
// QR را اختیاری لود می‌کنیم، تا اگر پکیج نصب نبود بیلد نشکند.
// اگر بسته types نصب نشده باشد اعلام نوع ماژول در فایل .d.ts صورت گرفته است (src/types/qrcode.d.ts).
type QRModule = { default: { toDataURL: (text: string, opts?: unknown) => Promise<string> } };

import * as z from "zod";

/* رنگ‌ها + UI سبک */
const CC = { teal: "#07657E", cyan: "#1FB4C8", orange: "#F2991F", dark: "#2E3234" };

function Btn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, style, ...rest } = props;
  return (
    <button
      {...rest}
      className={`px-3 py-2 rounded-md text-white ${className || ""}`}
      style={{ background: `linear-gradient(90deg, ${CC.teal}, ${CC.cyan})`, ...(style || {}) }}
    />
  );
}
function OutlineBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return <button {...rest} className={`px-3 py-2 rounded-md border bg-white hover:bg-gray-50 ${className || ""}`} />;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      suppressHydrationWarning
      autoComplete="off"
      data-1p-ignore
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring w-full ${className || ""}`}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      suppressHydrationWarning
      autoComplete="off"
      data-1p-ignore
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring w-full min-h-[90px] ${className || ""}`}
    />
  );
}

/* قلم امضا (Canvas) */
function SignaturePad({ onChange }: { onChange: (dataUrl: string) => void }) {
  const [drawing, setDrawing] = useState(false);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const dpr = window.devicePixelRatio || 1;
    c.width = 600 * dpr;
    c.height = 200 * dpr;
    c.style.width = "600px";
    c.style.height = "200px";
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
  }, []);

  const start = (e: any) => {
    setDrawing(true);
    draw(e);
  };
  const end = () => {
    setDrawing(false);
    onChange(ref.current!.toDataURL("image/png"));
  };
  const draw = (e: any) => {
    if (!drawing) return;
    const c = ref.current!,
      r = c.getBoundingClientRect(),
      ctx = c.getContext("2d")!;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={ref}
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={end}
        onMouseOut={end}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={end}
        className="border rounded-md bg-white"
      />
      <button
        onClick={() => {
          const c = ref.current!,
            ctx = c.getContext("2d")!;
          ctx.clearRect(0, 0, c.width, c.height);
          onChange("");
        }}
        className="px-2 py-1 text-sm border rounded-md"
      >
        پاک کردن
      </button>
    </div>
  );
}

/* انواع/اسکیما */
type MeetingType = "annual" | "ordinaryExtra" | "extraordinary";
type Step = 1 | 2 | 3 | 4;

type FormState = {
  name: string;
  email: string;
  phone: string;
  position: string;
  introducer: string;
  meetingTitle: string;
  meetingType: MeetingType;
  fiscalYear: string;
  meetingDate: string;
  meetingTime: string;
  attendees: string; // comma-separated
};
const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  position: "",
  introducer: "",
  meetingTitle: "",
  meetingType: "annual",
  fiscalYear: "",
  meetingDate: "",
  meetingTime: "10:00",
  attendees: "",
};

const formSchema = z.object({
  name: z.string().min(3, { message: "نام حداقل 3 حرف باشد" }),
  email: z.string().email({ message: "ایمیل نامعتبر" }),
  phone: z.string().regex(/^09\d{9}$/, { message: "شماره تلفن نامعتبر" }),
  position: z.string().min(1, { message: "سمت الزامی است" }),
  introducer: z.string().optional(),
  meetingTitle: z.string().min(3, { message: "عنوان جلسه الزامی است" }),
  meetingType: z.enum(["annual", "ordinaryExtra", "extraordinary"]),
  fiscalYear: z.string().optional(),
  meetingDate: z.string().min(8, { message: "تاریخ جلسه الزامی است" }),
  meetingTime: z.string().min(4, { message: "ساعت جلسه الزامی است" }),
  attendees: z.string().optional(),
});

/* تمپلیت‌ها */
function buildTemplates(form: FormState) {
  const mt =
    form.meetingType === "annual"
      ? `مجمع عمومی عادی سالانه${form.fiscalYear ? ` (سال ${form.fiscalYear})` : ""}`
      : form.meetingType === "ordinaryExtra"
      ? "مجمع عمومی به‌طور فوق‌العاده"
      : "مجمع عمومی فوق‌العاده";

  const base = [
    `عنوان جلسه: ${form.meetingTitle}`,
    `نوع مجمع: ${mt}`,
    `تاریخ/ساعت: ${form.meetingDate} — ${form.meetingTime}`,
    `نام: ${form.name} | سمت: ${form.position}`,
    `ایمیل: ${form.email} | موبایل: ${form.phone}`,
    `شرکت معرفی‌کننده: ${form.introducer || "—"}`,
  ].join("\n");

  const intro = `شرکت ${form.introducer || "—"} بدین‌وسیله ${form.name} را جهت عضویت در هیئت‌مدیره معرفی می‌نماید.\n\n${base}`;
  const invite = `از ${form.name} دعوت می‌شود در جلسه زیر حضور یابد:\n\n${base}\n\nحاضرین: ${form.attendees || "—"}`;
  const minutes = `صورتجلسه جهت ثبت تصمیمات و آراء اعضا:\n\n${base}\n\nنتایج/مصوبات:\n- ...`;
  const gazette = `خلاصه مصوبات جهت انتشار رسمی:\n\n${base}\n\nمصوبات نهایی:\n- ...`;

  return { intro, invite, minutes, gazette };
}

/* نوار مدیریت تمپلیت‌ها */
function SmallBtn(props: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={props.onClick} className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 text-sm">
      {props.children}
    </button>
  );
}
type SavedTpl = { name: string; data: { intro: string; invite: string; minutes: string; gazette: string } };
function TemplateBar({
  text,
  setText,
}: {
  text: { intro: string; invite: string; minutes: string; gazette: string };
  setText: (v: any) => void;
}) {
  const [list, setList] = useState<SavedTpl[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("board_tpls") || "[]");
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");

  function save() {
    if (!name.trim()) {
      alert("نام تمپلیت را وارد کن");
      return;
    }
    const next = [{ name, data: text }, ...list.filter((x) => x.name !== name)];
    setList(next);
    localStorage.setItem("board_tpls", JSON.stringify(next));
  }
  function load(n: string) {
    const t = list.find((x) => x.name === n);
    if (!t) return;
    setText(t.data);
  }
  function del(n: string) {
    const next = list.filter((x) => x.name !== n);
    setList(next);
    localStorage.setItem("board_tpls", JSON.stringify(next));
  }

  return (
    <div className="rounded-2xl bg-white/80 border border-white/40 shadow p-3 flex flex-wrap gap-2 items-center">
      <span className="text-sm text-[#07657E]">تمپلیت اسناد:</span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="نام تمپلیت"
        className="border rounded-md px-2 py-1 text-sm"
        suppressHydrationWarning
        autoComplete="off"
        data-1p-ignore
      />
      <SmallBtn onClick={save}>ذخیره</SmallBtn>
      <div className="flex gap-2 flex-wrap">
        {list.map((it) => (
          <div key={it.name} className="flex items-center gap-1 bg-gray-50 border rounded-md px-2 py-1">
            <button onClick={() => load(it.name)} className="text-sm text-blue-700 underline">
              {it.name}
            </button>
            <button onClick={() => del(it.name)} className="text-xs text-red-600">
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* صفحه */
export default function RegisterBoardMember() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(() => {
    try {
      const raw = localStorage.getItem("board_register_draft");
      return raw ? (JSON.parse(raw) as FormState) : EMPTY;
    } catch {
      return EMPTY;
    }
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [docText, setDocText] = useState(buildTemplates(form));
  const [signatureDataUrl, setSignatureDataUrl] = useState("");

  /* مصوبات */
  type ActionItem = { id: string; title: string; owner: string; due: string; done: boolean };
  const [todos, setTodos] = useState<ActionItem[]>([]);
  function addTodo() {
    setTodos((s) => [{ id: crypto.randomUUID(), title: "", owner: "", due: "", done: false }, ...s]);
  }
  function exportTodosCSV() {
    const rows = [
      ["مصوبه", "مسئول", "موعد", "وضعیت"],
      ...todos.map((t) => [t.title, t.owner, t.due, t.done ? "انجام شد" : "باز"]),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8" })
    );
    a.download = "action_items.csv";
    a.click();
  }

  /* رأی‌گیری */
  type VoteItem = { id: string; subject: string; for: number; against: number; abstain: number };
  const [vItems, setVItems] = useState<VoteItem[]>([]);
  const [attendCount, setAttendCount] = useState(0);
  const [quorum, setQuorum] = useState(0);
  function addVote() {
    setVItems((s) => [{ id: crypto.randomUUID(), subject: "دستور جدید", for: 0, against: 0, abstain: 0 }, ...s]);
  }

  /* ذخیره خودکار + شورتکات‌ها */
  useEffect(() => {
    localStorage.setItem("board_register_draft", JSON.stringify(form));
  }, [form]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        localStorage.setItem("board_register_draft", JSON.stringify(form));
        toast("پیش‌نویس ذخیره شد");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [form]);

  useEffect(() => {
    setDocText(buildTemplates(form));
  }, [form]);

  const setVal = (k: keyof FormState, v: string) => setForm((s) => ({ ...s, [k]: v }));

  function validateAll() {
    try {
      if (form.meetingType === "annual" && !form.fiscalYear) {
        setErrs((e) => ({ ...e, fiscalYear: "سال مالی لازم است" }));
        return false;
      }
      formSchema.parse(form);
      setErrs({});
      return true;
    } catch (e) {
      const fl = (e as z.ZodError).flatten().fieldErrors as Record<string, string[] | undefined>;
      setErrs(Object.fromEntries(Object.entries(fl).map(([k, v]) => [k, v?.[0] || ""])));
      return false;
    }
  }
  function next() {
    if (!validateAll()) {
      toast.error("فرم را کامل کن.");
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }
  function prev() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  /* ساخت PDF (هدر/فوتر/واترمارک + امضا + QR اختیاری) */
  async function makePDF(
    title: string,
    body: string,
    meta: { meetingTitle: string; date: string; time: string }
  ) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const drawHeader = (p: any) => {
      p.drawText(meta.meetingTitle || "جلسه هیئت‌مدیره", { x: 50, y: 812, size: 10, font });
      p.drawText(`تاریخ: ${meta.date}  ساعت: ${meta.time}`, { x: 360, y: 812, size: 10, font });
      p.drawLine({ start: { x: 50, y: 806 }, end: { x: 545, y: 806 }, thickness: 0.5 });
    };
    const drawFooter = (p: any, pageNo: number) => {
      p.drawLine({ start: { x: 50, y: 60 }, end: { x: 545, y: 60 }, thickness: 0.5 });
      p.drawText(`${pageNo}`, { x: 540, y: 44, size: 10, font });
      p.drawText("SARIR LOGISTIC", { x: 50, y: 44, size: 10, font });
    };

    let page = pdf.addPage([595, 842]);
    drawHeader(page);
    page.drawText("SARIR", {
      x: 180,
      y: 420,
      size: 90,
      font,
      opacity: 0.05,
      rotate: degrees(25),
    });

    // QR اختیاری (اگر پکیج نصب بود)
    try {
      const mod = (await import("qrcode")) as unknown as QRModule;
      const url = `${location.origin}/board/meetings/verify?title=${encodeURIComponent(
        meta.meetingTitle
      )}&date=${meta.date}&time=${meta.time}`;
      const qrData = await mod.default.toDataURL(url, { margin: 1, width: 120 });
      const qrImg = await pdf.embedPng(qrData);
      page.drawImage(qrImg, { x: 470, y: 680, width: 90, height: 90 });
      page.drawText("Verify", { x: 480, y: 670, size: 10, font });
    } catch {
      // qrcode نصب نیست؛ ادامه بدون QR
    }

    // Title + Body
    page.drawText(title, { x: 50, y: 780, size: 18, font });
    let y = 754,
      pageNo = 1;
    const wrap = (s: string, max = 88) =>
      s.match(new RegExp(`.{1,${max}}(\\s|$)`, "g")) || [s];

    for (const ln of (body || "").split("\n")) {
      for (const chunk of wrap(ln)) {
        if (y < 120) {
          drawFooter(page, pageNo++);
          page = pdf.addPage([595, 842]);
          drawHeader(page);
          y = 780;
        }
        page.drawText(chunk.trim(), { x: 50, y, size: 12, font });
        y -= 16;
      }
      y -= 4;
    }

    // امضا
    if (signatureDataUrl) {
      const png = await pdf.embedPng(signatureDataUrl);
      const w = 140,
        h = (png.height / png.width) * w;
      page.drawText("امضا:", { x: 50, y: 230, size: 10, font });
      page.drawImage(png, { x: 50, y: 80, width: w, height: h });
    }

    // خلاصه مصوبات (کوتاه)
    if (todos.length) {
      page.drawText("مصوبات:", { x: 240, y: 230, size: 12, font });
      let yy = 210;
      const items = todos.map(
        (t, i) =>
          `${i + 1}. ${t.title} | ${t.owner || "—"} | ${t.due || "—"} | ${t.done ? "✓" : ""}`
      );
      for (const line of items) {
        if (yy < 80) break;
        page.drawText(line, { x: 240, y: yy, size: 10, font });
        yy -= 14;
      }
    }

    drawFooter(page, pageNo);

    const bytes = await pdf.save();
    const a = document.createElement("a");
    // Create a proper ArrayBufferView from the returned bytes so Blob typing is satisfied
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("PDF دانلود شد");
  }

  /* iCal (REQUEST + ATTENDEE) */
  function downloadICS() {
    const dt = `${form.meetingDate.replaceAll("-", "")}T${form.meetingTime.replaceAll(":", "")}00`;
    const attendees = (form.attendees || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const attLines = attendees
      .map((a) =>
        a.includes("@")
          ? `ATTENDEE;CN=${a};ROLE=REQ-PARTICIPANT:MAILTO:${a}`
          : `ATTENDEE;CN=${a};ROLE=REQ-PARTICIPANT:tel:${a}`
      )
      .join("\r\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SARIR-BOARD//FA",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}@sarir.local`,
      `DTSTAMP:${dt}Z`,
      `DTSTART:${dt}Z`,
      `DTEND:${dt}Z`,
      `SUMMARY:${form.meetingTitle || "جلسه هیئت‌مدیره"}`,
      `DESCRIPTION:نوع: ${form.meetingType} | معرفی‌کننده: ${form.introducer || "—"} | حاضرین: ${
        form.attendees || "—"
      }`,
      attLines,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "meeting.ics";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("فایل iCal ساخته شد");
  }

  /* helpers */
  function Field(props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
  }) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700">{props.label}</label>
        <Input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          type={props.type || "text"}
        />
        {props.error && <div className="text-xs text-red-600">{props.error}</div>}
      </div>
    );
  }
  function StepPill({ title, active }: { title: string; active: boolean }) {
    return (
      <div className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}>{title}</div>
    );
  }
  function DocCard({
    step,
    title,
    icon,
    active,
    value,
    onChange,
    onDownload,
  }: {
    step: number;
    title: string;
    icon: React.ReactNode;
    active: boolean;
    value: string;
    onChange: (v: string) => void;
    onDownload: () => void;
  }) {
    return (
      <div className={`rounded-2xl border shadow-sm bg-white p-4 ${active ? "ring-2 ring-emerald-300" : ""}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-9 rounded-lg grid place-items-center text-white" style={{ background: "#3BB79F" }}>
            {icon}
          </div>
          <div className="font-bold">{title}</div>
        </div>
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">مرحله {step} از 4</span>
          <Btn onClick={onDownload}>دانلود PDF</Btn>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(110rem 60rem at 110% -20%, rgba(7,101,126,.14), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(242,153,31,.14), transparent), #eef3f7",
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b p-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: CC.teal }}>
              ثبت عضو هیئت‌مدیره – مرحله {step}/4
            </h1>
            <p className="text-sm text-gray-600">معرفی‌نامه • دعوتنامه • صورتجلسه • روزنامه</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <StepPill title="معرفی‌نامه" active={step >= 1} />
            <StepPill title="دعوتنامه" active={step >= 2} />
            <StepPill title="صورتجلسه" active={step >= 3} />
            <StepPill title="روزنامه" active={step >= 4} />
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* راهنما + عملیات سریع */}
        <div className="rounded-2xl bg-white/80 border border-white/40 shadow p-4 mb-6 flex flex-wrap gap-3 items-center">
          <InformationCircleIcon className="h-5 w-5 text-[#07657E]" />
          <span className="text-sm text-[#07657E]">
            پیش‌نویس ذخیره خودکار دارد. تمپلیت‌ها را ذخیره کن و در هر مرحله متن سند را قبل از PDF ویرایش کن.
          </span>
          <div className="ml-auto flex gap-2">
            <OutlineBtn
              onClick={() => {
                localStorage.removeItem("board_register_draft");
                setForm(EMPTY);
                setTodos([]);
                setVItems([]);
                setSignatureDataUrl("");
                toast("پیش‌نویس پاک شد");
              }}
            >
              <TrashIcon className="h-4 w-4 ml-1 inline" /> پاک‌سازی پیش‌نویس
            </OutlineBtn>
            <Btn onClick={downloadICS}>خروجی iCal</Btn>
          </div>
        </div>

        {/* مدیریت تمپلیت‌ها */}
        <TemplateBar text={docText} setText={setDocText} />

        {/* فرم */}
        <section className="bg-white rounded-2xl shadow border p-4 md:p-6 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="نام و نام خانوادگی" value={form.name} onChange={(v) => setVal("name", v)} error={errs.name} placeholder="مثلاً علی محمدی" />
            <Field label="ایمیل" value={form.email} onChange={(v) => setVal("email", v)} error={errs.email} placeholder="example@mail.com" />
            <Field label="شماره موبایل" value={form.phone} onChange={(v) => setVal("phone", v)} error={errs.phone} placeholder="09xxxxxxxxx" />
            <Field label="سمت پیشنهادی" value={form.position} onChange={(v) => setVal("position", v)} error={errs.position} placeholder="عضو هیئت‌مدیره" />
            <Field label="شرکت معرفی‌کننده" value={form.introducer} onChange={(v) => setVal("introducer", v)} placeholder="مثلاً پارس آوین" />
            <Field label="عنوان جلسه" value={form.meetingTitle} onChange={(v) => setVal("meetingTitle", v)} error={errs.meetingTitle} placeholder="مجمع عمومی ..." />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">نوع مجمع</label>
              <select
                value={form.meetingType}
                onChange={(e) => setVal("meetingType", e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="annual">مجمع عمومی عادی سالانه</option>
                <option value="ordinaryExtra">مجمع عمومی به‌طور فوق‌العاده</option>
                <option value="extraordinary">مجمع عمومی فوق‌العاده</option>
              </select>
            </div>

            {form.meetingType === "annual" && (
              <Field label="سال مالی" value={form.fiscalYear} onChange={(v) => setVal("fiscalYear", v)} error={errs.fiscalYear} placeholder="مثلاً 1404" />
            )}

            <Field label="تاریخ جلسه" type="date" value={form.meetingDate} onChange={(v) => setVal("meetingDate", v)} error={errs.meetingDate} />
            <Field label="ساعت" type="time" value={form.meetingTime} onChange={(v) => setVal("meetingTime", v)} error={errs.meetingTime} />

            <div className="md:col-span-2">
              <label className="text-sm text-gray-700">حاضرین جلسه (ایمیل/موبایل با ویرگول جدا)</label>
              <Input value={form.attendees} onChange={(e) => setVal("attendees", e.target.value)} placeholder="ali@mail.com, 09xxxxxxxxx, ..." />
            </div>
          </div>
        </section>

        {/* امضا */}
        <div className="mt-4 rounded-2xl bg-white/80 border border-white/40 shadow p-4">
          <div className="font-semibold text-[#07657E] mb-2">امضای رئیس/منشی</div>
          <SignaturePad onChange={setSignatureDataUrl} />
        </div>

        {/* مصوبات */}
        <div className="mt-4 border rounded-2xl p-3 bg-white/70">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-[#07657E]">مصوبات جلسه</div>
            <div className="flex gap-2">
              <button onClick={addTodo} className="px-2 py-1 text-sm border rounded-md">افزودن</button>
              <button onClick={exportTodosCSV} className="px-2 py-1 text-sm border rounded-md">CSV</button>
            </div>
          </div>
          {todos.map((t) => (
            <div key={t.id} className="grid md:grid-cols-4 gap-2 items-center mb-2">
              <input
                className="border rounded-md px-2 py-1"
                placeholder="متن مصوبه"
                value={t.title}
                onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)))}
                suppressHydrationWarning autoComplete="off" data-1p-ignore
              />
              <input
                className="border rounded-md px-2 py-1"
                placeholder="مسئول"
                value={t.owner}
                onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, owner: e.target.value } : x)))}
                suppressHydrationWarning autoComplete="off" data-1p-ignore
              />
              <input
                className="border rounded-md px-2 py-1"
                type="date"
                value={t.due}
                onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, due: e.target.value } : x)))}
                suppressHydrationWarning autoComplete="off" data-1p-ignore
              />
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, done: e.target.checked } : x)))}
                />
                انجام شد
              </label>
            </div>
          ))}
        </div>

        {/* رأی‌گیری */}
        <div className="mt-4 border rounded-2xl p-3 bg-white/70">
          <div className="font-semibold text-[#07657E] mb-2">رأی‌گیری</div>
          <div className="flex gap-2 mb-3">
            <input
              className="border rounded-md px-2 py-1"
              type="number"
              placeholder="حاضرین"
              value={attendCount}
              onChange={(e) => setAttendCount(+e.target.value || 0)}
              suppressHydrationWarning autoComplete="off" data-1p-ignore
            />
            <input
              className="border rounded-md px-2 py-1"
              type="number"
              placeholder="حد نصاب"
              value={quorum}
              onChange={(e) => setQuorum(+e.target.value || 0)}
              suppressHydrationWarning autoComplete="off" data-1p-ignore
            />
            <button onClick={() => addVote()} className="px-2 py-1 border rounded-md">افزودن دستور</button>
          </div>
          {vItems.map((v) => (
            <div key={v.id} className="grid md:grid-cols-5 gap-2 items-center mb-2">
              <input
                className="border rounded-md px-2 py-1 md:col-span-2"
                value={v.subject}
                onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, subject: e.target.value } : x)))}
                suppressHydrationWarning autoComplete="off" data-1p-ignore
              />
              <input className="border rounded-md px-2 py-1" type="number" value={v.for}
                onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, for: +e.target.value || 0 } : x)))}
                suppressHydrationWarning autoComplete="off" data-1p-ignore
              />
              <input className="border rounded-md px-2 py-1" type="number" value={v.against}
                onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, against: +e.target.value || 0 } : x)))}
                suppressHydrationWarning autoComplete="off" data-1p-ignore
              />
              <input className="border rounded-md px-2 py-1" type="number" value={v.abstain}
                onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, abstain: +e.target.value || 0 } : x)))}
                suppressHydrationWarning autoComplete="off" data-1p-ignore
              />
            </div>
          ))}
          <div className="text-sm mt-2">
            وضعیت نصاب: {attendCount >= quorum ? <span className="text-emerald-600">معتبر</span> : <span className="text-red-600">نامعتبر</span>}
          </div>
        </div>

        {/* کارت‌ها + دانلود PDF */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <DocCard
            step={1}
            title="معرفی‌نامه"
            icon={<EnvelopeIcon className="h-6 w-6" />}
            active={step === 1}
            value={docText.intro}
            onChange={(v) => setDocText((s) => ({ ...s, intro: v }))}
            onDownload={() => {
              if (!validateAll()) return;
              makePDF("معرفی‌نامه", docText.intro, { meetingTitle: form.meetingTitle, date: form.meetingDate, time: form.meetingTime });
            }}
          />
          <DocCard
            step={2}
            title="دعوتنامه"
            icon={<DocumentTextIcon className="h-6 w-6" />}
            active={step === 2}
            value={docText.invite}
            onChange={(v) => setDocText((s) => ({ ...s, invite: v }))}
            onDownload={() => {
              if (!validateAll()) return;
              makePDF("دعوتنامه", docText.invite, { meetingTitle: form.meetingTitle, date: form.meetingDate, time: form.meetingTime });
            }}
          />
          <DocCard
            step={3}
            title="صورتجلسه"
            icon={<NewspaperIcon className="h-6 w-6" />}
            active={step === 3}
            value={docText.minutes}
            onChange={(v) => setDocText((s) => ({ ...s, minutes: v }))}
            onDownload={() => {
              if (!validateAll()) return;
              const voteLines = vItems.length
                ? ["", "آراء:", ...vItems.map((x, i) => `${i + 1}. ${x.subject} | موافق:${x.for} مخالف:${x.against} ممتنع:${x.abstain}`)].join("\n")
                : "";
              const todoLines = todos.length
                ? ["", "مصوبات:", ...todos.map((t, i) => `${i + 1}. ${t.title} | ${t.owner} | ${t.due} | ${t.done ? "✓" : ""}`)].join("\n")
                : "";
              makePDF("صورتجلسه", `${docText.minutes}${voteLines}${todoLines}`, { meetingTitle: form.meetingTitle, date: form.meetingDate, time: form.meetingTime });
            }}
          />
          <DocCard
            step={4}
            title="روزنامه"
            icon={<NewspaperIcon className="h-6 w-6" />}
            active={step === 4}
            value={docText.gazette}
            onChange={(v) => setDocText((s) => ({ ...s, gazette: v }))}
            onDownload={() => {
              if (!validateAll()) return;
              makePDF("روزنامه", docText.gazette, { meetingTitle: form.meetingTitle, date: form.meetingDate, time: form.meetingTime });
            }}
          />
        </div>

        {/* کنترل‌های ویزارد */}
        <div className="mt-8 flex items-center justify-between">
          <OutlineBtn onClick={prev} disabled={step === 1}>
            <ArrowRightIcon className="h-5 w-5 inline-block ml-1" /> مرحله قبل
          </OutlineBtn>
          {step < 4 ? (
            <Btn onClick={next}>
              مرحله بعد <ArrowLeftIcon className="h-5 w-5 inline-block mr-1" />
            </Btn>
          ) : (
            <Btn
              onClick={async (e) => {
                e.preventDefault();
                if (!validateAll()) return;
                toast.success("عضو ثبت شد");
                await makePDF("روزنامه", docText.gazette, { meetingTitle: form.meetingTitle, date: form.meetingDate, time: form.meetingTime });
              }}
              style={{ background: `linear-gradient(90deg, ${CC.teal}, ${CC.orange})` }}
            >
              ثبت نهایی <CheckIcon className="h-5 w-5 inline-block mr-1" />
            </Btn>
          )}
        </div>
      </main>
    </div>
  );
}
