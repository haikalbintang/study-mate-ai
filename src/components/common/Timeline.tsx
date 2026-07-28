import { useState } from "react";

type ModeKey = 0 | 1 | 2;

interface ModeConfig {
  key: ModeKey;
  label: string;
  minutes: number;
  color: string;
}

const MODES: ModeConfig[] = [
  { key: 0, label: "Focus", minutes: 25, color: "#c25b3a" },
  { key: 1, label: "Short Break", minutes: 5, color: "#3a7d63" },
  { key: 2, label: "Long Break", minutes: 15, color: "#3a5f7d" },
];

const HOUR_HEIGHT = 52;

function minutesSinceMidnight(ms: number): number {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

function atTodayTime(hour: number, minute: number): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

function buildSampleSession() {
  return [
    {
      id: "sample-1",
      modeKey: 0,
      mode: "focus",
      start: atTodayTime(9, 0),
      end: atTodayTime(9, 25),
      completed: true,
    },
    {
      id: "sample-2",
      modeKey: 1,
      mode: "short",
      start: atTodayTime(9, 25),
      end: atTodayTime(9, 30),
      completed: true,
    },
    {
      id: "sample-3",
      modeKey: 0,
      mode: "focus",
      start: atTodayTime(9, 30),
      end: atTodayTime(9, 55),
      completed: true,
    },
    {
      id: "sample-4",
      modeKey: 1,
      mode: "short",
      start: atTodayTime(9, 55),
      end: atTodayTime(10, 0),
      completed: true,
    },
    {
      id: "sample-5",
      modeKey: 0,
      mode: "focus",
      start: atTodayTime(13, 15),
      end: atTodayTime(13, 40),
      completed: true,
    },
    {
      id: "sample-6",
      modeKey: 2,
      mode: "long",
      start: atTodayTime(13, 40),
      end: atTodayTime(13, 55),
      completed: true,
    },
    {
      id: "sample-7",
      modeKey: 0,
      mode: "focus",
      start: atTodayTime(16, 5),
      end: atTodayTime(16, 22),
      completed: false,
    },
  ];
}

export default function Timeline() {
  const [zoomScale, setZoomScale] = useState(1);

  const currentHourHeight = HOUR_HEIGHT * zoomScale;

  function zoomIn() {
    setZoomScale((prev) => Math.min(prev + 0.25, 3));
  }

  function zoomOut() {
    setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  }

  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="max-h-screen bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
        <div>
          <div
            className="flex items-start justify-between mb-3
"
          >
            <div>
              <div
                className="text-[15px] font-semibold text-[#2b2a26]
"
              >
                Timeline hari ini
              </div>
              <div
                className="text-xs text-[#9a988f] mt-0.5 capitalize
"
              >
                selasa, 28 juli
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="bg-[#f0ede4] hover:bg-[#e4e1d7] border-none text-[#5a5850] text-xs font-bold cursor-pointer w-6 h-6 rounded flex items-center justify-center transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={zoomIn}
                className="bg-[#f0ede4] hover:bg-[#e4e1d7] border-none text-[#5a5850] text-xs font-bold cursor-pointer w-6 h-6 rounded flex items-center justify-center transition-colors"
                title="Zoom In"
              >
                +
              </button>
              <button className="bg-none border-none text-[#9a988f] text-xs cursor-pointer p-0 ml-2">
                Bersihkan
              </button>
            </div>
          </div>

          <div
            className="flex gap-3.5 mb-3 flex-wrap
"
          >
            {MODES.map((mode) => (
              <div
                key={mode.key}
                className="flex items-center gap-1.25 text-[11px] text-[#5a5850]
"
              >
                <span
                  className="w-2 h-2 rounded-full inline-block
"
                  style={{ backgroundColor: mode.color }}
                />
                {mode.label}
              </div>
            ))}
          </div>

          <div
            className="inline-block text-[11px] text-[#9a7b2f] bg-[#faf1dc] rounded-md px-2 py-1 mb-3
"
          >
            Contoh tampilan — belum ada sesi hari ini
          </div>

          <div
            className="h-96 overflow-y-auto border border-[#ececE4] rounded-xl bg-[#fbfaf7] pt-6
"
          >
            <div
              className="relative"
              style={{ height: `${24 * currentHourHeight}px` }}
            >
              {Array.from({ length: 25 }, (_, hour) => (
                <div
                  key={hour}
                  className="absolute left-1 right-2 h-7 flex items-start 
"
                  style={{
                    top: `${hour === 25 ? hour * currentHourHeight - 26 : hour * currentHourHeight}px`,
                  }}
                >
                  <span
                    className="w-6 shrink-0 text-[11px] text-[#a4a296] text-right pr-2 -translate-y-2
"
                  >
                    {hour <= 24 ? hour : ""}
                  </span>
                  <div
                    className="flex-1 border-t border-[#deded3] mt-0
"
                  />
                </div>
              ))}

              {buildSampleSession().map((session) => {
                const startMin = minutesSinceMidnight(session.start);
                const endMinRaw = minutesSinceMidnight(session.end);
                const endMin = endMinRaw <= startMin ? 1440 : endMinRaw;
                const top = (startMin / 60) * currentHourHeight;
                const height = Math.max(
                  6,
                  ((endMin - startMin) / 60) * currentHourHeight,
                );
                return (
                  <div
                    key={session.id}
                    className="absolute left-10.5 right-2.5 rounded-sm overflow-hidden box-border px-1.5 py-0.75
"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      background: `${MODES[session.modeKey].color}cc`,
                      borderLeft: `5px solid ${MODES[session.modeKey].color}`,
                    }}
                  >
                    <span className="text-[11px] text-[#fbfaf7]">
                      {session.mode === "focus" ? "" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
