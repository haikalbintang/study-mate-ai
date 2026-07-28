// import React, { useState, useEffect, useRef, useCallback, useMemo, CSSProperties } from "react";

// // ---- Types --------------------------------------------------------------
// type ModeKey = "focus" | "short" | "long";
// type ViewKey = "timer" | "timeline" | "dashboard" | "settings";

// interface ModeConfig {
//   label: string;
//   minutes: number;
//   color: string;
// }

// type Durations = Record<ModeKey, number>;

// interface SessionRecord {
//   id: string;
//   mode: ModeKey;
//   start: number; // epoch ms
//   end: number; // epoch ms
//   completed: boolean; // true = selesai penuh, false = dihentikan lebih awal
// }

// // ---- Config -------------------------------------------------------------
// const MODES: Record<ModeKey, ModeConfig> = {
//   focus: { label: "Focus", minutes: 25, color: "#5b6fd6" },
//   short: { label: "Short break", minutes: 5, color: "#3a9d7d" },
//   long: { label: "Long break", minutes: 15, color: "#c99a3a" },
// };

// const CYCLES_BEFORE_LONG_BREAK = 4;
// const HOUR_HEIGHT = 52; // px per hour row in the day timeline

// const NAV_ITEMS: { key: ViewKey; label: string; icon: string }[] = [
//   { key: "timer", label: "Timer", icon: "⏱" },
//   { key: "timeline", label: "Timeline", icon: "📜" },
//   { key: "dashboard", label: "Dashboard", icon: "📊" },
//   { key: "settings", label: "Settings", icon: "⚙" },
// ];

// function formatTime(totalSeconds: number): string {
//   const m = Math.floor(totalSeconds / 60);
//   const s = totalSeconds % 60;
//   return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
// }

// function formatClock(ms: number): string {
//   const d = new Date(ms);
//   return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
// }

// function formatDurationMinutes(ms: number): string {
//   const mins = Math.max(1, Math.round(ms / 60000));
//   return `${mins} menit`;
// }

// function isSameDay(a: number, b: number): boolean {
//   const d1 = new Date(a);
//   const d2 = new Date(b);
//   return (
//     d1.getFullYear() === d2.getFullYear() &&
//     d1.getMonth() === d2.getMonth() &&
//     d1.getDate() === d2.getDate()
//   );
// }

// function minutesSinceMidnight(ms: number): number {
//   const d = new Date(ms);
//   return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
// }

// function atTodayTime(hour: number, minute: number): number {
//   const d = new Date();
//   d.setHours(hour, minute, 0, 0);
//   return d.getTime();
// }

// // Sample data — used only when there is no real session logged yet today,
// // purely so the day-timeline has something to demonstrate its layout with.
// function buildSampleSessions(): SessionRecord[] {
//   return [
//     { id: "sample-1", mode: "focus", start: atTodayTime(9, 0), end: atTodayTime(9, 25), completed: true },
//     { id: "sample-2", mode: "short", start: atTodayTime(9, 25), end: atTodayTime(9, 30), completed: true },
//     { id: "sample-3", mode: "focus", start: atTodayTime(9, 30), end: atTodayTime(9, 55), completed: true },
//     { id: "sample-4", mode: "short", start: atTodayTime(9, 55), end: atTodayTime(10, 0), completed: true },
//     { id: "sample-5", mode: "focus", start: atTodayTime(13, 15), end: atTodayTime(13, 40), completed: true },
//     { id: "sample-6", mode: "long", start: atTodayTime(13, 40), end: atTodayTime(13, 55), completed: true },
//     { id: "sample-7", mode: "focus", start: atTodayTime(16, 5), end: atTodayTime(16, 22), completed: false },
//   ];
// }

