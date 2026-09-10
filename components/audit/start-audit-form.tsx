"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { HANIER_LOCATION, HANIER_LOCATION_ID, SUPERVISORS } from "@/lib/constants/checklist";
import { startAuditSchema, type StartAuditInput } from "@/lib/validation/schemas";
import { createDraft, listInProgressDrafts } from "@/lib/offline/draft-store";
import { formatDateTime } from "@/lib/utils/format";
import type { AuditDraft } from "@/lib/offline/types";

export function StartAuditForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [inProgress, setInProgress] = useState<AuditDraft[]>([]);

  useEffect(() => {
    listInProgressDrafts().then(setInProgress);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartAuditInput>({
    resolver: zodResolver(startAuditSchema),
    defaultValues: { locationId: HANIER_LOCATION_ID, supervisorId: "" },
  });

  async function onSubmit(values: StartAuditInput) {
    setSubmitting(true);
    const supervisor = SUPERVISORS.find((s) => s.id === values.supervisorId);
    const draft = await createDraft({
      auditId: crypto.randomUUID(),
      locationId: values.locationId,
      supervisorId: values.supervisorId,
      supervisorName: supervisor?.name ?? "",
    });
    router.push(`/auditoria/${draft.auditId}`);
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl shadow-float ring-1 ring-black/5">
          <Image src="/logo.png" alt="PS Proteção" fill sizes="80px" className="object-cover" priority />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-blue-700">PS Proteção</h1>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">Supervisão de Limpeza</p>
        </div>
      </div>

      {inProgress.length > 0 && (
        <Card className="flex flex-col gap-2.5 border-brand-yellow-200 bg-brand-yellow-50/60 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-blue-700">
            <History className="size-4" />
            Visita em andamento
          </div>
          {inProgress.map((d) => (
            <button
              key={d.auditId}
              type="button"
              onClick={() => router.push(`/auditoria/${d.auditId}`)}
              className="flex items-center justify-between gap-2 rounded-lg bg-white px-3.5 py-2.5 text-left shadow-card transition-transform active:scale-[0.98]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">{d.supervisorName}</span>
                <span className="block text-xs text-slate-400">iniciada em {formatDateTime(d.startedAt)}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-brand-blue-500" />
            </button>
          ))}
        </Card>
      )}

      <Card className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Cliente</p>
            <p className="mt-0.5 text-[15px] font-bold text-slate-900">{HANIER_LOCATION.name}</p>
          </div>

          <FormField label="Quem está realizando a supervisão?" htmlFor="supervisorId" error={errors.supervisorId?.message} required>
            <Select id="supervisorId" invalid={Boolean(errors.supervisorId)} {...register("supervisorId")}>
              <option value="">Selecione…</option>
              {SUPERVISORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormField>

          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
            INICIAR VISITA
          </Button>
        </form>
      </Card>

      <p className="px-4 text-center text-[11px] leading-relaxed text-slate-400">
        App desenvolvido para HANIER Ind. Química por PS PROTEÇÃO
      </p>
    </div>
  );
}
