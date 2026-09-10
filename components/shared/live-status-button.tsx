"use client";

import * as React from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils/cn";
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
        className="animate-live-glow animate-stamp-pop fixed bottom-20 right-4 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 pl-3.5 pr-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-white shadow-float ring-1 ring-white/15 transition-transform duration-150 ease-out active:scale-95 sm:bottom-6"
      >
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-danger-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-state-danger-500 ring-2 ring-brand-blue-700/40" />
        </span>
        <Radio className="size-4 shrink-0" strokeWidth={2.5} />
        <span className="text-xs font-extrabold leading-none tracking-widest">LIVE</span>
      </button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Equipe ao vivo"
        description={now ? `${weekdayLabel(statuses[0]?.weekday ?? null)} — ${formatInTimeZone(now, APP_TIMEZONE, "HH:mm", { locale: ptBR })}` : undefined}
      >
        <div className="mb-4 flex items-center gap-1.5">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-danger-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-state-danger-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-state-danger-500">
            Ao vivo · atualiza a cada 30s
          </span>
        </div>

        {now === null ? (
          <p className="py-6 text-center text-sm text-slate-400">Carregando status da equipe…</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {statuses.map((staff, index) => (
              <li
                key={staff.id}
                style={{ animationDelay: `${index * 45}ms` }}
                className={cn(
                  "animate-fade-up flex items-start gap-3 rounded-2xl border p-3 transition-colors",
                  staff.currentTask ? "border-brand-blue-100 bg-brand-blue-50/50" : "border-slate-100 bg-slate-25"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    staff.currentTask ? "bg-brand-blue-600 text-white shadow-card" : "bg-slate-200 text-slate-500"
                  )}
                >
                  {staff.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-slate-900">{staff.name}</span>
                    {staff.currentTask ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-state-success-50 px-2 py-0.5 text-[11px] font-semibold text-state-success-600">
                        <span className="size-1.5 rounded-full bg-state-success-500" />
                        Em atividade
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </>
  );
}
