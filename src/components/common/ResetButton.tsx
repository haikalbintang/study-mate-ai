export default function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="border border-border bg-card w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-foreground transition-colors duration-150 ease-out"
      onClick={onClick}
      aria-label="Reset timer"
      title="Reset"
    >
      ↺
    </button>
  );
}
