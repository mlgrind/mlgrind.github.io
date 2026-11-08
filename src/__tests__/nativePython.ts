// Runs harness programs (src/lib/pythonProgram.ts) with a native CPython, for
// the reference-solution tests and scripts/check-torch-tracks.ts.
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import type { TestResult } from "../types";

// npm scripts run from the repository root.
export const SHIM_DIR = resolve(process.cwd(), "public/py");

/** 'shim' installs public/py/torch_shim.py as torch; 'real' requires real PyTorch. */
export type TorchMode = "none" | "shim" | "real";

export function findPython(
  candidates = ["python3", "python"],
  module = "numpy",
): string | null {
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["-c", `import ${module}`], { stdio: "ignore" });
      return candidate;
    } catch {
      /* Native tests are optional; test:runtime always runs real Pyodide. */
    }
  }
  return null;
}

const runner = `
import ast, contextlib, io, json, sys
sys.dont_write_bytecode = True  # keep __pycache__ out of public/ (and so out of dist/)
mode, shim_dir = sys.argv[1], sys.argv[2]
if mode == 'shim':
    sys.path.insert(0, shim_dir)
    import torch_shim
    torch_shim.install()
elif mode == 'real':
    import torch
    assert not getattr(torch, '_is_torch_shim', False), 'expected real PyTorch'
programs = json.load(sys.stdin)
results = []
for program in programs:
    ns = {}
    tree = ast.parse(program)
    with contextlib.redirect_stdout(io.StringIO()):
        exec(compile(ast.Module(body=tree.body[:-1], type_ignores=[]), '<harness>', 'exec'), ns)
        value = eval(compile(ast.Expression(tree.body[-1].value), '<harness>', 'eval'), ns)
    results.append(json.loads(value))
json.dump(results, sys.stdout)
`;

export function runPrograms(
  python: string,
  programs: string[],
  torch: TorchMode = "none",
): TestResult[][] {
  return JSON.parse(
    execFileSync(python, ["-c", runner, torch, SHIM_DIR], {
      input: JSON.stringify(programs),
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    }),
  );
}
