import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import FeedbackModal from "../components/FeedbackModal/FeedbackModal";

afterEach(cleanup);

function Harness({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open feedback
      </button>
      <FeedbackModal
        isOpen={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    </>
  );
}

describe("FeedbackModal", () => {
  it("is a labelled modal dialog that takes focus and closes on Escape, restoring focus", () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByRole("button", { name: "Open feedback" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Send Feedback" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(screen.getByRole("button", { name: "Close feedback form" })).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("keeps Tab and Shift+Tab inside the dialog", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Open feedback" }));
    const dialog = screen.getByRole("dialog");
    const close = screen.getByRole("button", { name: "Close feedback form" });
    const submit = screen.getByRole("button", { name: "Send Feedback" });

    submit.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(submit).toHaveFocus();
  });
});
