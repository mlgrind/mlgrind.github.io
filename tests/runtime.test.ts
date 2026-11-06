import { loadPyodide } from 'pyodide';
import { beforeAll, describe, expect, it } from 'vitest';
import { allProblems } from '../src/data/problems';
import { functionNameOf, testProgram } from '../src/lib/pythonProgram';
import type { TestResult, TestCase } from '../src/types';
let python: Awaited<ReturnType<typeof loadPyodide>>;
beforeAll(async () => { python = await loadPyodide(); await python.loadPackage('numpy'); });

async function run(code: string, tests: TestCase[], fn: string): Promise<TestResult[]> {
  return JSON.parse(String(await python.runPythonAsync(testProgram(code, tests, fn))));
}
describe('real Pyodide execution', () => {
  it('every reference solution passes through the production test harness', async () => {
    const failures: string[] = [];
    for (const problem of allProblems) {
      const results = await run(problem.solution, problem.testCases, functionNameOf(problem.starterCode));
      for (const result of results.filter(r => !r.passed)) failures.push(`${problem.id} #${result.id}: ${result.actual}; expected ${result.expected}`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
  it('compares numeric arrays, tuples, dictionaries, booleans and strings correctly', async () => {
    const cases = [
      ['np.array([1., 2.0000001])', '[1, 2]', true],
      ["{'b': [2.00000001], 'a': 1}", "{'a': 1.0, 'b': [2]}", true],
      ['(1.0, 2.0)', '(1, 2)', true],
      ['True', '1', false],
      ["'a b'", "'ab'", false],
      ['[1, 3]', '[1, 2]', false],
    ] as const;
    for (const [value, expected, passed] of cases) {
      const result = await run(`import numpy as np\ndef answer():\n    return ${value}`, [{ id: '1', input: 'answer()', expected, hidden: false, description: value }], 'answer');
      expect(result[0].passed, value).toBe(passed);
    }
  });
  it('does not confuse decimal arguments with complete expressions or leak prior submissions', async () => {
    const test = { id: '1', input: '1.5', expected: '3', hidden: false, description: 'decimal' };
    expect((await run('def double(x):\n    return x * 2', [test], 'double'))[0].passed).toBe(true);
    expect((await run('# function removed', [test], 'double'))[0].passed).toBe(false);
  });
});
