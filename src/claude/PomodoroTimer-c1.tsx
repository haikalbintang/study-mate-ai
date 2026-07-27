import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MODES,
  CYCLES_BEFORE_LONG_BREAK,
  formatTime,
  playChime,
} from "./shared";
import type { ModeKey, ModeConfig, Durations, SessionRecord } from "./shared";

interface PomodoroTimerProps {
  onSessionLogged: (record: SessionRecord) => void;
}

export default function PomodoroTimer({
  onSessionLogged,
}: PomodoroTimerProps): React.JSX.Element {
  const [durations, setDurations] = useState<Durations>({
    focus: MODES.focus.minutes,
    short: MODES.short.minutes,
    long: MODES.long.minutes,
  });
  const [mode, setMode] = useState<ModeKey>("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(durations.focus * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedFocusSessions, setCompletedFocusSessions] =
    useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef<ModeKey>(mode);
  const sessionStartRef = useRef<number | null>(null);

  // Keep a ref mirror of `mode` so the interval callback (which isn't
  // recreated every time the mode changes) always logs the right mode.
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Reset the visible countdown whenever the mode itself changes — this
  // covers both manual tab switches and automatic focus/break transitions,
  // so a completed session can never bleed into the next one's time.
  // useEffect(() => {
  //   setSecondsLeft(durations[mode] * 60);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mode]);

  // If the user edits a duration while stopped, reflect it immediately.
  // useEffect(() => {
  //   if (!isRunning) {
  //     setSecondsLeft(durations[mode] * 60);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [durations]);

  const logSession = useCallback(
    (finishedMode: ModeKey, completed: boolean) => {
      const end = Date.now();
      const start =
        sessionStartRef.current ?? end - durations[finishedMode] * 60000;
      onSessionLogged({
        id: `${end}-${Math.random().toString(36).slice(2, 7)}`,
        mode: finishedMode,
        start,
        end,
        completed,
      });
      sessionStartRef.current = null;
    },
    [durations, onSessionLogged],
  );

  const goToNextMode = useCallback(() => {
    setMode((currentMode) => {
      if (currentMode === "focus") {
        const nextCount = completedFocusSessions + 1;
        setCompletedFocusSessions(nextCount);
        return nextCount % CYCLES_BEFORE_LONG_BREAK === 0 ? "long" : "short";
      }
      return "focus";
    });
  }, [completedFocusSessions]);

  useEffect(() => {
    if (!isRunning) return;

    if (sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playChime();
          const original = "Pomodoro";
          document.title = "Time's up! — Pomodoro";
          setTimeout(() => {
            document.title = original;
          }, 3000);
          logSession(modeRef.current, true);
          goToNextMode();
          return 0; // the mode-change effect above will set the real value
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, goToNextMode, logSession]);

  const totalSeconds = durations[mode] * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const activeColor = MODES[mode].color;

  const handleStartPause = (): void => {
    setIsRunning((r) => !r);
  };

  const handleReset = (): void => {
    if (isRunning && secondsLeft < totalSeconds) {
      logSession(mode, false); // sesi dihentikan sebelum selesai
    } else {
      sessionStartRef.current = null;
    }
    setIsRunning(false);
    setSecondsLeft(durations[mode] * 60);
  };

  const handleSelectMode = (key: ModeKey): void => {
    if (isRunning && secondsLeft < totalSeconds) {
      logSession(mode, false);
    } else {
      sessionStartRef.current = null;
    }
    setIsRunning(false);
    setMode(key);
  };

  const handleDurationChange = (key: ModeKey, value: string): void => {
    const clamped = Math.max(1, Math.min(120, Number(value) || 1));
    setDurations((prev) => ({ ...prev, [key]: clamped }));
  };

  // Circle geometry for the progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const currentDot =
    completedFocusSessions % CYCLES_BEFORE_LONG_BREAK ||
    (completedFocusSessions > 0 ? CYCLES_BEFORE_LONG_BREAK : 0);

  return (
    <div className="pomo-card" style={styles.card}>
      <div style={styles.tabRow}>
        {(Object.entries(MODES) as [ModeKey, ModeConfig][]).map(([key, m]) => (
          <button
            key={key}
            className="pomo-tab"
            onClick={() => handleSelectMode(key)}
            style={{
              ...styles.tab,
              color: mode === key ? m.color : "#8a8a86",
              borderBottom:
                mode === key ? `2px solid ${m.color}` : "2px solid transparent",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={styles.ringWrap}>
        <svg width="280" height="280" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#e9e7e0"
            strokeWidth="10"
          />
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 140 140)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div style={styles.timeOverlay}>
          <div style={styles.time}>{formatTime(secondsLeft)}</div>
          <div style={styles.sessionCount}>
            {"●".repeat(currentDot)}
            {"○".repeat(CYCLES_BEFORE_LONG_BREAK - currentDot)}
          </div>
        </div>
      </div>

      <div style={styles.controls}>
        <button
          className="pomo-icon-btn"
          onClick={handleReset}
          style={styles.iconBtn}
          aria-label="Reset timer"
          title="Reset"
        >
          ↺
        </button>
        <button
          className="pomo-btn"
          onClick={handleStartPause}
          style={{ ...styles.mainBtn, background: activeColor }}
        >
          {isRunning
            ? "Pause"
            : secondsLeft === totalSeconds
              ? "Start"
              : "Resume"}
        </button>
        <button
          className="pomo-icon-btn"
          onClick={() => setShowSettings((s) => !s)}
          style={styles.iconBtn}
          aria-label="Toggle settings"
          title="Settings"
        >
          ⚙
        </button>
      </div>

      <div style={styles.footer}>
        Focus sessions completed today:{" "}
        <strong>{completedFocusSessions}</strong>
      </div>

      {showSettings && (
        <div style={styles.settingsPanel}>
          {(Object.entries(MODES) as [ModeKey, ModeConfig][]).map(
            ([key, m]) => (
              <label key={key} style={styles.settingRow}>
                <span style={{ color: m.color, fontWeight: 500 }}>
                  {m.label} (min)
                </span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={durations[key]}
                  onChange={(e) => handleDurationChange(key, e.target.value)}
                  style={styles.numberInput}
                />
              </label>
            ),
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px 36px 28px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(30,25,15,0.08)",
    border: "1px solid #ececE4",
    textAlign: "center",
    boxSizing: "border-box",
  },
  tabRow: {
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    marginBottom: "20px",
  },
  tab: {
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: 500,
    padding: "6px 2px",
    cursor: "pointer",
  },
  ringWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    width: "280px",
    height: "280px",
  },
  timeOverlay: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontSize: "48px",
    fontWeight: 600,
    letterSpacing: "1px",
    color: "#2b2a26",
    fontVariantNumeric: "tabular-nums",
  },
  sessionCount: {
    marginTop: "8px",
    fontSize: "14px",
    letterSpacing: "3px",
    color: "#c9a25b",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  mainBtn: {
    border: "none",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    padding: "12px 36px",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "filter 0.15s ease, transform 0.1s ease",
  },
  iconBtn: {
    border: "1px solid #e4e2da",
    background: "#fff",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    fontSize: "18px",
    cursor: "pointer",
    color: "#5a5850",
    transition: "background 0.15s ease",
  },
  footer: {
    fontSize: "13px",
    color: "#9a988f",
  },
  settingsPanel: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #ececE4",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    textAlign: "left",
  },
  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "13px",
  },
  numberInput: {
    width: "56px",
    padding: "4px 6px",
    borderRadius: "6px",
    border: "1px solid #d8d6cd",
    fontSize: "13px",
    textAlign: "center",
  },
};
