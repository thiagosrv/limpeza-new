"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ConnectionBadge } from "@/components/shared/connection-badge";
import { cn } from "@/lib/utils/cn";

export function AppHeader({
  title,
  subtitle,
  backHref,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 border-b-2 border-brand-yellow-400 bg-gradient-to-r from-brand-blue-700 via-brand-blue-600 to-brand-blue-700 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] shadow-raised",
        className
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          aria-label="Voltar"
          className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-blue-200 transition-colors hover:bg-white/10 hover:text-white active:bg-white/15"
        >
          <ChevronLeft className="size-5" />
        </Link>
      )}
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-card ring-1 ring-white/15">
        <Image src="/logo.png" alt="PS Proteção" fill sizes="40px" className="object-cover" priority />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[15px] font-bold leading-tight text-white">{title}</h1>
        {subtitle && <p className="truncate text-xs font-medium text-brand-blue-200">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ConnectionBadge />
        {right}
      </div>
    </header>
  );
}
