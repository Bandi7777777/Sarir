"use client";

import { useGSAP } from "@gsap/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { gsap } from "gsap";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PersonFormVariant = "personnel" | "driver";

const genderEnum = z.enum(["male", "female", "other"], { message: "جنسیت الزامی است" });
const educationEnum = z.enum(
  ["diplom", "kardani", "karshenasi", "arshad", "doctora", "other"],
  { message: "مقطع تحصیلی الزامی است" }
);

const personnelSchema = z.object({
  personnel_code: z.string().min(1, "کد پرسنلی الزامی است"),
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  national_id: z.string().min(1, "کد ملی الزامی است"),
  birth_date: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: genderEnum,
  mobile_phone: z.string().regex(/^\d{10,11}$/, "شماره تماس باید ۱۰ یا ۱۱ رقم باشد").optional(),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  position: z.string().optional(),
  department: z.enum(["hr", "it", "finance", "operations"], { message: "دپارتمان را انتخاب کنید" }),
  unit: z.string().optional(),
  education_level: educationEnum,
  insurance_history: z.string().optional(),
  hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
  address: z.string().optional(),
});

const driverSchema = z.object({
  driver_code: z.string().min(1, "کد راننده الزامی است"),
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  national_id: z.string().min(10, "کد ملی باید حداقل ۱۰ رقم باشد"),
  birth_date: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: genderEnum,
  mobile_phone: z.string().regex(/^\d{10,11}$/, "شماره تماس باید ۱۰ یا ۱۱ رقم باشد"),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  license_number: z.string().min(1, "شماره گواهینامه الزامی است"),
  license_issue_date: z.string().min(1, "تاریخ صدور گواهینامه الزامی است"),
  license_expiry_date: z.string().min(1, "تاریخ انقضا گواهینامه الزامی است"),
  vehicle_plate: z.string().min(1, "پلاک خودرو الزامی است"),
  address: z.string().optional(),
  hire_date: z.string().min(1, "تاریخ شروع همکاری الزامی است"),
  insurance_history: z.string().optional(),
  education_level: educationEnum,
});

type PersonnelFormData = z.infer<typeof personnelSchema>;
type DriverFormData = z.infer<typeof driverSchema>;
type CombinedFormData = PersonnelFormData & DriverFormData;

type FieldConfig = {
  name: keyof CombinedFormData;
  label: string;
  type?: "text" | "email" | "date" | "select";
  placeholder?: string;
  required?: boolean;
  colSpan?: string;
  options?: { value: string; label: string }[];
};

type FormConfig = {
  title: string;
  description: string;
  api: string;
  schema: z.ZodTypeAny;
  defaultValues: Partial<CombinedFormData>;
  duplicateChecks: { name: keyof CombinedFormData; queryKey: string }[];
  fields: FieldConfig[];
  excel: {
    downloadTemplate: () => void;
    parseRow: (row: (string | number | undefined)[], setValue: (field: keyof CombinedFormData, value: any) => void) => void;
  };
};

const genderOptions = [
  { value: "male", label: "مرد" },
  { value: "female", label: "زن" },
  { value: "other", label: "سایر" },
];

const educationOptions = [
  { value: "diplom", label: "دیپلم" },
  { value: "kardani", label: "کاردانی" },
  { value: "karshenasi", label: "کارشناسی" },
  { value: "arshad", label: "کارشناسی ارشد" },
  { value: "doctora", label: "دکترا" },
  { value: "other", label: "سایر" },
];

