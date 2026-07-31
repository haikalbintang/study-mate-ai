import type { ModeConfig, ViewKey } from "@/types/shared";

export const NAV_ITEMS: { key: ViewKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "timer", label: "Timer", icon: "⏱" },
  { key: "timeline", label: "Timeline", icon: "📜" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

export const MODES: ModeConfig[] = [
  { key: 0, label: "Focus", minutes: 25, color: "#c25b3a" },
  { key: 1, label: "Short Break", minutes: 5, color: "#3a7d63" },
  { key: 2, label: "Long Break", minutes: 15, color: "#3a5f7d" },
];

export const CYCLES_BEFORE_LONG_BREAK = 4;
export const HOUR_HEIGHT = 200;
export const RADIUS = 120;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
export const PACE = 1;
