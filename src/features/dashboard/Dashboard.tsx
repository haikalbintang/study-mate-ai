import { useMemo, useState } from "react";
import Title from "@/components/common/Title";
import { DAILY_GOAL_SESSIONS, MODES } from "../../data/shared";
import usePomodoro from "@/hooks/usePomodoro";
import Heatmap from "@/claude/Heatmap-c1";
import Background from "@/components/common/Background";
import Card from "@/components/common/Card";
import {
  addDays,
  dayKey,
  formatHour12,
  isSameDay,
  minutesOf,
} from "@/utils/date-helper";
import Streak from "./Streak";
import SectionTitle from "./SectionTitle";

export default function Dashboard() {
  const { sessions } = usePomodoro();
  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    // const now = Date.now();
    const today = new Date(now);

    const todaySessions = sessions.filter((s) => isSameDay(s.start, now));
    const yesterdaySessions = sessions.filter((s) =>
      isSameDay(s.start, addDays(today, -1).getTime()),
    );

    const todayFocus = todaySessions.filter((s) => s.modeKey === 0);
    const yesterdayFocus = yesterdaySessions.filter((s) => s.modeKey === 0);

    const completedToday = todayFocus.filter((s) => s.completed).length;
    const focusMinutesToday = minutesOf(todayFocus);
    const focusMinutesYesterday = minutesOf(yesterdayFocus);

    const completionRate =
      todayFocus.length === 0
        ? null
        : Math.round((completedToday / todayFocus.length) * 100);

    // Minutes per mode, today — for the "time distribution" bars.
    const distribution = MODES.map((m) => ({
      ...m,
      minutes: minutesOf(todaySessions.filter((s) => s.modeKey === m.key)),
    }));
    const maxDistributionMinutes = Math.max(
      ...distribution.map((d) => d.minutes),
      1,
    );

    // Streak: consecutive days (including today) with >= 1 completed focus session.
    const completedFocusDayKeys = new Set(
      sessions
        .filter((s) => s.modeKey === 0 && s.completed)
        .map((s) => dayKey(s.start)),
    );
    let streak = 8;
    let cursor = today;
    while (completedFocusDayKeys.has(dayKey(cursor.getTime()))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    // Best hour: across all completed focus sessions ever logged, which
    // hour-of-day has accumulated the most focus minutes.
    const minutesByHour = new Array(24).fill(0) as number[];
    sessions
      .filter((s) => s.modeKey === 0 && s.completed)
      .forEach((s) => {
        const hour = new Date(s.start).getHours();
        minutesByHour[hour] += (s.end - s.start) / 60000;
      });
    const totalHistoricalMinutes = minutesByHour.reduce((a, b) => a + b, 0);
    const bestHour =
      totalHistoricalMinutes === 0
        ? null
        : minutesByHour.indexOf(Math.max(...minutesByHour));

    const vsYesterdayPct =
      focusMinutesYesterday === 0
        ? null
        : Math.round(
            ((focusMinutesToday - focusMinutesYesterday) /
              focusMinutesYesterday) *
              100,
          );

    const sessionsToGoal = Math.max(0, DAILY_GOAL_SESSIONS - completedToday);

    return {
      todaySessions: [...todaySessions].sort((a, b) => a.start - b.start),
      completedToday,
      focusMinutesToday,
      completionRate,
      distribution,
      maxDistributionMinutes,
      streak,
      bestHour,
      vsYesterdayPct,
      sessionsToGoal,
    };
  }, [sessions, now]);

  const goalPct = Math.min(
    100,
    Math.round((stats.completedToday / DAILY_GOAL_SESSIONS) * 100),
  );

  const insights: string[] = [];
  if (stats.bestHour !== null) {
    insights.push(`Best hour: ${formatHour12(stats.bestHour)}`);
  }
  if (stats.vsYesterdayPct !== null) {
    const sign = stats.vsYesterdayPct >= 0 ? "+" : "";
    insights.push(`${sign}${stats.vsYesterdayPct}% vs yesterday`);
  }
  if (stats.sessionsToGoal > 0) {
    insights.push(
      `${stats.sessionsToGoal} more session${stats.sessionsToGoal > 1 ? "s" : ""} to reach goal`,
    );
  } else {
    insights.push("Daily goal reached 🎉");
  }

  return (
    <Background>
      <Card>
        <div>
          <Title>Today's Dashboard</Title>

          <Streak dayStreak={stats.streak} />

          {/* Goal progress */}

          <div className="flex items-center justify-between">
            <SectionTitle>Goal Progress</SectionTitle>

            <span className="text-xs text-[#5a5850] mt-4 mb-2">
              {stats.completedToday} / {DAILY_GOAL_SESSIONS} sessions
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#f0efe9] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#c25b3a] transition-all duration-400 ease-out"
              style={{ width: `${goalPct}%` }}
            />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5 mt-6 mb-2">
            <div className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center">
              <div className="text-xl font-bold text-[#c25b3a]">
                {stats.completedToday}
              </div>
              <div className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]">
                Completed
              </div>
            </div>
            <div className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center">
              <div className="text-xl font-bold text-[#2b2a26]">
                {stats.focusMinutesToday}m
              </div>
              <div className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]">
                Focus Time
              </div>
            </div>
            <div className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center">
              <div className="text-xl font-bold text-[#2b2a26]">
                {stats.completionRate === null
                  ? "—"
                  : `${stats.completionRate}%`}
              </div>
              <div className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]">
                Completion Rate
              </div>
            </div>
          </div>

          <SectionTitle>Time Distribution</SectionTitle>

          <div className="flex flex-col gap-2.5">
            {stats.distribution.map((mode) => {
              const pct = Math.round(
                (mode.minutes / stats.maxDistributionMinutes) * 100,
              );
              return (
                <div
                  key={mode.key}
                  className="flex items-center gap-2.5 text-xs"
                >
                  <div className="w-20.5 text-[#5a5850] shrink-0">
                    {mode.label}
                  </div>
                  <div className="flex-1 h-2 rounded-sm bg-[#f0efe9] overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-400 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: mode.color }}
                    />
                  </div>
                  <div className="w-8.5 text-right text-[#9a988f] shrink-0">
                    {mode.minutes}m
                  </div>
                </div>
              );
            })}
          </div>

          <SectionTitle>Activity</SectionTitle>
          <Heatmap />

          <SectionTitle>Insights</SectionTitle>
          <ul className="flex flex-col gap-1.5 text-xs text-[#5a5850] list-disc pl-4">
            {insights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </Card>
    </Background>
  );
}
