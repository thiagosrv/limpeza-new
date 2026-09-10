"use client";

import { Home, ListChecks, PieChart, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type BottomNavTab = "inicio" | "checklist" | "progresso" | "finalizar";

const TABS: { key: BottomNavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "inicio", label: "Início", icon: Home },
  { key: "checklist", label: "Checklist", icon: ListChecks },
  { key: "progresso", label: "Progresso", icon: PieChart },
  { key: "finalizar", label: "Finalizar", icon: Send },
];

export function BottomNavigation({
  active,
  onNavigate,
}: {
  active: BottomNavTab;
  onNavigate: (tab: BottomNavTab) => void;
}) {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 backdrop-blur"
      aria-label="Navegação da auditoria"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition-colors",
                isActive ? "text-brand-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("size-5", isActive && "fill-brand-blue-50")} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
