import { useRef, useEffect, useState } from "react";
import { MODES } from "@/data/shared";
import {
  formatTime,
  onTimerComplete,
  requestNotificationPermission,
} from "@/utils/helper";
import type { ModeKey } from "@/types/shared";

export default function Timer() {
  const [mode, setMode] = useState<ModeKey>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [durations, setDurations] = useState([
    MODES[0].minutes,
    MODES[1].minutes,
    MODES[2].minutes,
  ]);
  const [secondsLeft, setSecondsLeft] = useState(durations[mode] * 60);

  const [inputValues, setInputValues] = useState<string[]>([
    String(MODES[0].minutes),
    String(MODES[1].minutes),
    String(MODES[2].minutes),
  ]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (secondsLeft === 0) {
      onTimerComplete();
    }
  }, [secondsLeft]);

  const totalSeconds = durations[mode] * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const activeColor = MODES[mode].color;

  function handleSelectMode(key: ModeKey) {
    setMode(key);
    setIsRunning(false);

    const newTotalSeconds = durations[key] * 60;
    setSecondsLeft(newTotalSeconds);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(durations[mode] * 60);
  }
  function handlePauseStart() {
    setIsRunning((r) => !r);
    requestNotificationPermission();
  }
  function handleToggleSettings() {
    setShowSettings((s) => !s);
  }

  function handleDurationChange(key: ModeKey, value: string) {
    const clamped = Math.max(1, Math.min(120, Number(value) || 1));
    setInputValues((prev) => {
      const nextArray = [...prev];
      nextArray[key] = String(clamped);
      return nextArray;
    });
  }

  function handleDurationBlur(key: ModeKey, value: string) {
    const clamped = Math.max(1, Math.min(120, Number(value) || 1));
    setInputValues((prev) => {
      const nextArray = [...prev];
      nextArray[key] = String(clamped);
      return nextArray;
    });
    setDurations((prev) => {
      const nextArray = [...prev];
      nextArray[key] = clamped;
      return nextArray;
    });
    if (mode === key) setSecondsLeft(clamped * 60);
  }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4] text-center">
        <nav className="flex justify-center gap-5 mb-5">
          {MODES.map((m) => (
            <button
              key={m.key}
              className={`bg-transparent text-sm font-medium py-1.5 px-0.5 cursor-pointer text-[#8a8a86] border-b-[3px] border-[#8a8a86] `}
              style={{
                color: mode === m.key ? m.color : "#8a8a86",
                borderBottom:
                  mode === m.key
                    ? `3px solid ${m.color}`
                    : "3px solid transparent",
              }}
              onClick={() => handleSelectMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <div className="relative flex items-center justify-center mx-auto mb-6 w-64 h-64">
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
          <button
            className="border border-[#e4e2da] bg-white w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-[#5a5850] transition-colors duration-150 ease-out"
            onClick={handleReset}
            aria-label="Reset timer"
            title="Reset"
          >
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
            {MODES.map((m) => (
              <label
                key={m.key}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium" style={{ color: m.color }}>
                  {m.label}
                </span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={inputValues[m.key]}
                  onChange={(e) => handleDurationChange(m.key, e.target.value)}
                  onBlur={(e) => handleDurationBlur(m.key, e.target.value)}
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
