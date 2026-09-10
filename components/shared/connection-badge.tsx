"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils/cn";

export function ConnectionBadge({ className }: { className?: string }) {
  const isOnline = useOnlineStatus();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors duration-200",
        isOnline
          ? "border-state-success-500/40 bg-state-success-500/20 text-state-success-50"
          : "border-white/10 bg-white/5 text-brand-blue-200",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full transition-all duration-200",
          isOnline ? "bg-state-success-500 shadow-[0_0_6px_2px_rgba(28,154,82,0.65)]" : "bg-slate-300"
        )}
      />
      {isOnline ? "Conectado" : "Offline"}
    </span>
  );
}
