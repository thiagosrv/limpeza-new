import { CheckCircle2, ClipboardList, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { AuditProgress } from "@/hooks/use-audit-draft";

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: "blue" | "success" | "danger";
}) {
  const toneClasses = {
    blue: "bg-brand-blue-50 text-brand-blue-600",
    success: "bg-state-success-50 text-state-success-600",
    danger: "bg-state-danger-50 text-state-danger-600",
  } as const;

  return (
    <Card className="flex flex-col gap-2 p-4">
      <span className={cn("flex size-9 items-center justify-center rounded-lg", toneClasses[tone])}>
        <Icon className="size-5" />
      </span>
      <span className="font-display text-2xl font-extrabold tabular-nums text-slate-900">{value}</span>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </Card>
  );
}

export function AuditSummary({ progress }: { progress: AuditProgress }) {
  const conformityPercentage = progress.answered > 0 ? Math.round((progress.okCount / progress.answered) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard icon={ClipboardList} label="Itens verificados" value={`${progress.answered}/${progress.total}`} tone="blue" />
      <StatCard icon={CheckCircle2} label="Conformes" value={progress.okCount} tone="success" />
      <StatCard icon={TriangleAlert} label="Não conformidades" value={progress.nonCompliantCount} tone="danger" />
      <StatCard icon={CheckCircle2} label="% de conformidade" value={`${conformityPercentage}%`} tone="blue" />
    </div>
  );
}
