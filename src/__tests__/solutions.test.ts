import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { allProblems } from '../data/problems';

/**
 * Every problem ships a reference `solution`. This suite runs each one against
 * its own `testCases` using the same semantics as the in-browser runner
 * (`usePyodide.runTests`), so a mis-stated expected value or a malformed test
 * expression fails CI instead of the learner.
 *
 * Requires a local `python3` with numpy. When neither is present the suite skips
 * rather than failing, so contributors without a Python toolchain aren't blocked.
 */

function findPython(): string | null {
  for (const candidate of ['python3', 'python']) {
    try {
      execFileSync(candidate, ['-c', 'import numpy'], { stdio: 'ignore' });
      return candidate;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

const python = findPython();

// Mirrors the result->string conversion in src/hooks/usePyodide.ts.
const CONVERT = `
if isinstance(result, bool):
    result_str = str(result)
elif isinstance(result, (np.bool_, )):
    result_str = str(bool(result))
elif isinstance(result, np.ndarray):
    result_str = str(result.tolist())
elif isinstance(result, tuple):
    converted = []
    for item in result:
        if isinstance(item, bool):
            converted.append(item)
        elif isinstance(item, (np.bool_, )):
            converted.append(bool(item))
        elif isinstance(item, np.ndarray):
            converted.append(item.tolist())
        elif isinstance(item, (np.floating, float)):
            converted.append(round(float(item), 6) + 0.0)
        elif isinstance(item, (np.integer, int)):
            converted.append(int(item))
        else:
            converted.append(item)
    result_str = str(tuple(converted))
elif isinstance(result, (list, dict)):
    result_str = json.dumps(result)
elif isinstance(result, (np.floating, float)):
    result_str = str(round(float(result), 6) + 0.0)
elif isinstance(result, (np.integer, int)):
    result_str = str(int(result))
else:
    result_str = str(result)
`;

// Mirrors extractFunctionName in src/pages/ProblemPage.tsx.
function functionNameOf(starterCode: string): string {
  const matches = [...starterCode.matchAll(/def\s+(\w+)\s*\(/g)];
  return matches.length > 0 ? matches[matches.length - 1][1] : 'solution';
}

// Mirrors the expression-vs-arguments branch in usePyodide.runTests.
function usesExpressionForm(input: string, functionName: string): boolean {
  const isExpression =
    input.includes(functionName) || input.includes('.') || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input.trim());
  const isLambda = input.trim().startsWith('(lambda');
  return isExpression && !input.startsWith('[') && (!input.startsWith('(') || isLambda);
}

type Outcome = { key: string; status: string; expected: string; actual: string };

function runAll(pythonBin: string): Outcome[] {
  const harness: Record<string, unknown>[] = [];

  for (const problem of allProblems) {
    const name = functionNameOf(problem.starterCode);
    for (const testCase of problem.testCases) {
      const body = usesExpressionForm(testCase.input, name)
        ? `import numpy as np\nimport json\nresult = ${testCase.input}\n${CONVERT}`
        : `import numpy as np\nimport json\ntest_input = ${testCase.input}\n` +
          `if isinstance(test_input, list):\n    result = ${name}(np.array(test_input))\n` +
          `elif isinstance(test_input, tuple):\n    result = ${name}(*[np.array(x) if isinstance(x, list) else x for x in test_input])\n` +
          `else:\n    result = ${name}(test_input)\n${CONVERT}`;

      harness.push({
        key: `${problem.section}/${problem.id}#${testCase.id} (${testCase.description})`,
        solution: problem.solution,
        test: body,
        expected: testCase.expected,
      });
    }
  }

  const runner = `
import json, sys, io, re, contextlib

cases = json.load(open(sys.argv[1]))
out = []
for c in cases:
    g = {}
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(c["solution"], "<solution>", "exec"), g)
    except Exception as e:
        out.append({"key": c["key"], "status": "SOLUTION_ERROR",
                    "expected": c["expected"], "actual": f"{type(e).__name__}: {e}"})
        continue
    loc = dict(g)
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(c["test"], "<test>", "exec"), loc)
        actual = str(loc["result_str"])
        status = "PASS" if re.sub(r"\\s", "", actual) == re.sub(r"\\s", "", c["expected"]) else "FAIL"
    except Exception as e:
        actual = f"{type(e).__name__}: {e}"
        status = "ERROR"
    out.append({"key": c["key"], "status": status, "expected": c["expected"], "actual": actual})

json.dump(out, open(sys.argv[2], "w"))
`;

  const dir = mkdtempSync(join(tmpdir(), 'mlgrind-solutions-'));
  const casesPath = join(dir, 'cases.json');
  const runnerPath = join(dir, 'runner.py');
  const resultsPath = join(dir, 'results.json');

  writeFileSync(casesPath, JSON.stringify(harness));
  writeFileSync(runnerPath, runner);
  execFileSync(pythonBin, [runnerPath, casesPath, resultsPath], { stdio: 'pipe' });

  if (!existsSync(resultsPath)) return [];
  return JSON.parse(readFileSync(resultsPath, 'utf8'));
}

describe.skipIf(!python)('problem solutions', () => {
  const outcomes = python ? runAll(python) : [];

  it('every reference solution passes its own test cases', () => {
    const failures = outcomes.filter(o => o.status !== 'PASS');
    const report = failures
      .map(f => `  [${f.status}] ${f.key}\n      expected: ${f.expected}\n      actual:   ${f.actual}`)
      .join('\n');
    expect(failures.length, `${failures.length} failing case(s):\n${report}`).toBe(0);
  });

  it('covers every problem', () => {
    expect(outcomes.length).toBe(allProblems.reduce((n, p) => n + p.testCases.length, 0));
  });
});
