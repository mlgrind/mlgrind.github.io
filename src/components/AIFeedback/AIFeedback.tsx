import ReactMarkdown from 'react-markdown';

interface AIFeedbackProps {
  feedback: string | null;
  isLoading: boolean;
  error: string | null;
  onRequest: () => void;
  hasTestResults: boolean;
}

export default function AIFeedback({ feedback, isLoading, error, onRequest, hasTestResults }: AIFeedbackProps) {
  if (!hasTestResults && !feedback && !isLoading && !error) {
    return (
      <div className="p-4 font-mono text-sm text-dark-300 italic">
        Run your tests first, then click this tab to get AI feedback.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 font-mono text-sm bg-dark-900 min-h-full">
      {isLoading && (
        <div className="flex items-center gap-3 text-dark-200">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          Analyzing your code...
        </div>
      )}

      {error && (
        <div className="space-y-2">
          <div className="text-red-400">
            {error}
          </div>
          <button
            onClick={onRequest}
            className="px-3 py-1.5 bg-dark-600 text-dark-200 text-sm rounded-lg hover:bg-dark-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {feedback && (
        <div className="space-y-2">
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <h3 className="text-xs uppercase tracking-wider text-purple-400 border-b border-dark-600 pb-1 mt-4 mb-2 first:mt-0">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-dark-200 my-1.5 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 text-dark-200 space-y-1 my-1.5">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="text-dark-200">{children}</li>
              ),
              code: ({ children }) => (
                <code className="text-purple-400 bg-purple-900/20 px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
              strong: ({ children }) => (
                <strong className="text-dark-100 font-semibold">{children}</strong>
              ),
            }}
          >
            {feedback}
          </ReactMarkdown>
          <button
            onClick={onRequest}
            className="mt-3 px-3 py-1.5 bg-dark-600 text-dark-200 text-sm rounded-lg hover:bg-dark-500 transition-colors"
          >
            Refresh Feedback
          </button>
        </div>
      )}
    </div>
  );
}
