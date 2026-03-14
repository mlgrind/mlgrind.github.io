import { Link } from 'react-router-dom';

export default function FlashCardWidget({ dueCount }: { dueCount: number }) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500 p-4 flex flex-col h-full">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-dark-300 font-mono mb-3">
        Flash Cards
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
        <div className="w-10 h-10 rounded-[10px] bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-primary-500 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        {dueCount > 0 ? (
          <>
            <div className="font-mono text-2xl font-bold text-gray-900 dark:text-dark-100">{dueCount}</div>
            <div className="text-[11px] text-gray-400 dark:text-dark-300 mt-0.5 mb-3">
              card{dueCount !== 1 ? 's' : ''} due for review
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-medium text-gray-700 dark:text-dark-100">All caught up</div>
            <div className="text-[11px] text-gray-400 dark:text-dark-300 mt-0.5 mb-3">
              No cards due right now
            </div>
          </>
        )}
      </div>

      <Link
        to="/flashcards"
        className="block text-center text-[13px] font-semibold px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
      >
        {dueCount > 0 ? 'Review Now' : 'Browse Cards'}
      </Link>
    </div>
  );
}
