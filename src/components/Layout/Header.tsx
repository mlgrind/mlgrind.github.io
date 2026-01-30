import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sections } from '../../data/sections';
import FeedbackModal from '../FeedbackModal/FeedbackModal';

export default function Header() {
  const { getOverallProgress } = useProgress();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const sectionInfo = sections.map(s => ({
    id: s.id,
    problemCount: s.problems.length,
  }));

  const overallProgress = getOverallProgress(sectionInfo);

  return (
    <>
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}vite.svg`} alt="ML Coding Lab" className="w-8 h-8" />
            <span className="text-xl font-semibold text-gray-900">ML Coding Lab</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/scratchpad"
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
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
              className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-md hover:bg-amber-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Cheat Sheet
            </a>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="px-3 py-1.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Feedback
            </button>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">Overall Progress</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-primary-600 text-sm font-medium">{overallProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
  </>
  );
}
