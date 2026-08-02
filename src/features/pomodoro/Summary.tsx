import SubtitleSmall from "@/components/common/SubtitleSmall";
import usePomodoro from "@/hooks/usePomodoro";

export default function Summary() {
  const { stats } = usePomodoro();
  return (
    <span className="text-center">
      <SubtitleSmall>
        Focus sessions completed today: <strong>{stats.completedToday}</strong>
      </SubtitleSmall>
    </span>
  );
}
