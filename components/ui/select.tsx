import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border bg-white px-3.5 pr-10 text-[15px] text-slate-900",
          "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          invalid ? "border-state-danger-500" : "border-slate-200 hover:border-slate-300",
          className
        )}
        aria-invalid={invalid}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  )
);
Select.displayName = "Select";
