"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, CloudOff, PenLine, Plus, Send, TriangleAlert } from "lucide-react";
import { AppHeader } from "@/components/audit/app-header";
import { AuditSummary } from "@/components/audit/audit-summary";
import { SignaturePad, type SignaturePadHandle } from "@/components/audit/signature-pad";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditDraft } from "@/hooks/use-audit-draft";
import { CHECKLIST_AREAS } from "@/lib/constants/checklist";
import { finalizeAudit } from "@/lib/offline/sync";
import type { AuditDraft } from "@/lib/offline/types";

function getPendingItems(draft: AuditDraft) {
  const pending: { areaName: string; itemName: string }[] = [];
  for (const area of CHECKLIST_AREAS) {
    const leaves = area.items.flatMap((i) => (i.children?.length ? i.children : [i]));
    for (const leaf of leaves) {
      if (!draft.responses[leaf.id]?.status) {
        pending.push({ areaName: area.name, itemName: leaf.name });
      }
    }
  }
  return pending;
}

function getMissingJustifications(draft: AuditDraft) {
  return Object.values(draft.responses).filter(
    (r) => r.status === "non_compliant" && !r.justification.trim()
  );
}

export default function ResumoPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);
  const router = useRouter();
  const signatureRef = useRef<SignaturePadHandle>(null);
  const { draft, loading, progress, saveSignature } = useAuditDraft(auditId);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AuditDraft | null>(null);

  useEffect(() => {
    if (!loading && !draft) {
      toast.error("Não encontramos essa auditoria neste dispositivo.");
      router.replace("/");
    }
  }, [loading, draft, router]);

  if (loading || !draft) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (result) {
    return <SuccessScreen draft={result} onNewAudit={() => router.push("/")} />;
  }

  const pending = getPendingItems(draft);
  const missingJustifications = getMissingJustifications(draft);
  const canSubmit = pending.length === 0 && missingJustifications.length === 0 && hasSignature;

  async function handleSubmit() {
    if (!canSubmit || !signatureRef.current) return;
    setSubmitting(true);
    try {
      const blob = await signatureRef.current.toBlob();
      if (!blob) {
        toast.error("Não foi possível capturar a assinatura. Tente novamente.");
        return;
      }
      await saveSignature(blob);
      const finalized = await finalizeAudit(auditId);
      setResult(finalized);
    } catch {
      toast.error("Não foi possível enviar a auditoria agora. Ela continua salva neste dispositivo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AppHeader title="Resumo e Assinatura" subtitle={draft.supervisorName} backHref={`/auditoria/${auditId}`} />

      <main className="flex-1 space-y-5 px-4 pb-28 pt-4">
        <AuditSummary progress={progress} />

        {pending.length > 0 && (
          <Card className="flex flex-col gap-2.5 border-brand-yellow-200 bg-brand-yellow-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-blue-700">
              <TriangleAlert className="size-4" />
              {pending.length} {pending.length === 1 ? "item pendente" : "itens pendentes"}
            </div>
            <ul className="flex flex-col gap-1 text-sm text-slate-600">
              {pending.slice(0, 6).map((p, i) => (
                <li key={i} className="truncate">
                  <span className="text-slate-400">{p.areaName} · </span>
                  {p.itemName}
                </li>
              ))}
              {pending.length > 6 && <li className="text-slate-400">e mais {pending.length - 6}…</li>}
            </ul>
          </Card>
        )}

        {missingJustifications.length > 0 && (
          <Card className="flex items-center gap-2.5 border-state-danger-200 bg-state-danger-50 p-4 text-sm font-semibold text-state-danger-600">
            <TriangleAlert className="size-4 shrink-0" />
            Há não conformidades sem justificativa preenchida.
          </Card>
        )}

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <PenLine className="size-4" />
            Assinatura de {draft.supervisorName}
          </div>
          <SignaturePad ref={signatureRef} onChange={setHasSignature} />
        </div>

        <Button size="lg" className="w-full" disabled={!canSubmit} loading={submitting} onClick={handleSubmit}>
          <Send className="size-5" />
          ENVIAR AUDITORIA
        </Button>
      </main>
    </>
  );
}

function SuccessScreen({ draft, onNewAudit }: { draft: AuditDraft; onNewAudit: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-state-success-50 text-state-success-600 animate-stamp-pop">
        <CheckCircle2 className="size-11" />
      </span>
      <div>
        <h1 className="font-display text-xl font-extrabold text-slate-900">Auditoria enviada!</h1>
        <p className="mt-1 text-sm text-slate-500">Obrigado, {draft.supervisorName}. O registro foi concluído com sucesso.</p>
      </div>

      <Card className="w-full p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Número da auditoria</p>
        <p className="mt-1 font-mono text-lg font-bold text-brand-blue-700">{draft.auditNumber}</p>
      </Card>

      {draft.syncState !== "synced" && (
        <Card className="flex items-center gap-2.5 border-brand-yellow-200 bg-brand-yellow-50/60 p-4 text-left text-sm font-medium text-brand-blue-700">
          <CloudOff className="size-5 shrink-0" />
          Sem conexão no momento — a auditoria está salva neste aparelho e será enviada automaticamente assim que a internet voltar.
        </Card>
      )}

      <Button size="lg" className="w-full" onClick={onNewAudit}>
        <Plus className="size-5" />
        Nova Auditoria
      </Button>
    </div>
  );
}
