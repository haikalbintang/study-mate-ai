export default function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-border bg-card w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-foreground transition-colors duration-150 ease-out"
    >
      ⚙
    </button>
  );
}
