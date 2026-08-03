export function minutesSinceMidnight(ms: number): number {
  const d = new Date(ms);

  // Guard against invalid date parameters
  if (isNaN(d.getTime())) return 0;

  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

export function atTodayTime(hour: number, minute: number): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function onTimerComplete() {
  // Sound
  const alarmSound = new Audio("/alarm.mp3"); // put a short mp3/ogg in your public folder
  alarmSound.loop = false;
  alarmSound.play().catch((err) => console.warn("Autoplay blocked:", err));

  // Vibration (Android Chrome; iOS Safari does not support this API)
  if (navigator.vibrate) {
    navigator.vibrate([500, 200, 500, 200, 500]);
  }

  // System notification (works even if app is in background tab)
  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification("Time's up! ⏰", {
          body: "Your pomodoro session has ended.",
          icon: "/stopwatch-svgrepo-com-192x192-3.png",
          tag: "pomodoro-done",
          vibrate: [500, 200, 500, 200, 500], // some Android browsers also support vibrate here
          renotify: true,
          requireInteraction: true,
        } as NotificationOptions & { vibrate?: number[]; renotify?: boolean });
      } catch (err) {
        console.error("Notification failed:", err);
      }
    } else {
      const notif = new Notification("Time's up! ⏰", {
        body: "Your pomodoro session has ended.",
        icon: "/stopwatch-svgrepo-com-192x192-3.png",
        tag: "pomodoro-done",
        requireInteraction: true, // keeps it on screen until dismissed (desktop mostly)
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }
  }
}
// Optionally stop the alarm sound when user interacts (e.g. a "Dismiss" button)

export function clampDuration(value: string): number {
  return Math.max(1, Math.min(120, Number(value) || 1));
}
