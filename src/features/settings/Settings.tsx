import { useState } from "react";
import Title from "@/components/common/Title";
import { MODES } from "@/data/shared";
import usePomodoro from "@/hooks/usePomodoro";
import type { ModeKey } from "@/types/shared";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-10 h-6 rounded-full relative shrink-0 transition-colors duration-200 border-none cursor-pointer"
      style={{ backgroundColor: checked ? "#c25b3a" : "#e4e1d7" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{
          transform: checked ? "translateX(-18px)" : "translateX(-2px)",
        }}
      />
    </button>
  );
}

export default function Settings() {
  const {
    inputValues,
    handleDurationChange,
    handleDurationBlur,
    dailyGoal,
    setDailyGoal,
    cyclesBeforeLongBreak,
    setCyclesBeforeLongBreak,
    autoStartNext,
    setAutoStartNext,
    soundEnabled,
    setSoundEnabled,
    clearAllData,
  } = usePomodoro();

  const [dailyGoalInput, setDailyGoalInput] = useState(String(dailyGoal));
  const [cyclesInput, setCyclesInput] = useState(String(cyclesBeforeLongBreak));
  const [confirmingReset, setConfirmingReset] = useState(false);

  function commitDailyGoal(value: string) {
    const n = Math.max(1, Math.min(20, Number(value) || 1));
    setDailyGoalInput(String(n));
    setDailyGoal(n);
  }

  function commitCycles(value: string) {
    const n = Math.max(2, Math.min(8, Number(value) || 2));
    setCyclesInput(String(n));
    setCyclesBeforeLongBreak(n);
  }

  function handleResetClick() {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    clearAllData();
    setConfirmingReset(false);
  }

  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
        <Title>Settings</Title>

        {/* Durations */}
        <div className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] mt-6 mb-3">
          Durations (minute)
        </div>
        <div className="flex flex-col gap-3.5">
          {MODES.map((m) => (
            <label
              key={m.key}
              className="flex items-center justify-between text-sm"
            >
              <span style={{ color: m.color }} className="font-medium">
                {m.label}
              </span>
              <input
                type="number"
                min={1}
                max={120}
                value={inputValues[m.key]}
                onChange={(e) =>
                  handleDurationChange(m.key as ModeKey, e.target.value)
                }
                onBlur={(e) =>
                  handleDurationBlur(m.key as ModeKey, e.target.value)
                }
                className="w-14 px-2 py-1 rounded-md border border-[#d8d6cd] text-sm text-center"
              />
            </label>
          ))}
        </div>

        {/* Cycle & goal */}
        <div className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] mt-6 mb-3">
          Cycle &amp; Goal
        </div>
        <div className="flex flex-col gap-3.5">
          <label className="flex items-center justify-between text-sm">
            <span className="text-[#2b2a26]">Session before long break</span>
            <input
              type="number"
              min={2}
              max={8}
              value={cyclesInput}
              onChange={(e) => setCyclesInput(e.target.value)}
              onBlur={(e) => commitCycles(e.target.value)}
              className="w-14 px-2 py-1 rounded-md border border-[#d8d6cd] text-sm text-center"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span className="text-[#2b2a26]">Daily focus session goal</span>
            <input
              type="number"
              min={1}
              max={20}
              value={dailyGoalInput}
              onChange={(e) => setDailyGoalInput(e.target.value)}
              onBlur={(e) => commitDailyGoal(e.target.value)}
              className="w-14 px-2 py-1 rounded-md border border-[#d8d6cd] text-sm text-center"
            />
          </label>
        </div>

        {/* Behavior */}
        <div className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] mt-6 mb-3">
          Behavior
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-[#2b2a26]">Auto-start next session</div>
              <div className="text-[11px] text-[#9a988f] mt-0.5">
                Immediately start the next session without having to click
                Start{" "}
              </div>
            </div>
            <Toggle checked={autoStartNext} onChange={setAutoStartNext} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-[#2b2a26]">Sound notifications</div>
              <div className="text-[11px] text-[#9a988f] mt-0.5">
                Play chime when session is complete
              </div>
            </div>
            <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-6 pt-4 border-t border-[#ececE4]">
          <button
            onClick={handleResetClick}
            onBlur={() => setConfirmingReset(false)}
            className={`w-full text-sm font-medium rounded-lg py-2.5 border transition-colors ${
              confirmingReset
                ? "bg-[#c25b3a] text-white border-[#c25b3a]"
                : "bg-white text-[#c25b3a] border-[#e8cabf] hover:bg-[#fdf3ea]"
            }`}
          >
            {confirmingReset ? "Are you sure?" : "Delete all data"}
          </button>
        </div>
      </div>
    </div>
  );
}
