import { getProblemById } from "./problems";

export type PathLevel = "Beginner" | "Intermediate" | "Advanced";

export interface PathStep {
  /** Problem id. */
  problem: string;
  /** One line on what this step teaches and why it sits here. */
  why: string;
}

export interface LearningPath {
  id: string;
  title: string;
  /** One line for menus and cards. */
  tagline: string;
  /** Two or three sentences for the path page and search results. */
  description: string;
  /** What the learner can do at the end. */
  outcomes: string[];
  level: PathLevel;
  prerequisites: string;
  steps: PathStep[];
  /** Problem ids in order (derived from steps). */
  problems: string[];
}

/** Rough solve time by difficulty, used for the time estimates shown. */
const MINUTES = { easy: 10, medium: 20, hard: 40 } as const;

function path(p: Omit<LearningPath, "problems">): LearningPath {
  return { ...p, problems: p.steps.map((s) => s.problem) };
}

export function stepMinutes(problemId: string): number {
  const problem = getProblemById(problemId);
  if (!problem) throw new Error(`Unknown learning path problem: ${problemId}`);
  return MINUTES[problem.difficulty];
}

/** Total estimated minutes for a path. */
export function pathMinutes(p: LearningPath): number {
  return p.problems.reduce((sum, id) => sum + stepMinutes(id), 0);
}

/** "about 45 min", "about 2 h", "about 3.5 h". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `about ${Math.round(minutes / 5) * 5} min`;
  const hours = Math.round((minutes / 60) * 2) / 2;
  return `about ${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} h`;
}

/** "8 problems · about 2 h · Beginner" */
export function pathMeta(p: LearningPath): string {
  if (p.id === sevenDayChallenge.id)
    return `7 days · 10–20 min a day · ${p.level}`;
  return `${p.problems.length} problems · ${formatDuration(pathMinutes(p))} · ${p.level}`;
}

