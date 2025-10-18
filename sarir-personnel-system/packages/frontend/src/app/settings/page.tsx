"use client";

import Sidebar from "@/components/ui/Sidebar";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { CogIcon } from "@heroicons/react/24/solid";

export default function Settings() {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    language: "فارسی",
    theme: "روشن",
  });
  const [notifications, setNotifications] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifications(["تنظیمات با موفقیت ذخیره شد!"]);
    setTimeout(() => setNotifications([]), 3000);
    console.log("Settings saved:", formData);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white animate-gradient-bg">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
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
            تنظیمات
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

        {/* Settings Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-xl animate-slide-up"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">
                زبان
              </label>
              <Input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#0A8A9F] text-lg"
                placeholder="مثال: فارسی"
              />
            </div>
            <div>
              <label className="block text-lg text-[#0A8A9F] dark:text-[#66B2FF] mb-2">
                تم
              </label>
              <Input
                type="text"
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#0A8A9F] text-lg"
                placeholder="مثال: روشن"
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full bg-[#0A8A9F] hover:bg-[#007A9A] text-white text-lg py-3 rounded-lg"
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







