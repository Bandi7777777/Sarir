# گزارش دقیق ممیزی — SARIR Frontend
- تاریخ: 2025-10-07 17:56

## نسخه‌ها
- next: ^15.5.4
- react: 19.2.0
- react-dom: 19.2.0
- tailwindcss: ^4.1.14
- typescript: ^5.3.3

## وضعیت فایل‌های کلیدی
- frontend_exists: True
- src_exists: True
- pkg: True
- tsconfig: True
- tailwind_cfg_count: 1
- globals_css: True
- layout_app: True
- page_dash: True
- layout_dash: True
- clock_file: True
- components_dir: False
- notif_popup: True
- donut_chart: True

## یافته‌ها و اصلاحات پیشنهادی
**۱) ایمپورت به فایل‌های ناموجود در `page.tsx`:**
- ./components/ClientShell
راه‌حل: ساخت فایل‌های گمشده زیر `app/dashboard/components/` (در پچ موجود است).
**۲) مسیر dynamic برای `Clock` نادرست است.** در پچ، یا مسیر به `./Clock` اصلاح شده یا فایل در `components` ساخته می‌شود.
**۳) `ssr:false` مشکلی ندارد یا اصلاح شده است.**
**۴) ریسک هیدریشن (Date/random/window) در Server Components مشاهده نشد.**
**۵) `useEffect` در فایل‌های بدون `"use client"`**
- components/NotificationPopup.tsx
**۶) تایپوی «و-» مشاهده نشد.**
**۷) وضعیت چارت مشکلی ندارد یا فایل یافت نشد.**
**۸) Tailwind v4 با کلید `content` در کانفیگ:** بهتر است در v4 با `@source` در CSS کار شود؛ نسخه‌ی تمیز در پچ ارائه شده (اختیاری).
**۹) آلیاس TypeScript (@/*) تنظیم است.**

## مرحلهٔ بعدی (پیشنهادهای کاربردی)
- افزودن `loading.tsx` و `error.tsx` در `src/app/dashboard` برای بهبود UX و مدیریت خطا.
- اتصال جدول پرسنل به `/api/employees` و افزودن Skeleton/Empty/Toast خطا (درخواست بده تا فایل‌های آماده را بفرستم).
- بارگذاری تنبل چارت‌ها/ویجت‌های سنگین با `dynamic(..., { ssr:false })`.
- اگر خواستی تمیزکاری Tailwind v4 را کامل کنیم، `content` را از `tailwind.config` حذف می‌کنم و پوشش مسیرها فقط با `@source` انجام می‌شود.
- اجرای یک پاس Lint/Type-check روی `src/components` برای جلوگیری از رگرسیون.