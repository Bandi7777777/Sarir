// packages/frontend/next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  // برای ردیابی خروجی هنگام Monorepo
  outputFileTracingRoot: process.env.OUTPUT_TRACING_ROOT || process.cwd(),

  // ✅ جایگزین "images.domains" با الگوی جدید
  images: {
    remotePatterns: [
      // لوکال‌ها
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'http',  hostname: '127.0.0.1' },
      { protocol: 'https', hostname: '127.0.0.1' },

      // IP شبکهٔ داخلی که در لاگ داشتی (برای تست روی دستگاه‌های LAN)
      { protocol: 'http',  hostname: '10.10.10.30' },
      { protocol: 'https', hostname: '10.10.10.30' },
    ],
  },

  async redirects() {
    return [
      { source: '/users', destination: '/personnel/list', permanent: true },
      { source: '/users/:path*', destination: '/personnel/list', permanent: true },
    ];
  },

  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ],
    };
  },

  // ✅ alias صحیح + حفظ aliasهای قبلی
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  // ✅ هدرها برای جلوگیری از کش HTML و کش بلندمدت استاتیک‌ها
  async headers() {
    return [
      {
        source: '/((?!_next/static|favicon.ico).*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;
