"use client";

export default function ReportsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto border rounded-lg p-6 bg-white">
        <h2 className="text-xl font-semibold text-red-600 mb-2">خطا در گزارش‌ها</h2>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button onClick={() => reset()} className="btn btn-primary">تلاش مجدد</button>
      </div>
    </div>
  );
}
