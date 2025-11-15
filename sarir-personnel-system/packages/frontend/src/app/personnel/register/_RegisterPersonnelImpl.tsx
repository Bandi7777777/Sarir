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
  mobile_phone: z.string().regex(/^\d{10,11}$/, "شماره موبایل نامعتبر است").optional(),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  position: z.string().optional(),
  birth_date: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: z.enum(["male", "female", "other"], { message: "جنسیت الزامی است" }),
  department: z.enum(["hr", "it", "finance", "operations"], { message: "دپارتمان الزامی است" }),
  unit: z.string().optional(),
  national_id: z.string().min(1, "کد ملی الزامی است"),
  education_level: z.enum(["diplom", "kardani", "karshenasi", "arshad", "doctora", "other"], { message: "مدرک تحصیلی الزامی است" }),
  insurance_history: z.string().optional(),
  hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
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

  // حالت ورود اطلاعات: "دستی" یا "اکسل"
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

  useGSAP(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: "power2.out" });
    gsap.from(fieldsRef.current, { y: 10, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
    gsap.from(buttonRef.current, { scale: 0.98, opacity: 0, duration: 0.3, ease: "power2.out" });
    if (logoRef.current) {
      gsap.fromTo(logoRef.current, { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
    }
  }, { scope: containerRef });

  useEffect(() => {
    setFocus("personnel_code");
  }, [setFocus]);

  // تابع ایجاد تاخیر (debounce) برای چک کردن مقادیر تکراری
  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // رویدادهای onBlur برای بررسی تکراری بودن ایمیل، کد پرسنلی و کد ملی
  const onBlurEmail = debounce(async () => {
    if (!formValues.email?.trim()) return setDupEmail(null);
    const res = await fetch(`${API}?email=${encodeURIComponent(formValues.email)}`, { cache: "no-store" });
    if (!res.ok) return setDupEmail(null);
    const data = await res.json();
    setDupEmail((data as any[]).length > 0);
  }, 300);

  const onBlurPCode = debounce(async () => {
    if (!formValues.personnel_code?.trim()) return setDupPCode(null);
    const res = await fetch(`${API}?personnel_code=${encodeURIComponent(formValues.personnel_code)}`, { cache: "no-store" });
    if (!res.ok) return setDupPCode(null);
    const data = await res.json();
    setDupPCode((data as any[]).length > 0);
  }, 300);

  const onBlurNID = debounce(async () => {
    if (!formValues.national_id?.trim()) return setDupNID(null);
    const res = await fetch(`${API}?national_id=${encodeURIComponent(formValues.national_id)}`, { cache: "no-store" });
    if (!res.ok) return setDupNID(null);
    const data = await res.json();
    setDupNID((data as any[]).length > 0);
  }, 300);

  // تابع ارسال فرم
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
      setMode("Manual"); // بازگشت به حالت دستی پس از ثبت موفق
    } catch (err: any) {
      setSubmitted("err");
      setMessage(err?.message || "خطا در ثبت");
    } finally {
      setLoading(false);
    }
  };

  // آپلود فایل اکسل و ثبت اطلاعات از فایل
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
        // ستون 6 (شماره کارت شناسایی) نادیده گرفته می‌شود
        setValue("education_level", getEducationLevel(row[7] || ""));
        setValue("insurance_history", row[8] || "");
        setValue("hire_date", formatDate(row[9] || ""));
      }
      setUploadStatus("بارگذاری موفق");
      setMode("Excel"); // پس از آپلود موفق، حالت ورود اطلاعات به Excel تغییر می‌کند
    };
    reader.onerror = () => {
      setUploadStatus("خطا در بارگذاری");
    };
    reader.readAsBinaryString(file);
  };

  // دانلود قالب اکسل پرسنل
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

  const getEducationLevel = (level: string): "diplom" | "kardani" | "karshenasi" | "arshad" | "doctora" | "other" | undefined => {
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
    <div ref={containerRef} className="min-h-[80vh] w-full px-4 md:px-8 py-8 bg-gradient-to-br from-[#07657E]/5 to-[#F2991F]/5 dark:from-gray-900 dark:to-gray-800">
      <div className="relative mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 backdrop-blur-sm">
        {/* Header */}
        <div ref={headerRef} className="mb-6 flex flex-col items-center justify-center text-center">
          <PersonBadgeLogo refEl={logoRef} className="h-16 w-16 mb-4 text-[#07657E]" />
          <h1 className="text-3xl font-bold text-[#07657E] dark:text-white">ثبت پرسنل جدید</h1>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">اطلاعات را با دقت تکمیل کنید.</p>
            <span className="inline-flex items-center rounded-full border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              {mode}
            </span>
          </div>
        </div>

        {/* فرم ثبت پرسنل */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">کد پرسنلی *</label>
            <input
              {...register("personnel_code")}
              onBlur={() => onBlurPCode()}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E] focus:outline-none"
              placeholder="مثلاً 120045"
            />
            {errors.personnel_code && (
              <p className="mt-1 text-xs text-red-600">{errors.personnel_code.message}</p>
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
              {...register("mobile_phone")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              placeholder="09xxxxxxxxx"
            />
            {errors.mobile_phone && (
              <p className="mt-1 text-xs text-red-600">{errors.mobile_phone.message}</p>
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

          <div ref={(el) => el && fieldsRef.current.push(el)}>
            <label className="mb-1 block text-sm font-medium">تاریخ تولد *</label>
            <input
              type="date"
              {...register("birth_date")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
            {errors.birth_date && (
              <p className="mt-1 text-xs text-red-600">{errors.birth_date.message}</p>
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

          {/* فیلدهای کلمه عبور حذف شدند */}

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
              onBlur={() => onBlurNID()}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            />
            {errors.national_id && (
              <p className="mt-1 text-xs text-red-600">{errors.national_id.message}</p>
            )}
            {dupNID === true && (
              <p className="mt-1 text-xs text-orange-600">کد ملی تکراری است.</p>
            )}
          </div>

          {/* فیلد شماره کارت شناسایی حذف شد */}

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
          <div ref={containerRef} className={`mt-6 p-4 rounded-md ${submitted === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
