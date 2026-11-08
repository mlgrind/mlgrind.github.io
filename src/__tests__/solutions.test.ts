import { describe, it, expect } from "vitest";
import { allProblems } from "../data/problems";
import { testProgram, functionNameOf } from "../lib/pythonProgram";
import type { Problem, TestResult } from "../types";
import { findPython, runPrograms } from "./nativePython";

const python = findPython();

function failuresOf(problems: Problem[], results: TestResult[][]): string[] {
  return results.flatMap((cases, index) =>
    cases
      .filter((c) => !c.passed)
      .map(
        (c) =>
          `${problems[index].id} #${c.id}: ${c.actual}; expected ${c.expected}`,
      ),
  );
}

describe.skipIf(!python)(
  "native reference solutions with production harness",
  () => {
    it("every solution passes every test, with full curriculum coverage", () => {
      const programs = allProblems.map((p) =>
        testProgram(p.solution, p.testCases, functionNameOf(p.starterCode)),
      );
      const results = runPrograms(python!, programs);
      expect(results).toHaveLength(allProblems.length);
      const failures = failuresOf(allProblems, results);
      expect(failures, failures.join("\n")).toEqual([]);
      expect(results.flat()).toHaveLength(
        allProblems.reduce((count, p) => count + p.testCases.length, 0),
      );
    });
  },
);

const tracked = allProblems.filter((p) => p.pytorch);

describe("PyTorch tracks", () => {
  it("exist for every problem and keep the visible/hidden split", () => {
    expect(tracked.map((p) => p.id)).toEqual(allProblems.map((p) => p.id));
    for (const p of tracked) {
      const track = p.pytorch!;
      expect(track.testCases.some((t) => !t.hidden), p.id).toBe(true);
      expect(track.testCases.some((t) => t.hidden), p.id).toBe(true);
      // Same function as the NumPy track, so the shared description holds.
      expect(functionNameOf(track.starterCode), p.id).toBe(
        functionNameOf(p.starterCode),
      );
    }
  });

  it("use expression-based tests that call the function or class", () => {
    const offenders: string[] = [];
    for (const p of tracked) {
      const names = [
        ...p.pytorch!.starterCode.matchAll(/^(?:def|class)\s+(\w+)/gm),
      ].map((m) => m[1]);
      for (const t of p.pytorch!.testCases) {
        if (!names.some((name) => new RegExp(`\\b${name}\\s*\\(`).test(t.input)))
          offenders.push(`${p.id} #${t.id}: ${t.input.slice(0, 60)}`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});

describe.skipIf(!python)("PyTorch track solutions under the torch shim", () => {
  const programs = (field: "solution" | "starterCode") =>
    tracked.map((p) =>
      testProgram(
        p.pytorch![field],
        p.pytorch!.testCases,
        functionNameOf(p.pytorch!.starterCode),
        "pytorch",
      ),
    );

  it("every PyTorch solution passes every one of its tests", () => {
    const results = runPrograms(python!, programs("solution"), "shim");
    expect(results).toHaveLength(tracked.length);
    const failures = failuresOf(tracked, results);
    expect(failures, failures.join("\n")).toEqual([]);
    expect(results.flat()).toHaveLength(
      tracked.reduce((count, p) => count + p.pytorch!.testCases.length, 0),
    );
  });

  it("no PyTorch starter code passes its tests", () => {
    const results = runPrograms(python!, programs("starterCode"), "shim");
    const passing = tracked
      .filter((_, i) => results[i].every((r) => r.passed))
      .map((p) => p.id);
    expect(passing).toEqual([]);
  });
});
