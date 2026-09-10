"use client";

import { Trash2 } from "lucide-react";
import type { DraftPhoto } from "@/lib/offline/types";

export function PhotoThumbnails({
  photos,
  onRemove,
}: {
  photos: DraftPhoto[];
  onRemove: (photoId: string) => Promise<void> | void;
}) {
  if (photos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-card"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.localUrl} alt="Evidência fotográfica" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            aria-label="Remover foto"
            className="absolute right-1 top-1 flex size-5.5 items-center justify-center rounded-full bg-brand-blue-900/70 text-white transition-transform active:scale-90"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
