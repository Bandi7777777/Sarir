"use client";

import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function LoginBrandPanel({ children }: Props) {
  return (
    <div className="relative h-full bg-gradient-to-br from-[#f6f8fb] via-white to-[#eef2f7] px-6 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(7,101,126,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(248,156,42,0.1),transparent_40%)]" />
      <div className="relative flex h-full flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
              <Image src="/images/logo-sarir-2.png" alt="لوگوی سریر" width={48} height={48} className="object-contain" priority />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tracking-[0.25em] text-slate-500">SARIR LOGISTIC</p>
              <p className="text-sm text-slate-600">سریر لجستیک هوشمند ایرانیان</p>
            </div>
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
