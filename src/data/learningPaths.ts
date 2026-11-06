import { getProblemById } from "./problems";

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  prerequisites: string;
  minutes: string;
  problems: string[];
}
export const learningPaths: LearningPath[] = [
  {
    id: "numpy-foundations",
    title: "NumPy foundations",
    description:
      "Get comfortable with arrays, shapes, broadcasting, and matrix operations.",
    prerequisites: "Basic Python",
    minutes: "60–90",
    problems: [
      "numpy-array-sum",
      "numpy-array-creation",
      "numpy-indexing",
      "numpy-broadcast-add",
      "numpy-matrix-multiply",
    ],
  },
  {
    id: "ml-interview-prep",
    title: "ML interview prep",
    description: "Practice core building blocks and explain how they work.",
    prerequisites: "Python and basic linear algebra",
    minutes: "120–180",
    problems: [
      "numpy-matrix-multiply",
      "perceptron",
      "backpropagation",
      "linear-regression-gd",
      "kmeans-clustering",
    ],
  },
  {
    id: "build-a-transformer",
    title: "Build a transformer",
    description:
      "Work through attention and the components behind modern language models.",
    prerequisites: "NumPy, matrix multiplication, and neural networks",
    minutes: "180–240",
    problems: [],
  },
];

// Resolve from curriculum membership so path links stay valid as titles evolve.
import { sections } from "./sections";
learningPaths[2].problems = sections
  .find((section) => section.id === "transformers")!
  .problems.slice(0, 5);
// Fail during generation/tests if an explicitly curated exercise goes missing.
export const sevenDayChallenge: LearningPath = {
  id: "seven-day-challenge",
  title: "Seven days of ML coding",
  description:
    "One focused exercise per day. Start any time, follow at your own pace, and build a habit.",
  prerequisites: "Basic Python; NumPy helps",
  minutes: "15–30",
  problems: [
    "numpy-array-sum",
    "numpy-matrix-multiply",
    "numpy-broadcast-add",
    "perceptron",
    "neural-network-forward",
    "backpropagation",
    sections.find((s) => s.id === "transformers")!.problems[0],
  ],
};
export const allPaths = [...learningPaths, sevenDayChallenge];
export const problemHref = (id: string) => {
  const problem = getProblemById(id);
  if (!problem) throw new Error(`Unknown learning path problem: ${id}`);
  return `/problem/${problem.section}/${problem.id}`;
};
