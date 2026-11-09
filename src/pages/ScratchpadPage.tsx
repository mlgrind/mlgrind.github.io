import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Split from 'react-split';
import { usePyodide } from '../hooks/usePyodide';
import { useDarkMode } from '../hooks/useDarkMode';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import Console from '../components/Console/Console';
import { readStorage, writeStorage } from '../lib/storage';
import SEO from '../components/SEO/SEO';

const STORAGE_KEY = 'ml-interview-scratchpad';

const DEFAULT_CODE = `import numpy as np

# Try out your code here!
# NumPy is already loaded and ready to use.

arr = np.array([1, 2, 3, 4, 5])
print(f"Array: {arr}")
print(f"Sum: {np.sum(arr)}")
print(f"Mean: {np.mean(arr)}")
`;

export default function ScratchpadPage() {
  const { isLoading, isReady, output, runCode, clearOutput, stop, error, retry } = usePyodide();
  const { isDark } = useDarkMode();
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Load saved code or default
  useEffect(() => {
    const savedCode = readStorage(STORAGE_KEY);
    setCode(savedCode ?? DEFAULT_CODE);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    writeStorage(STORAGE_KEY, newCode);
  }, []);

  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
    writeStorage(STORAGE_KEY, DEFAULT_CODE);
    clearOutput();
  }, [clearOutput]);

  const handleRunCode = useCallback(async () => {
    if (!isReady || isRunning) return;

    setIsRunning(true);
    clearOutput();

    try {
      await runCode(code);
    } finally {
      setIsRunning(false);
    }
  }, [isReady, code, runCode, clearOutput, isRunning]);

  return (
    <div className="h-full min-h-0 flex flex-col -m-6">
      <SEO
        title="Python Scratchpad"
        description="Free Python playground with NumPy pre-loaded. Run Python code directly in your browser - no setup required. Practice machine learning code instantly."
        canonical="/scratchpad"
        keywords="Python playground, online Python, NumPy, code sandbox, ML practice, browser Python"
      />
      {error && <div role="alert" className="p-3 text-red-600">{error} <button className="underline" onClick={() => retry()}>Retry Python</button></div>}
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-500">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-gray-500 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-300 dark:text-dark-500">/</span>
          <h1 className="text-base text-gray-900 dark:text-dark-100 font-medium">Python Scratchpad</h1>
        </div>

        <div className="flex items-center gap-3">
          {!isReady && (
            <span className="text-gray-500 dark:text-dark-200 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              {isLoading ? 'Loading Python...' : 'Python unavailable'}
            </span>
          )}
          {isReady && (
            <span className="text-gray-500 dark:text-dark-200 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full" />
              Python ready
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-dark-800">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-500">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunCode}
              disabled={!isReady || isRunning}
              className="whitespace-nowrap px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            {isRunning && (
              <button
                type="button"
                onClick={() => stop()}
                aria-label="Stop execution"
                title="Stop execution (runs stop automatically after 30 seconds)"
                className="whitespace-nowrap px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Stop
              </button>
            )}
            <button
              onClick={handleReset}
              className="whitespace-nowrap px-4 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={clearOutput}
              className="whitespace-nowrap px-4 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
            >
              Clear Output
            </button>
          </div>
          <span className="hidden sm:inline text-gray-500 dark:text-dark-300 text-sm">Code is auto-saved</span>
        </div>

        {/* Editor and Console */}
        <Split
          className="flex-1 overflow-hidden"
          direction="vertical"
          sizes={[60, 40]}
          minSize={100}
          gutterSize={8}
        >
          {/* Code Editor */}
          <div className="h-full overflow-hidden p-4">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              height="100%"
              darkMode={isDark}
            />
          </div>

          {/* Console */}
          <div className="overflow-auto p-4 bg-gray-50 dark:bg-dark-900">
            <Console output={output} isLoading={isRunning} />
          </div>
        </Split>
      </div>
    </div>
  );
}
