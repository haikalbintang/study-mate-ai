import type { Session } from "@/types/shared";
import { Dexie } from "dexie";
import type { EntityTable } from "dexie/dist/dexie.js";

const db = new Dexie("PomodoroDB") as Dexie & {
  sessions: EntityTable<Session, "id">;
};

db.version(1).stores({ sessions: "id, start, end, duration, mode" });

export { db };
