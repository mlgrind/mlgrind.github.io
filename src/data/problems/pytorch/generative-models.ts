import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../generative-models.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const generativeModelsPyTorch: Record<string, LanguageVariant> = {
  'vae-reparameterization': {
    note: "Sample eps with torch.randn_like. Don't use torch.distributions.Normal(...).rsample(), which does the trick for you. Hidden tests check that gradients flow to mu and log_var.",
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
      'std = torch.exp(0.5 * log_var)',
      'eps = torch.randn_like(std) is constant w.r.t. mu and log_var',
      'z = mu + std * eps lets autograd differentiate through the sample',
    ],
  },

  'vae-loss': {
    note: 'F.mse_loss is fine for the reconstruction term; write the KL term yourself with tensor ops.',
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
        (total_loss, recon_loss, kl_loss) as Python floats rounded to 4 decimals
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
      'Reconstruction: F.mse_loss(x_reconstructed, x) or ((x - x_reconstructed) ** 2).mean()',
      'KL per sample: -0.5 * (1 + log_var - mu**2 - log_var.exp()).sum(dim=1)',
      'Average the KL over the batch, then return Python floats with round(t.item(), 4)',
    ],
  },

  'diffusion-noise-schedule': {
    note: 'Use torch.linspace and torch.cumprod.',
    starterCode: `import torch

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    """
    Create linear noise schedule for diffusion.

    Args:
        T: Number of diffusion steps
        beta_start: Starting beta value
        beta_end: Ending beta value

    Returns:
        betas: Beta values (T,)
        alphas: Alpha values (T,)
        alpha_bars: Cumulative alpha product (T,)
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
      'torch.linspace(beta_start, beta_end, T) gives T evenly spaced betas',
      'alphas = 1 - betas',
      'torch.cumprod(alphas, dim=0) gives the running product',
    ],
  },

  'diffusion-forward': {
    note: 'Sample the noise with torch.randn_like. Tests check the formula exactly, so return the same noise you used.',
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
      'alpha_bar_t = alpha_bars[t]',
      'noise = torch.randn_like(x_0)',
      'x_t = torch.sqrt(alpha_bar_t) * x_0 + torch.sqrt(1 - alpha_bar_t) * noise',
    ],
  },

  'vqvae-quantization': {
    note: "Compute distances with tensor ops and pick codes with argmin. Don't use torch.cdist. For the losses, use .detach() as the stop-gradient.",
    starterCode: `import torch
import torch.nn.functional as F

def vq_quantize(z_e, codebook):
    """
    Vector quantization for VQ-VAE.

    Args:
        z_e: Encoder output (batch, H, W, embedding_dim)
        codebook: Embedding vectors (num_embeddings, embedding_dim)

    Returns:
        z_q: Quantized vectors (batch, H, W, embedding_dim)
        indices: Codebook indices used (batch, H, W), int64
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
      'Reshape z_e to (batch*H*W, D) to compute all distances at once',
      'Distances: (z**2).sum(1, keepdim=True) + (codebook**2).sum(1) - 2 * z @ codebook.T',
      'distances.argmin(dim=1) gives indices; codebook[indices] gives z_q',
      'Losses: F.mse_loss(z_q, z_e.detach()) and beta * F.mse_loss(z_e, z_q.detach())',
    ],
  },

  'kl-divergence': {
    note: 'Inputs are scalar tensors. Write the closed form with torch.log; return a Python float.',
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
      'KL = log(sigma_q / sigma_p) + (sigma_p**2 + (mu_p - mu_q)**2) / (2 * sigma_q**2) - 0.5',
      'torch.log works on scalar tensors',
      'Return round(kl.item(), 4)',
    ],
  },
};
