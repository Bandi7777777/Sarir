// src/components/ui/input.tsx
"use client";

import * as React from "react";

// فرض بر این است که تابع cn برای ترکیب کلاس‌ها در مسیر زیر تعریف شده است.
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-fg)]",
          "outline-none ring-0 placeholder:text-[var(--input-muted)]",
          "focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]",
          // کلاس‌های مربوط به وضعیت خطا (اختیاری)
          "disabled:cursor-not-allowed disabled:opacity-50", 
          className
        )}
        ref={ref}
        // ✅ FIX: اضافه کردن suppressHydrationWarning برای رفع خطای Hydration
        suppressHydrationWarning={true} 
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };