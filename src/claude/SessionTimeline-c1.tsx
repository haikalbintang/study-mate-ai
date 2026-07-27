// import React from "react";
// import { MODES, formatClock, formatDurationMinutes } from "./shared";
// import type { SessionRecord } from "./shared";

// interface SessionTimelineProps {
//   sessions: SessionRecord[];
//   onClear: () => void;
// }

// export default function SessionTimeline({
//   sessions,
//   onClear,
// }: SessionTimelineProps): React.JSX.Element {
//   const sortedSessions = [...sessions].sort((a, b) => b.end - a.end);

//   return (
//     <div className="pomo-card" style={styles.card}>
//       <div style={styles.header}>
//         <span style={styles.title}>Riwayat sesi</span>
//         {sortedSessions.length > 0 && (
//           <button
//             className="pomo-clear"
//             onClick={onClear}
//             style={styles.clearBtn}
//           >
//             Bersihkan
//           </button>
//         )}
//       </div>

//       {sortedSessions.length === 0 ? (
//         <div style={styles.empty}>
//           Belum ada sesi. Riwayat focus/break akan muncul di sini setelah kamu
//           menyelesaikan sesi pertama di tab Timer.
//         </div>
//       ) : (
//         <div style={styles.list}>
//           {sortedSessions.map((s) => (
//             <div key={s.id} style={styles.row}>
//               <div style={{ ...styles.dot, background: MODES[s.mode].color }} />
//               <div style={styles.bar}>
//                 <div style={styles.rowTop}>
//                   <span style={{ color: MODES[s.mode].color, fontWeight: 600 }}>
//                     {MODES[s.mode].label}
//                   </span>
//                   <span style={styles.time}>
//                     {formatClock(s.start)} – {formatClock(s.end)}
//                   </span>
//                 </div>
//                 <div style={styles.rowBottom}>
//                   {formatDurationMinutes(s.end - s.start)}
//                   {!s.completed && (
//                     <span style={styles.stopped}> · dihentikan lebih awal</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// const styles: Record<string, React.CSSProperties> = {
//   card: {
//     background: "#ffffff",
//     borderRadius: "20px",
//     padding: "28px 32px",
//     width: "100%",
//     boxShadow: "0 20px 60px rgba(30,25,15,0.08)",
//     border: "1px solid #ececE4",
//     textAlign: "left",
//     boxSizing: "border-box",
//   },
//   header: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: "16px",
//   },
//   title: {
//     fontSize: "15px",
//     fontWeight: 600,
//     color: "#2b2a26",
//   },
//   clearBtn: {
//     background: "none",
//     border: "none",
//     color: "#9a988f",
//     fontSize: "12px",
//     cursor: "pointer",
//     padding: 0,
//   },
//   empty: {
//     fontSize: "13px",
//     color: "#9a988f",
//     lineHeight: 1.5,
//   },
//   list: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "14px",
//     maxHeight: "420px",
//     overflowY: "auto",
//   },
//   row: {
//     display: "flex",
//     gap: "10px",
//     alignItems: "flex-start",
//   },
//   dot: {
//     width: "10px",
//     height: "10px",
//     borderRadius: "50%",
//     marginTop: "5px",
//     flexShrink: 0,
//   },
//   bar: {
//     flex: 1,
//     borderBottom: "1px solid #f0efe9",
//     paddingBottom: "10px",
//   },
//   rowTop: {
//     display: "flex",
//     justifyContent: "space-between",
//     fontSize: "13px",
//     marginBottom: "3px",
//     gap: "8px",
//   },
//   time: {
//     color: "#9a988f",
//     fontVariantNumeric: "tabular-nums",
//     whiteSpace: "nowrap",
//   },
//   rowBottom: {
//     fontSize: "12px",
//     color: "#9a988f",
//   },
//   stopped: {
//     color: "#c25b3a",
//   },
// };
