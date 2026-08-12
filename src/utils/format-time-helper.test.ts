import { describe, expect, it } from "vitest";
import { formatTime, formatDurationMinutes } from "./format-time-helper";

describe("formatTime", () => {
  it("formats seconds into mm:ss", () => {
    expect(formatTime(65)).toBe("01:05");
  });

  it("pads seconds to 2 digits", () => {
    expect(formatTime(5)).toBe("00:05");
  });
});

describe("formatDurationMinutes", () => {
  it("minimum duration is 1 minute", () => {
    expect(formatDurationMinutes(-1)).toBe("1 menit");
  });

  it("minimum duration is 1 minute", () => {
    expect(formatDurationMinutes(0)).toBe("1 menit");
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
