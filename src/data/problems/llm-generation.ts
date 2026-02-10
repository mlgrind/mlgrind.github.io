import { Problem } from '../../types';

export const llmGenerationProblems: Problem[] = [
  {
    id: 'llm-temperature-scaling',
    title: 'Temperature Scaling',
    section: 'llm-generation',
    difficulty: 'easy',
    description: `
## Temperature Scaling

Implement temperature scaling for LLM logits to control the randomness of generated text.

### How It Works
Before converting logits to probabilities via softmax, divide by a temperature parameter T:

\`\`\`
scaled_logits = logits / T
probs = softmax(scaled_logits)
\`\`\`

### Temperature Effects

| Temperature | Effect |
|-------------|--------|
| T < 1 | Sharper distribution (more confident, less random) |
| T = 1 | Original distribution (unchanged) |
| T > 1 | Flatter distribution (more random, more creative) |

### Softmax Reminder
\`\`\`
softmax(x_i) = exp(x_i) / sum(exp(x_j))
\`\`\`

For numerical stability, subtract the max before exponentiating:
\`\`\`
softmax(x_i) = exp(x_i - max(x)) / sum(exp(x_j - max(x)))
\`\`\`

### Interview Insight
Temperature scaling is the simplest decoding control. Interviewers expect you to know that T→0 approaches greedy decoding (argmax) and T→∞ approaches uniform sampling.
    `,
    examples: [
      {
        input: 'logits = [2.0, 1.0, 0.1], temperature = 0.5',
        output: '[0.8360, 0.1142, 0.0498]',
        explanation: 'Low temperature makes the highest logit dominate',
      },
      {
        input: 'logits = [2.0, 1.0, 0.1], temperature = 2.0',
        output: '[0.4566, 0.2784, 0.2650]',
        explanation: 'High temperature flattens the distribution',
      },
    ],
    starterCode: `import numpy as np

def temperature_scaling(logits, temperature=1.0):
    """
    Apply temperature scaling to logits and return probabilities.

    Args:
        logits: Raw logits from the model (vocab_size,)
        temperature: Temperature parameter (T > 0)

    Returns:
        probs: Probability distribution over vocabulary (vocab_size,)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Temperature=1 gives standard softmax',
        input: `(lambda: (
    logits := np.array([2.0, 1.0, 0.1]),
    probs := temperature_scaling(logits, 1.0),
    bool(np.allclose(probs, np.exp(logits - np.max(logits)) / np.sum(np.exp(logits - np.max(logits))), atol=1e-4))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Low temperature sharpens distribution',
        input: `(lambda: (
    logits := np.array([2.0, 1.0, 0.1]),
    probs_low := temperature_scaling(logits, 0.5),
    probs_high := temperature_scaling(logits, 2.0),
    bool(np.max(probs_low) > np.max(probs_high))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Probabilities sum to 1',
        input: 'bool(np.allclose(np.sum(temperature_scaling(np.array([1.0, 2.0, 3.0, 4.0]), 0.7)), 1.0))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Very low temperature approaches argmax',
        input: `(lambda: (
    probs := temperature_scaling(np.array([3.0, 1.0, 0.5]), 0.01),
    bool(probs[0] > 0.99)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Divide logits by temperature before applying softmax',
      'For numerical stability, subtract the max of scaled logits before exp()',
      'softmax(x) = exp(x - max(x)) / sum(exp(x - max(x)))',
    ],
    solution: `import numpy as np

def temperature_scaling(logits, temperature=1.0):
    logits = np.array(logits, dtype=np.float64)
    # Scale logits by temperature
    scaled = logits / temperature
    # Numerically stable softmax
    shifted = scaled - np.max(scaled)
    exp_vals = np.exp(shifted)
    probs = exp_vals / np.sum(exp_vals)
    return probs
`,
  },
  {
    id: 'llm-top-k-sampling',
    title: 'Top-k Sampling',
    section: 'llm-generation',
    difficulty: 'easy',
    description: `
## Top-k Sampling

Implement top-k sampling, which restricts token selection to the k most likely tokens.

### Algorithm
1. Compute probabilities from logits (via softmax)
2. Find the top-k tokens by probability
3. Zero out all other tokens
4. Re-normalize the remaining probabilities
5. Sample from the filtered distribution

### Why Top-k?
- Prevents sampling extremely unlikely tokens
- Reduces incoherent or nonsensical outputs
- Simple to implement and widely used (GPT-2 used k=40)

### Limitation
Fixed k doesn't adapt to the shape of the distribution:
- For a confident prediction (one token has 90% probability), k=50 still allows 49 unlikely tokens
- For a flat distribution, k=50 might cut off reasonable options

This motivates **nucleus (top-p) sampling**.

### Function Signature
\`\`\`python
def top_k_sampling(logits, k, temperature=1.0):
    # Returns: sampled_token_index, filtered_probs
\`\`\`
    `,
    examples: [
      {
        input: 'logits = [5.0, 3.0, 2.0, 1.0, 0.1], k = 3',
        output: 'Only top 3 tokens have non-zero probability',
        explanation: 'Tokens at indices 0, 1, 2 are kept; indices 3, 4 are zeroed',
      },
    ],
    starterCode: `import numpy as np

def top_k_sampling(logits, k, temperature=1.0):
    """
    Sample from the top-k most likely tokens.

    Args:
        logits: Raw logits (vocab_size,)
        k: Number of top tokens to keep
        temperature: Temperature for scaling (applied before filtering)

    Returns:
        token: Sampled token index (int)
        filtered_probs: Probability distribution after filtering (vocab_size,)
    """
    np.random.seed(42)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Only k tokens have non-zero probability',
        input: `(lambda: (
    _, probs := top_k_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 3),
    bool(np.sum(probs > 0) == 3)
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Filtered probs sum to 1',
        input: `(lambda: (
    _, probs := top_k_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 3),
    bool(np.allclose(np.sum(probs), 1.0))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Sampled token is within top-k',
        input: `(lambda: (
    logits := np.array([5.0, 3.0, 2.0, 1.0, 0.1]),
    top_k_indices := np.argsort(logits)[-3:],
    token, _ := top_k_sampling(logits, 3),
    bool(token in top_k_indices)
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'k=1 always picks the top token',
        input: `(lambda: (
    token, _ := top_k_sampling(np.array([1.0, 5.0, 2.0, 0.5]), 1),
    bool(token == 1)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Apply temperature scaling first: scaled_logits = logits / temperature',
      'Use np.argsort or np.argpartition to find top-k indices',
      'Set non-top-k logits to -inf (or a very large negative number) before softmax',
      'Re-normalize by dividing by the sum of remaining probabilities',
      'Use np.random.choice with the filtered probabilities to sample',
    ],
    solution: `import numpy as np

def top_k_sampling(logits, k, temperature=1.0):
    np.random.seed(42)
    logits = np.array(logits, dtype=np.float64)

    # Apply temperature
    scaled = logits / temperature

    # Find top-k indices
    top_k_idx = np.argsort(scaled)[-k:]

    # Mask non-top-k to -inf
    filtered_logits = np.full_like(scaled, -np.inf)
    filtered_logits[top_k_idx] = scaled[top_k_idx]

    # Softmax over filtered logits
    shifted = filtered_logits - np.max(filtered_logits)
    exp_vals = np.exp(shifted)
    probs = exp_vals / np.sum(exp_vals)

    # Sample
    token = np.random.choice(len(probs), p=probs)
    return int(token), probs
`,
  },
  {
    id: 'llm-top-p-sampling',
    title: 'Nucleus (Top-p) Sampling',
    section: 'llm-generation',
    difficulty: 'medium',
    description: `
## Nucleus (Top-p) Sampling

Implement nucleus sampling (also called top-p sampling), which dynamically selects the smallest set of tokens whose cumulative probability exceeds a threshold p.

### Algorithm
1. Compute probabilities from logits (with temperature)
2. Sort tokens by probability (descending)
3. Compute cumulative sum of sorted probabilities
4. Find the cutoff: smallest set where cumulative probability >= p
5. Zero out tokens below the cutoff
6. Re-normalize and sample

### Why Top-p?
Unlike top-k (fixed number of tokens), top-p **adapts** to the distribution:
- Confident prediction (one token at 95%): only 1-2 tokens kept
- Uncertain prediction (flat distribution): many tokens kept

### Common Values
- GPT-3/4: p = 0.9 or 0.95
- Creative writing: p = 0.95
- Factual tasks: p = 0.7

### Function Signature
\`\`\`python
def top_p_sampling(logits, p, temperature=1.0):
    # Returns: sampled_token_index, filtered_probs
\`\`\`
    `,
    examples: [
      {
        input: 'probs = [0.5, 0.3, 0.1, 0.05, 0.05], p = 0.8',
        output: 'Tokens with probs [0.5, 0.3] kept (cumsum = 0.8)',
        explanation: 'Only 2 tokens needed to reach the 80% threshold',
      },
    ],
    starterCode: `import numpy as np

def top_p_sampling(logits, p, temperature=1.0):
    """
    Nucleus (top-p) sampling from logits.

    Args:
        logits: Raw logits (vocab_size,)
        p: Cumulative probability threshold (0 < p <= 1)
        temperature: Temperature for scaling

    Returns:
        token: Sampled token index (int)
        filtered_probs: Probability distribution after filtering (vocab_size,)
    """
    np.random.seed(42)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Filtered probs sum to 1',
        input: `(lambda: (
    _, probs := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.9),
    bool(np.allclose(np.sum(probs), 1.0))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'p=1.0 keeps all tokens',
        input: `(lambda: (
    _, probs := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 1.0),
    bool(np.sum(probs > 0) == 5)
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Small p keeps fewer tokens',
        input: `(lambda: (
    _, probs_small := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.5),
    _, probs_large := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.95),
    bool(np.sum(probs_small > 0) <= np.sum(probs_large > 0))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Dominant token with very small p',
        input: `(lambda: (
    logits := np.array([10.0, 1.0, 0.5, 0.1]),
    _, probs := top_p_sampling(logits, 0.5),
    bool(np.sum(probs > 0) <= 2)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'First compute softmax probabilities (with temperature)',
      'Sort probabilities in descending order, keeping track of original indices',
      'Compute cumulative sum of sorted probabilities',
      'The cutoff is where cumsum first exceeds p — include that token too',
      'Zero out all tokens not in the nucleus set, then re-normalize',
    ],
    solution: `import numpy as np

def top_p_sampling(logits, p, temperature=1.0):
    np.random.seed(42)
    logits = np.array(logits, dtype=np.float64)

    # Apply temperature and compute softmax
    scaled = logits / temperature
    shifted = scaled - np.max(scaled)
    exp_vals = np.exp(shifted)
    probs = exp_vals / np.sum(exp_vals)

    # Sort descending
    sorted_idx = np.argsort(probs)[::-1]
    sorted_probs = probs[sorted_idx]

    # Cumulative sum
    cumsum = np.cumsum(sorted_probs)

    # Find cutoff: include tokens until cumsum >= p
    cutoff_idx = np.searchsorted(cumsum, p)
    # Include the token that crosses the threshold
    nucleus_indices = sorted_idx[:cutoff_idx + 1]

    # Filter
    filtered_probs = np.zeros_like(probs)
    filtered_probs[nucleus_indices] = probs[nucleus_indices]

    # Re-normalize
    filtered_probs = filtered_probs / np.sum(filtered_probs)

    # Sample
    token = np.random.choice(len(filtered_probs), p=filtered_probs)
    return int(token), filtered_probs
`,
  },
  {
    id: 'llm-repetition-penalty',
    title: 'Repetition Penalty',
    section: 'llm-generation',
    difficulty: 'easy',
    description: `
## Repetition Penalty

Implement repetition penalty to discourage the model from generating repeated tokens.

### Algorithm (from Keskar et al., CTRL paper)
For each token that has already been generated:
- If the logit is **positive**, divide by the penalty factor
- If the logit is **negative**, multiply by the penalty factor

\`\`\`
for token_id in generated_tokens:
    if logits[token_id] > 0:
        logits[token_id] = logits[token_id] / penalty
    else:
        logits[token_id] = logits[token_id] * penalty
\`\`\`

### Why This Formula?
- Dividing positive logits makes repeated tokens less likely
- Multiplying negative logits makes them even more negative (also less likely)
- Both operations push repeated tokens toward lower probability

### Common Values
- penalty = 1.0: No effect
- penalty = 1.2: Mild repetition reduction
- penalty = 1.5: Strong repetition reduction
- penalty > 2.0: Can cause incoherent text

### Function Signature
\`\`\`python
def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    # Returns: penalized_logits
\`\`\`
    `,
    examples: [
      {
        input: 'logits = [2.0, -1.0, 3.0, 0.5], generated = [0, 1], penalty = 1.5',
        output: '[1.333, -1.5, 3.0, 0.5]',
        explanation: 'Token 0 (positive): 2.0/1.5=1.333; Token 1 (negative): -1.0*1.5=-1.5',
      },
    ],
    starterCode: `import numpy as np

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    """
    Apply repetition penalty to logits for previously generated tokens.

    Args:
        logits: Raw logits (vocab_size,)
        generated_tokens: List of previously generated token indices
        penalty: Repetition penalty factor (>= 1.0)

    Returns:
        penalized_logits: Logits with penalty applied (vocab_size,)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Positive logits are divided by penalty',
        input: `(lambda: (
    result := apply_repetition_penalty(np.array([2.0, 1.0, 3.0]), [0], 1.5),
    bool(np.allclose(result[0], 2.0 / 1.5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Negative logits are multiplied by penalty',
        input: `(lambda: (
    result := apply_repetition_penalty(np.array([2.0, -1.0, 3.0]), [1], 1.5),
    bool(np.allclose(result[1], -1.0 * 1.5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Non-generated tokens unchanged',
        input: `(lambda: (
    result := apply_repetition_penalty(np.array([2.0, -1.0, 3.0]), [0], 1.5),
    bool(np.allclose(result[1], -1.0) and np.allclose(result[2], 3.0))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Penalty=1.0 has no effect',
        input: `(lambda: (
    logits := np.array([2.0, -1.0, 3.0, 0.5]),
    result := apply_repetition_penalty(logits, [0, 1, 2], 1.0),
    bool(np.allclose(result, logits))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Make a copy of logits to avoid modifying the input',
      'Loop over each token in generated_tokens',
      'Check if the logit at that index is positive or negative',
      'Positive: divide by penalty; Negative: multiply by penalty',
    ],
    solution: `import numpy as np

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    logits = np.array(logits, dtype=np.float64).copy()

    for token_id in generated_tokens:
        if logits[token_id] > 0:
            logits[token_id] = logits[token_id] / penalty
        else:
            logits[token_id] = logits[token_id] * penalty

    return logits
`,
  },
  {
    id: 'llm-kv-cache',
    title: 'KV Cache for Efficient Generation',
    section: 'llm-generation',
    difficulty: 'medium',
    description: `
## KV Cache for Efficient Generation

Implement KV (Key-Value) caching to make autoregressive generation efficient.

### The Problem
In autoregressive generation, at each step we compute:
\`\`\`
Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V
\`\`\`

Without caching, we recompute K and V for ALL previous tokens at every step. For a sequence of length n, this is O(n²) per token.

### The Solution: KV Cache
Cache the K and V projections from previous steps:
1. **First token**: Compute K, V for the prompt. Cache them.
2. **Each new token**: Compute K_new, V_new for only the new token. Append to cache.
3. **Attention**: Use Q_new (just the new token) with the full cached K, V.

### Implementation
\`\`\`
# Step t: generating token t
K_new = x_t @ W_K          # (1, d_k) - only new token
V_new = x_t @ W_V          # (1, d_v) - only new token
K_cache = concat(K_cache, K_new)  # (t, d_k)
V_cache = concat(V_cache, V_new)  # (t, d_v)

Q_t = x_t @ W_Q            # (1, d_k) - only new token
output = attention(Q_t, K_cache, V_cache)  # attend to all
\`\`\`

### Speedup
- Without cache: O(n²d) total for n tokens
- With cache: O(nd) total for n tokens

### Function Signature
\`\`\`python
def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache, v_cache):
    # Returns: output, updated_k_cache, updated_v_cache
\`\`\`
    `,
    examples: [
      {
        input: 'x_new (1, d_model), cache has 5 previous tokens',
        output: 'output (1, d_v), caches now have 6 entries each',
        explanation: 'New K,V appended; attention computed over all 6 tokens',
      },
    ],
    starterCode: `import numpy as np

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    """
    Compute attention with KV caching for efficient autoregressive generation.

    Args:
        x_new: New token embedding (1, d_model)
        W_Q: Query weight matrix (d_model, d_k)
        W_K: Key weight matrix (d_model, d_k)
        W_V: Value weight matrix (d_model, d_v)
        k_cache: Cached keys from previous steps (seq_len, d_k) or None
        v_cache: Cached values from previous steps (seq_len, d_v) or None

    Returns:
        output: Attention output for new token (1, d_v)
        k_cache: Updated key cache (seq_len+1, d_k)
        v_cache: Updated value cache (seq_len+1, d_v)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape is correct',
        input: `(lambda: (
    d_model, d_k, d_v := 8, 4, 4,
    x := np.random.randn(1, d_model),
    W_Q := np.random.randn(d_model, d_k) * 0.1,
    W_K := np.random.randn(d_model, d_k) * 0.1,
    W_V := np.random.randn(d_model, d_v) * 0.1,
    out, _, _ := kv_cache_attention(x, W_Q, W_K, W_V),
    out.shape
)[-1])()`,
        expected: '(1, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Cache grows by 1 each step',
        input: `(lambda: (
    d := 4,
    x := np.random.randn(1, d),
    W := np.random.randn(d, d) * 0.1,
    _, k1, v1 := kv_cache_attention(x, W, W, W),
    _, k2, v2 := kv_cache_attention(x, W, W, W, k1, v1),
    _, k3, v3 := kv_cache_attention(x, W, W, W, k2, v2),
    k3.shape[0]
)[-1])()`,
        expected: '3',
        hidden: false,
      },
      {
        id: '3',
        description: 'First step creates cache of length 1',
        input: `(lambda: (
    d := 4,
    x := np.random.randn(1, d),
    W := np.random.randn(d, d) * 0.1,
    _, k, v := kv_cache_attention(x, W, W, W),
    k.shape[0]
)[-1])()`,
        expected: '1',
        hidden: false,
      },
      {
        id: '4',
        description: 'Attention output changes with more context',
        input: `(lambda: (
    np.random.seed(0),
    d := 4,
    x1 := np.random.randn(1, d),
    x2 := np.random.randn(1, d),
    W := np.random.randn(d, d) * 0.1,
    out1, k1, v1 := kv_cache_attention(x1, W, W, W),
    out2, k2, v2 := kv_cache_attention(x2, W, W, W, k1, v1),
    bool(not np.allclose(out1, out2))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Compute Q, K, V projections for the new token: Q_new = x_new @ W_Q',
      'If cache is None, initialize K_cache and V_cache as the new K, V',
      'Otherwise concatenate: K_cache = np.concatenate([k_cache, K_new], axis=0)',
      'Compute attention: scores = Q_new @ K_cache.T / sqrt(d_k)',
      'Apply softmax to scores, then output = softmax_scores @ V_cache',
    ],
    solution: `import numpy as np

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    # Project new token
    Q_new = x_new @ W_Q  # (1, d_k)
    K_new = x_new @ W_K  # (1, d_k)
    V_new = x_new @ W_V  # (1, d_v)

    # Update cache
    if k_cache is None:
        k_cache = K_new
        v_cache = V_new
    else:
        k_cache = np.concatenate([k_cache, K_new], axis=0)
        v_cache = np.concatenate([v_cache, V_new], axis=0)

    # Compute attention
    d_k = Q_new.shape[-1]
    scores = Q_new @ k_cache.T / np.sqrt(d_k)  # (1, seq_len)

    # Softmax
    scores = scores - np.max(scores, axis=-1, keepdims=True)
    attn_weights = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)

    # Weighted sum of values
    output = attn_weights @ v_cache  # (1, d_v)

    return output, k_cache, v_cache
`,
  },
  {
    id: 'llm-beam-search',
    title: 'Beam Search Decoding',
    section: 'llm-generation',
    difficulty: 'medium',
    description: `
## Beam Search Decoding

Implement beam search, which maintains multiple candidate sequences to find higher-probability outputs.

### Algorithm
1. Start with \`beam_width\` copies of the initial sequence
2. At each step, for each beam:
   - Get log-probabilities for next token
   - Consider top-k expansions
3. Keep only the \`beam_width\` sequences with highest total log-probability
4. Stop when all beams have generated the EOS token or hit max length

### Scoring
Use **log probabilities** (not raw probabilities) to avoid underflow:
\`\`\`
score(sequence) = sum of log P(token_i | tokens_<i)
\`\`\`

### Length Normalization
Beam search favors shorter sequences. Normalize by length:
\`\`\`
normalized_score = score / length^alpha
\`\`\`
where alpha is typically 0.6-0.7.

### Simplified Version
For this problem, implement a simplified beam search using a pre-computed log-probability matrix (no actual model). At each step, expand each beam with all possible next tokens, score them, and keep the top \`beam_width\`.

### Function Signature
\`\`\`python
def beam_search(log_probs, beam_width, max_length, eos_token=None):
    # log_probs: (max_length, vocab_size) - pre-computed log probs per step
    # Returns: best_sequence, best_score
\`\`\`
    `,
    examples: [
      {
        input: 'log_probs (3 steps, 4 tokens), beam_width=2',
        output: 'best sequence of length 3 with highest total log-prob',
        explanation: 'Explores 2 paths at each step, returns the best one',
      },
    ],
    starterCode: `import numpy as np

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    """
    Beam search decoding over pre-computed log probabilities.

    Args:
        log_probs: Log probability matrix (num_steps, vocab_size).
                   log_probs[t] gives log probs for step t.
        beam_width: Number of beams to maintain
        max_length: Maximum sequence length (defaults to num_steps)
        eos_token: End-of-sequence token ID (optional)

    Returns:
        best_sequence: List of token indices for the best beam
        best_score: Total log-probability of the best sequence
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Greedy path found with beam_width=1',
        input: `(lambda: (
    log_probs := np.log(np.array([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])),
    seq, score := beam_search(log_probs, 1),
    seq
)[-1])()`,
        expected: '[0, 1, 2]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Beam search score is log-probability sum',
        input: `(lambda: (
    log_probs := np.log(np.array([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])),
    seq, score := beam_search(log_probs, 1),
    round(score, 4)
)[-1])()`,
        expected: '-1.3783',
        hidden: false,
      },
      {
        id: '3',
        description: 'Wider beam can find better path',
        input: `(lambda: (
    log_probs := np.log(np.array([[0.4, 0.35, 0.25], [0.1, 0.1, 0.8], [0.9, 0.05, 0.05]])),
    _, score1 := beam_search(log_probs, 1),
    _, score2 := beam_search(log_probs, 3),
    bool(score2 >= score1 - 1e-10)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Sequence length matches steps',
        input: `(lambda: (
    log_probs := np.log(np.array([[0.5, 0.5], [0.3, 0.7], [0.8, 0.2], [0.4, 0.6]])),
    seq, _ := beam_search(log_probs, 2),
    len(seq)
)[-1])()`,
        expected: '4',
        hidden: false,
      },
    ],
    hints: [
      'Maintain a list of (sequence, score) tuples for each beam',
      'At each step, expand all beams with all possible next tokens',
      'Score = previous score + log_probs[step][token]',
      'Sort all candidates by score and keep top beam_width',
      'After all steps, return the beam with the highest score',
    ],
    solution: `import numpy as np

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    log_probs = np.array(log_probs, dtype=np.float64)
    num_steps, vocab_size = log_probs.shape
    if max_length is None:
        max_length = num_steps

    # Initialize beams: (sequence, score)
    beams = [([], 0.0)]

    for step in range(min(max_length, num_steps)):
        all_candidates = []

        for seq, score in beams:
            # If this beam ended with EOS, carry it forward
            if eos_token is not None and len(seq) > 0 and seq[-1] == eos_token:
                all_candidates.append((seq, score))
                continue

            # Expand with all possible next tokens
            for token in range(vocab_size):
                new_seq = seq + [token]
                new_score = score + log_probs[step][token]
                all_candidates.append((new_seq, new_score))

        # Keep top beam_width candidates
        all_candidates.sort(key=lambda x: x[1], reverse=True)
        beams = all_candidates[:beam_width]

    # Return best beam
    best_seq, best_score = beams[0]
    return best_seq, round(best_score, 4)
`,
  },
  {
    id: 'llm-speculative-decoding',
    title: 'Speculative Decoding',
    section: 'llm-generation',
    difficulty: 'hard',
    description: `
## Speculative Decoding

Implement the core verification step of speculative decoding, a technique that speeds up LLM inference by using a small "draft" model to propose tokens and a large "target" model to verify them.

### Overview
1. **Draft model** (small, fast): Generates K candidate tokens quickly
2. **Target model** (large, slow): Verifies all K tokens in **one forward pass**
3. **Accept/Reject**: Each draft token is accepted with probability min(1, p_target/p_draft)

### Verification Algorithm
For each draft token i = 0, 1, ..., K-1:
\`\`\`
r = uniform(0, 1)
if r < min(1, p_target[i] / p_draft[i]):
    accept token i
else:
    reject token i and all subsequent tokens
    resample from adjusted distribution: max(0, p_target - p_draft)
    break
\`\`\`

If all K tokens accepted, sample one more token from the target model's distribution for position K.

### Why It Works
- Draft model generates tokens cheaply (e.g., 10x faster)
- Target model verifies K tokens at once (parallel, not sequential)
- Accepted tokens are **exactly** distributed as if sampled from the target model
- Expected speedup: ~2-3x for well-matched draft/target pairs

### Function Signature
\`\`\`python
def speculative_decode(draft_probs, target_probs, draft_tokens):
    # Returns: accepted_tokens, num_accepted
\`\`\`

### Important
The output distribution is mathematically guaranteed to match the target model exactly. This is not an approximation.
    `,
    examples: [
      {
        input: 'draft_probs=[0.8, 0.7], target_probs=[0.9, 0.3], draft_tokens=[5, 12]',
        output: 'Token 5 likely accepted (0.9/0.8>1), Token 12 may be rejected (0.3/0.7<1)',
        explanation: 'Higher target prob → more likely to accept',
      },
    ],
    starterCode: `import numpy as np

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    """
    Verify draft tokens using speculative decoding.

    Args:
        draft_probs: Probability the draft model assigned to each drafted token.
                     List of K floats.
        target_probs: Probability the target model assigns to each drafted token.
                      List of K floats.
        draft_tokens: The K token IDs proposed by the draft model.
                      List of K ints.
        target_dist_next: Full target distribution for position after last draft token.
                          Array of shape (vocab_size,) or None.

    Returns:
        accepted_tokens: List of accepted token IDs
        num_accepted: Number of accepted tokens (0 to K)
    """
    np.random.seed(42)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'All tokens accepted when target_prob >= draft_prob',
        input: `(lambda: (
    np.random.seed(0),
    tokens, n := speculative_decode([0.3, 0.3, 0.3], [0.9, 0.9, 0.9], [1, 2, 3]),
    bool(n == 3)
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Accepted tokens are prefix of draft tokens',
        input: `(lambda: (
    np.random.seed(42),
    tokens, n := speculative_decode([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [10, 20, 30]),
    bool(tokens == [10, 20, 30][:n])
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Returns between 0 and K accepted tokens',
        input: `(lambda: (
    np.random.seed(42),
    _, n := speculative_decode([0.8, 0.8, 0.8], [0.2, 0.2, 0.2], [1, 2, 3]),
    bool(0 <= n <= 3)
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Deterministic acceptance when target prob much higher',
        input: `(lambda: (
    results := [speculative_decode([0.01], [0.99], [42])[1] for _ in range(10)],
    bool(all(r == 1 for r in results))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'For each draft token, compute acceptance probability: min(1, target_prob / draft_prob)',
      'Draw a uniform random number r. Accept if r < acceptance_probability',
      'On first rejection, stop — do not check subsequent tokens',
      'Return the prefix of draft_tokens up to the last accepted token',
      'The acceptance criterion guarantees the output matches the target distribution',
    ],
    solution: `import numpy as np

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    np.random.seed(42)
    K = len(draft_tokens)
    accepted_tokens = []

    for i in range(K):
        # Acceptance probability
        if draft_probs[i] == 0:
            accept_prob = 1.0 if target_probs[i] == 0 else 1.0
        else:
            accept_prob = min(1.0, target_probs[i] / draft_probs[i])

        # Draw random number
        r = np.random.uniform()

        if r < accept_prob:
            accepted_tokens.append(draft_tokens[i])
        else:
            # Reject this and all subsequent tokens
            break

    return accepted_tokens, len(accepted_tokens)
`,
  },
];
