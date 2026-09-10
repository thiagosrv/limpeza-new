import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Calendar, CheckCircle2, ClipboardList, Clock, TriangleAlert, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { AuditStatusBadge } from "@/components/admin/audit-status-badge";
import { DetailChecklistItem } from "@/components/admin/detail-checklist-item";
import { getAuditDetail } from "@/lib/admin/queries";
import { CHECKLIST_AREAS } from "@/lib/constants/checklist";
import { formatDateTime, formatDuration, formatPercentage } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Detalhe da auditoria",
};

export const dynamic = "force-dynamic";

function InfoStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-50 text-brand-blue-600">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAuditDetail(id);
  if (!detail) notFound();

  const { audit, locationName, supervisorName, responseByItemId, photosByResponseId, photoUrlByPath, signature, signatureUrl } =
    detail;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-brand-blue-600">{audit.audit_number}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">{supervisorName}</h1>
        </div>
        <AuditStatusBadge status={audit.status} />
      </div>

      <Card className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <InfoStat icon={Building2} label="Cliente" value={locationName} />
        <InfoStat icon={User} label="Supervisor" value={supervisorName} />
        <InfoStat icon={Calendar} label="Início" value={formatDateTime(audit.started_at)} />
        <InfoStat
          icon={Clock}
          label="Conclusão"
          value={audit.completed_at ? formatDateTime(audit.completed_at) : "—"}
        />
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex flex-col gap-1.5 p-4">
          <ClipboardList className="size-4.5 text-brand-blue-600" />
          <p className="font-display text-xl font-extrabold tabular-nums text-slate-900">{audit.total_items}</p>
          <p className="text-xs font-semibold text-slate-500">Itens verificados</p>
        </Card>
        <Card className="flex flex-col gap-1.5 p-4">
          <CheckCircle2 className="size-4.5 text-state-success-600" />
          <p className="font-display text-xl font-extrabold tabular-nums text-slate-900">{audit.ok_items}</p>
          <p className="text-xs font-semibold text-slate-500">Conformes</p>
        </Card>
        <Card className="flex flex-col gap-1.5 p-4">
          <TriangleAlert className="size-4.5 text-state-danger-600" />
          <p className="font-display text-xl font-extrabold tabular-nums text-slate-900">{audit.non_compliant_items}</p>
          <p className="text-xs font-semibold text-slate-500">Não conformidades</p>
        </Card>
        <Card className="flex flex-col gap-1.5 p-4">
          <CheckCircle2 className="size-4.5 text-brand-blue-600" />
          <p className="font-display text-xl font-extrabold tabular-nums text-slate-900">
            {formatPercentage(audit.conformity_percentage)}
          </p>
          <p className="text-xs font-semibold text-slate-500">Conformidade · {formatDuration(audit.duration_seconds)}</p>
        </Card>
      </div>

      <Accordion defaultOpen={[]}>
        {CHECKLIST_AREAS.map((area) => {
          const leaves = area.items.flatMap((item) => (item.children?.length ? item.children : [item]));
          const nonCompliant = leaves.filter((leaf) => responseByItemId.get(leaf.id)?.status === "non_compliant").length;

          return (
            <AccordionItem
              key={area.id}
              id={area.id}
              title={area.name}
              subtitle={`${leaves.length} itens`}
              badge={
                nonCompliant > 0 ? (
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-state-danger-50 text-[11px] font-bold text-state-danger-600">
                    {nonCompliant}
                  </span>
                ) : undefined
              }
            >
              {area.items.map((item) =>
                item.children && item.children.length > 0 ? (
                  <div key={item.id} className="flex flex-col gap-2.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.name}</p>
                    {item.children.map((child) => {
                      const response = responseByItemId.get(child.id);
                      return (
                        <DetailChecklistItem
                          key={child.id}
                          name={child.name}
                          response={response}
                          photos={response ? (photosByResponseId.get(response.id) ?? []) : []}
                          photoUrlByPath={photoUrlByPath}
                        />
                      );
                    })}
                  </div>
                ) : (
                  (() => {
                    const response = responseByItemId.get(item.id);
                    return (
                      <DetailChecklistItem
                        key={item.id}
                        name={item.name}
                        response={response}
                        photos={response ? (photosByResponseId.get(response.id) ?? []) : []}
                        photoUrlByPath={photoUrlByPath}
                      />
                    );
                  })()
                )
              )}
            </AccordionItem>
          );
        })}
      </Accordion>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-bold text-slate-900">Assinatura do supervisor</h2>
        {signature && signatureUrl ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full max-w-xs rounded-xl border-2 border-dashed border-slate-200 bg-white p-3 sm:w-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureUrl} alt={`Assinatura de ${signature.supervisor_name}`} className="h-24 w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{signature.supervisor_name}</p>
              <p className="text-xs text-slate-400">assinado em {formatDateTime(signature.signed_at)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Assinatura ainda não registrada nesta auditoria.</p>
        )}
      </Card>
    </div>
  );
}
