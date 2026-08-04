export type ViewKey = "timer" | "timeline" | "dashboard" | "settings";
export type ModeKey = 0 | 1 | 2;

export interface ModeConfig {
  key: ModeKey;
  label: string;
  minutes: number;
  color: string;
}

export type Durations = number[];

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
  start: number;
  end: number;
  completed: boolean;
}

export interface ActiveSession {
  modeKey: ModeKey;
  mode: SessionKind;
  start: Date;
}

export interface LiveSession {
  id: string;
  modeKey: ModeKey;
  mode: SessionKind;
  start: Date;
  end: Date;
  completed: boolean;
}

export interface PomodoroContextValue {
  sessions: Session[];
  activeSession: ActiveSession | null;
  now: Date;
  startSession: (modeKey: ModeKey) => void;
  pauseSession: () => void;
  resumeSession: (modeKey: ModeKey) => void;
  finishSession: () => void;
  cancelSession: () => void;
  clearSessions: () => void;
  clearAllData: () => void;

  dailyGoal: number;
  cyclesBeforeLongBreak: number;
  autoStartNext: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  setDailyGoal: (value: number) => void;
  setCyclesBeforeLongBreak: (value: number) => void;
  setAutoStartNext: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;

  mode: ModeKey;
  isRunning: boolean;
  showSettings: boolean;
  durations: Durations;
  secondsLeftByMode: number[];
  inputValues: string[];
  completedFocusSessions: number;
  setMode: (mode: ModeKey) => void;
  setDurations: (durations: Durations) => void;
  setInputValues: (inputValues: string[]) => void;
  setCompletedFocusSessions: (completedFocusSessions: number) => void;

  actionButtonColor: string;
  progress: number;
  handleSelectMode: (key: ModeKey) => void;
  handleReset: () => void;
  handlePauseStart: () => void;
  handleToggleSettings: () => void;
  handleDurationChange: (key: ModeKey, value: string) => void;
  handleDurationBlur: (key: ModeKey, value: string) => void;
  activeColor: string;
  secondsLeft: number;
  totalSeconds: number;
  isFinished: boolean;

  stats: {
    todaySessions: Session[];
    completedToday: number;
    focusMinutesToday: number;
    completionRate: number | null;
    distribution: {
      key: ModeKey;
      label: string;
      color: string;
      minutes: number;
    }[];
    maxDistributionMinutes: number;
    streak: number;
    bestHour: number | null;
    vsYesterdayPct: number | null;
    sessionsToGoal: number;
  };
}
