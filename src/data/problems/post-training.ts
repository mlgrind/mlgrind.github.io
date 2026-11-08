import { Problem } from '../../types';

export const postTrainingProblems: Problem[] = [
  {
    id: 'grpo-advantages',
    title: 'GRPO: Group-Relative Advantages & Objective',
    section: 'post-training',
    difficulty: 'hard',
    description: `
## GRPO: Group Relative Policy Optimization

GRPO (DeepSeekMath, Shao et al. 2024) is PPO without a value network. For each prompt, sample a **group** of G responses, score each with a reward model (or a verifier), and use the reward **relative to the group** as the advantage. The group mean plays the role of the critic's baseline.

### Step 1: group-normalized advantages
For prompt b with rewards r_{b,1..G}:
\`\`\`
A_{b,i} = (r_{b,i} - mean_i(r_{b,:})) / (std_i(r_{b,:}) + eps)
\`\`\`
- \`std\` is the **population** standard deviation (ddof = 0, i.e. \`np.std\` default; in PyTorch \`unbiased=False\`)
- \`eps = 1e-8\`, so a group where every response gets the same reward has advantage 0 everywhere (no learning signal, no division by zero)
- This is outcome supervision: every token of response i gets the same advantage A_{b,i}

### Step 2: per-token clipped surrogate with a KL term
For token t of response i (log-probs of the sampled token):
\`\`\`
ratio = exp(logp - old_logp)
surr  = min(ratio * A, clip(ratio, 1 - ε, 1 + ε) * A)

# k3 estimator of KL(π_θ || π_ref), always >= 0
kl    = exp(ref_logp - logp) - (ref_logp - logp) - 1

per_token = surr - β * kl
\`\`\`

### Step 3: averaging (as in the DeepSeekMath objective)
\`\`\`
J = mean over (b, i) of [ (1 / |o_i|) * Σ_t mask_t * per_token_t ]
\`\`\`
Average over each response's **valid** tokens first (\`mask\` is 1 for real tokens and 0 for padding, |o_i| = mask.sum()), then average over all B·G responses. \`'mean_kl'\` uses the same averaging applied to \`kl\`. The training loss is \`-J\`.

### Shapes
- \`rewards\`: (B, G)
- \`logp\`, \`old_logp\`, \`ref_logp\`, \`mask\`: (B, G, T)

### Expected Return Format
\`group_advantages(rewards, eps=1e-8)\` returns the (B, G) array of advantages.

\`grpo_objective(...)\` returns a dictionary with these keys:
- \`'advantages'\`: (B, G) array from step 1
- \`'objective'\`: J as a Python float (to maximize)
- \`'loss'\`: \`-J\` as a Python float (to minimize)
- \`'mean_kl'\`: averaged k3 KL as a Python float
    `,
    examples: [
      {
        input: 'group_advantages([[1.0, 0.0, 0.0, 1.0]])',
        output: '[[1.0, -1.0, -1.0, 1.0]]',
        explanation: 'mean 0.5, std 0.5: correct answers get +1, wrong ones -1',
      },
      {
        input: 'logp == old_logp == ref_logp',
        output: "{'objective': 0.0, 'mean_kl': 0.0, ...}",
        explanation: 'ratio = 1 and KL = 0, so J is the mean advantage, which is 0 within every group',
      },
    ],
    starterCode: `import numpy as np

def group_advantages(rewards, eps=1e-8):
    """
    Group-normalized advantages.

    Args:
        rewards: (B, G) rewards, G sampled responses per prompt
        eps: added to the std

    Returns:
        (B, G) array: (r - group mean) / (group std + eps), population std
    """
    # Your code here
    pass


def grpo_objective(logp, old_logp, ref_logp, rewards, mask,
                   epsilon=0.2, beta=0.04, eps=1e-8):
    """
    GRPO clipped objective with a k3 KL penalty.

    Args:
        logp: (B, G, T) token log-probs under the current policy
        old_logp: (B, G, T) token log-probs under the policy that sampled
        ref_logp: (B, G, T) token log-probs under the frozen reference model
        rewards: (B, G) one scalar reward per response
        mask: (B, G, T) 1 for real tokens, 0 for padding
        epsilon: clipping range
        beta: KL coefficient
        eps: std epsilon for the advantages

    Returns:
        dict with 'advantages' (B, G), 'objective', 'loss', 'mean_kl' (floats)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Advantages for a 0/1 verifier reward',
        input: 'np.round(group_advantages([[1.0, 0.0, 0.0, 1.0]]), 4).tolist()',
        expected: '[[1.0, -1.0, -1.0, 1.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'On-policy, no drift: objective 0 and KL 0',
        input: `(lambda: (
    lp := np.log(np.full((2, 3, 4), 0.25)),
    r := grpo_objective(lp, lp, lp, [[1.0, 0.0, 2.0], [0.5, 0.5, 1.0]], np.ones((2, 3, 4))),
    (round(r['objective'], 6), round(r['mean_kl'], 6))
)[-1])()`,
        expected: '(0.0, 0.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Identical rewards give zero advantages (no NaN)',
        input: 'np.round(group_advantages([[0.5, 0.5, 0.5], [1.0, 2.0, 3.0]]), 6).tolist()',
        expected: '[[0.0, 0.0, 0.0], [-1.224745, 0.0, 1.224745]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Objective, loss and KL with padding (values)',
        input: `(lambda: (
    r := grpo_objective(
        [[[-1.0, -0.5, -2.0], [-0.3, -1.2, -0.7], [-0.9, -0.4, -1.5]]],
        [[[-1.1, -0.5, -1.8], [-0.4, -1.0, -0.7], [-0.9, -0.6, -1.5]]],
        [[[-1.2, -0.7, -1.9], [-0.3, -1.1, -0.9], [-1.0, -0.4, -1.4]]],
        [[1.0, 0.0, 0.5]],
        [[[1, 1, 1], [1, 1, 0], [1, 1, 1]]],
        epsilon=0.2, beta=0.1),
    (round(r['objective'], 4), round(r['loss'], 4), round(r['mean_kl'], 4))
)[-1])()`,
        expected: '(0.0045, -0.0045, 0.0067)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Large ratio with positive advantage is clipped at 1 + epsilon',
        input: `(lambda: (
    r := grpo_objective([[[0.0], [0.0]]], [[[-1.0], [0.0]]], [[[0.0], [0.0]]], [[1.0, 0.0]], [[[1], [1]]], epsilon=0.2, beta=0.0),
    round(r['objective'], 4)
)[-1])()`,
        expected: '0.1',
        hidden: true,
      },
    ],
    hints: [
      'Advantages: subtract rewards.mean(axis=1, keepdims=True) and divide by rewards.std(axis=1, keepdims=True) + eps',
      'Broadcast the (B, G) advantages over tokens with adv[..., None]',
      'k3 KL: with d = ref_logp - logp, kl = np.exp(d) - d - 1 (it is >= 0 for every token)',
      'Per response: (per_token * mask).sum(-1) / mask.sum(-1); then .mean() over all responses',
    ],
    solution: `import numpy as np

def group_advantages(rewards, eps=1e-8):
    r = np.asarray(rewards, dtype=float)
    mean = r.mean(axis=1, keepdims=True)
    std = r.std(axis=1, keepdims=True)  # population std (ddof=0)
    return (r - mean) / (std + eps)


def grpo_objective(logp, old_logp, ref_logp, rewards, mask,
                   epsilon=0.2, beta=0.04, eps=1e-8):
    logp = np.asarray(logp, dtype=float)
    old_logp = np.asarray(old_logp, dtype=float)
    ref_logp = np.asarray(ref_logp, dtype=float)
    mask = np.asarray(mask, dtype=float)

    adv = group_advantages(rewards, eps)        # (B, G)
    A = adv[..., None]                          # same advantage for every token

    # PPO-style clipped surrogate per token
    ratio = np.exp(logp - old_logp)
    surr = np.minimum(ratio * A, np.clip(ratio, 1 - epsilon, 1 + epsilon) * A)

    # k3 KL estimator against the reference model
    d = ref_logp - logp
    kl = np.exp(d) - d - 1

    per_token = surr - beta * kl

    # Mean over each response's valid tokens, then over all responses
    lengths = mask.sum(axis=-1)
    objective = ((per_token * mask).sum(axis=-1) / lengths).mean()
    mean_kl = ((kl * mask).sum(axis=-1) / lengths).mean()

    return {
        'advantages': adv,
        'objective': float(objective),
        'loss': float(-objective),
        'mean_kl': float(mean_kl),
    }
`,
  },
  {
    id: 'int8-quantization',
    title: 'Int8 Weight Quantization (absmax)',
    section: 'post-training',
    difficulty: 'medium',
    description: `
## Symmetric Int8 Quantization

Storing weights in int8 instead of float32 cuts memory by 4×. **Absmax** (symmetric) quantization maps the largest magnitude to 127:
\`\`\`
scale = max|w| / 127
w_q   = clip(round(w / scale), -127, 127)     (stored as int8)
w_hat = w_q * scale                            (dequantized)
\`\`\`
Rounding is round-half-to-even (\`np.round\` / \`torch.round\`). The rounding error per weight is at most scale / 2.

### Per-tensor vs per-channel
- **Per-tensor**: one scale for the whole matrix. One large outlier makes the scale large, and every small weight loses precision.
- **Per-channel**: one scale per **output row** of W (shape (d_out, d_in)), so each row uses its own range. This is what LLM.int8() calls vector-wise quantization.

To avoid dividing by zero, use \`scale = max(absmax, 1e-8) / 127\`.

### Int8 matmul
To compute y = x Wᵀ in int8, also quantize the activations **per row** of x (per token), accumulate the integer products in int32 and rescale with both scales:
\`\`\`
x_q, s_x = absmax-quantize each row of x          (n, d_in), (n,)
acc      = x_q @ W_qᵀ   (int32 accumulation)       (n, d_out)
y        ≈ acc * s_x[:, None] * s_w[None, :]
\`\`\`

### What to implement
- \`quantize_per_channel(W)\` returns \`(W_q, scales)\`: W_q is an **int8** array (d_out, d_in), scales is (d_out,)
- \`quantize_per_tensor(W)\` returns \`(W_q, scale)\`: int8 array and a Python float
- \`dequantize(W_q, scales)\` returns floats; \`scales\` is either a (d_out,) array (one per row) or a scalar
- \`int8_matmul(x, W_q, w_scales)\` returns the (n, d_out) float approximation of x Wᵀ
- \`quantization_report(W)\` returns a dictionary:
  - \`'per_channel_error'\`: max |W - dequantize(per-channel)| (Python float)
  - \`'per_tensor_error'\`: max |W - dequantize(per-tensor)| (Python float)
    `,
    examples: [
      {
        input: 'W = [[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]]',
        output: 'W_q = [[74, -127, 32], [127, 6, -32]], scales = [1.2/127, 2.0/127] = [0.009449, 0.015748]',
        explanation: 'Each row is scaled so that its largest magnitude maps to ±127',
      },
    ],
    starterCode: `import numpy as np

def quantize_per_channel(W):
    """Returns (W_q int8 (d_out, d_in), scales (d_out,)) with one scale per row."""
    # Your code here
    pass


def quantize_per_tensor(W):
    """Returns (W_q int8, scale float) with one scale for the whole matrix."""
    # Your code here
    pass


def dequantize(W_q, scales):
    """W_q * scale; scales is (d_out,) (per row) or a scalar."""
    # Your code here
    pass


def int8_matmul(x, W_q, w_scales):
    """
    Approximate x @ W.T with int8 operands.

    Args:
        x: (n, d_in) float activations (quantize per row)
        W_q: (d_out, d_in) int8 weights
        w_scales: (d_out,) per-row weight scales

    Returns:
        (n, d_out) float array
    """
    # Your code here
    pass


def quantization_report(W):
    """Returns {'per_channel_error': float, 'per_tensor_error': float}."""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Per-channel int8 values',
        input: 'quantize_per_channel(np.array([[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]]))[0].tolist()',
        expected: '[[74, -127, 32], [127, 6, -32]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Per-channel scales and int8 dtype',
        input: '(lambda q: (np.round(q[1], 6).tolist(), q[0].dtype == np.int8))(quantize_per_channel(np.array([[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]])))',
        expected: '([0.009449, 0.015748], True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Per-tensor error is larger when rows have very different ranges',
        input: `(lambda r: (round(r['per_channel_error'], 6), round(r['per_tensor_error'], 6)))(quantization_report(np.array([[0.01, -0.02, 0.013], [5.0, -3.0, 1.7]])))`,
        expected: '(0.007874, 0.01937)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Rounding error is at most scale / 2 for every weight',
        input: `(lambda: (
    W := np.random.randn(8, 16) * np.random.rand(8, 1) * 10,
    q := quantize_per_channel(W),
    bool(np.all(np.abs(dequantize(*q) - W) <= q[1][:, None] / 2 + 1e-12) and np.abs(q[0]).max() == 127)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Int8 matmul values (rescaled with activation and weight scales)',
        input: `(lambda: (
    W := np.array([[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]]),
    x := np.array([[1.0, 2.0, -1.0], [0.5, -0.25, 4.0]]),
    np.round(int8_matmul(x, *quantize_per_channel(W)), 4).tolist()
)[-1])()`,
        expected: '[[-2.0, 2.7126], [1.8642, -1.0317]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Int8 matmul stays close to the float matmul',
        input: `(lambda: (
    W := np.random.randn(16, 32), x := np.random.randn(4, 32),
    y := int8_matmul(x, *quantize_per_channel(W)),
    bool(np.abs(y - x @ W.T).max() < 0.05 * np.abs(x @ W.T).max())
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Per-channel absmax: np.abs(W).max(axis=1); scales = np.maximum(absmax, 1e-8) / 127',
      'Quantize: np.clip(np.round(W / scales[:, None]), -127, 127).astype(np.int8)',
      'dequantize can reshape scales with np.reshape(scales, (-1, 1)) so it works for a scalar too',
      'int8_matmul: quantize x per row the same way, then x_q.astype(np.int32) @ W_q.astype(np.int32).T, times s_x[:, None] * w_scales[None, :]',
    ],
    solution: `import numpy as np

def _absmax_quantize_rows(M):
    absmax = np.abs(M).max(axis=1)
    scales = np.maximum(absmax, 1e-8) / 127.0
    M_q = np.clip(np.round(M / scales[:, None]), -127, 127).astype(np.int8)
    return M_q, scales


def quantize_per_channel(W):
    W = np.asarray(W, dtype=float)
    return _absmax_quantize_rows(W)


def quantize_per_tensor(W):
    W = np.asarray(W, dtype=float)
    scale = max(float(np.abs(W).max()), 1e-8) / 127.0
    W_q = np.clip(np.round(W / scale), -127, 127).astype(np.int8)
    return W_q, scale


def dequantize(W_q, scales):
    return W_q.astype(float) * np.reshape(scales, (-1, 1))


def int8_matmul(x, W_q, w_scales):
    x = np.asarray(x, dtype=float)
    x_q, x_scales = _absmax_quantize_rows(x)           # per-token activation scales
    acc = x_q.astype(np.int32) @ W_q.astype(np.int32).T  # int32 accumulation
    return acc * x_scales[:, None] * np.asarray(w_scales)[None, :]


def quantization_report(W):
    W = np.asarray(W, dtype=float)
    per_channel = dequantize(*quantize_per_channel(W))
    per_tensor = dequantize(*quantize_per_tensor(W))
    return {
        'per_channel_error': float(np.abs(W - per_channel).max()),
        'per_tensor_error': float(np.abs(W - per_tensor).max()),
    }
`,
  },
];
