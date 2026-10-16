import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useActiveSessionClock } from "./useActiveSessionClock";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useActiveSessionClock", () => {
  it("starts with no active session and a now value", () => {
    const { result } = renderHook(() => useActiveSessionClock());

    expect(result.current.activeSession).toBeNull();
    expect(result.current.now).toBeInstanceOf(Date);
  });

  it("begins a session with the right mode name and start time", () => {
    const { result } = renderHook(() => useActiveSessionClock());

    act(() => result.current.beginSession(1));

    expect(result.current.activeSession?.modeKey).toBe(1);
    expect(result.current.activeSession?.mode).toBe("shortBreak");
    expect(result.current.activeSession?.start).toBeInstanceOf(Date);
    expect(result.current.now.getTime()).toBe(
      result.current.activeSession!.start.getTime(),
    );
  });

  it("maps every mode key to its session kind", () => {
    const { result } = renderHook(() => useActiveSessionClock());

    act(() => result.current.beginSession(0));
    expect(result.current.activeSession?.mode).toBe("focus");

    act(() => result.current.beginSession(2));
    expect(result.current.activeSession?.mode).toBe("longBreak");
  });

  it("ticks now forward once per second while a session is active", () => {
    const { result } = renderHook(() => useActiveSessionClock());

    act(() => result.current.beginSession(0));
    const first = result.current.now.getTime();

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.now.getTime()).toBe(first + 1000);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.now.getTime()).toBe(first + 3000);
  });

  it("does not create duplicate intervals when the clock is already ticking", () => {
    const { result } = renderHook(() => useActiveSessionClock());

    act(() => result.current.beginSession(0));
    act(() => result.current.beginSession(1));
    const restarted = result.current.now.getTime();

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.now.getTime()).toBe(restarted + 1000);
  });

  it("ends the session and stops ticking", () => {
    const { result } = renderHook(() => useActiveSessionClock());

    act(() => result.current.beginSession(0));
    act(() => result.current.endSession());

    expect(result.current.activeSession).toBeNull();

    const frozen = result.current.now.getTime();
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.now.getTime()).toBe(frozen);
  });

  it("is a no-op to end a session when none is running", () => {
    const { result } = renderHook(() => useActiveSessionClock());

    act(() => result.current.endSession());

    expect(result.current.activeSession).toBeNull();
  });
});
