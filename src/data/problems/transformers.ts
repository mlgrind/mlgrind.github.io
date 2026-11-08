import { Problem } from '../../types';

export const transformerProblems: Problem[] = [
  {
    id: 'scaled-dot-product-attention',
    title: 'Scaled Dot-Product Attention',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Scaled Dot-Product Attention

### What you'll build
The core operation of every Transformer: each query takes a weighted average of the values, with weights given by how well it matches each key. Return both the output and the attention weights.

### Background
Attention is a differentiable lookup table. A query \`q_i\` is compared with every key \`k_j\` by a dot product; a softmax turns those scores into a probability distribution over positions; the output is the matching mixture of value vectors. Dividing by \`sqrt(d_k)\` keeps the scores at unit scale: for random vectors with unit-variance entries, \`q · k\` has variance \`d_k\`, and without the scaling the softmax saturates and its gradients vanish.

### Formula
\`\`\`text
S   = Q @ K.T / sqrt(d_k)      # (seq_len, seq_len) scores
A   = softmax(S, axis=-1)      # each row sums to 1
out = A @ V                    # (seq_len, d_v)
\`\`\`
- \`Q\`: queries, \`K\`: keys, \`V\`: values; \`d_k = Q.shape[-1]\`
- Row \`i\` of \`A\` holds query \`i\`'s weights over all keys

### Inputs
- \`Q\`: float array \`(seq_len, d_k)\`
- \`K\`: float array \`(seq_len, d_k)\`
- \`V\`: float array \`(seq_len, d_v)\`

### Expected Return Format
A tuple \`(output, attention_weights)\`:
- \`output\`: \`(seq_len, d_v)\`
- \`attention_weights\`: \`(seq_len, seq_len)\`, non-negative, rows sum to 1

### Edge cases and conventions
- Use a numerically stable softmax: subtract each row's max before \`np.exp\`.
- No mask here (every query sees every key). Masking is the **Causal Attention Mask** problem.

### Constraints
NumPy only, fully vectorised (no Python loops over positions).

### Follow-up
- Why \`sqrt(d_k)\` and not \`d_k\`? What happens to the gradients of a saturated softmax?
- Time and memory are \`O(seq_len^2 · d)\` and \`O(seq_len^2)\`. Which later problems (**Online Softmax**, **KV Cache**) attack each?
`,
    examples: [
      {
        input: 'Q = K = np.array([[1.0, 0.0], [0.0, 1.0]]), V = np.array([[1.0, 2.0], [3.0, 4.0]])',
        output: 'output = [[1.6605, 2.6605], [2.3395, 3.3395]], attention_weights = [[0.6698, 0.3302], [0.3302, 0.6698]]',
        explanation: 'Scores are [[0.7071, 0], [0, 0.7071]] after dividing by sqrt(2); each query leans toward the key it matches.',
      },
      {
        input: 'Q = np.zeros((3, 4)), any K, V = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])',
        output: 'every output row = [3.0, 4.0]',
        explanation: 'All scores are 0, so the weights are uniform (1/3) and each output is the mean of V.',
      },
    ],
    starterCode: `import numpy as np

def scaled_dot_product_attention(Q, K, V):
    """
    Compute scaled dot-product attention.

    Args:
        Q: Queries (seq_len, d_k)
        K: Keys (seq_len, d_k)
        V: Values (seq_len, d_v)

    Returns:
        (output, attention_weights):
            output: (seq_len, d_v)
            attention_weights: (seq_len, seq_len), each row sums to 1
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape correct',
        input: 'scaled_dot_product_attention(np.random.randn(4, 8), np.random.randn(4, 8), np.random.randn(4, 8))[0].shape',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Hand-computed weights and output (2 tokens, d_k = 2)',
        input: '(lambda r: (np.round(r[1], 4).tolist(), np.round(r[0], 4).tolist()))(scaled_dot_product_attention(np.eye(2), np.eye(2), np.array([[1.0, 2.0], [3.0, 4.0]])))',
        expected: '([[0.6698, 0.3302], [0.3302, 0.6698]], [[1.6605, 2.6605], [2.3395, 3.3395]])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Attention weights shape is (seq_len, seq_len) and rows sum to 1',
        input: '(lambda w: (w.shape, bool(np.allclose(w.sum(axis=-1), 1.0))))(scaled_dot_product_attention(np.random.randn(6, 16), np.random.randn(6, 16), np.random.randn(6, 16))[1])',
        expected: '((6, 6), True)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches a reference implementation (d_v != d_k)',
        input: `(lambda: (
    Q := np.random.randn(5, 8), K := np.random.randn(5, 8), V := np.random.randn(5, 3),
    S := Q @ K.T / np.sqrt(8),
    W := np.exp(S - S.max(-1, keepdims=True)) / np.exp(S - S.max(-1, keepdims=True)).sum(-1, keepdims=True),
    out := scaled_dot_product_attention(Q, K, V),
    bool(np.allclose(out[0], W @ V) and np.allclose(out[1], W))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Scores are divided by sqrt(d_k)',
        input: 'round(float(scaled_dot_product_attention(np.array([[2.0, 0.0, 0.0, 0.0]]), np.array([[1.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0]]), np.random.randn(2, 2))[1][0, 0]), 4)',
        expected: '0.7311',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large scores stay finite (stable softmax)',
        input: 'bool(np.all(np.isfinite(scaled_dot_product_attention(np.random.randn(4, 8) * 100, np.random.randn(4, 8) * 100, np.random.randn(4, 8))[0])))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Every query is compared with every key, so the score matrix is (seq_len, seq_len). Which matrix product gives all the dot products at once?',
      'Three steps: scores, row-wise softmax, weighted sum of values. Return both the output and the weights.',
      'scores = Q @ K.T / np.sqrt(Q.shape[-1]); softmax along axis=-1 with keepdims=True; output = weights @ V.',
      'Subtract the row max before np.exp, or large scores overflow to inf and give NaN weights.',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    # Subtracting the max doesn't change the result but prevents overflow
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def scaled_dot_product_attention(Q, K, V):
    """
    Returns:
        (output (seq_len, d_v), attention_weights (seq_len, seq_len))
    """
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)          # (seq_len, seq_len)
    attention_weights = softmax(scores)      # each row is a distribution over keys
    output = attention_weights @ V           # (seq_len, d_v)
    return output, attention_weights

# Time O(n^2 * d), memory O(n^2) for the score matrix (n = seq_len)
`,
  },
  {
    id: 'multi-head-attention',
    title: 'Multi-Head Attention',
    section: 'transformers',
    difficulty: 'hard',
    description: `
## Multi-Head Attention

### What you'll build
The head-splitting core of multi-head attention: cut the model dimension into \`num_heads\` slices, run scaled dot-product attention on every slice in parallel, and concatenate the results.

### Background
One attention head produces one weighted average per query, so it can only "look" one way at a time. Several smaller heads let the model attend to different things at once (for example, the previous token in one head and the subject of the sentence in another) for the same cost as one big head. In a full layer, \`Q\`, \`K\`, \`V\` come from learned projections \`X @ W_Q\` etc. and the concatenated heads go through an output projection \`W_O\`. Here the inputs are **already projected** and there is **no output projection**: the task is the reshape-attend-merge part, which is where the shape bugs live.

### Formula
With \`d_k = d_model / num_heads\`, head \`h\` uses columns \`h*d_k : (h+1)*d_k\`:
\`\`\`text
head_h = softmax(Q_h @ K_h.T / sqrt(d_k)) @ V_h          # (seq_len, d_k)
output = concat(head_0, ..., head_{H-1}, axis=-1)        # (seq_len, d_model)
\`\`\`
Vectorised: reshape \`(seq_len, d_model) -> (seq_len, H, d_k)\`, transpose to \`(H, seq_len, d_k)\`, do batched attention, then undo both steps.

### Inputs
- \`Q\`, \`K\`, \`V\`: float arrays \`(seq_len, d_model)\`
- \`num_heads\`: int that divides \`d_model\`

### Expected Return Format
\`output\`: array \`(seq_len, d_model)\`, head \`h\`'s result in columns \`h*d_k : (h+1)*d_k\`.

### Edge cases and conventions
- Scale by \`sqrt(d_k)\` (the **per-head** width), not \`sqrt(d_model)\`.
- \`num_heads = 1\` is plain scaled dot-product attention.
- Stable softmax (subtract the row max).

### Constraints
NumPy only. Use reshape/transpose and batched matmul; no loop over heads is needed.

### Follow-up
- Add learned \`W_Q, W_K, W_V, W_O\`. How many parameters does the layer have? (Answer: \`4 · d_model^2\`, independent of \`num_heads\`.)
- Why does \`reshape(seq_len, d_model)\` directly on the \`(H, seq_len, d_k)\` array give the wrong answer?
`,
    examples: [
      {
        input: 'Q = K = np.array([[1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 1.0, 0.0]]), V = np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), num_heads = 2',
        output: '[[2.321, 3.321, 4.321, 5.321], [3.679, 4.679, 5.679, 6.679]]',
        explanation: 'Each head sees a 2-dim slice; in both heads token i matches itself best, so the weights are [[0.6698, 0.3302], [0.3302, 0.6698]].',
      },
      {
        input: 'Q (4, 64), K (4, 64), V (4, 64), num_heads = 8',
        output: 'output shape (4, 64)',
        explanation: '8 heads of width d_k = 8, concatenated back to 64.',
      },
    ],
    starterCode: `import numpy as np

def multi_head_attention(Q, K, V, num_heads):
    """
    Multi-head attention on already-projected Q, K, V (no learned weights).

    Args:
        Q: Queries (seq_len, d_model)
        K: Keys (seq_len, d_model)
        V: Values (seq_len, d_model)
        num_heads: Number of attention heads (divides d_model)

    Returns:
        output: (seq_len, d_model), head h in columns h*d_k:(h+1)*d_k
    """
    seq_len, d_model = Q.shape
    assert d_model % num_heads == 0
    d_k = d_model // num_heads

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'multi_head_attention(np.random.randn(4, 64), np.random.randn(4, 64), np.random.randn(4, 64), 8).shape',
        expected: '(4, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Hand-computed 2-head example',
        input: 'np.round(multi_head_attention(np.array([[1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 1.0, 0.0]]), np.array([[1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 1.0, 0.0]]), np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), 2), 4).tolist()',
        expected: '[[2.321, 3.321, 4.321, 5.321], [3.679, 4.679, 5.679, 6.679]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Matches attention run separately on each head slice',
        input: `(lambda: (
    Q := np.random.randn(5, 16), K := np.random.randn(5, 16), V := np.random.randn(5, 16),
    att := lambda q, k, v: (lambda S: (np.exp(S - S.max(-1, keepdims=True)) / np.exp(S - S.max(-1, keepdims=True)).sum(-1, keepdims=True)) @ v)(q @ k.T / 2.0),
    ref := np.concatenate([att(Q[:, h * 4:(h + 1) * 4], K[:, h * 4:(h + 1) * 4], V[:, h * 4:(h + 1) * 4]) for h in range(4)], axis=1),
    bool(np.allclose(multi_head_attention(Q, K, V, 4), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'One head equals plain scaled dot-product attention',
        input: `(lambda: (
    Q := np.random.randn(4, 8), K := np.random.randn(4, 8), V := np.random.randn(4, 8),
    S := Q @ K.T / np.sqrt(8),
    bool(np.allclose(multi_head_attention(Q, K, V, 1), (np.exp(S - S.max(-1, keepdims=True)) / np.exp(S - S.max(-1, keepdims=True)).sum(-1, keepdims=True)) @ V))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Zero queries attend uniformly: every row is the mean of V',
        input: '(lambda V: bool(np.allclose(multi_head_attention(np.zeros((3, 8)), np.random.randn(3, 8), V, 4), np.tile(V.mean(axis=0), (3, 1)))))(np.random.randn(3, 8))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large d_model with many heads (128 dims, 16 heads) stays finite',
        input: '(lambda out: (out.shape, bool(np.all(np.isfinite(out)))))(multi_head_attention(np.random.randn(3, 128), np.random.randn(3, 128), np.random.randn(3, 128), 16))',
        expected: '((3, 128), True)',
        hidden: true,
      },
    ],
    hints: [
      'Each head is ordinary attention on a d_k-wide slice of the columns. Can you get all the slices as one array with a leading head axis?',
      'Split: (seq_len, d_model) -> reshape (seq_len, H, d_k) -> transpose (H, seq_len, d_k). Attend per head with batched matmul, then invert both steps.',
      'scores = Qh @ Kh.transpose(0, 2, 1) / np.sqrt(d_k) has shape (H, seq_len, seq_len); softmax over axis=-1; heads = weights @ Vh.',
      'Merge with heads.transpose(1, 0, 2).reshape(seq_len, d_model). Reshaping without the transpose silently mixes tokens across heads.',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def multi_head_attention(Q, K, V, num_heads):
    """
    Returns:
        output: (seq_len, d_model), head h in columns h*d_k:(h+1)*d_k
    """
    seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    # (seq_len, d_model) -> (num_heads, seq_len, d_k)
    def split_heads(x):
        return x.reshape(seq_len, num_heads, d_k).transpose(1, 0, 2)

    Qh, Kh, Vh = split_heads(Q), split_heads(K), split_heads(V)

    # Batched attention over the head axis; scale by the per-head width
    scores = Qh @ Kh.transpose(0, 2, 1) / np.sqrt(d_k)   # (H, seq_len, seq_len)
    heads = softmax(scores) @ Vh                         # (H, seq_len, d_k)

    # (H, seq_len, d_k) -> (seq_len, H, d_k) -> (seq_len, d_model)
    return heads.transpose(1, 0, 2).reshape(seq_len, d_model)

# Same cost as one big head: O(n^2 * d_model) time, O(H * n^2) memory for the scores
`,
  },
  {
    id: 'positional-encoding',
    title: 'Sinusoidal Positional Encoding',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Sinusoidal Positional Encoding

### What you'll build
The fixed position table from "Attention Is All You Need": one \`d_model\`-dimensional vector per position, made of sines and cosines at geometrically spaced frequencies. It is added to the token embeddings.

### Background
Attention is permutation-invariant: shuffle the tokens and each output is shuffled the same way. Without position information, "dog bites man" and "man bites dog" look identical. The sinusoidal table gives every position a unique pattern, and because \`sin\`/\`cos\` at a fixed frequency rotate as the position advances, \`PE[pos + k]\` is a linear function of \`PE[pos]\` for every offset \`k\`. Modern LLMs mostly use **RoPE** (later in this section) instead, which applies the same frequencies as rotations inside attention.

### Formula
For position \`pos\` and pair index \`i = 0, 1, ..., d_model/2 - 1\`:
\`\`\`text
omega_i         = 1 / 10000^(2i / d_model)
PE[pos, 2i]     = sin(pos * omega_i)
PE[pos, 2i + 1] = cos(pos * omega_i)
\`\`\`
Column pair \`(2i, 2i+1)\` shares the frequency \`omega_i\`; frequencies go from 1 (fast) down to about \`1/10000\` (slow).

### Inputs
- \`max_len\`: int, number of positions (rows), positions are \`0 .. max_len - 1\`
- \`d_model\`: even int, embedding width

### Expected Return Format
\`PE\`: float array \`(max_len, d_model)\`, values in \`[-1, 1]\`.

### Edge cases and conventions
- Even columns are sines, odd columns are cosines (interleaved, not first half / second half).
- Row 0 is \`[0, 1, 0, 1, ...]\` because \`sin(0) = 0\` and \`cos(0) = 1\`.
- Computing \`omega_i\` as \`np.exp(-2i * ln(10000) / d_model)\` is equivalent and avoids huge powers.

### Constraints
NumPy only, vectorised (an outer product of positions and frequencies, no Python loops).

### Follow-up
- Why does \`PE[pos + k] = R_k @ PE[pos]\` for a block-diagonal rotation \`R_k\`?
- Learned position embeddings (GPT-2, used in **Mini GPT**) vs sinusoidal vs RoPE: which ones extrapolate past the training length?
`,
    examples: [
      {
        input: 'positional_encoding(3, 4)',
        output: '[[0.0, 1.0, 0.0, 1.0], [0.8415, 0.5403, 0.01, 1.0], [0.9093, -0.4161, 0.02, 0.9998]]',
        explanation: 'Frequencies are 1 and 1/100: columns 0-1 are sin/cos(pos), columns 2-3 are sin/cos(pos / 100).',
      },
      {
        input: 'positional_encoding(100, 512).shape',
        output: '(100, 512)',
        explanation: 'One row per position.',
      },
    ],
    starterCode: `import numpy as np

def positional_encoding(max_len, d_model):
    """
    Generate sinusoidal positional encodings.

    Args:
        max_len: Number of positions (rows)
        d_model: Model dimension (even)

    Returns:
        PE: (max_len, d_model); PE[pos, 2i] = sin(pos * w_i),
            PE[pos, 2i+1] = cos(pos * w_i), w_i = 1 / 10000^(2i / d_model)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Correct shape',
        input: 'positional_encoding(50, 64).shape',
        expected: '(50, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Hand-checkable table (max_len=3, d_model=4)',
        input: 'np.round(positional_encoding(3, 4), 4).tolist()',
        expected: '[[0.0, 1.0, 0.0, 1.0], [0.8415, 0.5403, 0.01, 1.0], [0.9093, -0.4161, 0.02, 0.9998]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Position 0 alternates sin(0)=0 and cos(0)=1',
        input: 'positional_encoding(10, 6)[0].tolist()',
        expected: '[0.0, 1.0, 0.0, 1.0, 0.0, 1.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches the formula for every entry of a larger table',
        input: `(lambda: (
    pe := positional_encoding(20, 8),
    pos := np.arange(20)[:, None], w := 1.0 / 10000 ** (np.arange(0, 8, 2) / 8),
    bool(np.allclose(pe[:, 0::2], np.sin(pos * w)) and np.allclose(pe[:, 1::2], np.cos(pos * w)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Spot values in a larger table',
        input: '(lambda pe: (round(float(pe[7, 2]), 4), round(float(pe[19, 5]), 4)))(positional_encoding(20, 8))',
        expected: '(0.6442, 0.982)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Values are bounded between -1 and 1',
        input: '(lambda pe: bool(np.all(pe >= -1.0) and np.all(pe <= 1.0)))(positional_encoding(50, 64))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Each pair of columns (2i, 2i+1) shares one frequency w_i. How many distinct frequencies are there for d_model columns?',
      'Build an angle matrix angles[pos, i] = pos * w_i as an outer product of a (max_len, 1) column and a (d_model/2,) row.',
      'w = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model)); then PE[:, 0::2] = np.sin(angles) and PE[:, 1::2] = np.cos(angles).',
      'Interleave (even = sin, odd = cos); putting all sines in the first half is a different (also common) layout and fails the tests.',
    ],
    solution: `import numpy as np

def positional_encoding(max_len, d_model):
    """
    Returns:
        PE: (max_len, d_model), sin in even columns, cos in odd columns
    """
    PE = np.zeros((max_len, d_model))
    position = np.arange(max_len)[:, np.newaxis]                       # (max_len, 1)
    # w_i = 1 / 10000^(2i / d_model), computed in log space
    div_term = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))  # (d_model/2,)
    angles = position * div_term                                       # (max_len, d_model/2)

    PE[:, 0::2] = np.sin(angles)
    PE[:, 1::2] = np.cos(angles)
    return PE

# O(max_len * d_model) time and memory
`,
  },
  {
    id: 'layer-norm',
    title: 'Layer Normalization',
    section: 'transformers',
    difficulty: 'easy',
    description: `
## Layer Normalization

### What you'll build
LayerNorm over the last (feature) axis, with a learned scale \`gamma\` and shift \`beta\`. Every Transformer block uses it.

### Background
BatchNorm normalizes each feature over the batch, which couples examples together and breaks down for variable-length sequences and batch size 1 at inference. LayerNorm normalizes each token's feature vector on its own, so it behaves identically in training and inference and needs no running statistics. In pre-norm Transformers (GPT-2 onwards) it sits at the start of every residual branch: \`x = x + Attn(LN(x))\`. LLaMA-style models use the cheaper **RMSNorm** (see **SwiGLU Feed-Forward Block** in LLM Internals).

### Formula
For each position (each vector \`x\` along the last axis, length \`D\`):
\`\`\`text
mu      = mean(x)                          # scalar per position
sigma^2 = mean((x - mu)^2)                 # population (biased) variance
y       = gamma * (x - mu) / sqrt(sigma^2 + eps) + beta
\`\`\`

### Inputs
- \`X\`: float array \`(..., D)\`, e.g. \`(seq_len, D)\` or \`(batch, seq_len, D)\`
- \`gamma\`, \`beta\`: float arrays \`(D,)\`
- \`eps\`: small float, default \`1e-5\`

### Expected Return Format
Array with the same shape as \`X\`.

### Edge cases and conventions
- Statistics are over **axis=-1 only**, never over the batch or sequence axes.
- Use the **biased** variance (\`np.var\` default, \`ddof=0\`), as PyTorch's \`nn.LayerNorm\` does.
- \`eps\` goes **inside** the square root. A constant row gives \`x - mu = 0\`, so the output is just \`beta\`.

### Constraints
NumPy only; use \`keepdims=True\` so the statistics broadcast for any number of leading axes.

### Follow-up
- Write the backward pass. Why do the gradients with respect to \`x\` sum to zero along the feature axis?
- Pre-norm vs post-norm: which one trains stably without learning-rate warmup, and why?
`,
    examples: [
      {
        input: 'layer_norm(np.array([[1.0, 2.0, 3.0, 4.0]]), np.ones(4), np.zeros(4))',
        output: '[[-1.3416, -0.4472, 0.4472, 1.3416]]',
        explanation: 'mean = 2.5, variance = 1.25, so (x - 2.5) / sqrt(1.25).',
      },
      {
        input: 'layer_norm(np.array([[2.0, 2.0, 2.0, 2.0]]), np.ones(4), np.array([0.0, 0.0, 0.0, 1.0]))',
        output: '[[0.0, 0.0, 0.0, 1.0]]',
        explanation: 'A constant row normalizes to 0 (eps avoids division by zero), leaving only beta.',
      },
    ],
    starterCode: `import numpy as np

def layer_norm(X, gamma, beta, eps=1e-5):
    """
    Apply layer normalization over the last axis.

    Args:
        X: Input (..., D), e.g. (batch, seq_len, D) or (seq_len, D)
        gamma: Scale (D,)
        beta: Shift (D,)
        eps: Small constant added to the variance

    Returns:
        Array with the same shape as X
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Hand-computed row (gamma=1, beta=0)',
        input: 'np.round(layer_norm(np.array([[1.0, 2.0, 3.0, 4.0]]), np.ones(4), np.zeros(4)), 4).tolist()',
        expected: '[[-1.3416, -0.4472, 0.4472, 1.3416]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Output mean near zero for each row',
        input: 'bool(np.allclose(layer_norm(np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), np.ones(4), np.zeros(4)).mean(axis=-1), 0.0, atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gamma and beta, plus a constant row',
        input: 'np.round(layer_norm(np.array([[1.0, 2.0, 3.0, 4.0], [2.0, 2.0, 2.0, 2.0]]), np.array([1.0, 1.0, 2.0, 2.0]), np.array([0.0, 0.0, 0.0, 1.0])), 4).tolist()',
        expected: '[[-1.3416, -0.4472, 0.8944, 3.6833], [0.0, 0.0, 0.0, 1.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Uses the biased variance (unit variance output)',
        input: 'bool(np.allclose(layer_norm(np.random.randn(5, 64), np.ones(64), np.zeros(64)).var(axis=-1), 1.0, atol=1e-3))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Works on 3D input and normalizes the last axis only',
        input: `(lambda: (
    X := np.random.randn(2, 3, 8) * 3 + 1, g := np.random.randn(8), b := np.random.randn(8),
    ref := g * (X - X.mean(-1, keepdims=True)) / np.sqrt(X.var(-1, keepdims=True) + 1e-5) + b,
    bool(np.allclose(layer_norm(X, g, b), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Each position is normalized on its own: which axis do you compute the mean and variance over?',
      'Compute the mean and variance along axis=-1, normalize, then scale by gamma and shift by beta.',
      'mean = X.mean(axis=-1, keepdims=True); var = X.var(axis=-1, keepdims=True); X_hat = (X - mean) / np.sqrt(var + eps).',
      'Without keepdims=True the statistics will not broadcast against (..., D). Use the biased variance (ddof=0).',
    ],
    solution: `import numpy as np

def layer_norm(X, gamma, beta, eps=1e-5):
    """
    Returns:
        Array with the same shape as X, normalized over the last axis
    """
    mean = np.mean(X, axis=-1, keepdims=True)   # (..., 1)
    var = np.var(X, axis=-1, keepdims=True)     # biased (population) variance
    X_hat = (X - mean) / np.sqrt(var + eps)
    return gamma * X_hat + beta

# O(N * D) time, where N is the number of positions
`,
  },
  {
    id: 'causal-mask',
    title: 'Causal Attention Mask',
    section: 'transformers',
    difficulty: 'easy',
    description: `
## Causal (Autoregressive) Attention Mask

### What you'll build
The additive mask that stops a decoder position from attending to later positions: 0 where attention is allowed, \`-inf\` where it is not.

### Background
A language model is trained to predict token \`t+1\` from tokens \`0..t\`. Training runs all positions in parallel, so without a mask position \`t\` could simply read token \`t+1\` from its input and the loss would be meaningless. Adding \`-inf\` to the forbidden scores makes \`exp(-inf) = 0\` after the softmax, so those keys get exactly zero weight. GPT-style decoders, **Mini GPT** and the **KV Cache** problem all rely on this.

### Formula
\`\`\`text
mask[i, j] = 0      if j <= i      (key j is at or before query i)
mask[i, j] = -inf   if j > i       (key j is in the future)

attention = softmax(Q @ K.T / sqrt(d_k) + mask) @ V
\`\`\`
For \`seq_len = 4\`:
\`\`\`text
[[0, -inf, -inf, -inf],
 [0,    0, -inf, -inf],
 [0,    0,    0, -inf],
 [0,    0,    0,    0]]
\`\`\`

### Inputs
- \`seq_len\`: positive int

### Expected Return Format
Float array \`(seq_len, seq_len)\` containing only \`0.0\` and \`-inf\` (\`float('-inf')\` / \`-np.inf\`).

### Edge cases and conventions
- The diagonal is \`0\`: every token attends to itself, so no row is fully masked and the softmax never sees an all-\`-inf\` row (which would give NaN).
- Rows are queries, columns are keys.

### Constraints
NumPy only, no loops (\`np.triu\`, \`np.tril\` or index comparisons).

### Follow-up
- Some code uses a large negative number (e.g. \`-1e9\`) instead of \`-inf\`. When does that matter (hint: fp16)?
- How do you combine this with a padding mask for a batch of left-padded prompts?
`,
    examples: [
      {
        input: 'create_causal_mask(3)',
        output: '[[0.0, -inf, -inf], [0.0, 0.0, -inf], [0.0, 0.0, 0.0]]',
        explanation: 'Query i may attend to keys 0..i.',
      },
      {
        input: 'softmax(create_causal_mask(4))[1]',
        output: '[0.5, 0.5, 0.0, 0.0]',
        explanation: 'With all scores equal, row 1 spreads its weight over its two visible keys.',
      },
    ],
    starterCode: `import numpy as np

def create_causal_mask(seq_len):
    """
    Create an additive causal attention mask.

    Args:
        seq_len: Sequence length

    Returns:
        mask: (seq_len, seq_len) float array,
              0.0 where key j <= query i, -inf where j > i
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Correct shape',
        input: 'create_causal_mask(4).shape',
        expected: '(4, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Pattern of -inf entries (seq_len=3)',
        input: 'np.isneginf(create_causal_mask(3)).tolist()',
        expected: '[[False, True, True], [False, False, True], [False, False, False]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Exact values: lower triangle 0, upper triangle -inf',
        input: 'bool(np.array_equal(create_causal_mask(3), np.array([[0.0, float("-inf"), float("-inf")], [0.0, 0.0, float("-inf")], [0.0, 0.0, 0.0]])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Diagonal is all zeros (each position attends to itself)',
        input: 'bool(np.all(np.diag(create_causal_mask(5)) == 0.0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'After a softmax, row 1 attends equally to positions 0 and 1 only',
        input: '(lambda M: np.round(np.exp(M[1] - M[1].max()) / np.exp(M[1] - M[1].max()).sum(), 4).tolist())(create_causal_mask(4))',
        expected: '[0.5, 0.5, 0.0, 0.0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Upper triangle is all -inf for a larger mask',
        input: '(lambda M: bool(np.all(M[np.triu_indices(6, k=1)] == float("-inf")) and np.all(M[np.tril_indices(6)] == 0.0)))(create_causal_mask(6))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Which entries are forbidden? Write the condition in terms of the query index i (row) and key index j (column).',
      'Build a boolean "future" matrix that is True strictly above the diagonal, then map True -> -inf and False -> 0.',
      'np.triu(np.ones((n, n)), k=1) marks the strict upper triangle; np.where(future, -np.inf, 0.0) builds the mask.',
      'Use k=1, not k=0: masking the diagonal would hide each token from itself and leave row 0 fully masked (NaN after softmax).',
    ],
    solution: `import numpy as np

def create_causal_mask(seq_len):
    """
    Returns:
        mask: (seq_len, seq_len), 0.0 on/below the diagonal, -inf above it
    """
    # True strictly above the diagonal: key j is in the future of query i
    future = np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1)
    return np.where(future, -np.inf, 0.0)
`,
  },
  {
    id: 'bpe-tokenization',
    title: 'BPE Tokenization',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Byte-Pair Encoding (BPE) Training

### What you'll build
The training loop of BPE: starting from characters, repeatedly merge the most frequent adjacent pair of tokens and record the merge rules in order.

### Background
Tokenization is the first step of every LLM pipeline (\`text -> token ids -> embeddings\`). Word-level vocabularies can't handle unseen words; character-level sequences are long and slow. BPE (Sennrich et al., 2016; byte-level in GPT-2, LLaMA and most LLMs) sits in between: frequent words become single tokens and rare words split into known subwords, so there is never an unknown token. The ordered merge list **is** the tokenizer: to encode new text you apply the merges in the same order.

### Algorithm
1. Split every word into its tokens (initially characters, plus the end-of-word marker \`</w>\`).
2. Count every **adjacent** pair of tokens across the corpus, **weighted by the word's frequency**.
3. Pick the most frequent pair \`(a, b)\` and append it to \`merges\`.
4. Replace every occurrence of \`a b\` with the single token \`ab\` in every word, scanning **left to right** (so \`a a a\` with the pair \`(a, a)\` becomes \`aa a\`).
5. Repeat \`num_merges\` times, or stop early when no word has two or more tokens left.

### Inputs
- \`word_freqs\`: dict mapping a space-separated token sequence to its count, e.g. \`{"h u g </w>": 10, "p u g </w>": 5}\`
- \`num_merges\`: int >= 0, the maximum number of merges

### Expected Return Format
A list of \`(token_a, token_b)\` tuples of strings, in the order they were merged. Its length is \`num_merges\`, or less if the corpus ran out of pairs.

### Edge cases and conventions
- **Ties:** when several pairs share the top count, pick the one **seen first** when you scan the words in dict order and each word left to right. \`max(counter, key=counter.get)\` on a \`collections.Counter\` filled in that order does exactly this. (In the example, \`('u', 'g')\` and \`('g', '</w>')\` are both 17; \`('u', 'g')\` appears first.)
- Recount the pairs after every merge: merges change which pairs exist.

### Constraints
Plain Python (\`collections.Counter\` is fine); no tokenizer libraries.

### Follow-up
- Write \`encode(word, merges)\`: apply the merges in order. Why must encoding use the training order rather than "longest token first" (see **Greedy Longest-Match Tokenizer**)?
- Byte-level BPE starts from 256 bytes instead of characters. What problem does that solve?
`,
    examples: [
      {
        input: 'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)',
        output: "[('u', 'g'), ('ug', '</w>'), ('h', 'ug</w>')]",
        explanation: "('u','g') and ('g','</w>') tie at 17 and ('u','g') is seen first; then 'ug </w>' (17), then 'h ug</w>' (10).",
      },
      {
        input: 'bpe_train({"a b </w>": 1, "c d </w>": 1}, 5)',
        output: "[('a', 'b'), ('ab', '</w>'), ('c', 'd'), ('cd', '</w>')]",
        explanation: 'Every word is a single token after 4 merges, so training stops early.',
      },
    ],
    starterCode: `from collections import Counter

def bpe_train(word_freqs, num_merges):
    """
    Train a BPE tokenizer by learning merge rules.

    Args:
        word_freqs: Dict mapping space-separated token sequences to frequency,
                    e.g. {"h u g </w>": 10, "p u g </w>": 5}
        num_merges: Maximum number of merge operations

    Returns:
        merges: List of (token_a, token_b) tuples, in the order merged
                (ties: the pair seen first, scanning words in dict order)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'First merge is the most frequent pair (tie broken by first occurrence)',
        input: 'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)[0]',
        expected: "('u', 'g')",
        hidden: false,
      },
      {
        id: '2',
        description: 'Full merge list for the example corpus',
        input: 'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)',
        expected: "[('u', 'g'), ('ug', '</w>'), ('h', 'ug</w>')]",
        hidden: false,
      },
      {
        id: '3',
        description: 'Works with a different corpus',
        input: 'bpe_train({"a b c </w>": 10, "a b </w>": 7, "b c </w>": 3}, 2)',
        expected: "[('a', 'b'), ('c', '</w>')]",
        hidden: true,
      },
      {
        id: '4',
        description: 'Full merge list, stopping when no pairs are left',
        input: 'bpe_train({"l o w </w>": 5, "l o w e r </w>": 2, "n e w </w>": 6}, 20)',
        expected: "[('w', '</w>'), ('l', 'o'), ('n', 'e'), ('ne', 'w</w>'), ('lo', 'w</w>'), ('lo', 'w'), ('low', 'e'), ('lowe', 'r'), ('lower', '</w>')]",
        hidden: true,
      },
      {
        id: '5',
        description: 'Overlapping pairs merge left to right',
        input: 'bpe_train({"a a a </w>": 1}, 2)',
        expected: "[('a', 'a'), ('aa', 'a')]",
        hidden: true,
      },
      {
        id: '6',
        description: 'num_merges = 0 returns an empty list',
        input: 'bpe_train({"h u g </w>": 10}, 0)',
        expected: '[]',
        hidden: true,
      },
    ],
    hints: [
      'Keep the current token list of every word, and recount the pair frequencies from scratch after each merge.',
      'Each iteration: count weighted adjacent pairs, pick the best, record it, then rewrite every word with that pair merged.',
      'Count with a Counter: for a, b in zip(tokens, tokens[1:]): counts[(a, b)] += freq. best = max(counts, key=counts.get).',
      'Merge by scanning with an index and jumping by 2 after a merge, so "a a a" becomes "aa a" (not "aa aa"). Stop when the counter is empty.',
    ],
    solution: `from collections import Counter

def bpe_train(word_freqs, num_merges):
    """
    Returns:
        merges: List of (token_a, token_b) tuples, in the order merged
    """
    splits = {word: word.split() for word in word_freqs}   # current tokens of each word
    merges = []

    for _ in range(num_merges):
        # Count adjacent pairs, weighted by word frequency (insertion order = first seen)
        pair_freqs = Counter()
        for word, freq in word_freqs.items():
            tokens = splits[word]
            for a, b in zip(tokens, tokens[1:]):
                pair_freqs[(a, b)] += freq

        if not pair_freqs:          # every word is a single token
            break

        best_pair = max(pair_freqs, key=pair_freqs.get)   # first max wins ties
        merges.append(best_pair)

        # Replace the pair everywhere, scanning left to right
        for word, tokens in splits.items():
            new_tokens = []
            i = 0
            while i < len(tokens):
                if i < len(tokens) - 1 and (tokens[i], tokens[i + 1]) == best_pair:
                    new_tokens.append(tokens[i] + tokens[i + 1])
                    i += 2
                else:
                    new_tokens.append(tokens[i])
                    i += 1
            splits[word] = new_tokens

    return merges

# Each merge costs O(total corpus tokens); real tokenizers update pair counts incrementally
`,
  },
  {
    id: 'rope-embeddings',
    title: 'Rotary Positional Embeddings (RoPE)',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Rotary Positional Embeddings (RoPE)

### What you'll build
Apply RoPE to queries and keys: rotate each pair of dimensions by an angle proportional to the token's position. LLaMA, Mistral, Qwen, GPT-NeoX and most modern LLMs use it.

### Background
Sinusoidal encodings are **added** to the embeddings once, at the input. RoPE instead **rotates** \`q\` and \`k\` inside every attention layer. Rotating \`q\` at position \`m\` by \`m·θ\` and \`k\` at position \`n\` by \`n·θ\` makes their dot product depend only on the angle difference \`(m - n)·θ\`, so attention scores see **relative** positions, with no learned parameters and no change to the vectors' norms. Values \`V\` are not rotated.

### Formula
For position \`pos\` (row index, starting at 0), \`d = d_model\` and pair index \`i = 0 .. d/2 - 1\`:
\`\`\`text
theta_i = 1 / 10000^(2i / d)
a       = pos * theta_i

x_rot[2i]     = x[2i] * cos(a) - x[2i+1] * sin(a)
x_rot[2i + 1] = x[2i] * sin(a) + x[2i+1] * cos(a)
\`\`\`
This is the 2-D rotation \`[[cos a, -sin a], [sin a, cos a]]\` applied to the pair \`(x[2i], x[2i+1])\`. Apply it to every row of \`Q\` and of \`K\`.

### Inputs
- \`Q\`: float array \`(seq_len, d_model)\`, \`d_model\` even
- \`K\`: float array \`(seq_len, d_model)\`

### Expected Return Format
A tuple \`(Q_rot, K_rot)\`, each with the shape of its input.

### Edge cases and conventions
- **Interleaved pairs** \`(0,1), (2,3), ...\` as in the RoFormer paper. Hugging Face LLaMA code pairs dimension \`i\` with \`i + d/2\` ("rotate_half"); it is the same idea with permuted dimensions, but it gives different numbers, so use the interleaved layout here.
- Position 0 is unchanged (angle 0). Don't modify the inputs in place.

### Constraints
NumPy only, vectorised over positions and pairs (strided slicing \`x[:, 0::2]\`, \`x[:, 1::2]\`).

### Follow-up
- Prove \`<R(m) q, R(n) k> = <q, R(n - m) k>\`.
- Context extension (NTK scaling, YaRN) changes the base 10000. Which pairs are affected most, and why?
`,
    examples: [
      {
        input: 'apply_rope(np.array([[1.0, 0.0, 1.0, 0.0]] * 3), K)[0]',
        output: '[[1.0, 0.0, 1.0, 0.0], [0.5403, 0.8415, 1.0, 0.01], [-0.4161, 0.9093, 0.9998, 0.02]]',
        explanation: 'theta = [1, 0.01]: pair 0 rotates by pos radians, pair 1 by pos / 100 radians.',
      },
      {
        input: 'apply_rope(np.ones((2, 2)), np.ones((2, 2)))[0]',
        output: '[[1.0, 1.0], [-0.3012, 1.3818]]',
        explanation: 'Row 1: (cos 1 - sin 1, sin 1 + cos 1); the norm stays sqrt(2).',
      },
    ],
    starterCode: `import numpy as np

def apply_rope(Q, K):
    """
    Apply Rotary Positional Embeddings to Q and K (interleaved pairs).

    Args:
        Q: Queries (seq_len, d_model), d_model even
        K: Keys (seq_len, d_model)

    Returns:
        (Q_rot, K_rot): pair (2i, 2i+1) of row pos rotated by pos * theta_i,
                        theta_i = 1 / 10000^(2i / d_model)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shapes preserved',
        input: '(lambda r: (r[0].shape, r[1].shape))(apply_rope(np.ones((4, 8)), np.ones((4, 8))))',
        expected: '((4, 8), (4, 8))',
        hidden: false,
      },
      {
        id: '2',
        description: 'Position 0 is unchanged (rotation angle is 0)',
        input: 'apply_rope(np.array([[1.0, 2.0, 3.0, 4.0]]), np.ones((1, 4)))[0].tolist()',
        expected: '[[1.0, 2.0, 3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Hand-computed rotation at position 1 (d=2, theta=1)',
        input: 'np.round(apply_rope(np.ones((2, 2)), np.ones((2, 2)))[0][1], 4).tolist()',
        expected: '[-0.3012, 1.3818]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Per-pair frequencies at position 3 (d=4)',
        input: 'np.round(apply_rope(np.ones((4, 4)), np.zeros((4, 4)))[0][3], 4).tolist()',
        expected: '[-1.1311, -0.8489, 0.9696, 1.0295]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Rotation preserves vector norms',
        input: '(lambda Q: bool(np.allclose(np.linalg.norm(apply_rope(Q, Q)[0], axis=-1), np.linalg.norm(Q, axis=-1))))(np.random.randn(6, 8))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'K gets the same rotation as Q',
        input: '(lambda Q, K: (lambda out: bool(np.allclose(out[1], apply_rope(K, Q)[0]) and not np.allclose(out[1][1:], K[1:])))(apply_rope(Q, K)))(np.random.randn(5, 6), np.random.randn(5, 6))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'q . k depends only on the relative position',
        input: '(lambda q, k: (lambda out: bool(np.isclose(out[0][4] @ out[1][1], out[0][5] @ out[1][2])))(apply_rope(q, k)))(np.tile(np.random.randn(1, 8), (6, 1)), np.tile(np.random.randn(1, 8), (6, 1)))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Think of each row as d/2 points in 2-D. Each point is rotated by its own angle, which depends on the row (position) and the pair index (frequency).',
      'Build an angles matrix (seq_len, d/2) = positions[:, None] * theta[None, :], then rotate all pairs at once with cos and sin of it.',
      'x_even, x_odd = x[:, 0::2], x[:, 1::2]; out[:, 0::2] = x_even * cos - x_odd * sin; out[:, 1::2] = x_even * sin + x_odd * cos.',
      'Write into a new array (np.empty_like): updating x[:, 0::2] in place and then reading it for the odd half uses already-rotated values.',
    ],
    solution: `import numpy as np

def apply_rope(Q, K):
    """
    Returns:
        (Q_rot, K_rot), same shapes as Q and K
    """
    seq_len, d = Q.shape

    # Rotation angle for every (position, pair): pos * theta_i
    positions = np.arange(seq_len)[:, np.newaxis]        # (seq_len, 1)
    theta = 1.0 / (10000.0 ** (np.arange(0, d, 2) / d))  # (d/2,)
    angles = positions * theta                           # (seq_len, d/2)
    cos_a, sin_a = np.cos(angles), np.sin(angles)

    def rotate(x):
        x_even, x_odd = x[:, 0::2], x[:, 1::2]
        out = np.empty(x.shape)                          # don't overwrite the input
        out[:, 0::2] = x_even * cos_a - x_odd * sin_a
        out[:, 1::2] = x_even * sin_a + x_odd * cos_a
        return out

    return rotate(Q), rotate(K)

# O(seq_len * d) time; no parameters
`,
  },
  {
    id: 'grouped-query-attention',
    title: 'Grouped Query Attention (GQA)',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Grouped Query Attention (GQA)

### What you'll build
Attention where many query heads share a smaller set of key/value heads. LLaMA 2 70B, LLaMA 3, Mistral, Gemma and most modern LLMs use it to shrink the KV cache.

### Background
During generation the model stores every past token's keys and values (the **KV cache**, see LLM Generation & Decoding). Its size is \`2 · n_layers · n_kv_heads · d_head · seq_len\` numbers per sequence, and reading it every step is what makes decoding memory-bound. GQA keeps all \`num_q_heads\` query heads but only \`num_kv_heads\` K/V heads, cutting the cache by \`num_q_heads / num_kv_heads\` with little quality loss.

| Variant | Query heads | KV heads | Used in |
|---------|-------------|----------|---------|
| MHA | H | H | Original Transformer, GPT-2 |
| GQA | H | G (1 < G < H) | LLaMA 2 70B, LLaMA 3, Mistral |
| MQA | H | 1 | PaLM, Falcon |

### Algorithm
With \`d_head = Q.shape[1] / num_q_heads\` and \`group_size = num_q_heads / num_kv_heads\`:
1. Split \`Q\` into \`num_q_heads\` heads and \`K\`, \`V\` into \`num_kv_heads\` heads: shape \`(heads, seq_len, d_head)\`, head \`h\` taking columns \`h*d_head : (h+1)*d_head\`.
2. **Query head \`h\` uses KV head \`h // group_size\`**: consecutive query heads share a KV head. Repeating each KV head \`group_size\` times along the head axis does this.
3. Per head: \`softmax(q_h @ k_h.T / sqrt(d_head)) @ v_h\`.
4. Concatenate the query heads back to \`(seq_len, num_q_heads * d_head)\`.

### Inputs
- \`Q\`: \`(seq_len, num_q_heads * d_head)\`
- \`K\`, \`V\`: \`(seq_len, num_kv_heads * d_head)\`
- \`num_q_heads\`, \`num_kv_heads\`: ints, \`num_kv_heads\` divides \`num_q_heads\`

### Expected Return Format
\`output\`: array \`(seq_len, num_q_heads * d_head)\`.

### Edge cases and conventions
- \`num_kv_heads == num_q_heads\` is ordinary multi-head attention; \`num_kv_heads == 1\` is MQA.
- Use \`np.repeat\` (each head repeated consecutively), not \`np.tile\` (which cycles through the heads and pairs query head 1 with KV head 1 instead of 0).
- No causal mask; stable softmax.

### Constraints
NumPy only, vectorised (reshape/transpose, \`np.repeat\`, batched matmul).

### Follow-up
- LLaMA 2 70B has 64 query heads and 8 KV heads. By how much does GQA shrink its KV cache?
- Can you avoid materialising the repeated K and V? (Reshape the query heads to \`(num_kv_heads, group_size, ...)\` and broadcast.)
`,
    examples: [
      {
        input: 'Q = np.array([[1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 1.0, 0.0]]), K = np.eye(2), V = np.array([[1.0, 2.0], [3.0, 4.0]]), num_q_heads = 2, num_kv_heads = 1',
        output: '[[1.6605, 2.6605, 2.3395, 3.3395], [2.3395, 3.3395, 1.6605, 2.6605]]',
        explanation: 'Both query heads share the one KV head; head 0 matches key i at row i, head 1 matches the other key.',
      },
      {
        input: 'Q (1, 8), K (1, 4), V = np.array([[1.0, 2.0, 3.0, 4.0]]), num_q_heads = 4, num_kv_heads = 2',
        output: '[[1.0, 2.0, 1.0, 2.0, 3.0, 4.0, 3.0, 4.0]]',
        explanation: 'One token, so every weight is 1: query heads 0-1 return KV head 0 ([1, 2]) and heads 2-3 return KV head 1 ([3, 4]).',
      },
    ],
    starterCode: `import numpy as np

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    """
    Grouped Query Attention (query head h uses KV head h // group_size).

    Args:
        Q: Queries (seq_len, num_q_heads * d_head)
        K: Keys (seq_len, num_kv_heads * d_head)
        V: Values (seq_len, num_kv_heads * d_head)
        num_q_heads: Number of query heads
        num_kv_heads: Number of key/value heads (divides num_q_heads)

    Returns:
        output: (seq_len, num_q_heads * d_head)
    """
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'GQA output shape (8 Q heads, 2 KV heads)',
        input: 'grouped_query_attention(np.random.randn(4, 64), np.random.randn(4, 16), np.random.randn(4, 16), 8, 2).shape',
        expected: '(4, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single token: query heads return their group\'s value head',
        input: 'grouped_query_attention(np.random.randn(1, 8), np.random.randn(1, 4), np.array([[1.0, 2.0, 3.0, 4.0]]), 4, 2).tolist()',
        expected: '[[1.0, 2.0, 1.0, 2.0, 3.0, 4.0, 3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'MQA hand-computed example (2 query heads, 1 KV head)',
        input: 'np.round(grouped_query_attention(np.array([[1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 1.0, 0.0]]), np.eye(2), np.array([[1.0, 2.0], [3.0, 4.0]]), 2, 1), 4).tolist()',
        expected: '[[1.6605, 2.6605, 2.3395, 3.3395], [2.3395, 3.3395, 1.6605, 2.6605]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches a per-head reference with consecutive grouping',
        input: `(lambda: (
    Q := np.random.randn(5, 24), K := np.random.randn(5, 8), V := np.random.randn(5, 8),
    att := lambda q, k, v: (lambda S: (np.exp(S - S.max(-1, keepdims=True)) / np.exp(S - S.max(-1, keepdims=True)).sum(-1, keepdims=True)) @ v)(q @ k.T / 2.0),
    ref := np.concatenate([att(Q[:, h * 4:(h + 1) * 4], K[:, (h // 3) * 4:(h // 3 + 1) * 4], V[:, (h // 3) * 4:(h // 3 + 1) * 4]) for h in range(6)], axis=1),
    bool(np.allclose(grouped_query_attention(Q, K, V, 6, 2), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'MHA case (num_kv_heads == num_q_heads) values',
        input: 'np.round(grouped_query_attention(np.eye(2), np.eye(2), np.array([[1.0, 2.0], [3.0, 4.0]]), 2, 2), 4).ravel().tolist()',
        expected: '[1.5379, 3.0, 2.0, 3.4621]',
        hidden: true,
      },
      {
        id: '6',
        description: 'MQA shape (1 KV head shared by all query heads) and finite output',
        input: '(lambda out: (out.shape, bool(np.all(np.isfinite(out)))))(grouped_query_attention(np.random.randn(4, 32), np.random.randn(4, 4), np.random.randn(4, 4), 8, 1))',
        expected: '((4, 32), True)',
        hidden: true,
      },
    ],
    hints: [
      'This is multi-head attention where several query heads read the same K/V head. Which KV head should query head h use?',
      'Split Q into (num_q_heads, seq_len, d_head) and K, V into (num_kv_heads, seq_len, d_head); expand K and V so there is one head per query head; then do ordinary batched attention.',
      'np.repeat(K_heads, group_size, axis=0) gives query head h the KV head h // group_size. scores = q @ k.transpose(0, 2, 1) / np.sqrt(d_head).',
      'np.tile instead of np.repeat pairs the heads in the wrong order; scale by sqrt(d_head), not sqrt(num_q_heads * d_head).',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    """
    Returns:
        output: (seq_len, num_q_heads * d_head)
    """
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Per-head layout: (num_heads, seq_len, d_head)
    q = Q.reshape(seq_len, num_q_heads, d_head).transpose(1, 0, 2)
    k = K.reshape(seq_len, num_kv_heads, d_head).transpose(1, 0, 2)
    v = V.reshape(seq_len, num_kv_heads, d_head).transpose(1, 0, 2)

    # KV head g serves query heads g*group_size ... (g+1)*group_size - 1
    k = np.repeat(k, group_size, axis=0)
    v = np.repeat(v, group_size, axis=0)

    scores = q @ k.transpose(0, 2, 1) / np.sqrt(d_head)   # (num_q_heads, seq_len, seq_len)
    heads = softmax(scores) @ v                           # (num_q_heads, seq_len, d_head)

    # Concatenate query heads
    return heads.transpose(1, 0, 2).reshape(seq_len, -1)

# Compute is the same as MHA; the KV cache shrinks by num_q_heads / num_kv_heads
`,
  },
  {
    id: 'sliding-window-attention',
    title: 'Sliding Window Attention',
    section: 'transformers',
    difficulty: 'easy',
    description: `
## Sliding Window Attention Mask

### What you'll build
A causal mask that also limits how far back each token can look: position \`i\` may attend only to the \`window_size\` most recent positions, itself included. Mistral and Gemma 2/3 (in alternating layers) use this pattern.

### Background
Full causal attention costs \`O(n^2)\` time and the KV cache grows with the whole context. With a window of \`W\` tokens, each query reads at most \`W\` keys, so attention costs \`O(n · W)\` and the cache can be a fixed-size ring buffer of \`W\` entries. Information still travels further than \`W\`: stacking layers lets a token see about \`L · (W - 1)\` positions back after \`L\` layers, like the receptive field of stacked convolutions.

### Formula
\`\`\`text
allowed(i, j) = (j <= i) and (i - j < window_size)
mask[i, j]    = 0 if allowed(i, j) else -inf
\`\`\`
For \`seq_len = 5\`, \`window_size = 3\`:
\`\`\`text
[[   0, -inf, -inf, -inf, -inf],
 [   0,    0, -inf, -inf, -inf],
 [   0,    0,    0, -inf, -inf],
 [-inf,    0,    0,    0, -inf],
 [-inf, -inf,    0,    0,    0]]
\`\`\`

### Inputs
- \`seq_len\`: positive int
- \`window_size\`: int >= 1, number of visible positions **including the token itself**

### Expected Return Format
Float array \`(seq_len, seq_len)\` with \`0.0\` for allowed and \`-inf\` for masked entries (rows = queries, columns = keys).

### Edge cases and conventions
- \`window_size = 1\`: only the diagonal is allowed.
- \`window_size >= seq_len\`: identical to the plain **Causal Attention Mask**.
- The diagonal is always allowed, so no row is fully masked.

### Constraints
NumPy only, no loops (broadcast row and column index arrays).

### Follow-up
- How would you implement the KV cache for a sliding window model as a ring buffer?
- Off-by-one check: with a window of 4096, can token 5000 see token 904? (\`5000 - 904 = 4096\`, which is not \`< 4096\`, so no.)
`,
    examples: [
      {
        input: 'sliding_window_mask(4, 2)',
        output: '[[0, -inf, -inf, -inf], [0, 0, -inf, -inf], [-inf, 0, 0, -inf], [-inf, -inf, 0, 0]]',
        explanation: 'Each row allows itself and the one token before it.',
      },
      {
        input: 'sliding_window_mask(3, 10)',
        output: '[[0, -inf, -inf], [0, 0, -inf], [0, 0, 0]]',
        explanation: 'A window longer than the sequence is just a causal mask.',
      },
    ],
    starterCode: `import numpy as np

def sliding_window_mask(seq_len, window_size):
    """
    Create a sliding window causal attention mask.

    Args:
        seq_len: Sequence length
        window_size: Number of positions each token can attend to,
                     including itself

    Returns:
        mask: (seq_len, seq_len), 0.0 where j <= i and i - j < window_size,
              -inf elsewhere
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Correct shape',
        input: 'sliding_window_mask(6, 3).shape',
        expected: '(6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Allowed pattern for seq_len=4, window=2',
        input: '(sliding_window_mask(4, 2) == 0).astype(int).tolist()',
        expected: '[[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Full pattern for seq_len=5, window=3',
        input: '(sliding_window_mask(5, 3) == 0).astype(int).tolist()',
        expected: '[[1, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0], [0, 1, 1, 1, 0], [0, 0, 1, 1, 1]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Masked entries are exactly -inf',
        input: '(lambda M: bool(np.all(np.isneginf(M[M != 0])) and np.isneginf(M).sum() == 43))(sliding_window_mask(8, 3))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Large window equals the causal mask',
        input: 'bool(np.array_equal(sliding_window_mask(4, 10), np.where(np.triu(np.ones((4, 4)), k=1) == 1, float("-inf"), 0.0)))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Window 1 allows only the diagonal',
        input: '(sliding_window_mask(4, 1) == 0).astype(int).tolist()',
        expected: '[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]',
        hidden: true,
      },
    ],
    hints: [
      'Two conditions must both hold: the key is not in the future, and it is not too far in the past.',
      'Make a column of row indices and a row of column indices; broadcasting them gives every (i, j) pair at once.',
      'rows = np.arange(n)[:, None]; cols = np.arange(n)[None, :]; allowed = (cols <= rows) & (rows - cols < window_size); np.where(allowed, 0.0, -np.inf).',
      'The window includes the token itself: use rows - cols < window_size, not <=.',
    ],
    solution: `import numpy as np

def sliding_window_mask(seq_len, window_size):
    """
    Returns:
        mask: (seq_len, seq_len), 0.0 for allowed, -inf for masked
    """
    rows = np.arange(seq_len)[:, None]   # query positions
    cols = np.arange(seq_len)[None, :]   # key positions

    # Causal (no future keys) and within the last window_size positions
    allowed = (cols <= rows) & (rows - cols < window_size)
    return np.where(allowed, 0.0, -np.inf)
`,
  },
  {
    id: 'attention-backward',
    title: 'Attention Backward Pass (dQ, dK, dV)',
    section: 'transformers',
    difficulty: 'hard',
    description: `
## Attention Backward Pass

### What you'll build
Single-head scaled dot-product attention **and its backward pass by hand**: given the upstream gradient \`dOut = dL/dOut\`, return \`dQ\`, \`dK\` and \`dV\`. This is what autograd (and FlashAttention's backward kernel) computes for every attention layer.

### Background
Interviewers ask for this to check that you can backpropagate through a matrix product and a softmax without a framework. The only non-obvious step is the softmax: its Jacobian is \`diag(p) - p p^T\`, but you never build it; you apply it to a vector in \`O(m)\` per row.

### Forward
Shapes: \`Q (n, d)\`, \`K (m, d)\`, \`V (m, d_v)\`.
\`\`\`text
S   = Q @ K.T / sqrt(d)                   # (n, m), d = Q.shape[-1]
S   = S with -inf where j > i             # only if causal=True (then n == m)
P   = softmax(S, axis=-1)                 # each row sums to 1
Out = P @ V                               # (n, d_v)
\`\`\`

### Backward
Given \`dOut\` \`(n, d_v)\`, work back through each line:
\`\`\`text
dV = P.T @ dOut                           # (m, d_v)
dP = dOut @ V.T                           # (n, m)
dS = P * (dP - rowsum(dP * P))            # softmax Jacobian-vector product, row by row
dQ = dS @ K / sqrt(d)                     # (n, d)
dK = dS.T @ Q / sqrt(d)                   # (m, d)
\`\`\`
Masked positions have \`P = 0\`, so they get \`dS = 0\` automatically: the backward pass needs no special case for the mask.

### Inputs
- \`Q\`, \`K\`, \`V\` as above; \`dOut\`: \`(n, d_v)\`
- \`causal\`: bool; if True, query \`i\` may only attend to keys \`j <= i\` (requires \`n == m\`)

### Expected Return Format
- \`attention_forward(Q, K, V, causal=False)\`: \`Out\`, array \`(n, d_v)\`
- \`attention_backward(Q, K, V, dOut, causal=False)\`: tuple \`(dQ, dK, dV)\` with the shapes of \`Q\`, \`K\`, \`V\`

### Edge cases and conventions
- Use a numerically stable softmax (subtract the row max); the tests use scores of size about 100.
- Recompute \`P\` inside the backward pass (FlashAttention does the same instead of storing it).
- The hidden tests compare your gradients with **finite differences** of \`L = sum(Out * dOut)\`.

### Constraints
NumPy only, vectorised; no autograd.

### Follow-up
- FlashAttention's backward pass computes \`rowsum(dP * P)\` as \`rowsum(dOut * Out)\`. Why are they equal, and why is the second one cheaper?
- What is the memory cost of storing \`P\` for a 32k-token context with 32 heads in fp16?
`,
    examples: [
      {
        input: 'attention_forward(np.zeros((2, 4)), np.zeros((3, 4)), np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]))',
        output: '[[3.0, 4.0], [3.0, 4.0]]',
        explanation: 'All scores are equal, so P is uniform (1/3) and each output row is the mean of the rows of V.',
      },
      {
        input: 'attention_backward(np.zeros((2, 4)), np.zeros((3, 4)), np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.ones((2, 2)))[2]',
        output: '[[0.6667, 0.6667], [0.6667, 0.6667], [0.6667, 0.6667]]',
        explanation: 'dV = P.T @ dOut: each key gets weight 1/3 from each of the 2 queries.',
      },
    ],
    starterCode: `import numpy as np

def attention_forward(Q, K, V, causal=False):
    """
    Scaled dot-product attention.

    Args:
        Q: Queries (n, d)
        K: Keys (m, d)
        V: Values (m, d_v)
        causal: If True, query i may only attend to keys j <= i (n == m)

    Returns:
        Out: (n, d_v)
    """
    # Your code here
    pass

def attention_backward(Q, K, V, dOut, causal=False):
    """
    Gradients of attention with respect to Q, K and V.

    Args:
        Q, K, V: As in attention_forward
        dOut: Upstream gradient dL/dOut, shape (n, d_v)
        causal: Same flag as in the forward pass

    Returns:
        (dQ, dK, dV) with the shapes of Q, K, V
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Forward: uniform attention averages V',
        input: 'attention_forward(np.zeros((2, 4)), np.zeros((3, 4)), np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])).tolist()',
        expected: '[[3.0, 4.0], [3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'dV for uniform attention',
        input: 'np.round(attention_backward(np.zeros((2, 4)), np.zeros((3, 4)), np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.ones((2, 2)))[2], 4).tolist()',
        expected: '[[0.6667, 0.6667], [0.6667, 0.6667], [0.6667, 0.6667]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gradient shapes',
        input: 'tuple(g.shape for g in attention_backward(np.random.randn(3, 4), np.random.randn(5, 4), np.random.randn(5, 2), np.random.randn(3, 2)))',
        expected: '((3, 4), (5, 4), (5, 2))',
        hidden: false,
      },
      {
        id: '4',
        description: 'Finite differences (n != m)',
        input: `(lambda: (
    Q := np.random.randn(3, 4), K := np.random.randn(5, 4), V := np.random.randn(5, 2), G := np.random.randn(3, 2),
    f := lambda Q, K, V: float(np.sum((lambda E: E / E.sum(-1, keepdims=True))(np.exp((Q @ K.T / 2.0) - (Q @ K.T / 2.0).max(-1, keepdims=True))) @ V * G)),
    fd := lambda g, A: np.array([(g(A + E) - g(A - E)) / 2e-5 for E in [np.eye(A.size)[i].reshape(A.shape) * 1e-5 for i in range(A.size)]]).reshape(A.shape),
    grads := attention_backward(Q, K, V, G),
    bool(np.allclose(grads[0], fd(lambda A: f(A, K, V), Q), atol=1e-6)
         and np.allclose(grads[1], fd(lambda A: f(Q, A, V), K), atol=1e-6)
         and np.allclose(grads[2], fd(lambda A: f(Q, K, A), V), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Finite differences with a causal mask',
        input: `(lambda: (
    Q := np.random.randn(4, 4), K := np.random.randn(4, 4), V := np.random.randn(4, 3), G := np.random.randn(4, 3),
    M := np.triu(np.full((4, 4), -np.inf), 1),
    f := lambda Q, K, V: float(np.sum((lambda S: (lambda E: E / E.sum(-1, keepdims=True))(np.exp(S - S.max(-1, keepdims=True))))(Q @ K.T / 2.0 + M) @ V * G)),
    fd := lambda g, A: np.array([(g(A + E) - g(A - E)) / 2e-5 for E in [np.eye(A.size)[i].reshape(A.shape) * 1e-5 for i in range(A.size)]]).reshape(A.shape),
    grads := attention_backward(Q, K, V, G, causal=True),
    bool(np.allclose(grads[0], fd(lambda A: f(A, K, V), Q), atol=1e-6)
         and np.allclose(grads[1], fd(lambda A: f(Q, A, V), K), atol=1e-6)
         and np.allclose(grads[2], fd(lambda A: f(Q, K, A), V), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Causal: the first query only sees the first key',
        input: '(lambda: (Q := np.random.randn(4, 4), V := np.random.randn(4, 3), bool(np.allclose(attention_forward(Q, np.random.randn(4, 4), V, causal=True)[0], V[0])))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Causal: dK and dV of the last key come only from the last query',
        input: '(lambda: (Q := np.random.randn(4, 4), K := np.random.randn(4, 4), V := np.random.randn(4, 3), G := np.random.randn(4, 3), G2 := np.vstack([np.zeros((3, 3)), G[3:]]), a := attention_backward(Q, K, V, G, causal=True), b := attention_backward(Q, K, V, G2, causal=True), bool(np.allclose(a[1][3], b[1][3]) and np.allclose(a[2][3], b[2][3])))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Exact gradient values',
        input: '(lambda: (Q := np.random.randn(2, 4), K := np.random.randn(3, 4), V := np.random.randn(3, 2), G := np.random.randn(2, 2), [np.round(g, 4).tolist() for g in attention_backward(Q, K, V, G)])[-1])()',
        expected: '[[[0.0727, -0.0266, 0.0142, -0.101], [0.2869, -0.1133, 0.0177, -0.4224]], [[-0.3888, 0.1243, -0.2026, -0.111], [-0.0587, 0.0719, -0.0273, 0.0789], [0.4475, -0.1962, 0.23, 0.0321]], [[0.1512, 0.0272], [0.4298, 0.3335], [0.9976, 0.9215]]]',
        hidden: true,
      },
      {
        id: '9',
        description: 'Large scores stay finite (stable softmax)',
        input: 'bool(all(np.all(np.isfinite(g)) for g in attention_backward(np.random.randn(3, 4) * 100, np.random.randn(3, 4) * 100, np.random.randn(3, 2), np.random.randn(3, 2))))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Every gradient is written in terms of P, so share a helper that computes P (with the optional mask) between the forward and backward passes.',
      'Go backwards line by line: Out = P @ V gives dV and dP; P = softmax(S) gives dS; S = Q @ K.T / sqrt(d) gives dQ and dK.',
      'For one softmax row p, the Jacobian-vector product is p * (g - p . g). For all rows: P * (dP - (dP * P).sum(-1, keepdims=True)).',
      "Don't forget the 1/sqrt(d) factor in both dQ and dK. Shape check: dQ = (n, m) @ (m, d) and dK = (m, n) @ (n, d).",
    ],
    solution: `import numpy as np

def _probs(Q, K, causal):
    """Attention probabilities P (n, m), with the optional causal mask."""
    d = Q.shape[-1]
    S = Q @ K.T / np.sqrt(d)
    if causal:
        n, m = S.shape
        S = np.where(np.tril(np.ones((n, m), dtype=bool)), S, -np.inf)
    S = S - S.max(axis=-1, keepdims=True)          # stable softmax
    P = np.exp(S)
    return P / P.sum(axis=-1, keepdims=True)

def attention_forward(Q, K, V, causal=False):
    """Returns Out (n, d_v)."""
    return _probs(Q, K, causal) @ V

def attention_backward(Q, K, V, dOut, causal=False):
    """Returns (dQ, dK, dV) with the shapes of Q, K, V."""
    d = Q.shape[-1]
    P = _probs(Q, K, causal)                            # recompute instead of storing
    dV = P.T @ dOut                                     # (m, d_v)
    dP = dOut @ V.T                                     # (n, m)
    # Softmax backward, row by row: p * (g - p . g); masked entries have p = 0
    dS = P * (dP - (dP * P).sum(axis=-1, keepdims=True))
    dQ = dS @ K / np.sqrt(d)                            # (n, d)
    dK = dS.T @ Q / np.sqrt(d)                          # (m, d)
    return dQ, dK, dV

# Same O(n * m * d) cost as the forward pass
`,
  },
  {
    id: 'longest-match-tokenizer',
    title: 'Greedy Longest-Match Tokenizer',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Greedy Longest-Match Tokenizer

### What you'll build
A tokenizer that turns text into token ids with a fixed vocabulary using **greedy longest match** ("maximal munch"), plus a WordPiece mode that works the way BERT's tokenizer does.

### Background
Once a vocabulary exists (for example, learned by **BPE Tokenization**), you still need an encoding rule. The simplest rule is to take, at each position, the longest vocabulary entry that matches, emit its id and continue after it. WordPiece (BERT) applies this inside each word, marking pieces that continue a word with \`##\`. It's fast, but it's **not globally optimal**: with tokens \`{'ab', 'abc', 'cd', 'd'}\`, \`"abcd"\` becomes \`abc + d\`, even though \`ab + cd\` also covers it.

### Algorithm, default mode (\`wordpiece=False\`)
Scan \`text\` left to right; spaces are ordinary characters and can be tokens.
1. At position \`i\`, find the **longest** vocabulary token that is a prefix of \`text[i:]\`.
2. If one exists, emit its id and move past it.
3. Otherwise emit \`vocab[unk_token]\` for the single character \`text[i]\` and move on by one character. A run of unknown characters gives one unknown id **per character**.

### Algorithm, WordPiece mode (\`wordpiece=True\`)
1. Split \`text\` on whitespace (\`text.split()\`); whitespace never produces tokens.
2. Tokenize each word with greedy longest match. The first piece is looked up as-is; every **later piece is looked up with a \`##\` prefix** (\`"playing"\` becomes \`play\`, \`##ing\`).
3. If at some point no piece matches, the **whole word** becomes a single unknown id (BERT's behaviour), and the pieces already matched in that word are dropped.

### Inputs
- \`text\`: str (may be empty)
- \`vocab\`: dict token string -> int id; always contains \`unk_token\`
- \`unk_token\`: str, default \`'[UNK]'\`
- \`wordpiece\`: bool, default False

### Expected Return Format
A list of token ids (Python ints), in order. The empty string gives \`[]\`.

### Edge cases and conventions
- Default mode never drops characters: unknown characters become one \`[UNK]\` each.
- WordPiece mode drops whitespace and collapses an untokenizable word into a single \`[UNK]\`.

### Constraints
Plain Python. Bound the inner search by the longest token length, so each position costs \`O(max_token_len)\` lookups.

### Follow-up
- Which tokenization of \`"abcd"\` would a dynamic program that minimises the number of tokens choose? What does that cost?
- Why do LLM tokenizers work on bytes rather than characters (no \`[UNK]\` at all)?
`,
    examples: [
      {
        input: 'tokenize("abcab", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        output: '[4, 3]',
        explanation: '"abc" is the longest match at position 0, then "ab".',
      },
      {
        input: 'tokenize("abxc", same vocab)',
        output: '[3, 0, 5]',
        explanation: 'No token starts with "x", so it becomes [UNK] (id 0).',
      },
      {
        input: 'tokenize("unaffable plays", {\'[UNK]\': 0, \'un\': 1, \'##aff\': 2, \'##able\': 3, \'play\': 4, \'##ing\': 5, \'##s\': 6, \'u\': 7, \'##n\': 8, \'a\': 9, \'##a\': 10}, wordpiece=True)',
        output: '[1, 2, 3, 4, 6]',
        explanation: 'un, ##aff, ##able, then play, ##s.',
      },
    ],
    starterCode: `def tokenize(text, vocab, unk_token='[UNK]', wordpiece=False):
    """
    Greedy longest-match (maximal munch) tokenization.

    Args:
        text: Input string
        vocab: Dict mapping token string -> id (contains unk_token)
        unk_token: Token used for text that no vocabulary entry matches
        wordpiece: If True, split on whitespace and look up non-initial
                   pieces of a word with a '##' prefix

    Returns:
        List of token ids (one unk id per unknown character in default mode,
        one unk id per untokenizable word in WordPiece mode)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Longest match wins',
        input: 'tokenize("abcab", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[4, 3]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Unknown character falls back to [UNK]',
        input: 'tokenize("abxc", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[3, 0, 5]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Spaces are ordinary characters',
        input: 'tokenize("the cab", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[8, 7, 5, 3]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Greedy, not globally optimal',
        input: 'tokenize("abcd", {\'[UNK]\': 0, \'ab\': 1, \'abc\': 2, \'cd\': 3, \'d\': 4, \'a\': 5, \'b\': 6, \'c\': 7})',
        expected: '[2, 4]',
        hidden: true,
      },
      {
        id: '5',
        description: 'One [UNK] per unknown character',
        input: 'tokenize("xyz", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[0, 0, 0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Empty string',
        input: 'tokenize("", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Custom unknown token',
        input: 'tokenize("aXa", {\'<unk>\': 5, \'a\': 1}, unk_token=\'<unk>\')',
        expected: '[1, 5, 1]',
        hidden: true,
      },
      {
        id: '8',
        description: 'WordPiece with ## continuations',
        input: 'tokenize("unaffable playing plays", {\'[UNK]\': 0, \'un\': 1, \'##aff\': 2, \'##able\': 3, \'play\': 4, \'##ing\': 5, \'##s\': 6, \'u\': 7, \'##n\': 8, \'a\': 9, \'##a\': 10}, wordpiece=True)',
        expected: '[1, 2, 3, 4, 5, 4, 6]',
        hidden: true,
      },
      {
        id: '9',
        description: 'WordPiece: an unmatched word becomes a single [UNK]',
        input: 'tokenize("playx un aaa", {\'[UNK]\': 0, \'un\': 1, \'##aff\': 2, \'##able\': 3, \'play\': 4, \'##ing\': 5, \'##s\': 6, \'u\': 7, \'##n\': 8, \'a\': 9, \'##a\': 10}, wordpiece=True)',
        expected: '[0, 1, 9, 10, 10]',
        hidden: true,
      },
      {
        id: '10',
        description: 'WordPiece ignores extra whitespace',
        input: 'tokenize("  play   un  ", {\'[UNK]\': 0, \'un\': 1, \'##aff\': 2, \'##able\': 3, \'play\': 4, \'##ing\': 5, \'##s\': 6, \'u\': 7, \'##n\': 8, \'a\': 9, \'##a\': 10}, wordpiece=True)',
        expected: '[4, 1]',
        hidden: true,
      },
    ],
    hints: [
      'At each position you only need to try candidate lengths from the longest token length down to 1; the first hit is the longest match.',
      'Write the default mode as a while loop over a position i; WordPiece mode is the same loop run on each word of text.split(), with a different lookup key.',
      "Python's for ... else is handy: the else branch runs when the loop finished without break, i.e. nothing matched. In WordPiece mode the key is word[i:end] for the first piece and '##' + word[i:end] afterwards.",
      "Default mode: an unknown character costs one [UNK] and advances by 1. WordPiece mode: on failure, replace the whole word's pieces with a single [UNK] (don't keep the partial pieces).",
    ],
    solution: `def tokenize(text, vocab, unk_token='[UNK]', wordpiece=False):
    """
    Returns:
        List of token ids
    """
    unk_id = vocab[unk_token]
    ids = []

    if not wordpiece:
        max_len = max(len(token) for token in vocab)
        i = 0
        while i < len(text):
            # Try the longest candidate first; the first hit is the longest match
            for length in range(min(max_len, len(text) - i), 0, -1):
                piece = text[i:i + length]
                if piece in vocab:
                    ids.append(vocab[piece])
                    i += length
                    break
            else:
                ids.append(unk_id)  # no token starts here: one [UNK] per character
                i += 1
        return ids

    # WordPiece: split on whitespace, '##' marks pieces that continue a word
    for word in text.split():
        pieces = []
        i = 0
        while i < len(word):
            for end in range(len(word), i, -1):
                piece = word[i:end] if i == 0 else '##' + word[i:end]
                if piece in vocab:
                    pieces.append(vocab[piece])
                    i = end
                    break
            else:
                pieces = [unk_id]  # the whole word becomes one [UNK]
                break
        ids.extend(pieces)
    return ids

# Default mode: O(len(text) * max_token_len) dictionary lookups
`,
  },
];
