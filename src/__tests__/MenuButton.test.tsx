import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MenuButton from "../components/Menu/MenuButton";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function mount() {
  return render(
    <div>
      {/* An animated ancestor creates a stacking context, as the home hero does. */}
      <div data-testid="hero" style={{ transform: "translateY(0)", overflow: "hidden" }}>
        <MenuButton label="Learning paths" trigger="Learning paths">
          {(close) => (
            <>
              <button role="menuitem" type="button" onClick={close}>
                First
              </button>
              <button role="menuitem" type="button" onClick={close}>
                Second
              </button>
            </>
          )}
        </MenuButton>
      </div>
      <button type="button">After</button>
    </div>,
  );
}

const trigger = () => screen.getByRole("button", { name: "Learning paths" });

describe("MenuButton", () => {
  it("renders the menu in a fixed portal on <body>, outside the trigger's stacking context", () => {
    mount();
    fireEvent.click(trigger());
    const menu = screen.getByRole("menu");
    expect(screen.getByTestId("hero")).not.toContainElement(menu);
    expect(menu.parentElement).toBe(document.body);
    expect(menu).toHaveClass("fixed");
    // Above the sticky header (z-50), with a solid background in both themes.
    expect(menu.className).toMatch(/z-\[60\]/);
    expect(menu).toHaveClass("bg-white", "dark:bg-dark-800", "border");
    expect(menu.style.visibility).not.toBe("hidden");
    expect(menu.style.top).not.toBe("");
  });

  it("closes on Escape even when focus stayed on the trigger after a click", () => {
    mount();
    fireEvent.click(trigger());
    fireEvent.keyDown(trigger(), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it("keeps clicks inside the portalled menu from counting as outside clicks", () => {
    mount();
    fireEvent.click(trigger());
    fireEvent.mouseDown(screen.getByRole("menuitem", { name: "Second" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("button", { name: "After" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens from the keyboard with focus on the first item and hands Tab back to the trigger", () => {
    mount();
    fireEvent.keyDown(trigger(), { key: "Enter" });
    expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it("clamps a right-aligned menu wider than the space left of the trigger into a phone viewport", () => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(390);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(844);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(352);
    mount();
    vi.spyOn(trigger(), "getBoundingClientRect").mockReturnValue(
      { left: 24, right: 196, top: 430, bottom: 480, width: 172, height: 50, x: 24, y: 430, toJSON: () => ({}) } as DOMRect,
    );
    fireEvent.click(trigger());
    const menu = screen.getByRole("menu");
    expect(menu.style.left).toBe("8px");
    expect(menu.style.top).toBe("488px");
  });
});
