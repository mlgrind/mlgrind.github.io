import { downloadCompletionCard, useShareChallenge } from "../../hooks/useShareChallenge";

export default function ShareChallenge({
  title,
  path,
  completed = false,
}: {
  title: string;
  path: string;
  completed?: boolean;
}) {
  const { message, copy } = useShareChallenge(path);
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button
        onClick={copy}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-dark-100"
      >
        Share challenge
      </button>
      {completed && (
        <button
          onClick={() => downloadCompletionCard(title)}
          className="px-3 py-2 rounded-lg bg-primary-500 text-white"
        >
          Download completion card
        </button>
      )}
      <span
        role="status"
        className="text-gray-500 dark:text-dark-200 break-all"
      >
        {message}
      </span>
    </div>
  );
}
