import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestNotificationPermission,
  triggerChimeSound,
  triggerNotification,
} from "./notification-helper";

class MockNotification {
  static permission: NotificationPermission = "granted";
  static requestPermission = vi.fn();
  static instances: MockNotification[] = [];

  onclick: (() => void) | null = null;
  close = vi.fn();
  title: string;
  options?: NotificationOptions;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
    MockNotification.instances.push(this);
  }
}

beforeEach(() => {
  MockNotification.permission = "granted";
  MockNotification.requestPermission.mockReset();
  MockNotification.instances = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, "vibrate");
  Reflect.deleteProperty(navigator, "serviceWorker");
  Reflect.deleteProperty(window, "AudioContext");
  Reflect.deleteProperty(window, "webkitAudioContext");
});

describe("requestNotificationPermission", () => {
  it("returns true when permission is already granted", async () => {
    vi.stubGlobal("Notification", MockNotification);
    MockNotification.permission = "granted";

    await expect(requestNotificationPermission()).resolves.toBe(true);
    expect(MockNotification.requestPermission).not.toHaveBeenCalled();
  });

  it("requests permission and resolves true when granted", async () => {
    vi.stubGlobal("Notification", MockNotification);
    MockNotification.permission = "default";
    MockNotification.requestPermission.mockResolvedValue("granted");

    await expect(requestNotificationPermission()).resolves.toBe(true);
    expect(MockNotification.requestPermission).toHaveBeenCalledTimes(1);
  });

  it("resolves false when permission is denied", async () => {
    vi.stubGlobal("Notification", MockNotification);
    MockNotification.permission = "default";
    MockNotification.requestPermission.mockResolvedValue("denied");

    await expect(requestNotificationPermission()).resolves.toBe(false);
  });

  it("returns false when the Notification API is unavailable", async () => {
    Reflect.deleteProperty(window, "Notification");

    await expect(requestNotificationPermission()).resolves.toBe(false);
  });
});

describe("triggerChimeSound", () => {
  it("does nothing when the Web Audio API is unavailable", async () => {
    Reflect.deleteProperty(window, "AudioContext");
    Reflect.deleteProperty(window, "webkitAudioContext");

    await expect(triggerChimeSound()).resolves.toBeUndefined();
  });

  it("plays a two-note chime and closes the audio context", async () => {
    vi.useFakeTimers();
    const start = vi.fn();
    const stop = vi.fn();
    const close = vi.fn().mockResolvedValue(undefined);

    class MockAudioContext {
      state = "running";
      currentTime = 0;
      destination = {};
      resume = vi.fn().mockResolvedValue(undefined);
      close = close;
      createOscillator = () => ({
        type: "",
        frequency: { value: 0 },
        connect: vi.fn(),
        start,
        stop,
      });
      createGain = () => ({
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      });
    }

    vi.stubGlobal("AudioContext", MockAudioContext);

    await triggerChimeSound();

    expect(start).toHaveBeenCalledTimes(2);
    expect(stop).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(2000);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("logs an error when audio playback fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    class ThrowingAudioContext {
      constructor() {
        throw new Error("boom");
      }
    }

    vi.stubGlobal("AudioContext", ThrowingAudioContext);

    await triggerChimeSound();

    expect(errorSpy).toHaveBeenCalledWith(
      "Audio playback failed:",
      expect.any(Error),
    );
  });

  it("resumes a suspended audio context before playing", async () => {
    const resume = vi.fn().mockResolvedValue(undefined);

    class SuspendedAudioContext {
      state = "suspended";
      currentTime = 0;
      destination = {};
      resume = resume;
      close = vi.fn().mockResolvedValue(undefined);
      createOscillator = () => ({
        type: "",
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      });
      createGain = () => ({
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      });
    }

    vi.stubGlobal("AudioContext", SuspendedAudioContext);

    await triggerChimeSound();

    expect(resume).toHaveBeenCalledTimes(1);
  });
});

describe("triggerNotification", () => {
  it("vibrates the device when supported", async () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrate,
      configurable: true,
    });
    vi.stubGlobal("Notification", MockNotification);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
    })));

    await triggerNotification(0);

    expect(vibrate).toHaveBeenCalledWith([500, 200, 500, 200, 500]);
  });

  it("returns early when Notification is undefined", async () => {
    Reflect.deleteProperty(window, "Notification");

    await expect(triggerNotification(0)).resolves.toBeUndefined();
    expect(MockNotification.instances).toHaveLength(0);
  });

  it("returns early when permission is not granted", async () => {
    vi.stubGlobal("Notification", MockNotification);
    MockNotification.permission = "denied";

    await triggerNotification(0);

    expect(MockNotification.instances).toHaveLength(0);
  });

  it("uses the service worker when running as a PWA", async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "serviceWorker", {
      value: { ready: Promise.resolve({ showNotification }) },
      configurable: true,
    });
    vi.stubGlobal("Notification", MockNotification);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: true,
    })));

    await triggerNotification(1);

    expect(showNotification).toHaveBeenCalledWith(
      "Break's over ⏰",
      expect.objectContaining({ tag: "pomodoro-done" }),
    );
    expect(MockNotification.instances).toHaveLength(0);
  });

  it("falls back to the browser Notification when not a PWA", async () => {
    vi.stubGlobal("Notification", MockNotification);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
    })));
    const focus = vi.spyOn(window, "focus").mockImplementation(() => {});

    await triggerNotification(2);

    expect(MockNotification.instances).toHaveLength(1);
    const notif = MockNotification.instances[0];
    expect(notif.title).toBe("Long break's over ⏰");

    notif.onclick?.();
    expect(focus).toHaveBeenCalledTimes(1);
    expect(notif.close).toHaveBeenCalledTimes(1);
  });

  it("falls back to the browser Notification when the service worker is not ready", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: { ready: Promise.resolve(undefined) },
      configurable: true,
    });
    vi.stubGlobal("Notification", MockNotification);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: true,
    })));

    await triggerNotification(0);

    expect(MockNotification.instances).toHaveLength(1);
  });

  it("uses a generic copy for an unknown mode", async () => {
    vi.stubGlobal("Notification", MockNotification);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
    })));

    await triggerNotification(9 as 0);

    expect(MockNotification.instances[0].title).toBe("Time's up! ⏰");
  });

  it("logs an error when creating the notification throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    class ThrowingNotification {
      static permission: NotificationPermission = "granted";
      constructor() {
        throw new Error("nope");
      }
    }

    vi.stubGlobal("Notification", ThrowingNotification);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
    })));

    await triggerNotification(0);

    expect(errorSpy).toHaveBeenCalledWith(
      "Notification failed:",
      expect.any(Error),
    );
  });
});