// // Simple two-tone chime using the Web Audio API — no external assets needed.
// function playChime(): void {
//   try {
//     const AudioContextClass =
//       window.AudioContext || (window as any).webkitAudioContext;
//     const ctx = new AudioContextClass();
//     const notes = [523.25, 659.25]; // C5, E5
//     notes.forEach((freq, i) => {
//       const osc = ctx.createOscillator();
//       const gain = ctx.createGain();
//       osc.type = "sine";
//       osc.frequency.value = freq;
//       gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
//       gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.2 + 0.02);
//       gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.35);
//       osc.connect(gain);
//       gain.connect(ctx.destination);
//       osc.start(ctx.currentTime + i * 0.2);
//       osc.stop(ctx.currentTime + i * 0.2 + 0.4);
//     });
//   } catch (e) {
//     // Audio not available — fail silently.
//   }
// }

// export default function PomodoroApp(): JSX.Element {
//   const [activeView, setActiveView] = useState<ViewKey>("timer");
//   const [durations, setDurations] = useState<Durations>({
//     focus: MODES.focus.minutes,
//     short: MODES.short.minutes,
//     long: MODES.long.minutes,
//   });
//   const [mode, setMode] = useState<ModeKey>("focus");
//   const [secondsLeft, setSecondsLeft] = useState<number>(durations.focus * 60);
//   const [isRunning, setIsRunning] = useState<boolean>(false);
//   const [completedFocusSessions, setCompletedFocusSessions] = useState<number>(0);
//   const [sessions, setSessions] = useState<SessionRecord[]>([]);
//   const [nowTick, setNowTick] = useState<number>(Date.now());

//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const modeRef = useRef<ModeKey>(mode);
//   const sessionStartRef = useRef<number | null>(null);
//   const timelineScrollRef = useRef<HTMLDivElement | null>(null);

//   // Keep a ref mirror of `mode` so the interval callback (which isn't
//   // recreated every time the mode changes) always logs the right mode.
//   useEffect(() => {
//     modeRef.current = mode;
//   }, [mode]);

//   // Reset the visible countdown whenever the mode itself changes — covers
//   // both manual tab switches and automatic focus/break transitions.
//   useEffect(() => {
//     setSecondsLeft(durations[mode] * 60);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [mode]);

//   // If the user edits a duration while stopped, reflect it immediately.
//   useEffect(() => {
//     if (!isRunning) {
//       setSecondsLeft(durations[mode] * 60);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [durations]);

//   // Tick once a minute to keep the "now" marker on the day timeline moving.
//   useEffect(() => {
//     const id = setInterval(() => setNowTick(Date.now()), 60000);
//     return () => clearInterval(id);
//   }, []);

//   // Auto-scroll the day timeline to roughly the current time when opened.
//   useEffect(() => {
//     if (activeView === "timeline" && timelineScrollRef.current) {
//       const target = Math.max(0, (minutesSinceMidnight(Date.now()) / 60 - 2) * HOUR_HEIGHT);
//       timelineScrollRef.current.scrollTop = target;
//     }
//   }, [activeView]);

//   const logSession = useCallback(
//     (finishedMode: ModeKey, completed: boolean) => {
//       const end = Date.now();
//       const start = sessionStartRef.current ?? end - durations[finishedMode] * 60000;
//       setSessions((prev) => [
//         ...prev,
//         { id: `${end}-${Math.random().toString(36).slice(2, 7)}`, mode: finishedMode, start, end, completed },
//       ]);
//       sessionStartRef.current = null;
//     },
//     [durations]
//   );

//   const goToNextMode = useCallback(() => {
//     setMode((currentMode) => {
//       if (currentMode === "focus") {
//         const nextCount = completedFocusSessions + 1;
//         setCompletedFocusSessions(nextCount);
//         return nextCount % CYCLES_BEFORE_LONG_BREAK === 0 ? "long" : "short";
//       }
//       return "focus";
//     });
//   }, [completedFocusSessions]);

//   useEffect(() => {
//     if (!isRunning) return;

//     if (sessionStartRef.current === null) {
//       sessionStartRef.current = Date.now();
//     }

//     intervalRef.current = setInterval(() => {
//       setSecondsLeft((prev) => {
//         if (prev <= 1) {
//           playChime();
//           const original = "Pomodoro";
//           document.title = "Time's up! — Pomodoro";
//           setTimeout(() => {
//             document.title = original;
//           }, 3000);
//           logSession(modeRef.current, true);
//           goToNextMode();
//           return 0; // the mode-change effect above will set the real value
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [isRunning, goToNextMode, logSession]);

