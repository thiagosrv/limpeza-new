import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "blue" | "yellow" | "success" | "danger" | "warning";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  blue: "bg-brand-blue-50 text-brand-blue-600",
  yellow: "bg-brand-yellow-50 text-brand-yellow-600",
  success: "bg-state-success-50 text-state-success-600",
  danger: "bg-state-danger-50 text-state-danger-600",
  warning: "bg-state-warning-50 text-state-warning-500",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
