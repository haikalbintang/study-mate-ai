import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Session } from "@/types/shared";

const { useLiveQuery, orderBy, toArray } = vi.hoisted(() => ({
  useLiveQuery: vi.fn(),
  orderBy: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("dexie-react-hooks", () => ({ useLiveQuery }));
vi.mock("@/db/db", () => ({ db: { sessions: { orderBy } } }));

import { useSessionsFromDb } from "./useSessionFromDb";

beforeEach(() => {
  useLiveQuery.mockReset();
  orderBy.mockReset();
  toArray.mockReset();
  orderBy.mockReturnValue({ toArray });
});

describe("useSessionsFromDb", () => {
  it("queries all sessions ordered by start time", () => {
    const sessions: Session[] = [
      {
        id: "1",
        modeKey: 0,
        mode: "focus",
        start: 0,
        end: 60000,
        completed: true,
      },
    ];
    toArray.mockReturnValue(sessions);
    useLiveQuery.mockImplementation(
      (query: () => Session[]) => query(),
    );

    const { result } = renderHook(() => useSessionsFromDb());

    expect(orderBy).toHaveBeenCalledWith("start");
    expect(result.current).toEqual(sessions);
  });

  it("returns an empty array while the query is unresolved", () => {
    useLiveQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useSessionsFromDb());

    expect(result.current).toEqual([]);
  });
});
