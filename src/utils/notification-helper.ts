import type { ModeKey } from "@/types/shared";

const NOTIFICATION_COPY: Record<ModeKey, { title: string; body: string }> = {
  0: { title: "Focus session done ⏰", body: "Time for a break." },
  1: { title: "Break's over ⏰", body: "Ready for another focus session." },
  2: {
    title: "Long break's over ⏰",
    body: "Ready for another focus session.",
  },
};

/**
 * Plays a soft 2-note chime using Web Audio API.
 */
export async function triggerChimeSound(): Promise<void> {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

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

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });

    const totalDuration = notes.length * noteInterval + noteDuration;
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, totalDuration * 1000);
  } catch (err) {
    console.error("Audio playback failed:", err);
  }
}

/**
 * Triggers system notification across Service Worker or standard Notification API,
 * and handles device haptic vibration.
 */
export async function triggerNotification(mode: ModeKey): Promise<void> {
  // 1. Device Vibration (Android Chrome) stays tied to notification visibility
  if ("vibrate" in navigator) {
    navigator.vibrate([500, 200, 500, 200, 500]);
  }

  if (
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const { title, body } = NOTIFICATION_COPY[mode] || {
    title: "Time's up! ⏰",
    body: "Your pomodoro session has ended.",
  };

  const options = {
    body,
    icon: "/stopwatch-svgrepo-com-192x192-3.png",
    tag: "pomodoro-done",
    renotify: true,
    requireInteraction: true,
  };

  try {
    // Cek apakah aplikasi berjalan sebagai PWA (Standalone/Installed) atau di Mobile Safari
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone; // khusus iOS Safari standalone

    // 2. Mobile & PWA approach (Hanya dipanggil jika benar-benar berjalan sebagai PWA)
    if (isPWA && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg) {
        await reg.showNotification(title, options);
        return; // Selesai jika sukses di PWA
      }
    }

    // 3. Desktop & Standard Web Fallback
    // Jika bukan PWA, atau jika Service Worker gagal, jalankan notifikasi standar browser
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.error("Notification failed:", err);
  }
}
