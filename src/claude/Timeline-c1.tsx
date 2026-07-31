// import { useState } from "react";
// import { MODES, HOUR_HEIGHT } from "@/data/shared";
// import { minutesSinceMidnight } from "../../utils/helper";
// import { usePomodoro, type Session } from "@/context/PomodoroContext";

// export default function Timeline() {
//   const [zoomScale, setZoomScale] = useState(1);
//   const { sessions, activeSession, now, clearSessions } = usePomodoro();

//   const currentHourHeight = HOUR_HEIGHT * zoomScale;

//   function zoomIn() {
//     setZoomScale((prev) => Math.min(prev + 0.25, 3));
//   }

//   function zoomOut() {
//     setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
//   }

//   // The active session isn't in `sessions` yet — it becomes a real entry
//   // only once it's finished. Here it's rendered live, growing every second
//   // as `now` ticks forward, so the block "draws itself" while the timer runs.
//   const liveSession: Session | null = activeSession
//     ? {
//         id: "live",
//         modeKey: activeSession.modeKey,
//         mode: activeSession.mode,
//         start: activeSession.start,
//         end: now,
//         completed: false,
//       }
//     : null;

//   const displaySessions: Session[] = liveSession
//     ? [...sessions, liveSession]
//     : sessions;

//   return (
//     <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
//       <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
//         <div>
//           <div
//             className="flex items-start justify-between mb-3
// "
//           >
//             <div>
//               <div
//                 className="text-[15px] font-semibold text-[#2b2a26]
// "
//               >
//                 Timeline hari ini
//               </div>
//               <div
//                 className="text-xs text-[#9a988f] mt-0.5 capitalize
// "
//               >
//                 selasa, 28 juli
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={zoomOut}
//                 className="bg-[#f0ede4] hover:bg-[#e4e1d7] border-none text-[#5a5850] text-xs font-bold cursor-pointer w-6 h-6 rounded flex items-center justify-center transition-colors"
//                 title="Zoom Out"
//               >
//                 -
//               </button>
//               <button
//                 onClick={zoomIn}
//                 className="bg-[#f0ede4] hover:bg-[#e4e1d7] border-none text-[#5a5850] text-xs font-bold cursor-pointer w-6 h-6 rounded flex items-center justify-center transition-colors"
//                 title="Zoom In"
//               >
//                 +
//               </button>
//               <button
//                 onClick={clearSessions}
//                 className="bg-none border-none text-[#9a988f] text-xs cursor-pointer p-0 ml-2"
//               >
//                 Bersihkan
//               </button>
//             </div>
//           </div>

//           <div
//             className="flex gap-3.5 mb-3 flex-wrap
// "
//           >
//             {MODES.map((mode) => (
//               <div
//                 key={mode.key}
//                 className="flex items-center gap-1.25 text-[11px] text-[#5a5850]
// "
//               >
//                 <span
//                   className="w-2 h-2 rounded-full inline-block
// "
//                   style={{ backgroundColor: mode.color }}
//                 />
//                 {mode.label}
//               </div>
//             ))}
//           </div>

//           {displaySessions.length === 0 && (
//             <div
//               className="inline-block text-[11px] text-[#9a7b2f] bg-[#faf1dc] rounded-md px-2 py-1 mb-3
// "
//             >
//               Belum ada sesi hari ini
//             </div>
//           )}

//           <div
//             className="h-[calc(100vh-301px)] overflow-y-auto border border-[#ececE4] rounded-xl bg-[#fbfaf7] pt-6
// "
//           >
//             <div
//               className="relative"
//               style={{ height: `${24 * currentHourHeight}px` }}
//             >
//               {Array.from({ length: 25 }, (_, hour) => (
//                 <div
//                   key={hour}
//                   className="absolute left-1 right-2 h-7 flex items-start
// "
//                   style={{
//                     top: `${hour === 25 ? hour * currentHourHeight - 26 : hour * currentHourHeight}px`,
//                   }}
//                 >
//                   <span
//                     className="w-6 shrink-0 text-[11px] text-[#a4a296] text-right pr-2 -translate-y-2
// "
//                   >
//                     {hour <= 24 ? hour : ""}
//                   </span>
//                   <div
//                     className="flex-1 border-t border-[#deded3] mt-0
// "
//                   />
//                 </div>
//               ))}

//               {displaySessions.map((session) => {
//                 const startMin = minutesSinceMidnight(session.start);
//                 const endMinRaw = minutesSinceMidnight(session.end);
//                 const endMin = endMinRaw <= startMin ? 1440 : endMinRaw;
//                 const top = (startMin / 60) * currentHourHeight;
//                 const height = Math.max(
//                   6,
//                   ((endMin - startMin) / 60) * currentHourHeight,
//                 );
//                 return (
//                   <div
//                     key={session.id}
//                     className="absolute left-9 right-3 rounded-sm overflow-hidden box-border px-1.5 py-0.75
// "
//                     style={{
//                       top: `${top}px`,
//                       height: `${height}px`,
//                       background: `${MODES[session.modeKey].color}cc`,
//                       borderLeft: `5px solid ${MODES[session.modeKey].color}`,
//                       // Live block gets a subtle pulse so it reads as
//                       // "still recording" rather than a finished session.
//                       transition: session.completed
//                         ? undefined
//                         : "height 1s linear",
//                     }}
//                   />
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
