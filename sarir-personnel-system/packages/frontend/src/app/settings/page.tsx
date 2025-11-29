"use client";

import { CogIcon } from "@heroicons/react/24/solid"; // تغییر: icon
import { motion, type Variants } from "framer-motion"; // تغییر: اضافه
import { useState } from "react";
import { toast } from "react-hot-toast"; // تغییر: اضافه

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


/* ─────────────── Theme helpers ─────────────── */ // تغییر: تم
const GLASS = "backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,.3)] glow-border";
const PANELBG = "bg-white/10 dark:bg-white/10";

/* ─────────────── Animations ─────────────── */ // تغییر: انیمیشن
const rise: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

export default function Settings() {
  const expanded = false;
  const [formData, setFormData] = useState({
    language: "فارسی",
    theme: "روشن",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تنظیمات با موفقیت ذخیره شد!");
    console.log("Settings saved:", formData);
  };

  return (
    <div className="theme-light flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white animate-gradient-bg"> {/* تغییر: تم */}
      <div className="flex-1 p-4 md:p-8 space-y-8 transition-all duration-300" style={{ paddingRight: expanded ? "280px" : "80px" }}>
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-b-xl shadow-xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#07657E] dark:text-[#66B2FF] animate-neon-text">
            تنظیمات
          </h1>
        </motion.header>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className={`${GLASS} ${PANELBG} p-6`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={rise}>
              <label className="block text-lg text-[#07657E] dark:text-[#66B2FF] mb-2">
                زبان
              </label>
              <Input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#07657E] text-lg"
                placeholder="مثال: فارسی"
              />
            </motion.div>
            <motion.div variants={rise}>
              <label className="block text-lg text-[#07657E] dark:text-[#66B2FF] mb-2">
                تم
              </label>
              <Input
                type="text"
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#07657E] text-lg"
                placeholder="مثال: روشن"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={rise}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-3 rounded-lg"
              >
                <CogIcon className="h-6 w-6 mr-2" />
                ذخیره تنظیمات
              </Button>
            </motion.div>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
