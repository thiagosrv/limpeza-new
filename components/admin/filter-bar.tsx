"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SUPERVISORS } from "@/lib/constants/checklist";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "completed", label: "Concluída" },
  { value: "in_progress", label: "Em andamento" },
];

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const hasFilters =
    searchParams.get("q") ||
    searchParams.get("supervisorId") ||
    searchParams.get("status") ||
    searchParams.get("onlyNonCompliant");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <form
        className="relative flex-1 sm:max-w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", q);
        }}
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => updateParam("q", q)}
          placeholder="Buscar por número da auditoria"
          className="pl-10"
        />
      </form>

      <Select
        value={searchParams.get("supervisorId") ?? ""}
        onChange={(e) => updateParam("supervisorId", e.target.value)}
        className="sm:w-52"
      >
        <option value="">Todos os supervisores</option>
        {SUPERVISORS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      <Select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="sm:w-44"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[15px] font-medium text-slate-700">
        <input
          type="checkbox"
          checked={searchParams.get("onlyNonCompliant") === "true"}
          onChange={(e) => updateParam("onlyNonCompliant", e.target.checked ? "true" : "")}
          className="size-4 rounded border-slate-300 text-brand-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500"
        />
        Só com não conformidade
      </label>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push(pathname);
          }}
          className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-4" />
          Limpar filtros
        </button>
      )}
    </div>
  );
}