const formConfigs: Record<PersonFormVariant, FormConfig> = {
  personnel: {
    title: "ثبت پرسنل جدید",
    description: "اطلاعات پرسنلی را ثبت یا بروزرسانی کنید.",
    api: "/api/employees",
    schema: personnelSchema,
    defaultValues: {
      personnel_code: "",
      first_name: "",
      last_name: "",
      national_id: "",
      birth_date: "",
      gender: undefined,
      mobile_phone: "",
      email: "",
      position: "",
      department: undefined,
      unit: "",
      education_level: undefined,
      insurance_history: "",
      hire_date: "",
      address: "",
    },
    duplicateChecks: [
      { name: "personnel_code", queryKey: "personnel_code" },
      { name: "email", queryKey: "email" },
      { name: "national_id", queryKey: "national_id" },
    ],
    fields: [
      { name: "personnel_code", label: "کد پرسنلی", required: true },
      { name: "first_name", label: "نام", required: true },
      { name: "last_name", label: "نام خانوادگی", required: true },
      { name: "national_id", label: "کد ملی", required: true },
      { name: "mobile_phone", label: "شماره تماس", placeholder: "۰۹۱۲...", type: "text" },
      { name: "email", label: "ایمیل", type: "email", placeholder: "name@example.com" },
      {
        name: "department",
        label: "دپارتمان",
        type: "select",
        required: true,
        options: [
          { value: "hr", label: "منابع انسانی" },
          { value: "it", label: "فناوری اطلاعات" },
          { value: "finance", label: "مالی" },
          { value: "operations", label: "عملیات" },
        ],
      },
      { name: "unit", label: "واحد / گروه" },
      { name: "position", label: "سمت" },
      { name: "birth_date", label: "تاریخ تولد", type: "date", required: true },
      { name: "gender", label: "جنسیت", type: "select", required: true, options: genderOptions },
      {
        name: "education_level",
        label: "مدرک تحصیلی",
        type: "select",
        required: true,
        options: educationOptions,
      },
      { name: "insurance_history", label: "سوابق بیمه", placeholder: "مثلا ۵ سال" },
      { name: "hire_date", label: "تاریخ استخدام", type: "date", required: true },
    ],
    excel: {
      downloadTemplate: downloadPersonnelTemplate,
      parseRow: (row, setValue) => {
        setValue("unit", row[1] || "");
        setValue("personnel_code", row[2] || "");
        const fullName = (row[3] as string) || "";
        const parts = fullName.split(" ");
        setValue("first_name", parts[0] || "");
        setValue("last_name", parts.slice(1).join(" ") || "");
        setValue("position", row[4] || "");
        setValue("national_id", row[5] || "");
        setValue("education_level", getEducationLevel((row[7] as string) || ""));
        setValue("insurance_history", row[8] || "");
        setValue("hire_date", formatDate((row[9] as string) || ""));
      },
    },
  },
  driver: {
    title: "ثبت راننده جدید",
    description: "مشخصات راننده و اطلاعات گواهینامه را وارد کنید.",
    api: "/api/drivers",
    schema: driverSchema,
    defaultValues: {
      driver_code: "",
      first_name: "",
      last_name: "",
      national_id: "",
      birth_date: "",
      gender: undefined,
      mobile_phone: "",
      email: "",
      license_number: "",
      license_issue_date: "",
      license_expiry_date: "",
      vehicle_plate: "",
      address: "",
      hire_date: "",
      insurance_history: "",
      education_level: undefined,
    },
    duplicateChecks: [
      { name: "driver_code", queryKey: "driver_code" },
      { name: "email", queryKey: "email" },
      { name: "national_id", queryKey: "national_id" },
      { name: "license_number", queryKey: "license_number" },
    ],
    fields: [
      { name: "driver_code", label: "کد راننده", required: true },
      { name: "first_name", label: "نام", required: true },
      { name: "last_name", label: "نام خانوادگی", required: true },
      { name: "national_id", label: "کد ملی", required: true },
      { name: "mobile_phone", label: "شماره تماس", placeholder: "۰۹۱۲...", type: "text", required: true },
      { name: "email", label: "ایمیل", type: "email", placeholder: "name@example.com" },
      { name: "birth_date", label: "تاریخ تولد", type: "date", required: true },
      { name: "gender", label: "جنسیت", type: "select", required: true, options: genderOptions },
      { name: "license_number", label: "شماره گواهینامه", required: true },
      { name: "license_issue_date", label: "تاریخ صدور گواهینامه", type: "date", required: true },
      { name: "license_expiry_date", label: "تاریخ انقضا گواهینامه", type: "date", required: true },
      { name: "vehicle_plate", label: "پلاک خودرو", required: true },
      { name: "address", label: "آدرس", colSpan: "md:col-span-2 lg:col-span-3" },
      { name: "hire_date", label: "تاریخ شروع همکاری", type: "date", required: true },
      {
        name: "education_level",
        label: "مدرک تحصیلی",
        type: "select",
        required: true,
        options: educationOptions,
      },
      { name: "insurance_history", label: "سوابق بیمه", placeholder: "مثلا ۳ سال" },
    ],
    excel: {
      downloadTemplate: downloadDriverTemplate,
      parseRow: (row, setValue) => {
        setValue("driver_code", row[2] || "");
        const fullName = (row[3] as string) || "";
        const parts = fullName.split(" ");
        setValue("first_name", parts[0] || "");
        setValue("last_name", parts.slice(1).join(" ") || "");
        setValue("national_id", row[5] || "");
        setValue("education_level", getEducationLevel((row[7] as string) || ""));
        setValue("insurance_history", row[8] || "");
        setValue("hire_date", formatDate((row[9] as string) || ""));
      },
    },
  },
};

