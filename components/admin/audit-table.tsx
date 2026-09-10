import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AuditStatusBadge } from "@/components/admin/audit-status-badge";
import { formatDateTime, formatPercentage } from "@/lib/utils/format";
import type { AuditListRow } from "@/lib/admin/queries";

export function AuditTable({ rows }: { rows: AuditListRow[] }) {
  if (rows.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-400">Nenhuma auditoria encontrada com esses filtros.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
            <th className="py-3 pr-3">Número</th>
            <th className="py-3 pr-3">Supervisor</th>
            <th className="py-3 pr-3">Data</th>
            <th className="py-3 pr-3">Status</th>
            <th className="py-3 pr-3">Conformidade</th>
            <th className="py-3 pr-3">Não conf.</th>
            <th className="py-3 pr-0" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="group">
              <td colSpan={7} className="p-0">
                <Link
                  href={`/admin/auditorias/${row.id}`}
                  className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_2rem] items-center py-3 transition-colors group-hover:bg-slate-50"
                >
                  <span className="truncate pr-3 font-mono text-[13px] font-semibold text-slate-700">
                    {row.auditNumber}
                  </span>
                  <span className="truncate pr-3 font-semibold text-slate-800">{row.supervisorName}</span>
                  <span className="truncate pr-3 text-slate-500">{formatDateTime(row.startedAt)}</span>
                  <span className="pr-3">
                    <AuditStatusBadge status={row.status} />
                  </span>
                  <span className="pr-3 font-semibold tabular-nums text-slate-700">
                    {formatPercentage(row.conformityPercentage)}
                  </span>
                  <span className="pr-3 font-semibold tabular-nums text-state-danger-600">
                    {row.nonCompliantItems > 0 ? row.nonCompliantItems : "—"}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-blue-500" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
