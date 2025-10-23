"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { PlusIcon, DocumentTextIcon, EnvelopeIcon, NewspaperIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";
import { PDFDocument } from "pdf-lib"; // برای تولید PDF (نصب کنید: npm install pdf-lib)
import * as z from "zod"; // برای validation (نصب کنید: npm install zod)

const formSchema = z.object({
  name: z.string().min(3, "نام حداقل 3 حرف باشد"),
  email: z.string().email("ایمیل نامعتبر"),
  phone: z.string().regex(/^09\d{9}$/, "شماره تلفن نامعتبر"),
  position: z.string().min(1, "سمت الزامی است"),
  introducer: z.string().optional(), // شرکت معرفی‌کننده (مثال: پارس آوین)
});

export default function RegisterBoardMember() {
  const [step, setStep] = useState(1); // workflow stages: 1. معرفی‌نامه, 2. دعوتنامه, 3. صورتجلسه, 4. روزنامه
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    introducer: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [notifications, setNotifications] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = (err as z.ZodError).flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(validationErrors).map(([key, val]) => [key, val?.[0] || ""])
        )
      );
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const generatePDF = async (type: "introduction" | "invitation" | "minutes" | "gazette") => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    // اضافه کردن متن حرفه‌ای بر اساس type (مثال ساده)
    // برای حرفه‌ای‌تر، از fontهای فارسی و template استفاده کنید
    page.drawText(`سند ${type} برای ${formData.name}`, { x: 50, y: 800, size: 20 });
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${formData.name}.pdf`;
    a.click();
    toast.success(`${type} تولید شد!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      try {
        // فراخوانی API backend برای ذخیره
        const res = await fetch("/api/board/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success("عضو ثبت شد!");
          generatePDF("gazette"); // نهایی‌سازی با روزنامه
          setStep(1); // reset workflow
        } else {
          toast.error("خطا در ثبت");
        }
      } catch {
        toast.error("خطا در اتصال");
      }
    }
  };

  useEffect(() => {
    if (step === 2) generatePDF("introduction");
    if (step === 3) generatePDF("invitation");
    if (step === 4) generatePDF("minutes");
  }, [step]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white animate-gradient-bg">
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-b-xl shadow-xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A8A9F] dark:text-[#66B2FF] animate-neon-text">
            ثبت عضو هیئت مدیره جدید - مرحله {step}/4
          </h1>
        </motion.header>

        {/* Workflow Steps */}
        <div className="flex justify-between mb-4">
          <Button disabled={step !== 1} onClick={() => generatePDF("introduction")}><EnvelopeIcon className="h-6 w-6 mr-2" /> معرفی‌نامه</Button>
          <Button disabled={step !== 2} onClick={() => generatePDF("invitation")}><DocumentTextIcon className="h-6 w-6 mr-2" /> دعوتنامه</Button>
          <Button disabled={step !== 3} onClick={() => generatePDF("minutes")}><NewspaperIcon className="h-6 w-6 mr-2" /> صورتجلسه</Button>
          <Button disabled={step !== 4} onClick={() => generatePDF("gazette")}><NewspaperIcon className="h-6 w-6 mr-2" /> روزنامه</Button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-xl animate-slide-up"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* فرم پایه با validation */}
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">نام و نام خانوادگی</label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="علی محمدی" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            {/* سایر فیلدها مشابه */}
            {/* ... (email, phone, position, introducer) */}
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">شرکت معرفی‌کننده</label>
              <Input name="introducer" value={formData.introducer} onChange={handleInputChange} placeholder="پارس آوین" />
            </div>
            {step < 4 ? (
              <Button type="button" onClick={handleNextStep} className="w-full bg-[#0A8A9F] hover:bg-[#007A9A] text-white text-lg py-3 rounded-lg">
                مرحله بعدی
              </Button>
            ) : (
              <Button type="submit" className="w-full bg-[#0A8A9F] hover:bg-[#007A9A] text-white text-lg py-3 rounded-lg">
                <PlusIcon className="h-6 w-6 mr-2" /> نهایی‌سازی ثبت
              </Button>
            )}
          </form>
        </motion.section>
      </div>
    </div>
  );
}