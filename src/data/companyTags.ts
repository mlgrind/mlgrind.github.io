/**
 * "Reported in interviews at <Company>" tags.
 *
 * Each tag cites a public interview report (Glassdoor, 1point3acres, PracHub,
 * Dataford, Blind) that names the company and asks for this problem's task.
 * The sources were collected from search results and have NOT been opened and
 * checked by a person yet: docs/company-tags-review.md is the checklist the
 * maintainer ticks before deploying. Remove a tag here if its source doesn't hold up.
 *
 * Only "high" (first-hand candidate report) and "medium" (question bank that
 * attributes the question to the company) tags are included. Tags that were
 * considered and rejected are listed in docs/company-tags-review.md and guarded
 * by src/__tests__/companyTags.test.ts.
 */

export type CompanyTagConfidence = 'high' | 'medium';

export interface CompanyTag {
  /** Company name as displayed, e.g. "Meta". */
  company: string;
  /** Public source of the report (https only). */
  url: string;
  /** Short verbatim excerpt from the source's title or snippet. */
  quote: string;
  /** Month of the report (YYYY-MM) when the source gives one. */
  date?: string;
  /** "high": first-hand candidate report. "medium": attributed in a question bank. */
  confidence: CompanyTagConfidence;
  /** What the source asked for, in our words. */
  topic: string;
}

