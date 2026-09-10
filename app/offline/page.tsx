import Link from "next/link";
import { CloudOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sem conexão",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-600">
        <CloudOff className="size-11" />
      </span>
      <div>
        <h1 className="font-display text-xl font-extrabold text-slate-900">Sem conexão</h1>
        <p className="mt-1.5 max-w-xs text-sm text-slate-500">
          Esta página ainda não foi carregada neste dispositivo. Auditorias em andamento continuam salvas e
          disponíveis normalmente.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-14 items-center justify-center rounded-xl bg-brand-blue-600 px-6 text-base font-semibold text-white shadow-raised transition-[transform,background-color] duration-150 ease-out hover:bg-brand-blue-500 active:scale-[0.96] active:bg-brand-blue-700"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
