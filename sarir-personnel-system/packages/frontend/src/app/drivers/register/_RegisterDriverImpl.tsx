"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { PlusIcon } from "@heroicons/react/24/solid";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";

/* Animations */
const rise = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const inputVariants = {
  rest: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  focus: {
    scale: 1.02,
    boxShadow: "0 0 8px rgba(7,101,126,0.5)",
    transition: { duration: 0.3 },
  },
  error: { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } },
};

const formSchema = z.object({
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  national_id: z.string().min(10, "کد ملی باید حداقل ۱۰ رقم باشد"),
  date_of_birth: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: z.enum(["male", "female", "other"], { message: "جنسیت الزامی است" }),
  phone: z.string().regex(/^\d{10,11}$/, "شماره موبایل نامعتبر است"),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  license_number: z.string().min(1, "شماره گواهینامه الزامی است"),
  license_expiry: z.string().min(1, "تاریخ انقضای گواهینامه الزامی است"),
  vehicle_type: z.string().min(1, "نوع خودرو الزامی است"),
  address: z.string().optional(),
  hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
  insurance_history: z.string().optional(),
  education_level: z.enum(
    ["diplom", "kardani", "karshenasi", "arshad", "doctora", "other"],
    { message: "مدرک تحصیلی الزامی است" }
  ),
});
type FormData = z.infer<typeof formSchema>;

const API = "/api/drivers";

