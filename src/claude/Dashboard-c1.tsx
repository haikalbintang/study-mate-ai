// import { useMemo } from "react";
// import Title from "@/components/common/Title";
// import { MODES } from "../../data/shared";
// import usePomodoro from "@/hooks/usePomodoro";
// import type { Session } from "@/types/shared";

// // TODO: move this into Settings once a "daily goal" input exists there.
// const DAILY_GOAL_SESSIONS = 8;

// // ---- Small date helpers (local time, DST-safe) ---------------------------
// function dayKey(ms: number): string {
//   const d = new Date(ms);
//   return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
// }

// function isSameDay(a: number, b: number): boolean {
//   return dayKey(a) === dayKey(b);
// }

// function addDays(base: Date, days: number): Date {
//   const d = new Date(base);
//   d.setDate(d.getDate() + days);
//   return d;
// }

// function formatHour12(hour: number): string {
//   const period = hour < 12 ? "AM" : "PM";
//   const h12 = hour % 12 === 0 ? 12 : hour % 12;
//   return `${h12} ${period}`;
// }

// function formatClock(ms: number): string {
//   const d = new Date(ms);
//   const h = d.getHours();
//   const m = String(d.getMinutes()).padStart(2, "0");
//   const period = h < 12 ? "AM" : "PM";
//   const h12 = h % 12 === 0 ? 12 : h % 12;
//   return `${h12}:${m} ${period}`;
// }

// function minutesOf(list: Session[]): number {
//   return Math.round(list.reduce((sum, s) => sum + (s.end - s.start), 0) / 60000);
// }

// export default function Dashboard() {
//   const { sessions } = usePomodoro();

//   const stats = useMemo(() => {
//     const now = Date.now();
//     const today = new Date(now);

//     const todaySessions = sessions.filter((s) => isSameDay(s.start, now));
//     const yesterdaySessions = sessions.filter((s) =>
//       isSameDay(s.start, addDays(today, -1).getTime()),
//     );

//     const todayFocus = todaySessions.filter((s) => s.modeKey === 0);
//     const yesterdayFocus = yesterdaySessions.filter((s) => s.modeKey === 0);

//     const completedToday = todayFocus.filter((s) => s.completed).length;
//     const focusMinutesToday = minutesOf(todayFocus);
//     const focusMinutesYesterday = minutesOf(yesterdayFocus);

//     const completionRate =
//       todayFocus.length === 0
//         ? null
//         : Math.round((completedToday / todayFocus.length) * 100);

//     // Minutes per mode, today — for the "time distribution" bars.
//     const distribution = MODES.map((m) => ({
//       ...m,
//       minutes: minutesOf(todaySessions.filter((s) => s.modeKey === m.key)),
//     }));
//     const maxDistributionMinutes = Math.max(...distribution.map((d) => d.minutes), 1);

//     // Streak: consecutive days (including today) with >= 1 completed focus session.
//     const completedFocusDayKeys = new Set(
//       sessions.filter((s) => s.modeKey === 0 && s.completed).map((s) => dayKey(s.start)),
//     );
//     let streak = 0;
//     let cursor = today;
//     while (completedFocusDayKeys.has(dayKey(cursor.getTime()))) {
//       streak += 1;
//       cursor = addDays(cursor, -1);
//     }

//     // Best hour: across all completed focus sessions ever logged, which
//     // hour-of-day has accumulated the most focus minutes.
//     const minutesByHour = new Array(24).fill(0) as number[];
//     sessions
//       .filter((s) => s.modeKey === 0 && s.completed)
//       .forEach((s) => {
//         const hour = new Date(s.start).getHours();
//         minutesByHour[hour] += (s.end - s.start) / 60000;
//       });
//     const totalHistoricalMinutes = minutesByHour.reduce((a, b) => a + b, 0);
//     const bestHour =
//       totalHistoricalMinutes === 0
//         ? null
//         : minutesByHour.indexOf(Math.max(...minutesByHour));

//     const vsYesterdayPct =
//       focusMinutesYesterday === 0
//         ? null
//         : Math.round(
//             ((focusMinutesToday - focusMinutesYesterday) / focusMinutesYesterday) * 100,
//           );

//     const sessionsToGoal = Math.max(0, DAILY_GOAL_SESSIONS - completedToday);

//     return {
//       todaySessions: [...todaySessions].sort((a, b) => a.start - b.start),
//       completedToday,
//       focusMinutesToday,
//       completionRate,
//       distribution,
//       maxDistributionMinutes,
//       streak,
//       bestHour,
//       vsYesterdayPct,
//       sessionsToGoal,
//     };
//   }, [sessions]);

//   const goalPct = Math.min(100, Math.round((stats.completedToday / DAILY_GOAL_SESSIONS) * 100));

