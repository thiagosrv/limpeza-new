import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full resize-none rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400",
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
Textarea.displayName = "Textarea";
