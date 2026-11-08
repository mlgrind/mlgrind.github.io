import { readFileSync } from 'node:fs';
import { loadPyodide } from 'pyodide';
import { beforeAll, describe, expect, it } from 'vitest';
import { allProblems } from '../src/data/problems';
import { functionNameOf, testProgram } from '../src/lib/pythonProgram';
import type { TestResult, TestCase, Language } from '../src/types';
let python: Awaited<ReturnType<typeof loadPyodide>>;
beforeAll(async () => { python = await loadPyodide(); await python.loadPackage('numpy'); });

async function run(code: string, tests: TestCase[], fn: string, language: Language = 'numpy'): Promise<TestResult[]> {
  return JSON.parse(String(await python.runPythonAsync(testProgram(code, tests, fn, language))));
}
// Mirrors public/python-worker.js: write the shim to the virtual FS and install it.
async function installTorchShim() {
  python.FS.writeFile('/home/pyodide/torch_shim.py', readFileSync('public/py/torch_shim.py', 'utf8'));
  await python.runPythonAsync("import sys\nif '/home/pyodide' not in sys.path: sys.path.insert(0, '/home/pyodide')\nimport torch_shim\ntorch_shim.install()\nNone");
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
  it('every PyTorch track solution passes under the torch shim in Pyodide', async () => {
    await installTorchShim();
    const tracked = allProblems.filter(p => p.pytorch);
    expect(tracked.length).toBeGreaterThan(0);
    const failures: string[] = [];
    let count = 0;
    for (const problem of tracked) {
      const track = problem.pytorch!;
      const results = await run(track.solution, track.testCases, functionNameOf(track.starterCode), 'pytorch');
      count += results.length;
      for (const result of results.filter(r => !r.passed)) failures.push(`${problem.id} (PyTorch) #${result.id}: ${result.actual}; expected ${result.expected}`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
    expect(count).toBe(tracked.reduce((n, p) => n + p.pytorch!.testCases.length, 0));
  });
  it('the torch shim unit tests pass on wasm32 (Pyodide)', async () => {
    // Catches 64-bit assumptions (e.g. int64 indices where NumPy wants intp,
    // which is int32 in Pyodide) that CPython runs of the suite cannot see.
    python.FS.mkdirTree('/shim/public/py');
    python.FS.mkdirTree('/shim/scripts');
    python.FS.writeFile('/shim/public/py/torch_shim.py', readFileSync('public/py/torch_shim.py', 'utf8'));
    python.FS.writeFile('/shim/scripts/test_torch_shim.py', readFileSync('scripts/test_torch_shim.py', 'utf8'));
    const summary = String(await python.runPythonAsync(`
import contextlib, io, runpy, sys
sys.argv = ['/shim/scripts/test_torch_shim.py']
out = io.StringIO()
code = None
with contextlib.redirect_stdout(out):
    try:
        runpy.run_path('/shim/scripts/test_torch_shim.py', run_name='__main__')
    except SystemExit as exit:
        code = exit.code
f'exit={code}\\n' + out.getvalue()[-3000:]
`));
    expect(summary.startsWith('exit=0'), summary).toBe(true);
    expect(summary).toMatch(/checks passed, 0 failed/);
  });
});
