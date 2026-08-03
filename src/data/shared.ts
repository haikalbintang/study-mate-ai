import type { ModeConfig, ViewKey } from "@/types/shared";

export const NAV_ITEMS: { key: ViewKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "timer", label: "Timer", icon: "⏱" },
  { key: "timeline", label: "Timeline", icon: "📜" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

// DEV
export const MODES: ModeConfig[] = [
  { key: 0, label: "Focus", minutes: 1, color: "#c25b3a" },
  { key: 1, label: "Short Break", minutes: 1, color: "#3a7d63" },
  { key: 2, label: "Long Break", minutes: 2, color: "#3a5f7d" },
];
export const PACE = 20;

// // PROD
// export const MODES: ModeConfig[] = [
//   { key: 0, label: "Focus", minutes: 25, color: "#c25b3a" },
//   { key: 1, label: "Short Break", minutes: 5, color: "#3a7d63" },
//   { key: 2, label: "Long Break", minutes: 15, color: "#3a5f7d" },
// ];
// export const PACE = 1;

export const CYCLES_BEFORE_LONG_BREAK = 4;
export const HOUR_HEIGHT = 100;
export const RADIUS = 120;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 4;

// TODO: move this into Settings once a "daily goal" input exists there.
export const DAILY_GOAL_SESSIONS = 4;
