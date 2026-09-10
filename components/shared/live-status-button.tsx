"use client";

import * as React from "react";
import { Radio } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { APP_TIMEZONE } from "@/lib/utils/format";
import { getStaffCurrentStatus, weekdayLabel, type StaffCurrentStatus } from "@/lib/utils/staff-schedule";

/** Botão flutuante "LIVE": mostra em tempo real onde cada colaboradora está atuando agora. */
export function LiveStatusButton() {
  const [open, setOpen] = React.useState(false);
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, [open]);

  const statuses: StaffCurrentStatus[] = React.useMemo(() => (now ? getStaffCurrentStatus(now) : []), [now]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver colaboradoras ao vivo"
        className="safe-bottom fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-brand-blue-600 px-4 py-3 text-white shadow-float transition-transform active:scale-95 sm:bottom-6"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-danger-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-state-danger-500" />
        </span>
        <Radio className="size-4" />
        <span className="text-xs font-bold tracking-wide">LIVE</span>
      </button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Equipe ao vivo"
        description={now ? `${weekdayLabel(statuses[0]?.weekday ?? null)} — ${formatInTimeZone(now, APP_TIMEZONE, "HH:mm", { locale: ptBR })}` : undefined}
      >
        <ul className="flex flex-col gap-3">
          {statuses.map((staff) => (
            <li key={staff.id} className="rounded-xl border border-slate-100 bg-slate-25 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-slate-900">{staff.name}</span>
                {staff.currentTask ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-state-success-50 px-2 py-0.5 text-[11px] font-semibold text-state-success-600">
                    <span className="size-1.5 rounded-full bg-state-success-500" />
                    Em atividade
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    Fora do horário
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {staff.currentTask ??
                  (staff.nextTask
                    ? `Próxima atividade às ${staff.nextTask.time}: ${staff.nextTask.description}`
                    : "Sem atividades previstas para hoje.")}
              </p>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}
