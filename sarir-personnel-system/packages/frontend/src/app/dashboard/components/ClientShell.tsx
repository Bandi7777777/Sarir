'use client';

import dynamic from "next/dynamic";
import type { FC } from "react";
import { RemindersProvider } from "./RemindersContext";  // تضمین Wrapping درست

const Clock             = dynamic(() => import("../Clock"),            { ssr: false });
const Calendar          = dynamic(() => import("./Calendar"),          { ssr: false });
const RemindersPanel    = dynamic(() => import("./RemindersPanel"),    { ssr: false });
const KPIs              = dynamic(() => import("./KPIs"),              { ssr: false });
const DeptDonut         = dynamic(() => import("./DeptDonut"),         { ssr: false });
const GenderDonut       = dynamic(() => import("./GenderDonut"),       { ssr: false });
const LatestEmployees   = dynamic(() => import("./LatestEmployees"),   { ssr: false });
const UpcomingBirthdays = dynamic(() => import("./UpcomingBirthdays"), { ssr: false });
const Anniversaries     = dynamic(() => import("./Anniversaries"),     { ssr: false });
const QuickActions      = dynamic(() => import("./QuickActions"),      { ssr: false });

type Employee = {
  id?: string | number;
  first_name?: string; last_name?: string; position?: string;
  department?: string; role?: string; created_at?: string; hire_date?: string;
  birth_date?: string; gender?: string;
};

const titleClass = "text-[22px] md:text-[24px] font-extrabold tracking-tight";

const ClientShell: FC<{ initialEmployees: Employee[] }> = ({ initialEmployees }) => {
  return (
    <RemindersProvider storageKey="sarir_dashboard_reminders_v1"> {/* Wrapping provider */}
      <section className="grid gap-5 2xl:gap-6 grid-cols-12">
        {/* Hero bar */}
        <header className="neon-card col-span-12 px-5 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="chip bg-[var(--brand-accent)]">Sarir Logistics</div>
            <h1 className={`${titleClass} mt-2`}>داشبورد سریر</h1>
            <p className="opacity-75 text-sm mt-1">نمای کلی، شاخص‌ها و رویدادها</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="/personnel/new" className="btn btn-primary">افزودن پرسنل</a>
            <a href="/reports" className="btn btn-accent">خروجی PDF</a>
          </div>
        </header>

        {/* Row 1: Quick actions + KPIs + Clock */}
        <div className="neon-card col-span-12 lg:col-span-3 p-4">
          <h2 className="section-title">اکشن‌های سریع</h2>
          <QuickActions />
        </div>

        <div className="neon-card col-span-12 lg:col-span-7 p-4">
          <h2 className="section-title">شاخص‌های کلیدی (KPI)</h2>
          <KPIs employees={initialEmployees} />
          <div className="divider mt-4" />
        </div>

        <div className="neon-card col-span-12 lg:col-span-2 p-4">
          <h2 className="section-title">ساعت (جلالی)</h2>
          <Clock />
        </div>

        {/* Row 2: Calendar + Latest */}
        <div className="neon-card col-span-12 xl:col-span-8 p-4">
          <h2 className="section-title">تقویم جلالی (با مناسبت‌های مهم)</h2>
          <Calendar />
        </div>

        <div className="neon-card col-span-12 xl:col-span-4 p-4">
          <h2 className="section-title">آخرین پرسنل</h2>
          <LatestEmployees employees={initialEmployees} />
        </div>

        {/* Row 3: Reminders + Birthdays */}
        <div className="neon-card col-span-12 xl:col-span-8 p-4">
          <h2 className="section-title">مدیریت یادآورها</h2>
          <RemindersPanel />
        </div>

        <div className="neon-card col-span-12 xl:col-span-4 p-4">
          <h2 className="section-title">تولدهای پیشِ‌رو</h2>
          <UpcomingBirthdays employees={initialEmployees} />
        </div>

        {/* Row 4: Anniversaries + Donuts */}
        <div className="neon-card col-span-12 md:col-span-4 p-4">
          <h2 className="section-title">سالگردهای کاری پیشِ‌رو</h2>
          <Anniversaries employees={initialEmployees} />
        </div>

        <div className="neon-card col-span-12 md:col-span-4 p-4">
          <h2 className="section-title">ترکیب دپارتمان‌ها</h2>
          <DeptDonut employees={initialEmployees} />
        </div>

        <div className="neon-card col-span-12 md:col-span-4 p-4">
          <h2 className="section-title">ترکیب جنسیت</h2>
          <GenderDonut employees={initialEmployees} />
        </div>
      </section>
    </RemindersProvider>
  );
};

export default ClientShell;
