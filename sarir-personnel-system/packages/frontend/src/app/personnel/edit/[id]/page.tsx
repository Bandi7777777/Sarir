"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

const schema = z.object({
  emp_code: z.string().min(1, "کد پرسنلی الزامی است"),
  first_name: z.string().min(1, "نام الزامی است"),
  last_name: z.string().min(1, "نام خانوادگی الزامی است"),
  national_id: z.string().min(10, "کد ملی معتبر نیست"),
  birth_date: z.string().min(1, "تاریخ تولد الزامی است"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "جنسیت الزامی است" }),
  }),
  department: z.string().min(1, "دپارتمان الزامی است"),
  education_level: z.string().min(1, "مدرک تحصیلی الزامی است"),
  hire_date: z.string().min(1, "تاریخ استخدام الزامی است"),
  phone: z
    .string()
    .regex(/^\d{10,11}$/)
    .optional(),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  position: z.string().optional(),
  unit: z.string().optional(),
  id_card_number: z.string().optional(),
  insurance_record: z.string().optional(),
  marital_status: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  address: z.string().optional(),
});

export default function EditPersonnel() {
  const router = useRouter();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => reset(data))
      .catch(() => setMessage("خطا در دریافت اطلاعات پرسنل"));
  }, [id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("خطا در ثبت اطلاعات");
      setMessage("ویرایش با موفقیت انجام شد.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 text-cyan-50" style={{ background: "radial-gradient(#07657E,#012C3E)" }}>
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl border shadow-lg text-black">
        <h1 className="text-2xl font-bold mb-6">ویرایش اطلاعات پرسنل</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block mb-1">کد پرسنلی</label>
            <input {...register("emp_code")} className="w-full rounded border p-2" />
            {errors.emp_code && <p className="text-red-500 text-sm">{errors.emp_code.message}</p>}
          </div>
          <div>
            <label className="block mb-1">نام</label>
            <input {...register("first_name")} className="w-full rounded border p-2" />
            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block mb-1">نام خانوادگی</label>
            <input {...register("last_name")} className="w-full rounded border p-2" />
            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
          </div>
          {/* سایر فیلدها با ساختاری مشابه اضافه می‌شوند */}
          <div className="col-span-full">
            <button disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-orange-500 text-white py-2 rounded">
              {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
          {message && <p className="col-span-full text-center text-sm mt-4 text-cyan-800">{message}</p>}
        </form>
      </div>
    </div>
  );
}
