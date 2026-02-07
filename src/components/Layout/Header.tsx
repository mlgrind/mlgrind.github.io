import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sections } from '../../data/sections';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import { useDarkMode } from '../../hooks/useDarkMode';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { getOverallProgress } = useProgress();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

  const sectionInfo = sections.map(s => ({
    id: s.id,
    problemCount: s.problems.length,
  }));

  const overallProgress = getOverallProgress(sectionInfo);

  return (
    <>
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Hamburger menu - mobile only */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}vite.svg`} alt="ML Coding Lab" className="w-8 h-8" />
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">ML Coding Lab</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/scratchpad"
              className="hidden sm:flex px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Scratchpad
            </Link>
            <a
              href={`${import.meta.env.BASE_URL}ml-cheatsheet.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Cheat Sheet
            </a>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="hidden md:flex px-3 py-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Feedback
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
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
            <div className="hidden md:flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Overall Progress</span>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">{overallProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
  </>
  );
}
