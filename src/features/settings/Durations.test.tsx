import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MODES } from "@/data/shared";
import Durations from "./Durations";

const handleDurationChange = vi.fn();
const handleDurationBlur = vi.fn();

vi.mock("@/hooks/usePomodoro", () => ({
  default: () => ({
    inputValues: MODES.map((m) => String(m.minutes)),
    handleDurationChange,
    handleDurationBlur,
  }),
}));

beforeEach(() => {
  handleDurationChange.mockClear();
  handleDurationBlur.mockClear();
});

describe("Durations component", () => {
  it("renders input fields for each mode", () => {
    const { getByLabelText } = render(<Durations />);
    const focusInput = getByLabelText(/Focus/i);
    const shortBreakInput = getByLabelText(/Short Break/i);
    const longBreakInput = getByLabelText(/Long Break/i);
    expect(focusInput).toBeInTheDocument();
    expect(shortBreakInput).toBeInTheDocument();
    expect(longBreakInput).toBeInTheDocument();
  });

  it("reports changes for the right mode on input", () => {
    const { getByLabelText } = render(<Durations />);

    fireEvent.change(getByLabelText(/Short Break/i), {
      target: { value: "10" },
    });

    expect(handleDurationChange).toHaveBeenCalledWith(1, "10");
  });

  it("reports the value on blur", () => {
    const { getByLabelText } = render(<Durations />);

    fireEvent.blur(getByLabelText(/Long Break/i), {
      target: { value: "20" },
    });

    expect(handleDurationBlur).toHaveBeenCalledWith(2, "20");
  });
});
