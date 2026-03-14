import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { sections } from '../data/sections';
import { useProgress } from '../context/ProgressContext';
import SEO from '../components/SEO/SEO';
import Dashboard from '../components/Dashboard/Dashboard';

export default function HomePage() {
  const { getSectionProgress, getOverallProgress } = useProgress();

  const sectionInfo = sections.map(s => ({
    id: s.id,
    problemCount: s.problems.length,
  }));

  const overallProgress = getOverallProgress(sectionInfo);

  const totalProblems = useMemo(() =>
    sections.reduce((sum, s) => sum + s.problems.length, 0),
    []
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      <SEO canonical="/" />

      {/* Hero Section */}
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-500 rounded-full text-sm text-gray-600 dark:text-dark-200 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-dot" />
          100% browser-based &middot; No setup required
        </div>

        <h1 className="font-display text-[clamp(2.5rem,6vw,4.2rem)] font-normal leading-[1.1] tracking-tight text-gray-900 dark:text-dark-100 mb-6 animate-fade-up [animation-delay:0.1s]">
          Learn Machine Learning<br />by <em className="text-primary-400 dark:text-primary-300">Building</em>
        </h1>

        <p className="text-lg text-gray-500 dark:text-dark-200 max-w-[560px] mx-auto mb-10 font-light leading-relaxed animate-fade-up [animation-delay:0.2s]">
          Implement algorithms from scratch — NumPy, neural networks, transformers,
          diffusion models. Write real Python with instant feedback, directly in your browser.
        </p>

        <div className="flex justify-center gap-12 animate-fade-up [animation-delay:0.3s]">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-gray-900 dark:text-dark-100">{totalProblems}+</div>
            <div className="text-[11px] text-gray-400 dark:text-dark-300 uppercase tracking-widest mt-1">Problems</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-gray-900 dark:text-dark-100">{sections.length}</div>
            <div className="text-[11px] text-gray-400 dark:text-dark-300 uppercase tracking-widest mt-1">Sections</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-gray-900 dark:text-dark-100">{overallProgress}%</div>
            <div className="text-[11px] text-gray-400 dark:text-dark-300 uppercase tracking-widest mt-1">Complete</div>
          </div>
        </div>
      </div>

      {/* Dashboard — only renders when user has progress */}
      <Dashboard />

      {/* Curriculum Label */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-dark-300 mb-6 font-mono">
        Curriculum
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, index) => {
          const progress = getSectionProgress(section.id, section.problems.length);

          return (
            <Link
              key={section.id}
              to={`/section/${section.id}`}
              className="card-stagger animate-fade-up group relative flex gap-4 p-5 bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500 hover:border-gray-300 dark:hover:border-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-250 overflow-hidden"
            >
              {/* Hover glow overlay */}
              <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="shrink-0 w-11 h-11 bg-gray-100 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-[10px] flex items-center justify-center text-[22px] group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 group-hover:border-primary-200 dark:group-hover:border-primary-500/25 transition-all relative z-[1]">
                {section.icon}
              </div>

              <div className="flex-1 min-w-0 relative z-[1]">
                <div className="font-mono text-[11px] text-gray-400 dark:text-dark-300 mb-0.5">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-dark-100 tracking-tight mb-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                  {section.title}
                </div>
                <div className="text-[13px] text-gray-500 dark:text-dark-300 leading-relaxed mb-3.5">
                  {section.description}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-gray-400 dark:text-dark-300">
                    {section.problems.length} problems
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-[60px] h-[3px] bg-gray-200 dark:bg-dark-500 rounded-full overflow-hidden">
                      <div
                        className="h-full progress-gradient rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-gray-400 dark:text-dark-300">{progress}%</span>
                  </div>
                </div>
              </div>

              {/* Hover arrow */}
              <span className="absolute right-5 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 text-primary-500 dark:text-primary-300 text-lg group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-250">
                &rarr;
              </span>
            </Link>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="mt-16 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 dark:bg-dark-500 border border-gray-200 dark:border-dark-500 rounded-[14px] overflow-hidden">
          <div className="bg-white dark:bg-dark-800 p-8 text-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl flex items-center justify-center text-[22px]">
              🐍
            </div>
            <div className="font-semibold text-sm text-gray-900 dark:text-dark-100 tracking-tight mb-2">Python in Browser</div>
            <div className="text-[13px] text-gray-500 dark:text-dark-300 leading-relaxed">
              Full Python runtime with NumPy, pandas, and scikit-learn. No install, no config.
            </div>
          </div>
          <div className="bg-white dark:bg-dark-800 p-8 text-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl flex items-center justify-center text-[22px]">
              ✅
            </div>
            <div className="font-semibold text-sm text-gray-900 dark:text-dark-100 tracking-tight mb-2">Instant Feedback</div>
            <div className="text-[13px] text-gray-500 dark:text-dark-300 leading-relaxed">
              Run your code against test suites and see results immediately.
            </div>
          </div>
          <div className="bg-white dark:bg-dark-800 p-8 text-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl flex items-center justify-center text-[22px]">
              💾
            </div>
            <div className="font-semibold text-sm text-gray-900 dark:text-dark-100 tracking-tight mb-2">Progress Saved Locally</div>
            <div className="text-[13px] text-gray-500 dark:text-dark-300 leading-relaxed">
              Your code and progress persist in your browser. Pick up anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
