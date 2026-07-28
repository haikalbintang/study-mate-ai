import "./App.css";
import Dashboard from "./components/common/Dashboard";
import PomodoroApp from "./components/common/PomodoroApp-v3";
import { useState } from "react";
import Timeline from "./components/common/Timeline";
import Settings from "./components/common/Settings";

type ViewKey = "timer" | "timeline" | "dashboard" | "settings";

const NAV_ITEMS: { key: ViewKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "timer", label: "Timer", icon: "⏱" },
  { key: "timeline", label: "Timeline", icon: "📜" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

function App() {
  const [activeView, setActiveView] = useState<ViewKey>("timer");
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-17">
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "timer" && <PomodoroApp />}
        {activeView === "timeline" && <Timeline />}
        {activeView === "settings" && <Settings />}
      </div>
      <div className="h-16.75 fixed bottom-0 left-0 z-50 bg-white w-full shadow-xl border-t border-[#d7d7c0]">
        <nav className="flex border-b border-[#ececE4] p-2 gap-1">
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                className="flex-1 flex flex-col items-center gap-1 border-none bg-transparent py-2 px-1 rounded-lg cursor-pointer text-xs transition-[background,color] duration-150 ease-out"
                onClick={() => setActiveView(item.key)}
                style={{
                  color: active ? "#2b2a26" : "#9a988f",
                  background: active ? "#2b2a2614" : "transparent",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span className="text-sm leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default App;
