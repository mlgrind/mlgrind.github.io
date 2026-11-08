// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/generative-models.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const generativeModelPyTorchPending: Record<string, unknown> = {
  'ddpm-sampling-step': {
    note: 'Use torch.cumprod for ᾱ and torch.sqrt; t is a Python int. Return a tensor.',
    starterCode: `import torch

def ddpm_step(x_t: torch.Tensor, eps_pred: torch.Tensor, t: int,
              betas: torch.Tensor, z: torch.Tensor) -> torch.Tensor:
    """
    One reverse DDPM step with sigma_t^2 = beta_t.

    Args:
        x_t: current noisy sample
        eps_pred: predicted noise ε_θ(x_t, t), same shape as x_t
        t: timestep (int, 0-indexed into betas)
        betas: (T,) noise schedule
        z: standard normal noise, same shape as x_t (ignored at t = 0)

    Returns:
        x_{t-1}, same shape as x_t
    """
    # Your code here
    pass
`,
    solution: `import torch

def ddpm_step(x_t: torch.Tensor, eps_pred: torch.Tensor, t: int,
              betas: torch.Tensor, z: torch.Tensor) -> torch.Tensor:
    x_t, eps_pred, betas = x_t.double(), eps_pred.double(), betas.double()
    alphas = 1.0 - betas
    alpha_bar = torch.cumprod(alphas, dim=0)

    mean = (x_t - betas[t] / torch.sqrt(1.0 - alpha_bar[t]) * eps_pred) / torch.sqrt(alphas[t])
    if t == 0:
        return mean                              # last step: no noise
    return mean + torch.sqrt(betas[t]) * z.double()  # sigma_t^2 = beta_t
`,
    testCases: [
      {
        id: '1',
        description: 'Step at t = 2 adds sigma_t * z',
        input: 'torch.round(ddpm_step(torch.tensor([1.0, -0.5]), torch.tensor([0.2, 0.4]), 2, torch.tensor([0.1, 0.2, 0.3]), torch.tensor([0.5, -1.0])), decimals=4).tolist()',
        expected: '[1.3673, -1.349]',
        hidden: false,
      },
      {
        id: '2',
        description: 'No noise at t = 0',
        input: `(lambda: (
    a := ddpm_step(torch.tensor([1.0, -0.5]), torch.tensor([0.2, 0.4]), 0, torch.tensor([0.1, 0.2, 0.3]), torch.tensor([0.5, -1.0])),
    b := ddpm_step(torch.tensor([1.0, -0.5]), torch.tensor([0.2, 0.4]), 0, torch.tensor([0.1, 0.2, 0.3]), torch.tensor([9.0, 9.0])),
    ([round(v, 4) for v in a.tolist()], bool(torch.allclose(a, b)))
)[-1])()`,
        expected: '([0.9874, -0.6604], True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Middle step on a 2-D sample (values)',
        input: '(lambda r: [[round(v, 4) for v in row] for row in r.tolist()])(ddpm_step(torch.tensor([[0.3, -1.2], [2.0, 0.0]]), torch.tensor([[1.0, -0.5], [0.1, 0.8]]), 1, torch.linspace(0.05, 0.25, 4, dtype=torch.float64), torch.tensor([[0.2, 0.2], [-0.3, 1.5]])))',
        expected: '[[0.078, -1.0537], [1.9946, 0.2647]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'With the true noise, the final step recovers x exactly',
        input: `(lambda: (
    x0 := torch.randn(3, 4, dtype=torch.float64), eps := torch.randn(3, 4, dtype=torch.float64),
    betas := torch.linspace(1e-4, 0.02, 50, dtype=torch.float64),
    x1 := torch.sqrt(1 - betas[0]) * x0 + torch.sqrt(betas[0]) * eps,
    bool(torch.allclose(ddpm_step(x1, eps, 0, betas, torch.randn(3, 4)), x0))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'alphas = 1 - betas; alpha_bar = torch.cumprod(alphas, dim=0)',
      'mean = (x_t - betas[t] / torch.sqrt(1 - alpha_bar[t]) * eps_pred) / torch.sqrt(alphas[t])',
      'Return mean when t == 0, otherwise mean + torch.sqrt(betas[t]) * z',
    ],
  },
  'classifier-free-guidance': {
    note: 'Pure tensor arithmetic; torch.cumprod for ᾱ. Return tensors.',
    starterCode: `import torch

def guided_noise(eps_uncond: torch.Tensor, eps_cond: torch.Tensor, w: float) -> torch.Tensor:
    """eps_uncond + w * (eps_cond - eps_uncond)"""
    # Your code here
    pass


def cfg_step(x_t, eps_uncond, eps_cond, w, t, betas, z):
    """
    One DDPM reverse step using the guided noise prediction.

    Args:
        x_t: current sample
        eps_uncond, eps_cond: unconditional / conditional noise predictions
        w: guidance scale
        t: timestep (int, 0-indexed into betas)
        betas: (T,) noise schedule tensor
        z: standard normal noise (ignored at t = 0)

    Returns:
        x_{t-1}
    """
    # Your code here
    pass
`,
    solution: `import torch

def guided_noise(eps_uncond: torch.Tensor, eps_cond: torch.Tensor, w: float) -> torch.Tensor:
    return eps_uncond + w * (eps_cond - eps_uncond)


def cfg_step(x_t, eps_uncond, eps_cond, w, t, betas, z):
    eps = guided_noise(eps_uncond.double(), eps_cond.double(), w)
    x_t, betas = x_t.double(), betas.double()

    alphas = 1.0 - betas
    alpha_bar = torch.cumprod(alphas, dim=0)
    mean = (x_t - betas[t] / torch.sqrt(1.0 - alpha_bar[t]) * eps) / torch.sqrt(alphas[t])

    if t == 0:
        return mean
    return mean + torch.sqrt(betas[t]) * z.double()
`,
    testCases: [
      {
        id: '1',
        description: 'Guidance scale 3 (values)',
        input: 'torch.round(guided_noise(torch.tensor([0.1, -0.2], dtype=torch.float64), torch.tensor([0.3, 0.2], dtype=torch.float64), 3.0), decimals=6).tolist()',
        expected: '[0.7, 1.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'w = 1 gives the conditional and w = 0 the unconditional prediction',
        input: `(lambda: (
    u := torch.randn(2, 3), c := torch.randn(2, 3),
    (bool(torch.allclose(guided_noise(u, c, 1.0), c)), bool(torch.allclose(guided_noise(u, c, 0.0), u)))
)[-1])()`,
        expected: '(True, True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Guided sampling step (values)',
        input: '(lambda r: [round(v, 4) for v in r.tolist()])(cfg_step(torch.tensor([0.5, -1.0, 2.0]), torch.tensor([0.1, 0.0, -0.3]), torch.tensor([0.4, -0.2, 0.1]), 7.5, 3, torch.linspace(0.01, 0.1, 5, dtype=torch.float64), torch.tensor([1.0, -0.5, 0.25])))',
        expected: '[0.3322, -0.8824, 1.6156]',
        hidden: true,
      },
      {
        id: '4',
        description: 'With w = 1 the unconditional prediction has no effect; t = 0 adds no noise',
        input: `(lambda: (
    x := torch.randn(4, dtype=torch.float64), c := torch.randn(4, dtype=torch.float64),
    betas := torch.linspace(0.01, 0.2, 6, dtype=torch.float64),
    a := cfg_step(x, torch.randn(4), c, 1.0, 4, betas, torch.ones(4)),
    b := cfg_step(x, torch.randn(4) * 10, c, 1.0, 4, betas, torch.ones(4)),
    e := cfg_step(x, torch.zeros(4), c, 2.0, 0, betas, torch.randn(4)),
    (bool(torch.allclose(a, b)), bool(torch.allclose(e, (x - betas[0] / torch.sqrt(betas[0]) * 2 * c) / torch.sqrt(1 - betas[0]))))
)[-1])()`,
        expected: '(True, True)',
        hidden: true,
      },
    ],
    hints: [
      'guided = eps_uncond + w * (eps_cond - eps_uncond)',
      'alphas = 1 - betas; alpha_bar = torch.cumprod(alphas, dim=0)',
      'mean = (x_t - betas[t] / torch.sqrt(1 - alpha_bar[t]) * guided) / torch.sqrt(alphas[t]); add torch.sqrt(betas[t]) * z only if t > 0',
    ],
  },
  'flow-matching': {
    note: 'F.mse_loss is fine for the loss (the point is the path and the target). Return the loss as a Python float; velocity_fn receives a tensor x and a Python float t.',
    starterCode: `import torch
import torch.nn.functional as F

def flow_matching_loss(x0: torch.Tensor, x1: torch.Tensor, t: torch.Tensor, v_pred: torch.Tensor) -> dict:
    """
    Conditional flow matching with straight paths.

    Args:
        x0: (B, ...) noise samples
        x1: (B, ...) data samples
        t: (B,) times in [0, 1]
        v_pred: (B, ...) predicted velocities at (x_t, t)

    Returns:
        dict with 'x_t', 'target' (same shape as x0) and 'loss' (Python float)
    """
    # Your code here
    pass


def euler_step(x_t: torch.Tensor, v: torch.Tensor, dt: float) -> torch.Tensor:
    """One Euler step: x_t + dt * v"""
    # Your code here
    pass


def euler_sample(x0: torch.Tensor, velocity_fn, n_steps: int) -> torch.Tensor:
    """Integrate dx/dt = velocity_fn(x, t) from t = 0 to 1 with n_steps Euler steps."""
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def flow_matching_loss(x0: torch.Tensor, x1: torch.Tensor, t: torch.Tensor, v_pred: torch.Tensor) -> dict:
    t = t.view(-1, *([1] * (x0.dim() - 1)))     # broadcast over non-batch dims
    x_t = (1 - t) * x0 + t * x1                  # straight path from noise to data
    target = x1 - x0                             # its constant velocity
    loss = F.mse_loss(v_pred, target)
    return {'x_t': x_t, 'target': target, 'loss': loss.item()}


def euler_step(x_t: torch.Tensor, v: torch.Tensor, dt: float) -> torch.Tensor:
    return x_t + dt * v


def euler_sample(x0: torch.Tensor, velocity_fn, n_steps: int) -> torch.Tensor:
    x = x0
    dt = 1.0 / n_steps
    for i in range(n_steps):
        x = euler_step(x, velocity_fn(x, i * dt), dt)
    return x
`,
    testCases: [
      {
        id: '1',
        description: 'Interpolated points and target velocity',
        input: `(lambda r: (r['x_t'].tolist(), r['target'].tolist()))(flow_matching_loss(
    torch.tensor([[0.0, 0.0], [1.0, 1.0]]), torch.tensor([[2.0, 4.0], [3.0, -1.0]]), torch.tensor([0.25, 0.5]), torch.zeros(2, 2)))`,
        expected: '([[0.5, 1.0], [2.0, 0.0]], [[2.0, 4.0], [2.0, -2.0]])',
        hidden: false,
      },
      {
        id: '2',
        description: 'One Euler step',
        input: 'euler_step(torch.tensor([1.0, -2.0]), torch.tensor([0.5, 4.0]), 0.25).tolist()',
        expected: '[1.125, -1.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'MSE loss on image-shaped tensors with per-example t (values)',
        input: `(lambda: (
    x0 := torch.arange(16, dtype=torch.float64).reshape(2, 2, 2, 2) / 10, x1 := torch.ones(2, 2, 2, 2, dtype=torch.float64),
    v := torch.full((2, 2, 2, 2), 0.3, dtype=torch.float64),
    r := flow_matching_loss(x0, x1, torch.tensor([0.1, 0.9], dtype=torch.float64), v),
    (round(r['loss'], 6), [round(a, 4) for a in r['x_t'][1, 0, 0].tolist()])
)[-1])()`,
        expected: '(0.215, [0.98, 0.99])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Euler sampling: exact straight field lands on the data; v = -x decays as (1 - 1/n)^n',
        input: `(lambda: (
    x0 := torch.randn(3, 2), x1 := torch.randn(3, 2),
    a := euler_sample(x0, lambda x, t: x1 - x0, 1),
    b := euler_sample(torch.tensor([2.0]), lambda x, t: -x, 4),
    c := euler_sample(torch.tensor([0.0]), lambda x, t: torch.tensor([t]), 4),
    (bool(torch.allclose(a, x1, atol=1e-6)), round(b[0].item(), 6), round(c[0].item(), 6))
)[-1])()`,
        expected: '(True, 0.632812, 0.375)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Endpoints: t = 0 gives the noise, t = 1 gives the data; perfect prediction has zero loss',
        input: `(lambda: (
    x0 := torch.randn(2, 5), x1 := torch.randn(2, 5),
    r := flow_matching_loss(x0, x1, torch.tensor([0.0, 1.0]), x1 - x0),
    (bool(torch.allclose(r['x_t'][0], x0[0]) and torch.allclose(r['x_t'][1], x1[1])), r['loss'])
)[-1])()`,
        expected: '(True, 0.0)',
        hidden: true,
      },
    ],
    hints: [
      'Reshape t with t.view(-1, *([1] * (x0.dim() - 1)))',
      'x_t = (1 - t) * x0 + t * x1 and target = x1 - x0',
      'loss = F.mse_loss(v_pred, target).item()',
      'euler_sample: dt = 1 / n_steps; for i in range(n_steps): x = euler_step(x, velocity_fn(x, i * dt), dt)',
    ],
  },
};
