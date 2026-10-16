export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDurationMinutes(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  return `${mins} menit`;
}

export function clampDuration(value: string): number {
  return Math.max(0, Math.min(120, Number(value) || 0));
}
