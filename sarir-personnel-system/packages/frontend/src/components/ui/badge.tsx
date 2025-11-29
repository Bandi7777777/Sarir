import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-brand-primary)_55%,transparent)] focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-slate-200 bg-slate-50 text-slate-800",
        secondary:
          "border-slate-200 bg-white text-slate-700",
        destructive: "border-transparent bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
        outline: "border-slate-200 text-[var(--color-text-muted)] bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
