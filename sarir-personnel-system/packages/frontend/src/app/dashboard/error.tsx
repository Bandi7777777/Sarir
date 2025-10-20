'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  const tryAgain = () => {
    const msg = String(error?.message || '');
    const isChunkErr =
      msg.includes('Loading chunk') ||
      msg.includes('ChunkLoadError') ||
      msg.includes('failed to fetch dynamically imported module');

    if (isChunkErr) {
      window.location.reload();
      return;
    }
    reset();
  };

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-xl font-bold">خطا در بارگذاری داشبورد</h2>
      <p className="opacity-80">لطفاً روی «تلاش مجدد» کلیک کنید.</p>
      <button
        onClick={tryAgain}
        className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 transition"
      >
        تلاش مجدد
      </button>
      {process.env.NODE_ENV !== 'production' && (
        <pre className="mt-4 max-w-[90ch] overflow-auto text-xs opacity-70 text-left ltr">
{String(error?.message || 'Unknown error')}
        </pre>
      )}
    </div>
  );
}
