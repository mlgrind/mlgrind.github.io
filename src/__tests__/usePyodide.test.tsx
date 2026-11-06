import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EXECUTION_TIMEOUT_MS, usePyodide } from "../hooks/usePyodide";

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: { data: Record<string, unknown> }) => void) | null = null;
  onerror: (() => void) | null = null;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    FakeWorker.instances.push(this);
  }
  emit(data: Record<string, unknown>) {
    this.onmessage?.({ data });
  }
}
beforeEach(() => {
  vi.useFakeTimers();
  FakeWorker.instances = [];
  vi.stubGlobal("Worker", FakeWorker);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Python worker lifecycle", () => {
  it("cancels a run and restarts Python without waiting for the worker", async () => {
    const { result, unmount } = renderHook(usePyodide);
    const original = FakeWorker.instances[0];
    act(() => original.emit({ type: "ready" }));
    let run!: ReturnType<typeof result.current.runCode>;
    act(() => {
      run = result.current.runCode("while True: pass");
    });
    act(() => result.current.stop());
    expect((await run).success).toBe(false);
    expect(original.terminate).toHaveBeenCalled();
    expect(FakeWorker.instances).toHaveLength(2);
    expect(result.current.isReady).toBe(false);
    act(() => FakeWorker.instances[1].emit({ type: "ready" }));
    expect(result.current.isReady).toBe(true);
    unmount();
  });
  it("times out unresponsive code and leaves failed tests instead of a completion", async () => {
    const { result, unmount } = renderHook(usePyodide);
    act(() => FakeWorker.instances[0].emit({ type: "ready" }));
    let run!: ReturnType<typeof result.current.runTests>;
    act(() => {
      run = result.current.runTests(
        "while True: pass",
        [
          {
            id: "1",
            input: "answer()",
            expected: "1",
            hidden: true,
            description: "timeout",
          },
        ],
        "answer",
      );
    });
    act(() => vi.advanceTimersByTime(EXECUTION_TIMEOUT_MS));
    const tests = await run;
    expect(tests[0].passed).toBe(false);
    expect(tests[0].actual).toContain("timed out");
    expect(FakeWorker.instances).toHaveLength(2);
    unmount();
  });
  it("does not allow overlapping runs or accept events from a terminated worker", async () => {
    const { result, unmount } = renderHook(usePyodide);
    const original = FakeWorker.instances[0];
    act(() => original.emit({ type: "ready" }));
    let first!: ReturnType<typeof result.current.runCode>;
    act(() => {
      first = result.current.runCode("print(1)");
    });
    expect((await result.current.runCode("print(2)")).error).toContain(
      "already in progress",
    );
    act(() => result.current.stop());
    await first;
    act(() => original.emit({ type: "ready" }));
    expect(result.current.isReady).toBe(false);
    unmount();
  });
});
