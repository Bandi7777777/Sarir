import type { Metadata, Viewport } from "next";
import RegisterPersonnel from "./RegisterPersonnel";

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
