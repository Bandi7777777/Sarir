"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as XLSX from "xlsx";

const formSchema = z
  .object({
    emp_code: z.string().min(1, "کد پرسنلی الزامی است"),
    first_name: z.string().min(1, "نام الزامی است"),
    last_name: z.string().min(1, "نام خانوادگی الزامی است"),
    phone: z
      .string()
      .regex(/^\d{10,11}$/, "شماره موبایل نامعتبر است")
      .optional(),
    email: z.string().email("ایمیل نامعتبر است").optional(),
    position: z.string().optional(),
    date_of_birth: z.string().min(1, "تاریخ تولد الزامی است"),
    gender: z.enum(["male", "female", "other"], { message: "جنسیت الزامی است" }),
    department: z.enum(["hr", "it", "finance", "operations"], {
      message: "دپارتمان الزامی است",
    }),
    password: z.string().min(8, "حداقل 8 کاراکتر"),
    confirm_password: z.string(),
    unit: z.string().optional(),
    national_id: z.string().min(1, "کد ملی الزامی است"),
    id_card_number: z.string().optional(),
    education_level: z.enum(
      ["diplom", "kardani", "karshenasi", "arshad", "doctora", "other"],
      { message: "مدرک تحصیلی الزامی است" }
    ),
    insurance_history: z.string().optional(),
    hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "رمز عبور مطابقت ندارد",
    path: ["confirm_password"],
  });

type Form = z.infer<typeof formSchema>;

