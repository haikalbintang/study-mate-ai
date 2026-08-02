import Dexie, { type EntityTable } from "dexie";
import type { Session } from "@/types/shared";

// A Dexie database is a class with one property per table.
const db = new Dexie("PomodoroDB") as Dexie & {
  sessions: EntityTable<Session, "id">;
};

// version(1) defines the schema: which fields exist and which are indexed.
//
// "id"      -> primary key. NOT "++id" (auto-increment) because the app
//              already generates its own unique id (`${start.getTime()}`)
//              when a session finishes — Dexie just uses that as-is.
// "start"   -> indexed, so queries ordered/filtered by time are fast.
// "modeKey" -> indexed, so "all focus sessions" style queries are fast.
//
// `start`/`end` are stored as native Date objects — IndexedDB (and Dexie)
// can store and index Date directly, no need to convert to epoch ms.
db.version(1).stores({
  sessions: "id, start, modeKey",
});

export { db };
