import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // این تنظیم حیاتی است: درخواست‌های /api را به پورت 8000 بک‌اند می‌فرستد
  // این کار مشکل CORS و آدرس‌دهی را کاملاً حل می‌کند
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
  
  // تنظیمات تصاویر (اگر از آواتارهای گوگل یا سرویس‌های دیگر استفاده می‌کنید)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // غیرفعال کردن هدر x-powered-by برای امنیت بیشتر
  poweredByHeader: false,
};

export default nextConfig;