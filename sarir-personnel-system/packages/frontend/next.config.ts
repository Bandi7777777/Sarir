import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // این تنظیم حیاتی است: درخواست‌های /api را به پورت بک‌اند می‌فرستد
  // این کار مشکل CORS و آدرس‌دهی را به شکل تمیز حل می‌کند
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
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // غیرفعال کردن هدر x-powered-by برای امنیت بیشتر
  poweredByHeader: false,

  // اجازه می‌دهد build حتی اگر ESLint روی کل پروژه خطا داشته باشد، کامل شود.
  // Lint را می‌توان جداگانه و به‌صورت تدریجی تمیز کرد (مثلاً با pnpm lint).
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