//   const insights: string[] = [];
//   if (stats.bestHour !== null) {
//     insights.push(`Best hour: ${formatHour12(stats.bestHour)}`);
//   }
//   if (stats.vsYesterdayPct !== null) {
//     const sign = stats.vsYesterdayPct >= 0 ? "+" : "";
//     insights.push(`${sign}${stats.vsYesterdayPct}% vs yesterday`);
//   }
//   if (stats.sessionsToGoal > 0) {
//     insights.push(
//       `${stats.sessionsToGoal} more session${stats.sessionsToGoal > 1 ? "s" : ""} to reach goal`,
//     );
//   } else {
//     insights.push("Daily goal reached 🎉");
//   }

//   return (
//     <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
//       <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
//         <div>
//           <Title>Today's Dashboard</Title>

//           {/* Streak */}
//           <div className="flex items-center gap-2 mt-3 mb-4 bg-[#fdf3ea] border border-[#f3e3d0] rounded-xl px-3 py-2.5">
//             <span className="text-lg leading-none">🔥</span>
//             <span className="text-sm font-semibold text-[#2b2a26]">
//               {stats.streak}-Day Streak
//             </span>
//           </div>

//           {/* Goal progress */}
//           <div className="mb-4">
//             <div className="flex items-center justify-between mb-1.5">
//               <span className="text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px]">
//                 Goal Progress
//               </span>
//               <span className="text-xs text-[#5a5850]">
//                 {stats.completedToday} / {DAILY_GOAL_SESSIONS} sessions
//               </span>
//             </div>
//             <div className="h-2.5 rounded-full bg-[#f0efe9] overflow-hidden">
//               <div
//                 className="h-full rounded-full bg-[#c25b3a] transition-all duration-400 ease-out"
//                 style={{ width: `${goalPct}%` }}
//               />
//             </div>
//           </div>

//           {/* Stat cards */}
//           <div className="grid grid-cols-3 gap-2.5 mb-2">
//             <div className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center">
//               <div className="text-xl font-bold text-[#c25b3a]">{stats.completedToday}</div>
//               <div className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]">
//                 Completed
//               </div>
//             </div>
//             <div className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center">
//               <div className="text-xl font-bold text-[#2b2a26]">{stats.focusMinutesToday}m</div>
//               <div className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]">
//                 Focus Time
//               </div>
//             </div>
//             <div className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center">
//               <div className="text-xl font-bold text-[#2b2a26]">
//                 {stats.completionRate === null ? "—" : `${stats.completionRate}%`}
//               </div>
//               <div className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]">
//                 Completion Rate
//               </div>
//             </div>
//           </div>

//           {/* Time distribution */}
//           <div className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] my-6 mb-3">
//             Time Distribution
//           </div>
//           <div className="flex flex-col gap-2.5">
//             {stats.distribution.map((mode) => {
//               const pct = Math.round((mode.minutes / stats.maxDistributionMinutes) * 100);
//               return (
//                 <div key={mode.key} className="flex items-center gap-2.5 text-xs">
//                   <div className="w-20.5 text-[#5a5850] shrink-0">{mode.label}</div>
//                   <div className="flex-1 h-2 rounded-sm bg-[#f0efe9] overflow-hidden">
//                     <div
//                       className="h-full rounded-sm transition-all duration-400 ease-out"
//                       style={{ width: `${pct}%`, backgroundColor: mode.color }}
//                     />
//                   </div>
//                   <div className="w-8.5 text-right text-[#9a988f] shrink-0">
//                     {mode.minutes}m
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Today's sessions */}
//           <div className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] my-6 mb-3">
//             Today's Sessions
//           </div>
//           {stats.todaySessions.length === 0 ? (
//             <div className="text-xs text-[#9a988f] leading-relaxed">
//               No sessions yet today — start a focus session to see it here.
//             </div>
//           ) : (
//             <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
//               {stats.todaySessions.map((s) => (
//                 <div key={s.id} className="flex items-center gap-2 text-xs">
//                   <span
//                     className="w-2 h-2 rounded-full shrink-0"
//                     style={{ backgroundColor: MODES[s.modeKey].color }}
//                   />
//                   <span className="text-[#5a5850] w-20.5 shrink-0">
//                     {MODES[s.modeKey].label}
//                   </span>
//                   <span className="text-[#9a988f] flex-1 text-right">
//                     {formatClock(s.start)}
//                     {!s.completed && <span className="text-[#c25b3a]"> · stopped</span>}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Insights */}
//           <div className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] my-6 mb-3">
//             Insights
//           </div>
//           <ul className="flex flex-col gap-1.5 text-xs text-[#5a5850] list-disc pl-4">
//             {insights.map((line) => (
//               <li key={line}>{line}</li>
//             ))}
//           </ul>

//           <div className="mt-5 pt-4 border-t border-[#ececE4] text-xs text-[#9a988f]">
//             Total focus time today: <strong>{stats.focusMinutesToday} minutes</strong>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
