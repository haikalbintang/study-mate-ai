import type {
  ActiveSession,
  ModeKey,
  Session,
  SessionKind,
} from "@/types/shared";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PomodoroContext } from "./usePomodoro";
import { DAILY_GOAL_SESSIONS, MODES, PACE } from "@/data/shared";
import {
  clampDuration,
  playChime,
  requestNotificationPermission,
} from "@/utils/helper";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { addDays, dayKey, isSameDay, minutesOf } from "@/utils/date-helper";

const MODE_NAME: Record<ModeKey, SessionKind> = {
  0: "focus",
  1: "shortBreak",
  2: "longBreak",
};

interface AppSettings {
  dailyGoal: number;
  cyclesBeforeLongBreak: number;
  autoStartNext: boolean;
  soundEnabled: boolean;
}

const SETTINGS_STORAGE_KEY = "pomodoro-settings";

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 4,
  cyclesBeforeLongBreak: 4,
  autoStartNext: false,
  soundEnabled: true,
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

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [todayTimestamp, setTodayTimestamp] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
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

  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setDailyGoal = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, dailyGoal: value }));
  }, []);

  const setCyclesBeforeLongBreak = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, cyclesBeforeLongBreak: value }));
  }, []);

  const setAutoStartNext = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, autoStartNext: value }));
  }, []);

  const setSoundEnabled = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, soundEnabled: value }));
  }, []);

  const sessionFromDb = useLiveQuery(
    () => db.sessions.orderBy("start").toArray(),
    [],
  );

  const sessions: Session[] = sessionFromDb ?? [];

  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const currentStartOfDay = new Date().setHours(0, 0, 0, 0);
      if (currentStartOfDay !== todayTimestamp) {
        setTodayTimestamp(currentStartOfDay);
      }
    }, 60000); // Check once per minute, not every second

    return () => clearInterval(checkMidnight);
  }, [todayTimestamp]);

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const activeSessionRef = useRef<ActiveSession | null>(null);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const [now, setNow] = useState(() => new Date());

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

  useEffect(() => {
    if (isRunning) {
      document.title = "Pomodoro";
    }
  }, [isRunning]);

  const progress = 1 - secondsLeft / totalSeconds;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function ensureTicking() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => setNow(new Date()), 1000);
  }

  function stopTicking() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const startSession = useCallback((modeKey: ModeKey) => {
    const start = new Date();
    setActiveSession({ modeKey, mode: MODE_NAME[modeKey], start });
    setNow(start);
    ensureTicking();
  }, []);

  const pauseSession = useCallback(() => {
    const current = activeSessionRef.current;
    const end = new Date();

    if (current) {
      db.sessions.add({
        id: `${current.start.getTime()}`,
        modeKey: current.modeKey,
        mode: current.mode,
        start: current.start.getTime(),
        end: end.getTime(),
        completed: false,
      });
    }

    setActiveSession(null);
    stopTicking();
  }, []);

  const resumeSession = useCallback((modeKey: ModeKey) => {
    const start = new Date();
    setActiveSession({ modeKey, mode: MODE_NAME[modeKey], start });
    setNow(start);
    ensureTicking();
  }, []);

  const finishSession = useCallback(() => {
    const current = activeSessionRef.current;
    const end = new Date();

    if (current) {
      db.sessions.add({
        id: `${current.start.getTime()}`,
        modeKey: current.modeKey,
        mode: current.mode,
        start: current.start.getTime(),
        end: end.getTime(),
        completed: true,
      });
    }

    setActiveSession(null);
    stopTicking();
  }, []);

  const cancelSession = useCallback(() => {
    setActiveSession(null);
    stopTicking();
  }, []);

  const clearSessions = useCallback(() => {
    db.sessions.clear();
  }, []);

  const clearAllData = useCallback(() => {
    db.sessions.clear();
    setCompletedFocusSessions(0);
  }, []);

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
    function finishFocusSession() {
      playChime();
      document.title = "Time's Up! — Pomodoro";
      setIsRunning(false);
      setCompletedFocusSessions((prev) => prev + 1);
      finishSession();
    }

    function finishBreakSession() {
      playChime();
      document.title = "Time's Up! — Pomodoro";
      setIsRunning(false);
      finishSession();
    }

    if (isFinished && isRunning) {
      if (mode === 0) {
        finishFocusSession();
      } else {
        finishBreakSession();
      }
    }
  }, [isFinished, isRunning, mode, finishSession]);

  const stats = useMemo(() => {
    // const now = Date.now();
    const today = new Date(todayTimestamp);

    const todaySessions = sessions.filter((s) =>
      isSameDay(s.start, todayTimestamp),
    );
    const yesterdaySessions = sessions.filter((s) =>
      isSameDay(s.start, addDays(today, -1).getTime()),
    );

    const todayFocus = todaySessions.filter((s) => s.modeKey === 0);
    const yesterdayFocus = yesterdaySessions.filter((s) => s.modeKey === 0);

    const completedToday = todayFocus.filter((s) => s.completed).length;
    const focusMinutesToday = minutesOf(todayFocus);
    const focusMinutesYesterday = minutesOf(yesterdayFocus);

    const completionRate =
      todayFocus.length === 0
        ? null
        : Math.round((completedToday / todayFocus.length) * 100);

    // Minutes per mode, today — for the "time distribution" bars.
    const distribution = MODES.map((m) => ({
      ...m,
      minutes: minutesOf(todaySessions.filter((s) => s.modeKey === m.key)),
    }));
    const maxDistributionMinutes = Math.max(
      ...distribution.map((d) => d.minutes),
      1,
    );

    // Streak: consecutive days (including today) with >= 1 completed focus session.
    const completedFocusDayKeys = new Set(
      sessions
        .filter((s) => s.modeKey === 0 && s.completed)
        .map((s) => dayKey(s.start)),
    );
    let streak = 8;
    let cursor = today;
    while (completedFocusDayKeys.has(dayKey(cursor.getTime()))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    // Best hour: across all completed focus sessions ever logged, which
    // hour-of-day has accumulated the most focus minutes.
    const minutesByHour = new Array(24).fill(0) as number[];
    sessions
      .filter((s) => s.modeKey === 0 && s.completed)
      .forEach((s) => {
        const hour = new Date(s.start).getHours();
        minutesByHour[hour] += (s.end - s.start) / 60000;
      });
    const totalHistoricalMinutes = minutesByHour.reduce((a, b) => a + b, 0);
    const bestHour =
      totalHistoricalMinutes === 0
        ? null
        : minutesByHour.indexOf(Math.max(...minutesByHour));

    const vsYesterdayPct =
      focusMinutesYesterday === 0
        ? null
        : Math.round(
            ((focusMinutesToday - focusMinutesYesterday) /
              focusMinutesYesterday) *
              100,
          );

    const sessionsToGoal = Math.max(0, settings.dailyGoal - completedToday);

    return {
      todaySessions: [...todaySessions].sort((a, b) => a.start - b.start),
      completedToday,
      focusMinutesToday,
      completionRate,
      distribution,
      maxDistributionMinutes,
      streak,
      bestHour,
      vsYesterdayPct,
      sessionsToGoal,
    };
  }, [sessions, todayTimestamp]);

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
      const nextArray = [...prev];
      nextArray[key] = String(clamped);
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
      // If this is the tab you're currently on, reflect the new duration
      // immediately. If it's a different tab, only overwrite its countdown
      // when that tab hasn't been started yet (still sitting at its old full
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

        dailyGoal: settings.dailyGoal,
        cyclesBeforeLongBreak: settings.cyclesBeforeLongBreak,
        autoStartNext: settings.autoStartNext,
        soundEnabled: settings.soundEnabled,
        setDailyGoal,
        setCyclesBeforeLongBreak,
        setAutoStartNext,
        setSoundEnabled,

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
