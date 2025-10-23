"use client";

import type { ReactNode } from "react";
import QueryProvider from "@/app/providers/QueryProvider";

// نسخه‌ی ساده: فعلاً فقط QueryProvider. Toast و بقیه را بعداً اضافه می‌کنیم.
export default function ClientProviders({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
