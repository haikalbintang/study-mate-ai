import { MODES } from "@/data/shared";
import type { ModeKey } from "@/types/shared";

export default function SettingsPanel({
  inputValues,
  onChange,
  onBlur,
}: {
  inputValues: string[];
  onChange: (key: ModeKey, value: string) => void;
  onBlur: (key: ModeKey, value: string) => void;
}) {
  return (
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
            onChange={(e) => onChange(m.key, e.target.value)}
            onBlur={(e) => onBlur(m.key, e.target.value)}
            className="w-14 py-1 px-1.5 rounded-md border border-[#d8d6cd] text-sm text-center"
          />
        </label>
      ))}
    </div>
  );
}
