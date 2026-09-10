"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}

export function Dialog({ open, onOpenChange, title, description, children, className, hideClose }: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-brand-blue-900/50 backdrop-blur-[2px] animate-toast-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-float outline-none",
          "sm:max-w-md sm:rounded-2xl",
          className
        )}
      >
        {(title || !hideClose) && (
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              {title && <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Fechar"
                className="-m-2 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
