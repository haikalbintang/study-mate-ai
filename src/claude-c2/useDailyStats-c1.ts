import { useMemo } from "react";
import type { Session } from "@/types/shared";
import { MODES, DAILY_GOAL_SESSIONS } from "@/data/shared";
import { addDays, dayKey, isSameDay, minutesOf } from "@/utils/date-helper";

/** Derives today's dashboard stats (completion, streak, distribution, etc.) from the full session log. */
export function useDailyStats(sessions: Session[], todayTimestamp: number) {
  return useMemo(() => {
    const today = new Date(todayTimestamp);

    const todaySessions = sessions.filter((s) =>
      isSameDay(s.start, todayTimestamp),
    );
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
    let streak = 0;
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
  }, [sessions, todayTimestamp]);
}