//   const totalSeconds = durations[mode] * 60;
//   const progress = 1 - secondsLeft / totalSeconds;
//   const activeColor = MODES[mode].color;

//   const handleStartPause = (): void => setIsRunning((r) => !r);

//   const handleReset = (): void => {
//     if (isRunning && secondsLeft < totalSeconds) {
//       logSession(mode, false);
//     } else {
//       sessionStartRef.current = null;
//     }
//     setIsRunning(false);
//     setSecondsLeft(durations[mode] * 60);
//   };

//   const handleSelectMode = (key: ModeKey): void => {
//     if (isRunning && secondsLeft < totalSeconds) {
//       logSession(mode, false);
//     } else {
//       sessionStartRef.current = null;
//     }
//     setIsRunning(false);
//     setMode(key);
//   };

//   const handleDurationChange = (key: ModeKey, value: string): void => {
//     const clamped = Math.max(1, Math.min(120, Number(value) || 1));
//     setDurations((prev) => ({ ...prev, [key]: clamped }));
//   };

//   const handleClearHistory = (): void => setSessions([]);

//   // Circle geometry for the progress ring
//   const radius = 120;
//   const circumference = 2 * Math.PI * radius;
//   const dashOffset = circumference * (1 - progress);

//   const currentDot =
//     completedFocusSessions % CYCLES_BEFORE_LONG_BREAK ||
//     (completedFocusSessions > 0 ? CYCLES_BEFORE_LONG_BREAK : 0);

//   // ---- Day timeline data --------------------------------------------------
//   const todayRealSessions = useMemo(
//     () => sessions.filter((s) => isSameDay(s.start, nowTick)),
//     [sessions, nowTick]
//   );
//   const usingSampleData = todayRealSessions.length === 0;
//   const dayTimelineSessions = usingSampleData ? buildSampleSessions() : todayRealSessions;
//   const nowMinutes = minutesSinceMidnight(nowTick);

//   // ---- Dashboard aggregates ----------------------------------------------
//   const minutesByMode = (list: SessionRecord[], key: ModeKey) =>
//     Math.round(list.filter((s) => s.mode === key).reduce((sum, s) => sum + (s.end - s.start), 0) / 60000);

//   const todayFocusMin = minutesByMode(todayRealSessions, "focus");
//   const todayShortMin = minutesByMode(todayRealSessions, "short");
//   const todayLongMin = minutesByMode(todayRealSessions, "long");
//   const todayFocusCount = todayRealSessions.filter((s) => s.mode === "focus" && s.completed).length;
//   const todayInterrupted = todayRealSessions.filter((s) => !s.completed).length;
//   const allTimeFocusMin = minutesByMode(sessions, "focus");
//   const maxDashboardMin = Math.max(todayFocusMin, todayShortMin, todayLongMin, 1);

//   const sortedSessions = [...sessions].sort((a, b) => b.end - a.end);

//   return (
//     <div style={styles.page}>
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
//         .pomo-view { animation: fadeIn 0.3s ease-out; }
//         .pomo-btn:hover { filter: brightness(1.08); }
//         .pomo-btn:active { transform: scale(0.97); }
//         .pomo-tab:hover { color: #2b2a26; }
//         .pomo-icon-btn:hover { background: rgba(0,0,0,0.05); }
//         .pomo-clear:hover { text-decoration: underline; }
//         .pomo-nav-btn:hover { background: rgba(0,0,0,0.04); }
//       `}</style>

//       <div style={styles.shell}>
//         <nav style={styles.navbar}>
//           {NAV_ITEMS.map((item) => {
//             const active = activeView === item.key;
//             return (
//               <button
//                 key={item.key}
//                 className="pomo-nav-btn"
//                 onClick={() => setActiveView(item.key)}
//                 style={{
//                   ...styles.navBtn,
//                   color: active ? activeColor : "#9a988f",
//                   background: active ? `${activeColor}14` : "transparent",
//                   fontWeight: active ? 600 : 500,
//                 }}
//               >
//                 <span style={styles.navIcon}>{item.icon}</span>
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

