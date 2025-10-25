"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div dir="rtl" className="min-h-[60vh] grid place-items-center bg-white">
      <div className="max-w-xl mx-auto border rounded-lg p-6 shadow bg-white">
        <h2 className="text-xl font-semibold text-red-600 mb-2">خطای غیرمنتظره</h2>
        <p className="text-sm text-gray-700 mb-4">
          {error?.message || "مشکلی پیش آمد. لطفاً دوباره تلاش کنید."}
        </p>

        {error?.digest && (
          <p className="text-xs text-gray-500 mb-4">کد خطا: {error.digest}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="px-3 py-2 rounded-md text-white"
            style={{ background: "linear-gradient(90deg,#07657E,#1FB4C8)" }}
          >
            تلاش مجدد
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-3 py-2 rounded-md border"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    </div>
  );
}
