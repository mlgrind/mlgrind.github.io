import { Link } from 'react-router-dom';
import { sections } from '../data/sections';
import { useProgress } from '../context/ProgressContext';
import SEO from '../components/SEO/SEO';

export default function HomePage() {
  const { getSectionProgress, getOverallProgress } = useProgress();

  const sectionInfo = sections.map(s => ({
    id: s.id,
    problemCount: s.problems.length,
  }));

  const overallProgress = getOverallProgress(sectionInfo);

  return (
    <div className="max-w-5xl mx-auto">
      <SEO canonical="/" />
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Learn ML By Building
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Practice hands-on machine learning coding problems. Run Python code directly in your
          browser with NumPy and scikit-learn support.
        </p>

        {/* Overall Progress */}
        <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-900 rounded-lg px-6 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
          <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-primary-600 dark:text-primary-400 font-medium">{overallProgress}%</span>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const progress = getSectionProgress(section.id, section.problems.length);

          return (
            <Link
              key={section.id}
              to={`/section/${section.id}`}
              className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">{index + 1}.</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    {section.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      {section.problems.length} problems
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">🐍</div>
          <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-2">Python in Browser</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Run Python code with NumPy, pandas, and more - no setup required.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-2">Instant Feedback</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Test your code against multiple test cases and see results immediately.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-2">Track Progress</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Your progress is saved locally. Pick up where you left off anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
