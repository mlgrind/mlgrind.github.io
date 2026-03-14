import { useProgress } from '../../context/ProgressContext';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useFlashCards } from '../../hooks/useFlashCards';
import Recommendations from './Recommendations';
import ActivityFeed from './ActivityFeed';
import FlashCardWidget from './FlashCardWidget';

export default function Dashboard() {
  const { progress } = useProgress();
  const activity = useActivityFeed(progress);
  const recommendations = useRecommendations(progress);
  const { getDueCount } = useFlashCards();

  const hasProgress = Object.keys(progress).length > 0;
  if (!hasProgress) return null;

  const dueCount = getDueCount();

  return (
    <div className="mb-12 animate-fade-up">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-dark-300 mb-5 font-mono">
        Your Dashboard
      </div>

      {recommendations.length > 0 && (
        <Recommendations items={recommendations} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActivityFeed items={activity} />
        </div>
        <div className="lg:col-span-1">
          <FlashCardWidget dueCount={dueCount} />
        </div>
      </div>
    </div>
  );
}
