import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import usePomodoro, { PomodoroContext } from "./usePomodoro";
import type { PomodoroContextValue } from "@/types/shared";

describe("usePomodoro", () => {
  it("throws when used outside of a PomodoroProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => usePomodoro())).toThrow(
      "usePomodoro must be used within a PomodoroProvider",
    );

    spy.mockRestore();
  });

  it("returns the context value when a provider is present", () => {
    const value = { mode: 0 } as unknown as PomodoroContextValue;

    const { result } = renderHook(() => usePomodoro(), {
      wrapper: ({ children }) => (
        <PomodoroContext.Provider value={value}>
          {children}
        </PomodoroContext.Provider>
      ),
    });

    expect(result.current).toBe(value);
  });
});
