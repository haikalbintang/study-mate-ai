import { describe, expect, it } from "vitest";
import DarkModeToggle from "./DarkModeToggle";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PomodoroProvider } from "@/hooks/PomodoroProvider";

describe("DarkModeToggle", () => {
  it("renders the toggle button with correct aria-label and title based on dark mode state", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <PomodoroProvider>
        <DarkModeToggle />
      </PomodoroProvider>,
    );
    const button = getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    expect(button).toHaveAttribute("title", "Switch to dark mode");
    await user.click(button);
    expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    expect(button).toHaveAttribute("title", "Switch to light mode");
  });
});
