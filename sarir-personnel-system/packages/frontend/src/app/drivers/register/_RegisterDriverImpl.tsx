"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";

/* تنظیمات انیمیشن‌ها حذف شده برای اختصار */

const formSchema = z.object({
  driver_code: z.string().min(1, "کد راننده الزامی است"),
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  national_id: z.string().min(10, "کد ملی باید حداقل ۱۰ رقم باشد"),
  birth_date: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: z.enum(["male", "female", "other"], { message: "جنسیت الزامی است" }),
  mobile_phone: z.string().regex(/^\d{10,11}$/, "شماره موبایل نامعتبر است"),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  license_number: z.string().min(1, "شماره گواهینامه الزامی است"),
  license_issue_date: z.string().min(1, "تاریخ صدور گواهینامه الزامی است"),
  license_expiry_date: z.string().min(1, "تاریخ انقضای گواهینامه الزامی است"),
  vehicle_plate: z.string().min(1, "پلاک خودرو الزامی است"),
  address: z.string().optional(),
  hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
  insurance_history: z.string().optional(),
  education_level: z.enum(["diplom", "kardani", "karshenasi", "arshad", "doctora", "other"], { message: "مدرک تحصیلی الزامی است" }),
});
type FormData = z.infer<typeof formSchema>;

const API = "/api/drivers";

