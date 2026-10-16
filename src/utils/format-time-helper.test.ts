import { describe, expect, it } from "vitest";
import {
  formatTime,
  formatDurationMinutes,
  clampDuration,
} from "./format-time-helper";

describe("formatTime", () => {
  it("formats seconds into mm:ss", () => {
    expect(formatTime(65)).toBe("01:05");
  });

  it("pads seconds to 2 digits", () => {
    expect(formatTime(5)).toBe("00:05");
  });
});

describe("formatDurationMinutes", () => {
  it("minimum duration is 0 minute", () => {
    expect(formatDurationMinutes(-1)).toBe("0 menit");
  });

  it("minimum duration is 0 minute", () => {
    expect(formatDurationMinutes(0)).toBe("0 menit");
  });

  it("60 seconds is 1 minute", () => {
    expect(formatDurationMinutes(60000)).toBe("1 menit");
  });

  it("rounded down to nearest minute", () => {
    expect(formatDurationMinutes(60000 + 1)).toBe("1 menit");
  });

  it("rounded up to nearest minute", () => {
    expect(formatDurationMinutes(60000 * 2 - 1)).toBe("2 menit");
  });

  it("1.5 rounded to 2 minutes", () => {
    expect(formatDurationMinutes(90000)).toBe("2 menit");
  });
});

describe("clampDuration", () => {
  it("clamps negative values to 0", () => {
    expect(clampDuration("-5")).toBe(0);
  });

  it("clamps values above 120 to 120", () => {
    expect(clampDuration("125")).toBe(120);
  });

  it("returns the value if it's within the valid range", () => {
    expect(clampDuration("30")).toBe(30);
  });

  it("treats empty and non-numeric input as 0", () => {
    expect(clampDuration("")).toBe(0);
    expect(clampDuration("abc")).toBe(0);
  });
});
