export function minutesSinceMidnight(ms: number): number {
  const d = new Date(ms);

  // Guard against invalid date parameters
  if (isNaN(d.getTime())) return 0;

  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

export function atTodayTime(hour: number, minute: number): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export function clampDuration(value: string): number {
  return Math.max(1, Math.min(120, Number(value) || 1));
}
