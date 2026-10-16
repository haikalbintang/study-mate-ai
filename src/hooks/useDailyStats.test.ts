import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDailyStats } from "./useDailyStats";
import type { ModeKey, Session, SessionKind } from "@/types/shared";
import { DAILY_GOAL_SESSIONS } from "@/data/shared";

const MODE_NAME: Record<ModeKey, SessionKind> = {
  0: "focus",
  1: "shortBreak",
  2: "longBreak",
};

let idCounter = 0;

function makeSession(
  start: Date,
  minutes: number,
  modeKey: ModeKey = 0,
  completed = true,
): Session {
  idCounter += 1;
  return {
    id: String(idCounter),
    modeKey,
    mode: MODE_NAME[modeKey],
    start: start.getTime(),
    end: start.getTime() + minutes * 60000,
    completed,
  };
}

const TODAY = new Date(2026, 5, 15, 12, 0, 0);

function day(offset: number, hour = 9, minute = 0): Date {
  return new Date(2026, 5, 15 + offset, hour, minute, 0, 0);
}

describe("useDailyStats", () => {
  it("returns empty-state defaults when there are no sessions", () => {
    const { result } = renderHook(() => useDailyStats([], TODAY.getTime()));

    expect(result.current.todaySessions).toEqual([]);
    expect(result.current.completedToday).toBe(0);
    expect(result.current.focusMinutesToday).toBe(0);
    expect(result.current.completionRate).toBeNull();
    expect(result.current.streak).toBe(0);
    expect(result.current.bestHour).toBeNull();
    expect(result.current.vsYesterdayPct).toBeNull();
    expect(result.current.sessionsToGoal).toBe(DAILY_GOAL_SESSIONS);
    expect(result.current.maxDistributionMinutes).toBe(1);
  });

  it("counts only today's sessions and orders them by start time", () => {
    const early = makeSession(day(0, 8), 10);
    const late = makeSession(day(0, 20), 10);
    const yesterday = makeSession(day(-1), 30);

    const { result } = renderHook(() =>
      useDailyStats([late, yesterday, early], TODAY.getTime()),
    );

    expect(result.current.todaySessions.map((s) => s.id)).toEqual([
      early.id,
      late.id,
    ]);
    expect(result.current.completedToday).toBe(2);
    expect(result.current.focusMinutesToday).toBe(20);
  });

  it("computes completion rate from focus sessions and ignores breaks", () => {
    const completed = makeSession(day(0, 9), 25, 0, true);
    const stopped = makeSession(day(0, 10), 10, 0, false);
    const breakSession = makeSession(day(0, 11), 5, 1, true);

    const { result } = renderHook(() =>
      useDailyStats([completed, stopped, breakSession], TODAY.getTime()),
    );

    expect(result.current.completionRate).toBe(50); // 1 of 2 focus sessions completed
    expect(result.current.completedToday).toBe(1);
  });

  it("builds a per-mode distribution for today", () => {
    const sessions = [
      makeSession(day(0, 9), 25, 0),
      makeSession(day(0, 10), 15, 0),
      makeSession(day(0, 11), 5, 1),
      makeSession(day(0, 12), 30, 2),
    ];

    const { result } = renderHook(() =>
      useDailyStats(sessions, TODAY.getTime()),
    );

    const minutesByKey = Object.fromEntries(
      result.current.distribution.map((d) => [d.key, d.minutes]),
    );
    expect(minutesByKey[0]).toBe(40);
    expect(minutesByKey[1]).toBe(5);
    expect(minutesByKey[2]).toBe(30);
    expect(result.current.maxDistributionMinutes).toBe(40);
  });

  it("counts consecutive completed focus days as a streak", () => {
    const sessions = [
      makeSession(day(0), 25),
      makeSession(day(-1), 25),
      makeSession(day(-2), 25),
      makeSession(day(-4), 25), // gap at day -3 breaks the streak
    ];

    const { result } = renderHook(() =>
      useDailyStats(sessions, TODAY.getTime()),
    );

    expect(result.current.streak).toBe(3);
  });

  it("does not extend the streak when today has no completed focus session", () => {
    const sessions = [makeSession(day(-1), 25), makeSession(day(-2), 25)];

    const { result } = renderHook(() =>
      useDailyStats(sessions, TODAY.getTime()),
    );

    expect(result.current.streak).toBe(0);
  });

  it("ignores incomplete focus sessions when computing the streak", () => {
    const sessions = [makeSession(day(0), 25, 0, false)];

    const { result } = renderHook(() =>
      useDailyStats(sessions, TODAY.getTime()),
    );

    expect(result.current.streak).toBe(0);
  });

  it("finds the hour with the most accumulated focus minutes", () => {
    const sessions = [
      makeSession(day(0, 9), 25, 0),
      makeSession(day(-1, 9), 25, 0),
      makeSession(day(-2, 14), 30, 0),
    ];

    const { result } = renderHook(() =>
      useDailyStats(sessions, TODAY.getTime()),
    );

    expect(result.current.bestHour).toBe(9);
  });

  it("computes the percentage change versus yesterday", () => {
    const sessions = [
      makeSession(day(0, 9), 30),
      makeSession(day(-1, 9), 20),
    ];

    const { result } = renderHook(() =>
      useDailyStats(sessions, TODAY.getTime()),
    );

    expect(result.current.vsYesterdayPct).toBe(50); // (30 - 20) / 20 * 100
  });

  it("clamps sessions-to-goal at zero once the goal is reached", () => {
    const sessions = Array.from({ length: DAILY_GOAL_SESSIONS + 2 }, (_, i) =>
      makeSession(day(0, 9 + i), 5),
    );

    const { result } = renderHook(() =>
      useDailyStats(sessions, TODAY.getTime()),
    );

    expect(result.current.sessionsToGoal).toBe(0);
  });
});
