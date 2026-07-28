export type ViewKey = "timer" | "timeline" | "dashboard" | "settings";
export type ModeKey = 0 | 1 | 2;

export interface ModeConfig {
  key: ModeKey;
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
