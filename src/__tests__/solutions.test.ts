import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { allProblems } from "../data/problems";
import { testProgram, functionNameOf } from "../lib/pythonProgram";
import type { TestResult } from "../types";

function findPython(): string | null {
  for (const candidate of ["python3", "python"]) {
    try {
      execFileSync(candidate, ["-c", "import numpy"], { stdio: "ignore" });
      return candidate;
    } catch {
      /* Native tests are optional; test:runtime always runs real Pyodide. */
    }
  }
  return null;
}
const python = findPython();
const runner = `
import ast, contextlib, io, json, sys
programs = json.load(sys.stdin)
results = []
for program in programs:
    ns = {}
    tree = ast.parse(program)
    with contextlib.redirect_stdout(io.StringIO()):
        exec(compile(ast.Module(body=tree.body[:-1], type_ignores=[]), '<harness>', 'exec'), ns)
        value = eval(compile(ast.Expression(tree.body[-1].value), '<harness>', 'eval'), ns)
    results.append(json.loads(value))
json.dump(results, sys.stdout)
`;
describe.skipIf(!python)(
  "native reference solutions with production harness",
  () => {
    it("every solution passes every test, with full curriculum coverage", () => {
      const programs = allProblems.map((p) =>
        testProgram(p.solution, p.testCases, functionNameOf(p.starterCode)),
      );
      const results: TestResult[][] = JSON.parse(
        execFileSync(python!, ["-c", runner], {
          input: JSON.stringify(programs),
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        }),
      );
      expect(results).toHaveLength(allProblems.length);
      const failures = results.flatMap((cases, index) =>
        cases
          .filter((c) => !c.passed)
          .map(
            (c) =>
              `${allProblems[index].id} #${c.id}: ${c.actual}; expected ${c.expected}`,
          ),
      );
      expect(failures, failures.join("\n")).toEqual([]);
      expect(results.flat()).toHaveLength(
        allProblems.reduce((count, p) => count + p.testCases.length, 0),
      );
    });
  },
);
