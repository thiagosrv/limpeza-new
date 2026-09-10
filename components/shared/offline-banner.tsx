"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils/cn";

export function OfflineBanner({ className }: { className?: string }) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 bg-brand-blue-700 px-4 py-2 text-center text-sm font-semibold text-white",
        className
      )}
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      Sem conexão — sua auditoria está salva neste dispositivo.
    </div>
  );
}
