// import { useRef, useEffect, useState } from "react";
// import { CYCLES_BEFORE_LONG_BREAK, MODES } from "@/data/shared";
// import {
//   formatTime,
//   playChime,
//   requestNotificationPermission,
// } from "@/utils/helper";
// import type { ModeKey } from "@/types/shared";

// const RADIUS = 120;
// const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// function clampDuration(value: string): number {
//   return Math.max(1, Math.min(120, Number(value) || 1));
// }

// function ProgressRing({
//   progress,
//   isRunning,
//   activeColor,
//   secondsLeft,
//   currentDot,
// }: {
//   progress: number;
//   isRunning: boolean;
//   activeColor: string;
//   secondsLeft: number;
//   currentDot: number;
// }) {
//   const dashOffset = CIRCUMFERENCE * (1 - progress);

//   return (
//     <div className="relative flex items-center justify-center mx-auto mb-6 w-64 h-64">
//       <svg width="280" height="280" viewBox="0 0 280 280">
//         <circle
//           cx="140"
//           cy="140"
//           r={RADIUS}
//           fill="none"
//           stroke="#e9e7e0"
//           strokeWidth="10"
//         />
//         <circle
//           cx="140"
//           cy="140"
//           r={RADIUS}
//           fill="none"
//           stroke={activeColor}
//           strokeWidth="10"
//           strokeLinecap="round"
//           strokeDasharray={CIRCUMFERENCE}
//           strokeDashoffset={dashOffset}
//           transform="rotate(-90 140 140)"
//           style={{
//             transition: isRunning ? "stroke-dashoffset 1s linear" : "",
//           }}
//         />
//       </svg>
//       <div className="absolute flex flex-col items-center justify-center">
//         <div className="text-5xl font-semibold tracking-[1px] text-[#2b2a26] tabular-nums">
//           {formatTime(secondsLeft)}
//         </div>
//         <div className="mt-2 text-xl tracking-[3px] text-[#c9a25b]">
//           {"●".repeat(currentDot)}
//           {"○".repeat(CYCLES_BEFORE_LONG_BREAK - currentDot)}
//         </div>
//       </div>
//     </div>
//   );
// }

// function SettingsPanel({
//   inputValues,
//   onChange,
//   onBlur,
// }: {
//   inputValues: string[];
//   onChange: (key: ModeKey, value: string) => void;
//   onBlur: (key: ModeKey, value: string) => void;
// }) {
//   return (
//     <div className="mt-5 pt-5 border-t border-[#ececE4] flex flex-col gap-2.5 text-left">
//       {MODES.map((m) => (
//         <label key={m.key} className="flex items-center justify-between text-sm">
//           <span className="font-medium" style={{ color: m.color }}>
//             {m.label}
//           </span>
//           <input
//             type="number"
//             min={1}
//             max={120}
//             value={inputValues[m.key]}
//             onChange={(e) => onChange(m.key, e.target.value)}
//             onBlur={(e) => onBlur(m.key, e.target.value)}
//             className="w-14 py-1 px-1.5 rounded-md border border-[#d8d6cd] text-sm text-center"
//           />
//         </label>
//       ))}
//     </div>
//   );
// }

// export default function Timer() {
//   const [mode, setMode] = useState<ModeKey>(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const [showSettings, setShowSettings] = useState(true);
//   const [durations, setDurations] = useState([
//     MODES[0].minutes,
//     MODES[1].minutes,
//     MODES[2].minutes,
//   ]);
//   const [secondsLeft, setSecondsLeft] = useState(durations[mode] * 60);
//   const [inputValues, setInputValues] = useState<string[]>([
//     String(MODES[0].minutes),
//     String(MODES[1].minutes),
//     String(MODES[2].minutes),
//   ]);
//   const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     if (!isRunning) return;

//     intervalRef.current = setInterval(() => {
//       setSecondsLeft((prev) => Math.max(prev - 1, 0));
//     }, 1000);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [isRunning]);

//   useEffect(() => {
//     if (secondsLeft > 0 || !isRunning) return;

//     playChime();
//     document.title = "Time's Up! — Pomodoro";
//     setIsRunning(false);
//   }, [secondsLeft, isRunning]);

//   useEffect(() => {
//     setSecondsLeft(durations[mode] * 60);
//   }, [mode, durations]);