export default function RegisterDriverImpl() {
  const [expanded, setExpanded] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [dupEmail, setDupEmail] = useState<boolean | null>(null);
  const [dupNationalId, setDupNationalId] = useState<boolean | null>(null);
  const [dupLicense, setDupLicense] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<null | "ok" | "err">(null);
  const [message, setMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // گام ۲: Badge پویا Manual ⇄ Excel
  const [mode, setMode] = useState<"Manual" | "Excel">("Manual");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setFocus,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const formValues = watch();

  const canSubmit = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    if (dupEmail === true || dupNationalId === true || dupLicense === true) return false;
    return true;
  }, [errors, dupEmail, dupNationalId, dupLicense]);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

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
    },
    { scope: containerRef }
  );

  useEffect(() => {
    setFocus("first_name");
  }, [setFocus]);

  useEffect(() => {
    if (submitted && messageRef.current) {
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [submitted]);

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

  const onBlurNationalId = debounce(async () => {
    if (!formValues.national_id?.trim()) return setDupNationalId(null);
    const res = await checkDuplicate({ national_id: formValues.national_id });
    setDupNationalId(res.length > 0);
  }, 300);

  const onBlurLicense = debounce(async () => {
    if (!formValues.license_number?.trim()) return setDupLicense(null);
    const res = await checkDuplicate({ license_number: formValues.license_number });
    setDupLicense(res.length > 0);
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

  const onSubmit = async (data: FormData) => {
    setSubmitted(null);
    setMessage("");
    if (dupEmail === true || dupNationalId === true || dupLicense === true) {
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
      setDupNationalId(null);
      setDupLicense(null);
      // گام ۲: بعد از ثبت → Manual
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
    gsap.to(statusRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        if (statusRef.current) statusRef.current.textContent = "در حال بارگذاری...";
        gsap.to(statusRef.current, { opacity: 1, duration: 0.3 });
      },
    });

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded * 100) / e.total);
        setUploadProgress(progress);
        gsap.to(progressRef.current, {
          width: `${progress}%`,
          duration: 0.5,
          ease: "power2.out",
        });
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
      const row = json[2] as string[]; // First data row
      if (row) {
        const fullName = row[3] || "";
        const nameParts = fullName.split(" ");
        setValue("first_name", nameParts[0] || "");
        setValue("last_name", nameParts.slice(1).join(" ") || "");
        setValue("national_id", row[5] || "");
        setValue("education_level", getEducationLevel(row[7] || ""));
        setValue("insurance_history", row[8] || "");
        setValue("hire_date", formatDate(row[9] || ""));
      }
      setUploadStatus("بارگذاری موفق");
      gsap.to(statusRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (statusRef.current) statusRef.current.textContent = "بارگذاری موفق";
          gsap.to(statusRef.current, {
            opacity: 1,
            duration: 0.3,
            color: "#22c55e",
          });
        },
      });
      // گام ۲: آپلود موفق → Excel
      setMode("Excel");
    };
    reader.onerror = () => {
      setUploadStatus("خطا در بارگذاری");
      gsap.to(statusRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (statusRef.current) statusRef.current.textContent = "خطا در بارگذاری";
          gsap.to(statusRef.current, {
            opacity: 1,
            duration: 0.3,
            color: "#ef4444",
          });
        },
      });
      gsap.to(progressRef.current, { backgroundColor: "#ef4444", duration: 0.3 });
    };
    reader.readAsBinaryString(file);
  };

  // گام ۲: دانلود قالب اکسل درایورها (ستون‌ها مطابق ایندکس‌هایی که الان می‌خوانی: D,F,H,I,J)
  function downloadDriverTemplate() {
    const wb = XLSX.utils.book_new();
    const header = [
      "رزرو(A)",                  // A
      "رزرو(B)",                  // B
      "رزرو(C)",                  // C
      "نام و نام خانوادگی",       // D -> row[3]
      "رزرو(E)",                  // E
      "کد ملی",                   // F -> row[5]
      "رزرو(G)",                  // G
      "مدرک تحصیلی",              // H -> row[7]
      "سوابق بیمه",               // I -> row[8]
      "تاریخ استخدام (YYYY-MM-DD)", // J -> row[9]
    ];
    const sample = ["", "", "", "مهدی محمدی", "", "1234567890", "", "کارشناسی", "3 سال", "2024-06-01"];
    const data = [header, sample, ["— این ردیف را پاک کنید و داده‌های واقعی را اضافه کنید —"]];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "DriverTemplate");
    XLSX.writeFile(wb, "SARIR_Driver_Template.xlsx");
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

  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  return (
    <div
      ref={containerRef}
      className="min-h-[80vh] w-full px-4 md:px-8 py-8 bg-gradient-to-br from-[#07657E]/5 to-[#F2991F]/5 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="relative mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 backdrop-blur-sm">
        {/* Header – وسط + لوگو + BADGE */}
        <motion.div
          ref={headerRef}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col items-center justify-center text-center"
        >
          <TruckLogo className="h-16 w-16 mb-4 text-[#07657E]" />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#07657E] dark:text-white">
              ثبت راننده جدید
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">اطلاعات را با دقت تکمیل کنید.</p>
              <span className="inline-flex items-center rounded-full border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                {mode}
              </span>
            </div>
          </div>
        </motion.div>

        {/* نوار ابزار: دانلود قالب اکسل */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            فایل اکسل استاندارد را دانلود کنید یا فایل خود را آپلود کنید:
          </label>
          <button
            type="button"
            onClick={downloadDriverTemplate}
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
            <p ref={statusRef} className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="p-6"
        >
          <div ref={(el) => el && fieldsRef.current.push(el)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium">نام *</label>
              <input
                {...register("first_name")}
                onFocus={() => handleFocus("first_name")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
                placeholder="نام"
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">نام خانوادگی *</label>
              <input
                {...register("last_name")}
                onFocus={() => handleFocus("last_name")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
                placeholder="نام خانوادگی"
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">کد ملی *</label>
              <input
                {...register("national_id")}
                onFocus={() => handleFocus("national_id")}
                onBlur={() => {
                  handleBlur();
                  onBlurNationalId();
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
              {errors.national_id && (
                <p className="mt-1 text-xs text-red-600">{errors.national_id.message}</p>
              )}
              {dupNationalId === true && (
                <p className="mt-1 text-xs text-orange-600">کد ملی تکراری است.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">تاریخ تولد *</label>
              <input
                type="date"
                {...register("date_of_birth")}
                onFocus={() => handleFocus("date_of_birth")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">جنسیت *</label>
              <select
                {...register("gender")}
                onFocus={() => handleFocus("gender")}
                onBlur={handleBlur}
                defaultValue=""
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
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

            <div>
              <label className="mb-1 block text-sm font-medium">شماره موبایل *</label>
              <input
                {...register("phone")}
                onFocus={() => handleFocus("phone")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
                placeholder="09xxxxxxxxx"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">ایمیل</label>
              <input
                {...register("email")}
                onFocus={() => handleFocus("email")}
                onBlur={() => {
                  handleBlur();
                  onBlurEmail();
                }}
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

            <div>
              <label className="mb-1 block text-sm font-medium">شماره گواهینامه *</label>
              <input
                {...register("license_number")}
                onFocus={() => handleFocus("license_number")}
                onBlur={() => {
                  handleBlur();
                  onBlurLicense();
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
              {errors.license_number && (
                <p className="mt-1 text-xs text-red-600">{errors.license_number.message}</p>
              )}
              {dupLicense === true && (
                <p className="mt-1 text-xs text-orange-600">شماره گواهینامه تکراری است.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">تاریخ انقضای گواهینامه *</label>
              <input
                type="date"
                {...register("license_expiry")}
                onFocus={() => handleFocus("license_expiry")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
              {errors.license_expiry && (
                <p className="mt-1 text-xs text-red-600">{errors.license_expiry.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">نوع خودرو *</label>
              <input
                {...register("vehicle_type")}
                onFocus={() => handleFocus("vehicle_type")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
              {errors.vehicle_type && (
                <p className="mt-1 text-xs text-red-600">{errors.vehicle_type.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">آدرس</label>
              <input
                {...register("address")}
                onFocus={() => handleFocus("address")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">تاریخ استخدام *</label>
              <input
                type="date"
                {...register("hire_date")}
                onFocus={() => handleFocus("hire_date")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
              {errors.hire_date && (
                <p className="mt-1 text-xs text-red-600">{errors.hire_date.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">سوابق بیمه</label>
              <input
                {...register("insurance_history")}
                onFocus={() => handleFocus("insurance_history")}
                onBlur={handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="mb-1 block text-sm font-medium">مدرک تحصیلی *</label>
              <select
                {...register("education_level")}
                onFocus={() => handleFocus("education_level")}
                onBlur={handleBlur}
                defaultValue=""
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
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
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={!canSubmit || loading}
            className="mt-6 w-full rounded-md bg-gradient-to-r from-[#07657E] to-[#F2991F] px-6 py-3 text-white font-medium shadow-sm hover:brightness-105 transition-all disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "ثبت اطلاعات"}
          </button>
        </motion.section>

        {submitted && (
          <div
            ref={messageRef}
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

function TruckLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M6 22h28v18H6z" stroke="currentColor" strokeWidth="2" />
      <path d="M34 26h10l8 8v6H34V26Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="46" r="5" stroke="currentColor" strokeWidth="2" fill="white" />
      <circle cx="44" cy="46" r="5" stroke="currentColor" strokeWidth="2" fill="white" />
      <path d="M6 40h46" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
