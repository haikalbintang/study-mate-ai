import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

const {
  dbClear,
  dbAdd,
  triggerNotification,
  triggerChimeSound,
  requestNotificationPermission,
} = vi.hoisted(() => ({
  dbClear: vi.fn(),
  dbAdd: vi.fn(),
  triggerNotification: vi.fn(),
  triggerChimeSound: vi.fn(),
  requestNotificationPermission: vi.fn(),
}));

vi.mock("@/db/db", () => ({
  db: { sessions: { clear: dbClear, add: dbAdd } },
}));
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => [] }));
vi.mock("@/utils/notification-helper", () => ({
  requestNotificationPermission,
  triggerChimeSound,
  triggerNotification,
}));

import { PomodoroProvider } from "./PomodoroProvider";
import usePomodoro from "./usePomodoro";

const STORAGE_KEY = "pomodoro-settings";

function renderPomodoro() {
  return renderHook(() => usePomodoro(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <PomodoroProvider>{children}</PomodoroProvider>
    ),
  });
}

beforeEach(() => {
  localStorage.clear();
  dbClear.mockClear();
  dbAdd.mockClear();
  triggerNotification.mockClear();
  triggerChimeSound.mockClear();
  requestNotificationPermission.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PomodoroProvider", () => {
  it("exposes the initial timer state", () => {
    const { result } = renderPomodoro();

    expect(result.current.mode).toBe(0);
    expect(result.current.durations).toEqual([25, 5, 15]);
    expect(result.current.totalSeconds).toBe(1500);
    expect(result.current.secondsLeft).toBe(1500);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.showSettings).toBe(true);
    expect(result.current.stats).toBeDefined();
  });

  it("toggles the settings panel", () => {
    const { result } = renderPomodoro();

    act(() => result.current.handleToggleSettings());
    expect(result.current.showSettings).toBe(false);
    act(() => result.current.handleToggleSettings());
    expect(result.current.showSettings).toBe(true);
  });

  it("updates input values and clamps durations on blur", () => {
    const { result } = renderPomodoro();

    act(() => result.current.handleDurationChange(0, "30"));
    expect(result.current.inputValues[0]).toBe("30");

    act(() => result.current.handleDurationBlur(0, "999"));
    expect(result.current.durations[0]).toBe(120);
    expect(result.current.inputValues[0]).toBe("120");
    expect(result.current.secondsLeftByMode[0]).toBe(120 * 60);
  });

  it("switches modes and pauses the timer when a new mode is selected", () => {
    vi.useFakeTimers();
    const { result } = renderPomodoro();

    act(() => result.current.handlePauseStart());
    expect(result.current.isRunning).toBe(true);

    act(() => result.current.handleSelectMode(1));

    expect(result.current.mode).toBe(1);
    expect(result.current.isRunning).toBe(false);
  });

  it("starts, ticks, pauses and resumes a session", () => {
    vi.useFakeTimers();
    const { result } = renderPomodoro();

    act(() => result.current.handlePauseStart());
    expect(result.current.isRunning).toBe(true);
    expect(result.current.activeSession).not.toBeNull();
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.secondsLeft).toBe(1495);

    act(() => result.current.handlePauseStart());
    expect(result.current.isRunning).toBe(false);
    expect(dbAdd).toHaveBeenCalledWith(
      expect.objectContaining({ completed: false }),
    );

    act(() => result.current.handlePauseStart());
    expect(result.current.isRunning).toBe(true);
  });

  it("resets the current mode back to its full duration", () => {
    vi.useFakeTimers();
    const { result } = renderPomodoro();

    act(() => result.current.handlePauseStart());
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.secondsLeft).toBe(1490);

    act(() => result.current.handleReset());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.secondsLeft).toBe(1500);
  });

  it("completes a focus session and fires notifications", () => {
    vi.useFakeTimers();
    const { result } = renderPomodoro();

    act(() => result.current.handlePauseStart());
    act(() => vi.advanceTimersByTime(1500 * 1000));

    expect(result.current.isRunning).toBe(false);
    expect(result.current.completedFocusSessions).toBe(1);
    expect(result.current.isFinished).toBe(true);
    expect(dbAdd).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true }),
    );
    expect(triggerNotification).toHaveBeenCalledWith(0);
    expect(triggerChimeSound).toHaveBeenCalledTimes(1);
  });

  it("auto-starts the next mode after completion when enabled", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ autoStartNext: true }));
    vi.useFakeTimers();
    const { result } = renderPomodoro();

    act(() => result.current.handlePauseStart());
    act(() => vi.advanceTimersByTime(1500 * 1000));

    expect(result.current.mode).toBe(1);
    expect(result.current.isRunning).toBe(true);
  });

  it("skips to the next mode when starting from a finished timer", () => {
    const { result } = renderPomodoro();

    act(() => result.current.handleDurationBlur(0, "0"));
    expect(result.current.isFinished).toBe(true);

    act(() => result.current.handlePauseStart());

    expect(result.current.mode).toBe(2);
    expect(result.current.isRunning).toBe(true);
  });

  it("clears sessions and all data", () => {
    const { result } = renderPomodoro();

    act(() => result.current.clearSessions());
    expect(dbClear).toHaveBeenCalledTimes(1);

    act(() => result.current.setCompletedFocusSessions(3));
    act(() => result.current.clearAllData());

    expect(dbClear).toHaveBeenCalledTimes(2);
    expect(result.current.completedFocusSessions).toBe(0);
  });
});
