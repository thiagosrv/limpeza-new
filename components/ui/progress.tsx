import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export function Progress({ value, max = 100, className, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-brand-blue-600 transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: React.ReactNode;
}

export function ProgressRing({ value, max = 100, size = 44, strokeWidth = 4, className, label }: ProgressRingProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const complete = pct >= 100;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-slate-100)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={complete ? "var(--color-state-success-500)" : "var(--color-brand-blue-600)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset,stroke] duration-300 ease-out"
        />
      </svg>
      {label !== undefined && (
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-slate-700">
          {label}
        </span>
      )}
    </div>
  );
}
