import { Link } from 'react-router-dom';

interface Props {
  /** Reviewed cards whose next review date has passed. */
  dueCount: number;
  /** Whether the learner has reviewed any card yet. */
  started: boolean;
  totalCards: number;
}

export default function FlashCardWidget({ dueCount, started, totalCards }: Props) {
  let headline: JSX.Element;
  let cta: string;
  if (!started) {
    headline = (
      <>
        <div className="text-sm font-medium text-gray-800 dark:text-dark-100">{totalCards} concept cards</div>
        <div className="text-xs text-gray-500 dark:text-dark-300 mt-1 mb-3 max-w-[220px]">
          Short recall questions on the ideas behind the problems. Cards you miss come back sooner.
        </div>
      </>
    );
    cta = 'Try a few cards';
  } else if (dueCount > 0) {
    headline = (
      <>
        <div className="font-mono text-2xl font-bold text-gray-900 dark:text-dark-100">{dueCount}</div>
        <div className="text-xs text-gray-500 dark:text-dark-300 mt-0.5 mb-3">
          card{dueCount !== 1 ? 's' : ''} due for review
        </div>
      </>
    );
    cta = 'Review now';
  } else {
    headline = (
      <>
        <div className="text-sm font-medium text-gray-800 dark:text-dark-100">Nothing due for review</div>
        <div className="text-xs text-gray-500 dark:text-dark-300 mt-0.5 mb-3">
          Cards you've reviewed come back when they're due.
        </div>
      </>
    );
    cta = 'Open flash cards';
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500 p-4 flex flex-col h-full">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-dark-300 font-mono mb-3">
        Flash cards
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
        <div className="w-10 h-10 rounded-[10px] bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-primary-500 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        {headline}
      </div>

      <Link
        to="/flashcards"
        className="block text-center text-[13px] font-semibold px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
      >
        {cta}
      </Link>
    </div>
  );
}
