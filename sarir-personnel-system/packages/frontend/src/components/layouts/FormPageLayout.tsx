import React from "react";

import { Page, PageHeader } from "./Page";

import { cn } from "@/lib/utils";
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
      <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm lg:px-5 lg:py-5">
        <div className={cn("mx-auto w-full", widthClassName)}>
          <Card className="w-full border border-slate-100 bg-white shadow-sm">
            <div className="space-y-4 sm:space-y-5 p-4 sm:p-5">{children}</div>
          </Card>
        </div>
      </section>
    </Page>
  );
}
