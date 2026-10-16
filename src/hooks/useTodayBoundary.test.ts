import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTodayBoundary } from "./useTodayBoundary";

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTodayBoundary", () => {
  it("returns the start of the current day", () => {
    const now = new Date(2026, 5, 15, 14, 30, 0);
    vi.setSystemTime(now);

    const { result } = renderHook(() => useTodayBoundary());

    expect(result.current).toBe(startOfDay(now));
  });

  it("updates to the new day once midnight passes", () => {
    const beforeMidnight = new Date(2026, 5, 15, 23, 59, 30);
    vi.setSystemTime(beforeMidnight);

    const { result } = renderHook(() => useTodayBoundary());
    expect(result.current).toBe(startOfDay(beforeMidnight));

    const afterMidnight = new Date(2026, 5, 16, 0, 0, 30);
    act(() => {
      vi.setSystemTime(afterMidnight);
      vi.advanceTimersByTime(60000);
    });

    expect(result.current).toBe(startOfDay(afterMidnight));
  });

  it("keeps the same value when still on the same day", () => {
    const now = new Date(2026, 5, 15, 9, 0, 0);
    vi.setSystemTime(now);

    const { result } = renderHook(() => useTodayBoundary());
    const initial = result.current;

    act(() => {
      vi.setSystemTime(new Date(2026, 5, 15, 9, 5, 0));
      vi.advanceTimersByTime(60000);
    });

    expect(result.current).toBe(initial);
  });
});
