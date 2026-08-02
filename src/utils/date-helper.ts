import type { Session } from "@/types/shared";

// ---- Small date helpers (local time, DST-safe) ---------------------------
export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function isSameDay(a: number, b: number): boolean {
  return dayKey(a) === dayKey(b);
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatHour12(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${period}`;
}

export function minutesOf(list: Session[]): number {
  return Math.round(
    list.reduce((sum, s) => sum + (s.end - s.start), 0) / 60000,
  );
}
