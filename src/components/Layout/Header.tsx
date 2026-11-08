import { Link, useLocation } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sections } from '../../data/sections';
import { completedInSection } from '../../data/curriculum';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useFlashCards } from '../../hooks/useFlashCards';
import UserMenu from '../Auth/UserMenu';
import { ToolsMenu } from './Tools';

interface HeaderProps {
  onMenuToggle?: () => void;
  /** Whether the curriculum drawer is open (for aria-expanded). */
  isMenuOpen?: boolean;
  /** Show the menu button on desktop too (pages without the docked sidebar). */
  menuOnDesktop?: boolean;
  onOpenFeedback: () => void;
}

export default function Header({ onMenuToggle, isMenuOpen = false, menuOnDesktop = false, onOpenFeedback }: HeaderProps) {
  const { progress } = useProgress();
  const { isDark, toggle } = useDarkMode();
  const { getDueCount } = useFlashCards();
  const flashDueCount = getDueCount();
  const { pathname } = useLocation();

  const totalProblems = sections.reduce((sum, s) => sum + s.problems.length, 0);
  const solvedProblems = sections.reduce((sum, s) => sum + completedInSection(progress, s), 0);
  const overallProgress = totalProblems ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  // On problem pages the header carries the breadcrumb (desktop) and prev/next (mobile).
  const problemMatch = pathname.match(/^\/problem\/([^/]+)\/([^/]+)/);
  const problemSection = problemMatch ? sections.find(s => s.id === problemMatch[1]) : undefined;
  const problemIndex = problemSection ? problemSection.problems.indexOf(problemMatch![2]) : -1;
  const prevId = problemIndex > 0 ? problemSection!.problems[problemIndex - 1] : undefined;
  const nextId = problemIndex >= 0 ? problemSection!.problems[problemIndex + 1] : undefined;
  const mobileNavClass =
    'lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-600 hover:text-gray-900 dark:hover:text-dark-100 transition-colors';
  const chevron = (d: string) => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );

  return (
    <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl backdrop-saturate-[1.2] border-b border-gray-200 dark:border-dark-500 sticky top-0 z-50">
      <div className={`${problemSection ? '' : 'max-w-7xl mx-auto '}px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-center justify-between gap-2 h-16">
          <div className="flex items-center gap-3 min-w-0">
            {/* Menu button: opens the curriculum drawer (mobile, and desktop pages without the docked sidebar) */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className={`${menuOnDesktop ? '' : 'lg:hidden '}p-2 -ml-2 text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors`}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls={isMenuOpen ? "curriculum-drawer" : undefined}
                title="Curriculum"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center gap-3">
              <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#6c5ce7" />
                <line x1="10" y1="8.5" x2="22" y2="16" stroke="white" strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
                <line x1="10" y1="16" x2="22" y2="16" stroke="white" strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
                <line x1="10" y1="23.5" x2="22" y2="16" stroke="white" strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
                <circle cx="10" cy="8.5" r="2.8" fill="white" fillOpacity="0.9" />
                <circle cx="10" cy="16" r="2.8" fill="white" fillOpacity="0.9" />
                <circle cx="10" cy="23.5" r="2.8" fill="white" fillOpacity="0.9" />
                <circle cx="22" cy="16" r="3.5" fill="white" />
              </svg>
              <span className="text-lg font-extrabold tracking-tight whitespace-nowrap">
                <span className="text-primary-500">ML</span>
                <span className="text-gray-900 dark:text-dark-100"> Grind</span>
              </span>
            </Link>
            {problemSection && (
              <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-3 min-w-0">
                <span className="text-gray-300 dark:text-dark-500" aria-hidden="true">/</span>
                <Link
                  to={`/section/${problemSection.id}`}
                  className="text-sm text-gray-500 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 truncate transition-colors"
                >
                  {problemSection.title}
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {problemSection && (
              <>
                {prevId ? (
                  <Link to={`/problem/${problemSection.id}/${prevId}`} aria-label="Previous problem" className={mobileNavClass}>
                    {chevron('M15 6l-6 6 6 6')}
                  </Link>
                ) : (
                  <span aria-hidden="true" className={`${mobileNavClass} opacity-30 pointer-events-none`}>{chevron('M15 6l-6 6 6 6')}</span>
                )}
                {nextId ? (
                  <Link to={`/problem/${problemSection.id}/${nextId}`} aria-label="Next problem" className={mobileNavClass}>
                    {chevron('M9 6l6 6-6 6')}
                  </Link>
                ) : (
                  <span aria-hidden="true" className={`${mobileNavClass} opacity-30 pointer-events-none`}>{chevron('M9 6l6 6-6 6')}</span>
                )}
              </>
            )}
            <div className="hidden lg:block">
              <ToolsMenu flashDueCount={flashDueCount} onOpenFeedback={onOpenFeedback} />
            </div>
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <UserMenu />
            {/* Progress pill */}
            <div
              className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-500 text-xs"
              title={`${solvedProblems} of ${totalProblems} problems solved (${overallProgress}%)`}
            >
              <div className="w-16 h-1 bg-gray-200 dark:bg-dark-500 rounded-full overflow-hidden">
                <div
                  className="h-full progress-gradient rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="font-mono font-semibold text-primary-600 dark:text-primary-300">
                {solvedProblems} / {totalProblems}
                <span className="sr-only"> problems solved</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
