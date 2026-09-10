import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefForPage(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
      <p className="text-sm text-slate-500">
        {start}–{end} de {total}
      </p>
      <div className="flex items-center gap-2">
        <PageLink href={hrefForPage(page - 1)} disabled={page <= 1} label="Anterior" icon={ChevronLeft} />
        <span className="px-2 text-sm font-semibold text-slate-600">
          {page} / {totalPages}
        </span>
        <PageLink href={hrefForPage(page + 1)} disabled={page >= totalPages} label="Próxima" icon={ChevronRight} iconAfter />
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  icon: Icon,
  iconAfter,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconAfter?: boolean;
}) {
  const classes = cn(
    "flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold transition-colors",
    disabled ? "pointer-events-none text-slate-300" : "text-slate-600 hover:bg-slate-100"
  );

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true">
        {!iconAfter && <Icon className="size-4" />}
        {label}
        {iconAfter && <Icon className="size-4" />}
      </span>
    );
  }

  return (
    <Link href={href} className={classes}>
      {!iconAfter && <Icon className="size-4" />}
      {label}
      {iconAfter && <Icon className="size-4" />}
    </Link>
  );
}
