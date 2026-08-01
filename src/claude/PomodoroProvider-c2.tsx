// import type {
//   ActiveSession,
//   ModeKey,
//   Session,
//   SessionKind,
// } from "@/types/shared";
// import {
//   useCallback,
//   useEffect,
//   useRef,
//   useState,
//   type ReactNode,
// } from "react";
// import { useLiveQuery } from "dexie-react-hooks";
// import { db } from "@/db";
// import { PomodoroContext } from "./usePomodoro";
// import { CYCLES_BEFORE_LONG_BREAK, MODES, PACE } from "@/data/shared";
// import {
//   clampDuration,
//   playChime,
//   requestNotificationPermission,
// } from "@/utils/helper";

// const MODE_NAME: Record<ModeKey, SessionKind> = {
//   0: "focus",
//   1: "shortBreak",
//   2: "longBreak",
// };

// // ---- Persisted app settings ------------------------------------------
// // Small scalar preferences (not session records) — localStorage is enough
// // here, no need for Dexie's query features for a handful of values.
// interface AppSettings {
//   dailyGoal: number;
//   cyclesBeforeLongBreak: number;
//   autoStartNext: boolean;
//   soundEnabled: boolean;
// }

// const SETTINGS_STORAGE_KEY = "pomodoro-settings";

// const DEFAULT_SETTINGS: AppSettings = {
//   dailyGoal: 8,
//   cyclesBeforeLongBreak: CYCLES_BEFORE_LONG_BREAK,
//   autoStartNext: false,
//   soundEnabled: true,
// };

// function loadSettings(): AppSettings {
//   try {
//     const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
//     if (!raw) return DEFAULT_SETTINGS;
//     return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
//   } catch {
//     return DEFAULT_SETTINGS;
//   }
// }

// export function PomodoroProvider({ children }: { children: ReactNode }) {
//   const [mode, setMode] = useState<ModeKey>(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const [showSettings, setShowSettings] = useState(true);
//   const [durations, setDurations] = useState([
//     MODES[0].minutes,
//     MODES[1].minutes,
//     MODES[2].minutes,
//   ]);
//   const [secondsLeftByMode, setSecondsLeftByMode] = useState([
//     durations[0] * 60,
//     durations[1] * 60,
//     durations[2] * 60,
//   ]);

//   const [inputValues, setInputValues] = useState<string[]>([
//     String(MODES[0].minutes),
//     String(MODES[1].minutes),
//     String(MODES[2].minutes),
//   ]);
//   const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

//   const [settings, setSettings] = useState<AppSettings>(loadSettings);

//   useEffect(() => {
//     localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
//   }, [settings]);

//   const setDailyGoal = useCallback(
//     (value: number) => setSettings((prev) => ({ ...prev, dailyGoal: value })),
//     [],
//   );
//   const setCyclesBeforeLongBreak = useCallback(
//     (value: number) => setSettings((prev) => ({ ...prev, cyclesBeforeLongBreak: value })),
//     [],
//   );
//   const setAutoStartNext = useCallback(
//     (value: boolean) => setSettings((prev) => ({ ...prev, autoStartNext: value })),
//     [],
//   );
//   const setSoundEnabled = useCallback(
//     (value: boolean) => setSettings((prev) => ({ ...prev, soundEnabled: value })),
//     [],
//   );

//   // Sessions now live in IndexedDB (via Dexie) instead of component state.
//   // useLiveQuery re-runs this query — and re-renders this provider — every
//   // time the "sessions" table changes, so every consumer of `sessions` from
//   // context stays in sync automatically, just like it did with useState.
//   // It returns `undefined` while the very first query is still resolving,
//   // so we fall back to an empty array in that brief window.
//   const sessionsFromDb = useLiveQuery(() => db.sessions.orderBy("start").toArray(), []);
//   const sessions: Session[] = sessionsFromDb ?? [];

