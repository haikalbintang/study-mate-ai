export default function Summary({
  completedFocusSessions,
}: {
  completedFocusSessions: number;
}) {
  return (
    <div className="text-sm text-[#9a988f]">
      Focus sessions completed today: <strong>{completedFocusSessions}</strong>
    </div>
  );
}