const API = "/api/employees";

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
      emp_code: "",
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      position: "",
      date_of_birth: "",
      gender: undefined,
      department: undefined,
      password: "",
      confirm_password: "",
      unit: "",
      national_id: "",
      id_card_number: "",
      education_level: undefined,
      insurance_history: "",
      hire_date: "",
    },
  });

  const [dupEmail, setDupEmail] = useState<boolean | null>(null);
  const [dupPCode, setDupPCode] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<null | "ok" | "err">(null);
  const [message, setMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // گام ۲: Badge پویا Manual ⇄ Excel
  const [mode, setMode] = useState<"Manual" | "Excel">("Manual");

  const formValues = watch();

  const canSubmit = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    if (dupEmail === true || dupPCode === true) return false;
    return true;
  }, [errors, dupEmail, dupPCode]);

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
    setFocus("emp_code");
  }, [setFocus]);

  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const onBlurEmail = debounce(async () => {
    if (!formValues.email?.trim()) return setDupEmail(null);
    const res = await checkDuplicate({ email: formValues.email });
    setDupEmail(res.length > 0);
  }, 300);

  const onBlurPCode = debounce(async () => {
    if (!formValues.emp_code.trim()) return setDupPCode(null);
    const res = await checkDuplicate({ personnel_code: formValues.emp_code });
    setDupPCode(res.length > 0);
  }, 300);

  async function checkDuplicate(q: Record<string, string | undefined>) {
    const qs = Object.entries(q)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!.trim())}`)
      .join("&");
    if (!qs) return [];
    const r = await fetch(`${API}?${qs}`, { cache: "no-store" });
    if (!r.ok) return [];
    try {
      return (await r.json()) as any[];
    } catch {
      return [];
    }
  }

  const onSubmit = async (data: Form) => {
    setSubmitted(null);
    setMessage("");
    if (dupEmail === true || dupPCode === true) {
      setSubmitted("err");
      setMessage("موارد تکراری را اصلاح کنید.");
      return;
    }
    const { confirm_password, ...submitData } = data;
    setLoading(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      if (!r.ok) throw new Error(await r.text());
      setSubmitted("ok");
      setMessage("ثبت با موفقیت انجام شد.");
      reset();
      setDupEmail(null);
      setDupPCode(null);
      // گام ۲: بعد از ثبت، به حالت Manual برگرد
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
        setValue("emp_code", row[2] || "");
        const fullName = row[3] || "";
        const nameParts = fullName.split(" ");
        setValue("first_name", nameParts[0] || "");
        setValue("last_name", nameParts.slice(1).join(" ") || "");
        setValue("position", row[4] || "");
        setValue("national_id", row[5] || "");
        setValue("id_card_number", row[6] || "");
        setValue("education_level", getEducationLevel(row[7] || ""));
        setValue("insurance_history", row[8] || "");
        setValue("hire_date", formatDate(row[9] || ""));
      }
      setUploadStatus("بارگذاری موفق");
      // گام ۲: آپلود موفق → حالت Excel
      setMode("Excel");
    };
    reader.onerror = () => {
      setUploadStatus("خطا در بارگذاری");
    };
    reader.readAsBinaryString(file);
  };

  // گام ۲: دانلود قالب اکسل استاندارد (ستون‌ها مطابق همان ایندکس‌هایی که همین الان می‌خوانی)
  function downloadPersonnelTemplate() {
    const wb = XLSX.utils.book_new();
    const header = [
      "رزرو(A)",                         // A
      "واحد",                            // B -> row[1]
      "کد پرسنلی",                       // C -> row[2]
      "نام و نام خانوادگی",              // D -> row[3]
      "سمت",                             // E -> row[4]
      "کد ملی",                          // F -> row[5]
      "شماره کارت شناسایی",              // G -> row[6]
      "مدرک تحصیلی",                     // H -> row[7]
      "سوابق بیمه",                      // I -> row[8]
      "تاریخ استخدام (YYYY-MM-DD)",      // J -> row[9]
    ];
    const sample = [
      "", "عملیات", "120045", "علی رضایی", "کارشناس منابع انسانی",
      "1234567890", "ABC-778899", "کارشناسی", "5 سال", "2024-06-01",
    ];
    const data = [header, sample, ["— این ردیف را پاک کنید و داده‌های واقعی را اضافه کنید —"]];
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
        {/* Header – وسط + لوگو + BADGE */}
        <div
          ref={headerRef}
          className="mb-6 flex flex-col items-center justify-center text-center"
        >
          <PersonBadgeLogo refEl={logoRef} className="h-16 w-16 mb-4 text-[#07657E]" />
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

        {/* نوار ابزار کوچک: دانلود قالب اکسل */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            فایل اکسل استاندارد را دانلود کنید یا فایل خود را آپلود کنید:
          </label>
          <button
            type="button"
            onClick={downloadPersonnelTemplate}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-[#07657E] shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-white"
          >
            دانلود قالب اکسل
          </button>
        </div>

        {/* Upload Excel */}
        <div className="mb-8">
          <label
            htmlFor="excel_upload"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            آپلود فایل اکسل
          </label>
          <input
            id="excel_upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {uploadStatus && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {uploadStatus}
            </p>
          )}
          <div className="mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              ref={progressRef}
              className="bg-[#07657E] h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>

        {/* فرم — همه فیلدهای خودت حفظ شده */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          suppressHydrationWarning
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">کد پرسنلی *</label>
            <input
              {...register("emp_code")}
              onBlur={() => onBlurPCode()}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E] focus:outline-none"
              placeholder="مثلاً 120045"
            />
            {errors.emp_code && (
              <p className="mt-1 text-xs text-red-600">{errors.emp_code.message}</p>
            )}
            {dupPCode === true && (
              <p className="mt-1 text-xs text-orange-600">کد پرسنلی تکراری است.</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">نام *</label>
            <input
              {...register("first_name")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              placeholder="نام"
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">نام خانوادگی *</label>
            <input
              {...register("last_name")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              placeholder="نام خانوادگی"
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">شماره موبایل</label>
            <input
              {...register("phone")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              placeholder="09xxxxxxxxx"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">ایمیل</label>
            <input
              {...register("email")}
              onBlur={() => onBlurEmail()}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E] ltr"
              placeholder="name@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
            {dupEmail === true && (
              <p className="mt-1 text-xs text-orange-600">ایمیل تکراری است.</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">سمت</label>
            <input
              {...register("position")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              placeholder="مثلاً مدیر سیر و حرکت"
            />
          </div>

          {/* ... سایر فیلدهای خودت به‌صورت کامل حفظ شده ... */}

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">تاریخ تولد *</label>
            <input
              type="date"
              {...register("date_of_birth")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
            {errors.date_of_birth && (
              <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">جنسیت *</label>
            <select
              {...register("gender")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              defaultValue=""
            >
              <option value="" disabled>انتخاب کنید</option>
              <option value="male">مرد</option>
              <option value="female">زن</option>
              <option value="other">سایر</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">دپارتمان *</label>
            <select
              {...register("department")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              defaultValue=""
            >
              <option value="" disabled>انتخاب کنید</option>
              <option value="hr">منابع انسانی</option>
              <option value="it">فناوری اطلاعات</option>
              <option value="finance">مالی</option>
              <option value="operations">عملیات</option>
            </select>
            {errors.department && (
              <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">کلمه عبور *</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">تکرار کلمه عبور *</label>
            <input
              type="password"
              {...register("confirm_password")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">واحد</label>
            <input
              {...register("unit")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">کد ملی *</label>
            <input
              {...register("national_id")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
            {errors.national_id && (
              <p className="mt-1 text-xs text-red-600">{errors.national_id.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">شماره کارت شناسایی</label>
            <input
              {...register("id_card_number")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">مدرک تحصیلی *</label>
            <select
              {...register("education_level")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              defaultValue=""
            >
              <option value="" disabled>انتخاب کنید</option>
              <option value="diplom">دیپلم</option>
              <option value="kardani">کاردانی</option>
              <option value="karshenasi">کارشناسی</option>
              <option value="arshad">کارشناسی ارشد</option>
              <option value="doctora">دکتری</option>
              <option value="other">سایر</option>
            </select>
            {errors.education_level && (
              <p className="mt-1 text-xs text-red-600">{errors.education_level.message}</p>
            )}
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)} className="md:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-sm font-medium">سوابق بیمه</label>
            <input
              {...register("insurance_history")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
          </div>

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">تاریخ استخدام *</label>
            <input
              type="date"
              {...register("hire_date")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
            {errors.hire_date && (
              <p className="mt-1 text-xs text-red-600">{errors.hire_date.message}</p>
            )}
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={!canSubmit || loading}
            className="col-span-1 md:col-span-2 lg:col-span-3 w-full px-6 py-3 rounded-md bg-gradient-to-r from-[#07657E] to-[#F2991F] text-white font-medium shadow-sm hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "در حال ثبت..." : "ثبت اطلاعات"}
          </button>
        </form>

        {submitted && (
          <div
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

function PersonBadgeLogo({
  className = "",
  refEl,
}: {
  className?: string;
  refEl?: React.Ref<SVGSVGElement>;
}) {
  return (
    <svg ref={refEl} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3" y="2.5" width="18" height="19" rx="3" stroke="currentColor" strokeWidth="1.6" opacity=".45"/>
    </svg>
  );
}
