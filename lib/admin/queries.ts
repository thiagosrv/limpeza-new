import { createClient } from "@/lib/supabase/server";
import { startOfTodayIso } from "@/lib/utils/format";
import type { AuditFilterInput } from "@/lib/validation/schemas";
import type { Audit, AuditPhoto, AuditResponse, AuditSignature, AuditStatus } from "@/types/database";

const PAGE_SIZE = 20;

export interface DashboardStats {
  totalCompleted: number;
  todayCompleted: number;
  totalNonCompliant: number;
  averageConformity: number | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: completedAudits, error } = await supabase
    .from("audits")
    .select("completed_at, non_compliant_items, conformity_percentage")
    .eq("status", "completed");

  if (error) throw error;

  const rows = completedAudits ?? [];
  const todayStart = startOfTodayIso();
  const todayCompleted = rows.filter((r) => r.completed_at && r.completed_at >= todayStart).length;
  const totalNonCompliant = rows.reduce((sum, r) => sum + (r.non_compliant_items ?? 0), 0);
  const conformityValues = rows
    .map((r) => r.conformity_percentage)
    .filter((v): v is number => v !== null && v !== undefined);
  const averageConformity =
    conformityValues.length > 0
      ? Math.round(conformityValues.reduce((sum, v) => sum + v, 0) / conformityValues.length)
      : null;

  return {
    totalCompleted: rows.length,
    todayCompleted,
    totalNonCompliant,
    averageConformity,
  };
}

export interface AuditListRow {
  id: string;
  auditNumber: string;
  status: AuditStatus;
  startedAt: string;
  completedAt: string | null;
  conformityPercentage: number | null;
  nonCompliantItems: number;
  totalItems: number;
  locationName: string;
  supervisorName: string;
}

export interface AuditListResult {
  rows: AuditListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listAudits(filters: AuditFilterInput): Promise<AuditListResult> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("audits").select("*", { count: "exact" }).order("started_at", { ascending: false });

  if (filters.q) query = query.ilike("audit_number", `%${filters.q}%`);
  if (filters.supervisorId) query = query.eq("supervisor_id", filters.supervisorId);
  if (filters.locationId) query = query.eq("location_id", filters.locationId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.onlyNonCompliant) query = query.gt("non_compliant_items", 0);
  if (filters.from) query = query.gte("started_at", filters.from);
  if (filters.to) query = query.lte("started_at", filters.to);

  const { data: audits, count, error } = await query.range(from, to);
  if (error) throw error;

  const [{ data: locations }, { data: profiles }] = await Promise.all([
    supabase.from("locations").select("id, name"),
    supabase.from("profiles").select("id, name"),
  ]);

  const locationById = new Map((locations ?? []).map((l) => [l.id, l.name]));
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  const rows: AuditListRow[] = (audits ?? []).map((a) => ({
    id: a.id,
    auditNumber: a.audit_number,
    status: a.status,
    startedAt: a.started_at,
    completedAt: a.completed_at,
    conformityPercentage: a.conformity_percentage,
    nonCompliantItems: a.non_compliant_items,
    totalItems: a.total_items,
    locationName: locationById.get(a.location_id) ?? "—",
    supervisorName: profileById.get(a.supervisor_id) ?? "—",
  }));

  return { rows, total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export interface AuditDetail {
  audit: Audit;
  locationName: string;
  supervisorName: string;
  responseByItemId: Map<string, AuditResponse>;
  photosByResponseId: Map<string, AuditPhoto[]>;
  photoUrlByPath: Map<string, string>;
  signature: AuditSignature | null;
  signatureUrl: string | null;
}

export async function getAuditDetail(id: string): Promise<AuditDetail | null> {
  const supabase = await createClient();

  const { data: audit, error } = await supabase.from("audits").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!audit) return null;

  const [{ data: location }, { data: supervisor }, { data: responses }, { data: photos }, { data: signature }] =
    await Promise.all([
      supabase.from("locations").select("name").eq("id", audit.location_id).maybeSingle(),
      supabase.from("profiles").select("name").eq("id", audit.supervisor_id).maybeSingle(),
      supabase.from("audit_responses").select("*").eq("audit_id", id),
      supabase.from("audit_photos").select("*").eq("audit_id", id),
      supabase.from("audit_signatures").select("*").eq("audit_id", id).maybeSingle(),
    ]);

  const responseByItemId = new Map((responses ?? []).map((r) => [r.audit_item_id, r]));
  const photosByResponseId = new Map<string, AuditPhoto[]>();
  for (const photo of photos ?? []) {
    const list = photosByResponseId.get(photo.audit_response_id) ?? [];
    list.push(photo);
    photosByResponseId.set(photo.audit_response_id, list);
  }

  const photoUrlByPath = new Map<string, string>();
  const photoPaths = (photos ?? []).map((p) => p.storage_path);
  if (photoPaths.length > 0) {
    const { data: signedUrls } = await supabase.storage.from("audit-photos").createSignedUrls(photoPaths, 3600);
    for (const item of signedUrls ?? []) {
      if (item.signedUrl && item.path) photoUrlByPath.set(item.path, item.signedUrl);
    }
  }

  let signatureUrl: string | null = null;
  if (signature) {
    const { data: signedSignature } = await supabase.storage
      .from("audit-signatures")
      .createSignedUrl(signature.storage_path, 3600);
    signatureUrl = signedSignature?.signedUrl ?? null;
  }

  return {
    audit,
    locationName: location?.name ?? "—",
    supervisorName: supervisor?.name ?? "—",
    responseByItemId,
    photosByResponseId,
    photoUrlByPath,
    signature: signature ?? null,
    signatureUrl,
  };
}
