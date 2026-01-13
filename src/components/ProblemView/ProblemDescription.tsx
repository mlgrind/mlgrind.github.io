import ReactMarkdown from 'react-markdown';
import { Problem } from '../../types';

interface ProblemDescriptionProps {
  problem: Problem;
}

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold text-white m-0">{problem.title}</h1>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            problem.difficulty === 'easy'
              ? 'bg-green-500/20 text-green-400'
              : problem.difficulty === 'medium'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {problem.difficulty}
        </span>
      </div>

      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-white mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-dark-200 mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-dark-300 mb-3 leading-relaxed">{children}</p>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-dark-800 rounded-lg p-4 overflow-x-auto my-3">
                  <code className="text-sm text-dark-200">{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-dark-800 px-1.5 py-0.5 rounded text-primary-400 text-sm">
                {children}
              </code>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-dark-300 space-y-1 mb-3">{children}</ul>
          ),
          li: ({ children }) => <li className="text-dark-300">{children}</li>,
        }}
      >
        {problem.description}
      </ReactMarkdown>
    </div>
  );
}
