import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-primary)] focus-visible:ring-opacity-30 focus-visible:ring-offset-0 border border-transparent shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-brand-primary)] text-white hover:bg-[#055670] shadow-[0_6px_16px_rgba(7,101,126,0.18)]",
        destructive:
          "bg-[var(--color-danger)] text-white shadow-[0_6px_14px_rgba(216,72,72,0.18)] hover:bg-[var(--color-danger)]/90",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-none",
        secondary:
          "bg-[var(--color-brand-accent)] text-[#2b1a08] border border-transparent shadow-[0_8px_18px_rgba(248,156,42,0.18)] hover:bg-[#e1871e]",
        ghost:
          "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-brand-primary-soft)]/40",
        link: "text-[var(--color-brand-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-3.5",
        sm: "h-9 rounded-md gap-1.5 px-3 text-[13px]",
        lg: "h-11 rounded-lg px-5 text-[15px]",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-9 rounded-md",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
