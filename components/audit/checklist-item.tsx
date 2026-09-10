"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { StatusSelector } from "@/components/audit/status-selector";
import { PhotoThumbnails } from "@/components/audit/photo-thumbnails";
import { Textarea } from "@/components/ui/textarea";
import type { DraftPhoto, DraftResponse, ItemStatus } from "@/lib/offline/types";

export function ChecklistItem({
  itemId,
  name,
  response,
  photos,
  onStatusChange,
  onJustificationChange,
  onNotesChange,
  onAddPhoto,
  onRemovePhoto,
}: {
  itemId: string;
  name: string;
  response: DraftResponse | undefined;
  photos: DraftPhoto[];
  onStatusChange: (status: ItemStatus) => void;
  onJustificationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onAddPhoto: (blob: Blob, mimeType: string) => Promise<void> | void;
  onRemovePhoto: (photoId: string) => Promise<void> | void;
}) {
  const [showNotes, setShowNotes] = useState(Boolean(response?.notes));
  const status = response?.status ?? null;
  const isNonCompliant = status === "non_compliant";
  const justificationEmpty = isNonCompliant && !response?.justification?.trim();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-25 p-3.5" id={`item-${itemId}`}>
      <p className="text-sm font-semibold text-slate-800">{name}</p>

      <StatusSelector value={status} onChange={onStatusChange} photoCount={photos.length} onAddPhoto={onAddPhoto} />

      <PhotoThumbnails photos={photos} onRemove={onRemovePhoto} />

      {isNonCompliant && (
        <div className="flex flex-col gap-1.5">
          <Textarea
            value={response?.justification ?? ""}
            onChange={(e) => onJustificationChange(e.target.value)}
            placeholder="Descreva o problema encontrado…"
            invalid={justificationEmpty}
            aria-label="Justificativa da não conformidade"
            rows={2}
          />
          {justificationEmpty && (
            <p className="text-xs font-medium text-state-danger-600" role="alert">
              Descreva o problema encontrado.
            </p>
          )}
        </div>
      )}

      {showNotes ? (
        <Textarea
          value={response?.notes ?? ""}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Observações (opcional)…"
          aria-label="Observações"
          rows={2}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="flex items-center gap-1.5 self-start text-xs font-semibold text-slate-400 transition-colors hover:text-brand-blue-600"
        >
          <MessageSquarePlus className="size-3.5" />
          Adicionar observação
        </button>
      )}
    </div>
  );
}
