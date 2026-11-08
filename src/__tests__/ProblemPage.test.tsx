import {
  act,
  fireEvent,
  render,
  screen,
  cleanup,
} from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ProgressProvider } from "../context/ProgressContext";
import { getProblemById } from "../data/problems";
import ProblemPage from "../pages/ProblemPage";
const pyodide = vi.hoisted(() => ({
  runTests: vi.fn<(...args: unknown[]) => Promise<unknown[]>>(async () => []),
}));
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("../lib/firestoreSync", () => ({
  loadProgressFromFirestore: vi.fn(),
  saveProgressToFirestore: vi.fn(),
}));
vi.mock("../hooks/usePyodide", () => ({
  usePyodide: () => ({
    isLoading: false,
    isReady: true,
    output: [],
    runTests: pyodide.runTests,
    clearOutput: vi.fn(),
    stop: vi.fn(),
    retry: vi.fn(),
    error: null,
  }),
}));
vi.mock("../hooks/useAIFeedback", () => ({
  useAIFeedback: () => ({ clearFeedback: vi.fn(), requestFeedback: vi.fn() }),
}));
vi.mock("../components/CodeEditor/CodeEditor", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="Python code"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));
vi.mock("react-split", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

function mount(path = "/problem/python-basics/numpy-array-sum") {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <ProgressProvider>
          <Routes>
            <Route
              path="/problem/:sectionId/:problemId"
              element={<ProblemPage />}
            />
          </Routes>
        </ProgressProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}
beforeEach(() => {
  localStorage.clear();
  pyodide.runTests.mockReset();
  pyodide.runTests.mockImplementation(async () => []);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("problem editor persistence", () => {
  it("keeps code and the chosen tab through progress writes, then persists resets", () => {
    const view = mount();
    fireEvent.click(screen.getByRole("button", { name: "Examples" }));
    fireEvent.change(screen.getByLabelText("Python code"), {
      target: { value: "def array_sum(arr): return 0" },
    });
    expect(
      screen.getByRole("button", { name: "Examples" }).className,
    ).toContain("border-primary-500");
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Reset code" }));
    const starter = getProblemById("numpy-array-sum")!.starterCode;
    expect(screen.getByLabelText("Python code")).toHaveValue(starter);
    view.unmount();
    mount();
    expect(screen.getByLabelText("Python code")).toHaveValue(starter);
  });
  it("preserves an empty editor on reload and does not complete an empty test run", async () => {
    const view = mount();
    fireEvent.change(screen.getByLabelText("Python code"), {
      target: { value: "" },
    });
    view.unmount();
    mount();
    expect(screen.getByLabelText("Python code")).toHaveValue("");
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Run Tests" })),
    );
    const stored = JSON.parse(localStorage.getItem("ml-interview-progress")!);
    expect(stored["python-basics"]["numpy-array-sum"].status).not.toBe(
      "completed",
    );
  });
});

describe("NumPy | PyTorch track toggle", () => {
  const problem = getProblemById("numpy-array-sum")!;
  const editor = () => screen.getByLabelText("Python code");
  const choose = (name: "NumPy" | "PyTorch") =>
    fireEvent.click(screen.getByRole("button", { name }));

  it("swaps starter code and tests, keeps code per language and remembers the choice", () => {
    const view = mount();
    expect(screen.getByRole("group", { name: "Solution language" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NumPy" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(/NumPy-backed subset/)).not.toBeInTheDocument();
    fireEvent.change(editor(), { target: { value: "numpy draft" } });

    choose("PyTorch");
    expect(screen.getByRole("button", { name: "PyTorch" })).toHaveAttribute("aria-pressed", "true");
    expect(editor()).toHaveValue(problem.pytorch!.starterCode);
    expect(screen.getByText(/NumPy-backed subset/)).toBeInTheDocument();
    expect(localStorage.getItem("ml-lab-language")).toBe("pytorch");
    fireEvent.change(editor(), { target: { value: "torch draft" } });

    choose("NumPy");
    expect(editor()).toHaveValue("numpy draft");
    const stored = JSON.parse(localStorage.getItem("ml-interview-progress")!);
    expect(stored["python-basics"]["numpy-array-sum"]).toMatchObject({
      code: "numpy draft",
      codes: { pytorch: "torch draft" },
    });

    choose("PyTorch");
    view.unmount();
    mount();
    expect(screen.getByRole("button", { name: "PyTorch" })).toHaveAttribute("aria-pressed", "true");
    expect(editor()).toHaveValue("torch draft");
  });

  it("runs the PyTorch tests with the PyTorch harness and records the solve", async () => {
    localStorage.setItem("ml-lab-language", "pytorch");
    pyodide.runTests.mockImplementation(async (...args: unknown[]) =>
      (args[1] as { id: string }[]).map((t) => ({ ...t, passed: true, actual: "" })),
    );
    mount();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Run Tests" })),
    );
    expect(pyodide.runTests).toHaveBeenCalledWith(
      problem.pytorch!.starterCode,
      problem.pytorch!.testCases,
      "array_sum",
      "pytorch",
    );
    const stored = JSON.parse(localStorage.getItem("ml-interview-progress")!);
    expect(stored["python-basics"]["numpy-array-sum"]).toMatchObject({
      status: "completed",
      solvedIn: ["pytorch"],
    });
  });

  it("hides the toggle and uses NumPy for problems without a PyTorch track", () => {
    localStorage.setItem("ml-lab-language", "pytorch");
    mount("/problem/deep-learning/perceptron");
    expect(getProblemById("perceptron")!.pytorch).toBeUndefined();
    expect(screen.queryByRole("group", { name: "Solution language" })).not.toBeInTheDocument();
    expect(editor()).toHaveValue(getProblemById("perceptron")!.starterCode);
  });
});

describe("decluttered problem page", () => {
  it("shows the title once: the H1 stays, a repeated leading heading is hidden", () => {
    // The scaled dot-product attention description opens with "## Scaled Dot-Product Attention".
    const problem = getProblemById("scaled-dot-product-attention")!;
    expect(problem.description.trimStart().startsWith(`## ${problem.title}`)).toBe(true);
    mount(`/problem/${problem.section}/${problem.id}`);
    expect(screen.getAllByRole("heading", { name: problem.title })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: problem.title })).toBeInTheDocument();
  });

  it("puts Share in the title row and Run's shortcut in its tooltip, with no kbd hint", () => {
    mount();
    expect(screen.getByRole("button", { name: "Share challenge" })).toBeInTheDocument();
    expect(screen.queryByText("Share challenge")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run Tests" })).toHaveAttribute(
      "title",
      "Run tests (Shift+Enter)",
    );
    expect(document.querySelector("kbd")).toBeNull();
    expect(screen.queryByText(/Pro tip/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Maximize/ })).not.toBeInTheDocument();
  });

  it("has an accessible overflow menu with Maximize/Restore, Reset and Share", () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    mount();
    const trigger = screen.getByRole("button", { name: "More actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const items = screen.getAllByRole("menuitem").map((item) => item.textContent?.trim());
    expect(items).toEqual([
      expect.stringContaining("Maximize editor"),
      expect.stringContaining("Reset code"),
      expect.stringContaining("Copy share link"),
    ]);

    // Escape closes the menu and returns focus to the trigger.
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    // Keyboard open focuses the first item; arrows move between items.
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems[0]).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(menuItems[1]).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
    expect(menuItems[2]).toHaveFocus();

    fireEvent.click(menuItems[0]);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    // The maximized layout renders its own action bar.
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    expect(screen.getByRole("menuitem", { name: /Restore layout/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: /Copy share link/ }));
    expect(writeText).toHaveBeenCalledWith(
      "https://mlgrind.github.io/problem/python-basics/numpy-array-sum",
    );
  });
});
