import { downloadCompletionCard } from "../../hooks/useShareChallenge";

const iconButton =
  "inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors";

/**
 * Icon-sized share controls for the problem title row: copy the challenge link,
 * and once solved, download the completion card. The copy state comes from
 * `useShareChallenge` in the page so the overflow menu can share it too.
 */
export default function CompactShare({
  title,
  message,
  onCopy,
  completed = false,
}: {
  title: string;
  message: string;
  onCopy: () => void;
  completed?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={onCopy}
        aria-label="Share challenge"
        title="Share challenge (copy link)"
        className={iconButton}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>
      {completed && (
        <button
          type="button"
          onClick={() => downloadCompletionCard(title)}
          aria-label="Download completion card"
          title="Download completion card"
          className={iconButton}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      )}
      <span
        role="status"
        className={
          message
            ? "absolute right-0 top-full mt-1 z-50 w-max max-w-[min(20rem,80vw)] px-2.5 py-1.5 text-xs rounded-md shadow-lg bg-dark-800 dark:bg-dark-600 text-white break-all"
            : "sr-only"
        }
      >
        {message}
      </span>
    </div>
  );
}
