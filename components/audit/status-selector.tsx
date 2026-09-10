"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ItemStatus } from "@/lib/offline/types";

export function StatusSelector({
  value,
  onChange,
}: {
  value: ItemStatus | null;
  onChange: (status: ItemStatus) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Status do item">
      <button
        type="button"
        role="radio"
        aria-checked={value === "ok"}
        onClick={() => onChange("ok")}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 active:scale-[0.96]",
          value === "ok"
            ? "animate-stamp-pop border-state-success-500 bg-state-success-50 text-state-success-600"
            : "border-slate-200 bg-white text-slate-500 hover:border-state-success-500/40 hover:text-state-success-600"
        )}
      >
        <Check className="size-4.5" aria-hidden="true" />
        OK
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "non_compliant"}
        onClick={() => onChange("non_compliant")}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 active:scale-[0.96]",
          value === "non_compliant"
            ? "animate-stamp-pop border-state-danger-500 bg-state-danger-50 text-state-danger-600"
            : "border-slate-200 bg-white text-slate-500 hover:border-state-danger-500/40 hover:text-state-danger-600"
        )}
      >
        <X className="size-4.5" aria-hidden="true" />
        NÃO CONFORME
      </button>
    </div>
  );
}
