"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-state-danger-50 text-state-danger-600">
        <TriangleAlert className="size-11" />
      </span>
      <div>
        <h1 className="font-display text-xl font-extrabold text-slate-900">Algo deu errado</h1>
        <p className="mt-1.5 max-w-xs text-sm text-slate-500">
          Não foi possível carregar esta página agora. Tente novamente em instantes.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-14 items-center justify-center rounded-xl bg-brand-blue-600 px-6 text-base font-semibold text-white shadow-raised transition-[transform,background-color] duration-150 ease-out hover:bg-brand-blue-500 active:scale-[0.96] active:bg-brand-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
