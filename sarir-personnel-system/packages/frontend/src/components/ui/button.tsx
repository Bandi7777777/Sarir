"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
    const styles =
      variant === "outline"
        ? "border border-[#07657E] text-[#07657E] bg-transparent hover:bg-[#07657E]/5"
        : "bg-gradient-to-r from-[#07657E] to-[#F2991F] text-white hover:brightness-105";
    return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";

export default Button;