//         <div className="pomo-view" style={styles.content}>
//           {activeView === "timer" && (
//             <div style={styles.centerCol}>
//               <div style={styles.tabRow}>
//                 {(Object.entries(MODES) as [ModeKey, ModeConfig][]).map(([key, m]) => (
//                   <button
//                     key={key}
//                     className="pomo-tab"
//                     onClick={() => handleSelectMode(key)}
//                     style={{
//                       ...styles.tab,
//                       color: mode === key ? m.color : "#8a8a86",
//                       borderBottom: mode === key ? `2px solid ${m.color}` : "2px solid transparent",
//                     }}
//                   >
//                     {m.label}
//                   </button>
//                 ))}
//               </div>

//               <div style={styles.ringWrap}>
//                 <svg width="280" height="280" viewBox="0 0 280 280">
//                   <circle cx="140" cy="140" r={radius} fill="none" stroke="#e9e7e0" strokeWidth="10" />
//                   <circle
//                     cx="140"
//                     cy="140"
//                     r={radius}
//                     fill="none"
//                     stroke={activeColor}
//                     strokeWidth="10"
//                     strokeLinecap="round"
//                     strokeDasharray={circumference}
//                     strokeDashoffset={dashOffset}
//                     transform="rotate(-90 140 140)"
//                     style={{ transition: "stroke-dashoffset 1s linear" }}
//                   />
//                 </svg>
//                 <div style={styles.timeOverlay}>
//                   <div style={styles.time}>{formatTime(secondsLeft)}</div>
//                   <div style={styles.sessionCount}>
//                     {"●".repeat(currentDot)}
//                     {"○".repeat(CYCLES_BEFORE_LONG_BREAK - currentDot)}
//                   </div>
//                 </div>
//               </div>

//               <div style={styles.controls}>
//                 <button
//                   className="pomo-icon-btn"
//                   onClick={handleReset}
//                   style={styles.iconBtn}
//                   aria-label="Reset timer"
//                   title="Reset"
//                 >
//                   ↺
//                 </button>
//                 <button
//                   className="pomo-btn"
//                   onClick={handleStartPause}
//                   style={{ ...styles.mainBtn, background: activeColor }}
//                 >
//                   {isRunning ? "Pause" : secondsLeft === totalSeconds ? "Start" : "Resume"}
//                 </button>
//                 <button
//                   className="pomo-icon-btn"
//                   onClick={() => setActiveView("settings")}
//                   style={styles.iconBtn}
//                   aria-label="Open settings"
//                   title="Settings"
//                 >
//                   ⚙
//                 </button>
//               </div>

//               <div style={styles.footer}>
//                 Focus sessions completed today: <strong>{completedFocusSessions}</strong>
//               </div>
//             </div>
//           )}

//           {activeView === "timeline" && (
//             <div>
//               <div style={styles.panelHeader}>
//                 <div>
//                   <div style={styles.panelTitle}>Timeline hari ini</div>
//                   <div style={styles.panelSubtext}>
//                     {new Date(nowTick).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
//                   </div>
//                 </div>
//                 {!usingSampleData && sortedSessions.length > 0 && (
//                   <button className="pomo-clear" onClick={handleClearHistory} style={styles.clearBtn}>
//                     Bersihkan
//                   </button>
//                 )}
//               </div>

//               <div style={styles.legendRow}>
//                 {(Object.entries(MODES) as [ModeKey, ModeConfig][]).map(([key, m]) => (
//                   <div key={key} style={styles.legendItem}>
//                     <span style={{ ...styles.legendDot, background: m.color }} />
//                     {m.label}
//                   </div>
//                 ))}
//               </div>

//               {usingSampleData && (
//                 <div style={styles.sampleBadge}>Contoh tampilan — belum ada sesi hari ini</div>
//               )}

