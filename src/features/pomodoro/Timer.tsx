import { useRef, useEffect, useState } from "react";
import { CYCLES_BEFORE_LONG_BREAK, MODES } from "@/data/shared";
import {
  clampDuration,
  playChime,
  requestNotificationPermission,
} from "@/utils/helper";
import type { ModeKey } from "@/types/shared";
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

export default function Timer() {
  const [mode, setMode] = useState<ModeKey>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [durations, setDurations] = useState([
    MODES[0].minutes,
    MODES[1].minutes,
    MODES[2].minutes,
  ]);
  const [secondsLeft, setSecondsLeft] = useState(durations[mode] * 60);
  const [inputValues, setInputValues] = useState<string[]>([
    String(MODES[0].minutes),
    String(MODES[1].minutes),
    String(MODES[2].minutes),
  ]);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = durations[mode] * 60;
  const isFinished = secondsLeft <= 0;
  const activeColor = MODES[mode].color;

  const nextMode: ModeKey =
    mode === 0
      ? completedFocusSessions % CYCLES_BEFORE_LONG_BREAK === 0
        ? 2
        : 1
      : 0;
  const actionButtonColor = isFinished ? MODES[nextMode].color : activeColor;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 20, 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    function finishFocusSession() {
      playChime();
      document.title = "Time's Up! — Pomodoro";
      setIsRunning(false);
      setCompletedFocusSessions((prev) => prev + 1);
    }

    function finishBreakSession() {
      playChime();
      document.title = "Time's Up! — Pomodoro";
      setIsRunning(false);
    }

    if (isFinished && isRunning) {
      if (mode === 0) {
        finishFocusSession();
      } else {
        finishBreakSession();
      }
    }
  }, [isFinished, isRunning, mode]);

  useEffect(() => {
    if (isRunning) {
      document.title = "Pomodoro";
    }
  }, [isRunning]);

  const progress = 1 - secondsLeft / totalSeconds;

  function handleSelectMode(key: ModeKey) {
    setMode(key);
    setIsRunning(false);

    const newTotalSeconds = durations[key] * 60;
    setSecondsLeft(newTotalSeconds);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(durations[mode] * 60);
  }
  function handlePauseStart() {
    if (isFinished) {
      setMode(nextMode);
      setSecondsLeft(durations[nextMode] * 60);
      setIsRunning(true);
    } else {
      setIsRunning((r) => !r);
      requestNotificationPermission();
    }
  }
  function handleToggleSettings() {
    setShowSettings((s) => !s);
  }

  function handleDurationChange(key: ModeKey, value: string) {
    const clamped = clampDuration(value);
    setInputValues((prev) => {
      const nextArray = [...prev];
      nextArray[key] = String(clamped);
      return nextArray;
    });
  }

  function handleDurationBlur(key: ModeKey, value: string) {
    const clamped = clampDuration(value);
    setInputValues((prev) => {
      const nextArray = [...prev];
      nextArray[key] = String(clamped);
      return nextArray;
    });
    setDurations((prev) => {
      const nextArray = [...prev];
      nextArray[key] = clamped;
      return nextArray;
    });
    if (mode === key) setSecondsLeft(clamped * 60);
  }

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
