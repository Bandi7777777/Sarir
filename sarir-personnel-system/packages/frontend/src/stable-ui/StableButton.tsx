import * as React from "react";

import { cn } from "@/lib/utils";

type StableButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function StableButton({ className, ...props }: StableButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-full border border-transparent px-3 text-sm font-semibold",
        "bg-[#07657E] text-white transition hover:bg-[#055670] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07657E]/40",
        className
      )}
      {...props}
    />
  );
}
