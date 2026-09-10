"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logoutAdmin } from "@/app/admin/(dashboard)/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/admin/auditorias", label: "Auditorias", icon: ClipboardList, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-blue-600 text-brand-yellow-400">
            <ShieldCheck className="size-4.5" />
          </span>
          <span className="font-display text-[15px] font-bold text-brand-blue-700">PS Proteção</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg p-2.5 transition-colors",
                isActive(pathname, item.href, item.exact)
                  ? "bg-brand-blue-50 text-brand-blue-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
              aria-label={item.label}
            >
              <item.icon className="size-5" />
            </Link>
          ))}
        </nav>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-blue-600 text-brand-yellow-400 shadow-raised">
            <ShieldCheck className="size-5.5" />
          </span>
          <div>
            <p className="font-display text-base font-extrabold text-brand-blue-700">PS Proteção</p>
            <p className="text-xs font-semibold text-slate-400">Painel Administrativo</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                isActive(pathname, item.href, item.exact)
                  ? "bg-brand-blue-50 text-brand-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-blue-50 text-xs font-bold text-brand-blue-600">
              {adminName.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{adminName}</span>
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-state-danger-50 hover:text-state-danger-600"
            >
              <LogOut className="size-4.5" />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
