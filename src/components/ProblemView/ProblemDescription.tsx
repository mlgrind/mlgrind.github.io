import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Problem } from '../../types';
import { stripRepeatedTitle } from '../../lib/problemTitle';
import DifficultyBadge from './DifficultyBadge';

interface ProblemDescriptionProps {
  problem: Problem;
  /** The page shows the title (and difficulty) itself; skip them here. */
  hideTitle?: boolean;
}

export default function ProblemDescription({ problem, hideTitle = false }: ProblemDescriptionProps) {
  return (
    <div className="prose prose-sm max-w-none overflow-hidden">
      {!hideTitle && <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-dark-100 m-0">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-700 dark:text-dark-200 mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-600 dark:text-dark-200 mb-3 leading-relaxed">{children}</p>
          ),
          // Fenced blocks render as <pre><code>. A fence without a language has
          // no `language-` class, so a newline in the content also marks a block.
          pre: ({ children }) => (
            <pre className="bg-gray-100 dark:bg-dark-900 rounded-lg p-4 my-3 whitespace-pre-wrap [overflow-wrap:anywhere]">{children}</pre>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-') || String(children ?? '').includes('\n');
            if (isBlock) {
              return <code className="text-sm text-gray-800 dark:text-dark-100">{children}</code>;
            }
            return (
              <code className="bg-gray-100 dark:bg-dark-600 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-300 text-sm break-words">
                {children}
              </code>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 text-gray-600 dark:text-dark-200 space-y-1 mb-3">{children}</ul>
          ),
          ol: ({ children, start }) => (
            <ol
              start={start}
              className="list-decimal list-outside pl-5 text-gray-600 dark:text-dark-200 space-y-1 mb-3"
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-gray-600 dark:text-dark-200">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-dark-500 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100 dark:bg-dark-600">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-dark-500">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr>{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-dark-500 px-3 py-2 text-left font-semibold text-gray-700 dark:text-dark-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-dark-500 px-3 py-2 text-gray-600 dark:text-dark-200">
              {children}
            </td>
          ),
        }}
      >
        {stripRepeatedTitle(problem.description, problem.title)}
      </ReactMarkdown>
    </div>
  );
}
