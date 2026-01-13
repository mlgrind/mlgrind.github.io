import { useState, useCallback, useRef, useEffect } from 'react';
import { TestCase, TestResult } from '../types';

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
  runPython: (code: string) => unknown;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInstance>;
  }
}

interface UsePyodideReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  output: string[];
  runCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  runTests: (code: string, testCases: TestCase[], functionName: string) => Promise<TestResult[]>;
  clearOutput: () => void;
}

export function usePyodide(): UsePyodideReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const pyodideRef = useRef<PyodideInstance | null>(null);
  const initializingRef = useRef(false);

  const appendOutput = useCallback((text: string) => {
    setOutput(prev => [...prev, text]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current || initializingRef.current) return;

    initializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Load Pyodide script if not already loaded
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide'));
          document.head.appendChild(script);
        });
      }

      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });

      // Set up stdout/stderr capture
      pyodide.setStdout({
        batched: (text: string) => {
          if (text.trim()) appendOutput(text);
        },
      });

      pyodide.setStderr({
        batched: (text: string) => {
          if (text.trim()) appendOutput(`[Error] ${text}`);
        },
      });

      // Load numpy - it's commonly needed
      await pyodide.loadPackage(['numpy']);

      pyodideRef.current = pyodide;
      setIsReady(true);
      appendOutput('Python environment ready with NumPy loaded.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize Python';
      setError(message);
      appendOutput(`[Error] ${message}`);
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  }, [appendOutput]);

  useEffect(() => {
    loadPyodide();
  }, [loadPyodide]);

  const runCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!pyodideRef.current) {
      return { success: false, error: 'Python environment not ready' };
    }

    try {
      clearOutput();
      await pyodideRef.current.runPythonAsync(code);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution error';
      appendOutput(`[Error] ${message}`);
      return { success: false, error: message };
    }
  }, [appendOutput, clearOutput]);

  const runTests = useCallback(async (
    code: string,
    testCases: TestCase[],
    functionName: string
  ): Promise<TestResult[]> => {
    if (!pyodideRef.current) {
      return testCases.map(tc => ({
        id: tc.id,
        passed: false,
        description: tc.description,
        expected: tc.expected,
        actual: 'Python environment not ready',
        hidden: tc.hidden,
      }));
    }

    const results: TestResult[] = [];
    clearOutput();

    try {
      // First, run the user's code to define the function
      await pyodideRef.current.runPythonAsync(code);

      // Run each test case
      for (const testCase of testCases) {
        try {
          const testCode = `
import numpy as np
import json

# Parse input
test_input = ${testCase.input}

# Call the function
if isinstance(test_input, list):
    result = ${functionName}(np.array(test_input))
elif isinstance(test_input, tuple):
    result = ${functionName}(*[np.array(x) if isinstance(x, list) else x for x in test_input])
else:
    result = ${functionName}(test_input)

# Convert result to string for comparison
if isinstance(result, np.ndarray):
    result_str = str(result.tolist())
elif isinstance(result, (list, dict)):
    result_str = json.dumps(result)
elif isinstance(result, float):
    result_str = str(round(result, 6))
else:
    result_str = str(result)
result_str
`;
          const result = await pyodideRef.current.runPythonAsync(testCode);
          const actualStr = String(result);

          // Normalize for comparison
          const normalizedExpected = testCase.expected.replace(/\s/g, '');
          const normalizedActual = actualStr.replace(/\s/g, '');

          const passed = normalizedExpected === normalizedActual;

          results.push({
            id: testCase.id,
            passed,
            description: testCase.description,
            expected: testCase.expected,
            actual: actualStr,
            hidden: testCase.hidden,
          });

          if (passed) {
            appendOutput(`Test ${testCase.id}: PASSED`);
          } else {
            appendOutput(`Test ${testCase.id}: FAILED - Expected ${testCase.expected}, got ${actualStr}`);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Test execution error';
          results.push({
            id: testCase.id,
            passed: false,
            description: testCase.description,
            expected: testCase.expected,
            actual: errorMsg,
            hidden: testCase.hidden,
          });
          appendOutput(`Test ${testCase.id}: ERROR - ${errorMsg}`);
        }
      }
    } catch (err) {
      // Error in user code
      const errorMsg = err instanceof Error ? err.message : 'Code execution error';
      appendOutput(`[Error] ${errorMsg}`);
      return testCases.map(tc => ({
        id: tc.id,
        passed: false,
        description: tc.description,
        expected: tc.expected,
        actual: errorMsg,
        hidden: tc.hidden,
      }));
    }

    return results;
  }, [appendOutput, clearOutput]);

  return {
    isLoading,
    isReady,
    error,
    output,
    runCode,
    runTests,
    clearOutput,
  };
}
