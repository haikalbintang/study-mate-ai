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
//       ? completedFocusSessions % CYCLES_BEFORE_LONG_BREAK === 0
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

//   const clearSessions = useCallback(() => {
//     db.sessions.clear();
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
//       playChime();
//       document.title = "Time's Up! — Pomodoro";
//       setIsRunning(false);
//       setCompletedFocusSessions((prev) => prev + 1);
//       finishSession();
//     }

//     function finishBreakSession() {
//       playChime();
//       document.title = "Time's Up! — Pomodoro";
//       setIsRunning(false);
//       finishSession();
//     }

//     if (isFinished && isRunning) {
//       if (mode === 0) {
//         finishFocusSession();
//       } else {
//         finishBreakSession();
//       }
//     }
//   }, [isFinished, isRunning, mode, finishSession]);

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
//       setMode(nextMode);
//       setSecondsLeftByMode((prev) => {
//         const next = [...prev];
//         next[nextMode] = durations[nextMode] * 60;
//         return next;
//       });
//       setIsRunning(true);
//       startSession(nextMode);
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
