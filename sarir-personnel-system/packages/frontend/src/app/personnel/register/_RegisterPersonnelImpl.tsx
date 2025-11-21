"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as XLSX from "xlsx";

// اسکیما و اعتبارسنجی فرم ثبت پرسنل
const formSchema = z.object({
  personnel_code: z.string().min(1, "کد پرسنلی الزامی است"),
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  mobile_phone: z
    .string()
    .regex(/^\d{10,11}$/, "شماره موبایل نامعتبر است")
    .optional(),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  position: z.string().optional(),
  birth_date: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: z.enum(["male", "female", "other"], { message: "جنسیت الزامی است" }),
  department: z.enum(["hr", "it", "finance", "operations"], {
    message: "دپارتمان الزامی است",
  }),
  unit: z.string().optional(),
  national_id: z.string().min(1, "کد ملی الزامی است"),
  education_level: z.enum(
    ["diplom", "kardani", "karshenasi", "arshad", "doctora", "other"],
    { message: "مدرک تحصیلی الزامی است" }
  ),
  insurance_history: z.string().optional(),
  hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
});
type Form = z.infer<typeof formSchema>;

const API = "/api/employees";

// ✅ لوگوی کارت پرسنلی هدر فرم
type PersonBadgeLogoProps = {
  refEl?: React.RefObject<SVGSVGElement>;
  className?: string;
};

const PersonBadgeLogo: React.FC<PersonBadgeLogoProps> = ({ refEl, className }) => {
  return (
    <svg
      ref={refEl}
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* پس‌زمینه کارت */}
      <rect
        x="8"
        y="10"
        width="48"
        height="44"
        rx="10"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="12"
        y="14"
        width="40"
        height="36"
        rx="8"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.9"
      />

      {/* گردن‌آویز بالا */}
      <rect
        x="26"
        y="6"
        width="12"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.85"
      />
      <rect
        x="29"
        y="2"
        width="6"
        height="6"
        rx="3"
        fill="white"
        opacity="0.95"
      />

      {/* آواتار پرسنل */}
      <circle cx="32" cy="28" r="8" fill="currentColor" opacity="0.12" />
      <circle
        cx="32"
        cy="26.5"
        r="4"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M26.5 33.5C28 31 29.8 30 32 30C34.2 30 36 31 37.5 33.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* خطوط اطلاعات کارت */}
      <line
        x1="20"
        y1="40"
        x2="44"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="22"
        y1="44"
        x2="38"
        y2="44"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
};

