import SubtitleSmall from "@/components/common/SubtitleSmall";
import usePomodoro from "@/hooks/usePomodoro";

export default function Summary() {
  const { completedFocusSessions } = usePomodoro();
  return (
    <span className="text-center">
      <SubtitleSmall>
        Focus sessions completed today:{" "}
        <strong>{completedFocusSessions}</strong>
      </SubtitleSmall>
    </span>
  );
}
