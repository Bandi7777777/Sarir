/**
 * فقط داشبورد: تم نئون/تیره.
 * توجه: layout ریشه html را با class="light" رندر می‌کند (برای ثبات Hydration)،
 * اینجا فقط wrapper محتوا را تیره می‌کنیم و تگ html را دست نمی‌زنیم.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-dashboard min-h-dvh">{children}</div>;
}
