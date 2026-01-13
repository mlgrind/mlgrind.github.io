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
    <div className="mt-6 space-y-4">
      {/* Hints Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-white">Hints</h3>
          {revealedHints < hints.length && (
            <button
              onClick={handleRevealHint}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
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
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500">💡</span>
                  <span className="text-dark-200 text-sm">{hint}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-dark-500 text-sm italic">
            Click "Show Hint" if you need help
          </div>
        )}
      </div>

      {/* Solution Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-white">Solution</h3>
          {!showSolution && revealedHints >= hints.length && (
            <button
              onClick={handleShowSolution}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Reveal Solution
            </button>
          )}
        </div>

        {showSolution ? (
          <div className="bg-dark-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-dark-700 border-b border-dark-600">
              <span className="text-sm text-dark-300">Solution Code</span>
            </div>
            <pre className="p-4 text-sm text-dark-200 font-mono overflow-x-auto">
              {solution}
            </pre>
          </div>
        ) : revealedHints < hints.length ? (
          <div className="text-dark-500 text-sm italic">
            Reveal all hints first to unlock the solution
          </div>
        ) : (
          <div className="text-dark-500 text-sm italic">
            Click "Reveal Solution" to see the answer
          </div>
        )}
      </div>
    </div>
  );
}
