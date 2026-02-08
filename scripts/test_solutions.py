#!/usr/bin/env python3
"""
Test runner for ML Grind problems.
Runs each problem's solution against its test cases.
"""

import json
import re
import sys
import traceback
from pathlib import Path

import numpy as np


def extract_function_name(code: str) -> str:
    """Extract the main function name from the solution code."""
    # Look for function definitions, prefer the first non-helper one
    matches = re.findall(r'def\s+(\w+)\s*\(', code)
    if not matches:
        return None
    # Skip common helper functions
    helpers = {'sigmoid', 'relu', 'softmax', 'tanh'}
    for name in matches:
        if not name.startswith('_') and name not in helpers:
            return name
    # Fall back to first non-underscore function
    for name in matches:
        if not name.startswith('_'):
            return name
    return matches[0]


def normalize_for_comparison(s: str) -> str:
    """Normalize string for comparison by removing whitespace."""
    return re.sub(r'\s+', '', str(s))


def is_variable_based_test(test_input: str) -> bool:
    """Check if test input is a variable name rather than a direct value."""
    # Variable-based tests are identifiers like 'zeros_shape', 'matmul_check', etc.
    # They don't start with [ ( { and aren't pure numbers
    test_input = test_input.strip()
    if not test_input:
        return True
    # If it starts with common value characters, it's not a variable
    if test_input[0] in '[({\'"-0123456789':
        return False
    # If it looks like a Python expression with operators, it's not a simple variable
    if any(c in test_input for c in '+-*/=<>@'):
        return False
    # If it contains 'np.' it's an expression
    if 'np.' in test_input:
        return False
    # Otherwise it's likely a variable reference
    return True


def convert_numpy_types(obj):
    """Convert numpy types to native Python types for clean comparison."""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(x) for x in obj)
    elif isinstance(obj, list):
        return [convert_numpy_types(x) for x in obj]
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    return obj


def round_floats(obj, decimals=6):
    """Recursively round floats in nested structures."""
    if isinstance(obj, float):
        rounded = round(obj, decimals)
        # Format to avoid scientific notation for small numbers
        if abs(rounded) < 0.0001 and rounded != 0:
            return float(f"{rounded:.{decimals}f}")
        return rounded
    elif isinstance(obj, tuple):
        return tuple(round_floats(x, decimals) for x in obj)
    elif isinstance(obj, list):
        return [round_floats(x, decimals) for x in obj]
    elif isinstance(obj, dict):
        return {k: round_floats(v, decimals) for k, v in obj.items()}
    return obj


def format_float(f, decimals=6):
    """Format a float without scientific notation."""
    if f == 0:
        return "0.0"
    elif abs(f) < 0.0001:
        return f"{f:.{decimals}f}".rstrip('0').rstrip('.')
    else:
        return str(round(f, decimals))


def format_for_json(obj, decimals=6):
    """Recursively format objects for JSON, handling floats specially."""
    if isinstance(obj, float):
        rounded = round(obj, decimals)
        return rounded
    elif isinstance(obj, tuple):
        return [format_for_json(x, decimals) for x in obj]
    elif isinstance(obj, list):
        return [format_for_json(x, decimals) for x in obj]
    elif isinstance(obj, dict):
        return {k: format_for_json(v, decimals) for k, v in obj.items()}
    return obj


def format_result(result):
    """Format a result for string comparison."""
    # First convert numpy types
    result = convert_numpy_types(result)
    # Then round floats
    result = round_floats(result)

    if isinstance(result, (list, dict)):
        # Use custom JSON encoder for floats
        formatted = format_for_json(result)
        return json.dumps(formatted)
    elif isinstance(result, tuple):
        # Format tuple elements
        formatted = []
        for item in result:
            if isinstance(item, float):
                formatted.append(format_float(item))
            elif isinstance(item, list):
                formatted.append(json.dumps(format_for_json(item)))
            else:
                formatted.append(str(item))
        return "(" + ", ".join(formatted) + ")"
    elif isinstance(result, float):
        return format_float(result)
    else:
        return str(result)


