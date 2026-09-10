"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export function Accordion({
  children,
  defaultOpen = [],
  className,
}: {
  children: React.ReactNode;
  defaultOpen?: string[];
  className?: string;
}) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set(defaultOpen));

  const toggle = React.useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("flex flex-col gap-3", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  id,
  title,
  subtitle,
  badge,
  children,
  className,
}: {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem deve estar dentro de um Accordion");
  const isOpen = ctx.openItems.has(id);
  const panelId = `accordion-panel-${id}`;
  const buttonId = `accordion-trigger-${id}`;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card", className)}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => ctx.toggle(id)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-[15px] font-bold text-slate-900">{title}</span>
            {badge}
          </div>
          {subtitle && <div className="mt-0.5 text-sm text-slate-500">{subtitle}</div>}
        </div>
        <ChevronDown
          className={cn("size-5 shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={cn("grid transition-[grid-template-rows] duration-200 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 border-t border-slate-100 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
