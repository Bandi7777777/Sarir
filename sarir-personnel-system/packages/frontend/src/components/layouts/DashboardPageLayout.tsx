import React from "react";
import { Page } from "./Page";

type DashboardPageLayoutProps = {
  title: string;
  description?: string;
  headerSlot?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardPageLayout({
  title,
  description,
  headerSlot,
  children,
}: DashboardPageLayoutProps) {
  return (
    <Page className="bg-[var(--dashboard-bg,rgba(2,6,23,1))] text-white">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description ? (
            <p className="text-sm text-slate-200/80 max-w-4xl">{description}</p>
          ) : null}
        </div>
        {headerSlot ? <div className="flex items-center gap-3">{headerSlot}</div> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </Page>
  );
}
