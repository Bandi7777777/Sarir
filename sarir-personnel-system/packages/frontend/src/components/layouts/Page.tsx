import React from "react";

import { cn } from "@/lib/utils";

type PageProps = {
  children: React.ReactNode;
  className?: string;
};

export function Page({ children, className }: PageProps) {
  return (
    <div className="w-full min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-4", className)}>{children}</div>
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
        "mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-[21px] font-semibold leading-tight text-[var(--color-text-main)]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-[13px] leading-relaxed text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
