"use client";
import * as React from "react";
type Variant = "primary" | "accent" | "outline" | "ghost" | "link";
type Size = "sm" | "md" | "lg";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; }
const cx = (...c:(string|false|null|undefined)[]) => c.filter(Boolean).join(" ");
const base = "inline-flex items-center justify-center rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const variants:Record<Variant,string> = {
  primary:"btn btn-primary focus-visible:ring-cyan-300",
  accent:"btn btn-accent focus-visible:ring-amber-300",
  outline:"btn btn-outline focus-visible:ring-cyan-400",
  ghost:"btn-ghost",
  link:"btn-link",
};
const sizes:Record<Size,string> = { sm:"h-9 px-3 text-sm", md:"h-10 px-4 text-sm", lg:"h-11 px-5 text-base" };
const Button = React.forwardRef<HTMLButtonElement,ButtonProps>(({className,variant="primary",size="md",...props},ref)=>(
  <button ref={ref} className={cx(base,variants[variant],sizes[size],className)} {...props}/>
));
Button.displayName="Button";
export default Button;
export { Button };
