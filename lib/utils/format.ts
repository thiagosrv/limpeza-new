import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export const APP_TIMEZONE = "America/Sao_Paulo";

/** Instante UTC (ISO) correspondente à meia-noite de hoje em America/Sao_Paulo. */
export function startOfTodayIso(): string {
  const todayLocalDate = formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd");
  return fromZonedTime(`${todayLocalDate}T00:00:00`, APP_TIMEZONE).toISOString();
}

/** 20/08/2026 */
export function formatDate(date: string | Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "dd/MM/yyyy", { locale: ptBR });
}

/** 10:37 */
export function formatTime(date: string | Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "HH:mm", { locale: ptBR });
}

/** 20/08/2026 — 10:37 */
export function formatDateTime(date: string | Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "dd/MM/yyyy — HH:mm", { locale: ptBR });
}

/** 1h 36min / 36min / 45s */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return `${s}s`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value)}%`;
}