type PersonFormProps = {
  variant?: PersonFormVariant;
};

export function PersonForm({ variant = "personnel" }: PersonFormProps) {
  const config = formConfigs[variant];
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setFocus,
  } = useForm<CombinedFormData>({
    resolver: zodResolver(config.schema as any) as any,
    defaultValues: config.defaultValues as CombinedFormData,
  });

  const [dupState, setDupState] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<"ok" | "err" | null>(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"Manual" | "Excel">("Manual");
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const formValues = watch();
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const dupChecksMap = useMemo(() => new Map(config.duplicateChecks.map((c) => [c.name, c.queryKey])), [config.duplicateChecks]);

  useGSAP(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, { y: -12, opacity: 0, duration: 0.35, ease: "power2.out" });
    }
    gsap.from(".person-form-field", {
      y: 12,
      opacity: 0,
      stagger: 0.04,
      duration: 0.25,
      ease: "power2.out",
    });
    if (buttonRef.current) {
      gsap.from(buttonRef.current, { scale: 0.98, opacity: 0, duration: 0.25, ease: "power2.out" });
    }
  }, { scope: containerRef });

  useEffect(() => {
    const firstField = config.fields[0]?.name;
    if (firstField) setFocus(firstField as any);
  }, [config.fields, setFocus]);

  const dupBlocked = useMemo(
    () => config.duplicateChecks.some((c) => dupState[c.name] === true),
    [config.duplicateChecks, dupState]
  );

  const canSubmit = useMemo(
    () => Object.keys(errors).length === 0 && !dupBlocked,
    [errors, dupBlocked]
  );

  const runDupCheck = async (fieldName: keyof CombinedFormData) => {
    const queryKey = dupChecksMap.get(fieldName);
    if (!queryKey) return;
    const value = formValues[fieldName];
    if (!value || `${value}`.trim() === "") {
      setDupState((prev) => ({ ...prev, [fieldName]: null }));
      return;
    }
    try {
      const res = await fetch(`${config.api}?${queryKey}=${encodeURIComponent(String(value))}`, { cache: "no-store" });
      if (!res.ok) {
        setDupState((prev) => ({ ...prev, [fieldName]: null }));
        return;
      }
      const data = await res.json();
      setDupState((prev) => ({ ...prev, [fieldName]: Array.isArray(data) ? data.length > 0 : false }));
    } catch {
      setDupState((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const onSubmit = async (data: CombinedFormData) => {
    setSubmitted(null);
    setMessage("");
    if (dupBlocked) {
      setSubmitted("err");
      setMessage("برخی مقادیر تکراری هستند.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(config.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted("ok");
      setMessage("ثبت با موفقیت انجام شد.");
      reset(config.defaultValues as CombinedFormData);
      setDupState({});
      setMode("Manual");
    } catch (err: any) {
      setSubmitted("err");
      setMessage(err?.message || "خطا در ثبت اطلاعات.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus("در حال خواندن فایل...");
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      const wb = XLSX.read(data, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const row = json[2] as (string | number | undefined)[];
      if (row) {
        config.excel.parseRow(row, setValue);
        setMode("Excel");
        setUploadStatus("ورود اطلاعات از اکسل انجام شد.");
      } else {
        setUploadStatus("سطر داده‌ای در فایل یافت نشد.");
      }
    };
    reader.onerror = () => setUploadStatus("خطا در خواندن فایل.");
    reader.readAsBinaryString(file);
  };

  const renderField = (field: FieldConfig) => {
    const error = errors[field.name as keyof typeof errors];
    const dup = dupState[field.name as string];
    const commonProps = {
      id: field.name as string,
      className: "person-form-field",
    };

    const registerOptions = dupChecksMap.has(field.name)
      ? { onBlur: () => runDupCheck(field.name) }
      : undefined;

    if (field.type === "select") {
      return (
        <div
          key={field.name as string}
          className={`space-y-1 ${field.colSpan ?? "md:col-span-1"}`}
        >
          <label htmlFor={field.name as string} className="text-sm font-medium text-foreground">
            {field.label} {field.required ? "*" : ""}
          </label>
          <select
            {...register(field.name as any, registerOptions)}
            {...commonProps}
            defaultValue=""
            className="h-10 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--input-fg)] outline-none ring-0 placeholder:text-[var(--input-muted)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
          >
            <option value="" disabled>
              انتخاب کنید
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {dup === true && <p className="text-xs text-amber-600">این مقدار قبلا ثبت شده است.</p>}
          {error && <p className="text-xs text-destructive">{(error as any).message}</p>}
        </div>
      );
    }

    return (
      <div
        key={field.name as string}
        className={`space-y-1 ${field.colSpan ?? "md:col-span-1"}`}
      >
        <label htmlFor={field.name as string} className="text-sm font-medium text-foreground">
          {field.label} {field.required ? "*" : ""}
        </label>
        <Input
          {...register(field.name as any, registerOptions)}
          {...commonProps}
          type={field.type ?? "text"}
          placeholder={field.placeholder}
          dir="rtl"
        />
        {dup === true && <p className="text-xs text-amber-600">این مقدار قبلا ثبت شده است.</p>}
        {error && <p className="text-xs text-destructive">{(error as any).message}</p>}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="w-full rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm"
    >
      <div ref={headerRef} className="mb-6 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            حالت ورودی: {mode}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {config.fields.map(renderField)}

        <div className="person-form-field col-span-full flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border/80 bg-background/60 p-4">
          <Button type="button" variant="outline" size="sm" onClick={config.excel.downloadTemplate}>
            دانلود تمپلیت اکسل
          </Button>
          <label className="text-sm text-muted-foreground">
            ورود از اکسل:
            <input type="file" accept=".xlsx,.xls" className="ml-2 text-xs" onChange={handleFileUpload} />
          </label>
          {uploadStatus && <span className="text-xs text-muted-foreground">{uploadStatus}</span>}
        </div>

        <div className="col-span-full flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset(config.defaultValues as CombinedFormData)}
            disabled={loading}
          >
            پاک کردن فرم
          </Button>
          <Button ref={buttonRef} type="submit" disabled={!canSubmit || loading}>
            {loading ? "در حال ارسال..." : "ثبت اطلاعات"}
          </Button>
        </div>
      </form>

      {submitted && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            submitted === "ok"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-destructive/50 bg-destructive/10 text-destructive"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

function downloadPersonnelTemplate() {
  const wb = XLSX.utils.book_new();
  const header = [
    "واحد (A)",
    "دپارتمان",
    "کد پرسنلی",
    "نام و نام خانوادگی",
    "سمت",
    "کد ملی",
    "کد بیمه",
    "مدرک تحصیلی",
    "سوابق بیمه",
    "تاریخ استخدام (YYYY-MM-DD)",
  ];
  const sample = [
    "عملیات",
    "فاوا",
    "120045",
    "علی رضایی",
    "کارشناس شبکه",
    "1234567890",
    "ABC-778899",
    "کارشناسی",
    "5 سال",
    "2024-06-01",
  ];
  const data = [header, sample, ["- سطر سوم را می‌توانید برای یادداشت نگه دارید -"]];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "PersonnelTemplate");
  XLSX.writeFile(wb, "SARIR_Personnel_Template.xlsx");
}

function downloadDriverTemplate() {
  const wb = XLSX.utils.book_new();
  const header = [
    "ردیف (A)",
    "کد راننده",
    "فیلد رزرو شده",
    "نام و نام خانوادگی",
    "ستون رزرو شده",
    "کد ملی",
    "ستون رزرو شده",
    "مدرک تحصیلی",
    "سوابق بیمه",
    "تاریخ شروع همکاری (YYYY-MM-DD)",
  ];
  const sample = ["", "D001", "", "علی رضایی", "", "1234567890", "", "کارشناسی", "3 سال", "2024-06-01"];
  const data = [header, sample, ["- سطر سوم برای یادداشت است -"]];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "DriverTemplate");
  XLSX.writeFile(wb, "SARIR_Driver_Template.xlsx");
}

function getEducationLevel(
  level: string
): "diplom" | "kardani" | "karshenasi" | "arshad" | "doctora" | "other" | "" {
  switch (level) {
    case "دیپلم":
      return "diplom";
    case "کاردانی":
      return "kardani";
    case "کارشناسی":
      return "karshenasi";
    case "کارشناسی ارشد":
      return "arshad";
    case "دکترا":
      return "doctora";
    default:
      return "other";
  }
}

function formatDate(date: string): string {
  return date.length === 4 ? `${date}-01-01` : date;
}

export default PersonForm;
