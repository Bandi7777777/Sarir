import React from "react";

import { cn } from "@/lib/utils";

type PageProps = {
  children: React.ReactNode;
  className?: string;
};

export function Page({ children, className }: PageProps) {
  return (
    <div
      className={cn(
        "w-full min-h-screen bg-background text-foreground",
        "px-4 py-6 sm:px-6 lg:px-10",
        className
      )}
    >
      {children}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-3xl">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
