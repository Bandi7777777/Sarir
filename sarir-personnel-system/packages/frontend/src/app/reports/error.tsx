"use client";

import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ReportsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="reports-neon flex items-center justify-center min-h-screen p-6">
      <div className="max-w-lg mx-auto p-8 rounded-2xl report-panel shadow-[0_0_20px_rgba(255,196,106,0.2)]" style={{ direction: 'rtl' }}>
        <div className="flex items-center gap-4 mb-4">
            <AlertOctagon size={32} className="text-[#FFC46A]"/>
            <h2 className="text-2xl font-bold text-white">خطای سیستمی</h2>
        </div>
        <p className="text-gray-300 mb-6">متأسفانه، خطایی در بارگذاری یا پردازش داده‌های گزارش رخ داده است:</p>
        <p className="text-red-400 bg-red-800/20 p-3 rounded-lg text-sm font-mono overflow-auto mb-6">
            {error.message}
        </p>
        <button 
            onClick={() => reset()} 
            className="w-full flex items-center justify-center gap-2 bg-[#0097B2] hover:bg-opacity-80 transition-colors text-white py-3 rounded-xl font-semibold"
        >
            <RotateCcw size={16} /> تلاش مجدد
        </button>
      </div>
    </div>
  );
}