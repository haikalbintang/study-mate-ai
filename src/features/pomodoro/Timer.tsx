import { useRef, useEffect, useState } from "react";
import { CYCLES_BEFORE_LONG_BREAK, MODES, PACE } from "@/data/shared";
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
import usePomodoro from "@/hooks/usePomodoro";

export default function Timer() {
  const {
    startSession,
    pauseSession,
    resumeSession,
    finishSession,
    cancelSession,
  } = usePomodoro();
  const [mode, setMode] = useState<ModeKey>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [durations, setDurations] = useState([
    MODES[0].minutes,
    MODES[1].minutes,
    MODES[2].minutes,
  ]);
  const [secondsLeftByMode, setSecondsLeftByMode] = useState([
    durations[0] * 60,
    durations[1] * 60,
    durations[2] * 60,
  ]);
  // const [secondsLeft, setSecondsLeft] = useState(durations[mode] * 60);
  const [inputValues, setInputValues] = useState<string[]>([
    String(MODES[0].minutes),
    String(MODES[1].minutes),
    String(MODES[2].minutes),
  ]);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = durations[mode] * 60;
  const secondsLeft = secondsLeftByMode[mode];
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

    const currentMode = mode;
    intervalRef.current = setInterval(() => {
      setSecondsLeftByMode((prev) => {
        const next = [...prev];
        next[currentMode] = Math.max(next[currentMode] - PACE, 0);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  useEffect(() => {
    function finishFocusSession() {
      playChime();
      document.title = "Time's Up! — Pomodoro";
      setIsRunning(false);
      setCompletedFocusSessions((prev) => prev + 1);
      finishSession();
    }

    function finishBreakSession() {
      playChime();
      document.title = "Time's Up! — Pomodoro";
      setIsRunning(false);
      finishSession();
    }

    if (isFinished && isRunning) {
      if (mode === 0) {
        finishFocusSession();
      } else {
        finishBreakSession();
      }
    }
  }, [isFinished, isRunning, mode, finishSession]);

  useEffect(() => {
    if (isRunning) {
      document.title = "Pomodoro";
    }
  }, [isRunning]);

  const progress = 1 - secondsLeft / totalSeconds;

  function handleSelectMode(key: ModeKey) {
    if (isRunning) pauseSession();
    setMode(key);
    setIsRunning(false);

    // const newTotalSeconds = durations[key] * 60;
    // setSecondsLeft(newTotalSeconds);
  }

  function handleReset() {
    setIsRunning(false);
    cancelSession();
    setSecondsLeftByMode((prev) => {
      const next = [...prev];
      next[mode] = durations[mode] * 60;
      return next;
    });
  }

  function handlePauseStart() {
    if (isFinished) {
      setMode(nextMode);
      setSecondsLeftByMode((prev) => {
        const next = [...prev];
        next[nextMode] = durations[nextMode] * 60;
        return next;
      });
      setIsRunning(true);
      startSession(nextMode);
      return;
    }

    if (isRunning) {
      setIsRunning(false);
      pauseSession();
      return;
    }

    setIsRunning(true);
    requestNotificationPermission();

    if (secondsLeft === totalSeconds) {
      startSession(mode);
    } else {
      resumeSession();
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

    setSecondsLeftByMode((prev) => {
      // If this is the tab you're currently on, reflect the new duration
      // immediately. If it's a different tab, only overwrite its countdown
      // when that tab hasn't been started yet (still sitting at its old full
      // duration) — otherwise you'd erase progress on a paused session.
      const previousFullDuration = durations[key] * 60;
      const isUntouched = prev[key] === previousFullDuration;
      if (key !== mode && !isUntouched) return prev;

      const next = [...prev];
      next[key] = clamped * 60;
      return next;
    });
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
