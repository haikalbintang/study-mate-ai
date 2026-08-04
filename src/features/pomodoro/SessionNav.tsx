import { MODES } from "@/data/shared";
import usePomodoro from "@/hooks/usePomodoro";

export default function SessionNav() {
  const { mode, handleSelectMode } = usePomodoro();
  return (
    <nav className="flex justify-center gap-5 mb-5">
      {MODES.map((m) => (
        <button
          key={m.key}
          className="bg-transparent text-sm font-medium py-1.5 px-0.5 cursor-pointer border-b-[3px]"
          style={{
            color: mode === m.key ? m.color : "var(--muted-foreground)",
            borderBottom:
              mode === m.key ? `3px solid ${m.color}` : "3px solid transparent",
          }}
          onClick={() => handleSelectMode(m.key)}
        >
          {m.label}
        </button>
      ))}
    </nav>
  );
}
