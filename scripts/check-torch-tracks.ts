// Runs every PyTorch track's reference solution through the production test
// harness (src/lib/pythonProgram.ts) with a native Python.
//
//   npx tsx scripts/check-torch-tracks.ts                       # torch shim, python3
//   npx tsx scripts/check-torch-tracks.ts --torch real --python /path/to/venv/bin/python
//
// --torch real imports real PyTorch instead of the shim, to check that the
// tracks teach code that also works outside the browser.
import { allProblems } from "../src/data/problems/index.ts";
import { functionNameOf, testProgram } from "../src/lib/pythonProgram.ts";
import { runPrograms, type TorchMode } from "../src/__tests__/nativePython.ts";

function option(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index > 0 ? process.argv[index + 1] : fallback;
}
const python = option("--python", "python3");
const torch = option("--torch", "shim") as TorchMode;
if (torch !== "shim" && torch !== "real") {
  console.error("--torch must be 'shim' or 'real'");
  process.exit(2);
}

const tracked = allProblems.filter((p) => p.pytorch);
const results = runPrograms(
  python,
  tracked.map((p) =>
    testProgram(
      p.pytorch!.solution,
      p.pytorch!.testCases,
      functionNameOf(p.pytorch!.starterCode),
      "pytorch",
    ),
  ),
  torch,
);
let passed = 0;
let failed = 0;
results.forEach((cases, index) => {
  for (const c of cases) {
    if (c.passed) passed++;
    else {
      failed++;
      console.log(`FAIL ${tracked[index].id} #${c.id}: ${c.actual}; expected ${c.expected}`);
    }
  }
});
console.log(
  `${tracked.length} PyTorch tracks, torch=${torch}: ${passed}/${passed + failed} tests passed`,
);
process.exit(failed ? 1 : 0);
