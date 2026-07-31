// import {
//   createContext,
//   useContext,
//   useState,
//   useRef,
//   useCallback,
//   type ReactNode,
// } from "react";
// import type { ModeKey } from "@/types/shared";

// export type SessionKind = "focus" | "shortBreak" | "longBreak";

// export interface Session {
//   id: string;
//   modeKey: ModeKey;
//   mode: SessionKind;
//   start: Date;
//   end: Date;
//   completed: boolean;
// }

// interface ActiveSession {
//   modeKey: ModeKey;
//   mode: SessionKind;
//   start: Date;
// }

// interface PomodoroContextValue {
//   sessions: Session[];
//   activeSession: ActiveSession | null;
//   now: Date;
//   startSession: (modeKey: ModeKey) => void;
//   pauseSession: () => void;
//   resumeSession: () => void;
//   finishSession: () => void;
//   cancelSession: () => void;
//   clearSessions: () => void;
// }

// const MODE_NAME: Record<ModeKey, SessionKind> = {
//   0: "focus",
//   1: "shortBreak",
//   2: "longBreak",
// };

// const PomodoroContext = createContext<PomodoroContextValue | null>(null);

// export function PomodoroProvider({ children }: { children: ReactNode }) {
//   const [sessions, setSessions] = useState<Session[]>([]);
//   const [activeSession, setActiveSession] = useState<ActiveSession | null>(
//     null,
//   );
//   const [now, setNow] = useState(() => new Date());

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

//   // Called when a mode starts fresh (not resumed from pause).
//   const startSession = useCallback((modeKey: ModeKey) => {
//     const start = new Date();
//     setActiveSession({ modeKey, mode: MODE_NAME[modeKey], start });
//     setNow(start);
//     ensureTicking();
//   }, []);

//   // Stops the clock but keeps the active session (paused, not finished).
//   const pauseSession = useCallback(() => {
//     stopTicking();
//   }, []);

//   // Continues ticking an already-existing active session.
//   const resumeSession = useCallback(() => {
//     setNow(new Date());
//     ensureTicking();
//   }, []);

//   // Session ran to completion — move it from "active" into the log.
//   const finishSession = useCallback(() => {
//     const end = new Date();
//     setActiveSession((current) => {
//       if (current) {
//         setSessions((prev) => [
//           ...prev,
//           {
//             id: `${current.start.getTime()}`,
//             modeKey: current.modeKey,
//             mode: current.mode,
//             start: current.start,
//             end,
//             completed: true,
//           },
//         ]);
//       }
//       return null;
//     });
//     stopTicking();
//   }, []);

//   // Session was abandoned (e.g. Reset) — drop it without logging it.
//   const cancelSession = useCallback(() => {
//     setActiveSession(null);
//     stopTicking();
//   }, []);

//   const clearSessions = useCallback(() => setSessions([]), []);

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
//       }}
//     >
//       {children}
//     </PomodoroContext.Provider>
//   );
// }

// export function usePomodoro() {
//   const ctx = useContext(PomodoroContext);
//   if (!ctx) {
//     throw new Error("usePomodoro must be used within a PomodoroProvider");
//   }
//   return ctx;
// }
