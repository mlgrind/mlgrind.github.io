import { Problem } from '../../types';

export const llmInternalsProblems: Problem[] = [
  {
    id: 'rmsnorm-swiglu',
    title: 'SwiGLU Feed-Forward Block (LLaMA MLP)',
    section: 'llm-internals',
    difficulty: 'medium',
    description: `
## SwiGLU Feed-Forward Block (LLaMA MLP)

### What you'll build
The MLP half of a LLaMA decoder block: RMSNorm, a SwiGLU gated feed-forward network, and the residual connection around them. Three functions: \`rms_norm\`, \`swiglu_ffn\` and \`llama_mlp_block\`.

### Background
The original Transformer MLP is \`ReLU(x W_1) W_2\`. LLaMA, Mistral, Qwen and PaLM use a **gated** MLP instead, SwiGLU (Shazeer, 2020): one projection goes through SiLU and **gates** a second, linear projection elementwise. At equal parameter count it gives lower loss. LLaMA also replaces LayerNorm with **RMSNorm**, which skips the mean subtraction and the bias: cheaper, and empirically just as good. About two thirds of a dense LLM's parameters live in these MLPs.

### Formula
\`\`\`text
rms_norm(x)  = x / sqrt(mean(x^2, axis=-1) + eps) * weight

silu(z)      = z * sigmoid(z) = z / (1 + exp(-z))
gate         = silu(x @ W_gate)                  # (..., d_ff)
up           = x @ W_up                          # (..., d_ff)
swiglu_ffn(x) = (gate * up) @ W_down             # (..., d_model)

llama_mlp_block(x) = x + swiglu_ffn(rms_norm(x))
\`\`\`
No biases anywhere (LLaMA uses none). With three weight matrices instead of two, LLaMA sets \`d_ff ≈ (2/3) · 4 · d_model\` to match the parameter count of a \`4 · d_model\` ReLU MLP.

### Inputs
- \`x\`: float array \`(..., d_model)\` (any number of leading axes, e.g. \`(batch, seq_len, d_model)\`)
- \`weight\` / \`norm_weight\`: \`(d_model,)\`
- \`W_gate\`, \`W_up\`: \`(d_model, d_ff)\`; \`W_down\`: \`(d_ff, d_model)\`
- \`eps\`: float, default \`1e-6\`

### Expected Return Format
- \`rms_norm(x, weight, eps=1e-6)\`: same shape as \`x\`
- \`swiglu_ffn(x, W_gate, W_up, W_down)\`: shape \`(..., d_model)\`
- \`llama_mlp_block(x, norm_weight, W_gate, W_up, W_down, eps=1e-6)\`: same shape as \`x\`

### Edge cases and conventions
- RMSNorm normalizes over the last axis only; \`eps\` goes inside the square root.
- The residual adds the **un-normalized** \`x\` (pre-norm): \`x + ffn(norm(x))\`, not \`norm(x) + ffn(norm(x))\`.
- The gate is SiLU, not sigmoid (that would be GLU) and not ReLU (ReGLU).

### Constraints
NumPy only, vectorised.

### Follow-up
- Count the parameters of the SwiGLU MLP and of a ReLU MLP with \`d_ff = 4 d_model\`. What \`d_ff\` makes them equal?
- Write the attention half of the LLaMA block (RMSNorm, RoPE, GQA, causal mask). Which earlier problems give you each piece?
`,
    examples: [
      {
        input: 'rms_norm(np.array([[3.0, 4.0]]), np.ones(2))',
        output: '[[0.8485, 1.1314]]',
        explanation: 'mean(x^2) = 12.5, so the RMS is 3.5355 and x / 3.5355 = [0.8485, 1.1314]. The mean is not subtracted.',
      },
      {
        input: 'swiglu_ffn(np.array([[1.0, -1.0]]), np.array([[1.0], [0.0]]), np.array([[2.0], [1.0]]), np.array([[1.0, 0.5]]))',
        output: '[[0.7311, 0.3655]]',
        explanation: 'gate = silu(1) = 0.7311, up = 2 - 1 = 1, then (0.7311 * 1) @ [[1, 0.5]].',
      },
    ],
    starterCode: `import numpy as np

def rms_norm(x, weight, eps=1e-6):
    """
    RMSNorm over the last axis: x / sqrt(mean(x**2) + eps) * weight.

    Args:
        x: (..., d_model)
        weight: (d_model,) learned scale

    Returns:
        Array with the same shape as x
    """
    # Your code here
    pass


def swiglu_ffn(x, W_gate, W_up, W_down):
    """
    SwiGLU feed-forward network: (silu(x @ W_gate) * (x @ W_up)) @ W_down

    Args:
        x: (..., d_model)
        W_gate, W_up: (d_model, d_ff)
        W_down: (d_ff, d_model)

    Returns:
        Array of shape (..., d_model)
    """
    # Your code here
    pass


def llama_mlp_block(x, norm_weight, W_gate, W_up, W_down, eps=1e-6):
    """
    Pre-norm MLP sub-block with a residual: x + swiglu_ffn(rms_norm(x)).

    Returns:
        Array with the same shape as x
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'rms_norm values',
        input: 'np.round(rms_norm(np.array([[3.0, 4.0]]), np.ones(2)), 4).tolist()',
        expected: '[[0.8485, 1.1314]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Block output shape',
        input: 'llama_mlp_block(np.random.randn(4, 8), np.ones(8), np.random.randn(8, 16), np.random.randn(8, 16), np.random.randn(16, 8)).shape',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '3',
        description: 'SwiGLU on a hand-checkable input',
        input: 'np.round(swiglu_ffn(np.array([[1.0, -1.0]]), np.array([[1.0], [0.0]]), np.array([[2.0], [1.0]]), np.array([[1.0, 0.5]])), 4).tolist()',
        expected: '[[0.7311, 0.3655]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'RMSNorm does not subtract the mean',
        input: 'np.round(rms_norm(np.array([[2.0, 2.0, 2.0]]), np.array([1.0, 2.0, 3.0])), 4).tolist()',
        expected: '[[1.0, 2.0, 3.0]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'SwiGLU matches a reference on a 3-D input',
        input: '(lambda x, Wg, Wu, Wd: bool(np.allclose(swiglu_ffn(x, Wg, Wu, Wd), ((x @ Wg) * (1 / (1 + np.exp(-(x @ Wg)))) * (x @ Wu)) @ Wd)))(np.random.randn(2, 3, 8), np.random.randn(8, 12), np.random.randn(8, 12), np.random.randn(12, 8))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gate is SiLU, not sigmoid or ReLU',
        input: 'round(float(swiglu_ffn(np.array([[-1.0]]), np.array([[1.0]]), np.array([[1.0]]), np.array([[1.0]]))[0, 0]), 4)',
        expected: '0.2689',
        hidden: true,
      },
      {
        id: '7',
        description: 'Block has a residual connection (W_down = 0 gives x back)',
        input: '(lambda x: bool(np.allclose(llama_mlp_block(x, np.ones(8), np.random.randn(8, 16), np.random.randn(8, 16), np.zeros((16, 8))), x)))(np.random.randn(3, 8))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Block output values',
        input: 'round(float(llama_mlp_block(np.random.randn(4, 8), np.linspace(0.5, 1.5, 8), np.random.randn(8, 16) * 0.3, np.random.randn(8, 16) * 0.3, np.random.randn(16, 8) * 0.3).sum()), 4)',
        expected: '13.7389',
        hidden: true,
      },
    ],
    hints: [
      'Three small pieces that compose: a normalizer, a gated MLP, and a residual add. Write and test each one separately.',
      'RMSNorm divides by the root-mean-square of the last axis (no mean subtraction, no bias); SwiGLU multiplies silu(x @ W_gate) by x @ W_up elementwise before projecting down.',
      'rms = np.sqrt(np.mean(x**2, axis=-1, keepdims=True) + eps); silu(z) = z / (1 + np.exp(-z)); block = x + swiglu_ffn(rms_norm(x, norm_weight, eps), ...).',
      'Add the residual to the original x, not to the normalized x, and keep keepdims=True so the RMS broadcasts over any leading axes.',
    ],
    solution: `import numpy as np

def rms_norm(x, weight, eps=1e-6):
    """Returns an array with the same shape as x."""
    rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)   # (..., 1)
    return x / rms * weight


def silu(z):
    return z / (1.0 + np.exp(-z))           # z * sigmoid(z)


def swiglu_ffn(x, W_gate, W_up, W_down):
    """Returns an array of shape (..., d_model)."""
    gate = silu(x @ W_gate)   # (..., d_ff)
    up = x @ W_up             # (..., d_ff)
    return (gate * up) @ W_down


def llama_mlp_block(x, norm_weight, W_gate, W_up, W_down, eps=1e-6):
    """Returns an array with the same shape as x."""
    # Pre-norm: normalize the branch input, add the result to the raw x
    return x + swiglu_ffn(rms_norm(x, norm_weight, eps), W_gate, W_up, W_down)

# O(N * d_model * d_ff) for N tokens, dominated by the three matmuls
`,
  },
  {
    id: 'online-softmax',
    title: 'Online Softmax (the FlashAttention Trick)',
    section: 'llm-internals',
    difficulty: 'hard',
    description: `
## Online Softmax: the trick behind FlashAttention

### What you'll build
Two functions that compute a softmax **in one streaming pass over blocks**: \`online_softmax\` for a 1-D vector, and \`online_attention\`, which computes exact attention block by block over the keys without ever forming the full score matrix.

### Background
Standard attention materializes the \`(n_q, n_k)\` score matrix, then takes a row softmax. For long sequences that matrix doesn't fit in fast on-chip memory (SRAM), and moving it to and from slow memory (HBM) dominates the runtime. **FlashAttention** (Dao et al., 2022) walks over the keys in blocks and keeps three running statistics per query. It is **exact**, not an approximation; it saves memory traffic, not FLOPs. The enabling idea is the **online softmax** (Milakov & Gimelshein, 2018): when the running max increases, rescale everything accumulated so far by \`exp(m_old - m_new)\`.

### Formula: \`online_softmax(x, block_size)\`
Start with a running max \`m = -inf\` and running sum \`l = 0\`. For each block \`b\` of \`x\` (the last block may be shorter):
\`\`\`text
m_new = max(m, max(b))
l     = l * exp(m - m_new) + sum(exp(b - m_new))     # rescale the old sum to the new max
m     = m_new
\`\`\`
After the pass: \`softmax(x) = exp(x - m) / l\`.

### Formula: \`online_attention(Q, K, V, block_size)\`
Keep per query row a running max \`m\` \`(n_q, 1)\`, a running denominator \`l\` \`(n_q, 1)\` and an unnormalized output \`acc\` \`(n_q, d_v)\`. For each block \`(K_b, V_b)\` of \`block_size\` keys:
\`\`\`text
S     = Q @ K_b.T / sqrt(d)                # (n_q, B)
m_new = maximum(m, rowmax(S))              # (n_q, 1)
scale = exp(m - m_new)                     # shrink the old statistics
P     = exp(S - m_new)                     # (n_q, B)
l     = l * scale + rowsum(P)
acc   = acc * scale + P @ V_b              # (n_q, d_v)
m     = m_new
\`\`\`
At the end, \`output = acc / l\`, which equals \`softmax(Q K^T / sqrt(d)) @ V\` up to float rounding.

### Inputs
- \`x\`: 1-D float array; \`block_size\`: positive int
- \`Q\` \`(n_q, d)\`, \`K\` \`(n_k, d)\`, \`V\` \`(n_k, d_v)\`; \`block_size\` keys per block

### Expected Return Format
- \`online_softmax(x, block_size)\`: 1-D array, same shape as \`x\`, sums to 1
- \`online_attention(Q, K, V, block_size)\`: array \`(n_q, d_v)\`

### Edge cases and conventions
- \`exp(-inf - m_new) = 0\`, so the first block needs no special case.
- Any \`block_size\` (1, a divisor of \`n_k\`, or larger than \`n_k\`) must give the same answer.
- Logits around 1000 must not overflow.

### Constraints
NumPy only. Process the keys block by block; don't take a softmax over a whole row of scores at once.

### Follow-up
- What is the memory footprint of the score matrix for \`n = 32k\` tokens and 32 heads in fp16? What does FlashAttention store instead?
- FlashAttention-2 delays the division by \`l\` to the very end and parallelises over query blocks. Why does that help?
`,
    examples: [
      {
        input: 'online_softmax(np.array([1000.0, 1001.0, 1002.0]), block_size=2)',
        output: '[0.09, 0.2447, 0.6652]',
        explanation: 'Every exp is taken relative to the running max, so huge logits are fine.',
      },
      {
        input: 'online_softmax(np.array([0.0, 1.0, 5.0, 2.0, 9.0]), block_size=2)',
        output: '[0.0001, 0.0003, 0.018, 0.0009, 0.9807]',
        explanation: 'The max changes from 1 to 5 to 9; each time, the running sum is rescaled by exp(m_old - m_new).',
      },
    ],
    starterCode: `import numpy as np

def online_softmax(x, block_size):
    """
    Softmax of a 1-D array computed with one streaming pass over blocks
    (running max + running sum), then one normalization pass.

    Returns:
        probs: same shape as x, sums to 1
    """
    # Your code here
    pass


def online_attention(Q, K, V, block_size):
    """
    Attention softmax(Q K^T / sqrt(d)) V computed block by block over the keys,
    FlashAttention style.

    Args:
        Q: (n_q, d), K: (n_k, d), V: (n_k, d_v)
        block_size: number of keys per block

    Returns:
        output: (n_q, d_v)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'online_softmax matches the exact softmax',
        input: '(lambda x: bool(np.allclose(online_softmax(x, 3), np.exp(x - x.max()) / np.exp(x - x.max()).sum())))(np.random.randn(10))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Max in a later block (old sum must be rescaled)',
        input: 'np.round(online_softmax(np.array([0.0, 1.0, 5.0, 2.0, 9.0]), 2), 4).tolist()',
        expected: '[0.0001, 0.0003, 0.018, 0.0009, 0.9807]',
        hidden: false,
      },
      {
        id: '3',
        description: 'online_attention matches standard attention',
        input: '(lambda Q, K, V: (lambda S: bool(np.allclose(online_attention(Q, K, V, 4), (np.exp(S - S.max(1, keepdims=True)) / np.exp(S - S.max(1, keepdims=True)).sum(1, keepdims=True)) @ V)))(Q @ K.T / 2.0))(np.random.randn(3, 4), np.random.randn(10, 4), np.random.randn(10, 2))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Stable for huge logits',
        input: 'np.round(online_softmax(np.array([1000.0, 1001.0, 1002.0]), 2), 4).tolist()',
        expected: '[0.09, 0.2447, 0.6652]',
        hidden: true,
      },
      {
        id: '5',
        description: 'online_attention output shape',
        input: 'online_attention(np.random.randn(3, 4), np.random.randn(10, 4), np.random.randn(10, 2), 4).shape',
        expected: '(3, 2)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Any block size gives the same answer',
        input: '(lambda Q, K, V: bool(all(np.allclose(online_attention(Q, K, V, b), online_attention(Q, K, V, 7)) for b in [1, 2, 3, 7, 50])))(np.random.randn(2, 4), np.random.randn(7, 4), np.random.randn(7, 3))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Attention output values',
        input: 'round(float(online_attention(np.random.randn(4, 8) * 3, np.random.randn(9, 8) * 3, np.random.randn(9, 5), 4).sum()), 4)',
        expected: '2.4803',
        hidden: true,
      },
    ],
    hints: [
      'If you knew the global max in advance, softmax would be one pass. What do you have to fix up when a later block reveals a bigger max?',
      'Every term already summed into l was computed as exp(x - m_old). Multiplying l by exp(m_old - m_new) turns all of them into exp(x - m_new) at once; acc needs the same factor.',
      'Start with m = -inf and l = 0 (np.full((n_q, 1), -np.inf) and np.zeros((n_q, 1)) for attention); loop over range(0, n_k, block_size); S.max(axis=1, keepdims=True); np.maximum(m, ...).',
      'Rescale acc and l by the same scale before adding the new block, and divide by l only once at the end. Keep m and l as (n_q, 1) columns so they broadcast.',
    ],
    solution: `import numpy as np

def online_softmax(x, block_size):
    """Returns softmax(x), same shape as x."""
    m, l = -np.inf, 0.0
    for start in range(0, len(x), block_size):
        block = x[start:start + block_size]
        m_new = max(m, block.max())
        # Rescale the old sum to the new max, then add this block
        l = l * np.exp(m - m_new) + np.exp(block - m_new).sum()
        m = m_new
    return np.exp(x - m) / l


def online_attention(Q, K, V, block_size):
    """Returns output (n_q, d_v) equal to softmax(Q K^T / sqrt(d)) V."""
    n_q, d = Q.shape
    m = np.full((n_q, 1), -np.inf)     # running row max
    l = np.zeros((n_q, 1))             # running softmax denominator
    acc = np.zeros((n_q, V.shape[1]))  # running unnormalized output
    for start in range(0, K.shape[0], block_size):
        K_b = K[start:start + block_size]
        V_b = V[start:start + block_size]
        S = Q @ K_b.T / np.sqrt(d)                      # (n_q, B): only one block of scores
        m_new = np.maximum(m, S.max(axis=1, keepdims=True))
        scale = np.exp(m - m_new)                       # 0 on the first block
        P = np.exp(S - m_new)
        l = l * scale + P.sum(axis=1, keepdims=True)
        acc = acc * scale + P @ V_b
        m = m_new
    return acc / l

# Same O(n_q * n_k * d) FLOPs as standard attention; extra memory O(n_q * (block_size + d_v))
`,
  },
  {
    id: 'moe-routing',
    title: 'Mixture-of-Experts Routing',
    section: 'llm-internals',
    difficulty: 'hard',
    description: `
## Mixture-of-Experts (MoE) Routing

### What you'll build
A top-k mixture-of-experts layer: a router picks \`k\` experts per token, each expert runs only on the tokens routed to it, the outputs are combined with the gate weights, and a load-balancing auxiliary loss is returned.

### Background
MoE layers (Switch Transformer, Mixtral, DeepSeek-MoE) replace one big FFN with \`E\` smaller **experts** and a **router**. Parameters grow with \`E\`, but compute per token grows only with \`k\`: Mixtral 8x7B has about 47B parameters but uses about 13B per token. The cost is engineering: tokens must be dispatched to experts and gathered back, and the router must be kept from collapsing onto a few experts. Here each expert is a linear map \`expert_e(x) = x @ expert_weights[e]\` (real experts are SwiGLU FFNs; the routing is identical).

### Algorithm
With \`T\` tokens and \`E\` experts:
1. **Router**: \`logits = x @ W_router\` \`(T, E)\`; \`probs = softmax(logits, axis=-1)\` (used by the aux loss).
2. **Top-k gating (Mixtral style)**: \`expert_indices\` = the \`k\` experts with the largest logits per token, **sorted by descending logit**; \`gates = softmax(top-k logits)\`, renormalized over the chosen \`k\` only.
3. **Dispatch and combine**: for each expert \`e\`, gather the tokens routed to it, run the expert **only on those tokens**, and add the outputs back weighted by their gate:
\`\`\`text
y_t = sum_{j=1..k} gates[t, j] * expert_{expert_indices[t, j]}(x_t)
\`\`\`
4. **Load-balancing loss (Switch Transformer)**:
\`\`\`text
f_e      = (number of tokens whose top-k includes e) / (T * k)    # fraction of routing slots
P_e      = mean over tokens of probs[:, e]                        # mean router probability
aux_loss = E * sum_e f_e * P_e
\`\`\`
It is 1.0 for perfectly uniform routing and approaches \`E\` when everything collapses onto one expert. In training it is added to the LM loss times a small coefficient (e.g. 0.01); \`f\` is not differentiable, so the gradient flows through \`P\`.

### Inputs
- \`x\`: \`(T, d)\`
- \`W_router\`: \`(d, E)\`
- \`expert_weights\`: \`(E, d, d_out)\`
- \`top_k\`: int, \`1 <= top_k <= E\`

### Expected Return Format
A dictionary with these keys:
- \`'output'\`: combined expert outputs, \`(T, d_out)\`
- \`'expert_indices'\`: integer array \`(T, k)\`, sorted by descending router logit
- \`'gates'\`: \`(T, k)\`, each row sums to 1, aligned with \`'expert_indices'\`
- \`'aux_loss'\`: the load-balancing loss as a Python float

### Edge cases and conventions
- \`top_k = 1\` (Switch): the gate is 1 and the output is the chosen expert's output.
- Tests use random logits, so ties between experts don't occur; a stable sort of \`-logits\` is a safe choice.

### Constraints
NumPy only. Don't run every expert on every token and mask afterwards: run each expert on its routed tokens.

### Follow-up
- Real systems give each expert a **capacity** (\`capacity_factor · T · k / E\` slots) and drop overflow tokens. How would you implement that, and what happens to dropped tokens?
- Why does expert parallelism need an all-to-all communication step?
`,
    examples: [
      {
        input: 'x (6, 4), W_router (4, 4), expert_weights (4, 4, 3), top_k=2',
        output: "{'output': shape (6, 3), 'expert_indices': shape (6, 2), 'gates': shape (6, 2), 'aux_loss': float}",
        explanation: 'Each token is processed by its 2 highest-scoring experts and gets a weighted sum of their outputs.',
      },
      {
        input: 'W_router = np.zeros((4, 4)), any x, top_k=2',
        output: "aux_loss = 1.0",
        explanation: 'Uniform router probabilities: P_e = 1/4 for every expert and the f_e sum to 1, so 4 * sum(f_e / 4) = 1.',
      },
      {
        input: 'x = np.ones((6, 4)), router strongly prefers expert 0, top_k=1, E=4',
        output: 'aux_loss = 4.0',
        explanation: 'Collapse: f_0 = 1 and P_0 is about 1, so the loss reaches E.',
      },
    ],
    starterCode: `import numpy as np

def moe_layer(x, W_router, expert_weights, top_k):
    """
    Top-k mixture-of-experts layer with a load-balancing loss.

    Args:
        x: (T, d) token representations
        W_router: (d, E) router weights
        expert_weights: (E, d, d_out); expert e computes x @ expert_weights[e]
        top_k: experts per token

    Returns:
        dict with 'output' (T, d_out), 'expert_indices' (T, k) sorted by
        descending logit, 'gates' (T, k) rows summing to 1, and
        'aux_loss' (float) = E * sum_e f_e * P_e
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Shapes, and gates sum to 1',
        input: '(lambda r: (r[\'output\'].shape, r[\'expert_indices\'].shape, bool(np.allclose(r[\'gates\'].sum(-1), 1))))(moe_layer(np.random.randn(6, 4), np.random.randn(4, 4), np.random.randn(4, 4, 3), 2))',
        expected: '((6, 3), (6, 2), True)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Uniform router gives aux_loss = 1',
        input: 'round(moe_layer(np.random.randn(6, 4), np.zeros((4, 4)), np.random.randn(4, 4, 4), 2)[\'aux_loss\'], 4)',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Output equals the dense per-token reference',
        input: '(lambda x, Wr, We: (lambda r: bool(np.allclose(r[\'output\'], np.stack([sum(r[\'gates\'][t, j] * (x[t] @ We[r[\'expert_indices\'][t, j]]) for j in range(2)) for t in range(6)]))))(moe_layer(x, Wr, We, 2)))(np.random.randn(6, 4), np.random.randn(4, 4), np.random.randn(4, 4, 3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Experts are chosen by descending router logit',
        input: 'moe_layer(np.random.randn(5, 4), np.random.randn(4, 6), np.random.randn(6, 4, 2), 3)[\'expert_indices\'].tolist()',
        expected: '[[5, 4, 2], [4, 2, 1], [5, 0, 1], [4, 2, 5], [4, 2, 1]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gates are a softmax over the top-k logits only',
        input: '(lambda x, Wr: (lambda r, L: bool(np.allclose(r[\'gates\'][:, 0], 1 / (1 + np.exp(np.take_along_axis(L, r[\'expert_indices\'], -1)[:, 1] - np.take_along_axis(L, r[\'expert_indices\'], -1)[:, 0])))))(moe_layer(x, Wr, np.random.randn(5, 4, 4), 2), x @ Wr))(np.random.randn(7, 4), np.random.randn(4, 5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Collapsed routing pushes aux_loss toward E',
        input: 'round(moe_layer(np.ones((6, 4)), np.hstack([np.full((4, 1), 10.0), np.zeros((4, 3))]), np.random.randn(4, 4, 4), 1)[\'aux_loss\'], 4)',
        expected: '4.0',
        hidden: true,
      },
      {
        id: '7',
        description: 'top_k = 1: gate is 1 and output is the chosen expert',
        input: '(lambda x, Wr, We: (lambda r: bool(np.allclose(r[\'gates\'], 1) and np.allclose(r[\'output\'], np.einsum(\'td,tdo->to\', x, We[np.argmax(x @ Wr, axis=1)]))))(moe_layer(x, Wr, We, 1)))(np.random.randn(8, 4), np.random.randn(4, 3), np.random.randn(3, 4, 2))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'aux_loss value',
        input: 'round(moe_layer(np.random.randn(10, 4), np.random.randn(4, 4), np.random.randn(4, 4, 4), 2)[\'aux_loss\'], 4)',
        expected: '1.3995',
        hidden: true,
      },
    ],
    hints: [
      'Split the layer into four steps: router probabilities, top-k selection with renormalized gates, per-expert dispatch/combine, and the aux loss from routing counts and mean probabilities.',
      'Top-k: sort each row of logits in descending order and take the first k columns; gates are a softmax of just those k logits. Dispatch: for each expert, find the (token, slot) pairs that chose it.',
      'np.argsort(-logits, axis=-1, kind="stable")[:, :k]; np.take_along_axis for the chosen logits; token_ids, slot = np.nonzero(expert_indices == e); output[token_ids] += gates[token_ids, slot][:, None] * (x[token_ids] @ expert_weights[e]).',
      'f uses routing counts (np.bincount(expert_indices.ravel(), minlength=E) / (T * k)) and P uses the full softmax over all E experts, not the renormalized gates. Return aux_loss as a Python float.',
    ],
    solution: `import numpy as np

def softmax(z, axis=-1):
    e = np.exp(z - z.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


def moe_layer(x, W_router, expert_weights, top_k):
    """
    Returns:
        dict with 'output', 'expert_indices', 'gates', 'aux_loss'
    """
    T = x.shape[0]
    E = W_router.shape[1]

    # 1. Router
    logits = x @ W_router                       # (T, E)
    probs = softmax(logits)                     # full distribution, for the aux loss

    # 2. Top-k experts per token (descending logit), renormalized gates
    expert_indices = np.argsort(-logits, axis=-1, kind='stable')[:, :top_k]   # (T, k)
    gates = softmax(np.take_along_axis(logits, expert_indices, axis=-1))       # (T, k)

    # 3. Dispatch tokens to experts and combine
    output = np.zeros((T, expert_weights.shape[2]))
    for e in range(E):
        token_ids, slot = np.nonzero(expert_indices == e)   # tokens routed to e
        if len(token_ids) == 0:
            continue
        expert_out = x[token_ids] @ expert_weights[e]      # run e on its tokens only
        output[token_ids] += gates[token_ids, slot][:, None] * expert_out

    # 4. Load-balancing loss (Switch Transformer)
    f = np.bincount(expert_indices.ravel(), minlength=E) / (T * top_k)
    P = probs.mean(axis=0)
    aux_loss = E * np.sum(f * P)

    return {
        'output': output,
        'expert_indices': expert_indices,
        'gates': gates,
        'aux_loss': float(aux_loss),
    }

# Expert compute O(T * k * d * d_out) instead of O(T * E * d * d_out) for a dense mixture
`,
  },
  {
    id: 'perplexity',
    title: 'Token Cross-Entropy and Perplexity',
    section: 'llm-internals',
    difficulty: 'easy',
    description: `
## Token Cross-Entropy and Perplexity

### What you'll build
The language-modeling loss and its standard evaluation metric: per-token negative log-likelihood from logits and targets, with a padding mask, averaged into a mean NLL and exponentiated into perplexity.

### Background
Every LLM is pretrained by minimizing next-token cross-entropy, and **perplexity** is how papers report it: "the effective number of tokens the model is choosing between". A model that is uniform over \`V\` tokens has perplexity exactly \`V\`; a perfect model has perplexity 1. Batches are padded to a common length, so padded positions must be excluded, or the reported loss depends on how much padding the batch happened to have.

### Formula
\`\`\`text
log_probs  = log_softmax(logits, axis=-1)          # z - max - log(sum(exp(z - max)))
token_nll  = -log_probs[..., target]               # one value per position
mean_nll   = sum(token_nll * mask) / sum(mask)     # nats per real token
perplexity = exp(mean_nll)
\`\`\`

### Inputs
- \`logits\`: float array \`(..., V)\`, e.g. \`(T, V)\` or \`(B, T, V)\`
- \`targets\`: integer array \`(...)\` of token ids in \`[0, V)\`; \`targets[b, t]\` is the token that follows position \`t\` (already shifted)
- \`mask\`: array \`(...)\` with 1 for real tokens and 0 for padding, or None (every position counts)

### Expected Return Format
A dictionary with these keys:
- \`'token_nll'\`: per-position NLL, same shape as \`targets\`, **0 where masked**
- \`'mean_nll'\`: mean NLL over unmasked positions (Python float, in nats)
- \`'perplexity'\`: \`exp(mean_nll)\` (Python float)

### Edge cases and conventions
- Use a stable log-softmax: logits around 1000 must not overflow.
- Divide by the number of **real** tokens (\`mask.sum()\`), not by the number of positions.
- Natural log (nats). Bits per token would be \`mean_nll / ln 2\`.

### Constraints
NumPy only, vectorised (\`np.take_along_axis\` for the target gather).

### Follow-up
- Why is perplexity only comparable between models that share a tokenizer? How does bits-per-byte fix that?
- Training code often averages per sequence first, then over the batch. When does that differ from the per-token mean here?
`,
    examples: [
      {
        input: 'perplexity(np.zeros((3, 5)), np.array([0, 1, 2]))',
        output: "{'token_nll': [1.6094, 1.6094, 1.6094], 'mean_nll': 1.6094, 'perplexity': 5.0}",
        explanation: 'Uniform predictions over 5 tokens: NLL = log 5 at every position.',
      },
      {
        input: 'perplexity(np.array([[2.0, 1.0, 0.0], [0.0, 0.0, 3.0]]), np.array([0, 2]))',
        output: "token_nll = [0.4076, 0.0949]",
        explanation: '-log softmax at the target index: the model is confident and right at both positions.',
      },
    ],
    starterCode: `import numpy as np

def perplexity(logits, targets, mask=None):
    """
    Next-token cross-entropy and perplexity.

    Args:
        logits: (..., V)
        targets: (...) integer token ids
        mask: (...) 1 for real tokens, 0 for padding (None = all real)

    Returns:
        dict with 'token_nll' (same shape as targets, 0 where masked),
        'mean_nll' (float, nats) and 'perplexity' (float, exp(mean_nll))
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Uniform logits give perplexity = vocab size',
        input: 'round(perplexity(np.zeros((3, 5)), np.array([0, 1, 2]))[\'perplexity\'], 4)',
        expected: '5.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Per-token NLL values',
        input: 'np.round(perplexity(np.array([[2.0, 1.0, 0.0], [0.0, 0.0, 3.0]]), np.array([0, 2]))[\'token_nll\'], 4).tolist()',
        expected: '[0.4076, 0.0949]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Padding is excluded from the mean',
        input: '(lambda L, y: bool(np.isclose(perplexity(L, y, np.array([[1, 1, 1], [1, 1, 0]]))[\'mean_nll\'], perplexity(np.concatenate([L[0], L[1, :2]]), np.concatenate([y[0], y[1, :2]]))[\'mean_nll\'])))(np.random.randn(2, 3, 4), np.array([[0, 3, 1], [2, 2, 0]]))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Masked positions have token_nll = 0',
        input: 'np.round(perplexity(np.array([[[1.0, 0.0], [0.0, 1.0]]]), np.array([[0, 0]]), np.array([[1, 0]]))[\'token_nll\'], 4).tolist()',
        expected: '[[0.3133, 0.0]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Stable for huge logits',
        input: 'round(perplexity(np.array([[1000.0, 999.0, 0.0]]), np.array([1]))[\'mean_nll\'], 4)',
        expected: '1.3133',
        hidden: true,
      },
      {
        id: '6',
        description: 'perplexity = exp(mean_nll), values',
        input: '(lambda r: (round(r[\'mean_nll\'], 4), round(r[\'perplexity\'], 4)))(perplexity(np.random.randn(2, 5, 6) * 2, np.random.randint(0, 6, size=(2, 5))))',
        expected: '(3.8495, 46.9708)',
        hidden: true,
      },
    ],
    hints: [
      'Perplexity is just exp of the average per-token loss. The work is computing a stable per-token loss and averaging over the right positions.',
      'Stable log-softmax over the last axis, pick the log-prob of each target, negate, mask, then average over real tokens only.',
      'log_probs = z - m - np.log(np.exp(z - m).sum(-1, keepdims=True)); token_nll = -np.take_along_axis(log_probs, targets[..., None], axis=-1)[..., 0].',
      'Divide by mask.sum(), not token_nll.size, and set masked positions to 0 before summing. Return Python floats for the scalars.',
    ],
    solution: `import numpy as np

def perplexity(logits, targets, mask=None):
    """
    Returns:
        dict with 'token_nll', 'mean_nll', 'perplexity'
    """
    logits = np.asarray(logits, dtype=np.float64)
    targets = np.asarray(targets)

    # Stable log-softmax over the vocabulary
    m = logits.max(axis=-1, keepdims=True)
    log_probs = logits - m - np.log(np.exp(logits - m).sum(axis=-1, keepdims=True))

    # Log-prob of the correct next token at every position
    token_nll = -np.take_along_axis(log_probs, targets[..., None], axis=-1)[..., 0]

    if mask is None:
        mask = np.ones_like(token_nll)
    mask = np.asarray(mask, dtype=np.float64)
    token_nll = token_nll * mask                 # padding contributes 0

    mean_nll = token_nll.sum() / mask.sum()      # average over real tokens only
    return {
        'token_nll': token_nll,
        'mean_nll': float(mean_nll),
        'perplexity': float(np.exp(mean_nll)),
    }

# O(N * V) for N positions
`,
  },
];
