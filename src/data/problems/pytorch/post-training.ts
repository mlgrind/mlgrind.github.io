import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../post-training.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const postTrainingPyTorch: Record<string, LanguageVariant> = {
  // Ported with the new problems from the ML Coding Lab fork.
  'grpo-advantages': {
    note: "Pure tensor ops, no loops. Use the population std (r.std(dim=1, unbiased=False, keepdim=True)): torch's default std is unbiased and gives different advantages. Return the advantages as a tensor and the scalars as Python floats (.item()).",
    starterCode: `import torch

def group_advantages(rewards: torch.Tensor, eps: float = 1e-8) -> torch.Tensor:
    """
    Group-normalized advantages.

    Args:
        rewards: (B, G) rewards, G sampled responses per prompt
        eps: added to the std

    Returns:
        (B, G) tensor: (r - group mean) / (group std + eps), population std
    """
    # Your code here
    pass


def grpo_objective(logp, old_logp, ref_logp, rewards, mask,
                   epsilon=0.2, beta=0.04, eps=1e-8):
    """
    GRPO clipped objective with a k3 KL penalty.

    Args:
        logp, old_logp, ref_logp: (B, G, T) token log-probs (current, sampling, reference)
        rewards: (B, G) one scalar reward per response
        mask: (B, G, T) 1 for real tokens, 0 for padding
        epsilon: clipping range
        beta: KL coefficient
        eps: std epsilon for the advantages

    Returns:
        dict with 'advantages' (B, G) tensor, and 'objective', 'loss' (= -objective)
        and 'mean_kl' as Python floats; token terms are averaged over each
        response's valid tokens, then over all responses
    """
    # Your code here
    pass
`,
    solution: `import torch

def group_advantages(rewards: torch.Tensor, eps: float = 1e-8) -> torch.Tensor:
    r = rewards.double()
    mean = r.mean(dim=1, keepdim=True)
    std = r.std(dim=1, unbiased=False, keepdim=True)  # population std
    return (r - mean) / (std + eps)


def grpo_objective(logp, old_logp, ref_logp, rewards, mask,
                   epsilon=0.2, beta=0.04, eps=1e-8):
    logp, old_logp, ref_logp = logp.double(), old_logp.double(), ref_logp.double()
    mask = mask.double()

    adv = group_advantages(rewards, eps)       # (B, G)
    A = adv.unsqueeze(-1)                      # broadcast over tokens

    ratio = torch.exp(logp - old_logp)
    surr = torch.minimum(ratio * A, torch.clamp(ratio, 1 - epsilon, 1 + epsilon) * A)

    # k3 KL estimator against the reference model
    d = ref_logp - logp
    kl = torch.exp(d) - d - 1

    per_token = surr - beta * kl

    # Masked mean over each response's valid tokens, then mean over all responses
    lengths = mask.sum(dim=-1)
    objective = ((per_token * mask).sum(dim=-1) / lengths).mean()
    mean_kl = ((kl * mask).sum(dim=-1) / lengths).mean()

    return {
        'advantages': adv,
        'objective': objective.item(),
        'loss': -objective.item(),
        'mean_kl': mean_kl.item(),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Advantages for a 0/1 verifier reward',
        input: 'torch.round(group_advantages(torch.tensor([[1.0, 0.0, 0.0, 1.0]])), decimals=4).tolist()',
        expected: '[[1.0, -1.0, -1.0, 1.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'On-policy, no drift: objective 0 and KL 0',
        input: `(lambda: (
    lp := torch.log(torch.full((2, 3, 4), 0.25)),
    r := grpo_objective(lp, lp, lp, torch.tensor([[1.0, 0.0, 2.0], [0.5, 0.5, 1.0]]), torch.ones(2, 3, 4)),
    (round(r['objective'], 6), round(r['mean_kl'], 6))
)[-1])()`,
        expected: '(0.0, 0.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Identical rewards give zero advantages; population std is used',
        input: `(lambda a: [[round(v, 6) for v in row] for row in a.tolist()])(group_advantages(torch.tensor([[0.5, 0.5, 0.5], [1.0, 2.0, 3.0]])))`,
        expected: '[[0.0, 0.0, 0.0], [-1.224745, 0.0, 1.224745]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Objective, loss and KL with padding (values)',
        input: `(lambda: (
    r := grpo_objective(
        torch.tensor([[[-1.0, -0.5, -2.0], [-0.3, -1.2, -0.7], [-0.9, -0.4, -1.5]]]),
        torch.tensor([[[-1.1, -0.5, -1.8], [-0.4, -1.0, -0.7], [-0.9, -0.6, -1.5]]]),
        torch.tensor([[[-1.2, -0.7, -1.9], [-0.3, -1.1, -0.9], [-1.0, -0.4, -1.4]]]),
        torch.tensor([[1.0, 0.0, 0.5]]),
        torch.tensor([[[1, 1, 1], [1, 1, 0], [1, 1, 1]]]),
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
    r := grpo_objective(torch.tensor([[[0.0], [0.0]]]), torch.tensor([[[-1.0], [0.0]]]), torch.tensor([[[0.0], [0.0]]]),
                        torch.tensor([[1.0, 0.0]]), torch.tensor([[[1], [1]]]), epsilon=0.2, beta=0.0),
    round(r['objective'], 4)
)[-1])()`,
        expected: '0.1',
        hidden: true,
      },
      {
        id: '6',
        description: 'Values at padded positions are ignored',
        input: `(lambda: (
    lp := torch.tensor([[[-1.0, -0.5, 0.0], [-0.3, -1.2, 0.0]]]),
    old := torch.tensor([[[-1.1, -0.4, 0.0], [-0.4, -1.0, 0.0]]]),
    ref := torch.tensor([[[-1.2, -0.7, 0.0], [-0.3, -1.1, 0.0]]]),
    m := torch.tensor([[[1, 1, 0], [1, 1, 0]]]),
    a := grpo_objective(lp, old, ref, torch.tensor([[1.0, 0.0]]), m, beta=0.1),
    junk := torch.tensor([[[0.0, 0.0, 5.0], [0.0, 0.0, -7.0]]]),
    b := grpo_objective(lp + junk, old - junk, ref + 2 * junk, torch.tensor([[1.0, 0.0]]), m, beta=0.1),
    bool(abs(a['objective'] - b['objective']) < 1e-6 and abs(a['mean_kl'] - b['mean_kl']) < 1e-6 and abs(a['objective']) > 1e-4)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Two separate pieces: a per-prompt normalization of rewards, then a PPO-style token objective where padding must not count.',
      'Advantages: (r - r.mean(dim=1, keepdim=True)) / (r.std(dim=1, unbiased=False, keepdim=True) + eps); adv.unsqueeze(-1) broadcasts them over tokens.',
      'ratio = torch.exp(logp - old_logp); surr = torch.minimum(ratio * A, torch.clamp(ratio, 1 - epsilon, 1 + epsilon) * A); d = ref_logp - logp; kl = torch.exp(d) - d - 1.',
      'Per response: (x * mask).sum(-1) / mask.sum(-1), then .mean(). Forgetting unbiased=False, or dividing by T instead of each response\'s length, gives wrong values.',
    ],
  },
  'int8-quantization': {
    note: 'Use torch.round (half-to-even), torch.clamp and .to(torch.int8). Accumulate the int8 matmul in a wide integer dtype (.long()) and rescale afterwards; int8 products overflow.',
    starterCode: `import torch

def quantize_per_channel(W: torch.Tensor):
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


def quantize_per_tensor(W: torch.Tensor):
    """
    Absmax-quantize all of W with one scale.

    Returns:
        (W_q, scale): W_q int8 with W's shape, scale a Python float
    """
    # Your code here
    pass


def dequantize(W_q: torch.Tensor, scales):
    """
    Map int8 values back to floats.

    Args:
        W_q: (d_out, d_in) int8 tensor
        scales: (d_out,) per-row scales tensor, or a single Python float

    Returns:
        (d_out, d_in) float tensor W_q * scale
    """
    # Your code here
    pass


def int8_matmul(x: torch.Tensor, W_q: torch.Tensor, w_scales: torch.Tensor) -> torch.Tensor:
    """
    Approximate x @ W.T with int8 operands.

    Args:
        x: (n, d_in) float activations (quantize per row)
        W_q: (d_out, d_in) int8 weights
        w_scales: (d_out,) per-row weight scales

    Returns:
        (n, d_out) float tensor
    """
    # Your code here
    pass


def quantization_report(W: torch.Tensor) -> dict:
    """Returns {'per_channel_error': float, 'per_tensor_error': float} (max abs errors)."""
    # Your code here
    pass
`,
    solution: `import torch

def _absmax_quantize_rows(M):
    absmax = M.abs().max(dim=1).values
    scales = torch.clamp(absmax, min=1e-8) / 127.0       # floor avoids 0-division
    M_q = torch.clamp(torch.round(M / scales.unsqueeze(1)), -127, 127).to(torch.int8)
    return M_q, scales


def quantize_per_channel(W):
    return _absmax_quantize_rows(W.double())


def quantize_per_tensor(W):
    W = W.double()
    scale = max(W.abs().max().item(), 1e-8) / 127.0
    W_q = torch.clamp(torch.round(W / scale), -127, 127).to(torch.int8)
    return W_q, scale


def dequantize(W_q, scales):
    s = torch.as_tensor(scales, dtype=torch.float64).reshape(-1, 1)
    return W_q.double() * s


def int8_matmul(x, W_q, w_scales):
    x_q, x_scales = _absmax_quantize_rows(x.double())   # per-token activation scales
    acc = x_q.long() @ W_q.long().T                      # integer accumulation
    return acc.double() * x_scales.unsqueeze(1) * w_scales.double().unsqueeze(0)


def quantization_report(W):
    W = W.double()
    per_channel = dequantize(*quantize_per_channel(W))
    per_tensor = dequantize(*quantize_per_tensor(W))
    return {
        'per_channel_error': (W - per_channel).abs().max().item(),
        'per_tensor_error': (W - per_tensor).abs().max().item(),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Per-channel int8 values',
        input: 'quantize_per_channel(torch.tensor([[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]]))[0].tolist()',
        expected: '[[74, -127, 32], [127, 6, -32]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Per-channel scales and int8 dtype',
        input: '(lambda q: ([round(s, 6) for s in q[1].tolist()], q[0].dtype == torch.int8))(quantize_per_channel(torch.tensor([[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]])))',
        expected: '([0.009449, 0.015748], True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Per-tensor error is larger when rows have very different ranges',
        input: `(lambda r: (round(r['per_channel_error'], 6), round(r['per_tensor_error'], 6)))(quantization_report(torch.tensor([[0.01, -0.02, 0.013], [5.0, -3.0, 1.7]], dtype=torch.float64)))`,
        expected: '(0.007874, 0.01937)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Rounding error is at most scale / 2 for every weight',
        input: `(lambda: (
    W := torch.randn(8, 16, dtype=torch.float64) * torch.rand(8, 1, dtype=torch.float64) * 10,
    q := quantize_per_channel(W),
    bool(torch.all((dequantize(*q) - W).abs() <= q[1].unsqueeze(1) / 2 + 1e-12)) and q[0].abs().max().item() == 127
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Int8 matmul values (rescaled with activation and weight scales)',
        input: `(lambda: (
    W := torch.tensor([[0.7, -1.2, 0.3], [2.0, 0.1, -0.5]], dtype=torch.float64),
    x := torch.tensor([[1.0, 2.0, -1.0], [0.5, -0.25, 4.0]], dtype=torch.float64),
    [[round(v, 4) for v in row] for row in int8_matmul(x, *quantize_per_channel(W)).tolist()]
)[-1])()`,
        expected: '[[-2.0, 2.7126], [1.8642, -1.0317]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Int8 matmul stays close to the float matmul',
        input: `(lambda: (
    W := torch.randn(16, 32), x := torch.randn(4, 32),
    y := int8_matmul(x, *quantize_per_channel(W)),
    ref := x.double() @ W.double().T,
    bool((y - ref).abs().max() < 0.05 * ref.abs().max())
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'All-zero row stays 0 (no NaN); 63.5 rounds half-to-even to 64',
        input: 'quantize_per_channel(torch.tensor([[0.0, 0.0], [1.0, -2.0]]))[0].tolist()',
        expected: '[[0, 0], [64, -127]]',
        hidden: true,
      },
      {
        id: '8',
        description: 'dequantize accepts a Python float scale',
        input: 'dequantize(torch.tensor([[1, -2], [127, 0]], dtype=torch.int8), 0.5).tolist()',
        expected: '[[0.5, -1.0], [63.5, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Every scheme is the same operation (divide by a scale, round, clamp, cast) applied to different groups: weight rows, the whole matrix, or activation rows.',
      'Per-row absmax: W.abs().max(dim=1).values; scales = torch.clamp(absmax, min=1e-8) / 127. Reuse one row helper for weights and activations.',
      'torch.clamp(torch.round(W / scales.unsqueeze(1)), -127, 127).to(torch.int8); dequantize with torch.as_tensor(scales, dtype=torch.float64).reshape(-1, 1) so a float also works.',
      'int8_matmul: quantize x per row, compute x_q.long() @ W_q.long().T (never multiply in int8), then multiply by x_scales.unsqueeze(1) * w_scales.unsqueeze(0).',
    ],
  },
};
