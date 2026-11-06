import type { TestCase } from "../types";

export function functionNameOf(starterCode: string): string {
  const matches = [...starterCode.matchAll(/def\s+(\w+)\s*\(/g)];
  return matches.length ? matches[matches.length - 1][1] : "solution";
}

// One harness is used by the worker and the reference-solution tests. Code and
// test inputs are JSON-encoded data, never interpolated as Python source.
export function testProgram(
  code: string,
  tests: TestCase[],
  functionName: string,
): string {
  return `
import ast as _ast, json as _json, math as _math
import numpy as _np

def _plain(value):
    if isinstance(value, _np.ndarray):
        return _plain(value.tolist())
    if isinstance(value, _np.generic):
        return value.item()
    if isinstance(value, dict):
        return {k: _plain(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return type(value)(_plain(v) for v in value)
    return value

def _equal(actual, expected):
    if isinstance(actual, bool) or isinstance(expected, bool):
        return type(actual) is type(expected) and actual == expected
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
        return _math.isclose(actual, expected, rel_tol=1e-5, abs_tol=1e-6)
    if isinstance(actual, dict) and isinstance(expected, dict):
        return actual.keys() == expected.keys() and all(_equal(actual[k], expected[k]) for k in actual)
    if isinstance(actual, (list, tuple)) and isinstance(expected, (list, tuple)):
        return len(actual) == len(expected) and all(_equal(a, b) for a, b in zip(actual, expected))
    return type(actual) is type(expected) and actual == expected

def _run_submission(payload):
    ns = {'np': _np, 'numpy': _np, '__name__': '__main__'}
    results = []
    try:
        exec(compile(payload['code'], '<solution>', 'exec'), ns)
    except Exception as error:
        return [{**test, 'passed': False, 'actual': f'{type(error).__name__}: {error}'} for test in payload['tests']]
    for test in payload['tests']:
        try:
            expression = test['input'].strip()
            tree = _ast.parse(expression, mode='eval').body
            # Lists, tuples and numeric literals describe function arguments;
            # calls, indexing, comparisons and lambdas are complete expressions.
            arguments = isinstance(tree, (_ast.List, _ast.Tuple, _ast.Constant)) or (isinstance(tree, _ast.UnaryOp) and isinstance(tree.op, (_ast.UAdd, _ast.USub)))
            value = eval(compile(expression, '<test>', 'eval'), ns)
            if arguments:
                fn = ns[payload['functionName']]
                if isinstance(value, tuple):
                    actual = fn(*[_np.array(v) if isinstance(v, list) else v for v in value])
                elif isinstance(value, list):
                    actual = fn(_np.array(value))
                else:
                    actual = fn(value)
            else:
                actual = value
            actual = _plain(actual)
            try:
                expected = _ast.literal_eval(test['expected'])
                passed = _equal(actual, expected)
            except (ValueError, SyntaxError):
                passed = str(actual).strip() == test['expected'].strip()
            results.append({**test, 'passed': bool(passed), 'actual': str(actual)})
        except Exception as error:
            results.append({**test, 'passed': False, 'actual': f'{type(error).__name__}: {error}'})
    return results

_json.dumps(_run_submission(_json.loads(${JSON.stringify(JSON.stringify({ code, tests, functionName }))})))
`;
}
