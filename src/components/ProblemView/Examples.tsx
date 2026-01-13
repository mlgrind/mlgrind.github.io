import { Example } from '../../types';

interface ExamplesProps {
  examples: Example[];
}

export default function Examples({ examples }: ExamplesProps) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-medium text-white mb-3">Examples</h3>
      <div className="space-y-4">
        {examples.map((example, index) => (
          <div key={index} className="bg-dark-800 rounded-lg p-4">
            <div className="space-y-2">
              <div>
                <span className="text-dark-400 text-sm">Input:</span>
                <pre className="mt-1 text-sm text-primary-400 font-mono">{example.input}</pre>
              </div>
              <div>
                <span className="text-dark-400 text-sm">Output:</span>
                <pre className="mt-1 text-sm text-green-400 font-mono">{example.output}</pre>
              </div>
              {example.explanation && (
                <div className="pt-2 border-t border-dark-700">
                  <span className="text-dark-400 text-sm">Explanation: </span>
                  <span className="text-dark-300 text-sm">{example.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
