import { Progress } from "@/components/ui/progress";
import type { AuditProgress } from "@/hooks/use-audit-draft";

export function AuditProgressBar({ progress }: { progress: AuditProgress }) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="tabular-nums">
          {progress.answered} de {progress.total} itens
        </span>
        <span className="tabular-nums text-brand-blue-600">{progress.percentage}%</span>
      </div>
      <Progress value={progress.answered} max={progress.total} />
    </div>
  );
}
