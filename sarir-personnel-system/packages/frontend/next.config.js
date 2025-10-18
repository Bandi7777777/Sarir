// packages/frontend/next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  // اگر مسیر ثابت داری بماند؛ در غیر این‌صورت از cwd استفاده کن:
  outputFileTracingRoot: process.env.OUTPUT_TRACING_ROOT || process.cwd(),

  images: {
    domains: ["localhost"],
  },

  async redirects() {
    return [
      { source: "/users", destination: "/personnel/list", permanent: true },
      { source: "/users/:path*", destination: "/personnel/list", permanent: true },
    ];
  },

  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:8000/api/:path*",
        },
      ],
    };
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

module.exports = nextConfig;
