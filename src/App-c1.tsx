import React, { useState } from "react";
import PomodoroTimer from "./claude/PomodoroTimer";
import SessionTimeline from "./claude/SessionTimeline";
import type { SessionRecord } from "./claude/shared";

type Tab = "timer" | "timeline";

// const sessionRecord = [
//   {
//     id: "1",
//     mode: "focus",
//     start: 10000000, // epoch ms
//     end: 20000000, // epoch ms
//     completed: true, // true = selesai penuh, false = dihentikan lebih awal
//   },
// ];

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("timeline");
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  const handleSessionLogged = (record: SessionRecord): void => {
    setSessions((prev) => [...prev, record]);
  };

  const handleClearHistory = (): void => setSessions([]);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
        .pomo-card { animation: fadeIn 0.4s ease-out; }
        .pomo-btn:hover { filter: brightness(1.08); }
        .pomo-btn:active { transform: scale(0.97); }
        .pomo-tab:hover { color: #2b2a26; }
        .pomo-icon-btn:hover { background: rgba(0,0,0,0.05); }
        .pomo-clear:hover { text-decoration: underline; }
        .pomo-page-tab:hover { color: #2b2a26; }
      `}</style>

      <div style={styles.column}>
        <div style={styles.pageTabRow}>
          <button
            className="pomo-page-tab"
            onClick={() => setActiveTab("timer")}
            style={{
              ...styles.pageTab,
              color: activeTab === "timer" ? "#2b2a26" : "#9a988f",
              borderBottom:
                activeTab === "timer"
                  ? "2px solid #2b2a26"
                  : "2px solid transparent",
            }}
          >
            Timer
          </button>
          <button
            className="pomo-page-tab"
            onClick={() => setActiveTab("timeline")}
            style={{
              ...styles.pageTab,
              color: activeTab === "timeline" ? "#2b2a26" : "#9a988f",
              borderBottom:
                activeTab === "timeline"
                  ? "2px solid #2b2a26"
                  : "2px solid transparent",
            }}
          >
            Riwayat
            {sessions.length > 0 && (
              <span style={styles.badge}>{sessions.length}</span>
            )}
          </button>
        </div>

        {activeTab === "timer" ? (
          <PomodoroTimer onSessionLogged={handleSessionLogged} />
        ) : (
          <SessionTimeline sessions={sessions} onClear={handleClearHistory} />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    background: "#f6f4ee",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "16px",
    width: "360px",
    maxWidth: "100%",
  },
  pageTabRow: {
    display: "flex",
    gap: "22px",
    justifyContent: "center",
  },
  pageTab: {
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
    padding: "6px 2px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "color 0.2s ease, border-color 0.2s ease",
  },
  badge: {
    background: "#e9e7e0",
    color: "#5a5850",
    fontSize: "11px",
    fontWeight: 600,
    borderRadius: "999px",
    padding: "1px 7px",
  },
};
