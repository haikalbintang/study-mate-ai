import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import type { Session } from "@/types/shared";

/** Live-subscribes to all logged sessions, ordered by start time. */
export function useSessionsFromDb(): Session[] {
  const sessions = useLiveQuery(
    () => db.sessions.orderBy("start").toArray(),
    [],
  );
  return sessions ?? [];
}
