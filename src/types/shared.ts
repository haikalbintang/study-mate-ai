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

export type DurationsState = Record<ModeKey, number | "">;

export type SessionKind = "focus" | "shortBreak" | "longBreak";

export interface Session {
  id: string;
  modeKey: ModeKey;
  mode: SessionKind;
  start: Date;
  end: Date;
  completed: boolean;
}

export interface ActiveSession {
  modeKey: ModeKey;
  mode: SessionKind;
  start: Date;
}

export interface PomodoroContextValue {
  sessions: Session[];
  activeSession: ActiveSession | null;
  now: Date;
  startSession: (modeKey: ModeKey) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => void;
  cancelSession: () => void;
  clearSessions: () => void;
}
