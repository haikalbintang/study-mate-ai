import { useEffect, useState } from "react";

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function useTodayBoundary(): number {
  const [todayTimestamp, setTodayTimestamp] = useState(startOfToday);

  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const currentStartOfDay = startOfToday();
      setTodayTimestamp((prev) =>
        currentStartOfDay !== prev ? currentStartOfDay : prev,
      );
    }, 60000); // once a minute is plenty for a midnight check

    return () => clearInterval(checkMidnight);
  }, []);

  return todayTimestamp;
}
