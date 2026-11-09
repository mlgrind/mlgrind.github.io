import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAIFeedback } from "../hooks/useAIFeedback";

const params = { code: "x", problemTitle: "t", problemDescription: "d", testResults: [] };

afterEach(() => vi.unstubAllGlobals());

describe("useAIFeedback errors", () => {
  it("explains an unreachable service instead of showing 'Failed to fetch'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const { result } = renderHook(() => useAIFeedback());
    await act(() => result.current.requestFeedback(params));
    expect(result.current.error).toMatch(/Couldn't reach the AI feedback service/);
    expect(result.current.isLoading).toBe(false);
  });

  it("handles a non-JSON error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.reject(new SyntaxError("bad json")) }),
    );
    const { result } = renderHook(() => useAIFeedback());
    await act(() => result.current.requestFeedback(params));
    expect(result.current.error).toMatch(/unavailable right now/);
  });
});
