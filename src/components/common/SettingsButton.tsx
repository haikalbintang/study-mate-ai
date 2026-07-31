export default function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-[#e4e2da] bg-white w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-[#5a5850] transition-colors duration-150 ease-out"
    >
      ⚙
    </button>
  );
}
