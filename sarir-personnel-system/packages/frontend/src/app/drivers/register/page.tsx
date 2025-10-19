"use client";

import { useState } from "react";
import { motion } from "framer-motion"; // تغییر: اضافه
import { toast } from "react-hot-toast"; // تغییر: اضافه
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { PlusIcon } from "@heroicons/react/24/solid"; // تغییر: icon

/* ─────────────── Theme helpers ─────────────── */ // تغییر: تم
const GLASS = "backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,.3)] glow-border";
const PANELBG = "bg-white/10 dark:bg-white/10";

/* ─────────────── Animations ─────────────── */ // تغییر: انیمیشن
const rise = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };

export default function RegisterDriver() {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    phone: "",
    vehicle: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("راننده با موفقیت ثبت شد!");
    console.log("Form submitted:", formData);
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
            ثبت راننده جدید
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
                نام
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#07657E] text-lg"
                placeholder="نام راننده"
              />
            </motion.div>
            <motion.div variants={rise}>
              <label className="block text-lg text-[#07657E] dark:text-[#66B2FF] mb-2">
                شماره گواهینامه
              </label>
              <Input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#07657E] text-lg"
                placeholder="مثال: 123456"
              />
            </motion.div>
            <motion.div variants={rise}>
              <label className="block text-lg text-[#07657E] dark:text-[#66B2FF] mb-2">
                شماره تلفن
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#07657E] text-lg"
                placeholder="مثال: 09123456789"
              />
            </motion.div>
            <motion.div variants={rise}>
              <label className="block text-lg text-[#07657E] dark:text-[#66B2FF] mb-2">
                نوع خودرو
              </label>
              <Input
                type="text"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#07657E] text-lg"
                placeholder="مثال: کامیون"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={rise}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-3 rounded-lg"
              >
                <PlusIcon className="h-6 w-6 mr-2" />
                ثبت راننده
              </Button>
            </motion.div>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
