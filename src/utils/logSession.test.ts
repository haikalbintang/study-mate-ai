import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActiveSession } from "@/types/shared";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));

vi.mock("@/db/db", () => ({
  db: { sessions: { add } },
}));

import { logSession } from "./logSession";

beforeEach(() => {
  add.mockClear();
});

function makeActiveSession(): ActiveSession {
  return {
    modeKey: 0,
    mode: "focus",
    start: new Date(2026, 5, 15, 9, 0, 0),
  };
}

describe("logSession", () => {
  it("persists the active session with start/end timestamps", () => {
    const session = makeActiveSession();
    const end = new Date(2026, 5, 15, 9, 25, 0);

    logSession(session, end, true);

    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith({
      id: String(session.start.getTime()),
      modeKey: 0,
      mode: "focus",
      start: session.start.getTime(),
      end: end.getTime(),
      completed: true,
    });
  });

  it("records a paused session as not completed", () => {
    const session = makeActiveSession();
    const end = new Date(2026, 5, 15, 9, 10, 0);

    logSession(session, end, false);

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ completed: false }),
    );
  });

  it("returns the promise from the db write", () => {
    add.mockReturnValueOnce("add-result");

    const result = logSession(makeActiveSession(), new Date(), true);

    expect(result).toBe("add-result");
  });
});
