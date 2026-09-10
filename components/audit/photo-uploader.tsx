"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DraftPhoto } from "@/lib/offline/types";

export function PhotoUploader({
  photos,
  onAdd,
  onRemove,
  className,
}: {
  photos: DraftPhoto[];
  onAdd: (blob: Blob, mimeType: string) => Promise<void> | void;
  onRemove: (photoId: string) => Promise<void> | void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      await onAdd(compressed, compressed.type || "image/jpeg");
    } catch {
      await onAdd(file, file.type || "image/jpeg");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative size-20 shrink-0 overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.localUrl} alt="Evidência fotográfica" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              aria-label="Remover foto"
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-brand-blue-900/70 text-white transition-opacity active:scale-95"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-brand-blue-400 hover:text-brand-blue-500 active:scale-[0.96] disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
          <span className="text-[10px] font-semibold">Foto</span>
        </button>
      </div>
    </div>
  );
}
