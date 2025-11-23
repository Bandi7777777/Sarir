import React from "react";

import { Page, PageHeader } from "./Page";

import { Card } from "@/components/ui/card";

type FormPageLayoutProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  widthClassName?: string;
};

export function FormPageLayout({
  title,
  description,
  actions,
  children,
  widthClassName = "max-w-3xl",
}: FormPageLayoutProps) {
  return (
    <Page>
      <PageHeader title={title} description={description} actions={actions} />
      <div className="flex justify-center">
        <Card className={`w-full ${widthClassName} p-6 space-y-4`}>{children}</Card>
      </div>
    </Page>
  );
}
