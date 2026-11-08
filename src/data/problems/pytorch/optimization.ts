import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../optimization.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const optimizationPyTorch: Record<string, LanguageVariant> = {
  // Ported with the new problems from the ML Coding Lab fork.
  'gradient-clipping': {
    note: "Implement it with tensor ops (torch.stack, .norm(), *); don't call torch.nn.utils.clip_grad_norm_. The hidden tests compare your result with it.",
    starterCode: `import torch

def clip_grad_norm(grads: list, max_norm: float, eps: float = 1e-6):
    """
    Clip a list of gradient tensors by their global L2 norm.

    Args:
        grads: List of gradient tensors (any shapes)
        max_norm: Maximum allowed global norm
        eps: Small constant added to the norm (PyTorch uses 1e-6)

    Returns:
        (clipped_grads, total_norm): list of tensors, and the norm before
        clipping as a Python float
    """
    # Your code here
    pass
`,
    solution: `import torch

def clip_grad_norm(grads: list, max_norm: float, eps: float = 1e-6):
    """
    Clip a list of gradient tensors by their global L2 norm.
    """
    # Norm of the per-tensor norms == norm of everything concatenated
    total_norm = torch.stack([g.norm(2) for g in grads]).norm(2)
    clip_coef = max_norm / (total_norm + eps)
    clip_coef = torch.clamp(clip_coef, max=1.0)   # never scale up
    clipped = [g * clip_coef for g in grads]
    return clipped, total_norm.item()
`,
    testCases: [
      {
        id: '1',
        description: 'Single gradient above the threshold',
        input: '(lambda: (out := clip_grad_norm([torch.tensor([3.0, 4.0])], 1.0), [np.round(g.double().numpy(), 4).tolist() for g in out[0]], round(float(out[1]), 4))[1:])()',
        expected: '([[0.6, 0.8]], 5.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Below the threshold: unchanged',
        input: '(lambda: (out := clip_grad_norm([torch.tensor([1.0, 2.0]), torch.tensor([2.0])], 5.0), [g.tolist() for g in out[0]], round(float(out[1]), 4))[1:])()',
        expected: '([[1.0, 2.0], [2.0]], 3.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Global (not per-tensor) norm across a matrix and a vector',
        input: '(lambda: (out := clip_grad_norm([torch.tensor([[1.0, 2.0], [2.0, 4.0]]), torch.tensor([4.0, 0.0])], 2.0), [np.round(g.double().numpy(), 5).tolist() for g in out[0]], round(float(out[1]), 5))[1:])()',
        expected: '([[[0.31235, 0.62469], [0.62469, 1.24939]], [1.24939, 0.0]], 6.40312)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches torch.nn.utils.clip_grad_norm_ and leaves inputs untouched',
        input: `(lambda: (
    gs := [torch.randn(3, 4) * 5, torch.randn(7), torch.randn(2, 2, 2)],
    before := [g.clone() for g in gs],
    out := clip_grad_norm(gs, 0.5),
    ps := [torch.zeros(g.shape, requires_grad=True) for g in gs],
    [setattr(p, 'grad', g.clone()) for p, g in zip(ps, gs)],
    ref := torch.nn.utils.clip_grad_norm_(ps, 0.5),
    bool(abs(out[1] - ref.item()) < 1e-4),
    all(bool(torch.allclose(c, p.grad, atol=1e-6)) for c, p in zip(out[0], ps)),
    all(bool(torch.equal(a, b)) for a, b in zip(gs, before))
)[-3:])()`,
        expected: '(True, True, True)',
        hidden: true,
      },
    ],
    hints: [
      'torch.stack([g.norm(2) for g in grads]).norm(2) is the global norm (the norm of the per-tensor norms).',
      'clip_coef = max_norm / (total_norm + eps), clamped to at most 1 with torch.clamp(..., max=1.0).',
      'Return [g * clip_coef for g in grads] and total_norm.item().',
    ],
  },
  'loss-scaling': {
    note: "torch.amp.GradScaler needs a GPU and isn't in the browser shim, so implement its update rule by hand. This is the logic inside GradScaler.update().",
    starterCode: `import torch

def dynamic_loss_scale(overflows, init_scale=65536.0, growth_factor=2.0,
                       backoff_factor=0.5, growth_interval=2000) -> dict:
    """
    Simulate torch.amp.GradScaler's dynamic loss scale over a sequence of steps.

    Args:
        overflows: List of bools, True if that step's gradients had inf/nan
                   (what GradScaler detects with torch.isfinite on the grads)
        init_scale: Starting scale
        growth_factor: Multiplier after growth_interval good steps in a row
        backoff_factor: Multiplier after an overflow
        growth_interval: Number of consecutive good steps before growing

    Returns:
        dict with 'scales' (list of floats, scale used at each step),
        'skipped' (indices of skipped steps) and 'final_scale' (float)
    """
    # Your code here
    pass
`,
    solution: `import torch

def dynamic_loss_scale(overflows, init_scale=65536.0, growth_factor=2.0,
                       backoff_factor=0.5, growth_interval=2000) -> dict:
    """
    Simulate torch.amp.GradScaler's dynamic loss scale over a sequence of steps.

    In a real loop:  scaler.scale(loss).backward(); scaler.step(opt); scaler.update()
    scaler.step() skips opt.step() when the unscaled grads contain inf/nan,
    and scaler.update() applies the rule below.
    """
    scale = float(init_scale)
    growth_tracker = 0
    scales, skipped = [], []
    for i, found_inf in enumerate(overflows):
        scales.append(scale)
        if found_inf:
            skipped.append(i)
            scale *= backoff_factor
            growth_tracker = 0
        else:
            growth_tracker += 1
            if growth_tracker == growth_interval:
                scale *= growth_factor
                growth_tracker = 0
    return {'scales': scales, 'skipped': skipped, 'final_scale': scale}
`,
    testCases: [
      {
        id: '1',
        description: 'One overflow, then growth after 2 good steps',
        input: "(lambda: (r := dynamic_loss_scale([False, True, False, False, False], init_scale=8.0, growth_interval=2), r['scales'], r['skipped'], r['final_scale'])[1:])()",
        expected: '([8.0, 8.0, 4.0, 4.0, 8.0], [1], 8.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Consecutive overflows halve the scale each time',
        input: "(lambda: (r := dynamic_loss_scale([True, True, True], init_scale=1024.0), r['scales'], r['skipped'], r['final_scale'])[1:])()",
        expected: '([1024.0, 512.0, 256.0], [0, 1, 2], 128.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Overflow flags detected from gradients with torch.isfinite; counter resets',
        input: `(lambda: (
    grads := [torch.tensor([1.0, 2.0]), torch.tensor([float('inf'), 0.0]), torch.tensor([0.5, 0.5]),
              torch.tensor([0.1, float('nan')]), torch.tensor([3.0, 1.0]), torch.tensor([2.0, 2.0]), torch.tensor([1.0, 1.0])],
    flags := [not bool(torch.isfinite(g).all()) for g in grads],
    r := dynamic_loss_scale(flags, init_scale=32.0, growth_interval=3),
    r['scales'], r['skipped'], r['final_scale']
)[-3:])()`,
        expected: '([32.0, 32.0, 16.0, 16.0, 8.0, 8.0, 8.0], [1, 3], 16.0)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Custom factors over a long run',
        input: "(lambda: (r := dynamic_loss_scale([i % 7 == 6 for i in range(30)], init_scale=100.0, growth_factor=3.0, backoff_factor=0.25, growth_interval=4), r['scales'][-5:], r['skipped'], r['final_scale'])[1:])()",
        expected: '([126.5625, 126.5625, 126.5625, 31.640625, 31.640625], [6, 13, 20, 27], 31.640625)',
        hidden: true,
      },
    ],
  },
};
