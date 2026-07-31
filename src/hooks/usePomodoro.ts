import type { PomodoroContextValue } from "@/types/shared";
import { createContext, useContext } from "react";

export const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export default function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return ctx;
}
