// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/post-training.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const postTrainingPyTorchPending: Record<string, unknown> = {
  'grpo-advantages': {
    note: "Pure tensor ops. Use the population std (r.std(dim=1, unbiased=False, keepdim=True)); torch's default std is unbiased and gives different advantages. Return Python floats for the scalars.",
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
        dict with 'advantages' (B, G) tensor, 'objective', 'loss', 'mean_kl' (Python floats)
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
    ],
    hints: [
      'Advantages: (r - r.mean(dim=1, keepdim=True)) / (r.std(dim=1, unbiased=False, keepdim=True) + eps)',
      'adv.unsqueeze(-1) broadcasts the per-response advantage over tokens',
      'k3 KL: d = ref_logp - logp; kl = torch.exp(d) - d - 1',
      'Per response: (x * mask).sum(-1) / mask.sum(-1), then .mean(); return .item() for the scalars',
    ],
  },
  'int8-quantization': {
    note: 'Use torch.round, torch.clamp and .to(torch.int8). Accumulate the int8 matmul in an integer dtype (.long()) and rescale afterwards.',
    starterCode: `import torch

def quantize_per_channel(W: torch.Tensor):
    """Returns (W_q int8 (d_out, d_in), scales (d_out,)) with one scale per row."""
    # Your code here
    pass


def quantize_per_tensor(W: torch.Tensor):
    """Returns (W_q int8, scale float) with one scale for the whole matrix."""
    # Your code here
    pass


def dequantize(W_q: torch.Tensor, scales):
    """W_q * scale; scales is a (d_out,) tensor (per row) or a Python float."""
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
    """Returns {'per_channel_error': float, 'per_tensor_error': float}."""
    # Your code here
    pass
`,
    solution: `import torch

def _absmax_quantize_rows(M):
    absmax = M.abs().max(dim=1).values
    scales = torch.clamp(absmax, min=1e-8) / 127.0
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
    ],
    hints: [
      'Per-row absmax: W.abs().max(dim=1).values; scales = torch.clamp(absmax, min=1e-8) / 127',
      'torch.clamp(torch.round(W / scales.unsqueeze(1)), -127, 127).to(torch.int8)',
      'int8_matmul: quantize x per row, then x_q.long() @ W_q.long().T, and multiply by both scales',
    ],
  },
};
