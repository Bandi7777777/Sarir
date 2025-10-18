
"use client";

export default function ErrorPage({ error, reset }:{ error: Error & { digest?: string }, reset: () => void }){
  return (
    <div className="px-6 py-8">
      <div className="neon-card p-6">
        <div className="text-red-300 mb-3">خطا در بارگذاری داشبورد</div>
        <button className="btn-brand" onClick={reset}>تلاش مجدد</button>
        <pre className="ltr text-xs opacity-60 mt-4 overflow-auto">{error?.message}</pre>
      </div>
    </div>
  );
}
