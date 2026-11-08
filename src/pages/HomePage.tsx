import { Link } from 'react-router-dom';
import { sections } from '../data/sections';
import { useProgress } from '../context/ProgressContext';
import SEO from '../components/SEO/SEO';
import { learningPaths, problemHref, sevenDayChallenge } from '../data/learningPaths';
import { getProblemById } from '../data/problems';
import { resolvedGroups, completedInSection } from '../data/curriculum';
import Dashboard from '../components/Dashboard/Dashboard';
import MenuButton from '../components/Menu/MenuButton';

const totalProblems = sections.reduce((sum, s) => sum + s.problems.length, 0);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function HomePage() {
  const { progress } = useProgress();

  const recent = Object.entries(progress).flatMap(([section, entries]) =>
    Object.entries(entries).map(([id, entry]) => ({ section, id, ...entry }))
  ).filter(entry => entry.status === 'in_progress' && getProblemById(entry.id)?.section === entry.section)
    .sort((a, b) => (b.lastAttempt ?? '').localeCompare(a.lastAttempt ?? ''))[0];

  return (
    <div className="max-w-[1200px] mx-auto">
      <SEO canonical="/" />

      {/* Hero */}
      <section className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 pt-4 sm:pt-8 pb-8 sm:pb-10 mb-8 sm:mb-10 border-b border-gray-200 dark:border-dark-500">
        <div className="flex-[1_1_520px] min-w-0">
          <p className="mb-3 font-mono text-[11px] sm:text-xs tracking-[0.08em] uppercase text-gray-500 dark:text-dark-300 animate-fade-up">
            {totalProblems} problems &middot; NumPy or PyTorch &middot; Runs in your browser
          </p>
          <h1 className="font-display text-[clamp(2.25rem,5.5vw,4rem)] font-normal leading-[1.05] tracking-tight text-gray-900 dark:text-dark-100 animate-fade-up [animation-delay:0.1s]">
            Learn Machine Learning by <em className="text-primary-400 dark:text-primary-300">Building</em>
          </h1>
          <p className="mt-4 max-w-[560px] text-base sm:text-lg text-gray-500 dark:text-dark-200 font-light leading-relaxed animate-fade-up [animation-delay:0.2s]">
            Implement algorithms from scratch — NumPy, neural networks, transformers,
            diffusion models. Write real Python with instant feedback, no setup or signup.
          </p>
        </div>
        <div className="flex flex-col gap-2 animate-fade-up [animation-delay:0.3s]">
          <div className="flex flex-wrap gap-3">
            {recent ? (
              <Link
                to={problemHref(recent.id)}
                className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                Continue: {getProblemById(recent.id)!.title} →
              </Link>
            ) : (
              <Link
                to={problemHref('numpy-array-sum')}
                className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                Solve your first problem →
              </Link>
            )}
            <MenuButton
              label="Learning paths"
              align="right"
              buttonClassName="inline-flex items-center gap-2 h-full px-5 py-3 rounded-xl border border-gray-300 dark:border-dark-500 text-gray-800 dark:text-dark-100 hover:border-primary-400 aria-expanded:border-primary-400 transition-colors"
              trigger={
                <>
                  Learning paths
                  <svg className="w-3.5 h-3.5 text-gray-400 dark:text-dark-300" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M3 4.5L6 7.5l3-3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              }
            >
              {close => (
                <div className="w-[min(22rem,calc(100vw-2rem))]">
                  {[...learningPaths, sevenDayChallenge].map(path => (
                    <Link
                      key={path.id}
                      role="menuitem"
                      to={path.id === sevenDayChallenge.id ? '/challenge' : `/learn/${path.id}`}
                      onClick={close}
                      className="block px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-dark-600 focus:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-dark-600 transition-colors"
                    >
                      <span className="block text-sm font-semibold text-gray-900 dark:text-dark-100">{path.title}</span>
                      <span className="block mt-0.5 text-xs text-gray-500 dark:text-dark-200">{path.description}</span>
                      <span className="block mt-1 text-[11px] text-primary-500">{path.minutes} min · {path.prerequisites}</span>
                    </Link>
                  ))}
                </div>
              )}
            </MenuButton>
          </div>
          {!recent && (
            <p className="text-xs text-gray-500 dark:text-dark-300">Start with array sum · About 5 minutes · Basic Python</p>
          )}
        </div>
      </section>

      {/* Dashboard — only renders when user has progress */}
      <Dashboard />

      {/* Curriculum, grouped */}
      <section aria-labelledby="curriculum-heading" className="mb-8">
        <h2 id="curriculum-heading" className="sr-only">Curriculum</h2>
        <div className="flex flex-col gap-8 sm:gap-9">
          {resolvedGroups.map((group, groupIndex) => {
            const groupTotal = group.sections.reduce((sum, sec) => sum + sec.problems.length, 0);
            return (
              <div
                key={group.id}
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-3 lg:gap-6 items-start"
              >
                <div>
                  <p className="font-mono text-xs text-gray-400 dark:text-dark-300">{String(groupIndex + 1).padStart(2, '0')}</p>
                  <h3 className="mt-0.5 mb-1 text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-dark-100">{group.title}</h3>
                  <p className="text-[13px] text-gray-500 dark:text-dark-300">
                    {plural(group.sections.length, 'section')} &middot; {plural(groupTotal, 'problem')}
                  </p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
                  {group.sections.map(section => {
                    const done = completedInSection(progress, section);
                    const total = section.problems.length;
                    return (
                      <Link
                        key={section.id}
                        to={`/section/${section.id}`}
                        className="group flex flex-col gap-1.5 px-4 py-3.5 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-500 hover:border-primary-300 dark:hover:border-primary-500/40 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-[15px] font-medium leading-snug text-gray-900 dark:text-dark-100 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                            {section.title}
                          </span>
                          <span
                            className={`shrink-0 mt-0.5 font-mono text-xs ${
                              done > 0 ? 'text-primary-600 dark:text-primary-300' : 'text-gray-400 dark:text-dark-300'
                            }`}
                            aria-label={`${done} of ${total} problems solved`}
                          >
                            {done}/{total}
                          </span>
                        </span>
                        <span className="text-[13px] leading-snug text-gray-500 dark:text-dark-300 line-clamp-2" title={section.description}>
                          {section.description}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
