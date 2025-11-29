"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  NewspaperIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  attendees: string;
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
  name: z.string().min(3, { message: "نام حداقل 3 کاراکتر باشد" }),
  email: z.string().email({ message: "ایمیل معتبر نیست" }),
  phone: z.string().regex(/^09\d{9}$/, { message: "شماره همراه معتبر نیست" }),
  position: z.string().min(1, { message: "سمت را وارد کنید" }),
  introducer: z.string().optional(),
  meetingTitle: z.string().min(3, { message: "عنوان جلسه را کامل کنید" }),
  meetingType: z.enum(["annual", "ordinaryExtra", "extraordinary"]),
  fiscalYear: z.string().optional(),
  meetingDate: z.string().min(8, { message: "تاریخ جلسه الزامی است" }),
  meetingTime: z.string().min(4, { message: "ساعت جلسه الزامی است" }),
  attendees: z.string().optional(),
});

type QRModule = { default: { toDataURL: (text: string, opts?: unknown) => Promise<string> } };

type ActionItem = { id: string; title: string; owner: string; due: string; done: boolean };
type VoteItem = { id: string; subject: string; for: number; against: number; abstain: number };

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

  const start = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    draw(e);
  };
  const end = () => {
    setDrawing(false);
    onChange(ref.current!.toDataURL("image/png"));
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const c = ref.current!,
      r = c.getBoundingClientRect(),
      ctx = c.getContext("2d")!;
    let clientX: number, clientY: number;
    if ("touches" in e && (e as React.TouchEvent<HTMLCanvasElement>).touches.length) {
      clientX = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientX;
      clientY = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientY;
    } else {
      const me = e as React.MouseEvent<HTMLCanvasElement>;
      clientX = me.clientX;
      clientY = me.clientY;
    }
    const x = clientX - r.left;
    const y = clientY - r.top;
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
        className="w-full max-w-full rounded-md border bg-white"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const c = ref.current!,
            ctx = c.getContext("2d")!;
          ctx.clearRect(0, 0, c.width, c.height);
          onChange("");
        }}
      >
        پاک کردن
      </Button>
    </div>
  );
}

