import { useState, useCallback, useRef, useEffect } from "react";
import type { Language, TestCase, TestResult } from "../types";
import { testProgram } from "../lib/pythonProgram";
import { formatPythonError } from "../lib/pythonError";
export { formatPythonError } from "../lib/pythonError";

export const EXECUTION_TIMEOUT_MS = 30_000;
const INITIALIZATION_TIMEOUT_MS = 90_000;
const OUTPUT_LIMIT = 500;

type Pending = {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const worker = useRef<Worker | null>(null);
  const pending = useRef<Pending | null>(null);
  const nextId = useRef(0);
  const initializationTimer = useRef<ReturnType<typeof setTimeout>>();
  const appendOutput = useCallback((text: string) => {
    setOutput((previous) => [
      ...previous.slice(-(OUTPUT_LIMIT - 1)),
      text.slice(0, 4000),
    ]);
  }, []);
  const clearOutput = useCallback(() => setOutput([]), []);

  const start = useCallback(() => {
    worker.current?.terminate();
    clearTimeout(initializationTimer.current);
    setIsReady(false);
    setIsLoading(true);
    setError(null);
    const instance = new Worker(`${import.meta.env.BASE_URL}python-worker.js`);
    worker.current = instance;
    const loadingTimer = setTimeout(() => {
      instance.terminate();
      setIsLoading(false);
      setError(
        "Python took too long to load. Check your connection and retry.",
      );
    }, INITIALIZATION_TIMEOUT_MS);
    initializationTimer.current = loadingTimer;
    const fail = (message: string) => {
      if (worker.current !== instance) return;
      clearTimeout(loadingTimer);
      setIsLoading(false);
      setIsReady(false);
      setError(message);
      const current = pending.current;
      pending.current = null;
      if (current) {
        clearTimeout(current.timer);
        current.reject(new Error(message));
      }
    };
    instance.onerror = () =>
      fail("Could not load Python. Check your connection and retry.");
    instance.onmessage = ({ data }) => {
      if (worker.current !== instance) return;
      if (data.type === "ready") {
        clearTimeout(loadingTimer);
        setIsLoading(false);
        setIsReady(true);
        appendOutput(
          "Python ready with NumPy. Runs stop automatically after 30 seconds.",
        );
      } else if (data.type === "output") {
        appendOutput(data.text);
      } else if (data.id && data.id === nextId.current) {
        const current = pending.current;
        pending.current = null;
        if (!current) return;
        clearTimeout(current.timer);
        if (data.type === "error")
          current.reject(new Error(formatPythonError(data.error)));
        else current.resolve(data.result ?? "");
      } else if (data.type === "error") fail(formatPythonError(data.error));
    };
    return () => clearTimeout(loadingTimer);
  }, [appendOutput]);

  useEffect(() => {
    const cleanup = start();
    return () => {
      cleanup();
      clearTimeout(initializationTimer.current);
      worker.current?.terminate();
      if (pending.current) {
        clearTimeout(pending.current.timer);
        pending.current.reject(new Error("Execution stopped."));
        pending.current = null;
      }
    };
  }, [start]);

  const stop = useCallback(
    (message = "Execution stopped.") => {
      const current = pending.current;
      if (!current) return;
      pending.current = null;
      if (current) {
        clearTimeout(current.timer);
        current.reject(new Error(message));
      }
      appendOutput(message);
      start();
    },
    [appendOutput, start],
  );

  const execute = useCallback(
    (
      program: string,
      tests = false,
      language: Language = "numpy",
    ): Promise<string> => {
      if (!worker.current || !isReady)
        return Promise.reject(new Error("Python is not ready."));
      if (pending.current)
        return Promise.reject(new Error("Another run is already in progress."));
      clearOutput();
      return new Promise((resolve, reject) => {
        const id = ++nextId.current;
        const timer = setTimeout(
          () => stop("Execution timed out after 30 seconds."),
          EXECUTION_TIMEOUT_MS,
        );
        pending.current = { resolve, reject, timer };
        worker.current!.postMessage({ id, program, tests, language });
      });
    },
    [isReady, clearOutput, stop],
  );

  const runCode = useCallback(
    async (code: string) => {
      try {
        await execute(code);
        return { success: true };
      } catch (reason) {
        const message =
          reason instanceof Error ? reason.message : "Execution failed";
        appendOutput(`[Error] ${message}`);
        return { success: false, error: message };
      }
    },
    [execute, appendOutput],
  );

  const runTests = useCallback(
    async (
      code: string,
      tests: TestCase[],
      functionName: string,
      language: Language = "numpy",
    ): Promise<TestResult[]> => {
      try {
        const results: TestResult[] = JSON.parse(
          await execute(
            testProgram(code, tests, functionName, language),
            true,
            language,
          ),
        );
        results.forEach((result) =>
          appendOutput(
            `Test ${result.id}: ${result.passed ? "PASSED" : "FAILED"}`,
          ),
        );
        return results;
      } catch (reason) {
        const message =
          reason instanceof Error ? reason.message : "Execution failed";
        appendOutput(`[Error] ${message}`);
        return tests.map((test) => ({
          ...test,
          passed: false,
          actual: message,
        }));
      }
    },
    [execute, appendOutput],
  );

  return {
    isLoading,
    isReady,
    error,
    output,
    runCode,
    runTests,
    clearOutput,
    stop,
    retry: start,
  };
}
