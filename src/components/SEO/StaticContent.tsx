import PrivacyPage from "../../pages/PrivacyPage";
import TermsPage from "../../pages/TermsPage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { allProblems } from "../../data/problems";
import { sections } from "../../data/sections";
import { allPaths, problemHref } from "../../data/learningPaths";

export const staticRoutes = [
  "/",
  "/scratchpad",
  "/flashcards",
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
      description: `Implement ${problem.title} in Python with NumPy. ${problem.difficulty} exercise with examples, hints, and instant feedback. No setup or signup required.`,
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
      title: "ML Grind - Learn Machine Learning by Building",
      description:
        "Free hands-on ML coding practice. Implement NumPy, neural networks, attention, and transformers in your browser. No setup or signup required.",
    },
    "/scratchpad": {
      title: "Python Scratchpad",
      description:
        "Run real Python with NumPy in your browser. No installation required.",
    },
    "/flashcards": {
      title: "ML Flashcards",
      description:
        "Review machine learning concepts with interactive flashcards.",
    },
    "/privacy": {
      title: "Privacy Policy",
      description:
        "How ML Grind handles progress, account information, and usage analytics.",
    },
    "/terms": {
      title: "Terms of Service",
      description: "Terms for using ML Grind and its educational content.",
    },
  };
  return (
    pages[path] ?? {
      title: "Page Not Found",
      description: "This page does not exist.",
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
            <p>About 5 minutes · Basic Python · No signup</p>
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
                — {p.description}
              </p>
            ))}
            <h2 className="text-2xl">
              {allProblems.length} exercises across {sections.length} sections
            </h2>
            {sections.map((s) => (
              <p key={s.id}>
                <a href={`/section/${s.id}`}>{s.title} →</a> — {s.description}
              </p>
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
            <p>
              Estimated time: {content.learningPath.minutes} minutes{path === '/challenge' ? ' per day' : ''}.
              Prerequisites: {content.learningPath.prerequisites}.
            </p>
            <ol className="space-y-4">
              {content.learningPath.problems.map((id, i) => (
                <li key={id}>
                  <a href={problemHref(id)}>
                    {path === "/challenge" ? "Day" : "Step"} {i + 1}:{" "}
                    {allProblems.find((p) => p.id === id)!.title} →
                  </a>
                </li>
              ))}
            </ol>
          </>
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
        <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{" "}
        <a href="https://github.com/mlgrind/mlgrind.github.io">GitHub</a>
      </footer>
    </div>
  );
}
