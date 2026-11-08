import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ProgressProvider } from "../context/ProgressContext";
import Sidebar, { SIDEBAR_GROUPS_KEY } from "../components/Layout/Sidebar";
import Header from "../components/Layout/Header";
import { curriculumGroups } from "../data/curriculum";
import { sections } from "../data/sections";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: null, signInWithGoogle: vi.fn(), signOut: vi.fn() }),
}));
vi.mock("../lib/firestoreSync", () => ({
  loadProgressFromFirestore: vi.fn(),
  saveProgressToFirestore: vi.fn(),
}));
vi.mock("../hooks/useFlashCards", () => ({
  useFlashCards: () => ({ getDueCount: () => 41 }),
}));

function mount(ui: React.ReactNode, path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ProgressProvider>{ui}</ProgressProvider>
    </MemoryRouter>,
  );
}
const groupButton = (title: string) => screen.getByRole("button", { name: new RegExp(`^${title.replace(/[&]/g, "\\$&")}`) });

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("sidebar groups", () => {
  it("opens only the active group by default and shows one count per group", () => {
    mount(<Sidebar />, "/problem/transformers/scaled-dot-product-attention");
    for (const group of curriculumGroups) {
      const button = groupButton(group.title);
      expect(button).toHaveAttribute(
        "aria-expanded",
        String(group.id === "transformers-llms"),
      );
      expect(within(button).getByText(/^\d+\/\d+$/)).toBeInTheDocument();
    }
    // Full titles render (no truncation) and the active section is visible.
    expect(screen.getByRole("link", { name: /Representation Learning & Retrieval/ })).toBeVisible();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("toggles groups and remembers the open state", () => {
    const view = mount(<Sidebar />, "/section/cnn");
    const foundations = groupButton("Foundations");
    expect(foundations).toHaveAttribute("aria-expanded", "false");
    const list = document.getElementById(foundations.getAttribute("aria-controls")!)!;
    expect(list).not.toBeVisible();
    fireEvent.click(foundations);
    expect(foundations).toHaveAttribute("aria-expanded", "true");
    expect(list).toBeVisible();
    fireEvent.click(groupButton("Deep Learning"));
    expect(JSON.parse(localStorage.getItem(SIDEBAR_GROUPS_KEY)!)).toMatchObject({
      foundations: true,
      "deep-learning": false,
    });

    view.unmount();
    mount(<Sidebar />, "/");
    expect(groupButton("Foundations")).toHaveAttribute("aria-expanded", "true");
    expect(groupButton("Deep Learning")).toHaveAttribute("aria-expanded", "false");
  });

  it("survives unreadable storage", () => {
    localStorage.setItem(SIDEBAR_GROUPS_KEY, "{not json");
    mount(<Sidebar />, "/");
    expect(groupButton("Foundations")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("header", () => {
  it("groups the tools into one menu with the due badge on the trigger", () => {
    const onOpenFeedback = vi.fn();
    mount(<Header onMenuToggle={vi.fn()} onOpenFeedback={onOpenFeedback} />);
    expect(screen.queryByRole("link", { name: "Scratchpad" })).not.toBeInTheDocument();
    const tools = screen.getByRole("button", { name: /^Tools/ });
    expect(tools).toHaveTextContent("41");
    expect(tools).toHaveAttribute("aria-haspopup", "menu");
    fireEvent.click(tools);
    const items = screen.getAllByRole("menuitem").map((i) => i.textContent);
    expect(items).toEqual([
      "Scratchpad",
      expect.stringContaining("Flash Cards"),
      expect.stringContaining("Cheat Sheet"),
      "Send feedback",
    ]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Send feedback" }));
    expect(onOpenFeedback).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shows solved / total progress and the section breadcrumb on problem pages", () => {
    const total = sections.reduce((n, s) => n + s.problems.length, 0);
    mount(
      <Header onMenuToggle={vi.fn()} onOpenFeedback={vi.fn()} menuOnDesktop />,
      "/problem/transformers/scaled-dot-product-attention",
    );
    expect(screen.getByText(`0 / ${total}`)).toBeInTheDocument();
    const crumb = within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link");
    expect(crumb).toHaveAttribute("href", "/section/transformers");
    expect(screen.getByRole("link", { name: "Next problem" })).toBeInTheDocument();
  });
});
