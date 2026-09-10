import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        invalid ? "border-state-danger-500" : "border-slate-200 hover:border-slate-300",
        className
      )}
      aria-invalid={invalid}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-state-danger-500"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-state-danger-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
