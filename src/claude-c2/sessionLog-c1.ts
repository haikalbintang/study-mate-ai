import { db } from "@/db/db";
import type { ActiveSession } from "@/types/shared";

/** Persists an active session as a record — paused (`completed: false`) or finished (`completed: true`). */
export function logSession(
  session: ActiveSession,
  end: Date,
  completed: boolean,
) {
  return db.sessions.add({
    id: `${session.start.getTime()}`,
    modeKey: session.modeKey,
    mode: session.mode,
    start: session.start.getTime(),
    end: end.getTime(),
    completed,
  });
}
