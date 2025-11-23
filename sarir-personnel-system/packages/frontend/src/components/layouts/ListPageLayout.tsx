import React from "react";
import { cn } from "@/lib/utils";
import { Page, PageHeader } from "./Page";

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
    <Page className={cn(className)}>
      <PageHeader title={title} description={description} actions={actions} />
      {toolbar ? <div className="mb-4">{toolbar}</div> : null}
      <div className="space-y-4">{children}</div>
    </Page>
  );
}
