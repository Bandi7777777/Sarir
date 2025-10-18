"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white animate-gradient-bg flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-[#0A8A9F] dark:text-[#66B2FF] animate-neon-text mb-4">
          404 - صفحه پیدا نشد
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
          متأسفانه صفحه‌ای که به دنبالش هستید وجود ندارد.
        </p>
        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#0A8A9F] hover:bg-[#007A9A] text-white text-lg py-3 px-6 rounded-lg"
          >
            بازگشت به داشبورد
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}






