"use client";
import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const base =
  "w-full rounded-xl border bg-white/5 px-3 py-2 outline-none transition focus-visible:ring-2";
const normal = "border-white/15 text-white placeholder:text-white/60 focus-visible:ring-[rgba(7,101,126,.45)]";
const invalid = "border-rose-400/70 text-white placeholder:text-rose-200 focus-visible:ring-rose-300";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid: invalidProp, ...props }, ref) => {
    // Force render only on client to avoid hydration mismatch
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      setMounted(true);
    }, []);

    // If not mounted on client, don't render the input
    if (!mounted) {
      return null;
    }

    return (
      <input
        ref={ref}
        className={cx(base, invalidProp ? invalid : normal, className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
export { Input };
