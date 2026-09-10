import { formatInTimeZone } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/utils/format";

/**
 * Gera um identificador amigável: AUD-YYYYMMDD-XXXX
 * O sufixo usa os últimos 4 dígitos de um timestamp em milissegundos para
 * manter baixíssima chance de colisão sem precisar de uma sequência no banco.
 * O UUID da linha continua sendo a chave primária real.
 */
export function generateAuditNumber(date: Date = new Date()): string {
  const datePart = formatInTimeZone(date, APP_TIMEZONE, "yyyyMMdd");
  const suffix = String(Date.now()).slice(-4);
  return `AUD-${datePart}-${suffix}`;
}
