import { Suspense } from "react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/admin/filter-bar";
import { AuditTable } from "@/components/admin/audit-table";
import { Pagination } from "@/components/admin/pagination";
import { listAudits } from "@/lib/admin/queries";
import { auditFilterSchema } from "@/lib/validation/schemas";

export const metadata: Metadata = {
  title: "Auditorias",
};

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuditoriasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const rawParams = await searchParams;

  const filters = auditFilterSchema.parse({
    q: firstValue(rawParams.q),
    supervisorId: firstValue(rawParams.supervisorId) || undefined,
    locationId: firstValue(rawParams.locationId) || undefined,
    status: firstValue(rawParams.status) || undefined,
    onlyNonCompliant: firstValue(rawParams.onlyNonCompliant),
    from: firstValue(rawParams.from) || undefined,
    to: firstValue(rawParams.to) || undefined,
    page: firstValue(rawParams.page) ?? "1",
  });

  const result = await listAudits(filters);

  const flatParams: Record<string, string | undefined> = {
    q: filters.q,
    supervisorId: filters.supervisorId,
    locationId: filters.locationId,
    status: filters.status,
    onlyNonCompliant: filters.onlyNonCompliant ? "true" : undefined,
    from: filters.from,
    to: filters.to,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Auditorias</h1>
        <p className="mt-1 text-sm text-slate-500">Histórico completo de supervisões realizadas.</p>
      </div>

      <Suspense>
        <FilterBar />
      </Suspense>

      <Card className="p-5">
        <AuditTable rows={result.rows} />
        <div className="mt-2">
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            basePath="/admin/auditorias"
            searchParams={flatParams}
          />
        </div>
      </Card>
    </div>
  );
}
