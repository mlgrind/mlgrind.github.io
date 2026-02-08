import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sections } from '../../data/sections';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import { useDarkMode } from '../../hooks/useDarkMode';
import UserMenu from '../Auth/UserMenu';

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
    <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl backdrop-saturate-[1.2] border-b border-gray-200 dark:border-dark-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Hamburger menu - mobile only */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center gap-2.5">
              <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#header-logo-grad)" />
                <line x1="10" y1="9" x2="22" y2="16" stroke="white" strokeWidth="1.3" opacity="0.35" strokeLinecap="round" />
                <line x1="10" y1="16" x2="22" y2="16" stroke="white" strokeWidth="1.3" opacity="0.35" strokeLinecap="round" />
                <line x1="10" y1="23" x2="22" y2="16" stroke="white" strokeWidth="1.3" opacity="0.35" strokeLinecap="round" />
                <circle cx="10" cy="9" r="2.5" fill="white" fillOpacity="0.85" />
                <circle cx="10" cy="16" r="2.5" fill="white" fillOpacity="0.85" />
                <circle cx="10" cy="23" r="2.5" fill="white" fillOpacity="0.85" />
                <circle cx="22" cy="16" r="3" fill="white" />
                <defs>
                  <linearGradient id="header-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6c5ce7" />
                    <stop offset="1" stopColor="#00c9a7" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-[17px] font-bold tracking-tight whitespace-nowrap">
                <span className="bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">ML</span>
                <span className="text-gray-900 dark:text-dark-100"> Grind</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/scratchpad"
              className="hidden lg:flex px-3 py-1.5 text-gray-600 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-dark-100 border border-transparent hover:border-gray-200 dark:hover:border-dark-500 transition-all items-center gap-2"
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
              className="hidden lg:flex px-3 py-1.5 text-primary-400 dark:text-primary-300 text-sm font-medium rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Cheat Sheet
            </a>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="hidden lg:flex px-3 py-1.5 text-gray-500 dark:text-dark-200 text-sm font-medium hover:text-gray-700 dark:hover:text-dark-100 transition-colors items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Feedback
            </button>
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
            <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-500 text-xs">
              <div className="w-20 h-1 bg-gray-200 dark:bg-dark-500 rounded-full overflow-hidden">
                <div
                  className="h-full progress-gradient rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="font-mono font-semibold text-primary-600 dark:text-primary-300">{overallProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
  </>
  );
}
