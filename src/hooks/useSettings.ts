import { MODES } from "@/data/shared";
import { useCallback, useEffect, useState } from "react";

export interface AppSettings {
  dailyGoal: number;
  cyclesBeforeLongBreak: number;
  autoStartNext: boolean;
  soundEnabled: boolean;
  durations: number[];
}

const SETTINGS_STORAGE_KEY = "pomodoro-settings";

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 4,
  cyclesBeforeLongBreak: 4,
  autoStartNext: false,
  soundEnabled: true,
  durations: [MODES[0].minutes, MODES[1].minutes, MODES[2].minutes],
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

type DurationsUpdater = number[] | ((prev: number[]) => number[]);

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setDailyGoal = useCallback(
    (value: number) => setSettings((prev) => ({ ...prev, dailyGoal: value })),
    [],
  );
  const setCyclesBeforeLongBreak = useCallback(
    (value: number) =>
      setSettings((prev) => ({ ...prev, cyclesBeforeLongBreak: value })),
    [],
  );
  const setAutoStartNext = useCallback(
    (value: boolean) =>
      setSettings((prev) => ({ ...prev, autoStartNext: value })),
    [],
  );
  const setSoundEnabled = useCallback(
    (value: boolean) =>
      setSettings((prev) => ({ ...prev, soundEnabled: value })),
    [],
  );
  const setDurations = useCallback((updater: DurationsUpdater) => {
    setSettings((prev) => ({
      ...prev,
      durations:
        typeof updater === "function" ? updater(prev.durations) : updater,
    }));
  }, []);

  return {
    dailyGoal: settings.dailyGoal,
    cyclesBeforeLongBreak: settings.cyclesBeforeLongBreak,
    autoStartNext: settings.autoStartNext,
    soundEnabled: settings.soundEnabled,
    durations: settings.durations,
    setDailyGoal,
    setCyclesBeforeLongBreak,
    setAutoStartNext,
    setSoundEnabled,
    setDurations,
  };
}
