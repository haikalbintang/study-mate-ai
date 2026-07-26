import { useState, useEffect, useRef, useCallback } from "react";

// ---- Config -----------------------------------------------------------
const MODES = {
  focus: { label: "Focus", minutes: 25, color: "#c25b3a" },
  short: { label: "Short break", minutes: 5, color: "#3a7d63" },
  long: { label: "Long break", minutes: 15, color: "#3a5f7d" },
};

const CYCLES_BEFORE_LONG_BREAK = 4;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Simple two-tone chime using the Web Audio API — no external assets needed.
function playChime() {
  try {
    const ctx = new window.AudioContext();
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.2 + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.4);
    });
  } catch (e) {
    console.error(e);
    // Audio not available — fail silently.
  }
}

export default function PomodoroApp() {
  const [durations, setDurations] = useState({
    focus: MODES.focus.minutes,
    short: MODES.short.minutes,
    long: MODES.long.minutes,
  });
  const [mode, setMode] = useState<string>("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(durations.focus * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedFocusSessions, setCompletedFocusSessions] =
    useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const intervalRef = useRef(null);

  // Keep the clock in sync whenever the mode or its configured duration changes,
  // but only while the timer is stopped (so editing settings mid-run is safe).
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(durations[mode] * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, durations]);

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

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playChime();
          if (document.title) {
            const original = "Pomodoro";
            document.title = "Time's up! — Pomodoro";
            setTimeout(() => (document.title = original), 3000);
          }
          goToNextMode();
          return 0; // will be overwritten by the mode-change effect above
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, goToNextMode]);

  const totalSeconds = durations[mode] * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const activeColor = MODES[mode].color;

  const handleStartPause = () => setIsRunning((r) => !r);
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(durations[mode] * 60);
  };
  const handleSelectMode = (key: string) => {
    setIsRunning(false);
    setMode(key);
  };

  const handleDurationChange = (key, value) => {
    const clamped = Math.max(1, Math.min(120, Number(value) || 1));
    setDurations((prev) => ({ ...prev, [key]: clamped }));
  };

  // Circle geometry for the progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
        .pomo-card { animation: fadeIn 0.4s ease-out; }
        .pomo-btn:hover { filter: brightness(1.08); }
        .pomo-btn:active { transform: scale(0.97); }
        .pomo-tab { transition: color 0.2s ease, border-color 0.2s ease; }
        .pomo-icon-btn:hover { background: rgba(0,0,0,0.05); }
      `}</style>

      <div className="pomo-card" style={styles.card}>
        <div style={styles.tabRow}>
          {Object.entries(MODES).map(([key, m]) => (
            <button
              key={key}
              className="pomo-tab"
              onClick={() => handleSelectMode(key)}
              style={{
                ...styles.tab,
                color: mode === key ? m.color : "#8a8a86",
                borderBottom:
                  mode === key
                    ? `2px solid ${m.color}`
                    : "2px solid transparent",
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
              {"●".repeat(
                completedFocusSessions % CYCLES_BEFORE_LONG_BREAK ||
                  (completedFocusSessions > 0 ? CYCLES_BEFORE_LONG_BREAK : 0),
              )}
              {"○".repeat(
                CYCLES_BEFORE_LONG_BREAK -
                  (completedFocusSessions % CYCLES_BEFORE_LONG_BREAK ||
                    (completedFocusSessions > 0
                      ? CYCLES_BEFORE_LONG_BREAK
                      : 0)),
              )}
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
            {Object.entries(MODES).map(([key, m]) => (
              <label key={key} style={styles.settingRow}>
                <span style={{ color: m.color, fontWeight: 500 }}>
                  {m.label} (min)
                </span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={durations[key]}
                  onChange={(e) => handleDurationChange(key, e.target.value)}
                  style={styles.numberInput}
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Styles -------------------------------------------------------------
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f4ee",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px 36px 28px",
    width: "360px",
    maxWidth: "100%",
    boxShadow: "0 20px 60px rgba(30,25,15,0.08)",
    border: "1px solid #ececE4",
    textAlign: "center",
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
