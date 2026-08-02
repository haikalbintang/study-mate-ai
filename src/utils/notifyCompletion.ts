import type { ModeKey } from "@/types/shared";

const NOTIFICATION_COPY: Record<ModeKey, { title: string; body: string }> = {
  0: { title: "Focus session done", body: "Time for a break." },
  1: { title: "Break's over", body: "Ready for another focus session." },
  2: { title: "Long break's over", body: "Ready for another focus session." },
};

/**
 * Shows a browser notification for a finished session — a no-op if the
 * Notification API isn't available or permission was never granted (we only
 * request permission, never assume it; if the person said no, we stay quiet).
 */
export function notifyCompletion(mode: ModeKey) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const { title, body } = NOTIFICATION_COPY[mode];
  new Notification(title, { body });
}
