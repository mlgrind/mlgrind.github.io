import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sections } from '../data/sections';
import { getProblemsBySection } from '../data/problems';
import { useProgress } from '../context/ProgressContext';
import SEO from '../components/SEO/SEO';

export default function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { getProblemProgress, getSectionProgress } = useProgress();

  const section = sections.find(s => s.id === sectionId);
  const problems = sectionId ? getProblemsBySection(sectionId) : [];

  const [isIntroCollapsed, setIsIntroCollapsed] = useState(() => {
    if (!sectionId) return false;
    return localStorage.getItem(`section-intro-collapsed-${sectionId}`) === 'true';
  });

  // Reset collapse state when section changes
  useEffect(() => {
    if (sectionId) {
      const saved = localStorage.getItem(`section-intro-collapsed-${sectionId}`);
      setIsIntroCollapsed(saved === 'true');
    }
  }, [sectionId]);

  const toggleIntro = () => {
    const newValue = !isIntroCollapsed;
    setIsIntroCollapsed(newValue);
    if (sectionId) {
      localStorage.setItem(`section-intro-collapsed-${sectionId}`, String(newValue));
    }
  };

  if (!section) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-4">Section Not Found</h1>
        <Link to="/" className="text-primary-500 hover:text-primary-400">
          Return to Home
        </Link>
      </div>
    );
  }

  const progress = getSectionProgress(section.id, section.problems.length);

  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title={section.title}
        description={`${section.description} Learn ${section.title.toLowerCase()} with ${section.problems.length} hands-on coding problems.`}
        canonical={`/section/${section.id}`}
      />
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl flex items-center justify-center text-3xl">
            {section.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 tracking-tight">{section.title}</h1>
            <p className="text-gray-500 dark:text-dark-200">{section.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-500 rounded-full overflow-hidden">
            <div
              className="h-full progress-gradient transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-primary-600 dark:text-primary-300 font-medium font-mono text-sm">{progress}%</span>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-dark-500">
        <button
          onClick={toggleIntro}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Introduction</h2>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-dark-200 transition-transform duration-200 ${
              isIntroCollapsed ? '' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {!isIntroCollapsed && (
          <div className="prose prose-sm max-w-none mt-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-gray-900 dark:text-dark-100 mt-0 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mt-6 mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium text-gray-700 dark:text-dark-200 mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-600 dark:text-dark-200 mb-3 leading-relaxed">{children}</p>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-100 dark:bg-dark-900 rounded-lg p-4 overflow-x-auto my-3 text-sm text-gray-800 dark:text-dark-100">
                    {children}
                  </pre>
                ),
                code: ({ className, children }) => {
                  const isInline = !className && !String(children).includes('\n');
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 dark:bg-dark-600 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-300 text-sm">
                        {children}
                      </code>
                    );
                  }
                  return <code className="text-sm">{children}</code>;
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
                strong: ({ children }) => (
                  <strong className="text-gray-900 dark:text-dark-100 font-semibold">{children}</strong>
                ),
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
                tr: ({ children }) => <tr>{children}</tr>,
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
              {section.introduction}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Problems List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Problems</h2>
        <div className="space-y-3">
          {problems.map((problem, index) => {
            const problemProgress = getProblemProgress(section.id, problem.id);

            return (
              <Link
                key={problem.id}
                to={`/problem/${section.id}/${problem.id}`}
                className="flex items-center gap-4 bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-dark-500 hover:border-primary-400 dark:hover:border-primary-500/30 hover:shadow-sm transition-all group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    problemProgress.status === 'completed'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : problemProgress.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-dark-600 dark:text-dark-200'
                  }`}
                >
                  {problemProgress.status === 'completed' ? '✓' : index + 1}
                </div>

                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-dark-100 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                    {problem.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        problem.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : problem.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-gray-400 dark:text-dark-300 text-xs font-mono">
                      {problem.testCases.length} tests
                    </span>
                  </div>
                </div>

                <div className="text-gray-400 dark:text-dark-300 group-hover:text-primary-500 dark:group-hover:text-primary-300 transition-colors">
                  &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
