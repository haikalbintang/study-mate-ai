import type { ModeKey } from "@/types/shared";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PomodoroContext } from "./usePomodoro";
import { CYCLES_BEFORE_LONG_BREAK, MODES, PACE } from "@/data/shared";
import {
  clampDuration,
  playChime,
  requestNotificationPermission,
} from "@/utils/helper";
import { db } from "@/db/db";
import { logSession } from "./sessionLog-c1";
import { useSettings } from "./useSettings-c1";
import { useActiveSessionClock } from "./useActiveSessionClock";
import { useSessionsFromDb } from "./useSessionsFromDb-c1";
import { useTodayBoundary } from "./useTodayBoundary-c1";
import { useDailyStats } from "./useDailyStats-c1";

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const todayTimestamp = useTodayBoundary();
  const sessions = useSessionsFromDb();
  const settings = useSettings();

  const { activeSession, activeSessionRef, now, beginSession, endSession } =
    useActiveSessionClock();

  // startSession and resumeSession used to be two copies of the exact same
  // body — both just "start the live clock from now". Kept as two names
  // since call sites read more clearly that way, but there's only one
  // implementation now.
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

  const clearSessions = useCallback(() => {
    db.sessions.clear();
  }, []);

  const clearAllData = useCallback(() => {
    db.sessions.clear();
    setCompletedFocusSessions(0);
  }, []);

  const [mode, setMode] = useState<ModeKey>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [durations, setDurations] = useState([
    MODES[0].minutes,
    MODES[1].minutes,
    MODES[2].minutes,
  ]);
  const [secondsLeftByMode, setSecondsLeftByMode] = useState([
    durations[0] * 60,
    durations[1] * 60,
    durations[2] * 60,
  ]);
  const [inputValues, setInputValues] = useState<string[]>([
    String(MODES[0].minutes),
    String(MODES[1].minutes),
    String(MODES[2].minutes),
  ]);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = durations[mode] * 60;
  const secondsLeft = secondsLeftByMode[mode];
  const isFinished = secondsLeft <= 0;
  const activeColor = MODES[mode].color;

  const nextMode: ModeKey =
    mode === 0
      ? completedFocusSessions % CYCLES_BEFORE_LONG_BREAK === 0
        ? 2
        : 1
      : 0;
  const actionButtonColor = isFinished ? MODES[nextMode].color : activeColor;
  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    if (isRunning) document.title = "Pomodoro";
  }, [isRunning]);

  // Countdown ticking for whichever mode is currently active.
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

  // Auto-transition once the active countdown hits zero. Focus and break
  // sessions only differed by whether they increment the daily focus count,
  // so that's now the one branch instead of two near-identical functions.
  useEffect(() => {
    if (!(isFinished && isRunning)) return;

    playChime();
    document.title = "Time's Up! — Pomodoro";
    setIsRunning(false);
    if (mode === 0) setCompletedFocusSessions((prev) => prev + 1);
    finishSession();
  }, [isFinished, isRunning, mode, finishSession]);

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
    const clamped = clampDuration(value);
    setInputValues((prev) => {
      const next = [...prev];
      next[key] = String(clamped);
      return next;
    });
  }

  function handleDurationBlur(key: ModeKey, value: string) {
    const clamped = clampDuration(value);

    setInputValues((prev) => {
      const next = [...prev];
      next[key] = String(clamped);
      return next;
    });

    setDurations((prev) => {
      const next = [...prev];
      next[key] = clamped;
      return next;
    });

    setSecondsLeftByMode((prev) => {
      // If this is the mode you're currently on, reflect the new duration
      // immediately. If it's a different mode, only overwrite its countdown
      // when that mode hasn't been started yet (still at its old full
      // duration) — otherwise you'd erase progress on a paused session.
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
