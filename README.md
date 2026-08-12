# StudyMate 🍅

**An offline-first Pomodoro study companion — track your focus, see your patterns, build the streak.**

StudyMate is a installable Progressive Web App built around the Pomodoro Technique. Beyond the timer itself, it logs every session locally, visualizes your focus habits on a daily timeline and a GitHub-style activity heatmap, and surfaces insights about _when_ and _how consistently_ you actually focus — all without a backend, and all working offline.

![status](https://img.shields.io/badge/status-active-brightgreen)
![react](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![pwa](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Why This Project Is Interesting (Technical Highlights)](#why-this-project-is-interesting-technical-highlights)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

### ⏱ Timer

- Classic Focus / Short Break / Long Break cycle, with a configurable number of focus sessions before a long break
- Circular progress ring with live countdown
- **Survives backgrounded tabs.** The countdown is timestamp-based rather than tick-decremented, so it stays accurate even when the browser throttles `setInterval` in an inactive tab (see [Technical Highlights](#why-this-project-is-interesting-technical-highlights))
- Optional **auto-start**: the next session begins automatically the moment the current one ends
- Chime + desktop notification when a session finishes

### 📜 Timeline

- Daily vertical view (00:00–24:00), sessions rendered as colored blocks positioned by actual start/end time — like a calendar day view
- Pinch-to-zoom on the timeline to inspect a busy hour more closely
- Live indicator for the session currently in progress

### 📊 Dashboard

- **Streak counter** — consecutive days with at least one completed focus session
- **Goal progress bar** — sessions completed today vs. your daily target
- Stat cards: sessions completed, total focus time, completion rate
- **Time distribution** bars across Focus / Short Break / Long Break
- **12-week activity heatmap**, GitHub-contributions-style, color intensity mapped to daily focus minutes
- Auto-generated **insights**: your historically most productive hour, focus time vs. yesterday, and sessions remaining to hit today's goal

### ⚙️ Settings

- Adjustable durations for each session type
- Configurable cycles-before-long-break and daily session goal
- Toggle auto-start-next-session and notification sound
- Dark mode
- One-tap "clear all data" reset

### 📱 PWA

- Installable on desktop and mobile, works fully offline once loaded
- Bottom tab navigation for app-like mobile ergonomics

---

## Why This Project Is Interesting (Technical Highlights)

A few decisions in this codebase were made deliberately, not by default — worth reading if you're reviewing the code:

**1. Offline-first persistence with Dexie (IndexedDB), not `localStorage`.**
Session history is written to IndexedDB via [Dexie.js](https://dexie.org/) and read reactively with `dexie-react-hooks`' `useLiveQuery`. Every component consuming session data re-renders automatically when the underlying table changes — no manual refetching, no stale caches — while remaining fully queryable and indexed (`start`, `modeKey`) for fast day/mode filtering as history grows.

**2. A timer architecture that survives browser throttling.**
Chrome (and other browsers) aggressively throttle `setInterval`/`setTimeout` in backgrounded tabs — sometimes down to once a minute. A naive "decrement by 1 every tick" timer silently drifts or appears frozen under this throttling. StudyMate instead stores an absolute `endTime` timestamp and recomputes `remaining = endTime - Date.now()` on every tick, so the displayed time is always correct regardless of how irregularly the interval actually fires. A `visibilitychange` listener additionally forces an immediate resync the moment the tab regains focus, so the user never sees a stale number.

**3. Context + custom hooks over a monolithic state blob.**
State is decomposed into single-purpose hooks (`useSettings`, `useActiveSessionClock`, `useSessionsFromDb`, `useDailyStats`, `useTodayBoundary`, `useSyncDarkMode`) composed inside one `PomodoroProvider`. Each hook owns one concern and is independently testable, while the provider wires them together and exposes a single context to the UI layer.

**4. Client-side analytics with zero backend.**
Streaks, best-focus-hour, day-over-day comparisons, and the heatmap are all derived client-side from the local session log via memoized aggregation — no server, no analytics pipeline, and it works fully offline.

---

## Tech Stack

| Layer         | Choice                                                |
| ------------- | ----------------------------------------------------- |
| UI            | React + TypeScript                                    |
| Styling       | Tailwind CSS                                          |
| State         | React Context API + custom hooks                      |
| Persistence   | IndexedDB via Dexie.js (`dexie`, `dexie-react-hooks`) |
| Gestures      | `@use-gesture/react` (pinch-to-zoom on the timeline)  |
| Notifications | Web Notifications API + Web Audio API (chime)         |
| PWA           | Service worker + manifest, installable                |

---

## Screenshots

<img src="/public/Timer.png" width="300" height="300">

![Timer](/public/Timer.png)
![Focus](/public/Focus.png)
![Short Break](/public/ShortBreak.png)
![Long Break](/public/LongBreak.png)
![Timeline](/public/Timeline.png)
![Settings](/public/Settings.png)
![Auto Start](/public/AutoStart.png)
![Dark](/public/Dark.png)
![Dark 2](/public/Dark2.png)
![Dark 3](/public/Dark3.png)
![Dashboard](/public/Dashboard.png)
![Dashboard 2](/public/Dashboard2.png)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn — adjust commands accordingly)

### Installation

```bash
git clone https://github.com/<your-username>/studymate.git
cd studymate
npm install
```

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or whichever port Vite reports).

### Build for production

```bash
npm run build
npm run preview
```

### Install as a PWA

Once running, open the app in Chrome/Edge and use the browser's "Install app" prompt (or the install icon in the address bar) to add it to your device as a standalone app.

---

## Project Structure

```
src/
├── App.tsx                      # Top-level layout: view switcher + bottom nav
├── db/
│   └── db.ts                    # Dexie database + schema definition
├── hooks/
│   ├── PomodoroProvider.tsx     # Composes all state into one context
│   ├── usePomodoro.ts           # Context + consumer hook
│   ├── useSettings.ts           # Persisted user preferences
│   ├── useTodayBoundary.ts      # Local-midnight boundary helper
│   ├── useActiveSessionClock.ts # Tracks the in-progress session's clock
│   ├── useSessionFromDb.ts      # Live-queries session history from Dexie
│   ├── useDailyStats.ts         # Derived stats (streak, totals, insights)
│   └── useSyncDarkMode.ts       # Syncs dark mode to <html> class
├── components/
│   ├── common/                  # Shared building blocks (Card, Title, buttons…)
│   ├── timer/                   # Timer view + progress ring
│   ├── timeline/                # Day timeline + pinch-zoom
│   ├── dashboard/                # Dashboard + Heatmap
│   └── settings/                # Settings page
├── data/
│   └── shared.ts                # Mode config (labels, colors, defaults)
├── types/
│   └── shared.ts                # Shared TypeScript types
└── utils/
    ├── helper.ts                 # Formatting, clamping, date helpers
    ├── logSession.ts             # Writes a finished session to Dexie
    └── notification-helper.ts    # Chime + browser notification triggers
```

_(Exact structure may differ slightly as the project evolves — this reflects the current architecture.)_

---

## Architecture

```
        ┌────────────────────┐
        │  PomodoroProvider   │  ← composes hooks, exposes one context
        └─────────┬──────────┘
                   │
   ┌───────────────┼───────────────┬────────────────┐
   │               │               │                │
 Timer          Timeline       Dashboard         Settings
(countdown,   (day view of   (streak, goal,    (durations, goal,
 controls)     all sessions)  heatmap, stats)   toggles, reset)
```

All four views consume the same `usePomodoro()` context — none of them own state directly. Session data flows one way: **Dexie (IndexedDB) → `useSessionsFromDb` (live query) → context → views.** Writing a session (`logSession`) is the only path that mutates the store; every view reacting to that change happens automatically through Dexie's live query, not through manual prop passing.

---

## Data Model

```ts
type ModeKey = 0 | 1 | 2; // 0 = focus, 1 = short break, 2 = long break

interface Session {
  id: string;
  modeKey: ModeKey;
  mode: "focus" | "shortBreak" | "longBreak";
  start: number; // epoch ms
  end: number; // epoch ms
  completed: boolean; // false if stopped/paused before naturally finishing
}
```

Stored in a single Dexie table (`sessions`), indexed on `id`, `start`, and `modeKey` for fast day- and mode-scoped queries.

---

## Known Limitations

- **Background notifications aren't instant.** If the tab is backgrounded when a session ends, the completion sound/notification fires as soon as the tab regains focus — not necessarily at the exact second the timer hit zero. True background-accurate notifications would require Web Push + a backend, which is out of scope for this local-first version.
- **No account/cloud sync yet.** All data lives in the browser's IndexedDB. Clearing site data, switching browsers, or switching devices means starting fresh. See [Roadmap](#roadmap).

---

## Roadmap

- [ ] Optional login + cloud sync (offline-first cache backed by a server, last-write-wins reconciliation)
- [ ] Web Push notifications for precise session-end alerts even when the tab/app is closed
- [ ] Wake Lock API to prevent mobile screens from sleeping mid-session
- [ ] Timeline navigation across previous days/weeks, not just "today"
- [ ] Export session history (CSV/JSON)
- [ ] Weekly/monthly heatmap zoom levels

---

## License

MIT — see [`LICENSE`](./LICENSE) for details.
