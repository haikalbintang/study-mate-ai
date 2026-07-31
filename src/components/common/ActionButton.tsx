export default function ActionButton({
  activeColor,
  onClick,
  isRunning,
  secondsLeft,
  totalSeconds,
  isFinished,
}: {
  activeColor: string;
  onClick: () => void;
  isRunning: boolean;
  secondsLeft: number;
  totalSeconds: number;
  isFinished: boolean;
}) {
  return (
    <button
      className="border-none text-white text-base font-semibold py-3 px-9 rounded-full cursor-pointer transition-[filter,transform] duration-[150ms,100ms] ease-out"
      style={{ backgroundColor: activeColor }}
      onClick={onClick}
    >
      {isRunning
        ? "Pause"
        : isFinished
          ? "Next"
          : secondsLeft === totalSeconds
            ? "Start"
            : "Resume"}
    </button>
  );
}
