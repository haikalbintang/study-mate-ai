import { describe, it, expect } from "vitest";
import {
  dayKey,
  isSameDay,
  addDays,
  formatHour12,
  minutesOf,
  minutesSinceMidnight,
  atTodayTime,
} from "./date-helper";
import type { Session } from "@/types/shared";

describe("dayKey", () => {
  it("returns a string in the format YYYY-M-D", () => {
    const date = new Date(2026, 5, 15); // June 15, 2024
    expect(dayKey(date.getTime())).toBe("2026-5-15");
  });
});

describe("isSameDay", () => {
  it("returns true for the same day", () => {
    const date1 = new Date(2026, 9, 15, 10, 30);
    const date2 = new Date(2026, 9, 15, 22, 45);
    expect(isSameDay(date1.getTime(), date2.getTime())).toBe(true);
  });

  it("returns false for different days", () => {
    const date1 = new Date(2026, 9, 15, 10, 30);
    const date2 = new Date(2026, 9, 16, 22, 45);
    expect(isSameDay(date1.getTime(), date2.getTime())).toBe(false);
  });
});

describe("addDays", () => {
  it("adds the specified number of days to the given date", () => {
    const date = new Date(2026, 5, 15); // June 15, 2026
    const addedDate = addDays(date, 3); // June 18, 2026
    expect(addedDate.getDate()).toBe(18);
  });
});

describe("formatHour12", () => {
  it("formats hours in 12-hour format with AM/PM", () => {
    expect(formatHour12(0)).toBe("12 AM");
    expect(formatHour12(12)).toBe("12 PM");
    expect(formatHour12(13)).toBe("1 PM");
    expect(formatHour12(23)).toBe("11 PM");
  });
});

describe("minutesOf", () => {
  it("calculates the total minutes of a list of sessions", () => {
    const sessions: Session[] = [
      {
        id: "1",
        start: 0,
        end: 60000,
        completed: true,
        modeKey: 0,
        mode: "focus",
      }, // 1 minute
      {
        id: "2",
        start: 0,
        end: 120000,
        completed: true,
        modeKey: 0,
        mode: "focus",
      }, // 2 minutes
      {
        id: "3",
        start: 0,
        end: 180000,
        completed: true,
        modeKey: 0,
        mode: "focus",
      }, // 3 minutes
    ];
    expect(minutesOf(sessions)).toBe(6); // 1 + 2 + 3 = 6 minutes
  });
});

describe("minutesSinceMidnight", () => {
  it("calculates the minutes since midnight for a given timestamp", () => {
    const date = new Date(2026, 5, 15, 10, 30); // June 15, 2026, 10:30 AM
    expect(minutesSinceMidnight(date.getTime())).toBe(630); // 10 * 60 + 30 = 630
  });

  it("includes the seconds as a fraction of a minute", () => {
    const date = new Date(2026, 5, 15, 1, 0, 30);
    expect(minutesSinceMidnight(date.getTime())).toBe(60.5);
  });

  it("returns 0 for an invalid date", () => {
    expect(minutesSinceMidnight(NaN)).toBe(0);
  });
});

describe("atTodayTime", () => {
  it("returns the timestamp for today at the specified hour and minute", () => {
    const now = new Date();
    const todayTime = atTodayTime(now.getHours(), now.getMinutes());
    expect(todayTime).toBe(now.getTime() - (now.getTime() % 60000));
  });
});