//               <div ref={timelineScrollRef} style={styles.dayScroll}>
//                 <div style={{ position: "relative", height: `${24 * HOUR_HEIGHT}px` }}>
//                   {Array.from({ length: 25 }, (_, hour) => (
//                     <div key={hour} style={{ ...styles.hourRow, top: `${hour * HOUR_HEIGHT}px` }}>
//                       <span style={styles.hourLabel}>{hour < 24 ? hour : ""}</span>
//                       <div style={styles.hourLine} />
//                     </div>
//                   ))}

//                   {dayTimelineSessions.map((s) => {
//                     const startMin = minutesSinceMidnight(s.start);
//                     const endMinRaw = minutesSinceMidnight(s.end);
//                     const endMin = endMinRaw <= startMin ? 1440 : endMinRaw; // clip midnight-crossing sessions to day end
//                     const top = (startMin / 60) * HOUR_HEIGHT;
//                     const height = Math.max(6, ((endMin - startMin) / 60) * HOUR_HEIGHT);
//                     const tall = height >= 30;
//                     return (
//                       <div
//                         key={s.id}
//                         style={{
//                           ...styles.dayBlock,
//                           top: `${top}px`,
//                           height: `${height}px`,
//                           background: `${MODES[s.mode].color}cc`,
//                           borderLeft: `3px solid ${MODES[s.mode].color}`,
//                         }}
//                         title={`${MODES[s.mode].label} · ${formatClock(s.start)}-${formatClock(s.end)}`}
//                       >
//                         {tall && (
//                           <span style={styles.dayBlockLabel}>
//                             {formatClock(s.start)}-{formatClock(s.end)} · {MODES[s.mode].label}
//                             {!s.completed ? " (berhenti)" : ""}
//                           </span>
//                         )}
//                       </div>
//                     );
//                   })}

//                   {!usingSampleData && nowMinutes >= 0 && nowMinutes <= 1440 && (
//                     <div style={{ ...styles.nowLine, top: `${(nowMinutes / 60) * HOUR_HEIGHT}px` }}>
//                       <span style={styles.nowDot} />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeView === "dashboard" && (
//             <div>
//               <div style={styles.panelHeader}>
//                 <span style={styles.panelTitle}>Dashboard hari ini</span>
//               </div>

//               <div style={styles.statGrid}>
//                 <div style={styles.statCard}>
//                   <div style={{ ...styles.statValue, color: MODES.focus.color }}>{todayFocusCount}</div>
//                   <div style={styles.statLabel}>Sesi focus selesai</div>
//                 </div>
//                 <div style={styles.statCard}>
//                   <div style={{ ...styles.statValue, color: "#2b2a26" }}>{todayFocusMin}m</div>
//                   <div style={styles.statLabel}>Total waktu focus</div>
//                 </div>
//                 <div style={styles.statCard}>
//                   <div style={{ ...styles.statValue, color: "#2b2a26" }}>{todayInterrupted}</div>
//                   <div style={styles.statLabel}>Sesi dihentikan</div>
//                 </div>
//               </div>

//               <div style={styles.panelSubTitle}>Distribusi waktu hari ini</div>
//               <div style={styles.barList}>
//                 {(Object.entries(MODES) as [ModeKey, ModeConfig][]).map(([key, m]) => {
//                   const mins = key === "focus" ? todayFocusMin : key === "short" ? todayShortMin : todayLongMin;
//                   const pct = Math.round((mins / maxDashboardMin) * 100);
//                   return (
//                     <div key={key} style={styles.barRow}>
//                       <div style={styles.barLabel}>{m.label}</div>
//                       <div style={styles.barTrack}>
//                         <div style={{ ...styles.barFill, width: `${pct}%`, background: m.color }} />
//                       </div>
//                       <div style={styles.barValue}>{mins}m</div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div style={styles.dashboardFooter}>
//                 Total waktu focus sepanjang waktu: <strong>{allTimeFocusMin} menit</strong>
//               </div>
//             </div>
//           )}