//   useEffect(() => {
//     if (isRunning) {
//       document.title = "Pomodoro";
//     }
//   }, [isRunning]);

//   const totalSeconds = durations[mode] * 60;
//   const progress = 1 - secondsLeft / totalSeconds;
//   const activeColor = MODES[mode].color;
//   const currentDot = completedFocusSessions % CYCLES_BEFORE_LONG_BREAK;

//   function handleSelectMode(key: ModeKey) {
//     setMode(key);
//     setIsRunning(false);
//     setSecondsLeft(durations[key] * 60);
//   }

//   function handleReset() {
//     setIsRunning(false);
//     setSecondsLeft(durations[mode] * 60);
//   }

//   function handlePauseStart() {
//     setIsRunning((r) => !r);
//     requestNotificationPermission();

//     if (secondsLeft <= 0) {
//       setMode((currentMode) => {
//         if (currentMode === 0) {
//           const nextCount = completedFocusSessions + 1;
//           setCompletedFocusSessions(nextCount);
//           return nextCount % CYCLES_BEFORE_LONG_BREAK === 0 ? 2 : 1;
//         }
//         return 0;
//       });
//     }
//   }

//   function handleToggleSettings() {
//     setShowSettings((s) => !s);
//   }

//   function handleDurationChange(key: ModeKey, value: string) {
//     const clamped = clampDuration(value);
//     setInputValues((prev) => {
//       const next = [...prev];
//       next[key] = String(clamped);
//       return next;
//     });
//   }

//   function handleDurationBlur(key: ModeKey, value: string) {
//     const clamped = clampDuration(value);
//     setInputValues((prev) => {
//       const next = [...prev];
//       next[key] = String(clamped);
//       return next;
//     });
//     setDurations((prev) => {
//       const next = [...prev];
//       next[key] = clamped;
//       return next;
//     });
//     if (mode === key) setSecondsLeft(clamped * 60);
//   }

//   return (
//     <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
//       <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4] text-center">
//         <nav className="flex justify-center gap-5 mb-5">
//           {MODES.map((m) => (
//             <button
//               key={m.key}
//               className="bg-transparent text-sm font-medium py-1.5 px-0.5 cursor-pointer"
//               style={{
//                 color: mode === m.key ? m.color : "#8a8a86",
//                 borderBottom:
//                   mode === m.key
//                     ? `3px solid ${m.color}`
//                     : "3px solid transparent",
//               }}
//               onClick={() => handleSelectMode(m.key)}
//             >
//               {m.label}
//             </button>
//           ))}
//         </nav>

//         <ProgressRing
//           progress={progress}
//           isRunning={isRunning}
//           activeColor={activeColor}
//           secondsLeft={secondsLeft}
//           currentDot={currentDot}
//         />

//         <div className="flex items-center justify-center gap-4 mb-4">
//           <button
//             className="border border-[#e4e2da] bg-white w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-[#5a5850] transition-colors duration-150 ease-out"
//             onClick={handleReset}
//             aria-label="Reset timer"
//             title="Reset"
//           >
//             ↺
//           </button>
//           <button
//             className="border-none text-white text-base font-semibold py-3 px-9 rounded-full cursor-pointer transition-[filter,transform] duration-[150ms,100ms] ease-out"
//             style={{ backgroundColor: activeColor }}
//             onClick={handlePauseStart}
//           >
//             {isRunning
//               ? "Pause"
//               : secondsLeft <= 0
//                 ? "Next"
//                 : secondsLeft === totalSeconds
//                   ? "Start"
//                   : "Resume"}
//           </button>
//           <button
//             onClick={handleToggleSettings}
//             className="border border-[#e4e2da] bg-white w-10.5 h-10.5 rounded-full text-lg cursor-pointer text-[#5a5850] transition-colors duration-150 ease-out"
//             aria-label="Toggle settings"
//             title="Settings"
//           >
//             ⚙
//           </button>
//         </div>

//         <div className="text-sm text-[#9a988f]">
//           Focus sessions completed today:{" "}
//           <strong>{completedFocusSessions}</strong>
//         </div>

//         {showSettings && (
//           <SettingsPanel
//             inputValues={inputValues}
//             onChange={handleDurationChange}
//             onBlur={handleDurationBlur}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
