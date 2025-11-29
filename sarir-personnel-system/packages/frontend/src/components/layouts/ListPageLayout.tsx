import React from "react";

import { Page, PageHeader } from "./Page";

import { cn } from "@/lib/utils";

type ListPageLayoutProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ListPageLayout({
  title,
  description,
  actions,
  toolbar,
  children,
  className,
}: ListPageLayoutProps) {
  return (
    <Page className={cn("space-y-3", className)}>
      <PageHeader title={title} description={description} actions={actions} />
      {toolbar ? <div className="mb-2">{toolbar}</div> : null}
      <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm lg:px-5 lg:py-5">
        <div className="space-y-2.5">{children}</div>
      </section>
    </Page>
  );
}
