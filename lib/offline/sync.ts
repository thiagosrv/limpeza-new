"use client";

import { createClient } from "@/lib/supabase/client";
import { ensureAnonymousSession } from "@/lib/supabase/anon-session";
import { getDraft, getPhotosForAudit, getSignature, markPhotoUploaded, markSignatureUploaded, saveDraft } from "@/lib/offline/draft-store";
import { countLeafItems } from "@/lib/constants/checklist";
import type { AuditDraft } from "@/lib/offline/types";

function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

async function logEvent(auditId: string, eventType: string, payload?: Record<string, unknown>) {
  const supabase = createClient();
  await supabase.from("audit_events").insert({
    audit_id: auditId,
    event_type: eventType,
    payload: payload ?? null,
  });
}

async function ensureAuditOnServer(draft: AuditDraft) {
  const supabase = createClient();
  const { error } = await supabase.from("audits").upsert(
    {
      id: draft.auditId,
      audit_number: draft.auditNumber,
      location_id: draft.locationId,
      supervisor_id: draft.supervisorId,
      status: draft.status,
      started_at: draft.startedAt,
    },
    { onConflict: "id" }
  );
  if (error) throw error;
  if (!draft.remoteCreated) {
    await logEvent(draft.auditId, "audit_started", { supervisorName: draft.supervisorName });
  }
}

async function pushResponses(draft: AuditDraft): Promise<Map<string, string>> {
  const supabase = createClient();
  const rows = Object.values(draft.responses).filter((r) => {
    const hasContent = r.status !== null || r.justification.trim() || r.notes.trim();
    if (!hasContent) return false;
    // O banco exige justificativa preenchida quando o status é "não conforme".
    // Enquanto o supervisor ainda está digitando, adiar o envio deste item em
    // vez de tentar sincronizar e receber um erro do servidor.
    if (r.status === "non_compliant" && !r.justification.trim()) return false;
    return true;
  });

  if (rows.length > 0) {
    const { error } = await supabase.from("audit_responses").upsert(
      rows.map((r) => ({
        audit_id: draft.auditId,
        audit_item_id: r.itemId,
        status: r.status,
        justification: r.justification.trim() || null,
        notes: r.notes.trim() || null,
      })),
      { onConflict: "audit_id,audit_item_id" }
    );
    if (error) throw error;
  }

  const { data, error: fetchError } = await supabase
    .from("audit_responses")
    .select("id, audit_item_id")
    .eq("audit_id", draft.auditId);
  if (fetchError) throw fetchError;

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.audit_item_id as string, row.id as string);
  }
  return map;
}