export default function RegisterDriverImpl() {
  const [expanded, setExpanded] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [dupCode, setDupCode] = useState<boolean | null>(null);
  const [dupEmail, setDupEmail] = useState<boolean | null>(null);
  const [dupNationalId, setDupNationalId] = useState<boolean | null>(null);
  const [dupLicense, setDupLicense] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<"ok" | "err" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // حالت ورود اطلاعات: "Manual" یا "Excel"
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
    if (dupEmail === true || dupNationalId === true || dupLicense === true || dupCode === true) return false;
    return true;
  }, [errors, dupEmail, dupNationalId, dupLicense, dupCode]);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: "power2.out" });
    gsap.from(fieldsRef.current, { y: 10, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
    gsap.from(buttonRef.current, { scale: 0.98, opacity: 0, duration: 0.3, ease: "power2.out" });
  }, { scope: containerRef });

  useEffect(() => {
    setFocus("driver_code");
  }, [setFocus]);

  useEffect(() => {
    if (submitted && messageRef.current) {
      gsap.fromTo(messageRef.current, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" });
    }
  }, [submitted]);

  // توابع debounce برای چک کردن تکراری بودن فیلدها
  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const onBlurCode = debounce(async () => {
    if (!formValues.driver_code?.trim()) return setDupCode(null);
    const res = await fetch(`${API}?driver_code=${encodeURIComponent(formValues.driver_code)}`, { cache: "no-store" });
    if (!res.ok) return setDupCode(null);
    const data = await res.json();
    setDupCode((data as any[]).length > 0);
  }, 300);

  const onBlurEmail = debounce(async () => {
    if (!formValues.email?.trim()) return setDupEmail(null);
    const res = await fetch(`${API}?email=${encodeURIComponent(formValues.email)}`, { cache: "no-store" });
    if (!res.ok) return setDupEmail(null);
    const data = await res.json();
    setDupEmail((data as any[]).length > 0);
  }, 300);

  const onBlurNationalId = debounce(async () => {
    if (!formValues.national_id?.trim()) return setDupNationalId(null);
    const res = await fetch(`${API}?national_id=${encodeURIComponent(formValues.national_id)}`, { cache: "no-store" });
    if (!res.ok) return setDupNationalId(null);
    const data = await res.json();
    setDupNationalId((data as any[]).length > 0);
  }, 300);

  const onBlurLicense = debounce(async () => {
    if (!formValues.license_number?.trim()) return setDupLicense(null);
    const res = await fetch(`${API}?license_number=${encodeURIComponent(formValues.license_number)}`, { cache: "no-store" });
    if (!res.ok) return setDupLicense(null);
    const data = await res.json();
    setDupLicense((data as any[]).length > 0);
  }, 300);

  // ارسال فرم ثبت راننده
  const onSubmit = async (data: FormData) => {
    setSubmitted(null);
    setMessage("");
    if (dupEmail === true || dupNationalId === true || dupLicense === true || dupCode === true) {
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
      setDupCode(null);
      setMode("Manual");
    } catch (err: any) {
      setSubmitted("err");
      setMessage(err?.message || "خطا در ثبت");
    } finally {
      setLoading(false);
    }
  };

  // آپلود فایل اکسل برای رانندگان
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
      const row = json[2] as string[]; // اولین ردیف داده‌ها
      if (row) {
        setValue("driver_code", row[2] || "");
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
          gsap.to(statusRef.current, { opacity: 1, duration: 0.3, color: "#22c55e" });
        },
      });
      setMode("Excel");
    };
    reader.onerror = () => {
      setUploadStatus("خطا در بارگذاری");
      gsap.to(statusRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (statusRef.current) statusRef.current.textContent = "خطا در بارگذاری";
          gsap.to(statusRef.current, { opacity: 1, duration: 0.3, color: "#ef4444" });
        },
      });
      gsap.to(progressRef.current, { backgroundColor: "#ef4444", duration: 0.3 });
    };
    reader.readAsBinaryString(file);
  };

  // دانلود قالب اکسل راننده‌ها
  function downloadDriverTemplate() {
    const wb = XLSX.utils.book_new();
    const header = [
      "رزرو(A)",       // A
      "کد راننده",     // B -> row[1]
      "رزرو(C)",       // C
      "نام و نام خانوادگی", // D -> row[3]
      "رزرو(E)",       // E
      "کد ملی",        // F -> row[5]
      "رزرو(G)",       // G
      "مدرک تحصیلی",   // H -> row[7]
      "سوابق بیمه",    // I -> row[8]
      "تاریخ استخدام (YYYY-MM-DD)", // J -> row[9]
    ];
    const sample = ["", "D001", "", "مهدی محمدی", "", "1234567890", "", "کارشناسی", "3 سال", "2024-06-01"];
    const data = [header, sample, ["— این ردیف را پاک کنید و داده‌های واقعی را اضافه کنید —"]];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "DriverTemplate");
    XLSX.writeFile(wb, "SARIR_Driver_Template.xlsx");
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
    <motion.section
      ref={containerRef}
      initial="hidden"
      animate="show"
      variants={stagger}
      className="min-h-[80vh] w-full px-4 md:px-8 py-8"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">کد راننده *</label>
          <input
            {...register("driver_code")}
            onBlur={() => onBlurCode()}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
            placeholder="مثلاً 110001"
          />
          {errors.driver_code && (
            <p className="mt-1 text-xs text-red-600">{errors.driver_code.message}</p>
          )}
          {dupCode === true && (
            <p className="mt-1 text-xs text-orange-600">کد راننده تکراری است.</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">نام *</label>
          <input
            {...register("first_name")}
            onFocus={() => setFocusedField("first_name")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
          {errors.first_name && (
            <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">نام خانوادگی *</label>
          <input
            {...register("last_name")}
            onFocus={() => setFocusedField("last_name")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
          {errors.last_name && (
            <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">کد ملی *</label>
          <input
            {...register("national_id")}
            onFocus={() => setFocusedField("national_id")}
            onBlur={() => {
              setFocusedField(null);
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

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">تاریخ تولد *</label>
          <input
            type="date"
            {...register("birth_date")}
            onFocus={() => setFocusedField("birth_date")}
            onBlur={() => setFocusedField(null)}
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
            onFocus={() => setFocusedField("gender")}
            onBlur={() => setFocusedField(null)}
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
          <label className="mb-1 block text-sm font-medium">شماره موبایل *</label>
          <input
            {...register("mobile_phone")}
            onFocus={() => setFocusedField("mobile_phone")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
          {errors.mobile_phone && (
            <p className="mt-1 text-xs text-red-600">{errors.mobile_phone.message}</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">ایمیل</label>
          <input
            {...register("email")}
            onFocus={() => setFocusedField("email")}
            onBlur={() => {
              setFocusedField(null);
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

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">شماره گواهینامه *</label>
          <input
            {...register("license_number")}
            onFocus={() => setFocusedField("license_number")}
            onBlur={() => {
              setFocusedField(null);
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

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">تاریخ صدور گواهینامه *</label>
          <input
            type="date"
            {...register("license_issue_date")}
            onFocus={() => setFocusedField("license_issue_date")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
          {errors.license_issue_date && (
            <p className="mt-1 text-xs text-red-600">{errors.license_issue_date.message}</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">تاریخ انقضای گواهینامه *</label>
          <input
            type="date"
            {...register("license_expiry_date")}
            onFocus={() => setFocusedField("license_expiry_date")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
          {errors.license_expiry_date && (
            <p className="mt-1 text-xs text-red-600">{errors.license_expiry_date.message}</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">پلاک خودرو *</label>
          <input
            {...register("vehicle_plate")}
            onFocus={() => setFocusedField("vehicle_plate")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
          {errors.vehicle_plate && (
            <p className="mt-1 text-xs text-red-600">{errors.vehicle_plate.message}</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">آدرس</label>
          <input
            {...register("address")}
            onFocus={() => setFocusedField("address")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">تاریخ استخدام *</label>
          <input
            type="date"
            {...register("hire_date")}
            onFocus={() => setFocusedField("hire_date")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
          {errors.hire_date && (
            <p className="mt-1 text-xs text-red-600">{errors.hire_date.message}</p>
          )}
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)}>
          <label className="mb-1 block text-sm font-medium">سوابق بیمه</label>
          <input
            {...register("insurance_history")}
            onFocus={() => setFocusedField("insurance_history")}
            onBlur={() => setFocusedField(null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#07657E]"
          />
        </div>

        <div ref={(el) => el && fieldsRef.current.push(el)} className="md:col-span-2 lg:col-span-1">
          <label className="mb-1 block text-sm font-medium">مدرک تحصیلی *</label>
          <select
            {...register("education_level")}
            onFocus={() => setFocusedField("education_level")}
            onBlur={() => setFocusedField(null)}
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

        <button
          ref={buttonRef}
          type="submit"
          disabled={!canSubmit || loading}
          className="col-span-1 md:col-span-2 lg:col-span-3 mt-6 w-full rounded-md bg-gradient-to-r from-[#07657E] to-[#F2991F] px-6 py-3 text-white font-medium shadow-sm hover:brightness-105 transition-all disabled:opacity-50"
        >
          {loading ? "در حال ثبت..." : "ثبت اطلاعات"}
        </button>
      </form>

      {submitted && (
        <div ref={messageRef} className={`mt-6 p-4 rounded-md ${submitted === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message}
        </div>
      )}
    </motion.section>
  );
}
