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

// Simple two-tone chime using the Web Audio API — no external assets needed.
export function playChime(): void {
  try {
    const AudioContextClass = window.AudioContext;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.2 + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.4);
    });
  } catch (e) {
    console.error(e);
    // Audio not available — fail silently.
  }
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

export function onTimerComplete() {
  // Sound
  const alarmSound = new Audio("/alarm.mp3"); // put a short mp3/ogg in your public folder
  alarmSound.loop = false;
  alarmSound.play().catch((err) => console.warn("Autoplay blocked:", err));

  // Vibration (Android Chrome; iOS Safari does not support this API)
  if (navigator.vibrate) {
    navigator.vibrate([500, 200, 500, 200, 500]);
  }

  // System notification (works even if app is in background tab)
  if (Notification.permission === "granted") {
    const notif = new Notification("Time's up! ⏰", {
      body: "Your pomodoro session has ended.",
      icon: "stopwatch-svgrepo-com-192x192-3.png",
      tag: "pomodoro-done",
      requireInteraction: true, // keeps it on screen until dismissed (desktop mostly)
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  }

  // Optionally stop the alarm sound when user interacts (e.g. a "Dismiss" button)
}
