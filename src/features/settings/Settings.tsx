import { useState } from "react";
import Title from "@/components/common/Title";
import usePomodoro from "@/hooks/usePomodoro";
import Background from "@/components/common/Background";
import Card from "@/components/common/Card";
import SectionTitle from "../dashboard/SectionTitle";
import Toggle from "./Toggle";
import Durations from "./Durations";

export default function Settings() {
  const {
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
    <Background>
      <Card>
        <Title>Settings</Title>

        <SectionTitle>Durations (minute)</SectionTitle>
        <Durations />

        {/* Cycle & goal */}
        <SectionTitle>Cycle & Goal</SectionTitle>
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
        <SectionTitle>Behavior</SectionTitle>
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
      </Card>
    </Background>
  );
}
