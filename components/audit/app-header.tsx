import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
        "safe-top sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur",
        className
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          aria-label="Voltar"
          className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 active:bg-slate-200"
        >
          <ChevronLeft className="size-5" />
        </Link>
      )}
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-card ring-1 ring-slate-100">
        <Image src="/logo.png" alt="PS Proteção" fill sizes="40px" className="object-cover" priority />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[15px] font-bold leading-tight text-slate-900">{title}</h1>
        {subtitle && <p className="truncate text-xs font-medium text-slate-500">{subtitle}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}
