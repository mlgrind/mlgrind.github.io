import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  learningPaths,
  sevenDayChallenge,
  problemHref,
  pathMeta,
  stepMinutes,
  allPaths,
  pathHref,
} from "../data/learningPaths";
import { getProblemById } from "../data/problems";
import { sections } from "../data/sections";
import { useProgress } from "../context/ProgressContext";
import SEO from "../components/SEO/SEO";
import ShareChallenge from "../components/Share/ShareChallenge";
import NotFoundPage from "./NotFoundPage";
import { track } from "../lib/analytics";

const difficultyClass: Record<string, string> = {
  easy: "text-accent-700 bg-accent-50 dark:text-accent-300 dark:bg-accent-900/30",
  medium: "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30",
  hard: "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/30",
};

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

  const isDone = (id: string) =>
    getProblemProgress(getProblemById(id)!.section, id).status === "completed";
  const completed = path.problems.filter(isDone).length;
  const total = path.problems.length;
  const next = path.problems.find((id) => !isDone(id));
  const href = pathHref(path);
  const others = allPaths.filter((p) => p.id !== path.id);

  return (
    <div className="max-w-3xl mx-auto">
      <SEO title={path.title} description={path.description} canonical={href} />

      <Link
        to="/"
        className="text-sm text-primary-600 dark:text-primary-300 hover:underline"
      >
        ← Home
      </Link>

      <header className="mt-4 mb-8">
        <p className="font-mono text-xs tracking-[0.08em] uppercase text-gray-500 dark:text-dark-300">
          Learning path · {pathMeta(path)}
        </p>
        <h1 className="mt-2 text-4xl font-display text-gray-900 dark:text-dark-100">
          {path.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600 dark:text-dark-200">
          {path.description}
        </p>
      </header>

      <section
        aria-labelledby="outcomes-heading"
        className="mb-8 rounded-xl border border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-800 p-5"
      >
        <h2
          id="outcomes-heading"
          className="text-sm font-semibold text-gray-900 dark:text-dark-100"
        >
          By the end you can
        </h2>
        <ul className="mt-3 space-y-2">
          {path.outcomes.map((o) => (
            <li
              key={o}
              className="flex gap-2.5 text-[15px] text-gray-700 dark:text-dark-100"
            >
              <span aria-hidden="true" className="text-accent-600 dark:text-accent-300">
                ✓
              </span>
              {o}
            </li>
          ))}
        </ul>
        <p className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-600 text-sm text-gray-600 dark:text-dark-200">
          <span className="font-medium text-gray-800 dark:text-dark-100">
            You'll need:
          </span>{" "}
          {path.prerequisites}
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        {next ? (
          <Link
            to={problemHref(next)}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
          >
            {completed === 0
              ? `Start ${challenge ? "day 1" : "step 1"} →`
              : `Continue with ${challenge ? "day" : "step"} ${path.problems.indexOf(next) + 1} →`}
          </Link>
        ) : (
          <span className="inline-flex items-center px-5 py-2.5 rounded-xl bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 font-medium">
            Path complete ✓
          </span>
        )}
        <div className="flex-1 min-w-[10rem] flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-dark-500 overflow-hidden"
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Path progress"
          >
            <div
              className="h-full progress-gradient rounded-full transition-all"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
          <span className="font-mono text-sm text-gray-600 dark:text-dark-200">
            {completed}/{total}
          </span>
        </div>
      </div>

      <ol className="space-y-3">
        {path.steps.map((step, i) => {
          const problem = getProblemById(step.problem)!;
          const done = isDone(step.problem);
          const section = sections.find((s) => s.id === problem.section);
          return (
            <li key={step.problem}>
              <Link
                to={problemHref(step.problem)}
                className="group flex gap-4 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-800 hover:border-primary-400 dark:hover:border-primary-400 transition-colors"
              >
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                    done
                      ? "bg-accent-500 text-white"
                      : "border border-gray-300 dark:border-dark-400 text-gray-600 dark:text-dark-200"
                  }`}
                  aria-label={done ? `${challenge ? "Day" : "Step"} ${i + 1}, done` : `${challenge ? "Day" : "Step"} ${i + 1}`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900 dark:text-dark-100 group-hover:text-primary-600 dark:group-hover:text-primary-200">
                    {problem.title}
                  </span>
                  <span className="block mt-1 text-sm leading-snug text-gray-600 dark:text-dark-200">
                    {step.why}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md capitalize ${difficultyClass[problem.difficulty]}`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-gray-500 dark:text-dark-300">
                      ~{stepMinutes(step.problem)} min
                    </span>
                    {section && (
                      <span className="text-gray-500 dark:text-dark-300">
                        · {section.title}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        <ShareChallenge
          title={path.title}
          path={href}
          completed={completed === total}
        />
      </div>

      <section aria-labelledby="more-paths" className="mt-10">
        <h2
          id="more-paths"
          className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-3"
        >
          Other paths
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {others.map((p) => (
            <li key={p.id}>
              <Link
                to={pathHref(p)}
                className="block h-full p-4 rounded-xl border border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-800 hover:border-primary-400 transition-colors"
              >
                <span className="block font-semibold text-sm text-gray-900 dark:text-dark-100">
                  {p.title}
                </span>
                <span className="block mt-1 text-[13px] leading-snug text-gray-600 dark:text-dark-200">
                  {p.tagline}
                </span>
                <span className="block mt-2 font-mono text-[11px] text-gray-500 dark:text-dark-300">
                  {pathMeta(p)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-gray-500 dark:text-dark-300">
        No account needed. Progress is saved in this browser; sign in to sync it
        across devices.
      </p>
    </div>
  );
}
