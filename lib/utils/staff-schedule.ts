import { formatInTimeZone } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/utils/format";
import { STAFF_SCHEDULES, WEEKDAY_LABELS, type Weekday } from "@/lib/constants/staff-schedules";

const ISO_WEEKDAY_MAP: Record<string, Weekday | null> = {
  "1": "segunda",
  "2": "terca",
  "3": "quarta",
  "4": "quinta",
  "5": "sexta",
  "6": null,
  "7": null,
};

export interface StaffCurrentStatus {
  id: string;
  name: string;
  weekday: Weekday | null;
  /** Tarefa/local atual, ou `null` fora do horário de trabalho. */
  currentTask: string | null;
  /** Próxima tarefa agendada, quando fora do horário mas ainda é dia útil. */
  nextTask: { time: string; description: string } | null;
}

function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor(minutes % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}`;
}

/** Calcula, para cada colaboradora, onde ela está atuando no instante informado. */
export function getStaffCurrentStatus(at: Date = new Date()): StaffCurrentStatus[] {
  const isoWeekday = formatInTimeZone(at, APP_TIMEZONE, "i");
  const weekday = ISO_WEEKDAY_MAP[isoWeekday] ?? null;
  const nowMinutes = Number(formatInTimeZone(at, APP_TIMEZONE, "H")) * 60 + Number(formatInTimeZone(at, APP_TIMEZONE, "m"));

  return STAFF_SCHEDULES.map((staff) => {
    const group = weekday ? staff.groups.find((g) => g.days.includes(weekday)) : undefined;

    if (!group) {
      return { id: staff.id, name: staff.name, weekday, currentTask: null, nextTask: null };
    }

    const current = group.blocks.find((b) => nowMinutes >= b.start && nowMinutes < b.end);
    if (current) {
      return { id: staff.id, name: staff.name, weekday, currentTask: current.description, nextTask: null };
    }

    const next = group.blocks.find((b) => b.start > nowMinutes);
    return {
      id: staff.id,
      name: staff.name,
      weekday,
      currentTask: null,
      nextTask: next ? { time: minutesToHHmm(next.start), description: next.description } : null,
    };
  });
}

export function weekdayLabel(weekday: Weekday | null): string {
  return weekday ? WEEKDAY_LABELS[weekday] : "Fim de semana";
}