async function pushPhotos(draft: AuditDraft, responseIdByItem: Map<string, string>) {
  const supabase = createClient();
  const photos = await getPhotosForAudit(draft.auditId);
  const pending = photos.filter((p) => !p.uploaded);

  for (const photo of pending) {
    const responseId = responseIdByItem.get(photo.itemId);
    if (!responseId) continue;

    const extension = photo.mimeType === "image/png" ? "png" : "jpg";
    const storagePath = `${draft.auditId}/${photo.itemId}/${photo.id}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("audit-photos")
      .upload(storagePath, photo.blob, { contentType: photo.mimeType, upsert: true });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("audit_photos").insert({
      audit_id: draft.auditId,
      audit_response_id: responseId,
      storage_path: storagePath,
      original_filename: `${photo.itemId}.${extension}`,
    });
    if (insertError) throw insertError;

    await markPhotoUploaded(photo.id, storagePath);
  }
}

async function pushCompletion(draft: AuditDraft) {
  if (draft.status !== "completed" || !draft.completedAt) return;

  const summary = computeSummary(draft);
  const startedAt = new Date(draft.startedAt).getTime();
  const completedAt = new Date(draft.completedAt).getTime();
  const durationSeconds = Math.max(0, Math.round((completedAt - startedAt) / 1000));

  const supabase = createClient();
  const { error } = await supabase
    .from("audits")
    .update({
      status: "completed",
      completed_at: draft.completedAt,
      duration_seconds: durationSeconds,
      total_items: summary.totalItems,
      ok_items: summary.okItems,
      non_compliant_items: summary.nonCompliantItems,
      conformity_percentage: summary.conformityPercentage,
    })
    .eq("id", draft.auditId);
  if (error) throw error;

  await logEvent(draft.auditId, "audit_finished", { ...summary, durationSeconds });
}

async function pushSignature(draft: AuditDraft) {
  const signature = await getSignature(draft.auditId);
  if (!signature || signature.uploaded) return;

  const supabase = createClient();
  const storagePath = `${draft.auditId}/signature.png`;

  const { error: uploadError } = await supabase.storage
    .from("audit-signatures")
    .upload(storagePath, signature.blob, { contentType: signature.mimeType, upsert: true });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("audit_signatures").upsert(
    {
      audit_id: draft.auditId,
      supervisor_name: draft.supervisorName,
      storage_path: storagePath,
      signed_at: new Date().toISOString(),
    },
    { onConflict: "audit_id" }
  );
  if (insertError) throw insertError;

  await markSignatureUploaded(draft.auditId, storagePath);
}

/** Envia o estado atual do rascunho para o Supabase (idempotente). */
export async function syncDraft(auditId: string): Promise<AuditDraft> {
  let draft = await getDraft(auditId);
  if (!draft) throw new Error("Rascunho não encontrado.");

  draft.syncState = "saving";
  await saveDraft(draft);

  try {
    const userId = await ensureAnonymousSession();
    if (!userId) {
      draft.syncState = isDeviceOffline() ? "offline" : "error";
      draft.lastError = isDeviceOffline() ? null : "Não foi possível autenticar com o servidor.";
      await saveDraft(draft);
      return draft;
    }

    await ensureAuditOnServer(draft);
    const responseIdByItem = await pushResponses(draft);
    await pushPhotos(draft, responseIdByItem);
    await pushSignature(draft);
    await pushCompletion(draft);

    draft = (await getDraft(auditId)) ?? draft;
    draft.remoteCreated = true;
    draft.syncState = "synced";
    draft.lastSyncedAt = new Date().toISOString();
    draft.lastError = null;
    await saveDraft(draft);
    return draft;
  } catch (error) {
    draft = (await getDraft(auditId)) ?? draft;
    draft.syncState = isDeviceOffline() ? "offline" : "error";
    draft.lastError = error instanceof Error ? error.message : "Falha ao sincronizar.";
    await saveDraft(draft);
    return draft;
  }
}

export interface FinalizeSummary {
  totalItems: number;
  okItems: number;
  nonCompliantItems: number;
  conformityPercentage: number;
}

export function computeSummary(draft: AuditDraft): FinalizeSummary {
  const totalItems = countLeafItems();
  const answered = Object.values(draft.responses).filter((r) => r.status !== null);
  const okItems = answered.filter((r) => r.status === "ok").length;
  const nonCompliantItems = answered.filter((r) => r.status === "non_compliant").length;
  const conformityPercentage = answered.length > 0 ? Math.round((okItems / answered.length) * 100) : 0;
  return { totalItems, okItems, nonCompliantItems, conformityPercentage };
}

/**
 * Marca a auditoria como concluída localmente e tenta sincronizar tudo
 * (respostas, fotos, assinatura e totais) com o Supabase. Nunca lança erro:
 * se o dispositivo estiver offline, a auditoria já está salva localmente com
 * `status: 'completed'` e será sincronizada automaticamente na reconexão
 * (ver `useAuditDraft`). O chamador deve checar `draft.syncState` para
 * decidir a mensagem exibida ao usuário.
 */
export async function finalizeAudit(auditId: string): Promise<AuditDraft> {
  let draft = await getDraft(auditId);
  if (!draft) throw new Error("Rascunho não encontrado.");

  draft.status = "completed";
  draft.completedAt = new Date().toISOString();
  await saveDraft(draft);

  draft = await syncDraft(auditId);
  return draft;
}
