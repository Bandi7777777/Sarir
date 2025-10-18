import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

/** لایهٔ مشترک بین همهٔ صفحات داشبورد */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row-reverse w-screen h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
    </div>
  );
}