def run_test_case(solution_code: str, function_name: str, test_case: dict) -> tuple[bool, str, str]:
    """
    Run a single test case against the solution.
    Returns (passed, expected, actual)
    """
    test_input = test_case['input']

    # Skip variable-based tests as they require additional setup
    if is_variable_based_test(test_input):
        return None, test_case['expected'], f"SKIPPED: Variable-based test '{test_input}'"

    # Create a fresh namespace for execution
    namespace = {'np': np, 'numpy': np, 'json': json}

    try:
        # Execute the solution code to define the function
        exec(solution_code, namespace)
    except Exception as e:
        return False, test_case['expected'], f"Solution execution error: {e}"

    if function_name not in namespace:
        return False, test_case['expected'], f"Function '{function_name}' not found in solution"

    func = namespace[function_name]

    try:
        # Evaluate the input in the namespace (so np.array works)
        parsed_input = eval(test_input, namespace)

        # Call the function with the appropriate argument structure
        if isinstance(parsed_input, list):
            result = func(np.array(parsed_input))
        elif isinstance(parsed_input, tuple):
            # Convert list elements to numpy arrays
            args = [np.array(x) if isinstance(x, list) else x for x in parsed_input]
            result = func(*args)
        else:
            result = func(parsed_input)

        # Format the result
        result_str = format_result(result)

        # Normalize and compare
        expected_normalized = normalize_for_comparison(test_case['expected'])
        actual_normalized = normalize_for_comparison(result_str)

        passed = expected_normalized == actual_normalized
        return passed, test_case['expected'], result_str

    except Exception as e:
        tb = traceback.format_exc()
        return False, test_case['expected'], f"Test execution error: {e}\n{tb}"


def run_problem_tests(problem: dict) -> tuple[int, int, int, list]:
    """
    Run all test cases for a problem.
    Returns (passed_count, failed_count, skipped_count, failures)
    """
    solution = problem['solution']
    test_cases = problem['testCases']

    function_name = extract_function_name(solution)
    if not function_name:
        return 0, len(test_cases), 0, [{"test_id": "all", "description": "N/A", "expected": "N/A", "actual": "Could not extract function name from solution"}]

    passed = 0
    failed = 0
    skipped = 0
    failures = []

    for tc in test_cases:
        success, expected, actual = run_test_case(solution, function_name, tc)
        if success is None:  # Skipped
            skipped += 1
        elif success:
            passed += 1
        else:
            failed += 1
            failures.append({
                'test_id': tc['id'],
                'description': tc['description'],
                'expected': expected,
                'actual': actual,
            })

    return passed, failed, skipped, failures


def main():
    # Load problems
    problems_path = Path(__file__).parent / 'problems.json'
    if not problems_path.exists():
        print(f"Error: {problems_path} not found. Run 'npx tsx scripts/export-problems.ts' first.")
        sys.exit(1)

    with open(problems_path) as f:
        problems = json.load(f)

    print(f"\n{'='*60}")
    print(f"ML Grind - Solution Test Runner")
    print(f"{'='*60}")
    print(f"Testing {len(problems)} problems...\n")

    total_problems = len(problems)
    problems_passed = 0
    problems_with_failures = []
    total_tests = 0
    total_passed = 0
    total_failed = 0
    total_skipped = 0

    for problem in problems:
        problem_id = problem['id']
        problem_title = problem['title']

        passed, failed, skipped, failures = run_problem_tests(problem)
        runnable = passed + failed
        total_tests += passed + failed + skipped
        total_passed += passed
        total_failed += failed
        total_skipped += skipped

        if failed == 0:
            if skipped > 0:
                status = "PASS*"  # All runnable tests passed, some skipped
            else:
                status = "PASS"
            problems_passed += 1
        else:
            status = "FAIL"
            problems_with_failures.append({
                'id': problem_id,
                'title': problem_title,
                'passed': passed,
                'failed': failed,
                'skipped': skipped,
                'failures': failures,
            })

        skip_str = f" ({skipped} skipped)" if skipped > 0 else ""
        print(f"[{status:5}] {problem_id}: {passed}/{runnable} tests passed{skip_str}")

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Problems: {problems_passed}/{total_problems} have all runnable tests passing")
    print(f"Tests: {total_passed} passed, {total_failed} failed, {total_skipped} skipped")
    print(f"Note: *PASS* means all runnable tests passed but some were skipped")

    if problems_with_failures:
        print(f"\n{'='*60}")
        print(f"FAILED PROBLEMS ({len(problems_with_failures)}):")
        print(f"{'='*60}")
        for p in problems_with_failures:
            print(f"\n{p['id']} ({p['title']}): {p['passed']}/{p['passed']+p['failed']} passed, {p['skipped']} skipped")
            for f in p['failures']:
                print(f"  Test {f['test_id']}: {f['description']}")
                expected_str = str(f['expected'])[:80]
                actual_str = str(f['actual'])[:80]
                print(f"    Expected: {expected_str}{'...' if len(str(f['expected'])) > 80 else ''}")
                print(f"    Actual:   {actual_str}{'...' if len(str(f['actual'])) > 80 else ''}")
        sys.exit(1)
    else:
        print("\nAll runnable tests passed!")
        sys.exit(0)


if __name__ == '__main__':
    main()
