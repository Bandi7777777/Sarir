// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // بدون locale → مستقیم به داشبورد
  redirect("/dashboard");
  return null;
}
