import { Example } from '../../types';

interface ExamplesProps {
  examples: Example[];
}

export default function Examples({ examples }: ExamplesProps) {
  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 dark:text-dark-100 mb-3">Examples</h3>
      <div className="space-y-4">
        {examples.map((example, index) => (
          <div key={index} className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-dark-500 shadow-sm">
            <div className="space-y-2">
              <div className="overflow-hidden">
                <span className="text-gray-500 dark:text-dark-200 text-sm">Input:</span>
                <pre className="mt-1 text-sm text-primary-600 dark:text-primary-300 font-mono whitespace-pre-wrap break-all">{example.input}</pre>
              </div>
              <div className="overflow-hidden">
                <span className="text-gray-500 dark:text-dark-200 text-sm">Output:</span>
                <pre className="mt-1 text-sm text-green-600 dark:text-green-400 font-mono whitespace-pre-wrap break-all">{example.output}</pre>
              </div>
              {example.explanation && (
                <div className="pt-2 border-t border-gray-200 dark:border-dark-500">
                  <span className="text-gray-500 dark:text-dark-200 text-sm">Explanation: </span>
                  <span className="text-gray-600 dark:text-dark-200 text-sm">{example.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
