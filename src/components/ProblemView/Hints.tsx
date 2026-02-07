import { useState } from 'react';

interface HintsProps {
  hints: string[];
  solution: string;
  onLoadToEditor?: (code: string) => void;
}

export default function Hints({ hints, solution, onLoadToEditor }: HintsProps) {
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRevealHint = () => {
    if (revealedHints < hints.length) {
      setRevealedHints(prev => prev + 1);
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = solution;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadToEditor = () => {
    if (onLoadToEditor) {
      onLoadToEditor(solution);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hints Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Hints</h3>
          {revealedHints < hints.length && (
            <button
              onClick={handleRevealHint}
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
            >
              Show Hint ({revealedHints}/{hints.length})
            </button>
          )}
        </div>

        {revealedHints > 0 ? (
          <div className="space-y-2">
            {hints.slice(0, revealedHints).map((hint, index) => (
              <div
                key={index}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 flex-shrink-0">💡</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm break-words overflow-hidden">{hint}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-sm italic">
            Click "Show Hint" if you need help
          </div>
        )}
      </div>

      {/* Solution Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Solution</h3>
          {!showSolution && revealedHints >= hints.length && (
            <button
              onClick={handleShowSolution}
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
            >
              Reveal Solution
            </button>
          )}
        </div>

        {showSolution ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Solution Code</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                {onLoadToEditor && (
                  <button
                    onClick={handleLoadToEditor}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                  >
                    Load into Editor
                  </button>
                )}
              </div>
            </div>
            <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto bg-gray-900">
              {solution}
            </pre>
          </div>
        ) : revealedHints < hints.length ? (
          <div className="text-gray-400 dark:text-gray-500 text-sm italic">
            Reveal all hints first to unlock the solution
          </div>
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-sm italic">
            Click "Reveal Solution" to see the answer
          </div>
        )}
      </div>
    </div>
  );
}
