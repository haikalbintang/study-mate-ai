import { useEffect, useRef, useState } from "react";
import { MODES, HOUR_HEIGHT, MAX_ZOOM, MIN_ZOOM } from "@/data/shared";
import { minutesSinceMidnight } from "../../utils/helper";
import usePomodoro from "@/hooks/usePomodoro";
import type { Session } from "@/types/shared";
import Title from "@/components/common/Title";
import Subtitle from "@/components/common/Subtitle";
import Legends from "./Legends";
import YellowLabel from "@/components/common/Label";
import { usePinch } from "@use-gesture/react";

export default function Timeline() {
  const [zoomScale, setZoomScale] = useState(1);
  const { sessions, activeSession, now, clearSessions } = usePomodoro();

  const currentHourHeight = HOUR_HEIGHT * zoomScale;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const currentHour = now.getHours() + now.getMinutes() / 60;
    const targetScrollTop = Math.max(
      0,
      (currentHour - 1.5) * currentHourHeight,
    );

    scrollRef.current.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  }, []);

  usePinch(
    ({ offset: [scale] }) => {
      setZoomScale(scale);
    },
    {
      scaleBounds: { min: MIN_ZOOM, max: MAX_ZOOM },
      rubberband: true,
      target: scrollRef,
      eventOptions: { passive: false },
      preventDefault: true,
    },
  );

  function zoomIn() {
    setZoomScale((prev) => Math.min(prev + 0.25, 3));
  }

  function zoomOut() {
    setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  }

  const liveSession: Session | null = activeSession
    ? {
        id: "live",
        modeKey: activeSession.modeKey,
        mode: activeSession.mode,
        start: activeSession.start.getTime(),
        end: now.getTime(),
        completed: false,
      }
    : null;

  const displaySessions: Session[] = liveSession
    ? [...sessions, liveSession]
    : sessions;

  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
        <div>
          <div
            className="flex items-start justify-between mb-3
"
          >
            <div>
              <Title>Today's Timeline</Title>
              <Subtitle>tuesday, July 8</Subtitle>
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
              <button
                onClick={clearSessions}
                className="bg-none border-none text-[#9a988f] text-xs cursor-pointer p-0 ml-2"
              >
                Clear
              </button>
            </div>
          </div>

          <Legends />

          {displaySessions.length === 0 && (
            <YellowLabel>Contoh tampilan — belum ada sesi hari ini</YellowLabel>
          )}

          <div
            ref={scrollRef}
            className="h-[calc(100vh-301px)] overflow-y-auto border border-[#ececE4] rounded-xl bg-[#fbfaf7] pt-6 touch-pan-y
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

              {displaySessions.map((session) => {
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
                    className="absolute left-9 right-3 rounded-sm overflow-hidden box-border px-1.5 py-0.75
"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      background: `${MODES[session.modeKey].color}cc`,
                      borderLeft: `5px solid ${MODES[session.modeKey].color}`,
                      transition: session.completed
                        ? undefined
                        : "height 1s linear",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
