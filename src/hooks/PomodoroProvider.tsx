import type { ModeKey } from "@/types/shared";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PomodoroContext } from "./usePomodoro";
import { MODES, PACE } from "@/data/shared";
import { clampDuration } from "@/utils/helper";
import { db } from "@/db/db";
import { useSettings } from "./useSettings";
import { useTodayBoundary } from "./useTodayBoundary";

import { useActiveSessionClock } from "./useActiveSessionClock";
import { logSession } from "@/utils/logSession";
import { useSessionsFromDb } from "./useSessionFromDb";
import { useDailyStats } from "./useDailyStats";
import {
  requestNotificationPermission,
  triggerChimeSound,
  triggerNotification,
} from "@/utils/notification-helper";

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const todayTimestamp = useTodayBoundary();
  const sessions = useSessionsFromDb();

  const { activeSession, activeSessionRef, now, beginSession, endSession } =
    useActiveSessionClock();

  const startSession = beginSession;
  const resumeSession = beginSession;

  const pauseSession = useCallback(() => {
    const current = activeSessionRef.current;
    if (current) logSession(current, new Date(), false);
    endSession();
  }, [activeSessionRef, endSession]);

  const finishSession = useCallback(() => {
    const current = activeSessionRef.current;
    if (current) logSession(current, new Date(), true);
    endSession();
  }, [activeSessionRef, endSession]);

  const cancelSession = endSession;

  const { durations, setDurations } = settings;

  const [mode, setMode] = useState<ModeKey>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const [secondsLeftByMode, setSecondsLeftByMode] = useState(() =>
    durations.map((d) => d * 60),
  );

  const [inputValues, setInputValues] = useState<string[]>(() =>
    durations.map((d) => String(d)),
  );
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  const clearSessions = useCallback(() => {
    db.sessions.clear();
  }, []);

  const clearAllData = useCallback(() => {
    db.sessions.clear();
    setCompletedFocusSessions(0);
  }, []);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = durations[mode] * 60;
  const secondsLeft = secondsLeftByMode[mode];
  const isFinished = secondsLeft <= 0;
  const activeColor = MODES[mode].color;

  const nextMode: ModeKey =
    mode === 0
      ? completedFocusSessions % settings.cyclesBeforeLongBreak === 0
        ? 2
        : 1
      : 0;
  const actionButtonColor = isFinished ? MODES[nextMode].color : activeColor;
  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    if (isRunning) {
      document.title = "Pomodoro";
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const currentMode = mode;
    intervalRef.current = setInterval(() => {
      setSecondsLeftByMode((prev) => {
        const next = [...prev];
        next[currentMode] = Math.max(next[currentMode] - PACE, 0);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  useEffect(() => {
    if (!(isFinished && isRunning)) return;

    function handleTimerCompletion() {
      if (settings.soundEnabled) triggerChimeSound();
      triggerNotification(mode);
      document.title = "Time's Up! — Pomodoro";
      setIsRunning(false);
      finishSession();
      let updatedCompletedFocusSessions = completedFocusSessions;
      if (mode === 0) {
        updatedCompletedFocusSessions = completedFocusSessions + 1;
        setCompletedFocusSessions(updatedCompletedFocusSessions);
      }

      if (settings.autoStartNext) {
        const upcomingMode: ModeKey =
          mode === 0
            ? updatedCompletedFocusSessions % settings.cyclesBeforeLongBreak ===
              0
              ? 2
              : 1
            : 0;

        setMode(upcomingMode);
        setSecondsLeftByMode((prev) => {
          const next = [...prev];
          next[upcomingMode] = durations[upcomingMode] * 60;
          return next;
        });
        setIsRunning(true);
        startSession(upcomingMode);
      }
    }

    handleTimerCompletion();
  }, [
    isFinished,
    isRunning,
    mode,
    finishSession,
    settings.soundEnabled,
    settings.autoStartNext,
    settings.cyclesBeforeLongBreak,
    completedFocusSessions,
    durations,
    startSession,
  ]);

  const stats = useDailyStats(sessions, todayTimestamp);

  function handleSelectMode(key: ModeKey) {
    if (isRunning) pauseSession();
    setMode(key);
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    cancelSession();
    setSecondsLeftByMode((prev) => {
      const next = [...prev];
      next[mode] = durations[mode] * 60;
      return next;
    });
  }

  function handlePauseStart() {
    if (isFinished) {
      setMode(nextMode);
      setSecondsLeftByMode((prev) => {
        const next = [...prev];
        next[nextMode] = durations[nextMode] * 60;
        return next;
      });
      setIsRunning(true);
      startSession(nextMode);
      return;
    }

    if (isRunning) {
      setIsRunning(false);
      pauseSession();
      return;
    }

    setIsRunning(true);
    requestNotificationPermission();

    if (secondsLeft === totalSeconds) {
      startSession(mode);
    } else {
      resumeSession(mode);
    }
  }
  function handleToggleSettings() {
    setShowSettings((s) => !s);
  }

  function handleDurationChange(key: ModeKey, value: string) {
    setInputValues((prev) => {
      const nextArray = [...prev];
      nextArray[key] = value;
      return nextArray;
    });
  }

  function handleDurationBlur(key: ModeKey, value: string) {
    const clamped = clampDuration(value);

    setInputValues((prev) => {
      const nextArray = [...prev];
      nextArray[key] = String(clamped);
      return nextArray;
    });

    setDurations((prev) => {
      const nextArray = [...prev];
      nextArray[key] = clamped;
      return nextArray;
    });

    setSecondsLeftByMode((prev) => {
      const previousFullDuration = durations[key] * 60;
      const isUntouched = prev[key] === previousFullDuration;
      if (key !== mode && !isUntouched) return prev;

      const next = [...prev];
      next[key] = clamped * 60;
      return next;
    });
  }

  return (
    <PomodoroContext.Provider
      value={{
        sessions,
        activeSession,
        now,
        startSession,
        pauseSession,
        resumeSession,
        finishSession,
        cancelSession,
        clearSessions,
        clearAllData,

        ...settings,

        mode,
        isRunning,
        showSettings,
        durations,
        secondsLeftByMode,
        inputValues,
        completedFocusSessions,
        setMode,
        setDurations,
        setInputValues,
        setCompletedFocusSessions,

        actionButtonColor,
        progress,
        handleSelectMode,
        handleReset,
        handlePauseStart,
        handleToggleSettings,
        handleDurationChange,
        handleDurationBlur,
        activeColor,
        secondsLeft,
        totalSeconds,
        isFinished,

        stats,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}