function TemplateBar({
  text,
  setText,
}: {
  text: { intro: string; invite: string; minutes: string; gazette: string };
  setText: (v: { intro: string; invite: string; minutes: string; gazette: string }) => void;
}) {
  const [list, setList] = useState<{ name: string; data: typeof text }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("board_tpls") || "[]");
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");

  function save() {
    if (!name.trim()) {
      toast.error("نام قالب را وارد کنید");
      return;
    }
    const next = [{ name, data: text }, ...list.filter((x) => x.name !== name)];
    setList(next);
    localStorage.setItem("board_tpls", JSON.stringify(next));
    toast.success("قالب ذخیره شد");
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
    <Card className="flex flex-wrap items-center gap-2 border-border/80 bg-card/80 p-3">
      <span className="text-sm text-primary">قالب‌های ذخیره‌شده:</span>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام قالب" className="w-40" />
      <Button variant="secondary" size="sm" onClick={save}>
        ذخیره
      </Button>
      <div className="flex flex-wrap gap-2">
        {list.map((it) => (
          <div key={it.name} className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm">
            <button onClick={() => load(it.name)} className="text-primary underline">
              {it.name}
            </button>
            <button onClick={() => del(it.name)} className="text-destructive">
              حذف
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

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
      {props.error ? <div className="text-xs text-red-600">{props.error}</div> : null}
    </div>
  );
}

function StepPill({ title, active }: { title: string; active: boolean }) {
  return (
    <div
      className={`rounded-full border px-3 py-1 text-sm ${
        active ? "border-emerald-300 bg-emerald-50" : "border-border bg-muted/40"
      }`}
    >
      {title}
    </div>
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
    <Card className={`border ${active ? "ring-2 ring-emerald-300" : ""}`}>
      <div className="mb-3 flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-lg text-white" style={{ background: "#3BB79F" }}>
          {icon}
        </div>
        <div className="font-bold">{title}</div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      />
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>مرحله {step} از 4</span>
        <Button onClick={onDownload} size="sm">
          دانلود PDF
        </Button>
      </div>
    </Card>
  );
}

function buildTemplates(form: FormState) {
  const mt =
    form.meetingType === "annual"
      ? `مجمع عمومی سالانه${form.fiscalYear ? ` (سال ${form.fiscalYear})` : ""}`
      : form.meetingType === "ordinaryExtra"
      ? "مجمع عمومی عادی به‌طور فوق‌العاده"
      : "مجمع عمومی فوق‌العاده";

  const base = [
    `عنوان جلسه: ${form.meetingTitle}`,
    `نوع جلسه: ${mt}`,
    `تاریخ/ساعت: ${form.meetingDate} - ${form.meetingTime}`,
    `نام: ${form.name} | سمت: ${form.position}`,
    `ایمیل: ${form.email} | تلفن: ${form.phone}`,
    `معرف/حامی: ${form.introducer || "-"}`,
  ].join("\n");

  const intro = `خانم/آقای ${form.introducer || "-"} معرفی ${form.name} را برای حضور در جلسه اعلام می‌کند.\n\n${base}`;
  const invite = `از ${form.name} دعوت می‌شود در جلسه هیئت مدیره حضور یابد:\n\n${base}\n\nحاضرین: ${form.attendees || "-"}`;
  const minutes = `صورتجلسه مجمع/هیئت مدیره به شرح زیر است:\n\n${base}\n\nمصوبات:\n- ...`;
  const gazette = `آگهی دعوت هیئت مدیره:\n\n${base}\n\nدستور جلسه:\n- ...`;

  return { intro, invite, minutes, gazette };
}

export default function BoardForm() {
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

  const [todos, setTodos] = useState<ActionItem[]>([]);
  const [vItems, setVItems] = useState<VoteItem[]>([]);
  const [attendCount, setAttendCount] = useState(0);
  const [quorum, setQuorum] = useState(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- next is defined later and stable for this usage
  }, [form]);

  useEffect(() => {
    setDocText(buildTemplates(form));
  }, [form]);

  const setVal = (k: keyof FormState, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const validateAll = useCallback(() => {
    try {
      if (form.meetingType === "annual" && !form.fiscalYear) {
        setErrs((e) => ({ ...e, fiscalYear: "سال مالی را وارد کنید" }));
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
  }, [form]);

  const next = useCallback(() => {
    if (!validateAll()) {
      toast.error("خطا در تکمیل فرم");
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }, [validateAll]);
  function prev() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  const docMeta = useMemo(
    () => ({ meetingTitle: form.meetingTitle, date: form.meetingDate, time: form.meetingTime }),
    [form.meetingDate, form.meetingTime, form.meetingTitle]
  );

  async function makePDF(title: string, body: string) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const drawHeader = (p: import("pdf-lib").PDFPage) => {
      p.drawText(docMeta.meetingTitle || "هیئت مدیره", { x: 50, y: 812, size: 10, font });
      p.drawText(`تاریخ: ${docMeta.date}  ساعت: ${docMeta.time}`, { x: 360, y: 812, size: 10, font });
      p.drawLine({ start: { x: 50, y: 806 }, end: { x: 545, y: 806 }, thickness: 0.5 });
    };
    const drawFooter = (p: import("pdf-lib").PDFPage, pageNo: number) => {
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

    try {
      const mod = (await import("qrcode")) as unknown as QRModule;
      const url = `${location.origin}/board/meetings/verify?title=${encodeURIComponent(docMeta.meetingTitle)}&date=${docMeta.date}&time=${docMeta.time}`;
      const qrData = await mod.default.toDataURL(url, { margin: 1, width: 120 });
      const qrImg = await pdf.embedPng(qrData);
      page.drawImage(qrImg, { x: 470, y: 680, width: 90, height: 90 });
      page.drawText("Verify", { x: 480, y: 670, size: 10, font });
    } catch {
      // QR optional
    }

    page.drawText(title, { x: 50, y: 780, size: 18, font });
    let y = 754,
      pageNo = 1;
    const wrap = (s: string, max = 88) => s.match(new RegExp(`.{1,${max}}(\\s|$)`, "g")) || [s];

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

    if (signatureDataUrl) {
      const png = await pdf.embedPng(signatureDataUrl);
      const w = 140,
        h = (png.height / png.width) * w;
      page.drawText("امضا:", { x: 50, y: 230, size: 10, font });
      page.drawImage(png, { x: 50, y: 80, width: w, height: h });
    }

    if (todos.length) {
      page.drawText("اقدامات:", { x: 240, y: 230, size: 12, font });
      let yy = 210;
      const items = todos.map((t, i) => `${i + 1}. ${t.title} | ${t.owner || "-"} | ${t.due || "-"} | ${t.done ? "✓" : ""}`);
      for (const line of items) {
        if (yy < 80) break;
        page.drawText(line, { x: 240, y: yy, size: 10, font });
        yy -= 14;
      }
    }

    drawFooter(page, pageNo);

    const bytes = await pdf.save();
    const a = document.createElement("a");
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("PDF آماده شد");
  }

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
      `SUMMARY:${form.meetingTitle || "هیئت مدیره"}`,
      `DESCRIPTION:نوع: ${form.meetingType} | معرفی‌کننده: ${form.introducer || "-"} | حاضرین: ${form.attendees || "-"}`,
      attLines,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "meeting.ics";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("فایل iCal آماده شد");
  }

  function addTodo() {
    setTodos((s) => [{ id: crypto.randomUUID(), title: "", owner: "", due: "", done: false }, ...s]);
  }
  function exportTodosCSV() {
    const rows = [
      ["عنوان", "مسئول", "مهلت", "وضعیت"],
      ...todos.map((t) => [t.title, t.owner, t.due, t.done ? "انجام شد" : "خیر"]),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = "action_items.csv";
    a.click();
  }
  function addVote() {
    setVItems((s) => [{ id: crypto.randomUUID(), subject: "موضوع رای", for: 0, against: 0, abstain: 0 }, ...s]);
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-3 border-border/80 bg-card/80 p-4">
        <InformationCircleIcon className="h-5 w-5 text-primary" />
        <span className="text-sm text-primary">
          اطلاعات جلسه را تکمیل کنید. فرم ذخیره خودکار دارد و می‌توانید PDF و iCal بگیرید.
        </span>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem("board_register_draft");
              setForm(EMPTY);
              setTodos([]);
              setVItems([]);
              setSignatureDataUrl("");
              toast("پیش‌نویس پاک شد");
            }}
          >
            <TrashIcon className="ml-1 h-4 w-4" /> پاک‌کردن پیش‌نویس
          </Button>
          <Button size="sm" onClick={downloadICS}>
            دانلود iCal
          </Button>
        </div>
      </Card>

      <TemplateBar text={docText} setText={setDocText} />

      <Card className="border p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StepPill title="پیش‌نویس" active={step >= 1} />
          <StepPill title="دعوت‌نامه" active={step >= 2} />
          <StepPill title="صورتجلسه" active={step >= 3} />
          <StepPill title="آگهی" active={step >= 4} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="نام و نام خانوادگی" value={form.name} onChange={(v) => setVal("name", v)} error={errs.name} placeholder="مثال: احمد رضایی" />
          <Field label="ایمیل" value={form.email} onChange={(v) => setVal("email", v)} error={errs.email} placeholder="example@mail.com" />
          <Field label="شماره همراه" value={form.phone} onChange={(v) => setVal("phone", v)} error={errs.phone} placeholder="09xxxxxxxxx" />
          <Field label="سمت پیشنهادی" value={form.position} onChange={(v) => setVal("position", v)} error={errs.position} placeholder="عضو هیئت مدیره" />
          <Field label="معرف/حامی" value={form.introducer} onChange={(v) => setVal("introducer", v)} placeholder="نام معرف (اختیاری)" />
          <Field label="عنوان جلسه" value={form.meetingTitle} onChange={(v) => setVal("meetingTitle", v)} error={errs.meetingTitle} placeholder="جلسه مجمع ..." />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">نوع جلسه</label>
            <select
              value={form.meetingType}
              onChange={(e) => setVal("meetingType", e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2"
            >
              <option value="annual">مجمع عمومی سالانه</option>
              <option value="ordinaryExtra">مجمع عمومی عادی به‌طور فوق‌العاده</option>
              <option value="extraordinary">مجمع عمومی فوق‌العاده</option>
            </select>
          </div>

          {form.meetingType === "annual" ? (
            <Field label="سال مالی" value={form.fiscalYear} onChange={(v) => setVal("fiscalYear", v)} error={errs.fiscalYear} placeholder="سال 1404" />
          ) : null}

          <Field label="تاریخ جلسه" type="date" value={form.meetingDate} onChange={(v) => setVal("meetingDate", v)} error={errs.meetingDate} />
          <Field label="ساعت" type="time" value={form.meetingTime} onChange={(v) => setVal("meetingTime", v)} error={errs.meetingTime} />

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">حاضرین (ایمیل/تلفن با کاما جدا شود)</label>
            <Input value={form.attendees} onChange={(e) => setVal("attendees", e.target.value)} placeholder="ali@mail.com, 09xxxxxxxxx, ..." />
          </div>
        </div>
      </Card>

      <Card className="border p-4">
        <div className="font-semibold text-primary mb-2">امضا / مهر</div>
        <SignaturePad onChange={setSignatureDataUrl} />
      </Card>

      <Card className="border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold text-primary">اقدامات جلسه</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addTodo}>
              افزودن
            </Button>
            <Button variant="outline" size="sm" onClick={exportTodosCSV}>
              CSV
            </Button>
          </div>
        </div>
        {todos.map((t) => (
          <div key={t.id} className="mb-2 grid items-center gap-2 md:grid-cols-4">
            <Input
              placeholder="عنوان اقدام"
              value={t.title}
              onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)))}
            />
            <Input
              placeholder="مسئول"
              value={t.owner}
              onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, owner: e.target.value } : x)))}
            />
            <Input
              type="date"
              value={t.due}
              onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, due: e.target.value } : x)))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.done}
                onChange={(e) => setTodos((s) => s.map((x) => (x.id === t.id ? { ...x, done: e.target.checked } : x)))}
              />
              انجام شد
            </label>
          </div>
        ))}
      </Card>

      <Card className="border p-4">
        <div className="mb-2 font-semibold text-primary">رأی‌گیری</div>
        <div className="mb-3 flex gap-2">
          <Input
            type="number"
            placeholder="حاضرین"
            value={attendCount}
            onChange={(e) => setAttendCount(+e.target.value || 0)}
          />
          <Input
            type="number"
            placeholder="حد نصاب"
            value={quorum}
            onChange={(e) => setQuorum(+e.target.value || 0)}
          />
          <Button variant="outline" size="sm" onClick={addVote}>
            افزودن موضوع رأی
          </Button>
        </div>
        {vItems.map((v) => (
          <div key={v.id} className="mb-2 grid items-center gap-2 md:grid-cols-5">
            <Input
              className="md:col-span-2"
              value={v.subject}
              onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, subject: e.target.value } : x)))}
            />
            <Input
              type="number"
              value={v.for}
              onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, for: +e.target.value || 0 } : x)))}
            />
            <Input
              type="number"
              value={v.against}
              onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, against: +e.target.value || 0 } : x)))}
            />
            <Input
              type="number"
              value={v.abstain}
              onChange={(e) => setVItems((s) => s.map((x) => (x.id === v.id ? { ...x, abstain: +e.target.value || 0 } : x)))}
            />
          </div>
        ))}
        <div className="text-sm">
          نصاب حاصل شده است؟{" "}
          {attendCount >= quorum ? <span className="text-emerald-600">بله</span> : <span className="text-red-600">خیر</span>}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <DocCard
          step={1}
          title="پیش‌نویس معرفی"
          icon={<EnvelopeIcon className="h-6 w-6" />}
          active={step === 1}
          value={docText.intro}
          onChange={(v) => setDocText((s) => ({ ...s, intro: v }))}
          onDownload={() => {
            if (!validateAll()) return;
            makePDF("پیش‌نویس معرفی", docText.intro);
          }}
        />
        <DocCard
          step={2}
          title="دعوت‌نامه"
          icon={<DocumentTextIcon className="h-6 w-6" />}
          active={step === 2}
          value={docText.invite}
          onChange={(v) => setDocText((s) => ({ ...s, invite: v }))}
          onDownload={() => {
            if (!validateAll()) return;
            makePDF("دعوت‌نامه", docText.invite);
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
              ? ["", "اقدامات:", ...todos.map((t, i) => `${i + 1}. ${t.title} | ${t.owner} | ${t.due} | ${t.done ? "✓" : ""}`)].join("\n")
              : "";
            makePDF("صورتجلسه", `${docText.minutes}${voteLines}${todoLines}`);
          }}
        />
        <DocCard
          step={4}
          title="آگهی روزنامه"
          icon={<NewspaperIcon className="h-6 w-6" />}
          active={step === 4}
          value={docText.gazette}
          onChange={(v) => setDocText((s) => ({ ...s, gazette: v }))}
          onDownload={() => {
            if (!validateAll()) return;
            makePDF("آگهی", docText.gazette);
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prev} disabled={step === 1}>
          <ArrowRightIcon className="ml-1 h-5 w-5" /> مرحله قبل
        </Button>
        {step < 4 ? (
          <Button onClick={next}>
            مرحله بعد <ArrowLeftIcon className="mr-1 h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={async (e) => {
              e.preventDefault();
              if (!validateAll()) return;
              toast.success("ثبت اولیه انجام شد");
              await makePDF("آگهی", docText.gazette);
            }}
            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)]"
          >
            ثبت نهایی <CheckIcon className="mr-1 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
