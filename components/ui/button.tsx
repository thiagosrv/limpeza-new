import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-blue-600 text-white shadow-raised hover:bg-brand-blue-500 active:bg-brand-blue-700 disabled:bg-slate-300",
  secondary:
    "bg-brand-yellow-400 text-brand-blue-700 shadow-raised hover:bg-brand-yellow-300 active:bg-brand-yellow-500 disabled:bg-slate-200 disabled:text-slate-400",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:border-brand-blue-300 hover:text-brand-blue-600 active:bg-slate-50 disabled:text-slate-300",
  ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300",
  destructive: "bg-state-danger-500 text-white hover:bg-state-danger-600 active:bg-state-danger-600 disabled:bg-slate-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-[15px] gap-2 rounded-xl",
  lg: "h-14 px-6 text-base gap-2.5 rounded-xl",
  icon: "h-11 w-11 rounded-xl shrink-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex select-none items-center justify-center whitespace-nowrap font-semibold",
          "transition-[transform,background-color,box-shadow] duration-150 ease-out",
          "active:scale-[0.96] disabled:pointer-events-none disabled:opacity-60 disabled:active:scale-100",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
