import { useEffect } from "react";

/**
 * Keeps the `dark` class on <html> in sync with the persisted setting.
 * Tailwind v4's `dark:` utilities are wired (via the custom variant in your
 * CSS entry file) to respond to this class rather than the OS setting
 * directly, which is what makes a manual toggle possible.
 */
export function useSyncDarkMode(darkMode: boolean) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
}
