import PrivacyPage from "../../pages/PrivacyPage";
import TermsPage from "../../pages/TermsPage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { allProblems } from "../../data/problems";
import { sections } from "../../data/sections";
import { resolvedGroups } from "../../data/curriculum";
import { allPaths, pathMeta, problemHref } from "../../data/learningPaths";
import { getCompanyIndex } from "../../data/companyTags";
import { lectures } from "../../data/lectures";
import { flashCards } from "../../data/flashcards";

export const staticRoutes = [
  "/",
  "/scratchpad",
  "/flashcards",
  "/companies",
  "/terms",
  "/privacy",
  "/challenge",
  ...allPaths
    .filter((p) => p.id !== "seven-day-challenge")
    .map((p) => `/learn/${p.id}`),
  ...sections.map((s) => `/section/${s.id}`),
  ...allProblems.map((p) => `/problem/${p.section}/${p.id}`),
];

export function routeContent(path: string) {
  const problem = allProblems.find(
    (p) => path === `/problem/${p.section}/${p.id}`,
  );
  const section = sections.find((s) => path === `/section/${s.id}`);
  const learningPath = allPaths.find(
    (p) =>
      path ===
      (p.id === "seven-day-challenge" ? "/challenge" : `/learn/${p.id}`),
  );
  if (problem)
    return {
      title: `${problem.title} - ${sections.find((s) => s.id === problem.section)!.title}`,
      description: `Implement ${problem.title} from scratch in NumPy${problem.pytorch ? " or PyTorch" : ""}. A ${problem.difficulty} exercise with examples, hints and tests that run in your browser. No install or account needed.`,
      problem,
    };
  if (section)
    return { title: section.title, description: section.description, section };
  if (learningPath)
    return {
      title: learningPath.title,
      description: learningPath.description,
      learningPath,
    };
  const pages: Record<string, { title: string; description: string }> = {
    "/": {
      title: "ML Grind - Learn Machine Learning by Building It",
      description: `${allProblems.length} ML coding problems, from NumPy and backprop to transformers, diffusion and RL. Solve them in NumPy or PyTorch in your browser, with animated lectures. Free, no install.`,
    },
    "/scratchpad": {
      title: "Python Scratchpad",
      description:
        "A Python scratchpad with NumPy loaded, running entirely in your browser. No install or account; your code is saved locally.",
    },
    "/flashcards": {
      title: "Flash Cards",
      description: `${flashCards.length} spaced-repetition flash cards on the ideas behind the problems: NumPy, backprop, attention, diffusion, RL and more.`,
    },
    "/companies": {
      title: "Problems by Company",
      description: `ML coding problems candidates report being asked at ${getCompanyIndex().length} companies, with links to the public interview reports.`,
    },
    "/privacy": {
      title: "Privacy Policy",
      description:
        "What ML Grind stores in your browser, what Google sign-in syncs, what AI feedback sends, and how to turn off analytics.",
    },
    "/terms": {
      title: "Terms of Service",
      description: "Terms for using ML Grind and its educational content.",
    },
  };
  return (
    pages[path] ?? {
      title: "Page Not Found",
      description: "This page does not exist on ML Grind.",
    }
  );
}

const Markdown = ({ children }: { children: string }) => (
  <div className="prose dark:prose-invert max-w-none">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ h1: ({ children }) => <h2>{children}</h2> }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

