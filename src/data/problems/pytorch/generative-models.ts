import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../generative-models.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const generativeModelsPyTorch: Record<string, LanguageVariant> = {
  'vae-reparameterization': {
    note: 'Sample eps with torch.randn_like; don\'t use torch.distributions.Normal(...).rsample(), which does the trick for you. Hidden tests check that gradients reach mu and log_var.',
    starterCode: `import torch

def reparameterize(mu, log_var):
    """
    Sample from latent distribution using reparameterization trick.

    Args:
        mu: Mean of latent distribution (batch, latent_dim)
        log_var: Log variance of latent distribution (batch, latent_dim)

    Returns:
        z: Sampled latent vectors (batch, latent_dim), differentiable w.r.t. mu and log_var
    """
    torch.manual_seed(42)  # For reproducibility
    # Your code here
    pass
`,
    solution: `import torch

def reparameterize(mu, log_var):
    torch.manual_seed(42)
    std = torch.exp(0.5 * log_var)
    # The randomness lives in eps, which does not depend on mu or log_var
    eps = torch.randn_like(std)
    return mu + std * eps
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'reparameterize(torch.zeros(2, 4), torch.zeros(2, 4)).shape',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Samples have mean mu and std exp(0.5 * log_var)',
        input: `(lambda: (
            z := reparameterize(torch.full((20000, 1), 2.0), torch.full((20000, 1), 1.3862944)),
            bool(abs(z.mean().item() - 2.0) < 0.1 and abs(z.std().item() - 2.0) < 0.1)
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Zero variance returns mu exactly',
        input: 'bool(torch.allclose(reparameterize(torch.ones(3, 5), torch.full((3, 5), -1000.0)), torch.ones(3, 5)))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Gradients flow: dz/dmu = 1 and dz/dlog_var = 0.5 * std * eps',
        input: `(lambda: (
            mu := torch.zeros(2, 3, requires_grad=True),
            lv := torch.tensor([[0.0, 1.0, -1.0], [0.5, 0.0, 2.0]], requires_grad=True),
            z := reparameterize(mu, lv),
            z.sum().backward(),
            bool(torch.allclose(mu.grad, torch.ones(2, 3)) and torch.allclose(lv.grad, 0.5 * (z - mu).detach(), atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Autograd can differentiate through mu and log_var only if the random draw does not depend on them.',
      'Turn log_var into a standard deviation, draw unit noise of the same shape, then shift and scale it.',
      'std = torch.exp(0.5 * log_var); eps = torch.randn_like(std); return mu + std * eps.',
      'Pitfall: don\'t wrap eps in requires_grad or detach mu; and torch.exp(log_var) is the variance, not the std.',
    ],
  },

  'vae-loss': {
    note: 'F.mse_loss is fine for the reconstruction term; write the KL with tensor ops (no torch.distributions.kl_divergence). KL sums over latent dims and averages over the batch.',
    starterCode: `import torch
import torch.nn.functional as F

def vae_loss(x, x_reconstructed, mu, log_var):
    """
    Compute VAE loss (negative ELBO).

    Args:
        x: Original input (batch, features)
        x_reconstructed: Reconstructed input (batch, features)
        mu: Latent mean (batch, latent_dim)
        log_var: Latent log variance (batch, latent_dim)

    Returns:
        (total_loss, recon_loss, kl_loss): Python floats rounded to 4 decimals.
        recon_loss is the MSE over all elements; kl_loss sums over latent dims
        and averages over the batch; total_loss = recon_loss + kl_loss.
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def vae_loss(x, x_reconstructed, mu, log_var):
    # Reconstruction loss (MSE, mean over all elements)
    recon_loss = F.mse_loss(x_reconstructed, x)

    # KL(q(z|x) || N(0, I)): sum over latent dims, mean over batch
    kl_loss = (-0.5 * (1 + log_var - mu.pow(2) - log_var.exp()).sum(dim=1)).mean()

    total_loss = recon_loss + kl_loss
    return round(total_loss.item(), 4), round(recon_loss.item(), 4), round(kl_loss.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect case',
        input: 'vae_loss(torch.zeros(2, 4), torch.zeros(2, 4), torch.zeros(2, 2), torch.zeros(2, 2))',
        expected: '(0.0, 0.0, 0.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Non-zero reconstruction and KL',
        input: 'vae_loss(torch.tensor([[1.0, 2.0]]), torch.zeros(1, 2), torch.tensor([[0.5, -0.5]]), torch.tensor([[0.0, 1.0]]))',
        expected: '(3.1091, 2.5, 0.6091)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Non-zero KL',
        input: 'vae_loss(torch.zeros(1, 4), torch.zeros(1, 4), torch.ones(1, 2), torch.zeros(1, 2))',
        expected: '(1.0, 0.0, 1.0)',
        hidden: true,
      },
      {
        id: '4',
        description: 'KL sums over latent dims and averages over the batch',
        input: 'vae_loss(torch.zeros(2, 3), torch.zeros(2, 3), torch.tensor([[1.0, 1.0], [0.0, 0.0]]), torch.zeros(2, 2))',
        expected: '(0.5, 0.0, 0.5)',
        hidden: true,
      },
    ],
    hints: [
      'Two terms: the reconstruction error of the decoder and the closed-form KL of each posterior from N(0, I).',
      'Reconstruction is a mean over all elements; the KL is one number per example (summed over latent dims), then averaged over the batch.',
      'F.mse_loss(x_reconstructed, x); (-0.5 * (1 + log_var - mu.pow(2) - log_var.exp()).sum(dim=1)).mean().',
      'Pitfall: .mean() over the whole KL tensor also divides by latent_dim. Return Python floats: round(t.item(), 4).',
    ],
  },

  'diffusion-noise-schedule': {
    note: 'Use torch.linspace and torch.cumprod (dim=0).',
    starterCode: `import torch

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    """
    Create the linear DDPM noise schedule (0-indexed timesteps).

    Args:
        T: Number of diffusion steps (int)
        beta_start: beta_0
        beta_end: beta_{T-1}

    Returns:
        (betas, alphas, alpha_bars): float tensors of shape (T,), where
        alphas = 1 - betas and alpha_bars is the cumulative product of alphas
    """
    # Your code here
    pass
`,
    solution: `import torch

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    betas = torch.linspace(beta_start, beta_end, T)
    alphas = 1 - betas
    alpha_bars = torch.cumprod(alphas, dim=0)
    return betas, alphas, alpha_bars
`,
    testCases: [
      {
        id: '1',
        description: 'Beta range correct',
        input: 'linear_noise_schedule(100, 0.0001, 0.02)[0].shape',
        expected: '(100,)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Small schedule values (hand-computed)',
        input: `(lambda: (
            s := linear_noise_schedule(3, 0.1, 0.3),
            bool(torch.allclose(s[0], torch.tensor([0.1, 0.2, 0.3])) and torch.allclose(s[1], torch.tensor([0.9, 0.8, 0.7])) and torch.allclose(s[2], torch.tensor([0.9, 0.72, 0.504])))
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Alpha bar decreases - last < first',
        input: 'bool(linear_noise_schedule(50, 0.001, 0.01)[2][-1] < linear_noise_schedule(50, 0.001, 0.01)[2][0])',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Standard DDPM schedule endpoints',
        input: `(lambda: (
            s := linear_noise_schedule(1000),
            bool(abs(s[0][0].item() - 0.0001) < 1e-7 and abs(s[0][-1].item() - 0.02) < 1e-7 and abs(s[2][-1].item() - 4.036e-05) < 1e-6)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'β grows linearly from beta_start to beta_end with both endpoints included; everything else derives from it.',
      'Build betas, then alphas = 1 − betas, then the running product of alphas.',
      'torch.linspace(beta_start, beta_end, T), 1 - betas, torch.cumprod(alphas, dim=0).',
      'Pitfall: torch.arange with a float step drops the endpoint and drifts; torch.cumprod needs dim=0.',
    ],
  },

  'diffusion-forward': {
    note: 'Sample the noise with torch.randn_like after the seed in the starter. Tests check the formula against the noise you return, so return the same tensor you used.',
    starterCode: `import torch

def diffusion_forward(x_0, t, alpha_bars):
    """
    Add noise to data using forward diffusion.

    Args:
        x_0: Original data (batch, ...)
        t: Timestep (int)
        alpha_bars: Cumulative alpha products (T,)

    Returns:
        x_t: Noisy data at timestep t
        noise: The noise that was added
    """
    torch.manual_seed(42)
    # Your code here
    pass
`,
    solution: `import torch

def diffusion_forward(x_0, t, alpha_bars):
    torch.manual_seed(42)

    alpha_bar_t = alpha_bars[t]
    noise = torch.randn_like(x_0)

    # x_t = sqrt(alpha_bar_t) * x_0 + sqrt(1 - alpha_bar_t) * noise
    x_t = torch.sqrt(alpha_bar_t) * x_0 + torch.sqrt(1 - alpha_bar_t) * noise
    return x_t, noise
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'diffusion_forward(torch.ones(2, 4), 50, torch.linspace(0.99, 0.01, 100))[0].shape',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'x_t = sqrt(alpha_bar_t) * x_0 + sqrt(1 - alpha_bar_t) * noise',
        input: `(lambda: (
            x0 := torch.randn(2, 4), ab := torch.linspace(0.99, 0.01, 100),
            r := diffusion_forward(x0, 50, ab),
            bool(torch.allclose(r[0], ab[50].sqrt() * x0 + (1 - ab[50]).sqrt() * r[1], atol=1e-6))
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Noise shape matches input',
        input: 'diffusion_forward(torch.ones(3, 5), 10, torch.linspace(0.99, 0.01, 100))[1].shape',
        expected: '(3, 5)',
        hidden: true,
      },
      {
        id: '4',
        description: 'alpha_bar = 1 keeps x_0; alpha_bar = 0 gives pure noise',
        input: `(lambda: (
            x0 := torch.randn(4, 3), ab := torch.tensor([1.0, 0.0]),
            r0 := diffusion_forward(x0, 0, ab), r1 := diffusion_forward(x0, 1, ab),
            bool(torch.allclose(r0[0], x0) and torch.allclose(r1[0], r1[1]))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Noise is standard normal',
        input: `(lambda: (
            n := diffusion_forward(torch.zeros(100, 100), 0, torch.tensor([0.5]))[1],
            bool(abs(n.mean().item()) < 0.05 and abs(n.std().item() - 1.0) < 0.05)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'All the noise added up to step t is summarised by the single number alpha_bars[t]; no loop over steps.',
      'Look up ᾱ_t, draw ε shaped like x_0, then mix signal and noise.',
      'noise = torch.randn_like(x_0); x_t = torch.sqrt(ab) * x_0 + torch.sqrt(1 - ab) * noise.',
      'Pitfall: the coefficients are square roots (ᾱ and 1 − ᾱ are variances).',
    ],
  },

  'vqvae-quantization': {
    note: 'Compute distances with tensor ops and pick codes with argmin; don\'t use torch.cdist. Use .detach() as the stop-gradient sg[·] in the losses.',
    starterCode: `import torch
import torch.nn.functional as F

def vq_quantize(z_e, codebook):
    """
    Vector quantization for VQ-VAE.

    Args:
        z_e: Encoder output (batch, H, W, embedding_dim)
        codebook: Embedding vectors (num_embeddings, embedding_dim)

    Returns:
x; ties go to the lowest index
    """
    # Your code here
    pass


def vq_loss(z_e, z_q, beta=0.25):
    """
    Compute VQ-VAE losses (codebook + commitment).

    Args:
        z_e: Encoder output (batch, H, W, embedding_dim)
        z_q: Quantized vectors (batch, H, W, embedding_dim)
        beta: Commitment loss weight (default: 0.25)

    Returns:
        codebook_loss: Loss to update codebook (Python float, rounded to 4 decimals)
        commitment_loss: Loss to commit encoder to codebook (Python float, rounded to 4 decimals)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def vq_quantize(z_e, codebook):
    batch, H, W, D = z_e.shape

    # Flatten spatial dimensions: (N, D)
    z_flat = z_e.reshape(-1, D)

    # ||a - b||^2 = ||a||^2 + ||b||^2 - 2 a.b, for every (vector, code) pair: (N, K)
    distances = (z_flat ** 2).sum(dim=1, keepdim=True) + (codebook ** 2).sum(dim=1) - 2 * z_flat @ codebook.T

    indices_flat = distances.argmin(dim=1)
    z_q = codebook[indices_flat].reshape(batch, H, W, D)
    return z_q, indices_flat.reshape(batch, H, W)


def vq_loss(z_e, z_q, beta=0.25):
    # Codebook loss: ||sg[z_e] - z_q||^2 moves the codes toward the encoder output
    codebook_loss = F.mse_loss(z_q, z_e.detach())
    # Commitment loss: ||z_e - sg[z_q]||^2 keeps the encoder close to its codes
    commitment_loss = beta * F.mse_loss(z_e, z_q.detach())
    return round(codebook_loss.item(), 4), round(commitment_loss.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'z_q output shape matches input',
        input: 'vq_quantize(torch.randn(2, 4, 4, 8), torch.randn(16, 8))[0].shape',
        expected: '(2, 4, 4, 8)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Nearest codes picked (hand-computed)',
        input: 'vq_quantize(torch.tensor([[[[1.0, 1.0], [9.0, 8.0], [4.0, 6.0]]]]), torch.tensor([[0.0, 0.0], [10.0, 10.0], [5.0, 5.0]]))[1].tolist()',
        expected: '[[[0, 1, 2]]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'VQ losses (hand-computed)',
        input: 'vq_loss(torch.tensor([[1.0, 1.0], [9.0, 8.0]]), torch.tensor([[0.0, 0.0], [10.0, 10.0]]), 0.25)',
        expected: '(1.75, 0.4375)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Indices match a brute-force nearest-neighbour search',
        input: `(lambda: (
            z := torch.randn(2, 3, 3, 4), cb := torch.randn(8, 4),
            bool(torch.equal(vq_quantize(z, cb)[1], ((z.unsqueeze(-2) - cb) ** 2).sum(dim=-1).argmin(dim=-1)))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Quantized vectors are rows of the codebook',
        input: `(lambda: (
            z := torch.randn(2, 4, 4, 8), cb := torch.randn(16, 8),
            q := vq_quantize(z, cb),
            bool(torch.allclose(q[0], cb[q[1]]))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Quantization is a nearest-neighbour lookup of every encoder vector in the codebook.',
      'Flatten z_e to (N, D), build an (N, K) squared-distance matrix, argmin per row, index the codebook, reshape back.',
      '(z**2).sum(1, keepdim=True) - 2 * z @ codebook.T + (codebook**2).sum(1); distances.argmin(dim=1); codebook[idx].',
      'Pitfall: put .detach() on the right side: F.mse_loss(z_q, z_e.detach()) trains the codes, beta * F.mse_loss(z_e, z_q.detach()) trains the encoder.',
    ],
  },

  'kl-divergence': {
    note: 'Inputs are scalar tensors. Write the closed form with torch.log (no torch.distributions); return a Python float.',
    starterCode: `import torch

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    """
    Compute KL divergence between two Gaussians.

    Args:
        mu_p, sigma_p: Mean and std of P (scalar tensors)
        mu_q, sigma_q: Mean and std of Q (scalar tensors)

    Returns:
        kl: KL(P || Q) as a Python float rounded to 4 decimals
    """
    # Your code here
    pass
`,
    solution: `import torch

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    term1 = torch.log(sigma_q / sigma_p)
    term2 = (sigma_p ** 2 + (mu_p - mu_q) ** 2) / (2 * sigma_q ** 2)
    kl = term1 + term2 - 0.5
    return round(kl.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Same distribution',
        input: 'kl_divergence_gaussian(torch.tensor(0.0), torch.tensor(1.0), torch.tensor(0.0), torch.tensor(1.0))',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Different means',
        input: 'kl_divergence_gaussian(torch.tensor(1.0), torch.tensor(1.0), torch.tensor(0.0), torch.tensor(1.0))',
        expected: '0.5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Different variances',
        input: 'kl_divergence_gaussian(torch.tensor(0.0), torch.tensor(2.0), torch.tensor(0.0), torch.tensor(1.0))',
        expected: '0.8069',
        hidden: true,
      },
      {
        id: '4',
        description: 'Not symmetric: KL(Q || P) for the previous pair',
        input: 'kl_divergence_gaussian(torch.tensor(0.0), torch.tensor(1.0), torch.tensor(0.0), torch.tensor(2.0))',
        expected: '0.3181',
        hidden: true,
      },
    ],
    hints: [
      'KL compares a width ratio and a mean gap, both measured relative to Q.',
      'Three terms: a log ratio of standard deviations, a squared term over 2σ_q², and the constant −1/2.',
      'torch.log(sigma_q / sigma_p) + (sigma_p**2 + (mu_p - mu_q)**2) / (2 * sigma_q**2) - 0.5.',
      'Pitfall: the sigmas are standard deviations, not variances. Return round(kl.item(), 4).',
    ],
  },
  // Ported with the new problems from the ML Coding Lab fork.
  'ddpm-sampling-step': {
    note: 'Use torch.cumprod for ᾱ and torch.sqrt; t is a Python int. Return a tensor. The reference works in float64 so values match the NumPy track.',
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
      'A deterministic mean that strips out the predicted noise, then fresh noise except at the final step.',
      'Compute alphas and alpha_bar from betas, then the mean, then branch on t == 0.',
      'alpha_bar = torch.cumprod(1 - betas, dim=0); mean = (x_t - betas[t] / torch.sqrt(1 - alpha_bar[t]) * eps_pred) / torch.sqrt(1 - betas[t]).',
      'Pitfall: the noise coefficient uses 1 − ᾱ_t (cumulative) but the outer division uses α_t; add torch.sqrt(betas[t]) * z only when t > 0.',
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
      'Guidance extrapolates from the unconditional prediction through the conditional one; check that w = 0 and w = 1 give the two inputs.',
      'Write guided_noise first, then call it inside cfg_step and run the ordinary DDPM step.',
      'eps_uncond + w * (eps_cond - eps_uncond); alpha_bar = torch.cumprod(1 - betas, dim=0).',
      'Pitfall: add torch.sqrt(betas[t]) * z only when t > 0; w = 1 means no guidance.',
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
      'On a straight line from x0 to x1, the velocity is constant in t.',
      'flow_matching_loss: broadcast t, interpolate, form the target, MSE. euler_sample: loop over steps calling euler_step.',
      't.view(-1, *([1] * (x0.dim() - 1))); (1 - t) * x0 + t * x1; target = x1 - x0; F.mse_loss(v_pred, target).item().',
      'Pitfall: step i uses time i * dt (start of the interval); an un-reshaped (B,) t broadcasts against the last axis, not the batch.',
    ],
  },
};
