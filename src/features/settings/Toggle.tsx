export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-10 h-6 rounded-full relative shrink-0 transition-colors duration-200 border-none cursor-pointer"
      style={{ backgroundColor: checked ? "#c25b3a" : "#e4e1d7" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{
          transform: checked ? "translateX(-18px)" : "translateX(-2px)",
        }}
      />
    </button>
  );
}