export function StaticContent({ path }: { path: string }) {
  const content = routeContent(path);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-dark-100">
      <header className="p-6 border-b border-gray-200 dark:border-dark-500">
        <a href="/" className="font-semibold text-xl">
          ML Grind
        </a>
        <nav className="flex flex-wrap gap-5 mt-3 text-sm">
          <a href="/">Curriculum</a>
          <a href="/challenge">Seven-day challenge</a>
          <a href="/scratchpad">Python scratchpad</a>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {path === "/privacy" ? (
          <PrivacyPage />
        ) : path === "/terms" ? (
          <TermsPage />
        ) : (
          <>
            <h1 className="font-display text-4xl">{content.title}</h1>
            <p className="text-lg text-gray-600 dark:text-dark-200">
              {content.description}
            </p>
          </>
        )}
        {path === "/" && (
          <>
            <a
              href={problemHref("numpy-array-sum")}
              className="inline-block px-6 py-3 bg-primary-500 rounded-xl text-white"
            >
              Solve your first problem →
            </a>
            <p>About 5 minutes · Basic Python is enough · No account needed</p>
            <h2 className="text-2xl">Choose your learning path</h2>
            {allPaths.map((p) => (
              <p key={p.id}>
                <a
                  href={
                    p.id === "seven-day-challenge"
                      ? "/challenge"
                      : `/learn/${p.id}`
                  }
                >
                  {p.title} →
                </a>{" "}
                — {p.tagline}
              </p>
            ))}
            <h2 className="text-2xl">
              {allProblems.length} exercises across {sections.length} sections
            </h2>
            {resolvedGroups.map((group) => (
              <section key={group.id}>
                <h3 className="text-xl">{group.title}</h3>
                {group.sections.map((s) => (
                  <p key={s.id}>
                    <a href={`/section/${s.id}`}>{s.title} →</a> — {s.description}
                  </p>
                ))}
              </section>
            ))}
          </>
        )}
        {"problem" in content && content.problem && (
          <>
            <Markdown>{content.problem.description}</Markdown>
            <h2 className="text-2xl">Examples</h2>
            {content.problem.examples.map((example, i) => (
              <div key={i}>
                <pre className="overflow-auto">
                  Input: {example.input}
                  {"\n"}Output: {example.output}
                </pre>
                <p>{example.explanation}</p>
              </div>
            ))}
            <h2 id="practice" className="text-2xl">
              Practice in Python
            </h2>
            <pre className="overflow-auto p-4 bg-gray-100 dark:bg-dark-800">
              {content.problem.starterCode}
            </pre>
            <p>
              The interactive editor loads with Python and NumPy. Run your
              implementation against {content.problem.testCases.length} tests,
              or use the progressive hints.
            </p>
            <p>
              <a href={`/section/${content.problem.section}`}>
                More exercises in this section →
              </a>
            </p>
          </>
        )}
        {"section" in content && content.section && (
          <>
            {lectures[content.section.id] && (
              <p>
                <a href={`https://www.youtube.com/watch?v=${lectures[content.section.id].videoId}`}>
                  Watch the animated {content.section.title} lecture (
                  {Math.floor(lectures[content.section.id].durationSec / 60)} min) →
                </a>
              </p>
            )}
            <Markdown>{content.section.introduction}</Markdown>
            <h2 className="text-2xl">Practice exercises</h2>
            <ol>
              {content.section.problems.map((id) => (
                <li key={id}>
                  <a href={problemHref(id)}>
                    {allProblems.find((p) => p.id === id)!.title} →
                  </a>
                </li>
              ))}
            </ol>
          </>
        )}
        {"learningPath" in content && content.learningPath && (
          <>
            <p>{pathMeta(content.learningPath)}. You'll need: {content.learningPath.prerequisites}.</p>
            <h2 className="text-2xl">By the end you can</h2>
            <ul>
              {content.learningPath.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <h2 className="text-2xl">Steps</h2>
            <ol className="space-y-4">
              {content.learningPath.problems.map((id, i) => (
                <li key={id}>
                  <a href={problemHref(id)}>
                    {path === "/challenge" ? "Day" : "Step"} {i + 1}:{" "}
                    {allProblems.find((p) => p.id === id)!.title} →
                  </a>{" "}
                  {content.learningPath!.steps[i].why}
                </li>
              ))}
            </ol>
          </>
        )}
        {path === "/companies" &&
          getCompanyIndex().map((entry) => (
            <section key={entry.slug}>
              <h2 className="text-2xl">{entry.company}</h2>
              <ul>
                {entry.problemIds.map((id) => (
                  <li key={id}>
                    <a href={problemHref(id)}>
                      {allProblems.find((p) => p.id === id)!.title} →
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        {path === "/companies" && (
          <p>
            Based on public interview reports; logos are trademarks of their
            owners and don&apos;t imply endorsement.
          </p>
        )}
        {(path === "/scratchpad" || path === "/flashcards") && (
          <p>
            Enable JavaScript to use this interactive tool. You can browse all
            exercise descriptions without JavaScript.
          </p>
        )}
        <noscript>
          <p>
            JavaScript is required to execute Python, save progress, and use the
            interactive editor. Exercise descriptions and examples remain
            available here.
          </p>
        </noscript>
      </main>
      <footer className="p-6 text-sm">
        <a href="https://itzsid.github.io/" target="_blank" rel="noopener noreferrer">Siddharth Choudhary</a> ·{" "}
        <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{" "}
        <a href="https://github.com/mlgrind/mlgrind.github.io">GitHub</a>
      </footer>
    </div>
  );
}
