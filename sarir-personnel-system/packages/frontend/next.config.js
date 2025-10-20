// packages/frontend/next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  outputFileTracingRoot: process.env.OUTPUT_TRACING_ROOT || process.cwd(),

  images: {
    domains: ['localhost'],
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

  // ✅ اختیاری: هدرها برای جلوگیری از کش HTML و کش بلندمدت استاتیک‌ها
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
