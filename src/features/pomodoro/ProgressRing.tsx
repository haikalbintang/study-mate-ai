import { CIRCUMFERENCE, CYCLES_BEFORE_LONG_BREAK, RADIUS } from "@/data/shared";
import { formatTime } from "@/utils/helper";

export default function ProgressRing({
  activeColor,
  isRunning,
  secondsLeft,
  progress,
  completedFocusSessions,
}: {
  activeColor: string;
  isRunning: boolean;
  secondsLeft: number;
  progress: number;
  completedFocusSessions: number;
}) {
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const currentDot = completedFocusSessions % CYCLES_BEFORE_LONG_BREAK;
  return (
    <div className="relative flex items-center justify-center mx-auto mb-6 w-64 h-64">
      <svg width="280" height="280" viewBox="0 0 280 280">
        <circle
          cx="140"
          cy="140"
          r={RADIUS}
          fill="none"
          stroke="#e9e7e0"
          strokeWidth="10"
        />
        <circle
          cx="140"
          cy="140"
          r={RADIUS}
          fill="none"
          stroke={activeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 140 140)"
          style={{
            transition: isRunning ? "stroke-dashoffset 1s linear" : "",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <div className="text-5xl font-semibold tracking-[1px] text-[#2b2a26] tabular-nums">
          {formatTime(secondsLeft)}
        </div>
        <div className="mt-2 text-xl tracking-[3px] text-[#c9a25b]">
          {"●".repeat(currentDot)}
          {"○".repeat(CYCLES_BEFORE_LONG_BREAK - currentDot)}
        </div>
      </div>
    </div>
  );
}
