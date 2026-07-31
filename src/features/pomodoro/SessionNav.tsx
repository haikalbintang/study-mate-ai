import { MODES } from "@/data/shared";
import type { ModeKey } from "@/types/shared";

export default function SessionNav({
  mode,
  onClick,
}: {
  mode: ModeKey;
  onClick: (key: ModeKey) => void;
}) {
  return (
    <nav className="flex justify-center gap-5 mb-5">
      {MODES.map((m) => (
        <button
          key={m.key}
          className={`bg-transparent text-sm font-medium py-1.5 px-0.5 cursor-pointer text-[#8a8a86] border-b-[3px] border-[#8a8a86] `}
          style={{
            color: mode === m.key ? m.color : "#8a8a86",
            borderBottom:
              mode === m.key ? `3px solid ${m.color}` : "3px solid transparent",
          }}
          onClick={() => onClick(m.key)}
        >
          {m.label}
        </button>
      ))}
    </nav>
  );
}
