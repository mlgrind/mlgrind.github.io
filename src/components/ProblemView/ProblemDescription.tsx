import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Problem } from '../../types';

interface ProblemDescriptionProps {
  problem: Problem;
}

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
  return (
    <div className="prose prose-sm max-w-none overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 m-0">{problem.title}</h1>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            problem.difficulty === 'easy'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : problem.difficulty === 'medium'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {problem.difficulty}
        </span>
      </div>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{children}</p>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-3">
                  <code className="text-sm text-gray-800 dark:text-gray-200">{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-primary-600 text-sm break-words">
                {children}
              </code>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 mb-3">{children}</ul>
          ),
          li: ({ children }) => <li className="text-gray-600 dark:text-gray-400">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr>{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-600 dark:text-gray-400">
              {children}
            </td>
          ),
        }}
      >
        {problem.description}
      </ReactMarkdown>
    </div>
  );
}
