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
    mode,
    isRunning,
    completedFocusSessions,
    inputValues,
    showSettings,

    actionButtonColor,
    progress,
    handleSelectMode,
    handleReset,
    handlePauseStart,
    handleToggleSettings,
    handleDurationChange,
    handleDurationBlur,
    activeColor,
    secondsLeft,
    totalSeconds,
    isFinished,
  } = usePomodoro();

  return (
    <Background>
      <Card>
        <SessionNav mode={mode} onClick={handleSelectMode} />

        <ProgressRing
          activeColor={activeColor}
          isRunning={isRunning}
          secondsLeft={secondsLeft}
          progress={progress}
          completedFocusSessions={completedFocusSessions}
        />

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

        <Summary completedFocusSessions={completedFocusSessions} />

        {showSettings && (
          <SettingsPanel
            inputValues={inputValues}
            onChange={handleDurationChange}
            onBlur={handleDurationBlur}
          />
        )}
      </Card>
    </Background>
  );
}
