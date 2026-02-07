import { useState } from 'react';

interface HintsProps {
  hints: string[];
  solution: string;
}

export default function Hints({ hints, solution }: HintsProps) {
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);

  const handleRevealHint = () => {
    if (revealedHints < hints.length) {
      setRevealedHints(prev => prev + 1);
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  return (
    <div className="space-y-4">
      {/* Hints Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900">Hints</h3>
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
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 flex-shrink-0">💡</span>
                  <span className="text-gray-700 text-sm break-words overflow-hidden">{hint}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm italic">
            Click "Show Hint" if you need help
          </div>
        )}
      </div>

      {/* Solution Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900">Solution</h3>
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
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
              <span className="text-sm text-gray-600">Solution Code</span>
            </div>
            <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto bg-gray-900">
              {solution}
            </pre>
          </div>
        ) : revealedHints < hints.length ? (
          <div className="text-gray-400 text-sm italic">
            Reveal all hints first to unlock the solution
          </div>
        ) : (
          <div className="text-gray-400 text-sm italic">
            Click "Reveal Solution" to see the answer
          </div>
        )}
      </div>
    </div>
  );
}
