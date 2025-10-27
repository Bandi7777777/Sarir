// packages/frontend/src/app/login/layout.tsx
import type { ReactNode } from "react";

/**
 * Server Component layout for /login
 * - بدون styled-jsx و import های کلاینتی
 * - فقط children را رندر می‌کند تا خطای 'client-only' و mismatch ایجاد نشود
 */
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
