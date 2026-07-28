import { describe, it, expect } from 'vitest';
import { formatPythonError } from '../hooks/usePyodide';

describe('formatPythonError', () => {
  it('strips Pyodide harness frames and keeps the exception', () => {
    const raw = [
      'Traceback (most recent call last):',
      '  File "/lib/python312.zip/_pyodide/_base.py", line 597, in eval_code_async',
      '    await CodeRunner(',
      '  File "/lib/python312.zip/_pyodide/_base.py", line 411, in run_async',
      '    coroutine = eval(self.code, globals, locals)',
      '  File "<exec>", line 6, in <module>',
      "TypeError: 'NoneType' object is not subscriptable",
    ].join('\n');

    expect(formatPythonError(raw)).toBe("TypeError: 'NoneType' object is not subscriptable");
  });

  it('keeps traceback frames that point at the learner\'s own code', () => {
    const raw = [
      'Traceback (most recent call last):',
      '  File "/lib/python312.zip/_pyodide/_base.py", line 597, in eval_code_async',
      '  File "my_solution.py", line 12, in layer_norm',
      '    return gamma * x / 0',
      'ZeroDivisionError: division by zero',
    ].join('\n');

    const out = formatPythonError(raw);
    expect(out).toContain('File "my_solution.py", line 12, in layer_norm');
    expect(out).toContain('ZeroDivisionError: division by zero');
    expect(out).not.toContain('_pyodide');
  });

  it('passes through a bare message unchanged', () => {
    expect(formatPythonError('NameError: name "x_t" is not defined')).toBe(
      'NameError: name "x_t" is not defined'
    );
  });

  it('falls back for an empty message', () => {
    expect(formatPythonError('')).toBe('Test execution error');
  });
});