//           {activeView === "settings" && (
//             <div>
//               <div style={styles.panelHeader}>
//                 <span style={styles.panelTitle}>Pengaturan durasi</span>
//               </div>
//               <div style={styles.settingsPanel}>
//                 {(Object.entries(MODES) as [ModeKey, ModeConfig][]).map(([key, m]) => (
//                   <label key={key} style={styles.settingRow}>
//                     <span style={{ color: m.color, fontWeight: 500 }}>{m.label} (menit)</span>
//                     <input
//                       type="number"
//                       min={1}
//                       max={120}
//                       value={durations[key]}
//                       onChange={(e) => handleDurationChange(key, e.target.value)}
//                       style={styles.numberInput}
//                     />
//                   </label>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ---- Styles -------------------------------------------------------------
// const styles: Record<string, CSSProperties> = {
//   page: {
//     minHeight: "100vh",
//     width: "100%",
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "center",
//     background: "#f6f4ee",
//     fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//     padding: "24px",
//     boxSizing: "border-box",
//   },
//   shell: {
//     background: "#ffffff",
//     borderRadius: "20px",
//     width: "380px",
//     maxWidth: "100%",
//     boxShadow: "0 20px 60px rgba(30,25,15,0.08)",
//     border: "1px solid #ececE4",
//     overflow: "hidden",
//   },
//   navbar: {
//     display: "flex",
//     borderBottom: "1px solid #ececE4",
//     padding: "8px",
//     gap: "4px",
//   },
//   navBtn: {
//     flex: 1,
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "3px",
//     border: "none",
//     background: "transparent",
//     padding: "8px 4px",
//     borderRadius: "12px",
//     cursor: "pointer",
//     fontSize: "11px",
//     transition: "background 0.15s ease, color 0.15s ease",
//   },
//   navIcon: {
//     fontSize: "16px",
//     lineHeight: 1,
//   },
//   content: {
//     padding: "28px 32px 32px",
//   },
//   centerCol: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     textAlign: "center",
//   },
//   tabRow: {
//     display: "flex",
//     justifyContent: "center",
//     gap: "18px",
//     marginBottom: "20px",
//   },
//   tab: {
//     background: "none",
//     border: "none",
//     fontSize: "14px",
//     fontWeight: 500,
//     padding: "6px 2px",
//     cursor: "pointer",
//   },
//   ringWrap: {
//     position: "relative",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     margin: "0 auto 24px",
//     width: "280px",
//     height: "280px",
//   },
//   timeOverlay: {
//     position: "absolute",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   time: {
//     fontSize: "48px",
//     fontWeight: 600,
//     letterSpacing: "1px",
//     color: "#2b2a26",
//     fontVariantNumeric: "tabular-nums",
//   },
//   sessionCount: {
//     marginTop: "8px",
//     fontSize: "14px",
//     letterSpacing: "3px",
//     color: "#c9a25b",
//   },
//   controls: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "16px",
//     marginBottom: "16px",
//   },
//   mainBtn: {
//     border: "none",
//     color: "#fff",
//     fontSize: "16px",
//     fontWeight: 600,
//     padding: "12px 36px",
//     borderRadius: "999px",
//     cursor: "pointer",
//     transition: "filter 0.15s ease, transform 0.1s ease",
//   },
//   iconBtn: {
//     border: "1px solid #e4e2da",
//     background: "#fff",
//     width: "42px",
//     height: "42px",
//     borderRadius: "50%",
//     fontSize: "18px",
//     cursor: "pointer",
//     color: "#5a5850",
//     transition: "background 0.15s ease",
//   },
//   footer: {
//     fontSize: "13px",
//     color: "#9a988f",
//   },
//   panelHeader: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     marginBottom: "12px",
//   },
//   panelTitle: {
//     fontSize: "15px",
//     fontWeight: 600,
//     color: "#2b2a26",
//   },
//   panelSubtext: {
//     fontSize: "12px",
//     color: "#9a988f",
//     marginTop: "2px",
//     textTransform: "capitalize",
//   },
//   panelSubTitle: {
//     fontSize: "12px",
//     fontWeight: 600,
//     color: "#9a988f",
//     textTransform: "uppercase",
//     letterSpacing: "0.4px",
//     margin: "24px 0 12px",
//   },
//   clearBtn: {
//     background: "none",
//     border: "none",
//     color: "#9a988f",
//     fontSize: "12px",
//     cursor: "pointer",
//     padding: 0,
//   },
//   legendRow: {
//     display: "flex",
//     gap: "14px",
//     marginBottom: "12px",
//     flexWrap: "wrap",
//   },
//   legendItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: "5px",
//     fontSize: "11px",
//     color: "#5a5850",
//   },
//   legendDot: {
//     width: "8px",
//     height: "8px",
//     borderRadius: "50%",
//     display: "inline-block",
//   },
//   sampleBadge: {
//     display: "inline-block",
//     fontSize: "11px",
//     color: "#9a7b2f",
//     background: "#faf1dc",
//     borderRadius: "6px",
//     padding: "4px 8px",
//     marginBottom: "12px",
//   },
//   dayScroll: {
//     maxHeight: "420px",
//     overflowY: "auto",
//     border: "1px solid #ececE4",
//     borderRadius: "12px",
//     background: "#fbfaf7",
//   },
//   hourRow: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     height: `${HOUR_HEIGHT}px`,
//     display: "flex",
//     alignItems: "flex-start",
//   },
//   hourLabel: {
//     width: "34px",
//     flexShrink: 0,
//     fontSize: "11px",
//     color: "#b3b1a6",
//     textAlign: "right",
//     paddingRight: "8px",
//     transform: "translateY(-6px)",
//   },
//   hourLine: {
//     flex: 1,
//     borderTop: "1px solid #ececE4",
//     marginTop: "0px",
//   },
//   dayBlock: {
//     position: "absolute",
//     left: "42px",
//     right: "10px",
//     borderRadius: "6px",
//     overflow: "hidden",
//     boxSizing: "border-box",
//     padding: "3px 6px",
//   },
//   dayBlockLabel: {
//     fontSize: "11px",
//     color: "#fff",
//     fontWeight: 500,
//     lineHeight: 1.3,
//     display: "block",
//   },
//   nowLine: {
//     position: "absolute",
//     left: "42px",
//     right: "10px",
//     borderTop: "2px solid #e0453c",
//   },
//   nowDot: {
//     position: "absolute",
//     left: "-16px",
//     top: "-5px",
//     width: "9px",
//     height: "9px",
//     borderRadius: "50%",
//     background: "#e0453c",
//   },
//   settingsPanel: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "14px",
//   },
//   settingRow: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     fontSize: "13px",
//   },
//   numberInput: {
//     width: "56px",
//     padding: "4px 6px",
//     borderRadius: "6px",
//     border: "1px solid #d8d6cd",
//     fontSize: "13px",
//     textAlign: "center",
//   },
//   statGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, 1fr)",
//     gap: "10px",
//     marginBottom: "8px",
//   },
//   statCard: {
//     background: "#f8f7f2",
//     borderRadius: "12px",
//     padding: "14px 8px",
//     textAlign: "center",
//   },
//   statValue: {
//     fontSize: "22px",
//     fontWeight: 700,
//   },
//   statLabel: {
//     fontSize: "11px",
//     color: "#9a988f",
//     marginTop: "4px",
//     lineHeight: 1.3,
//   },
//   barList: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px",
//   },
//   barRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     fontSize: "12px",
//   },
//   barLabel: {
//     width: "82px",
//     color: "#5a5850",
//     flexShrink: 0,
//   },
//   barTrack: {
//     flex: 1,
//     height: "8px",
//     borderRadius: "4px",
//     background: "#f0efe9",
//     overflow: "hidden",
//   },
//   barFill: {
//     height: "100%",
//     borderRadius: "4px",
//     transition: "width 0.4s ease",
//   },
//   barValue: {
//     width: "34px",
//     textAlign: "right",
//     color: "#9a988f",
//     flexShrink: 0,
//   },
//   dashboardFooter: {
//     marginTop: "20px",
//     paddingTop: "16px",
//     borderTop: "1px solid #ececE4",
//     fontSize: "12px",
//     color: "#9a988f",
//   },
// };
