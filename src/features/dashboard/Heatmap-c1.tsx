import { useMemo, useState } from "react";
import type { Session } from "@/types/shared";
import usePomodoro from "@/hooks/usePomodoro";

interface DayCell {
  key: string;
  date: Date;
  minutes: number;
  sessionCount: number;
  isFuture: boolean;
}

const WEEKS_TO_SHOW = 9;
const CELL_SIZE = 12;
const CELL_GAP = 3.5;
const COL_WIDTH = CELL_SIZE + CELL_GAP;

// Only label every other weekday row, same convention GitHub uses, to keep
// the row of labels from feeling cluttered next to such small cells.
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Buckets are in minutes of focus time for that day — roughly 0 / <1
// session / ~1 session / ~2 sessions / 4+ sessions, using the app's focus
// color (terracotta) at increasing intensity instead of GitHub's green.
function levelColor(minutes: number): string {
  if (minutes <= 0) return "#ececE4";
  if (minutes < 25) return "#f3c9b8";
  if (minutes < 50) return "#e6a688";
  if (minutes < 100) return "#d1805a";
  return "#c25b3a";
}

function formatDetailDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    // weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function buildWeeks(focusSessions: Session[]): DayCell[][] {
  // Aggregate total focus minutes + session count per calendar day.
  const daily = new Map<string, { minutes: number; count: number }>();
  focusSessions.forEach((s) => {
    const key = dayKey(new Date(s.start));
    const entry = daily.get(key) ?? { minutes: 0, count: 0 };
    entry.minutes += (s.end - s.start) / 60000;
    entry.count += 1;
    daily.set(key, entry);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Grid always spans full weeks (Sun–Sat) so columns line up. The last
  // column is the current week; days after today in it render as blank.
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  const totalDays = WEEKS_TO_SHOW * 7;
  const start = new Date(endOfWeek);
  start.setDate(endOfWeek.getDate() - totalDays + 1);

  const weeks: DayCell[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < WEEKS_TO_SHOW; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const key = dayKey(cursor);
      const entry = daily.get(key);
      week.push({
        key,
        date: new Date(cursor),
        minutes: Math.round(entry?.minutes ?? 0),
        sessionCount: entry?.count ?? 0,
        isFuture: cursor.getTime() > today.getTime(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function Heatmap() {
  const { sessions } = usePomodoro();
  const focusSessions = useMemo(
    () => sessions.filter((s) => s.modeKey === 0),
    [sessions],
  );
  const weeks = useMemo(() => buildWeeks(focusSessions), [focusSessions]);

  const [hoveredDay, setHoveredDay] = useState<DayCell | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayCell | null>(null);
  const displayedDay = hoveredDay ?? selectedDay;

  function handleDayClick(day: DayCell) {
    if (day.isFuture) return;
    setSelectedDay((prev) => (prev?.key === day.key ? null : day));
  }

  // Which week columns start a new month, for the label row up top.
  const monthMarkers = useMemo(() => {
    const markers: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const firstDay = week[0].date;
      if (firstDay.getMonth() !== lastMonth) {
        markers.push({
          weekIndex: i,
          label: MONTH_LABELS[firstDay.getMonth()],
        });
        lastMonth = firstDay.getMonth();
      }
    });
    return markers;
  }, [weeks]);

  const activeDays = weeks.flat().filter((d) => d.minutes > 0).length;
  const swatchColor = displayedDay ? levelColor(displayedDay.minutes) : null;
  const isEmptyDay = displayedDay ? displayedDay.minutes <= 0 : false;

  return (
    <div>
      <div className="flex items-stretch gap-3">
        <div className="min-w-0 flex-1">
          <div
            className="relative text-[10.5px] text-[#9a988f]"
            style={{ height: "16px", marginLeft: "22.5px" }}
          >
            {monthMarkers.map((m) => (
              <span
                key={m.weekIndex}
                className="absolute"
                style={{ left: `${m.weekIndex * COL_WIDTH}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            <div
              className="flex flex-col gap-[3.5px] shrink-0"
              style={{ width: "20px" }}
            >
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-[10.5px] text-[#9a988f] flex items-center"
                  style={{ height: `${CELL_SIZE}px` }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="flex gap-[3.5px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3.5px]">
                  {week.map((day) => (
                    <div
                      key={day.key}
                      onMouseEnter={() => !day.isFuture && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => handleDayClick(day)}
                      className={`rounded-[2px] transition-transform duration-100 ${
                        day.isFuture ? "" : "cursor-pointer hover:scale-110"
                      }`}
                      style={{
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        backgroundColor: day.isFuture
                          ? "transparent"
                          : levelColor(day.minutes),
                        outline:
                          selectedDay?.key === day.key
                            ? "1.5px solid #2b2a26"
                            : "none",
                        outlineOffset: "1px",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel — sits beside the grid instead of above it, so
            hovering/tapping never shifts the grid's position. Fixed width
            and vertically centered against the grid's own height. */}
        <div className="flex w-[86px] text-[#9a988f] shrink-0 flex-col justify-center rounded-xl bg-[#f8f7f2] px-2 py-2 mt-3.5">
          {displayedDay ? (
            <>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block shrink-0 rounded-[2px]"
                  style={{
                    width: "11px",
                    height: "11px",
                    backgroundColor: swatchColor ?? undefined,
                  }}
                />
                <span className="text-[11px] leading-tight text-[#9a988f]">
                  {formatDetailDate(displayedDay.date)}
                </span>
              </div>
              <div
                className="mt-1.5 text-xl font-bold leading-none"
                style={{
                  color: isEmptyDay ? "#9a988f" : (swatchColor ?? "#2b2a26"),
                }}
              >
                {displayedDay.minutes}
                <span className="ml-0.5 text-lg font-medium text-[#2b2a26]">
                  min
                </span>
              </div>
              <div className="mt-1 text-[10.5px] text-[#9a988f]">
                {displayedDay.sessionCount > 0
                  ? `${displayedDay.sessionCount} session${displayedDay.sessionCount === 1 ? "" : "s"}`
                  : "No focus logged"}
              </div>
            </>
          ) : (
            <span className="text-[11px] leading-snug text-[#9a988f]">
              Hover or tap a day for details
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-[10.5px] text-[#9a988f]">
        <span className="mr-10">
          {activeDays} active days in the last {WEEKS_TO_SHOW} weeks
        </span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {[0, 20, 40, 75, 120].map((m) => (
            <span
              key={m}
              className="rounded-xs"
              style={{
                width: "11px",
                height: "11px",
                backgroundColor: levelColor(m),
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
