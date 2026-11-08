import { Problem } from '../../types';

export default function DifficultyBadge({ difficulty }: { difficulty: Problem['difficulty'] }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
        difficulty === 'easy'
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : difficulty === 'medium'
          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      {difficulty}
    </span>
  );
}
