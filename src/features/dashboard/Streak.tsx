export default function Streak({ dayStreak }: { dayStreak: number }) {
  return (
    <div className="flex items-center gap-2 mt-3 bg-[#fdf3ea] border border-[#f3e3d0] rounded-xl px-3 py-2.5">
      <span className="text-lg leading-none">🔥</span>
      <span className="text-sm font-semibold text-[#2b2a26]">
        {dayStreak}-Day Streak
      </span>
    </div>
  );
}
