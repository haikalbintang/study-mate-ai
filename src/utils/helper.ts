export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDurationMinutes(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  return `${mins} menit`;
}

/**
 * Plays a soft 2-note chime using Web Audio API.
 */
async function playChimeSound(): Promise<void> {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Ensure AudioContext is running (handles browser autoplay policies)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const notes = [523.25, 659.25]; // C5, E5
    const noteDuration = 0.4;
    const noteInterval = 0.2;

    notes.forEach((freq, i) => {
      const startTime = ctx.currentTime + i * noteInterval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      // Envelope: Fade in quickly, then fade out smoothly
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });

    // Clean up AudioContext after sound finishes playing
    const totalDuration = notes.length * noteInterval + noteDuration;
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, totalDuration * 1000);
  } catch (err) {
    console.error("Audio playback failed:", err);
  }
}

/**
 * Triggers system notification across Service Worker or standard Notification API.
 */
async function sendNotification(): Promise<void> {
  const title = "Time's up! ⏰";
  const options = {
    body: "Your pomodoro session has ended.",
    icon: "/stopwatch-svgrepo-com-192x192-3.png",
    tag: "pomodoro-done",
    // vibrate: [500, 200, 500, 200, 500],
    renotify: true,
    requireInteraction: true,
  };

  try {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      const notif = new Notification(title, options);
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
    }
  } catch (err) {
    console.error("Notification failed:", err);
  }
}

/**
 * Executes full alert sequence: Vibration, Notification, and Audio Chime.
 */
export async function playChime(): Promise<void> {
  // 1. Device Vibration (Android Chrome)
  if ("vibrate" in navigator) {
    navigator.vibrate([500, 200, 500, 200, 500]);
  }

  // 2. System Notification & Audio Chime in parallel
  await Promise.allSettled([sendNotification(), playChimeSound()]);
}

export function minutesSinceMidnight(ms: number): number {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

export function atTodayTime(hour: number, minute: number): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export function buildSampleSession() {
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
    {
      id: "sample-8",
      modeKey: 0,
      mode: "focus",
      start: atTodayTime(4, 0),
      end: atTodayTime(7, 0),
      completed: false,
    },
  ];
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
