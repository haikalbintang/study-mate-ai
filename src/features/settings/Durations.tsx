import { MODES } from "@/data/shared";
import usePomodoro from "@/hooks/usePomodoro";
import type { ModeKey } from "@/types/shared";

export default function Durations() {
  const { inputValues, handleDurationChange, handleDurationBlur } =
    usePomodoro();

  return (
    <div className="flex flex-col gap-2.5">
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
            onBlur={(e) => handleDurationBlur(m.key as ModeKey, e.target.value)}
            className="w-14 px-2 py-1 rounded-md border border-input bg-background text-sm text-center text-foreground"
          />
        </label>
      ))}
    </div>
  );
}
