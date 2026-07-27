// ---- Shared types, config, and helpers -----------------------------------
// Used by both PomodoroTimer.tsx and SessionTimeline.tsx so the two tabs
// always agree on mode colors, labels, and how a logged session looks.

export type ModeKey = "focus" | "short" | "long";

export interface ModeConfig {
  label: string;
  minutes: number;
  color: string;
}

export type Durations = Record<ModeKey, number>;

export interface SessionRecord {
  id: string;
  mode: ModeKey;
  start: number; // epoch ms
  end: number; // epoch ms
  completed: boolean; // true = selesai penuh, false = dihentikan lebih awal
}

export const MODES: Record<ModeKey, ModeConfig> = {
  focus: { label: "Focus", minutes: 25, color: "#c25b3a" },
  short: { label: "Short break", minutes: 5, color: "#3a7d63" },
  long: { label: "Long break", minutes: 15, color: "#3a5f7d" },
};

export const CYCLES_BEFORE_LONG_BREAK = 4;

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDurationMinutes(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  return `${mins} menit`;
}

// Simple two-tone chime using the Web Audio API — no external assets needed.
export function playChime(): void {
  try {
    const AudioContextClass = window.AudioContext;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.2 + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.4);
    });
  } catch (e) {
    console.error(e);
    // Audio not available — fail silently.
  }
}
