"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addPhoto as addPhotoToStore,
  getDraft,
  getPhotosForAudit,
  removePhoto as removePhotoFromStore,
  setSignature as setSignatureInStore,
  upsertResponse,
} from "@/lib/offline/draft-store";
import { syncDraft } from "@/lib/offline/sync";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { CHECKLIST_AREAS, countLeafItems } from "@/lib/constants/checklist";
import type { AuditDraft, DraftPhoto, ItemStatus } from "@/lib/offline/types";

const AUTOSAVE_DEBOUNCE_MS = 1200;

export interface AuditProgress {
  total: number;
  answered: number;
  okCount: number;
  nonCompliantCount: number;
  percentage: number;
}

function computeProgress(draft: AuditDraft | null): AuditProgress {
  const total = countLeafItems(CHECKLIST_AREAS);
  if (!draft) return { total, answered: 0, okCount: 0, nonCompliantCount: 0, percentage: 0 };

  const responses = Object.values(draft.responses).filter((r) => r.status !== null);
  const okCount = responses.filter((r) => r.status === "ok").length;
  const nonCompliantCount = responses.filter((r) => r.status === "non_compliant").length;
  return {
    total,
    answered: responses.length,
    okCount,
    nonCompliantCount,
    percentage: total > 0 ? Math.round((responses.length / total) * 100) : 0,
  };
}

export function useAuditDraft(auditId: string) {
  const [draft, setDraft] = useState<AuditDraft | null>(null);
  const [photosByItem, setPhotosByItem] = useState<Record<string, DraftPhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOffline = useRef(false);

  const refreshPhotos = useCallback(async () => {
    const photos = await getPhotosForAudit(auditId);
    const grouped: Record<string, DraftPhoto[]> = {};
    for (const photo of photos) {
      (grouped[photo.itemId] ??= []).push(photo);
    }
    setPhotosByItem(grouped);
  }, [auditId]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [loadedDraft] = await Promise.all([getDraft(auditId), refreshPhotos()]);
      if (!active) return;
      setDraft(loadedDraft ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [auditId, refreshPhotos]);

  const scheduleSync = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const synced = await syncDraft(auditId);
      setDraft(synced);
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [auditId]);

  useEffect(() => {
    if (isOnline && wasOffline.current) {
      syncDraft(auditId).then(setDraft);
    }
    wasOffline.current = !isOnline;
  }, [isOnline, auditId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setStatus = useCallback(
    async (itemId: string, status: ItemStatus) => {
      const updated = await upsertResponse(auditId, itemId, { status });
      if (updated) setDraft({ ...updated, responses: { ...updated.responses } });
      scheduleSync();
    },
    [auditId, scheduleSync]
  );

  const setJustification = useCallback(
    async (itemId: string, justification: string) => {
      const updated = await upsertResponse(auditId, itemId, { justification });
      if (updated) setDraft({ ...updated, responses: { ...updated.responses } });
      scheduleSync();
    },
    [auditId, scheduleSync]
  );

  const setNotes = useCallback(
    async (itemId: string, notes: string) => {
      const updated = await upsertResponse(auditId, itemId, { notes });
      if (updated) setDraft({ ...updated, responses: { ...updated.responses } });
      scheduleSync();
    },
    [auditId, scheduleSync]
  );

  const addPhoto = useCallback(
    async (itemId: string, blob: Blob, mimeType: string) => {
      await addPhotoToStore(auditId, itemId, blob, mimeType);
      await refreshPhotos();
      scheduleSync();
    },
    [auditId, refreshPhotos, scheduleSync]
  );

  const removePhoto = useCallback(
    async (photoId: string) => {
      await removePhotoFromStore(photoId);
      await refreshPhotos();
    },
    [refreshPhotos]
  );

  const saveSignature = useCallback(
    async (blob: Blob) => {
      await setSignatureInStore(auditId, blob, "image/png");
      scheduleSync();
    },
    [auditId, scheduleSync]
  );

  const forceSync = useCallback(async () => {
    const synced = await syncDraft(auditId);
    setDraft(synced);
    return synced;
  }, [auditId]);

  return {
    draft,
    loading,
    isOnline,
    photosByItem,
    progress: computeProgress(draft),
    setStatus,
    setJustification,
    setNotes,
    addPhoto,
    removePhoto,
    saveSignature,
    forceSync,
  };
}
