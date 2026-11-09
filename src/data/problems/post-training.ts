import { Problem } from '../../types';

export const postTrainingProblems: Problem[] = [
  {
    id: 'grpo-advantages',
    title: 'GRPO: Group-Relative Advantages & Objective',
    section: 'post-training',
    difficulty: 'hard',
    description: `
## GRPO: Group-Relative Advantages & Objective

### What you'll build
Two functions: \`group_advantages\`, which turns each prompt's group of rewards into normalized advantages, and \`grpo_objective\`, the clipped, masked GRPO objective with a k3 KL penalty.

### Background
GRPO (Group Relative Policy Optimization, DeepSeekMath, Shao et al. 2024) is PPO without a value network. For each prompt, sample a **group** of G responses and score each one with a reward model or a verifier (e.g. 1 if the final answer is correct, 0 otherwise). The group mean plays the role of the critic's baseline, so there is no critic to train. Compared with **PPO-RLHF Objective** (Reinforcement Learning), the KL to the reference model is a separate term in the objective rather than part of the reward, and it uses the k3 estimator, which is never negative (compare **KL Divergence Penalty (RLHF)**).

### Formula
**Step 1: group-normalized advantages.** For prompt b with rewards r_{b,1..G}:
\`\`\`text
A_{b,i} = (r_{b,i} - mean_i r_{b,:}) / (std_i r_{b,:} + eps)
\`\`\`
- \`std\` is the **population** standard deviation (ddof = 0: \`np.std\`'s default; PyTorch \`unbiased=False\`)
- This is outcome supervision: every token of response i gets the same advantage A_{b,i}

**Step 2: per-token clipped surrogate and k3 KL.** For token t of response i (log-probs of the sampled token):
\`\`\`text
ratio = exp(logp - old_logp)
surr  = min(ratio · A, clip(ratio, 1 - ε, 1 + ε) · A)
d     = ref_logp - logp
kl    = exp(d) - d - 1                 k3 estimate of KL(π_θ ‖ π_ref), always ≥ 0
per_token = surr - β · kl
\`\`\`

**Step 3: average** (as in the DeepSeekMath objective):
\`\`\`text
J = mean over all (b, i) of [ Σ_t mask_t · per_token_t / Σ_t mask_t ]
\`\`\`
First average over each response's **valid** tokens (mask = 1 for real tokens, 0 for padding), then over all B·G responses. \`'mean_kl'\` uses the same averaging applied to \`kl\`. The training loss is -J.

### Inputs
- \`rewards\`: (B, G) floats, one scalar per response
- \`logp\`, \`old_logp\`, \`ref_logp\`: (B, G, T) token log-probs under the current policy, the policy that sampled the data, and the frozen reference model
- \`mask\`: (B, G, T) of 0/1, with at least one valid token per response
- \`epsilon\` (clip range, default 0.2), \`beta\` (KL coefficient, default 0.04), \`eps\` (std epsilon, default 1e-8)

### Expected return format
\`group_advantages(rewards, eps=1e-8)\` returns the (B, G) float array of advantages.

\`grpo_objective(...)\` returns a dictionary with these keys:
- \`'advantages'\`: the (B, G) array from step 1
- \`'objective'\`: J as a Python float (to maximize)
- \`'loss'\`: -J as a Python float (to minimize)
- \`'mean_kl'\`: the masked, averaged k3 KL as a Python float

### Edge cases and conventions
- A group where every response has the same reward gets advantage 0 everywhere: no learning signal, and no division by zero thanks to eps.
- Values at padded positions (mask = 0) must not affect any output.
- On-policy with no drift (logp = old_logp = ref_logp), ratio = 1 and kl = 0, so J is the mean advantage, which is 0.

### Constraints
NumPy only, fully vectorized (no Python loops over B, G or T).

### Follow-up
- Dr. GRPO argues that dividing by the response length (1/|o_i|) and by the group std biases training toward particular lengths and prompts. What changes if you drop them?
- How large should G be? What happens to the advantage estimates with G = 2?
    `,
    examples: [
      {
        input: 'group_advantages([[1.0, 0.0, 0.0, 1.0]])',
        output: '[[1.0, -1.0, -1.0, 1.0]]',
        explanation: 'Mean 0.5, population std 0.5: correct answers get +1, wrong ones -1',
      },
      {
        input: 'group_advantages([[0.5, 0.5, 0.5], [1.0, 2.0, 3.0]])',
        output: '[[0.0, 0.0, 0.0], [-1.224745, 0.0, 1.224745]]',
        explanation: 'Identical rewards give 0 (no NaN); the second group has std √(2/3) = 0.8165',
      },
      {
        input: 'grpo_objective(logp=[[[0.0], [0.0]]], old_logp=[[[-1.0], [0.0]]], ref_logp=[[[0.0], [0.0]]], rewards=[[1.0, 0.0]], mask=[[[1], [1]]], epsilon=0.2, beta=0.0)',
        output: "{'objective': 0.1, 'loss': -0.1, 'mean_kl': 0.0, ...}",
        explanation: 'A = [+1, -1]; response 1 has ratio e ≈ 2.72, clipped to 1.2; response 2 has ratio 1, so J = (1.2 - 1) / 2 = 0.1',
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
        dict with 'advantages' (B, G) array, and 'objective', 'loss' (= -objective)
        and 'mean_kl' as Python floats; token terms are averaged over each
        response's valid tokens, then over all responses
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
      {
        id: '6',
        description: 'Values at padded positions are ignored',
        input: `(lambda: (
    lp := np.array([[[-1.0, -0.5, 0.0], [-0.3, -1.2, 0.0]]]),
    old := np.array([[[-1.1, -0.4, 0.0], [-0.4, -1.0, 0.0]]]),
    ref := np.array([[[-1.2, -0.7, 0.0], [-0.3, -1.1, 0.0]]]),
    m := np.array([[[1, 1, 0], [1, 1, 0]]]),
    a := grpo_objective(lp, old, ref, [[1.0, 0.0]], m, beta=0.1),
    junk := np.array([[[0.0, 0.0, 5.0], [0.0, 0.0, -7.0]]]),
    b := grpo_objective(lp + junk, old - junk, ref + 2 * junk, [[1.0, 0.0]], m, beta=0.1),
    bool(abs(a['objective'] - b['objective']) < 1e-9 and abs(a['mean_kl'] - b['mean_kl']) < 1e-9 and abs(a['objective']) > 1e-4)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Two separate pieces: a per-prompt normalization of rewards, then a PPO-style token objective where padding must not count.',
      'Normalize along the group axis (axis=1), broadcast each response\'s advantage over its tokens, build the per-token terms, then do a masked mean per response followed by a plain mean.',
      'adv = (r - r.mean(axis=1, keepdims=True)) / (r.std(axis=1, keepdims=True) + eps); A = adv[..., None]; d = ref_logp - logp; kl = np.exp(d) - d - 1; per response: (x * mask).sum(-1) / mask.sum(-1).',
      'Use the population std (np.std\'s default, not ddof=1), apply the mask before summing, and divide by each response\'s own length, not by T or by the total token count.',
    ],
    solution: `import numpy as np

def group_advantages(rewards, eps=1e-8):
    """(B, G) group-normalized advantages with the population std."""
    r = np.asarray(rewards, dtype=float)
    mean = r.mean(axis=1, keepdims=True)
    std = r.std(axis=1, keepdims=True)  # population std (ddof=0)
    return (r - mean) / (std + eps)     # identical rewards -> 0, not NaN


def grpo_objective(logp, old_logp, ref_logp, rewards, mask,
                   epsilon=0.2, beta=0.04, eps=1e-8):
    """
    GRPO objective. Returns {'advantages', 'objective', 'loss', 'mean_kl'}.
    """
    logp = np.asarray(logp, dtype=float)
    old_logp = np.asarray(old_logp, dtype=float)
    ref_logp = np.asarray(ref_logp, dtype=float)
    mask = np.asarray(mask, dtype=float)

    adv = group_advantages(rewards, eps)        # (B, G)
    A = adv[..., None]                          # same advantage for every token

    # PPO-style clipped surrogate per token
    ratio = np.exp(logp - old_logp)
    surr = np.minimum(ratio * A, np.clip(ratio, 1 - epsilon, 1 + epsilon) * A)

    # k3 KL estimator against the reference model (always >= 0)
    d = ref_logp - logp
    kl = np.exp(d) - d - 1

    per_token = surr - beta * kl

    # Masked mean over each response's valid tokens, then mean over all responses
    lengths = mask.sum(axis=-1)                 # (B, G), assumed >= 1
    objective = ((per_token * mask).sum(axis=-1) / lengths).mean()
    mean_kl = ((kl * mask).sum(axis=-1) / lengths).mean()

    return {
        'advantages': adv,
        'objective': float(objective),
        'loss': float(-objective),
        'mean_kl': float(mean_kl),
    }

# Time and space O(B * G * T)
`,
  },
  {
    id: 'int8-quantization',
    title: 'Int8 Weight Quantization (absmax)',
    section: 'post-training',
    difficulty: 'medium',
    description: `
## Int8 Weight Quantization (absmax)

### What you'll build
Symmetric (absmax) int8 quantization of a weight matrix, per output channel and per tensor; dequantization; an int8 matmul that rescales an int32 accumulator; and a report comparing the two schemes' errors.

### Background
Storing weights as int8 instead of float32 cuts memory by 4×, and int8 matmuls are fast on modern hardware. Absmax quantization maps the largest magnitude to ±127 and rounds everything else to the nearest step. The catch is outliers: one large weight sets a large step for everything sharing its scale. Giving each output row its own scale (**per-channel**, the "vector-wise" quantization of LLM.int8()) contains that damage.

### Formula
For a group of weights w that share one scale:
\`\`\`text
scale = max(max|w|, 1e-8) / 127
w_q   = clip(round(w / scale), -127, 127)      stored as int8
w_hat = w_q · scale                            dequantized
\`\`\`
Rounding is round-half-to-even (\`np.round\` / \`torch.round\`), so the per-weight error is at most scale / 2.
- **Per-tensor**: one scale for the whole matrix.
- **Per-channel**: one scale per **row** of W, which has shape (d_out, d_in).

**Int8 matmul** for y = x · Wᵀ:
1. Quantize the activations **per row** of x (one scale per token): x_q of shape (n, d_in) and s_x of shape (n,).
2. Accumulate the integer products in int32: acc = x_q · W_qᵀ, shape (n, d_out).
3. Rescale with both scales: y ≈ acc · s_x[:, None] · s_w[None, :].

### Inputs
- \`W\`: (d_out, d_in) float array
- \`x\`: (n, d_in) float array
- \`W_q\`: (d_out, d_in) int8 array; \`w_scales\` / \`scales\`: (d_out,) float array (or a Python float in \`dequantize\`)

### Expected return format
- \`quantize_per_channel(W)\` returns a tuple \`(W_q, scales)\`: an **int8** array of shape (d_out, d_in) and a float array of shape (d_out,)
- \`quantize_per_tensor(W)\` returns \`(W_q, scale)\`: an int8 array and a Python float
- \`dequantize(W_q, scales)\` returns a float array of W_q's shape; \`scales\` is a (d_out,) array (one per row) or a scalar
- \`int8_matmul(x, W_q, w_scales)\` returns an (n, d_out) float array approximating x · Wᵀ
- \`quantization_report(W)\` returns a dictionary:
  - \`'per_channel_error'\`: max |W - dequantize(*quantize_per_channel(W))| as a Python float
  - \`'per_tensor_error'\`: max |W - dequantize(*quantize_per_tensor(W))| as a Python float

### Edge cases and conventions
- An all-zero row must not divide by zero: the 1e-8 floor on the absmax keeps it at 0.
- The symmetric range is [-127, 127]; -128 is never used.
- Exact halves round to even, e.g. 63.5 becomes 64 and 62.5 becomes 62.

### Constraints
NumPy only, vectorized. Cast to int32 before the integer matmul: int8 products overflow int8 immediately.

### Follow-up
- Why do LLM activations need special care (outlier features), and how does LLM.int8() handle them with mixed precision?
- How do zero-point (asymmetric) quantization and 4-bit group-wise quantization (e.g. block size 64) change the error?
    `,
    examples: [
      {
        input: 'quantize_per_channel(np.array([[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]]))',
        output: '(array([[74, -127, 32], [127, 6, -32]], dtype=int8), array([0.009449, 0.015748]))',
        explanation: 'Each row\'s largest magnitude maps to ±127: scales are 1.2/127 and 2.0/127, and 0.7/0.009449 = 74.08 rounds to 74',
      },
      {
        input: 'quantization_report(np.array([[0.01, -0.02, 0.013], [5.0, -3.0, 1.7]]))',
        output: "{'per_channel_error': 0.007874, 'per_tensor_error': 0.01937}",
        explanation: 'With one scale (5/127 = 0.039) the small first row quantizes to [0, -1, 0] and is nearly erased; per-row scales keep it',
      },
    ],
    starterCode: `import numpy as np

def quantize_per_channel(W):
    """
    Absmax-quantize each row of W with its own scale.

    Args:
        W: (d_out, d_in) float weights

    Returns:
        (W_q, scales): W_q int8 (d_out, d_in), scales float (d_out,)
        with scales = max(row absmax, 1e-8) / 127
    """
    # Your code here
    pass


def quantize_per_tensor(W):
    """
    Absmax-quantize all of W with one scale.

    Returns:
        (W_q, scale): W_q int8 with W's shape, scale a Python float
    """
    # Your code here
    pass


def dequantize(W_q, scales):
    """
    Map int8 values back to floats.

    Args:
        W_q: (d_out, d_in) int8 array
        scales: (d_out,) per-row scales, or a single scalar

    Returns:
        (d_out, d_in) float array W_q * scale
    """
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
    """Returns {'per_channel_error': float, 'per_tensor_error': float} (max abs errors)."""
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
      {
        id: '7',
        description: 'All-zero row stays 0 (no NaN); 63.5 rounds half-to-even to 64',
        input: 'quantize_per_channel(np.array([[0.0, 0.0], [1.0, -2.0]]))[0].tolist()',
        expected: '[[0, 0], [64, -127]]',
        hidden: true,
      },
      {
        id: '8',
        description: 'dequantize accepts a scalar scale',
        input: 'dequantize(np.array([[1, -2], [127, 0]], dtype=np.int8), 0.5).tolist()',
        expected: '[[0.5, -1.0], [63.5, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Every scheme here is the same operation (divide by a scale, round, clip, cast) applied to different groups of weights: rows, the whole matrix, or activation rows.',
      'Write one helper that absmax-quantizes each row of a matrix and reuse it for per-channel weights and per-token activations; per-tensor is the same with a single scale.',
      'scales = np.maximum(np.abs(M).max(axis=1), 1e-8) / 127; M_q = np.clip(np.round(M / scales[:, None]), -127, 127).astype(np.int8); dequantize with np.reshape(scales, (-1, 1)) so a scalar also works.',
      'In int8_matmul, cast both operands with .astype(np.int32) before the matmul (int8 overflows), then multiply by x_scales[:, None] * w_scales[None, :].',
    ],
    solution: `import numpy as np

def _absmax_quantize_rows(M):
    """Quantize each row of M with its own absmax scale."""
    absmax = np.abs(M).max(axis=1)
    scales = np.maximum(absmax, 1e-8) / 127.0          # floor avoids 0-division
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
    # reshape(-1, 1) turns per-row scales into a column; a scalar stays a 1x1
    return W_q.astype(float) * np.reshape(scales, (-1, 1))


def int8_matmul(x, W_q, w_scales):
    x = np.asarray(x, dtype=float)
    x_q, x_scales = _absmax_quantize_rows(x)             # per-token activation scales
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

# int8_matmul: O(n * d_in * d_out) integer multiply-adds, 4x less weight memory than float32
`,
  },
];