export const companyTags: Record<string, CompanyTag[]> = {
  'multi-head-attention': [
    {
      company: "Uber",
      url: "https://www.1point3acres.com/interview/thread/1168284",
      quote: "A positive Uber machine learning phone screen discussing PyTorch implementation of multi-head self-attention with supportive interviewers providing timely hints.",
      confidence: 'high',
      topic: "multi-head self-attention from scratch",
    },
    {
      company: "ByteDance",
      url: "https://www.1point3acres.com/interview/thread/1140882",
      quote: "ByteDance TikTok Research Scientist Interview Experience and Coding Questions ... coding questions about multi-head attention and topp sampling",
      confidence: 'high',
      topic: "multi-head self-attention from scratch",
    },
    {
      company: "Apple",
      url: "https://prachub.com/interview-questions/implement-masked-multi-head-self-attention",
      quote: "Implement Masked Multi-Head Self-Attention (Apple, Machine Learning Engineer, Technical Screen)",
      date: "2026-04",
      confidence: 'medium',
      topic: "multi-head self-attention from scratch",
    },
    {
      company: "Meta",
      url: "https://prachub.com/interview-questions/implement-the-forward-pass-of-multi-head-attention-from-scratch",
      quote: "Implement the Forward Pass of Multi-Head Attention From Scratch (Meta, Machine Learning Engineer, Technical Screen)",
      date: "2026-09",
      confidence: 'medium',
      topic: "multi-head self-attention from scratch",
    },
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/implement-multi-head-attention-with-a-kv-cache-and-cached-grouped-query-attention",
      quote: "Implement Multi-Head Attention with a KV Cache and Cached Grouped-Query Attention (Amazon, Machine Learning Engineer, Onsite)",
      date: "2026-01",
      confidence: 'medium',
      topic: "multi-head self-attention from scratch",
    },
  ],
  'scaled-dot-product-attention': [
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/implement-stable-sigmoid-softmax-and-scaled-dot-product-attention",
      quote: "Implement stable sigmoid, softmax and scaled dot-product attention. Company: Amazon. Role: Machine Learning Engineer. Interview Round: Technical Screen.",
      confidence: 'medium',
      topic: "scaled dot-product attention",
    },
  ],
  'grouped-query-attention': [
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/implement-multi-head-attention-with-a-kv-cache-and-cached-grouped-query-attention",
      quote: "the layer has n_heads query heads but only n_kv_heads key/value heads, where n_kv_heads divides n_heads",
      date: "2026-01",
      confidence: 'medium',
      topic: "grouped-query attention",
    },
    {
      company: "Datadog",
      url: "https://prachub.com/interview-questions/implement-grouped-query-attention-gqa",
      quote: "Implement Grouped-Query Attention (GQA) (Datadog, Technical Screen)",
      confidence: 'medium',
      topic: "grouped-query attention",
    },
  ],
  'llm-kv-cache': [
    {
      company: "OpenAI",
      url: "https://prachub.com/interview-experiences/openai-machine-learning-engineer-interview-experience-four-one-hour-rounds-in-a-single-phone-screen",
      quote: "Get a miniGPT to produce correct text, then as a follow-up implement KV cache, all in PyTorch.",
      date: "2026-04",
      confidence: 'high',
      topic: "KV cache",
    },
    {
      company: "Augment",
      url: "https://www.1point3acres.com/interview/thread/1153461",
      quote: "Augment Tech Phone Screen: Top K Text Generation and KV Caching Implementation",
      confidence: 'high',
      topic: "KV cache",
    },
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/implement-multi-head-attention-with-a-kv-cache-and-cached-grouped-query-attention",
      quote: "Implement Multi-Head Attention with a KV Cache and Cached Grouped-Query Attention (Amazon, Machine Learning Engineer, Onsite)",
      date: "2026-01",
      confidence: 'medium',
      topic: "KV cache",
    },
  ],
  'llm-top-k-sampling': [
    {
      company: "Augment",
      url: "https://www.1point3acres.com/interview/thread/1153461",
      quote: "Augment Tech Phone Screen: Top K Text Generation and KV Caching Implementation",
      confidence: 'high',
      topic: "top-k / top-p sampling",
    },
    {
      company: "Cohere",
      url: "https://prachub.com/interview-questions/implement-greedy-top-k-and-top-p-decoding-in-numpy-for-a-toy-language-model",
      quote: "Implement greedy, top-k and top-p decoding with NumPy for a toy 10-token language model",
      date: "2026-09",
      confidence: 'medium',
      topic: "top-k / top-p sampling",
    },
    {
      company: "Mistral AI",
      url: "https://dataford.io/questions/top-k-and-top-p-sampling",
      quote: "sample_token(logits, top_k=None, top_p=None, seed=0)",
      confidence: 'medium',
      topic: "top-k / top-p sampling",
    },
    {
      company: "Scale AI",
      url: "https://prachub.com/interview-questions/implement-multi-head-attention-and-llm-sampling",
      quote: "Implement multi-head attention and LLM sampling (Scale AI, Machine Learning Engineer, Onsite)",
      date: "2026-02",
      confidence: 'medium',
      topic: "top-k / top-p sampling",
    },
  ],
  'llm-top-p-sampling': [
    {
      company: "ByteDance",
      url: "https://www.1point3acres.com/interview/thread/1140882",
      quote: "coding questions about multi-head attention and topp sampling, including follow-ups",
      confidence: 'high',
      topic: "top-k / top-p sampling",
    },
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/implement-top-p-nucleus-sampling-in-numpy",
      quote: "Implement Top-p (Nucleus) Sampling in NumPy (Amazon, Machine Learning Engineer, Onsite)",
      date: "2026-06",
      confidence: 'medium',
      topic: "top-k / top-p sampling",
    },
    {
      company: "Cohere",
      url: "https://prachub.com/interview-questions/implement-greedy-top-k-and-top-p-decoding-in-numpy-for-a-toy-language-model",
      quote: "Implement greedy, top-k and top-p decoding with NumPy for a toy 10-token language model",
      date: "2026-09",
      confidence: 'medium',
      topic: "top-k / top-p sampling",
    },
    {
      company: "Mistral AI",
      url: "https://dataford.io/questions/top-k-and-top-p-sampling",
      quote: "sample_token(logits, top_k=None, top_p=None, seed=0)",
      confidence: 'medium',
      topic: "top-k / top-p sampling",
    },
    {
      company: "Scale AI",
      url: "https://dataford.io/questions/sampling-from-scratch",
      quote: "Implement temperature scaling and nucleus, or top-p, sampling from scratch without using machine learning libraries.",
      confidence: 'medium',
      topic: "top-k / top-p sampling",
    },
  ],
  'llm-temperature-scaling': [
    {
      company: "Scale AI",
      url: "https://dataford.io/questions/sampling-from-scratch",
      quote: "Implement temperature scaling and nucleus, or top-p, sampling from scratch without using machine learning libraries.",
      confidence: 'medium',
      topic: "temperature sampling",
    },
  ],
  'llm-beam-search': [
    {
      company: "Microsoft",
      url: "https://www.1point3acres.com/interview/thread/1167121",
      quote: "Microsoft Tech Phone Screen: Implementing Beam Search for Large Language Models",
      confidence: 'high',
      topic: "beam search",
    },
    {
      company: "Cresta",
      url: "https://prachub.com/interview-questions/implement-greedy-and-beam-decoding",
      quote: "Implement greedy and beam decoding (Cresta, ML Engineer, Technical Screen)",
      date: "2025-09",
      confidence: 'medium',
      topic: "beam search",
    },
  ],
  'llm-speculative-decoding': [
    {
      company: "SpaceX",
      url: "https://prachub.com/interview-experiences/spacex-new-grad-research-scientist-interview-experience-speculative-decoding-in-a-60-minute-ml-coding-round",
      quote: "SpaceX New Grad Research Scientist Interview Experience — Speculative Decoding in a 60-Minute ML Coding Round",
      date: "2026-09",
      confidence: 'high',
      topic: "speculative decoding",
    },
  ],
  'bpe-tokenization': [
    {
      company: "Glean",
      url: "https://prachub.com/interview-questions/implement-a-byte-pair-encoding-bpe-tokenizer",
      quote: "repeatedly merges the most frequent adjacent pair of tokens into a new single token (Glean, Software Engineer, Technical Screen)",
      confidence: 'medium',
      topic: "BPE tokenizer",
    },
  ],
  'infonce-loss': [
    {
      company: "Uber",
      url: "https://www.1point3acres.com/interview/thread/1176190",
      quote: "Uber Machine Learning Engineer Phone Interview: Implementing CLIP Style Contrastive Loss",
      confidence: 'high',
      topic: "CLIP / InfoNCE contrastive loss",
    },
  ],
  'embedding-search': [
    {
      company: "Harvey",
      url: "https://prachub.com/interview-questions/embedding-retrieval-with-cosine-similarity-in-a-notebook-and-choosing-the-metric",
      quote: "Embedding Retrieval with Cosine Similarity in a Notebook, and Choosing the Metric (Harvey, Software Engineer, Onsite)",
      confidence: 'medium',
      topic: "cosine top-k embedding search",
    },
  ],
  'int8-quantization': [
    {
      company: "NVIDIA",
      url: "https://prachub.com/interview-questions/fp32-to-int8-tensor-quantization-scale-zero-point-clipping-and-outliers",
      quote: "Implement FP32-to-int8 tensor quantization in NumPy, then extend it with a zero point for asymmetric quantization",
      confidence: 'medium',
      topic: "int8 quantization",
    },
  ],
  'grpo-advantages': [
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/grpo-in-numpy-group-relative-advantages-process-rewards-and-shaped-rewards",
      quote: "Implement the core of Group Relative Policy Optimization in a NumPy notebook: group-normalized advantages, the clipped objective with a KL penalty",
      confidence: 'medium',
      topic: "GRPO advantages",
    },
  ],
  'label-smoothing': [
    {
      company: "OpenAI",
      url: "https://prachub.com/interview-questions/implement-masked-cross-entropy-with-label-smoothing",
      quote: "Implement numerically stable masked cross-entropy in NumPy with label smoothing and optional temperature scaling.",
      confidence: 'medium',
      topic: "softmax / cross-entropy (stable)",
    },
  ],
  'backpropagation': [
    {
      company: "XPeng",
      url: "https://prachub.com/coding-questions/implement-stable-softmax",
      quote: "Implement stable softmax. Company: XPeng. Role: Software Engineer. Interview Round: Technical Screen.",
      confidence: 'medium',
      topic: "softmax / cross-entropy (stable)",
    },
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/implement-stable-sigmoid-softmax-and-scaled-dot-product-attention",
      quote: "Implement stable sigmoid, softmax and scaled dot-product attention. Company: Amazon. Role: Machine Learning Engineer.",
      confidence: 'medium',
      topic: "softmax / cross-entropy (stable)",
    },
  ],
  'logistic-regression': [
    {
      company: "Amazon",
      url: "https://prachub.com/interview-questions/implement-stable-sigmoid-softmax-and-scaled-dot-product-attention",
      quote: "Implement stable sigmoid, softmax and scaled dot-product attention. Company: Amazon. Role: Machine Learning Engineer.",
      confidence: 'medium',
      topic: "stable sigmoid",
    },
  ],
  'mlp-forward-backward': [
    {
      company: "Anthropic",
      url: "https://prachub.com/interview-questions/implement-and-derive-backprop-from-scratch",
      quote: "From first principles, implement a tiny neural network for binary classification with one hidden layer.",
      date: "2025-09",
      confidence: 'medium',
      topic: "MLP backprop from scratch",
    },
  ],
  'e2e-mlp': [
    {
      company: "Anthropic",
      url: "https://prachub.com/interview-questions/implement-and-derive-backprop-from-scratch",
      quote: "From first principles, implement a tiny neural network for binary classification with one hidden layer.",
      date: "2025-09",
      confidence: 'medium',
      topic: "MLP backprop from scratch",
    },
  ],
  'dropout': [
    {
      company: "Wadhwani AI",
      url: "https://www.glassdoor.com/Interview/Coding-write-a-small-neural-network-and-write-code-for-both-forward-and-backward-pass-through-a-dropout-layer-ML-Probabil-QTN_6362298.htm",
      quote: "Coding: write a small neural network and write code for both forward and backward pass through a dropout layer",
      confidence: 'high',
      topic: "dropout",
    },
  ],
  'focal-loss': [
    {
      company: "Datadog",
      url: "https://prachub.com/interview-questions/implement-focal-loss-for-class-imbalanced-classification",
      quote: "Implement focal loss for class-imbalanced classification (Datadog, Machine Learning Engineer, Technical Screen)",
      date: "2026-06",
      confidence: 'medium',
      topic: "focal loss",
    },
  ],
  'iou-bounding-box': [
    {
      company: "TuSimple",
      url: "https://www.glassdoor.com/Interview/Compute-the-intersection-over-union-given-2-rectangles-For-Each-rectangle-input-representation-would-be-topleft-vertex-a-QTN_4041997.htm",
      quote: "Compute the intersection over union, given 2 rectangles. For Each rectangle input representation would be topleft vertex and bottom right vertex.",
      date: "2020-12",
      confidence: 'high',
      topic: "IoU",
    },
  ],
  'conv2d-forward': [
    {
      company: "NVIDIA",
      url: "https://prachub.com/interview-questions/implement-2d-convolution-using-numpy-slicing",
      quote: "implement 2D convolution on a 4×4 input and a 3×3 filter with stride 1, returning a 2×2 output (NVIDIA, Technical Screen)",
      confidence: 'medium',
      topic: "2D convolution",
    },
  ],
  'conv2d-advanced': [
    {
      company: "Tesla",
      url: "https://prachub.com/interview-questions/implement-2d-convolution-forward-pass",
      quote: "input tensor x with shape (N, C_in, H, W) (NCHW layout) ... different strides/padding (Tesla, ML Engineer, Technical Screen)",
      date: "2026-03",
      confidence: 'medium',
      topic: "2D convolution",
    },
  ],
  'logistic-regression-full': [
    {
      company: "Uber",
      url: "https://prachub.com/interview-questions/implement-linear-and-logistic-regression",
      quote: "Implement linear and logistic regression. Company: Uber. Role: Machine Learning Engineer. Interview Round: Technical Screen.",
      confidence: 'medium',
      topic: "logistic regression from scratch",
    },
  ],
  'linear-regression-gd': [
    {
      company: "Databricks",
      url: "https://prachub.com/interview-questions/implement-simple-linear-regression-with-gradient-descent-from-scratch",
      quote: "Implement Simple Linear Regression with Gradient Descent from Scratch (Databricks, ML Engineer, Onsite)",
      confidence: 'medium',
      topic: "linear regression with gradient descent",
    },
    {
      company: "Pinterest",
      url: "https://prachub.com/interview-questions/implement-linear-regression-with-batch-gradient-descent-from-scratch",
      quote: "linear regression trained with batch gradient descent, from scratch, in plain Python or NumPy",
      date: "2026-10",
      confidence: 'medium',
      topic: "linear regression with gradient descent",
    },
  ],
  'knn-classifier': [
    {
      company: "Amazon",
      url: "https://www.glassdoor.ca/Interview/-coding-challenge-implement-a-KNN-class-QTN_7917913.htm",
      quote: "(coding challenge) implement a KNN class",
      date: "2025-01",
      confidence: 'high',
      topic: "k-NN from scratch",
    },
    {
      company: "Pinterest",
      url: "https://prachub.com/interview-questions/implement-a-k-nearest-neighbors-classifier-from-scratch",
      quote: "Implement a k-Nearest Neighbors Classifier from Scratch (Pinterest, Machine Learning Engineer, Online Assessment)",
      confidence: 'medium',
      topic: "k-NN from scratch",
    },
    {
      company: "J.P. Morgan",
      url: "https://prachub.com/interview-questions/implement-knn-from-scratch",
      quote: "Implement a k-nearest neighbors (KNN) classifier from scratch in Python without using scikit-learn's KNN implementation.",
      confidence: 'medium',
      topic: "k-NN from scratch",
    },
  ],
  'naive-bayes': [
    {
      company: "Moloco",
      url: "https://dataford.io/questions/write-a-clean-working-implementation-of-a-naive-bayes-classifier-from-scratch",
      quote: "Write a clean, working implementation of a Naive Bayes classifier from scratch.",
      confidence: 'medium',
      topic: "naive Bayes from scratch",
    },
  ],
};

