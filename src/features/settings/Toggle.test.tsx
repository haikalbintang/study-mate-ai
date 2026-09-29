import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toggle from "./Toggle";

function setup(props: { checked: boolean; onChange?: (value: boolean) => void } = { checked: false }) {
  const onChange = props.onChange ?? vi.fn();
  const user = userEvent.setup();

  render(<Toggle checked={props.checked} onChange={onChange} />);

  return { user, onChange, toggle: screen.getByRole("switch") };
}

describe("Toggle", () => {
  it("exposes switch role with aria-checked=false when off", () => {
    const { toggle } = setup({ checked: false });

    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("exposes switch role with aria-checked=true when on", () => {
    const { toggle } = setup({ checked: true });

    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with true when clicked while off", async () => {
    const { user, onChange } = setup({ checked: false });

    await user.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when clicked while on", async () => {
    const { user, onChange } = setup({ checked: true });

    await user.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("stays controlled — the parent owns the checked state", async () => {
    const { user, onChange, toggle } = setup({ checked: false });

    await user.click(toggle);

    expect(onChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("applies the active color when checked and the muted color when unchecked", () => {
    const { unmount } = render(<Toggle checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveStyle({ backgroundColor: "#c25b3a" });
    unmount();

    render(<Toggle checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveStyle({ backgroundColor: "#e4e1d7" });
  });

  it("is reachable and operable via keyboard", async () => {
    const { user, onChange, toggle } = setup({ checked: false });

    await user.tab();
    expect(toggle).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
