export type ItemStatus = "ok" | "non_compliant";

export interface DraftPhoto {
  id: string;
  itemId: string;
  blob: Blob;
  mimeType: string;
  localUrl: string;
  storagePath: string | null;
  uploaded: boolean;
  createdAt: string;
}

export interface DraftResponse {
  itemId: string;
  status: ItemStatus | null;
  justification: string;
  notes: string;
  updatedAt: string;
}

export interface DraftSignature {
  blob: Blob;
  mimeType: string;
  storagePath: string | null;
  uploaded: boolean;
}

export type SyncState = "idle" | "saving" | "synced" | "offline" | "error";

export interface AuditDraft {
  auditId: string;
  auditNumber: string;
  locationId: string;
  supervisorId: string;
  supervisorName: string;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt: string | null;
  responses: Record<string, DraftResponse>;
  signature: DraftSignature | null;
  remoteCreated: boolean;
  syncState: SyncState;
  lastSyncedAt: string | null;
  lastError: string | null;
}
