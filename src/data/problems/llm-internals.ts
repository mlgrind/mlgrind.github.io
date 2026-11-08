import { Problem } from '../../types';

export const llmInternalsProblems: Problem[] = [
  {
    id: 'rmsnorm-swiglu',
    title: 'SwiGLU Feed-Forward Block (LLaMA MLP)',
    section: 'llm-internals',
    difficulty: 'medium',
    description: `
## SwiGLU Feed-Forward Block (LLaMA MLP)

The original Transformer MLP is \`ReLU(x W_1) W_2\`. LLaMA, Mistral, Qwen and PaLM replace it with a **gated** MLP, **SwiGLU** (Shazeer, 2020, "GLU Variants Improve Transformer"): one projection is passed through SiLU and used as a *gate* that multiplies a second, linear projection elementwise.

### SiLU (a.k.a. Swish with beta = 1)
\`\`\`
silu(z) = z * sigmoid(z) = z / (1 + exp(-z))
\`\`\`

### SwiGLU FFN
\`\`\`
gate   = silu(x @ W_gate)          # (..., d_ff)
up     = x @ W_up                  # (..., d_ff)
ffn(x) = (gate * up) @ W_down      # (..., d_model)
\`\`\`
No biases (LLaMA uses none). There are **three** weight matrices instead of two, so to keep the parameter count of a \`4 * d_model\` ReLU MLP, LLaMA uses \`d_ff ≈ (2/3) * 4 * d_model\`.

### RMSNorm (brief)
LLaMA normalizes with RMSNorm: like LayerNorm but **no mean subtraction and no bias**:
\`\`\`
rms_norm(x) = x / sqrt(mean(x**2, axis=-1) + eps) * weight
\`\`\`

### The full pre-norm MLP sub-block
\`\`\`
llama_mlp_block(x) = x + ffn(rms_norm(x))
\`\`\`

### Expected Return Format
- \`rms_norm(x, weight, eps=1e-6)\`: array with the same shape as \`x\` (normalized over the last axis)
- \`swiglu_ffn(x, W_gate, W_up, W_down)\`: \`W_gate\`, \`W_up\` are \`(d_model, d_ff)\`, \`W_down\` is \`(d_ff, d_model)\`; returns shape \`(..., d_model)\`
- \`llama_mlp_block(x, norm_weight, W_gate, W_up, W_down, eps=1e-6)\`: same shape as \`x\`
`,
    examples: [
      {
        input: 'rms_norm(np.array([[3.0, 4.0]]), np.ones(2))',
        output: '[[0.8485, 1.1314]]',
        explanation: 'mean(x**2) = 12.5, rms = 3.5355',
      },
      {
        input: 'x (4, 8), W_gate/W_up (8, 16), W_down (16, 8)',
        output: 'llama_mlp_block(...) shape (4, 8)',
        explanation: 'Residual connection keeps the model dimension.',
      },
    ],
    starterCode: `import numpy as np

def rms_norm(x, weight, eps=1e-6):
    """
    RMSNorm over the last axis.

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
        description: 'SwiGLU matches a reference',
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
        input: '(np.random.seed(0), round(float(llama_mlp_block(np.random.randn(4, 8), np.linspace(0.5, 1.5, 8), np.random.randn(8, 16) * 0.3, np.random.randn(8, 16) * 0.3, np.random.randn(16, 8) * 0.3).sum()), 4))[-1]',
        expected: '13.7389',
        hidden: true,
      },
    ],
    hints: [
      'RMSNorm: rms = np.sqrt(np.mean(x**2, axis=-1, keepdims=True) + eps); return x / rms * weight. No mean subtraction, no bias.',
      'SiLU is z * sigmoid(z) = z / (1 + np.exp(-z)).',
      'SwiGLU: (silu(x @ W_gate) * (x @ W_up)) @ W_down. The gate and up projections have the same width d_ff.',
      'The block normalizes first, then adds the FFN output back to the un-normalized x.',
    ],
    solution: `import numpy as np

def rms_norm(x, weight, eps=1e-6):
    rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)
    return x / rms * weight


def silu(z):
    return z / (1.0 + np.exp(-z))


def swiglu_ffn(x, W_gate, W_up, W_down):
    gate = silu(x @ W_gate)   # (..., d_ff)
    up = x @ W_up             # (..., d_ff)
    return (gate * up) @ W_down


def llama_mlp_block(x, norm_weight, W_gate, W_up, W_down, eps=1e-6):
    return x + swiglu_ffn(rms_norm(x, norm_weight, eps), W_gate, W_up, W_down)
`,
  },
  {
    id: 'online-softmax',
    title: 'Online Softmax (the FlashAttention Trick)',
    section: 'llm-internals',
    difficulty: 'hard',
    description: `
## Online Softmax: the trick behind FlashAttention

Standard attention materializes the full \`(n_q, n_k)\` score matrix, then takes a softmax over each row. For long sequences that matrix doesn't fit in fast on-chip memory (SRAM), and reading/writing it to slow memory (HBM) dominates runtime.

**FlashAttention** (Dao et al., 2022) never builds the full matrix. It walks over the keys in **blocks** and keeps, for every query row, three running statistics. The key idea is the **online softmax** (Milakov & Gimelshein, 2018): you can compute a softmax normalizer in one streaming pass by rescaling the running sum whenever the running max changes.

### Part 1: \`online_softmax(x, block_size)\` for a 1-D vector
Keep a running max \`m\` and a running sum \`l\` (start with \`m = -inf\`, \`l = 0\`). For each block \`b\` of \`x\`:
\`\`\`
m_new = max(m, max(b))
l     = l * exp(m - m_new) + sum(exp(b - m_new))     # rescale old sum to the new max
m     = m_new
\`\`\`
After the pass, \`softmax(x) = exp(x - m) / l\`.

### Part 2: \`online_attention(Q, K, V, block_size)\`
Same idea, but also keep a running (unnormalized) output \`acc\` per query. For each block \`(K_b, V_b)\` of \`block_size\` keys (the last block may be shorter):
\`\`\`
S     = Q @ K_b.T / sqrt(d)                           # (n_q, B)
m_new = maximum(m, rowmax(S))                         # (n_q, 1)
scale = exp(m - m_new)                                # shrink old stats
P     = exp(S - m_new)                                # (n_q, B)
l     = l * scale + rowsum(P)
acc   = acc * scale + P @ V_b                         # (n_q, d_v)
m     = m_new
\`\`\`
At the end \`output = acc / l\`, which equals \`softmax(Q K^T / sqrt(d)) @ V\` exactly (up to float rounding), while only ever holding an \`(n_q, block_size)\` slice of scores.

### Expected Return Format
- \`online_softmax(x, block_size)\`: 1-D array, same shape as \`x\`, sums to 1
- \`online_attention(Q, K, V, block_size)\`: \`Q\` \`(n_q, d)\`, \`K\` \`(n_k, d)\`, \`V\` \`(n_k, d_v)\`; returns \`(n_q, d_v)\`

Don't compute the softmax over a whole row at once: process the keys block by block.
`,
    examples: [
      {
        input: 'online_softmax(np.array([1000.0, 1001.0, 1002.0]), block_size=2)',
        output: '[0.09, 0.2447, 0.6652]',
        explanation: 'Stable even for huge logits: every exp is taken relative to the running max.',
      },
      {
        input: 'Q (3, 4), K (10, 4), V (10, 2), block_size=4',
        output: '(3, 2)',
        explanation: 'Blocks of 4, 4 and 2 keys; result equals standard attention.',
      },
    ],
    starterCode: `import numpy as np

def online_softmax(x, block_size):
    """
    Softmax of a 1-D array computed with a single streaming pass over blocks
    (running max + running sum), then one normalization pass.

    Returns:
        probs: same shape as x
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
        description: 'online_attention output shape',
        input: 'online_attention(np.random.randn(3, 4), np.random.randn(10, 4), np.random.randn(10, 2), 4).shape',
        expected: '(3, 2)',
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
        description: 'Max in a later block (old sum must be rescaled)',
        input: 'np.round(online_softmax(np.array([0.0, 1.0, 5.0, 2.0, 9.0]), 2), 4).tolist()',
        expected: '[0.0001, 0.0003, 0.018, 0.0009, 0.9807]',
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
        input: '(np.random.seed(0), round(float(online_attention(np.random.randn(4, 8) * 3, np.random.randn(9, 8) * 3, np.random.randn(9, 5), 4).sum()), 4))[-1]',
        expected: '2.4803',
        hidden: true,
      },
    ],
    hints: [
      'Start with m = -inf and l = 0. exp(-inf - m_new) = 0, so the first block needs no special case.',
      'When the max grows from m to m_new, every term already in l was computed as exp(x - m); multiplying by exp(m - m_new) turns it into exp(x - m_new).',
      'For attention, keep m and l as (n_q, 1) columns so they broadcast, and rescale acc with the same factor as l before adding P @ V_b.',
      'Divide once at the very end: output = acc / l.',
    ],
    solution: `import numpy as np

def online_softmax(x, block_size):
    m, l = -np.inf, 0.0
    for start in range(0, len(x), block_size):
        block = x[start:start + block_size]
        m_new = max(m, block.max())
        l = l * np.exp(m - m_new) + np.exp(block - m_new).sum()
        m = m_new
    return np.exp(x - m) / l


def online_attention(Q, K, V, block_size):
    n_q, d = Q.shape
    m = np.full((n_q, 1), -np.inf)     # running row max
    l = np.zeros((n_q, 1))             # running softmax denominator
    acc = np.zeros((n_q, V.shape[1]))  # running unnormalized output
    for start in range(0, K.shape[0], block_size):
        K_b = K[start:start + block_size]
        V_b = V[start:start + block_size]
        S = Q @ K_b.T / np.sqrt(d)
        m_new = np.maximum(m, S.max(axis=1, keepdims=True))
        scale = np.exp(m - m_new)
        P = np.exp(S - m_new)
        l = l * scale + P.sum(axis=1, keepdims=True)
        acc = acc * scale + P @ V_b
        m = m_new
    return acc / l
`,
  },
  {
    id: 'moe-routing',
    title: 'Mixture-of-Experts Routing',
    section: 'llm-internals',
    difficulty: 'hard',
    description: `
## Mixture-of-Experts (MoE) Routing

MoE layers (Switch Transformer, Mixtral, DeepSeek-MoE) replace one big FFN with \`E\` smaller **experts** and a **router** that sends each token to only \`k\` of them. Parameters grow with \`E\`, but compute per token grows only with \`k\`.

Here each expert is a linear map \`expert_e(x) = x @ expert_weights[e]\` (real experts are SwiGLU FFNs; the routing is the same).

### 1. Router
\`\`\`
logits = x @ W_router                  # (T, E)
probs  = softmax(logits, axis=-1)      # full router distribution (used by the aux loss)
\`\`\`

### 2. Top-k gating (Mixtral style)
- \`expert_indices\`: the \`k\` experts with the largest logits for each token, **sorted by descending logit**
- \`gates = softmax(top-k logits)\`: renormalized over the chosen \`k\` only, so each row sums to 1

### 3. Dispatch and combine
For each expert \`e\`, gather the tokens routed to it, run the expert **only on those tokens**, and add the outputs back weighted by the gate:
\`\`\`
y_t = sum_{j=1..k} gates[t, j] * expert_{expert_indices[t, j]}(x_t)
\`\`\`

### 4. Load-balancing auxiliary loss (Switch Transformer)
Without it, the router collapses onto a few experts. With \`T\` tokens:
\`\`\`
f_e = (number of tokens whose top-k includes e) / (T * k)    # fraction of routing slots
P_e = mean over tokens of probs[:, e]                         # mean router probability
aux_loss = E * sum_e f_e * P_e
\`\`\`
It equals 1.0 when routing is perfectly uniform and grows toward \`E\` as routing collapses onto one expert. For \`k = 1\` this is exactly the Switch Transformer loss. In training it's added to the LM loss times a small coefficient (e.g. 0.01). \`f\` is not differentiable; the gradient flows through \`P\`.

### Expected Return Format
Return a dictionary with these keys:
- \`'output'\`: combined expert outputs, shape \`(T, d_out)\`
- \`'expert_indices'\`: integer array \`(T, k)\`, sorted by descending router logit
- \`'gates'\`: \`(T, k)\`, each row sums to 1
- \`'aux_loss'\`: the load-balancing loss as a float
`,
    examples: [
      {
        input: 'x (6, 4), W_router (4, 4), expert_weights (4, 4, 4), top_k=2',
        output: '{\'output\': shape (6, 4), \'expert_indices\': shape (6, 2), \'gates\': shape (6, 2), \'aux_loss\': float}',
        explanation: 'Each token is processed by its 2 highest-scoring experts.',
      },
      {
        input: 'W_router = zeros',
        output: 'aux_loss = 1.0',
        explanation: 'Uniform router probabilities: P_e = 1/E for every expert.',
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
        dict with 'output' (T, d_out), 'expert_indices' (T, k),
        'gates' (T, k) and 'aux_loss' (float)
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
        input: '(np.random.seed(0), moe_layer(np.random.randn(5, 4), np.random.randn(4, 6), np.random.randn(6, 4, 2), 3)[\'expert_indices\'].tolist())[-1]',
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
        input: '(np.random.seed(0), round(moe_layer(np.random.randn(10, 4), np.random.randn(4, 4), np.random.randn(4, 4, 4), 2)[\'aux_loss\'], 4))[-1]',
        expected: '1.3995',
        hidden: true,
      },
    ],
    hints: [
      'Top-k: np.argsort(-logits, axis=-1, kind="stable")[:, :k]; get the matching logits with np.take_along_axis, then softmax them.',
      'Dispatch: token_ids, slot = np.nonzero(expert_indices == e) gives every (token, slot) routed to expert e.',
      'Combine: output[token_ids] += gates[token_ids, slot][:, None] * (x[token_ids] @ expert_weights[e]). A token appears at most once per expert.',
      'Aux loss: f = np.bincount(expert_indices.ravel(), minlength=E) / (T * k); P = probs.mean(0); return E * sum(f * P).',
    ],
    solution: `import numpy as np

def softmax(z, axis=-1):
    e = np.exp(z - z.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


def moe_layer(x, W_router, expert_weights, top_k):
    T = x.shape[0]
    E = W_router.shape[1]

    # 1. Router
    logits = x @ W_router                       # (T, E)
    probs = softmax(logits)                     # full distribution, for the aux loss

    # 2. Top-k experts per token, renormalized gates
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

    # 4. Load-balancing loss
    f = np.bincount(expert_indices.ravel(), minlength=E) / (T * top_k)
    P = probs.mean(axis=0)
    aux_loss = E * np.sum(f * P)

    return {
        'output': output,
        'expert_indices': expert_indices,
        'gates': gates,
        'aux_loss': float(aux_loss),
    }
`,
  },
  {
    id: 'perplexity',
    title: 'Token Cross-Entropy and Perplexity',
    section: 'llm-internals',
    difficulty: 'easy',
    description: `
## Token Cross-Entropy and Perplexity

Language models are trained and evaluated with **next-token cross-entropy**. Given logits for every position and the true next tokens:
\`\`\`
log_probs  = log_softmax(logits, axis=-1)          # stable: z - max - log(sum(exp(z - max)))
token_nll  = -log_probs[..., target]               # one number per position
mean_nll   = sum(token_nll * mask) / sum(mask)
perplexity = exp(mean_nll)
\`\`\`

**Perplexity** is "the effective number of tokens the model is choosing between". A model that predicts uniformly over \`V\` tokens has perplexity exactly \`V\`; a perfect model has perplexity 1.

### Padding mask
Batches are padded to the same length. Padded positions must not count: \`mask\` is 1 for real tokens and 0 for padding. Masked positions get \`token_nll = 0\` and are excluded from the mean. If \`mask\` is None, every position counts.

### Expected Return Format
Return a dictionary with these keys:
- \`'token_nll'\`: per-position negative log-likelihood, same shape as \`targets\` (0 where masked)
- \`'mean_nll'\`: mean NLL over unmasked positions (float, in nats)
- \`'perplexity'\`: \`exp(mean_nll)\` (float)

\`logits\` has shape \`(..., V)\` (e.g. \`(T, V)\` or \`(B, T, V)\`) and \`targets\` has shape \`(...)\` with integer token ids.
`,
    examples: [
      {
        input: 'logits = zeros((3, 5)), targets = [0, 1, 2]',
        output: 'perplexity = 5.0',
        explanation: 'Uniform predictions over 5 tokens',
      },
      {
        input: 'logits = [[2, 1, 0], [0, 0, 3]], targets = [0, 2]',
        output: 'token_nll = [0.4076, 0.0949]',
        explanation: '-log softmax at the target index',
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
        dict with 'token_nll' (same shape as targets), 'mean_nll' (float),
        'perplexity' (float)
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
        input: '(np.random.seed(0), (lambda r: (round(r[\'mean_nll\'], 4), round(r[\'perplexity\'], 4)))(perplexity(np.random.randn(2, 5, 6) * 2, np.random.randint(0, 6, size=(2, 5)))))[-1]',
        expected: '(3.8495, 46.9708)',
        hidden: true,
      },
    ],
    hints: [
      'Stable log-softmax: z - max(z) - log(sum(exp(z - max(z)))) along the last axis.',
      'Select target log-probs with np.take_along_axis(log_probs, targets[..., None], axis=-1)[..., 0].',
      'Multiply token_nll by the mask, then divide the sum by mask.sum() (not by the number of positions).',
    ],
    solution: `import numpy as np

def perplexity(logits, targets, mask=None):
    logits = np.asarray(logits, dtype=np.float64)
    targets = np.asarray(targets)

    # Stable log-softmax
    m = logits.max(axis=-1, keepdims=True)
    log_probs = logits - m - np.log(np.exp(logits - m).sum(axis=-1, keepdims=True))

    # Pick the log-prob of the correct next token at every position
    token_nll = -np.take_along_axis(log_probs, targets[..., None], axis=-1)[..., 0]

    if mask is None:
        mask = np.ones_like(token_nll)
    mask = np.asarray(mask, dtype=np.float64)
    token_nll = token_nll * mask

    mean_nll = token_nll.sum() / mask.sum()
    return {
        'token_nll': token_nll,
        'mean_nll': float(mean_nll),
        'perplexity': float(np.exp(mean_nll)),
    }
`,
  },
];