const confidenceRank: Record<CompanyTagConfidence, number> = { high: 0, medium: 1 };

/** Tags for a problem, first-hand reports first. */
export function getCompanyTags(problemId: string): CompanyTag[] {
  const tags = companyTags[problemId] ?? [];
  return [...tags].sort((a, b) => confidenceRank[a.confidence] - confidenceRank[b.confidence]);
}

/** Distinct companies reported for a problem, first-hand reports first. */
export function getCompanies(problemId: string): string[] {
  return [...new Set(getCompanyTags(problemId).map(tag => tag.company))];
}

/** URL-safe id for a company, e.g. "J.P. Morgan" -> "j-p-morgan". */
export function companySlug(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export interface CompanyEntry {
  company: string;
  slug: string;
  problemIds: string[];
}

/** Every company with the problems reported for it, by problem count then name. */
export function getCompanyIndex(): CompanyEntry[] {
  const byCompany = new Map<string, string[]>();
  for (const [problemId, tags] of Object.entries(companyTags)) {
    for (const company of new Set(tags.map(tag => tag.company))) {
      byCompany.set(company, [...(byCompany.get(company) ?? []), problemId]);
    }
  }
  return [...byCompany.entries()]
    .map(([company, problemIds]) => ({ company, slug: companySlug(company), problemIds }))
    .sort((a, b) => b.problemIds.length - a.problemIds.length || a.company.localeCompare(b.company));
}
