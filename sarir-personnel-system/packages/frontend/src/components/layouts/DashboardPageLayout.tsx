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
    <Page>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-[21px] font-semibold text-[var(--color-text-main)]">{title}</h1>
          {description ? (
            <p className="max-w-4xl text-[13px] leading-relaxed text-[var(--color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {headerSlot ? <div className="flex items-center gap-2">{headerSlot}</div> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </Page>
  );
}
