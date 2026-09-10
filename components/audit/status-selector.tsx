"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { playClickSound } from "@/lib/utils/click-sound";
import type { ItemStatus } from "@/lib/offline/types";

export function StatusSelector({
  value,
  onChange,
  photoCount,
  onAddPhoto,
}: {
  value: ItemStatus | null;
  onChange: (status: ItemStatus) => void;
  photoCount: number;
  onAddPhoto: (blob: Blob, mimeType: string) => Promise<void> | void;
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
      await onAddPhoto(compressed, compressed.type || "image/jpeg");
    } catch {
      await onAddPhoto(file, file.type || "image/jpeg");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Avaliação do item">
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

      <button
        type="button"
        role="radio"
        aria-checked={value === "ok"}
        onClick={() => {
          playClickSound();
          onChange("ok");
        }}
        className={cn(
          "relative flex h-[68px] flex-col items-center justify-center gap-1 rounded-xl border-2 text-[11px] font-bold leading-tight transition-all duration-150 active:scale-[0.96]",
          value === "ok"
            ? "animate-stamp-pop animate-toggle-on-success border-state-success-500 bg-state-success-500 text-white shadow-raised"
            : "border-slate-200 bg-slate-50 text-slate-400 shadow-inner hover:border-state-success-500/40 hover:text-state-success-600"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-2.5 top-2.5 size-1.5 rounded-full transition-all duration-200",
            value === "ok" ? "bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.85)]" : "bg-slate-300"
          )}
        />
        <Check className="size-5" aria-hidden="true" />
        Conforme
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={value === "non_compliant"}
        onClick={() => {
          playClickSound();
          onChange("non_compliant");
        }}
        className={cn(
          "relative flex h-[68px] flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 text-center text-[11px] font-bold leading-tight transition-all duration-150 active:scale-[0.96]",
          value === "non_compliant"
            ? "animate-stamp-pop animate-toggle-on-danger border-state-danger-500 bg-state-danger-500 text-white shadow-raised"
            : "border-slate-200 bg-slate-50 text-slate-400 shadow-inner hover:border-state-danger-500/40 hover:text-state-danger-600"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-2.5 top-2.5 size-1.5 rounded-full transition-all duration-200",
            value === "non_compliant" ? "bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.85)]" : "bg-slate-300"
          )}
        />
        <X className="size-5" aria-hidden="true" />
        Não conforme
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={photoCount > 0 ? `Foto — ${photoCount} anexada${photoCount > 1 ? "s" : ""}` : "Adicionar foto"}
        className={cn(
          "relative flex h-[68px] flex-col items-center justify-center gap-1 rounded-xl border-2 text-[11px] font-bold leading-tight transition-all duration-150 active:scale-[0.96] disabled:opacity-60",
          photoCount > 0
            ? "border-brand-blue-500 bg-brand-blue-500 text-white shadow-raised"
            : "border-slate-200 bg-slate-50 text-slate-400 shadow-inner hover:border-brand-blue-400/50 hover:text-brand-blue-600"
        )}
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Camera className="size-5" aria-hidden="true" />
        )}
        Foto
        {photoCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-[18px] items-center justify-center rounded-full bg-brand-yellow-400 text-[10px] font-bold text-brand-blue-700 ring-2 ring-white">
            {photoCount}
          </span>
        )}
      </button>
    </div>
  );
}
