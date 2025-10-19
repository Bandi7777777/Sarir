import * as React from "react"
import { cn } from "@/lib/utils"

// ممنوع‌کردن عبور children به <input />
export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "children"
>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", children: _children, ...props }, ref) => {
    // توجه: children عمداً از props حذف شد تا حتی اگر جایی اشتباهاً پاس داده شد،
    // روی <input> پخش نشود و خطای void-element رخ ندهد.
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
export default Input
