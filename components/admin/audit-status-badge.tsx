import { Badge } from "@/components/ui/badge";
import type { AuditStatus } from "@/types/database";

const STATUS_CONFIG: Record<AuditStatus, { label: string; tone: "success" | "blue" | "neutral" }> = {
  completed: { label: "Concluída", tone: "success" },
  in_progress: { label: "Em andamento", tone: "blue" },
  draft: { label: "Rascunho", tone: "neutral" },
};

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
