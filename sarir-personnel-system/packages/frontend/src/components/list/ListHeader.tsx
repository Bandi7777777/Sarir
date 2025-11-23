import React from "react";
import { cn } from "@/lib/utils";

type ListHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function ListHeader({ title, description, actions, className }: ListHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
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
