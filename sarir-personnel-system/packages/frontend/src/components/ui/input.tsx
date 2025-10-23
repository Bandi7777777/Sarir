"use client";

import * as React from "react";

// اگر util cn داری:
let cn = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");
try {
  // @ts-ignore - optional utils
  const mod = require("@/lib/utils");
  if (typeof mod?.cn === "function") cn = mod.cn;
} catch {}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        suppressHydrationWarning
        autoComplete="off"
        className={cn(
          "flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