//   const [activeSession, setActiveSession] = useState<ActiveSession | null>(
//     null,
//   );
//   // Mirrors `activeSession` so finishSession can read the latest value
//   // synchronously without needing it in its dependency array, and without
//   // putting an async side effect inside a setState updater.
//   const activeSessionRef = useRef<ActiveSession | null>(null);
//   useEffect(() => {
//     activeSessionRef.current = activeSession;
//   }, [activeSession]);

//   const [now, setNow] = useState(() => new Date());

//   const totalSeconds = durations[mode] * 60;
//   const secondsLeft = secondsLeftByMode[mode];
//   const isFinished = secondsLeft <= 0;
//   const activeColor = MODES[mode].color;

//   const nextMode: ModeKey =
//     mode === 0
//       ? completedFocusSessions % settings.cyclesBeforeLongBreak === 0
//         ? 2
//         : 1
//       : 0;
//   const actionButtonColor = isFinished ? MODES[nextMode].color : activeColor;

//   useEffect(() => {
//     if (isRunning) {
//       document.title = "Pomodoro";
//     }
//   }, [isRunning]);

//   const progress = 1 - secondsLeft / totalSeconds;

//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   function ensureTicking() {
//     if (intervalRef.current) return;
//     intervalRef.current = setInterval(() => setNow(new Date()), 1000);
//   }

//   function stopTicking() {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   }

//   const startSession = useCallback((modeKey: ModeKey) => {
//     const start = new Date();
//     setActiveSession({ modeKey, mode: MODE_NAME[modeKey], start });
//     setNow(start);
//     ensureTicking();
//   }, []);

//   const pauseSession = useCallback(() => {
//     stopTicking();
//   }, []);

//   const resumeSession = useCallback(() => {
//     setNow(new Date());
//     ensureTicking();
//   }, []);

//   const finishSession = useCallback(() => {
//     const current = activeSessionRef.current;
//     const end = new Date();

//     if (current) {
//       // Fire-and-forget: db.sessions.add() is async, but finishSession
//       // itself is called from a synchronous effect handler, so we don't
//       // await it here — useLiveQuery will pick up the new row once the
//       // write resolves and re-render `sessions` for us automatically.
//       db.sessions.add({
//         id: `${current.start.getTime()}`,
//         modeKey: current.modeKey,
//         mode: current.mode,
//         start: current.start,
//         end,
//         completed: true,
//       });
//     }

//     setActiveSession(null);
//     stopTicking();
//   }, []);

//   const cancelSession = useCallback(() => {
//     setActiveSession(null);
//     stopTicking();
//   }, []);

//   // Switches to `target` mode, resets its countdown to the full configured
//   // duration, and starts it running. Shared by the manual "Start" button
//   // (when the current session already finished) and by auto-start-next.
//   const beginNextMode = useCallback(
//     (target: ModeKey) => {
//       setMode(target);
//       setSecondsLeftByMode((prev) => {
//         const next = [...prev];
//         next[target] = durations[target] * 60;
//         return next;
//       });
//       setIsRunning(true);
//       startSession(target);
//     },
//     [durations, startSession],
//   );

//   const clearSessions = useCallback(() => {
//     db.sessions.clear();
//   }, []);

//   // Used by the "Hapus semua data" button in Settings — clears session
//   // history and resets the in-memory focus-cycle counter together.
//   const clearAllData = useCallback(() => {
//     db.sessions.clear();
//     setCompletedFocusSessions(0);
//   }, []);

//   useEffect(() => {
//     if (!isRunning) return;

//     const currentMode = mode;
//     intervalRef.current = setInterval(() => {
//       setSecondsLeftByMode((prev) => {
//         const next = [...prev];
//         next[currentMode] = Math.max(next[currentMode] - PACE, 0);
//         return next;
//       });
//     }, 1000);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [isRunning, mode]);

//   useEffect(() => {
//     function finishFocusSession() {
//       if (settings.soundEnabled) playChime();
//       document.title = "Time's Up! — Pomodoro";
//       setIsRunning(false);
//       setCompletedFocusSessions((prev) => prev + 1);
//       finishSession();
//       if (settings.autoStartNext) beginNextMode(nextMode);
//     }

