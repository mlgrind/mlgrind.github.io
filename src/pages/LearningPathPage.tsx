import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  learningPaths,
  sevenDayChallenge,
  problemHref,
} from "../data/learningPaths";
import { getProblemById } from "../data/problems";
import { useProgress } from "../context/ProgressContext";
import SEO from "../components/SEO/SEO";
import ShareChallenge from "../components/Share/ShareChallenge";
import NotFoundPage from "./NotFoundPage";
import { track } from "../lib/analytics";

export default function LearningPathPage({
  challenge = false,
}: {
  challenge?: boolean;
}) {
  const { pathId } = useParams();
  const path = challenge
    ? sevenDayChallenge
    : learningPaths.find((p) => p.id === pathId);
  const { getProblemProgress } = useProgress();
  useEffect(() => {
    if (path) track("path_opened", { path_id: path.id });
  }, [path]);
  if (!path) return <NotFoundPage />;
  const completed = path.problems.filter((id) => {
    const p = getProblemById(id)!;
    return getProblemProgress(p.section, id).status === "completed";
  }).length;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SEO
        title={path.title}
        description={path.description}
        canonical={challenge ? "/challenge" : `/learn/${path.id}`}
      />
      <Link to="/" className="text-primary-500">
        ← All learning paths
      </Link>
      <h1 className="text-4xl font-display text-gray-900 dark:text-dark-100">
        {path.title}
      </h1>
      <p className="text-lg text-gray-600 dark:text-dark-200">
        {path.description}
      </p>
      <p className="text-sm text-gray-500 dark:text-dark-200">
        Estimated time: {path.minutes} minutes{challenge ? ' per day' : ''} · Prerequisites:{" "}
        {path.prerequisites}
      </p>
      <p className="text-primary-500">
        {completed} of {path.problems.length} completed
      </p>
      <ol className="space-y-3">
        {path.problems.map((id, i) => {
          const problem = getProblemById(id)!;
          const done =
            getProblemProgress(problem.section, id).status === "completed";
          return (
            <li key={id}>
              <Link
                to={problemHref(id)}
                className="block p-5 rounded-xl border border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 hover:border-primary-400"
              >
                <span className="text-primary-500">
                  {challenge ? "Day" : "Step"} {i + 1}
                  {done ? " ✓" : ""}
                </span>
                <h2 className="font-semibold mt-1">{problem.title}</h2>
                <p className="text-sm text-gray-500 dark:text-dark-200">
                  {problem.difficulty} · Open exercise →
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
      <ShareChallenge
        title={path.title}
        path={challenge ? "/challenge" : `/learn/${path.id}`}
        completed={completed === path.problems.length}
      />
      <p className="text-sm text-gray-500 dark:text-dark-200">
        No account required. Your progress is saved in this browser; sign in
        optionally to sync across devices.
      </p>
    </div>
  );
}
