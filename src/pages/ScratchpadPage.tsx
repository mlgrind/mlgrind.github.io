import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Split from 'react-split';
import { usePyodide } from '../hooks/usePyodide';
import { useDarkMode } from '../hooks/useDarkMode';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import Console from '../components/Console/Console';
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
  const { isLoading, isReady, output, runCode, clearOutput } = usePyodide();
  const { isDark } = useDarkMode();
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Load saved code or default
  useEffect(() => {
    const savedCode = localStorage.getItem(STORAGE_KEY);
    setCode(savedCode || DEFAULT_CODE);
  }, []);

  // Auto-save code
  useEffect(() => {
    if (code) {
      const timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, code);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
    clearOutput();
  }, [clearOutput]);

  const handleRunCode = useCallback(async () => {
    if (!isReady) return;

    setIsRunning(true);
    clearOutput();

    try {
      await runCode(code);
    } finally {
      setIsRunning(false);
    }
  }, [isReady, code, runCode, clearOutput]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -m-6">
      <SEO
        title="Python Scratchpad"
        description="Free Python playground with NumPy pre-loaded. Run Python code directly in your browser - no setup required. Practice machine learning code instantly."
        canonical="/scratchpad"
        keywords="Python playground, online Python, NumPy, code sandbox, ML practice, browser Python"
      />
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Python Scratchpad</span>
        </div>

        <div className="flex items-center gap-3">
          {!isReady && (
            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              {isLoading ? 'Loading Python...' : 'Python ready'}
            </span>
          )}
          {isReady && (
            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Python ready
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-gray-900">
        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCode}
              disabled={!isReady || isRunning}
              className="px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={clearOutput}
              className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Output
            </button>
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-sm">Code is auto-saved</span>
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
          <div className="overflow-auto p-4 bg-gray-50 dark:bg-gray-800">
            <Console output={output} isLoading={isRunning} />
          </div>
        </Split>
      </div>
    </div>
  );
}