//     function finishBreakSession() {
//       if (settings.soundEnabled) playChime();
//       document.title = "Time's Up! — Pomodoro";
//       setIsRunning(false);
//       finishSession();
//       if (settings.autoStartNext) beginNextMode(nextMode);
//     }

//     if (isFinished && isRunning) {
//       if (mode === 0) {
//         finishFocusSession();
//       } else {
//         finishBreakSession();
//       }
//     }
//   }, [
//     isFinished,
//     isRunning,
//     mode,
//     finishSession,
//     settings.soundEnabled,
//     settings.autoStartNext,
//     nextMode,
//     beginNextMode,
//   ]);

//   function handleSelectMode(key: ModeKey) {
//     if (isRunning) pauseSession();
//     setMode(key);
//     setIsRunning(false);
//   }

//   function handleReset() {
//     setIsRunning(false);
//     cancelSession();
//     setSecondsLeftByMode((prev) => {
//       const next = [...prev];
//       next[mode] = durations[mode] * 60;
//       return next;
//     });
//   }

//   function handlePauseStart() {
//     if (isFinished) {
//       beginNextMode(nextMode);
//       return;
//     }

//     if (isRunning) {
//       setIsRunning(false);
//       pauseSession();
//       return;
//     }

//     setIsRunning(true);
//     requestNotificationPermission();

//     if (secondsLeft === totalSeconds) {
//       startSession(mode);
//     } else {
//       resumeSession();
//     }
//   }
//   function handleToggleSettings() {
//     setShowSettings((s) => !s);
//   }

//   function handleDurationChange(key: ModeKey, value: string) {
//     const clamped = clampDuration(value);
//     setInputValues((prev) => {
//       const nextArray = [...prev];
//       nextArray[key] = String(clamped);
//       return nextArray;
//     });
//   }

//   function handleDurationBlur(key: ModeKey, value: string) {
//     const clamped = clampDuration(value);

//     setInputValues((prev) => {
//       const nextArray = [...prev];
//       nextArray[key] = String(clamped);
//       return nextArray;
//     });

//     setDurations((prev) => {
//       const nextArray = [...prev];
//       nextArray[key] = clamped;
//       return nextArray;
//     });

//     setSecondsLeftByMode((prev) => {
//       // If this is the tab you're currently on, reflect the new duration
//       // immediately. If it's a different tab, only overwrite its countdown
//       // when that tab hasn't been started yet (still sitting at its old full
//       // duration) — otherwise you'd erase progress on a paused session.
//       const previousFullDuration = durations[key] * 60;
//       const isUntouched = prev[key] === previousFullDuration;
//       if (key !== mode && !isUntouched) return prev;

//       const next = [...prev];
//       next[key] = clamped * 60;
//       return next;
//     });
//   }

//   return (
//     <PomodoroContext.Provider
//       value={{
//         sessions,
//         activeSession,
//         now,
//         startSession,
//         pauseSession,
//         resumeSession,
//         finishSession,
//         cancelSession,
//         clearSessions,
//         clearAllData,

//         dailyGoal: settings.dailyGoal,
//         cyclesBeforeLongBreak: settings.cyclesBeforeLongBreak,
//         autoStartNext: settings.autoStartNext,
//         soundEnabled: settings.soundEnabled,
//         setDailyGoal,
//         setCyclesBeforeLongBreak,
//         setAutoStartNext,
//         setSoundEnabled,

//         mode,
//         isRunning,
//         showSettings,
//         durations,
//         secondsLeftByMode,
//         inputValues,
//         completedFocusSessions,
//         setMode,
//         setDurations,
//         setInputValues,
//         setCompletedFocusSessions,

//         actionButtonColor,
//         progress,
//         handleSelectMode,
//         handleReset,
//         handlePauseStart,
//         handleToggleSettings,
//         handleDurationChange,
//         handleDurationBlur,
//         activeColor,
//         secondsLeft,
//         totalSeconds,
//         isFinished,
//       }}
//     >
//       {children}
//     </PomodoroContext.Provider>
//   );
// }
