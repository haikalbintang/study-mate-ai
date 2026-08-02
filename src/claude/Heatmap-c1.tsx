import { useMemo } from "react";
import type { Session } from "@/types/shared";
import usePomodoro from "@/hooks/usePomodoro";

interface DayCell {
  key: string;
  date: Date;
  minutes: number;
  sessionCount: number;
  isFuture: boolean;
}

const WEEKS_TO_SHOW = 16;
const CELL_SIZE = 11;
const CELL_GAP = 3;
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

function formatTooltipDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
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

  return (
    <div>
      <div
        className="relative text-[10px] text-[#9a988f]"
        style={{ height: "14px", marginLeft: "21px" }}
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
          className="flex flex-col gap-[3px] shrink-0"
          style={{ width: "18px" }}
        >
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[9px] text-[#9a988f] flex items-center"
              style={{ height: `${CELL_SIZE}px` }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-[3px] overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.key}
                  title={
                    day.isFuture
                      ? undefined
                      : `${formatTooltipDate(day.date)} — ${day.minutes}m focus, ${day.sessionCount} sesi`
                  }
                  className="rounded-[2px]"
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    backgroundColor: day.isFuture
                      ? "transparent"
                      : levelColor(day.minutes),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-[#9a988f]">
        <span>
          {activeDays} active days in the last {WEEKS_TO_SHOW} weeks
        </span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {[0, 20, 40, 75, 120].map((m) => (
            <span
              key={m}
              className="rounded-xs"
              style={{
                width: "9px",
                height: "9px",
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
