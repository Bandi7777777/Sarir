"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="p-8">
        <div className="max-w-xl mx-auto border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold text-red-600 mb-2">خطای غیرمنتظره</h2>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
