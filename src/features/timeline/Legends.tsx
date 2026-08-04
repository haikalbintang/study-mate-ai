import { MODES } from "@/data/shared";

export default function Legends() {
  return (
    <div className="flex gap-3.5 mb-3 flex-wrap">
      {MODES.map((mode) => (
        <div
          key={mode.key}
          className="flex items-center gap-1.25 text-[11px] text-foreground/85"
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: mode.color }}
          />
          {mode.label}
        </div>
      ))}
    </div>
  );
}
