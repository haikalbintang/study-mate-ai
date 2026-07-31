import SettingsPanel from "./SettingsPanel";
import ProgressRing from "./ProgressRing";
import Summary from "./Summary";
import ResetButton from "@/components/common/ResetButton";
import ActionButton from "@/components/common/ActionButton";
import SettingsButton from "@/components/common/SettingsButton";
import ButtonsShell from "@/components/common/ButtonsShell";
import SessionNav from "./SessionNav";
import Card from "@/components/common/Card";
import Background from "@/components/common/Background";
import usePomodoro from "@/hooks/usePomodoro";

export default function Timer() {
  const {
    isRunning,
    showSettings,

    actionButtonColor,
    handleReset,
    handlePauseStart,
    handleToggleSettings,
    secondsLeft,
    totalSeconds,
    isFinished,
  } = usePomodoro();

  return (
    <Background>
      <Card>
        <SessionNav />

        <ProgressRing />

        <ButtonsShell>
          <ResetButton onClick={handleReset} />
          <ActionButton
            activeColor={actionButtonColor}
            onClick={handlePauseStart}
            isRunning={isRunning}
            secondsLeft={secondsLeft}
            totalSeconds={totalSeconds}
            isFinished={isFinished}
          />
          <SettingsButton onClick={handleToggleSettings} />
        </ButtonsShell>

        <Summary />

        {showSettings && <SettingsPanel />}
      </Card>
    </Background>
  );
}
