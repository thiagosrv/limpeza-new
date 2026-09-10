import { Check, CloudOff, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SyncState } from "@/lib/offline/types";

const CONFIG: Record<SyncState, { label: string; icon: React.ReactNode; className: string }> = {
  idle: { label: "", icon: null, className: "opacity-0" },
  saving: {
    label: "Salvando…",
    icon: <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />,
    className: "text-brand-blue-200",
  },
  synced: {
    label: "Salvo",
    icon: <Check className="size-3.5" aria-hidden="true" />,
    className: "text-state-success-500",
  },
  offline: {
    label: "Salvo neste dispositivo",
    icon: <CloudOff className="size-3.5" aria-hidden="true" />,
    className: "text-brand-blue-200",
  },
  error: {
    label: "Não foi possível sincronizar",
    icon: <TriangleAlert className="size-3.5" aria-hidden="true" />,
    className: "text-state-warning-500",
  },
};

export function SaveIndicator({ state, className }: { state: SyncState; className?: string }) {
  const config = CONFIG[state];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity duration-200", config.className, className)}
      aria-live="polite"
    >
      {config.icon}
      {config.label}
    </span>
  );
}
