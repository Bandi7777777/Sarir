// packages/frontend/src/lib/config.ts

// Base URL for backend API.
// در محیط dev اگر NEXT_PUBLIC_BACKEND_URL ست نشده باشد، روی 127.0.0.1:8000 می‌افتد.
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export const API_BASE_URL = `${BACKEND_URL}/api`;