export const learningPaths: LearningPath[] = [
  path({
    id: "numpy-foundations",
    title: "NumPy foundations",
    tagline: "The array skills every ML implementation is written in.",
    description:
      "Every model on this site is a few lines of array code, so shape fluency comes first. Work from a one-line sum to broadcasting, matrix products and einsum, and learn to predict the shape of an expression before you run it.",
    outcomes: [
      "Predict the output shape of any NumPy expression before running it",
      "Replace Python loops with vectorised array operations",
      "Read and write einsum strings like the ones in papers and model code",
    ],
    level: "Beginner",
    prerequisites: "Basic Python: lists, functions and loops",
    steps: [
      { problem: "numpy-array-sum", why: "Warm up: write a function, run the tests and read the output." },
      { problem: "numpy-array-creation", why: "Create arrays with the right shape and dtype from the start." },
      { problem: "numpy-indexing", why: "Rows, columns, blocks and diagonals, with half-open slices." },
      { problem: "numpy-aggregations", why: "Reduce along an axis and keep track of which axis disappears." },
      { problem: "numpy-reshape-transpose", why: "Reshape versus transpose, a common source of silent bugs." },
      { problem: "numpy-broadcasting", why: "The broadcasting rules, so (B, D) + (D,) works and (B, D) + (B,) fails." },
      { problem: "numpy-matrix-multiply", why: "Matrix products and the shape check behind every dense layer." },
      { problem: "einsum-basics", why: "Einsum: one notation for sums, products and transposes." },
    ],
  }),
  path({
    id: "ml-interview-prep",
    title: "ML coding interview prep",
    tagline: "The from-scratch implementations ML coding rounds ask for most.",
    description:
      "The problems that come up most in ML coding interviews: stable losses, classic models, evaluation metrics, a neural network by hand and attention. Each fits in an interview slot, and the hidden tests check the edge cases interviewers ask about.",
    outcomes: [
      "Implement the classic algorithms from a blank file, each in under 40 minutes",
      "Derive and explain the gradients you code, as interviewers ask you to",
      "Handle numerical stability, ties and zero-division cases without prompting",
    ],
    level: "Intermediate",
    prerequisites: "Comfortable with NumPy; basic calculus and linear algebra",
    steps: [
      { problem: "backpropagation", why: "Softmax without overflow, often the first thing an interviewer checks." },
      { problem: "cross-entropy-loss", why: "Cross-entropy from logits, and why you never take the log of a softmax." },
      { problem: "linear-regression-gd", why: "Gradient descent end to end: loss, gradient, update, convergence." },
      { problem: "logistic-regression-full", why: "Logistic regression with the gradient derived by hand." },
      { problem: "knn-classifier", why: "Vectorised pairwise distances and deterministic tie-breaking." },
      { problem: "kmeans-full", why: "K-means with k-means++ initialisation and empty clusters handled." },
      { problem: "decision-tree-split", why: "Gini impurity, the score a tree uses to pick its splits." },
      { problem: "precision-recall-f1", why: "Precision, recall and F1, including the zero-division cases." },
      { problem: "roc-auc", why: "ROC AUC with tied scores, a common follow-up question." },
      { problem: "mlp-forward-backward", why: "A two-layer network's forward and backward pass by hand." },
      { problem: "scaled-dot-product-attention", why: "Attention, now standard in interviews for LLM roles." },
    ],
  }),
  path({
    id: "build-a-transformer",
    title: "Build a transformer",
    tagline: "From a single attention head to a working mini GPT.",
    description:
      "Build every part of a transformer in NumPy, then put the parts together. You will write attention, masking, multi-head projections, positional information and normalisation, assemble an encoder block, train a character-level GPT, and debug a broken one.",
    outcomes: [
      "Write scaled dot-product and multi-head attention with correct shapes and masking",
      "Explain why transformers need positional information and compare sinusoidal encodings with RoPE",
      "Assemble, train and debug a small GPT from your own components",
    ],
    level: "Intermediate",
    prerequisites: "NumPy and a basic neural network (forward pass and softmax)",
    steps: [
      { problem: "scaled-dot-product-attention", why: "The core operation: queries, keys, values and the 1/√d scale." },
      { problem: "causal-mask", why: "Stop each position from attending to the future." },
      { problem: "multi-head-attention", why: "Split into heads, attend in parallel and project back." },
      { problem: "positional-encoding", why: "Sinusoidal encodings: give attention a sense of order." },
      { problem: "rope-embeddings", why: "Rotary embeddings, the positional scheme most current LLMs use." },
      { problem: "layer-norm", why: "LayerNorm and where it sits in a pre-norm block." },
      { problem: "bpe-tokenization", why: "Byte-pair encoding: how text becomes token ids." },
      { problem: "e2e-transformer", why: "Assemble a full encoder block: attention, MLP, residuals and norms." },
      { problem: "e2e-mini-gpt", why: "Train a character-level GPT and generate text from it." },
      { problem: "transformer-bug-hunt", why: "Find and fix the bugs in a broken mini GPT." },
    ],
  }),
  path({
    id: "llm-internals",
    title: "LLM inference and training internals",
    tagline: "How modern LLMs decode, run fast and get aligned.",
    description:
      "The techniques behind production language models, one at a time: sampling strategies, the KV cache, grouped-query attention, the SwiGLU block, the FlashAttention softmax trick, mixture-of-experts routing, speculative decoding, preference optimisation and quantisation.",
    outcomes: [
      "Implement the decoding strategies and explain how each trades quality for diversity",
      "Explain where inference time and memory go, and how the KV cache, GQA and speculative decoding reduce them",
      "Write the DPO and GRPO objectives used to align models after pre-training",
    ],
    level: "Advanced",
    prerequisites: "The Build a transformer path, or equivalent experience",
    steps: [
      { problem: "llm-temperature-scaling", why: "Temperature: reshape the next-token distribution." },
      { problem: "llm-top-p-sampling", why: "Nucleus sampling and its edge cases." },
      { problem: "llm-kv-cache", why: "Cache keys and values so each new token costs O(n), not O(n²)." },
      { problem: "grouped-query-attention", why: "Share key/value heads to shrink the KV cache." },
      { problem: "rmsnorm-swiglu", why: "The SwiGLU feed-forward block used in LLaMA-style models." },
      { problem: "online-softmax", why: "The one-pass softmax that makes FlashAttention possible." },
      { problem: "moe-routing", why: "Top-k expert routing and load balancing in mixture-of-experts." },
      { problem: "llm-speculative-decoding", why: "Draft with a small model, verify with the large one." },
      { problem: "perplexity", why: "Token cross-entropy and perplexity, the standard LM metric." },
      { problem: "rl-dpo-loss", why: "Direct preference optimisation: align without a reward model." },
      { problem: "grpo-advantages", why: "GRPO's group-relative advantages, used for reasoning models." },
      { problem: "int8-quantization", why: "Absmax int8 quantisation and the error it introduces." },
    ],
  }),
];

export const sevenDayChallenge: LearningPath = path({
  id: "seven-day-challenge",
  title: "7-day ML coding challenge",
  tagline: "One short exercise a day, from a NumPy warm-up to attention.",
  description:
    "Seven short exercises, one a day, each building on the last: vectorised NumPy, broadcasting, a stable softmax, training a linear model, a dense layer, k-means and attention. Start any day and go at your own pace.",
  outcomes: [
    "Build a daily habit of short, focused implementation practice",
    "Go from vectorised NumPy to your first attention function in a week",
    "Know which full path to take next",
  ],
  level: "Beginner",
  prerequisites: "Basic Python; some NumPy helps",
  steps: [
    { problem: "numpy-array-sum", why: "Vectorise your first function." },
    { problem: "numpy-broadcasting", why: "Broadcasting, the rule behind most shape bugs." },
    { problem: "backpropagation", why: "A softmax that never overflows." },
    { problem: "linear-regression-gd", why: "Train your first model with gradient descent." },
    { problem: "neural-network-forward", why: "A dense layer, the building block of neural networks." },
    { problem: "kmeans-clustering", why: "K-means assignment, vectorised." },
    { problem: "scaled-dot-product-attention", why: "Attention, the core of every transformer." },
  ],
});

export const allPaths = [...learningPaths, sevenDayChallenge];

export const pathHref = (p: LearningPath) =>
  p.id === sevenDayChallenge.id ? "/challenge" : `/learn/${p.id}`;

export const problemHref = (id: string) => {
  const problem = getProblemById(id);
  if (!problem) throw new Error(`Unknown learning path problem: ${id}`);
  return `/problem/${problem.section}/${problem.id}`;
};