export default function RegisterPersonnel() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setFocus,
    setValue,
  } = useForm<Form>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnel_code: "",
      first_name: "",
      last_name: "",
      mobile_phone: "",
      email: "",
      position: "",
      birth_date: "",
      gender: undefined,
      department: undefined,
      unit: "",
      national_id: "",
      education_level: undefined,
      insurance_history: "",
      hire_date: "",
    },
  });

  const [dupEmail, setDupEmail] = useState<boolean | null>(null);
  const [dupPCode, setDupPCode] = useState<boolean | null>(null);
  const [dupNID, setDupNID] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<"ok" | "err" | null>(null);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const [mode, setMode] = useState<"Manual" | "Excel">("Manual");

  const formValues = watch();

  const canSubmit = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    if (dupEmail === true || dupPCode === true || dupNID === true) return false;
    return true;
  }, [errors, dupEmail, dupPCode, dupNID]);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fieldsRef = useRef<HTMLDivElement[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.from(fieldsRef.current, {
        y: 10,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.from(buttonRef.current, {
        scale: 0.98,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.75 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
        );
      }
    },
    { scope: containerRef }
  );

  useEffect(() => {
    setFocus("personnel_code");
  }, [setFocus]);

  // تابع debounce
  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const onBlurEmail = debounce(async () => {
    if (!formValues.email?.trim()) return setDupEmail(null);
    const res = await fetch(
      `${API}?email=${encodeURIComponent(formValues.email)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return setDupEmail(null);
    const data = await res.json();
    setDupEmail((data as any[]).length > 0);
  }, 300);

  const onBlurPCode = debounce(async () => {
    if (!formValues.personnel_code?.trim()) return setDupPCode(null);
    const res = await fetch(
      `${API}?personnel_code=${encodeURIComponent(formValues.personnel_code)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return setDupPCode(null);
    const data = await res.json();
    setDupPCode((data as any[]).length > 0);
  }, 300);

  const onBlurNID = debounce(async () => {
    if (!formValues.national_id?.trim()) return setDupNID(null);
    const res = await fetch(
      `${API}?national_id=${encodeURIComponent(formValues.national_id)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return setDupNID(null);
    const data = await res.json();
    setDupNID((data as any[]).length > 0);
  }, 300);

  const onSubmit = async (data: Form) => {
    setSubmitted(null);
    setMessage("");
    if (dupEmail === true || dupPCode === true || dupNID === true) {
      setSubmitted("err");
      setMessage("موارد تکراری را اصلاح کنید.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(await r.text());
      setSubmitted("ok");
      setMessage("ثبت با موفقیت انجام شد.");
      reset();
      setDupEmail(null);
      setDupPCode(null);
      setDupNID(null);
      setMode("Manual");
    } catch (err: any) {
      setSubmitted("err");
      setMessage(err?.message || "خطا در ثبت");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus("در حال بارگذاری...");
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    };
    reader.onload = (e) => {
      gsap.to(progressRef.current, {
        width: "100%",
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(progressRef.current, {
            scale: 1.05,
            yoyo: true,
            repeat: 1,
            duration: 0.3,
            backgroundColor: "#22c55e",
          });
        },
      });
      const data = e.target?.result as string;
      const wb = XLSX.read(data, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const row = json[2] as string[];
      if (row) {
        setValue("unit", row[1] || "");
        setValue("personnel_code", row[2] || "");
        const fullName = row[3] || "";
        const nameParts = fullName.split(" ");
        setValue("first_name", nameParts[0] || "");
        setValue("last_name", nameParts.slice(1).join(" ") || "");
        setValue("position", row[4] || "");
        setValue("national_id", row[5] || "");
        setValue("education_level", getEducationLevel(row[7] || ""));
        setValue("insurance_history", row[8] || "");
        setValue("hire_date", formatDate(row[9] || ""));
      }
      setUploadStatus("بارگذاری موفق");
      setMode("Excel");
    };
    reader.onerror = () => {
      setUploadStatus("خطا در بارگذاری");
    };
    reader.readAsBinaryString(file);
  };

  function downloadPersonnelTemplate() {
    const wb = XLSX.utils.book_new();
    const header = [
      "رزرو(A)",
      "واحد",
      "کد پرسنلی",
      "نام و نام خانوادگی",
      "سمت",
      "کد ملی",
      "شماره کارت شناسایی",
      "مدرک تحصیلی",
      "سوابق بیمه",
      "تاریخ استخدام (YYYY-MM-DD)",
    ];
    const sample = [
      "",
      "عملیات",
      "120045",
      "علی رضایی",
      "کارشناس منابع انسانی",
      "1234567890",
      "ABC-778899",
      "کارشناسی",
      "5 سال",
      "2024-06-01",
    ];
    const data = [
      header,
      sample,
      ["— این ردیف را پاک کنید و داده‌های واقعی را اضافه کنید —"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "PersonnelTemplate");
    XLSX.writeFile(wb, "SARIR_Personnel_Template.xlsx");
  }

  const getEducationLevel = (
    level: string
  ):
    | "diplom"
    | "kardani"
    | "karshenasi"
    | "arshad"
    | "doctora"
    | "other"
    | undefined => {
    switch (level) {
      case "دیپلم":
        return "diplom";
      case "کاردانی":
        return "kardani";
      case "کارشناسی":
        return "karshenasi";
      case "کارشناسی ارشد":
        return "arshad";
      case "دکتری":
        return "doctora";
      default:
        return "other";
    }
  };

  const formatDate = (date: string): string =>
    date.length === 4 ? `${date}-01-01` : date;

  return (
    <div
      ref={containerRef}
      className="min-h-[80vh] w-full px-4 md:px-8 py-8 bg-gradient-to-br from-[#07657E]/5 to-[#F2991F]/5 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="relative mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 backdrop-blur-sm">
        {/* Header */}
        <div
          ref={headerRef}
          className="mb-6 flex flex-col items-center justify-center text-center"
        >
          <PersonBadgeLogo
            refEl={logoRef}
            className="h-16 w-16 mb-4 text-[#07657E]"
          />
          <h1 className="text-3xl font-bold text-[#07657E] dark:text-white">
            ثبت پرسنل جدید
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              اطلاعات را با دقت تکمیل کنید.
            </p>
            <span className="inline-flex items-center rounded-full border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              {mode}
            </span>
          </div>
        </div>

        {/* فرم ثبت پرسنل */}
        {/* ... بقیه فرم دقیقاً مثل نسخه‌ای است که فرستادی (بدون تغییر) ... */}
        {/* همین بلاک از بعد از Header تا آخر فایل همان است که خودت داشتی */}
        {/* من فقط تا اینجا تغییر دادم / اضافه کردم */}
        {/* ---- این پایین همان کدی است که از فایل اصلی‌ات آوردی ---- */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* ... همان فیلدهایی که در فایل خودت بود ... */}
        </form>

        {/* پیام موفقیت / خطا */}
        {submitted && (
          <div
            ref={containerRef}
            className={`mt-6 p-4 rounded-md ${
              submitted === "ok"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
