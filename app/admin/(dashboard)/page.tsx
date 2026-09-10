import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, TriangleAlert } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { AuditStatusBadge } from "@/components/admin/audit-status-badge";
import { Card } from "@/components/ui/card";
import { getDashboardStats, listAudits } from "@/lib/admin/queries";
import { formatDateTime, formatPercentage } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Painel",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    listAudits({ page: 1 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral das supervisões de limpeza da HANIER.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard icon={ClipboardCheck} label="Auditorias concluídas" value={stats.totalCompleted} tone="blue" />
        <MetricCard icon={CalendarCheck} label="Concluídas hoje" value={stats.todayCompleted} tone="yellow" />
        <MetricCard icon={TriangleAlert} label="Não conformidades" value={stats.totalNonCompliant} tone="danger" />
        <MetricCard
          icon={CheckCircle2}
          label="Conformidade média"
          value={formatPercentage(stats.averageConformity)}
          tone="success"
        />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-slate-900">Auditorias recentes</h2>
          <Link
            href="/admin/auditorias"
            className="flex items-center gap-1 text-sm font-semibold text-brand-blue-600 hover:text-brand-blue-700"
          >
            Ver todas
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recent.rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Nenhuma auditoria registrada ainda.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {recent.rows.slice(0, 6).map((row) => (
              <Link
                key={row.id}
                href={`/admin/auditorias/${row.id}`}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{row.supervisorName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {row.auditNumber} · {formatDateTime(row.startedAt)}
                  </p>
                </div>
                <AuditStatusBadge status={row.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
