import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { sections } from '../data/sections';
import { getProblemsBySection } from '../data/problems';
import { useProgress } from '../context/ProgressContext';

export default function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { getProblemProgress, getSectionProgress } = useProgress();

  const section = sections.find(s => s.id === sectionId);
  const problems = sectionId ? getProblemsBySection(sectionId) : [];

  if (!section) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Section Not Found</h1>
        <Link to="/" className="text-primary-400 hover:text-primary-300">
          Return to Home
        </Link>
      </div>
    );
  }

  const progress = getSectionProgress(section.id, section.problems.length);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center text-3xl">
            {section.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{section.title}</h1>
            <p className="text-dark-400">{section.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-primary-400 font-medium">{progress}% complete</span>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-dark-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Introduction</h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-white mt-0 mb-4">{children}</h1>
              ),
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
                    <pre className="bg-dark-900 rounded-lg p-4 overflow-x-auto my-3">
                      <code className="text-sm text-dark-200">{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="bg-dark-900 px-1.5 py-0.5 rounded text-primary-400 text-sm">
                    {children}
                  </code>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-dark-300 space-y-1 mb-3">{children}</ul>
              ),
              li: ({ children }) => <li className="text-dark-300">{children}</li>,
              strong: ({ children }) => (
                <strong className="text-white font-semibold">{children}</strong>
              ),
            }}
          >
            {section.introduction}
          </ReactMarkdown>
        </div>
      </div>

      {/* Problems List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Problems</h2>
        <div className="space-y-3">
          {problems.map((problem, index) => {
            const problemProgress = getProblemProgress(section.id, problem.id);

            return (
              <Link
                key={problem.id}
                to={`/problem/${section.id}/${problem.id}`}
                className="flex items-center gap-4 bg-dark-800 rounded-lg p-4 border border-dark-700 hover:border-primary-500/50 transition-colors group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    problemProgress.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : problemProgress.status === 'in_progress'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-dark-700 text-dark-400'
                  }`}
                >
                  {problemProgress.status === 'completed' ? '✓' : index + 1}
                </div>

                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-primary-400 transition-colors">
                    {problem.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        problem.difficulty === 'easy'
                          ? 'bg-green-500/10 text-green-400'
                          : problem.difficulty === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-dark-500 text-xs">
                      {problem.testCases.length} test cases
                    </span>
                  </div>
                </div>

                <div className="text-dark-500 group-hover:text-primary-400 transition-colors">
                  →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
