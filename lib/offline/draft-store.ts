import { getDb } from "@/lib/offline/db";
import type { AuditDraft, DraftPhoto, DraftResponse, DraftSignature, ItemStatus } from "@/lib/offline/types";
import { generateAuditNumber } from "@/lib/utils/audit-number";

export async function createDraft(input: {
  auditId: string;
  locationId: string;
  supervisorId: string;
  supervisorName: string;
}): Promise<AuditDraft> {
  const draft: AuditDraft = {
    auditId: input.auditId,
    auditNumber: generateAuditNumber(),
    locationId: input.locationId,
    supervisorId: input.supervisorId,
    supervisorName: input.supervisorName,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    completedAt: null,
    responses: {},
    signature: null,
    remoteCreated: false,
    syncState: "idle",
    lastSyncedAt: null,
    lastError: null,
  };
  const db = await getDb();
  await db.put("drafts", draft);
  return draft;
}

export async function getDraft(auditId: string): Promise<AuditDraft | undefined> {
  const db = await getDb();
  return db.get("drafts", auditId);
}

export async function saveDraft(draft: AuditDraft): Promise<void> {
  const db = await getDb();
  await db.put("drafts", draft);
}

export async function listInProgressDrafts(): Promise<AuditDraft[]> {
  const db = await getDb();
  const all = await db.getAll("drafts");
  return all.filter((d) => d.status === "in_progress").sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function deleteDraft(auditId: string): Promise<void> {
  const db = await getDb();
  await db.delete("drafts", auditId);
  const photos = await db.getAllFromIndex("photos", "by-audit", auditId);
  await Promise.all(photos.map((p) => db.delete("photos", p.id)));
  await db.delete("signatures", auditId);
}

export async function upsertResponse(
  auditId: string,
  itemId: string,
  patch: Partial<Pick<DraftResponse, "status" | "justification" | "notes">>
): Promise<AuditDraft | undefined> {
  const db = await getDb();
  const draft = await db.get("drafts", auditId);
  if (!draft) return undefined;

  const existing: DraftResponse = draft.responses[itemId] ?? {
    itemId,
    status: null,
    justification: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  };

  draft.responses[itemId] = {
    ...existing,
    ...patch,
    itemId,
    updatedAt: new Date().toISOString(),
  };
  draft.syncState = "idle";
  await db.put("drafts", draft);
  return draft;
}

export function setItemStatus(auditId: string, itemId: string, status: ItemStatus) {
  return upsertResponse(auditId, itemId, { status });
}

export async function addPhoto(
  auditId: string,
  itemId: string,
  blob: Blob,
  mimeType: string
): Promise<DraftPhoto> {
  const db = await getDb();
  const photo: DraftPhoto & { auditId: string } = {
    id: crypto.randomUUID(),
    auditId,
    itemId,
    blob,
    mimeType,
    localUrl: URL.createObjectURL(blob),
    storagePath: null,
    uploaded: false,
    createdAt: new Date().toISOString(),
  };
  await db.put("photos", photo);
  return photo;
}

export async function removePhoto(photoId: string): Promise<void> {
  const db = await getDb();
  const photo = await db.get("photos", photoId);
  if (photo) URL.revokeObjectURL(photo.localUrl);
  await db.delete("photos", photoId);
}

export async function getPhotosForAudit(auditId: string): Promise<DraftPhoto[]> {
  const db = await getDb();
  return db.getAllFromIndex("photos", "by-audit", auditId);
}

export async function getPhotosForItem(auditId: string, itemId: string): Promise<DraftPhoto[]> {
  const photos = await getPhotosForAudit(auditId);
  return photos.filter((p) => p.itemId === itemId);
}

export async function markPhotoUploaded(photoId: string, storagePath: string): Promise<void> {
  const db = await getDb();
  const photo = await db.get("photos", photoId);
  if (!photo) return;
  photo.uploaded = true;
  photo.storagePath = storagePath;
  await db.put("photos", photo);
}

export async function setSignature(auditId: string, blob: Blob, mimeType: string): Promise<void> {
  const db = await getDb();
  const signature: DraftSignature & { auditId: string } = {
    auditId,
    blob,
    mimeType,
    storagePath: null,
    uploaded: false,
  };
  await db.put("signatures", signature);
}

export async function getSignature(auditId: string): Promise<DraftSignature | undefined> {
  const db = await getDb();
  return db.get("signatures", auditId);
}

export async function markSignatureUploaded(auditId: string, storagePath: string): Promise<void> {
  const db = await getDb();
  const signature = await db.get("signatures", auditId);
  if (!signature) return;
  signature.uploaded = true;
  signature.storagePath = storagePath;
  await db.put("signatures", signature);
}
