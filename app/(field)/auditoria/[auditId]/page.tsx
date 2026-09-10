"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppHeader } from "@/components/audit/app-header";
import { BottomNavigation, type BottomNavTab } from "@/components/audit/bottom-navigation";
import { AuditProgressBar } from "@/components/audit/progress-bar";
import { AreaAccordion } from "@/components/audit/area-accordion";
import { Accordion } from "@/components/ui/accordion";
import { Dialog } from "@/components/ui/dialog";
import { ProgressRing } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SaveIndicator } from "@/components/shared/save-indicator";
import { useAuditDraft } from "@/hooks/use-audit-draft";
import { CHECKLIST_AREAS } from "@/lib/constants/checklist";
import { ensureAnonymousSession } from "@/lib/supabase/anon-session";

export default function ChecklistPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);
  const router = useRouter();
  const [showProgress, setShowProgress] = useState(false);

  const {
    draft,
    loading,
    photosByItem,
    progress,
    setStatus,
    setJustification,
    setNotes,
    addPhoto,
    removePhoto,
  } = useAuditDraft(auditId);

  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  useEffect(() => {
    if (!loading && !draft) {
      toast.error("Não encontramos essa auditoria neste dispositivo.");
      router.replace("/");
    }
  }, [loading, draft, router]);

  function handleNavigate(tab: BottomNavTab) {
    if (tab === "inicio" || tab === "checklist") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "progresso") {
      setShowProgress(true);
    } else if (tab === "finalizar") {
      router.push(`/auditoria/${auditId}/resumo`);
    }
  }

  if (loading || !draft) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <>
      <AppHeader
        title={draft.supervisorName}
        subtitle="Hanier Indústria Química"
        right={<SaveIndicator state={draft.syncState} />}
      />
      <AuditProgressBar progress={progress} />

      <main className="flex-1 space-y-3 px-4 pb-28 pt-1">
        <Accordion defaultOpen={[CHECKLIST_AREAS[0]?.id ?? ""]}>
          {CHECKLIST_AREAS.map((area) => (
            <AreaAccordion
              key={area.id}
              area={area}
              draft={draft}
              photosByItem={photosByItem}
              onStatusChange={setStatus}
              onJustificationChange={setJustification}
              onNotesChange={setNotes}
              onAddPhoto={addPhoto}
              onRemovePhoto={removePhoto}
            />
          ))}
        </Accordion>
      </main>

      <BottomNavigation active="checklist" onNavigate={handleNavigate} />

      <Dialog open={showProgress} onOpenChange={setShowProgress} title="Progresso por área">
        <div className="flex flex-col gap-3">
          {CHECKLIST_AREAS.map((area) => {
            const leaves = area.items.flatMap((i) => (i.children?.length ? i.children : [i]));
            const answered = leaves.filter((l) => draft.responses[l.id]?.status).length;
            return (
              <div key={area.id} className="flex items-center gap-3">
                <ProgressRing value={answered} max={leaves.length} size={36} strokeWidth={3.5} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{area.name}</p>
                  <p className="text-xs text-slate-400">
                    {answered} de {leaves.length} itens
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
