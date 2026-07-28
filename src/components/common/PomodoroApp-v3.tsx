import { useRef, useEffect, useState } from "react";

type ModeKey = 0 | 1 | 2;

interface ModeConfig {
  key: ModeKey;
  label: string;
  minutes: number;
  color: string;
}
const MODES: ModeConfig[] = [
  { key: 0, label: "Focus", minutes: 25, color: "#c25b3a" },
  { key: 1, label: "Short Break", minutes: 5, color: "#3a7d63" },
  { key: 2, label: "Long Break", minutes: 15, color: "#3a5f7d" },
];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PomodoroApp() {
  const [mode, setMode] = useState<ModeKey>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES[mode].minutes * 60);
  const [showSettings, setShowSettings] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = MODES[mode].minutes * 60;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          document.title = "Time's up! — Pomodoro";
          return 0;
        }
        document.title = "Pomodoro";
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const activeColor = MODES[mode].color;

  function handleSelectMode(key: ModeKey) {
    setMode(key);
    setIsRunning(false);

    const newTotalSeconds = MODES[key].minutes * 60;
    setSecondsLeft(newTotalSeconds);
  }
  function handlePauseStart() {
    setIsRunning((r) => !r);
  }
  function handleToggleSettings() {
    setShowSettings((s) => !s);
  }
  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4] text-center">
        <nav className="flex justify-center gap-5 mb-5">
          {MODES.map((mode) => (
            <button
              key={mode.label}
              className={`bg-transparent text-sm font-medium py-1.5 px-0.5 cursor-pointer text-[#8a8a86] border-b-[3px] border-[#8a8a86] `}
              style={{
                color: mode.color,
                borderBottom: `3px solid ${mode.color}`,
              }}
              onClick={() => handleSelectMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </nav>

        <div className="relative flex items-center justify-center mx-auto mb-6 w-64 h-64">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="#e9e7e0"
              strokeWidth="10"
            />
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="red"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120}
              transform="rotate(-90 140 140)"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <div className="text-5xl font-semibold tracking-[1px] text-[#2b2a26] tabular-nums">
              {formatTime(secondsLeft)}
            </div>
            <div className="mt-2 text-sm tracking-[3px] text-[#c9a25b]">
              dot
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <button className="border border-[#e4e2da] bg-white w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-[#5a5850] transition-colors duration-150 ease-out">
            ↺
          </button>
          <button
            className="border-none text-white text-base font-semibold py-3 px-9 rounded-full cursor-pointer transition-[filter,transform] duration-[150ms,100ms] ease-out"
            style={{ backgroundColor: activeColor }}
            onClick={handlePauseStart}
          >
            {isRunning
              ? "Pause"
              : secondsLeft === totalSeconds
                ? "Start"
                : "Resume"}
          </button>
          <button
            onClick={handleToggleSettings}
            className="border border-[#e4e2da] bg-white w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-[#5a5850] transition-colors duration-150 ease-out"
          >
            ⚙
          </button>
        </div>

        <div className="text-sm text-[#9a988f]">
          Focus sessions completed today: <strong>0</strong>
        </div>

        {showSettings && (
          <div className="mt-5 pt-5 border-t border-[#ececE4] flex flex-col gap-2.5 text-left">
            {MODES.map((mode) => (
              <label className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: mode.color }}>
                  {mode.label}
                </span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={0}
                  className="w-14 py-1 px-1.5 rounded-md border border-[#d8d6cd] text-sm text-center"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
