// Pyodide surfaces the full Python traceback, most of which is its own harness
// (`_pyodide/_base.py`, `eval_code_async`, `CodeRunner`, the synthetic `<exec>`
// module). Strip those frames so the learner sees their own error, not ours.
const INTERNAL_FRAME =
  /_pyodide[/\\]_base\.py|eval_code_async|CodeRunner\(|runPythonAsync|importlib\._bootstrap|File "<exec>"|File "<test>"|File "<solution>"/;

export function formatPythonError(message: string): string {
  if (!message) return "Test execution error";

  const lines = message.split("\n");
  // The final non-empty line is the actual exception, e.g. "TypeError: ...".
  const exceptionLine =
    [...lines]
      .reverse()
      .find((l) => l.trim().length > 0)
      ?.trim() ?? message.trim();

  // Keep any traceback frames that point at the learner's own code.
  const userFrames = lines.filter(
    (l) => /^\s*File "/.test(l) && !INTERNAL_FRAME.test(l),
  );

  if (userFrames.length === 0) return exceptionLine;
  return [...userFrames.map((l) => l.trim()), exceptionLine].join("\n");
}
