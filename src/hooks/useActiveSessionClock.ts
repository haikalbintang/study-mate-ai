import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveSession, ModeKey, SessionKind } from "@/types/shared";

const MODE_NAME: Record<ModeKey, SessionKind> = {
  0: "focus",
  1: "shortBreak",
  2: "longBreak",
};

/**
 * Owns the "live" session clock: which mode is currently active, when it
 * started, and a `now` that ticks forward once a second while it's running
 * (this is what lets the Timeline draw the active block growing in real
 * time). Doesn't know anything about persistence — that's the caller's job.
 */
export function useActiveSessionClock() {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [now, setNow] = useState(() => new Date());

  // Lets callbacks read the latest active session without needing it in
  // their dependency array (avoids re-creating start/end handlers on every
  // tick).
  const activeSessionRef = useRef<ActiveSession | null>(null);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ensureTicking = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => setNow(new Date()), 1000);
  }, []);

  const stopTicking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Starts (or restarts) the live clock for a mode, from right now. */
  const beginSession = useCallback(
    (modeKey: ModeKey) => {
      const start = new Date();
      setActiveSession({ modeKey, mode: MODE_NAME[modeKey], start });
      setNow(start);
      ensureTicking();
    },
    [ensureTicking],
  );

  /** Clears the live session and stops ticking, without persisting anything. */
  const endSession = useCallback(() => {
    setActiveSession(null);
    stopTicking();
  }, [stopTicking]);

  return { activeSession, activeSessionRef, now, beginSession, endSession };
}
