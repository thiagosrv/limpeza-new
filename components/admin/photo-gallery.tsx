"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

export interface GalleryPhoto {
  id: string;
  url: string | null;
}

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (photos.length === 0) return null;

  const current = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-transform active:scale-95"
          >
            {photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.url} alt="Evidência fotográfica" className="size-full object-cover" />
            ) : (
              <ImageOff className="size-5 text-slate-300" />
            )}
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)} hideClose>
        {current && (
          <div className="relative flex flex-col items-center gap-3">
            {current.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.url} alt="Evidência fotográfica" className="max-h-[65dvh] w-full rounded-xl object-contain" />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                Imagem indisponível
              </div>
            )}

            {photos.length > 1 && (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))}
                  className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="size-4.5" />
                </button>
                <span className="text-xs font-semibold text-slate-400">
                  {(openIndex ?? 0) + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length))}
                  className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="size-4.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
