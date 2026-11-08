import { Problem } from '../../types';

export const llmGenerationProblems: Problem[] = [
  {
    id: 'llm-temperature-scaling',
    title: 'Temperature Scaling',
    section: 'llm-generation',
    difficulty: 'easy',
    description: `
## Temperature Scaling

### What you'll build
Turn a vector of next-token logits into probabilities with a temperature \`T\`: divide the logits by \`T\`, then take a numerically stable softmax.

### Background
At every generation step the model outputs one logit per vocabulary token. Temperature is the first knob every decoding API exposes. Dividing by \`T < 1\` stretches the gaps between logits, so the distribution gets sharper (more deterministic); \`T > 1\` shrinks the gaps and flattens it (more diverse, more mistakes). It never changes the **ranking** of tokens, only how peaked the distribution is.

### Formula
\`\`\`text
z_i   = logits_i / T
p_i   = exp(z_i - max(z)) / sum_j exp(z_j - max(z))
\`\`\`
Subtracting \`max(z)\` doesn't change the result (it cancels in the ratio) but keeps \`exp\` from overflowing.

| Temperature | Effect |
|-------------|--------|
| \`T -> 0\` | all mass on the argmax (greedy decoding) |
| \`T < 1\` | sharper than the model's distribution |
| \`T = 1\` | the model's own distribution |
| \`T > 1\` | flatter; \`T -> inf\` approaches uniform |

### Inputs
- \`logits\`: float array \`(vocab_size,)\` (a list also works)
- \`temperature\`: float \`> 0\`, default 1.0

### Expected Return Format
\`probs\`: float array \`(vocab_size,)\`, non-negative, sums to 1.

### Edge cases and conventions
- Very small \`T\` (e.g. 0.01) makes the scaled logits huge; the max subtraction keeps the result finite.
- \`T = 0\` itself is undefined (division by zero); real APIs special-case it as greedy argmax. You don't need to handle it here.

### Constraints
NumPy only, vectorised.

### Follow-up
- Show that temperature scaling preserves the argmax and the ranking.
- Temperature is also used to **calibrate** a classifier after training (Guo et al., 2017). How would you fit \`T\` on a validation set?
`,
    examples: [
      {
        input: 'temperature_scaling(np.array([2.0, 1.0, 0.1]), temperature=0.5)',
        output: '[0.8638, 0.1169, 0.0193]',
        explanation: 'Dividing by 0.5 doubles the logit gaps, so the top token dominates (vs 0.659 at T=1).',
      },
      {
        input: 'temperature_scaling(np.array([2.0, 1.0, 0.1]), temperature=2.0)',
        output: '[0.5017, 0.3043, 0.194]',
        explanation: 'Dividing by 2 halves the gaps and flattens the distribution.',
      },
    ],
    starterCode: `import numpy as np

def temperature_scaling(logits, temperature=1.0):
    """
    Apply temperature scaling to logits and return probabilities.

    Args:
        logits: Raw logits from the model (vocab_size,)
        temperature: Temperature T > 0

    Returns:
        probs: softmax(logits / T), shape (vocab_size,), sums to 1
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Values at T=0.5 and T=2',
        input: '(lambda z: (np.round(temperature_scaling(z, 0.5), 4).tolist(), np.round(temperature_scaling(z, 2.0), 4).tolist()))(np.array([2.0, 1.0, 0.1]))',
        expected: '([0.8638, 0.1169, 0.0193], [0.5017, 0.3043, 0.194])',
        hidden: false,
      },
      {
        id: '2',
        description: 'Temperature=1 gives the standard softmax',
        input: '(lambda z: bool(np.allclose(temperature_scaling(z, 1.0), np.exp(z - z.max()) / np.exp(z - z.max()).sum())))(np.array([2.0, 1.0, 0.1]))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Probabilities sum to 1',
        input: 'bool(np.isclose(np.sum(temperature_scaling(np.array([1.0, 2.0, 3.0, 4.0]), 0.7)), 1.0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Very low temperature approaches argmax and stays finite',
        input: '(lambda p: (round(float(p[0]), 4), bool(np.all(np.isfinite(p)))))(temperature_scaling(np.array([3.0, 1.0, 0.5]), 0.01))',
        expected: '(1.0, True)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Very high temperature approaches uniform',
        input: 'np.round(temperature_scaling(np.array([5.0, 0.0, -5.0, 2.0]), 1000.0), 2).tolist()',
        expected: '[0.25, 0.25, 0.25, 0.25]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Ranking is preserved',
        input: '(lambda z: np.argsort(temperature_scaling(z, 3.0)).tolist() == np.argsort(z).tolist())(np.array([0.3, -1.2, 2.5, 0.9, 1.1]))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Temperature acts on the logits, before the softmax. What does dividing by a number below 1 do to the gaps between logits?',
      'Two steps: scale (logits / temperature), then a numerically stable softmax.',
      'scaled = logits / temperature; e = np.exp(scaled - scaled.max()); probs = e / e.sum().',
      'Subtract the max after scaling, not before: with T = 0.01 the scaled logits are 100x larger and overflow np.exp otherwise.',
    ],
    solution: `import numpy as np

def temperature_scaling(logits, temperature=1.0):
    """
    Returns:
        probs: softmax(logits / temperature), shape (vocab_size,)
    """
    scaled = np.asarray(logits, dtype=np.float64) / temperature
    exp_vals = np.exp(scaled - np.max(scaled))   # stable: largest exponent is 0
    return exp_vals / np.sum(exp_vals)

# O(V) time and memory
`,
  },
  {
    id: 'llm-top-k-sampling',
    title: 'Top-k Sampling',
    section: 'llm-generation',
    difficulty: 'easy',
    description: `
## Top-k Sampling

### What you'll build
Sample the next token from only the \`k\` most likely tokens: apply temperature, keep the top \`k\` logits, renormalize, and draw one token. Return the token and the filtered distribution.

### Background
Pure sampling from the full softmax occasionally picks a token from the long tail of thousands of unlikely tokens, and one bad token can derail the rest of the text. Top-k (Fan et al., 2018; GPT-2 used \`k = 40\`) truncates the tail. Its weakness is that \`k\` is fixed: when the model is confident, \`k = 40\` still admits 39 poor tokens; when it is uncertain, 40 may cut off good ones. **Top-p** (next problem) adapts the cutoff instead.

### Algorithm
1. \`z = logits / temperature\`.
2. Find the indices of the \`k\` largest values of \`z\`.
3. Set every other logit to \`-inf\`.
4. Softmax (stable) over the result: the kept tokens renormalize to sum to 1, the rest get exactly 0.
5. Sample one token index from that distribution.

### Inputs
- \`logits\`: float array \`(vocab_size,)\`
- \`k\`: int, \`1 <= k <= vocab_size\`
- \`temperature\`: float \`> 0\`, default 1.0 (applied **before** filtering)

### Expected Return Format
A tuple \`(token, filtered_probs)\`:
- \`token\`: Python \`int\`, an index whose filtered probability is \`> 0\`
- \`filtered_probs\`: float array \`(vocab_size,)\` with exactly \`k\` non-zero entries summing to 1

### Edge cases and conventions
- Keep the \`np.random.seed(42)\` line from the starter and sample with \`np.random.choice(len(probs), p=probs)\`, so runs are reproducible.
- \`k = 1\` is greedy decoding: the argmax gets probability 1.
- Tests avoid ties at the \`k\`-th largest logit, so any tie-breaking is fine.

### Constraints
NumPy only. \`np.argsort\` or \`np.argpartition\` for the top-k.

### Follow-up
- \`np.argpartition\` finds the top-k in \`O(V)\` instead of \`O(V log V)\`. Does that matter for a 128k vocabulary on a GPU?
- How do top-k and temperature interact if you apply temperature **after** filtering instead?
`,
    examples: [
      {
        input: 'top_k_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), k=3)',
        output: '(token in {0, 1, 2}, filtered_probs = [0.8438, 0.1142, 0.042, 0.0, 0.0])',
        explanation: 'Only the three largest logits survive; softmax([5, 3, 2]) renormalizes them.',
      },
      {
        input: 'top_k_sampling(np.array([2.0, 0.0, 4.0, 1.0, -1.0]), k=3, temperature=2.0)',
        output: 'filtered_probs = [0.2312, 0.0, 0.6285, 0.1402, 0.0]',
        explanation: 'Temperature first (logits become [1, 0, 2, 0.5, -0.5]), then keep the top 3.',
      },
    ],
    starterCode: `import numpy as np

def top_k_sampling(logits, k, temperature=1.0):
    """
    Sample from the top-k most likely tokens.

    Args:
        logits: Raw logits (vocab_size,)
        k: Number of top tokens to keep
        temperature: Temperature, applied before filtering

    Returns:
        token: Sampled token index (int)
        filtered_probs: (vocab_size,), k non-zero entries summing to 1
    """
    np.random.seed(42)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Filtered distribution values (k=3)',
        input: 'np.round(top_k_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 3)[1], 4).tolist()',
        expected: '[0.8438, 0.1142, 0.042, 0.0, 0.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Sampled token is within the top k',
        input: '(lambda r: r[0] in [0, 1, 2] and isinstance(r[0], int))(top_k_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Exactly k tokens keep probability and they sum to 1',
        input: '(lambda p: (int(np.sum(p > 0)), round(float(p.sum()), 6)))(top_k_sampling(np.random.randn(20), 5)[1])',
        expected: '(5, 1.0)',
        hidden: true,
      },
      {
        id: '4',
        description: 'k=1 always picks the top token',
        input: '(lambda r: (r[0], r[1].tolist()))(top_k_sampling(np.array([1.0, 5.0, 2.0, 0.5]), 1))',
        expected: '(1, [0.0, 1.0, 0.0, 0.0])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Filtered distribution values (k=2)',
        input: 'np.round(top_k_sampling(np.array([1.0, 5.0, 2.0, 0.5]), 2)[1], 4).tolist()',
        expected: '[0.0, 0.9526, 0.0474, 0.0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Temperature is applied before filtering (k=3, T=2)',
        input: 'np.round(top_k_sampling(np.array([2.0, 0.0, 4.0, 1.0, -1.0]), 3, 2.0)[1], 4).tolist()',
        expected: '[0.2312, 0.0, 0.6285, 0.1402, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      'You need two things: which k tokens survive, and a renormalized distribution over just those tokens.',
      'Scale by the temperature, mask every logit outside the top k to -inf, softmax, then sample.',
      'top_idx = np.argsort(scaled)[-k:]; filtered = np.full_like(scaled, -np.inf); filtered[top_idx] = scaled[top_idx]; token = np.random.choice(len(probs), p=probs).',
      'Masking to -inf before the softmax renormalizes automatically; zeroing probabilities after the softmax also works but then you must divide by their sum. Return int(token), not a NumPy integer.',
    ],
    solution: `import numpy as np

def top_k_sampling(logits, k, temperature=1.0):
    """
    Returns:
        (token (int), filtered_probs (vocab_size,))
    """
    np.random.seed(42)
    scaled = np.asarray(logits, dtype=np.float64) / temperature

    # Keep the k largest logits; everything else becomes -inf (probability 0)
    top_k_idx = np.argsort(scaled)[-k:]
    filtered = np.full_like(scaled, -np.inf)
    filtered[top_k_idx] = scaled[top_k_idx]

    # Stable softmax over the kept tokens (exp(-inf) = 0)
    exp_vals = np.exp(filtered - np.max(filtered))
    probs = exp_vals / np.sum(exp_vals)

    token = np.random.choice(len(probs), p=probs)
    return int(token), probs

# O(V log V) for the sort (O(V) with np.argpartition)
`,
  },
  {
    id: 'llm-top-p-sampling',
    title: 'Nucleus (Top-p) Sampling',
    section: 'llm-generation',
    difficulty: 'medium',
    description: `
## Nucleus (Top-p) Sampling

### What you'll build
Sample from the **nucleus**: the smallest set of most-likely tokens whose total probability reaches \`p\`. Return the sampled token and the filtered, renormalized distribution.

### Background
Top-k keeps a fixed number of tokens. Nucleus sampling (Holtzman et al., 2019) keeps a fixed amount of **probability mass** instead, so the cutoff adapts: after "The capital of France is", one token holds 95% of the mass and the nucleus is tiny; after "My favourite food is", the distribution is flat and the nucleus is large. Most chat APIs expose \`top_p\` (often 0.9 to 0.95) alongside temperature.

### Algorithm
1. \`probs = softmax(logits / temperature)\` (stable).
2. Sort the probabilities in descending order and take the cumulative sum \`c\`.
3. Keep the sorted tokens up to and **including** the first one where \`c >= p\` (the token that crosses the threshold is in the nucleus).
4. Zero out every other token and renormalize the kept ones to sum to 1.
5. Sample one token from the result.

### Inputs
- \`logits\`: float array \`(vocab_size,)\`
- \`p\`: float in \`(0, 1]\`
- \`temperature\`: float \`> 0\`, default 1.0 (applied before the nucleus is computed)

### Expected Return Format
A tuple \`(token, filtered_probs)\`:
- \`token\`: Python \`int\`, an index inside the nucleus
- \`filtered_probs\`: float array \`(vocab_size,)\`, non-zero exactly on the nucleus, sums to 1

### Edge cases and conventions
- The most likely token is always kept, even if its probability alone exceeds \`p\`.
- \`p = 1.0\` keeps every token with non-zero probability.
- Keep the \`np.random.seed(42)\` line and sample with \`np.random.choice(len(probs), p=probs)\`.
- Equivalent rule: keep a sorted token if the mass **before** it, \`c - prob\`, is still \`< p\`.

### Constraints
NumPy only: \`np.argsort\`, \`np.cumsum\`, \`np.searchsorted\` (or a boolean mask).

### Follow-up
- In practice, frameworks apply temperature, then top-k, then top-p. Does the order of top-k and top-p matter?
- What goes wrong with top-p when the model is over-confident and wrong? (See min-p sampling for one fix.)
`,
    examples: [
      {
        input: 'top_p_sampling(np.array([2.0, 1.0, 0.5, 0.1, -1.0]), p=0.8)',
        output: 'filtered_probs = [0.6285, 0.2312, 0.1402, 0.0, 0.0]',
        explanation: 'Probabilities are [0.5585, 0.2055, 0.1246, 0.0835, 0.0278]; the cumulative sum first reaches 0.8 at the third token (0.8886), so three tokens are kept and renormalized.',
      },
      {
        input: 'top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), p=0.5)',
        output: '(0, [1.0, 0.0, 0.0, 0.0, 0.0])',
        explanation: 'The top token alone has probability 0.8258 >= 0.5, so the nucleus is just token 0.',
      },
    ],
    starterCode: `import numpy as np

def top_p_sampling(logits, p, temperature=1.0):
    """
    Nucleus (top-p) sampling from logits.

    Args:
        logits: Raw logits (vocab_size,)
        p: Cumulative probability threshold (0 < p <= 1)
        temperature: Temperature, applied first

    Returns:
        token: Sampled token index (int)
        filtered_probs: (vocab_size,), non-zero on the nucleus only, sums to 1
    """
    np.random.seed(42)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Nucleus includes the token that crosses p',
        input: 'np.round(top_p_sampling(np.array([2.0, 1.0, 0.5, 0.1, -1.0]), 0.8)[1], 4).tolist()',
        expected: '[0.6285, 0.2312, 0.1402, 0.0, 0.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'p=1.0 keeps all tokens and the result sums to 1',
        input: '(lambda f: (int(np.sum(f > 0)), round(float(f.sum()), 6)))(top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 1.0)[1])',
        expected: '(5, 1.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Confident distribution: the top token alone forms the nucleus',
        input: '(lambda r: (r[0], r[1].tolist()))(top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.5))',
        expected: '(0, [1.0, 0.0, 0.0, 0.0, 0.0])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Two-token nucleus at p=0.9',
        input: 'np.round(top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.9)[1], 4).tolist()',
        expected: '[0.8808, 0.1192, 0.0, 0.0, 0.0]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Smaller p never keeps more tokens',
        input: '(lambda z: int(np.sum(top_p_sampling(z, 0.5)[1] > 0)) <= int(np.sum(top_p_sampling(z, 0.95)[1] > 0)))(np.random.randn(12))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Sampled token lies in the nucleus (with temperature)',
        input: '(lambda r: bool(r[1][r[0]] > 0) and isinstance(r[0], int))(top_p_sampling(np.array([0.5, 3.0, 2.5, -1.0, 0.0]), 0.7, 1.5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'The nucleus is a prefix of the tokens sorted by probability. How do you find where that prefix ends?',
      'Softmax with temperature, sort descending, cumulative sum, keep the prefix up to the first position where the cumulative sum reaches p, renormalize, sample.',
      'order = np.argsort(probs)[::-1]; c = np.cumsum(probs[order]); cutoff = np.searchsorted(c, p); keep = order[:cutoff + 1].',
      'Include the crossing token (cutoff + 1). Without it, a confident distribution with p below the top probability keeps nothing and you divide by zero.',
    ],
    solution: `import numpy as np

def top_p_sampling(logits, p, temperature=1.0):
    """
    Returns:
        (token (int), filtered_probs (vocab_size,))
    """
    np.random.seed(42)
    scaled = np.asarray(logits, dtype=np.float64) / temperature
    exp_vals = np.exp(scaled - np.max(scaled))
    probs = exp_vals / np.sum(exp_vals)

    # Sort descending and accumulate
    sorted_idx = np.argsort(probs)[::-1]
    cumsum = np.cumsum(probs[sorted_idx])

    # First position where the cumulative mass reaches p; keep it too
    cutoff = np.searchsorted(cumsum, p)
    nucleus = sorted_idx[:cutoff + 1]

    filtered_probs = np.zeros_like(probs)
    filtered_probs[nucleus] = probs[nucleus]
    filtered_probs /= filtered_probs.sum()

    token = np.random.choice(len(filtered_probs), p=filtered_probs)
    return int(token), filtered_probs

# O(V log V) for the sort
`,
  },
  {
    id: 'llm-repetition-penalty',
    title: 'Repetition Penalty',
    section: 'llm-generation',
    difficulty: 'easy',
    description: `
## Repetition Penalty

### What you'll build
The CTRL repetition penalty (Keskar et al., 2019), as implemented by Hugging Face's \`RepetitionPenaltyLogitsProcessor\`: make every token that already appeared in the output less likely, by shrinking its logit.

### Background
Small or greedily decoded models fall into loops ("I think that I think that I think..."). The penalty pushes the logits of already-generated tokens down before sampling. It is applied to the raw logits, before temperature, top-k and top-p.

### Formula
For every **distinct** token id \`t\` in \`generated_tokens\`:
\`\`\`text
logits[t] = logits[t] / penalty    if logits[t] > 0
logits[t] = logits[t] * penalty    otherwise (logits[t] <= 0)
\`\`\`
With \`penalty > 1\`, both branches lower the logit: a positive logit moves toward 0, a negative one moves further from 0. Dividing a negative logit instead would **raise** it, which is the classic bug.

### Inputs
- \`logits\`: float array \`(vocab_size,)\`
- \`generated_tokens\`: list of int token ids (may contain repeats, may be empty)
- \`penalty\`: float \`>= 1.0\`, default 1.2

### Expected Return Format
\`penalized_logits\`: new float array \`(vocab_size,)\`; the input array must not be modified.

### Edge cases and conventions
- **Each distinct token is penalized once**, however often it appears: \`[0, 0, 0]\` penalizes token 0 once, as in CTRL and Hugging Face. (For a count-based penalty, see the follow-up.)
- \`penalty = 1.0\` leaves the logits unchanged.
- A logit of exactly 0 stays 0.

### Constraints
NumPy only. Copy the input first (\`np.array(logits, dtype=float)\` or \`.copy()\`).

### Follow-up
- OpenAI's \`presence_penalty\` and \`frequency_penalty\` **subtract** \`alpha_presence * [count > 0] + alpha_frequency * count\` instead. Implement it; how is it different from dividing?
- Why can a strong repetition penalty hurt code generation?
`,
    examples: [
      {
        input: 'apply_repetition_penalty(np.array([2.0, -1.0, 3.0, 0.5]), [0, 1], penalty=1.5)',
        output: '[1.3333, -1.5, 3.0, 0.5]',
        explanation: 'Token 0 (positive): 2.0 / 1.5; token 1 (negative): -1.0 * 1.5. Tokens 2 and 3 were not generated.',
      },
      {
        input: 'apply_repetition_penalty(np.array([2.0, -1.0, 3.0]), [0, 0, 1, 1, 1], penalty=2.0)',
        output: '[1.0, -2.0, 3.0]',
        explanation: 'Repeats do not stack: each distinct token is penalized once.',
      },
    ],
    starterCode: `import numpy as np

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    """
    Apply the CTRL repetition penalty to previously generated tokens.

    Args:
        logits: Raw logits (vocab_size,)
        generated_tokens: List of previously generated token ids (may repeat)
        penalty: Repetition penalty factor (>= 1.0)

    Returns:
        penalized_logits: New array (vocab_size,); each distinct generated
                          token: positive logit / penalty, else * penalty
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Positive logit divided, negative multiplied, others unchanged',
        input: 'np.round(apply_repetition_penalty(np.array([2.0, -1.0, 3.0, 0.5]), [0, 1], 1.5), 4).tolist()',
        expected: '[1.3333, -1.5, 3.0, 0.5]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Penalty=1.0 has no effect',
        input: '(lambda z: bool(np.allclose(apply_repetition_penalty(z, [0, 1, 2], 1.0), z)))(np.array([2.0, -1.0, 3.0, 0.5]))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Several penalized tokens',
        input: 'apply_repetition_penalty(np.array([2.0, -1.0, 3.0, 0.5]), [0, 1, 3], 2.0).tolist()',
        expected: '[1.0, -2.0, 3.0, 0.25]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Repeated tokens are penalized only once',
        input: 'apply_repetition_penalty(np.array([2.0, -1.0, 3.0]), [0, 0, 1, 1, 1], 2.0).tolist()',
        expected: '[1.0, -2.0, 3.0]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Input array is not modified; zero logit stays zero',
        input: '(lambda z: (lambda out: z.tolist() + out.tolist())(apply_repetition_penalty(z, [0, 1, 2], 2.0)))(np.array([2.0, -1.0, 0.0]))',
        expected: '[2.0, -1.0, 0.0, 1.0, -2.0, 0.0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'No generated tokens: logits unchanged',
        input: 'apply_repetition_penalty(np.array([0.5, -0.5]), [], 1.3).tolist()',
        expected: '[0.5, -0.5]',
        hidden: true,
      },
    ],
    hints: [
      'With penalty > 1, every generated token should end up less likely. What has to happen to a positive logit, and to a negative one?',
      'Copy the logits, then for each distinct generated token apply one of two updates depending on its sign.',
      'Vectorised: ids = np.unique(generated_tokens).astype(int); vals = out[ids]; out[ids] = np.where(vals > 0, vals / penalty, vals * penalty).',
      'Dividing a negative logit by the penalty raises it; and looping over the raw list penalizes repeated tokens several times. Use the distinct ids.',
    ],
    solution: `import numpy as np

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    """
    Returns:
        penalized_logits: new array (vocab_size,)
    """
    out = np.array(logits, dtype=np.float64)          # copy: never modify the input
    ids = np.unique(np.asarray(generated_tokens, dtype=int))   # each token once
    if ids.size == 0:
        return out
    vals = out[ids]
    # Both branches lower the logit when penalty > 1
    out[ids] = np.where(vals > 0, vals / penalty, vals * penalty)
    return out

# O(V + G log G) for G generated tokens
`,
  },
  {
    id: 'llm-kv-cache',
    title: 'KV Cache for Efficient Generation',
    section: 'llm-generation',
    difficulty: 'medium',
    description: `
## KV Cache for Efficient Generation

### What you'll build
One decoding step of single-head attention with a **KV cache**: project only the new token, append its key and value to the cache, and let its query attend over every cached position.

### Background
Generation is autoregressive: to produce token \`t+1\` the model needs attention over tokens \`0..t\`. The keys and values of tokens \`0..t-1\` don't change once computed (causal attention never lets old tokens see new ones), so recomputing them every step is wasted work. Caching them turns each step from "re-run the whole prefix" into "process one token". This is why LLM serving has two phases: **prefill** (run the prompt in parallel and fill the cache) and **decode** (one token per step, reading the whole cache). The cache, \`2 · n_layers · n_kv_heads · d_head · seq_len\` numbers per sequence, is often bigger than the model's activations; **GQA** (Transformer Architecture) and sliding windows exist to shrink it.

### Algorithm
For the new token embedding \`x_new\` \`(1, d_model)\`:
\`\`\`text
q = x_new @ W_Q            # (1, d_k)   only the new token is projected
k = x_new @ W_K            # (1, d_k)
v = x_new @ W_V            # (1, d_v)
k_cache = concat(k_cache, k)  -> (t + 1, d_k)     (start from k if the cache is None)
v_cache = concat(v_cache, v)  -> (t + 1, d_v)
output  = softmax(q @ k_cache.T / sqrt(d_k)) @ v_cache    # (1, d_v)
\`\`\`
No mask is needed: the cache only contains the past and the current token, so this is exactly causal attention for the last position.

### Inputs
- \`x_new\`: \`(1, d_model)\`
- \`W_Q\`, \`W_K\`: \`(d_model, d_k)\`; \`W_V\`: \`(d_model, d_v)\`
- \`k_cache\`: \`(t, d_k)\` or None; \`v_cache\`: \`(t, d_v)\` or None (None on the first step)

### Expected Return Format
A tuple \`(output, k_cache, v_cache)\`:
- \`output\`: \`(1, d_v)\`
- \`k_cache\`: \`(t + 1, d_k)\`, \`v_cache\`: \`(t + 1, d_v)\`, with the new row **appended at the end**

### Edge cases and conventions
- First step (\`None\` caches): the new token attends only to itself, so \`output = v\`.
- Stable softmax; scale by \`sqrt(d_k)\` where \`d_k = W_Q.shape[1]\`.

### Constraints
NumPy only. Don't recompute keys or values for cached tokens.

### Follow-up
- Per generated token, attention with a cache costs \`O(t · d)\` instead of \`O(t^2 · d)\` (or \`O(t · d^2)\` for the projections). Over \`n\` tokens: \`O(n^2 d)\` vs \`O(n^3 d)\`.
- How big is the KV cache of a 32-layer, 8-KV-head, \`d_head = 128\` model at 32k tokens in fp16? (About 4 GiB per sequence.)
`,
    examples: [
      {
        input: 'Step 1: kv_cache_attention(np.array([[1.0, 0.0]]), I, I, I); step 2 with x = [[0.0, 1.0]] and the returned caches (I = np.eye(2))',
        output: 'step 1 output [[1.0, 0.0]]; step 2 output [[0.3302, 0.6698]], caches of length 2',
        explanation: 'Step 2: scores [0, 1] / sqrt(2) give weights [0.3302, 0.6698] over the two cached values.',
      },
      {
        input: 'x_new (1, 8), cache of 5 previous tokens, d_k = d_v = 4',
        output: 'output (1, 4), caches (6, 4)',
        explanation: 'One new key/value is appended; the query attends over all 6 positions.',
      },
    ],
    starterCode: `import numpy as np

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    """
    One decoding step of attention with a KV cache.

    Args:
        x_new: New token embedding (1, d_model)
        W_Q: Query weights (d_model, d_k)
        W_K: Key weights (d_model, d_k)
        W_V: Value weights (d_model, d_v)
        k_cache: Cached keys (t, d_k) or None on the first step
        v_cache: Cached values (t, d_v) or None on the first step

    Returns:
        output: Attention output for the new token (1, d_v)
        k_cache: Updated key cache (t + 1, d_k), new row last
        v_cache: Updated value cache (t + 1, d_v), new row last
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output and cache shapes on the first step',
        input: '(lambda r: (r[0].shape, r[1].shape, r[2].shape))(kv_cache_attention(np.random.randn(1, 8), np.random.randn(8, 4), np.random.randn(8, 4), np.random.randn(8, 3)))',
        expected: '((1, 3), (1, 4), (1, 3))',
        hidden: false,
      },
      {
        id: '2',
        description: 'Hand-computed two steps with identity weights',
        input: `(lambda: (
    I := np.eye(2),
    r1 := kv_cache_attention(np.array([[1.0, 0.0]]), I, I, I),
    r2 := kv_cache_attention(np.array([[0.0, 1.0]]), I, I, I, r1[1], r1[2]),
    np.round(np.concatenate([r1[0][0], r2[0][0]]), 4).tolist()
)[-1])()`,
        expected: '[1.0, 0.0, 0.3302, 0.6698]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Cache grows by one per step',
        input: `(lambda: (
    x := np.random.randn(1, 4), W := np.random.randn(4, 4) * 0.1,
    r1 := kv_cache_attention(x, W, W, W),
    r2 := kv_cache_attention(x, W, W, W, r1[1], r1[2]),
    r3 := kv_cache_attention(x, W, W, W, r2[1], r2[2]),
    (r1[1].shape[0], r3[1].shape[0], r3[2].shape[0])
)[-1])()`,
        expected: '(1, 3, 3)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Cached decoding matches full causal attention for every step',
        input: `(lambda: (
    X := np.random.randn(4, 6), Wq := np.random.randn(6, 4), Wk := np.random.randn(6, 4), Wv := np.random.randn(6, 3),
    S := (X @ Wq) @ (X @ Wk).T / 2.0 + np.triu(np.full((4, 4), -np.inf), 1),
    full := (np.exp(S - S.max(1, keepdims=True)) / np.exp(S - S.max(1, keepdims=True)).sum(1, keepdims=True)) @ (X @ Wv),
    steps := [None, None],
    outs := [(r := kv_cache_attention(X[t:t + 1], Wq, Wk, Wv, steps[0], steps[1]), steps.__setitem__(slice(0, 2), [r[1], r[2]]), r[0][0])[-1] for t in range(4)],
    bool(np.allclose(np.array(outs), full) and np.allclose(steps[0], X @ Wk) and np.allclose(steps[1], X @ Wv))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'First step returns the new value (attends only to itself)',
        input: '(lambda x, Wv: bool(np.allclose(kv_cache_attention(x, np.random.randn(5, 2), np.random.randn(5, 2), Wv)[0], x @ Wv)))(np.random.randn(1, 5), np.random.randn(5, 3))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Only the new token needs projecting: the cached keys and values of earlier tokens never change.',
      'Project q, k, v for x_new; append k and v to the caches (or start them); attend with q over the whole cache.',
      'k_cache = k if k_cache is None else np.concatenate([k_cache, k], axis=0); scores = q @ k_cache.T / np.sqrt(d_k); output = softmax(scores) @ v_cache.',
      'Append the new row at the end (axis=0), not the beginning, and scale by sqrt(d_k) of the keys, not d_model.',
    ],
    solution: `import numpy as np

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    """
    Returns:
        (output (1, d_v), k_cache (t+1, d_k), v_cache (t+1, d_v))
    """
    # Project only the new token
    q = x_new @ W_Q  # (1, d_k)
    k = x_new @ W_K  # (1, d_k)
    v = x_new @ W_V  # (1, d_v)

    # Append to the cache (start it on the first step)
    if k_cache is None:
        k_cache, v_cache = k, v
    else:
        k_cache = np.concatenate([k_cache, k], axis=0)
        v_cache = np.concatenate([v_cache, v], axis=0)

    # The new query attends to every cached position (past + itself)
    scores = q @ k_cache.T / np.sqrt(q.shape[-1])      # (1, t + 1)
    scores = scores - scores.max(axis=-1, keepdims=True)
    weights = np.exp(scores)
    weights /= weights.sum(axis=-1, keepdims=True)
    output = weights @ v_cache                         # (1, d_v)

    return output, k_cache, v_cache

# Per step: O(d_model * d) for the projections + O(t * d) for attention.
# (np.concatenate copies the cache each step; real servers preallocate it.)
`,
  },
  {
    id: 'llm-beam-search',
    title: 'Beam Search Decoding',
    section: 'llm-generation',
    difficulty: 'medium',
    description: `
## Beam Search Decoding

### What you'll build
Beam search over a table of per-step log-probabilities: keep the \`beam_width\` best partial sequences at every step, with optional end-of-sequence handling, and return the best sequence and its score.

### Background
Greedy decoding commits to the single best token at each step and can miss a sequence whose first token looked worse. Beam search keeps several hypotheses alive. It is used where there is one "right" output (translation, speech recognition, constrained or structured generation); open-ended chat uses sampling instead, because beam search tends to produce bland, repetitive text.

In a real model, the next-token distribution depends on the prefix. To keep this problem self-contained, \`log_probs[t]\` is the **same for every beam** at step \`t\`. Without EOS that makes greedy already optimal, so the interesting case is EOS: a beam that ends early stops paying log-probability costs.

### Algorithm
Scores are sums of log-probabilities (never multiply raw probabilities: they underflow).
1. Start with one empty beam: \`[([], 0.0)]\`.
2. For each step \`t\` in \`0 .. min(max_length, num_steps) - 1\`:
   - For each beam, in order: if it **ends with \`eos_token\`**, carry it to the candidate list unchanged; otherwise add one candidate per token \`v = 0 .. vocab_size - 1\`: \`(seq + [v], score + log_probs[t, v])\`.
   - Sort all candidates by score, descending, with a **stable** sort (ties keep candidate order: earlier beam first, then lower token id), and keep the first \`beam_width\`.
3. Return the first (best) beam.

### Inputs
- \`log_probs\`: float array \`(num_steps, vocab_size)\` of log-probabilities
- \`beam_width\`: int >= 1
- \`max_length\`: int or None (None means \`num_steps\`)
- \`eos_token\`: int or None (None disables EOS handling)

### Expected Return Format
A tuple \`(best_sequence, best_score)\`:
- \`best_sequence\`: list of Python ints
- \`best_score\`: total log-probability of that sequence, **rounded to 4 decimals**

### Edge cases and conventions
- Finished (EOS) beams compete with unfinished ones on their raw score: **no length normalization** here (see the follow-up).
- \`beam_width = 1\` is greedy decoding.

### Constraints
NumPy and plain Python lists.

### Follow-up
- Raw log-probability scores favour short sequences. Add length normalization \`score / len(seq)^alpha\` (\`alpha\` about 0.6 to 0.7, Wu et al., 2016). Where in the algorithm must it be applied?
- Complexity per step is \`O(B · V)\` candidates; how do real implementations avoid sorting all of them (top-k per beam first)?
`,
    examples: [
      {
        input: 'beam_search(np.log(np.array([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])), beam_width=1)',
        output: '([0, 1, 2], -1.3783)',
        explanation: 'Greedy: log(0.6) + log(0.7) + log(0.6) = -1.3783.',
      },
      {
        input: 'beam_search(np.log(np.array([[0.5, 0.45, 0.05], [0.3, 0.3, 0.4], [0.3, 0.3, 0.4]])), beam_width=2, eos_token=1)',
        output: '([1], -0.7985)',
        explanation: 'The beam [1] ends at once with log(0.45). Greedy (beam_width=1) drops it and ends with [0, 2, 2] at -2.5257.',
      },
    ],
    starterCode: `import numpy as np

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    """
    Beam search decoding over pre-computed log probabilities.

    Args:
        log_probs: Log probability matrix (num_steps, vocab_size);
                   log_probs[t] gives the log probs for step t
        beam_width: Number of beams to keep
        max_length: Maximum sequence length (defaults to num_steps)
        eos_token: End-of-sequence token id (optional); a beam ending with it
                   is carried forward unchanged

    Returns:
        best_sequence: List of token ids (ints) for the best beam
        best_score: Its total log-probability, rounded to 4 decimals
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Greedy path found with beam_width=1',
        input: 'beam_search(np.log(np.array([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])), 1)',
        expected: '([0, 1, 2], -1.3783)',
        hidden: false,
      },
      {
        id: '2',
        description: 'A beam that ends with EOS stops accumulating log-probs',
        input: 'beam_search(np.log(np.array([[0.5, 0.45, 0.05], [0.3, 0.3, 0.4], [0.3, 0.3, 0.4]])), 2, eos_token=1)',
        expected: '([1], -0.7985)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Beam width 1 cannot keep the EOS beam',
        input: 'beam_search(np.log(np.array([[0.5, 0.45, 0.05], [0.3, 0.3, 0.4], [0.3, 0.3, 0.4]])), 1, eos_token=1)',
        expected: '([0, 2, 2], -2.5257)',
        hidden: true,
      },
      {
        id: '4',
        description: 'max_length truncates decoding',
        input: 'beam_search(np.log(np.array([[0.5, 0.4, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])), 2, max_length=2)',
        expected: '([0, 1], -1.0498)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Sequence length matches the number of steps; wider beam never scores worse',
        input: '(lambda L: (len(beam_search(L, 2)[0]), beam_search(L, 3)[1] >= beam_search(L, 1)[1]))(np.log(np.array([[0.5, 0.5], [0.3, 0.7], [0.8, 0.2], [0.4, 0.6]])))',
        expected: '(4, True)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Ties keep the lower token id (stable sort)',
        input: 'beam_search(np.log(np.array([[0.4, 0.4, 0.2], [0.5, 0.5, 0.0001]])), 2)',
        expected: '([0, 0], -1.6094)',
        hidden: true,
      },
    ],
    hints: [
      'Represent each beam as (token list, total log-prob). At every step all beams grow together.',
      'Each step: build every candidate (carry EOS beams unchanged, expand the rest with every token), sort by score, keep the top beam_width.',
      'new_score = score + log_probs[step][token]; candidates.sort(key=lambda c: c[1], reverse=True) is stable, so ties keep candidate order.',
      'Add log-probabilities (don\'t multiply probabilities); check seq[-1] == eos_token only when seq is non-empty; round only the final score.',
    ],
    solution: `import numpy as np

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    """
    Returns:
        (best_sequence (list of int), best_score (float, 4 decimals))
    """
    log_probs = np.asarray(log_probs, dtype=np.float64)
    num_steps, vocab_size = log_probs.shape
    if max_length is None:
        max_length = num_steps

    beams = [([], 0.0)]   # (sequence, total log-prob)

    for step in range(min(max_length, num_steps)):
        candidates = []
        for seq, score in beams:
            # A finished beam is carried forward unchanged
            if eos_token is not None and seq and seq[-1] == eos_token:
                candidates.append((seq, score))
                continue
            for token in range(vocab_size):
                candidates.append((seq + [token], score + log_probs[step, token]))

        # Stable sort: equal scores keep candidate order
        candidates.sort(key=lambda c: c[1], reverse=True)
        beams = candidates[:beam_width]

    best_seq, best_score = beams[0]
    return best_seq, round(float(best_score), 4)

# O(steps * B * V log(B * V)) with a full sort per step
`,
  },
  {
    id: 'llm-speculative-decoding',
    title: 'Speculative Decoding',
    section: 'llm-generation',
    difficulty: 'hard',
    description: `
## Speculative Decoding (Verification Step)

### What you'll build
The accept/reject loop of speculative decoding: given the probabilities a small **draft** model and the large **target** model assign to \`K\` drafted tokens, decide how many of them to keep.

### Background
Decoding a large model is memory-bound: each step reads every weight to produce one token. Speculative decoding (Leviathan et al., 2023; Chen et al., 2023) lets a cheap draft model propose \`K\` tokens, then runs the target model **once** on all of them in parallel. Each drafted token \`x_i\` is accepted with probability \`min(1, p_target(x_i) / p_draft(x_i))\`; at the first rejection, the rest are thrown away and the target resamples that position from the residual distribution \`max(0, p_target - p_draft)\` (normalized). This scheme produces **exactly** the target model's distribution, not an approximation, and typically gives a 2 to 3x speedup.

This problem implements the accept/reject loop only. Resampling the rejected position and the bonus token after a fully accepted draft need the full distributions; they are the follow-up.

### Algorithm
\`\`\`text
np.random.seed(42)                       # once, at the start (in the starter)
accepted = []
for i in 0 .. K-1:
    a = 1.0 if draft_probs[i] == 0 else min(1, target_probs[i] / draft_probs[i])
    r = np.random.uniform()              # one draw per drafted token, in order
    if r < a:  accepted.append(draft_tokens[i])
    else:      break                     # reject token i and everything after it
return accepted, len(accepted)
\`\`\`

### Inputs
- \`draft_probs\`: list of \`K\` floats, \`p_draft(x_i)\` for each drafted token
- \`target_probs\`: list of \`K\` floats, \`p_target(x_i)\`
- \`draft_tokens\`: list of \`K\` ints
- \`target_dist_next\`: full target distribution after the last drafted token, or None. **Not used in this problem** (it is only needed for the bonus token).

### Expected Return Format
A tuple \`(accepted_tokens, num_accepted)\`:
- \`accepted_tokens\`: list of ints, always a **prefix** of \`draft_tokens\`
- \`num_accepted\`: int in \`[0, K]\`, equal to \`len(accepted_tokens)\`

### Edge cases and conventions
- \`target_probs[i] >= draft_probs[i]\` means certain acceptance (\`a = 1\`); \`target_probs[i] = 0\` means certain rejection.
- Draw exactly one uniform per token you examine, in order, after the seed, so results are reproducible (with seed 42 the first draws are 0.3745, 0.9507, 0.7320, ...).

### Constraints
NumPy only.

### Follow-up
- Add the residual resampling on rejection and the bonus token from \`target_dist_next\` when all \`K\` are accepted. Prove that the output token is distributed exactly as \`p_target\`.
- If each token is accepted with probability \`alpha\`, the expected number of tokens per target pass is \`(1 - alpha^(K+1)) / (1 - alpha)\`. How do you choose \`K\`?
`,
    examples: [
      {
        input: 'speculative_decode([0.5, 0.5, 0.5], [0.4, 0.4, 0.4], [10, 20, 30])',
        output: '([10], 1)',
        explanation: 'Each acceptance probability is 0.8; the draws are 0.3745 (accept) and 0.9507 (reject), so only token 10 is kept.',
      },
      {
        input: 'speculative_decode([0.3, 0.3, 0.3], [0.9, 0.9, 0.9], [1, 2, 3])',
        output: '([1, 2, 3], 3)',
        explanation: 'The target is more confident than the draft on every token, so all are accepted.',
      },
    ],
    starterCode: `import numpy as np

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    """
    Verify draft tokens with the speculative decoding acceptance rule.

    Args:
        draft_probs: Draft-model probability of each drafted token (K floats)
        target_probs: Target-model probability of each drafted token (K floats)
        draft_tokens: The K drafted token ids
        target_dist_next: Full target distribution after the last drafted
                          token, or None (not used in this problem)

    Returns:
        accepted_tokens: Accepted prefix of draft_tokens (list of ints)
        num_accepted: len(accepted_tokens), between 0 and K
    """
    np.random.seed(42)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'All tokens accepted when target_prob >= draft_prob',
        input: 'speculative_decode([0.3, 0.3, 0.3], [0.9, 0.9, 0.9], [1, 2, 3])',
        expected: '([1, 2, 3], 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Seeded draws: accept, then reject',
        input: 'speculative_decode([0.5, 0.5, 0.5], [0.4, 0.4, 0.4], [10, 20, 30])',
        expected: '([10], 1)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Zero target probability rejects that token and everything after',
        input: 'speculative_decode([0.5, 0.5, 0.5], [1.0, 1.0, 0.0], [10, 20, 30])',
        expected: '([10, 20], 2)',
        hidden: true,
      },
      {
        id: '4',
        description: 'First token rejected: nothing accepted',
        input: 'speculative_decode([0.4, 0.2], [0.0, 0.9], [7, 8])',
        expected: '([], 0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Seeded draws with acceptance probability 0.25',
        input: 'speculative_decode([0.8, 0.8, 0.8], [0.2, 0.2, 0.2], [1, 2, 3])',
        expected: '([], 0)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Result is always a prefix of the draft and the count matches',
        input: '(lambda r: r[0] == [4, 5, 6, 7][:r[1]] and 0 <= r[1] <= 4)(speculative_decode([0.6, 0.5, 0.9, 0.2], [0.5, 0.45, 0.1, 0.3], [4, 5, 6, 7]))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Tokens are checked in order and the first rejection ends the loop: the answer is always a prefix of draft_tokens.',
      'For each token: compute the acceptance probability, draw one uniform number, accept or stop.',
      'a = min(1.0, target_probs[i] / draft_probs[i]) (1.0 if draft_probs[i] == 0); r = np.random.uniform(); accept if r < a.',
      'Keep the np.random.seed(42) line and draw exactly one number per examined token; drawing all K up front with a different call changes the results.',
    ],
    solution: `import numpy as np

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    """
    Returns:
        (accepted_tokens (list of int), num_accepted (int))
    """
    np.random.seed(42)
    accepted_tokens = []

    for p_draft, p_target, token in zip(draft_probs, target_probs, draft_tokens):
        # Accept with probability min(1, p_target / p_draft)
        accept_prob = 1.0 if p_draft == 0 else min(1.0, p_target / p_draft)
        r = np.random.uniform()
        if r < accept_prob:
            accepted_tokens.append(int(token))
        else:
            break   # reject this token and every token after it

    return accepted_tokens, len(accepted_tokens)

# O(K); the real cost saving is one target forward pass for K tokens
`,
  },
];
