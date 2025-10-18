// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-dark">  {/* یا هر wrapper دیگه */}
      {children}
    </div>
  );
}