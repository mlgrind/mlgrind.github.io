/* Pyodide 0.26 supports classic workers. Pin the runtime and its packages together. */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
let outputLines = 0;
const ready = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
}).then(async (python) => {
  const emit = (text) => {
    if (outputLines++ < 500)
      self.postMessage({ type: "output", text: text.slice(0, 4000) });
    else if (outputLines === 501)
      self.postMessage({
        type: "output",
        text: "[Output truncated after 500 lines]",
      });
  };
  python.setStdout({ batched: emit });
  python.setStderr({ batched: (text) => emit(`[Error] ${text}`) });
  await python.loadPackage("numpy");
  self.postMessage({ type: "ready" });
  return python;
});
ready.catch((error) =>
  self.postMessage({ type: "error", error: error.message }),
);
self.onmessage = async ({ data }) => {
  try {
    outputLines = 0;
    const python = await ready;
    // Scratchpad runs also get a fresh namespace to avoid leaking stale state.
    const result = data.tests
      ? await python.runPythonAsync(data.program)
      : await python.runPythonAsync(
          `exec(compile(${JSON.stringify(data.program)}, '<solution>', 'exec'), {'__name__': '__main__'})`,
        );
    self.postMessage({
      type: "result",
      id: data.id,
      result: data.tests ? String(result) : null,
    });
    result?.destroy?.();
  } catch (error) {
    self.postMessage({ type: "error", id: data.id, error: error.message });
  }
};
