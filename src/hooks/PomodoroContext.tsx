import type {
  ActiveSession,
  ModeKey,
  Session,
  SessionKind,
} from "@/types/shared";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { PomodoroContext } from "./usePomodoro";

const MODE_NAME: Record<ModeKey, SessionKind> = {
  0: "focus",
  1: "shortBreak",
  2: "longBreak",
};

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [now, setNow] = useState(() => new Date());

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
    stopTicking();
  }, []);

  const resumeSession = useCallback(() => {
    setNow(new Date());
    ensureTicking();
  }, []);

  const finishSession = useCallback(() => {
    const end = new Date();
    setActiveSession((current) => {
      if (current) {
        setSessions((prev) => [
          ...prev,
          {
            id: `${current.start.getTime()}`,
            modeKey: current.modeKey,
            mode: current.mode,
            start: current.start,
            end,
            completed: true,
          },
        ]);
      }
      return null;
    });
    stopTicking();
  }, []);

  const cancelSession = useCallback(() => {
    setActiveSession(null);
    stopTicking();
  }, []);

  const clearSessions = useCallback(() => setSessions([]), []);

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
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}
