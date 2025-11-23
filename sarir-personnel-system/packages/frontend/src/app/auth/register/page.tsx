"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function RegisterPersonnel() {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [notifications, setNotifications] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifications(["پرسنل با موفقیت ثبت شد!"]);
    setTimeout(() => setNotifications([]), 3000);
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white animate-gradient-bg">
      <div
        className="flex-1 p-4 md:p-8 space-y-8 transition-all duration-300"
        style={{ paddingRight: expanded ? "280px" : "80px" }}
      >
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-b-xl shadow-xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A8A9F] dark:text-[#66B2FF] animate-neon-text">
            ثبت پرسنل جدید
          </h1>
        </motion.header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="hidden fixed top-4 right-4 z-60 bg-green-500/80 text-white p-4 rounded-lg shadow-lg animate-slide-down"
          >
            {notifications[0]}{" "}
            <button
              onClick={() => setNotifications([])}
              className="ml-3 text-white hover:text-gray-200"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Form Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-xl animate-slide-up"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">
                نام و نام خانوادگی
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#0A8A9F] text-lg"
                placeholder="مثال: علی محمدی"
              />
            </div>
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">
                ایمیل
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#0A8A9F] text-lg"
                placeholder="مثال: ali@example.com"
              />
            </div>
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">
                شماره تلفن
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#0A8A9F] text-lg"
                placeholder="مثال: 09123456789"
              />
            </div>
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">
                نقش
              </label>
              <Input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#0A8A9F] text-lg"
                placeholder="مثال: مدیر"
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full bg-[#0A8A9F] hover:bg-[#007A9A] text-white text-lg py-3 rounded-lg"
              >
                <PlusIcon className="h-6 w-6 mr-2" />
                ثبت پرسنل
              </Button>
            </motion.div>
          </form>
        </motion.section>
      </div>
    </div>
  );
}








