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
    runTests: vi.fn(async () => []),
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

function mount() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/problem/python-basics/numpy-array-sum"]}>
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
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
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
