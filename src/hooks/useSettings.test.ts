import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSettings } from "./useSettings";

const STORAGE_KEY = "pomodoro-settings";

beforeEach(() => {
  localStorage.clear();
});

describe("useSettings", () => {
  it("falls back to defaults when storage is empty", () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.dailyGoal).toBe(4);
    expect(result.current.cyclesBeforeLongBreak).toBe(4);
    expect(result.current.autoStartNext).toBe(false);
    expect(result.current.soundEnabled).toBe(true);
    expect(result.current.durations).toEqual([25, 5, 15]);
  });

  it("merges stored settings over the defaults", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dailyGoal: 8, darkMode: true }),
    );

    const { result } = renderHook(() => useSettings());

    expect(result.current.dailyGoal).toBe(8);
    expect(result.current.darkMode).toBe(true);
    expect(result.current.soundEnabled).toBe(true); // untouched default
  });

  it("falls back to defaults when stored JSON is malformed", () => {
    localStorage.setItem(STORAGE_KEY, "{ not json");

    const { result } = renderHook(() => useSettings());

    expect(result.current.dailyGoal).toBe(4);
    expect(result.current.durations).toEqual([25, 5, 15]);
  });

  it("persists updates to localStorage", async () => {
    const { result } = renderHook(() => useSettings());

    act(() => result.current.setDarkMode(true));
    act(() => result.current.setDailyGoal(6));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      expect(stored.darkMode).toBe(true);
      expect(stored.dailyGoal).toBe(6);
    });
  });

  it("updates boolean flags via their setters", () => {
    const { result } = renderHook(() => useSettings());

    act(() => result.current.setAutoStartNext(true));
    act(() => result.current.setSoundEnabled(false));
    act(() => result.current.setCyclesBeforeLongBreak(2));

    expect(result.current.autoStartNext).toBe(true);
    expect(result.current.soundEnabled).toBe(false);
    expect(result.current.cyclesBeforeLongBreak).toBe(2);
  });

  it("accepts a direct value for durations", () => {
    const { result } = renderHook(() => useSettings());

    act(() => result.current.setDurations([10, 2, 8]));

    expect(result.current.durations).toEqual([10, 2, 8]);
  });

  it("accepts an updater function for durations", () => {
    const { result } = renderHook(() => useSettings());

    act(() =>
      result.current.setDurations((prev) => prev.map((d) => d + 1)),
    );

    expect(result.current.durations).toEqual([26, 6, 16]);
  });

  it("defaults darkMode from the system preference when no settings are stored", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    vi.resetModules();

    const { useSettings: freshUseSettings } = await import("./useSettings");
    const { result } = renderHook(() => freshUseSettings());

    expect(result.current.darkMode).toBe(true);

    vi.unstubAllGlobals();
  });
});
