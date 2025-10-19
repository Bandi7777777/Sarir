// page.tsx (Server Component)
import type { Metadata, Viewport } from "next";
import RegisterPersonnel from "./RegisterPersonnel"; // مستقیم import کنید، بدون dynamic اگر لازم نیست

export const metadata: Metadata = {
  title: "ثبت پرسنل | SARIR",
  description: "فرم ثبت پرسنل جدید در سامانه سریر",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07657E",
};

export default function Page() {
  return <RegisterPersonnel />;
}