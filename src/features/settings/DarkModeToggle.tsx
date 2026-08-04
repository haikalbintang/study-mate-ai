import usePomodoro from "@/hooks/usePomodoro";

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = usePomodoro();

  return (
    <div
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center gap-2"
    >
      <div className="text-foreground text-sm">
        {darkMode ? "Dark" : "Light"}
      </div>
      <button
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
      >
        <span className="relative block h-4 w-4">
          {/* Sun */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-out"
            style={{
              opacity: darkMode ? 0 : 1,
              transform: darkMode
                ? "rotate(-90deg) scale(0.5)"
                : "rotate(0deg) scale(1)",
            }}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          {/* Moon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-out"
            style={{
              opacity: darkMode ? 1 : 0,
              transform: darkMode
                ? "rotate(0deg) scale(1)"
                : "rotate(90deg) scale(0.5)",
            }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
