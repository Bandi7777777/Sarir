// _RegisterPersonnelImpl.tsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as XLSX from "xlsx";

const formSchema = z.object({
  emp_code: z.string().min(1, "کد پرسنلی الزامی است"),
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  phone: z.string().regex(/^\d{10,11}$/, "شماره موبایل نامعتبر است").optional(),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  position: z.string().optional(),
  date_of_birth: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: z.enum(["male", "female", "other"], { message: "جنسیت الزامی است" }),
  department: z.enum(["hr", "it", "finance", "operations"], { message: "دپارتمان الزامی است" }),
  password: z.string().min(8, "حداقل 8 کاراکتر"),
  confirm_password: z.string(),
  unit: z.string().optional(),
  national_id: z.string().min(1, "کد ملی الزامی است"),
  id_card_number: z.string().optional(),
  education_level: z.enum(["diplom", "kardani", "karshenasi", "arshad", "doctora", "other"], { message: "مدرک تحصیلی الزامی است" }),
  insurance_history: z.string().optional(),
  hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
}).refine((data) => data.password === data.confirm_password, {
  message: "رمز عبور مطابقت ندارد",
  path: ["confirm_password"],
});

type Form = z.infer<typeof formSchema>;

const API = "/api/employees";

export default function RegisterPersonnel() {
  const { register, handleSubmit, formState: { errors }, reset, watch, setFocus, setValue } = useForm<Form>({
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

  const formValues = watch();

  const canSubmit = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    if (dupEmail === true || dupPCode === true) return false;
    return true;
  }, [errors, dupEmail, dupPCode]);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fieldsRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: "power2.out" });

    gsap.from(fieldsRef.current, { y: 10, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });

    gsap.from(buttonRef.current, { scale: 0.98, opacity: 0, duration: 0.3, ease: "power2.out" });
  }, { scope: containerRef });

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
    } catch (err: any) {
      setSubmitted("err");
      setMessage(err?.message || "خطا در ثبت");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadStatus("در حال بارگذاری...");
      setUploadProgress(0);

      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      };
      reader.onload = (e) => {
        setUploadProgress(100);
        const data = e.target?.result as string;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Process data from row 2 onwards (index 1 is headers, index 2 is first data)
        const row = jsonData[2] as string[]; // First data row
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
      };
      reader.onerror = () => {
        setUploadStatus("خطا در بارگذاری");
      };
      reader.readAsBinaryString(file);
    }
  };

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

  const formatDate = (date: string): string => {
    if (date.length === 4) {
      return `${date}-01-01`;
    }
    return date;
  };

  return (
    <div ref={containerRef} className="min-h-[80vh] w-full px-4 md:px-8 py-8 bg-gradient-to-br from-[#07657E]/5 to-[#F2991F]/5 dark:from-gray-900 dark:to-gray-800">
      <div className="relative mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 backdrop-blur-sm">
        <header ref={headerRef} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#07657E] dark:text-white">ثبت پرسنل جدید</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">اطلاعات را با دقت تکمیل کنید.</p>
          </div>
        </header>

        <div className="mb-8">
          <label htmlFor="excel_upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">آپلود فایل اکسل</label>
          <input
            id="excel_upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E] cursor-pointer"
          />
          {uploadStatus && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{uploadStatus}</p>}
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div className="h-2 bg-gradient-to-r from-[#07657E] to-[#F2991F] rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning={true} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div ref={(el) => (fieldsRef.current[0] = el!)}>
            <label htmlFor="emp_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد پرسنلی *</label>
            <input
              id="emp_code"
              {...register("emp_code")}
              onBlur={onBlurPCode}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="مثلاً 120045"
            />
            {errors.emp_code && <p className="mt-1 text-xs text-red-600">{errors.emp_code.message}</p>}
            {dupPCode === true && <p className="mt-1 text-xs text-orange-600">کد پرسنلی تکراری است.</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[1] = el!)}>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام *</label>
            <input
              id="first_name"
              {...register("first_name")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="نام"
            />
            {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[2] = el!)}>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام خانوادگی *</label>
            <input
              id="last_name"
              {...register("last_name")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="نام خانوادگی"
            />
            {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[3] = el!)}>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره موبایل</label>
            <input
              id="phone"
              {...register("phone")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="مثلاً 09xxxxxxxxx"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[4] = el!)}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل</label>
            <input
              id="email"
              {...register("email")}
              onBlur={onBlurEmail}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E] ltr:text-left"
              placeholder="name@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            {dupEmail === true && <p className="mt-1 text-xs text-orange-600">ایمیل تکراری است.</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[5] = el!)}>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سمت</label>
            <input
              id="position"
              {...register("position")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="مثلاً مدیر سیر و حرکت"
            />
          </div>

          <div ref={(el) => (fieldsRef.current[6] = el!)}>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ تولد *</label>
            <input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
            />
            {errors.date_of_birth && <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[7] = el!)}>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جنسیت *</label>
            <select
              id="gender"
              {...register("gender")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
            >
              <option value="">انتخاب کنید</option>
              <option value="male">مرد</option>
              <option value="female">زن</option>
              <option value="other">سایر</option>
            </select>
            {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[8] = el!)}>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">دپارتمان *</label>
            <select
              id="department"
              {...register("department")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
            >
              <option value="">انتخاب کنید</option>
              <option value="hr">منابع انسانی</option>
              <option value="it">فناوری اطلاعات</option>
              <option value="finance">مالی</option>
              <option value="operations">عملیات</option>
            </select>
            {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[9] = el!)}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور *</label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="حداقل 8 کاراکتر"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[10] = el!)}>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تایید رمز عبور *</label>
            <input
              id="confirm_password"
              type="password"
              {...register("confirm_password")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="تکرار رمز عبور"
            />
            {errors.confirm_password && <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[11] = el!)}>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">واحد</label>
            <select
              id="unit"
              {...register("unit")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
            >
              <option value="">انتخاب کنید</option>
              <option value="مدیریت">مدیریت</option>
              <option value="مالی و اداری">مالی و اداری</option>
              <option value="بازرگانی و بازاریابی">بازرگانی و بازاریابی</option>
              <option value="مهندسی و ساخت">مهندسی و ساخت</option>
              <option value="برنامه ریزی و توسعه سیستم ها">برنامه ریزی و توسعه سیستم ها</option>
              <option value="نیرو و کشش">نیرو و کشش</option>
              <option value="سیر و حرکت">سیر و حرکت</option>
              <option value="ریلی معدن">ریلی معدن</option>
              <option value="عملیات جاده ای معدن چادرملو">عملیات جاده ای معدن چادرملو</option>
              <option value="عملیات ریلی گندله سازی اردکان">عملیات ریلی گندله سازی اردکان</option>
              <option value="پشتیبانی">پشتیبانی</option>
              <option value="راننده">راننده</option>
            </select>
            {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[12] = el!)}>
            <label htmlFor="national_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد ملی *</label>
            <input
              id="national_id"
              {...register("national_id")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="کد ملی"
            />
            {errors.national_id && <p className="mt-1 text-xs text-red-600">{errors.national_id.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[13] = el!)}>
            <label htmlFor="id_card_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره شناسنامه</label>
            <input
              id="id_card_number"
              {...register("id_card_number")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="شماره شناسنامه"
            />
            {errors.id_card_number && <p className="mt-1 text-xs text-red-600">{errors.id_card_number.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[14] = el!)}>
            <label htmlFor="education_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مدرک تحصیلی *</label>
            <select
              id="education_level"
              {...register("education_level")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
            >
              <option value="">انتخاب کنید</option>
              <option value="diplom">دیپلم</option>
              <option value="kardani">کاردانی</option>
              <option value="karshenasi">کارشناسی</option>
              <option value="arshad">کارشناسی ارشد</option>
              <option value="doctora">دکتری</option>
              <option value="other">سایر</option>
            </select>
            {errors.education_level && <p className="mt-1 text-xs text-red-600">{errors.education_level.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[15] = el!)}>
            <label htmlFor="insurance_history" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سوابق بیمه</label>
            <input
              id="insurance_history"
              {...register("insurance_history")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
              placeholder="سوابق بیمه"
            />
            {errors.insurance_history && <p className="mt-1 text-xs text-red-600">{errors.insurance_history.message}</p>}
          </div>

          <div ref={(el) => (fieldsRef.current[16] = el!)}>
            <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ استخدام *</label>
            <input
              id="hire_date"
              type="date"
              {...register("hire_date")}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-[#07657E] focus:ring-1 focus:ring-[#07657E] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-[#07657E] dark:focus:ring-[#07657E]"
            />
            {errors.hire_date && <p className="mt-1 text-xs text-red-600">{errors.hire_date.message}</p>}
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
          <div className="mt-6 p-4 rounded-md col-span-1 md:col-span-2 lg:col-span-3" className={submitted === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}