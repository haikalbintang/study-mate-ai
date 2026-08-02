import "./App.css";
import Dashboard from "./features/dashboard/Dashboard";
import Timer from "./features/pomodoro/Timer";
import { useState } from "react";
import Timeline from "./features/timeline/Timeline";
import Settings from "./features/settings/Settings";
import type { ViewKey } from "@/types/shared";
import NavBar from "./layouts/NavBar";

function App() {
  const [activeView, setActiveView] = useState<ViewKey>("settings");

  return (
    <div
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className="flex flex-col h-screen overflow-hidden"
    >
      <main className="flex-1 overflow-y-auto pb-17">
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "timer" && <Timer />}
        {activeView === "timeline" && <Timeline />}
        {activeView === "settings" && <Settings />}
      </main>
      <NavBar activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default App;
