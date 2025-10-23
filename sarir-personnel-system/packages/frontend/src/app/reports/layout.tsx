import type { Metadata } from "next";
import { Providers } from "@/components/Providers"; // Assuming you have this from previous instructions

export const metadata: Metadata = {
  title: "گزارش‌ها | SARIR",
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="reports-layout">{children}</div>
    </Providers>
  );
}