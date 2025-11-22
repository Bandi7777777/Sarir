import React from "react";
import { Page, PageHeader } from "./Page";

type ListPageLayoutProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
};

export function ListPageLayout({
  title,
  description,
  actions,
  toolbar,
  children,
}: ListPageLayoutProps) {
  return (
    <Page>
      <PageHeader title={title} description={description} actions={actions} />
      {toolbar ? <div className="mb-4">{toolbar}</div> : null}
      <div className="space-y-4">{children}</div>
    </Page>
  );
}
