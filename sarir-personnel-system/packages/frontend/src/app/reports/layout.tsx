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
      <div className="min-h-screen bg-[var(--color-shell-bg)] text-[var(--color-text-main)]">
        {children}
      </div>
    </Providers>
  );
}
