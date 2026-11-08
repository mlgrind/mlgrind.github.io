import { Problem } from '../../types';

export const generativeModelProblems: Problem[] = [
  {
    id: 'vae-reparameterization',
    title: 'VAE Reparameterization Trick',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## VAE Reparameterization Trick

Implement the reparameterization trick that allows backpropagation through stochastic sampling in VAEs.

### The Problem
We want to sample z ~ N(μ, σ²), but sampling is not differentiable.

### The Solution
\`\`\`
ε ~ N(0, 1)
z = μ + σ * ε
\`\`\`

### Why It Works
- ε is sampled independently of parameters
- z is now a deterministic function of μ, σ, and ε
- Gradients can flow through μ and σ
    `,
    examples: [
      {
        input: 'mu = [0, 1], log_var = [0, 0]',
        output: 'z = mu + exp(0.5 * log_var) * epsilon',
        explanation: 'log_var=0 means σ=1',
      },
    ],
    starterCode: `import numpy as np

def reparameterize(mu, log_var):
    """
    Sample from latent distribution using reparameterization trick.

    Args:
        mu: Mean of latent distribution (batch, latent_dim)
        log_var: Log variance of latent distribution (batch, latent_dim)

    Returns:
        z: Sampled latent vectors (batch, latent_dim)
    """
    np.random.seed(42)  # For reproducibility
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'reparameterize(np.zeros((2, 4)), np.zeros((2, 4))).shape',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Zero variance case has correct shape',
        input: 'reparameterize(np.ones((3, 5)), np.full((3, 5), -1000)).shape',
        expected: '(3, 5)',
        hidden: true,
      },
      {
        id: '3',
        description: 'When log_var is very negative, z ≈ mu (sigma ≈ 0)',
        input: 'bool(np.allclose(reparameterize(np.array([[3.0, 4.0]]), np.full((1, 2), -100)), np.array([[3.0, 4.0]]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Verify reparameterization formula: z = mu + exp(0.5*log_var)*eps',
        input: `(lambda: (
    mu := np.zeros((2, 3)),
    log_var := np.ones((2, 3)),
    z := reparameterize(mu, log_var),
    np.random.seed(42),
    eps := np.random.randn(2, 3),
    expected := mu + np.exp(0.5 * log_var) * eps,
    bool(np.allclose(z, expected))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'When log_var=0, std=1, so z = mu + epsilon',
        input: `(lambda: (
    mu := np.array([[5.0, -3.0, 1.0]]),
    z := reparameterize(mu, np.zeros((1, 3))),
    np.random.seed(42),
    eps := np.random.randn(1, 3),
    bool(np.allclose(z, mu + eps))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'std = exp(0.5 * log_var)',
      'Sample epsilon from standard normal',
      'z = mu + std * epsilon',
    ],
    solution: `import numpy as np

def reparameterize(mu, log_var):
    np.random.seed(42)
    # Compute standard deviation
    std = np.exp(0.5 * log_var)
    # Sample epsilon from standard normal
    eps = np.random.randn(*mu.shape)
    # Reparameterization trick
    z = mu + std * eps
    return z
`,
  },
  {
    id: 'vae-loss',
    title: 'VAE Loss Function',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## VAE Loss (ELBO)

Implement the VAE loss function: reconstruction loss + KL divergence.

### Loss Components
\`\`\`
L = L_reconstruction + L_KL

L_reconstruction = MSE(x, x_reconstructed)
L_KL = -0.5 * sum(1 + log_var - mu² - exp(log_var))   # sum over latent dims, mean over batch
\`\`\`

### Intuition
- **Reconstruction loss**: Output should match input
- **KL divergence**: Latent distribution should be close to N(0,1)
    `,
    examples: [
      {
        input: 'Perfect reconstruction, mu=0, var=1',
        output: 'Loss ≈ 0',
        explanation: 'Both terms are minimized',
      },
    ],
    starterCode: `import numpy as np

def vae_loss(x, x_reconstructed, mu, log_var):
    """
    Compute VAE loss (negative ELBO).

    Args:
        x: Original input (batch, features)
        x_reconstructed: Reconstructed input (batch, features)
        mu: Latent mean (batch, latent_dim)
        log_var: Latent log variance (batch, latent_dim)

    Returns:
        total_loss: Combined loss
        recon_loss: Reconstruction loss
        kl_loss: KL divergence
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect case',
        input: 'bool(np.allclose(vae_loss(np.zeros((2, 4)), np.zeros((2, 4)), np.zeros((2, 2)), np.zeros((2, 2))), (0.0, 0.0, 0.0), atol=1e-6))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Non-zero KL',
        input: 'bool(np.allclose(vae_loss(np.zeros((1, 4)), np.zeros((1, 4)), np.ones((1, 2)), np.zeros((1, 2))), (1.0, 0.0, 1.0), atol=1e-4))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '3',
        description: 'Non-zero reconstruction loss',
        input: '(np.ones((1, 4)), np.zeros((1, 4)), np.zeros((1, 2)), np.zeros((1, 2)))',
        expected: '(1.0, 1.0, 0.0)',
        hidden: true,
      },
      {
        id: '4',
        description: 'KL is zero when mu=0, log_var=0 (standard normal)',
        input: 'vae_loss(np.zeros((2, 4)), np.zeros((2, 4)), np.zeros((2, 3)), np.zeros((2, 3)))[2]',
        expected: '0.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Total loss equals recon + KL',
        input: `(lambda: (
    result := vae_loss(np.ones((2, 4)), np.zeros((2, 4)), np.ones((2, 3)), np.ones((2, 3))),
    bool(abs(result[0] - (result[1] + result[2])) < 1e-4)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reconstruction: np.mean((x - x_reconstructed)²)',
      'KL: -0.5 * sum(1 + log_var - mu² - exp(log_var)) over the latent dims',
      'Average both terms over the batch',
    ],
    solution: `import numpy as np

def vae_loss(x, x_reconstructed, mu, log_var):
    # Reconstruction loss (MSE)
    recon_loss = np.mean((x - x_reconstructed) ** 2)

    # KL divergence
    kl_loss = -0.5 * np.mean(np.sum(1 + log_var - mu**2 - np.exp(log_var), axis=1))

    total_loss = recon_loss + kl_loss

    return round(total_loss, 4), round(recon_loss, 4), round(kl_loss, 4)
`,
  },
  {
    id: 'diffusion-noise-schedule',
    title: 'Diffusion Noise Schedule',
    section: 'generative-models',
    difficulty: 'easy',
    description: `
## Diffusion Noise Schedule

Implement a linear noise schedule for diffusion models.

### Linear Schedule
\`\`\`
β_t = β_start + t * (β_end - β_start) / (T - 1)

where t = 0, 1, ..., T-1
\`\`\`

### Derived Quantities
\`\`\`
α_t = 1 - β_t
ᾱ_t = prod(α_1, ..., α_t)  # cumulative product
\`\`\`

These control how much noise is added at each step.
    `,
    examples: [
      {
        input: 'T=1000, beta_start=0.0001, beta_end=0.02',
        output: 'betas, alphas, alpha_bars arrays',
        explanation: 'Standard DDPM schedule',
      },
    ],
    starterCode: `import numpy as np

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
        description: 'Alpha bar decreases - last < first',
        input: 'bool(linear_noise_schedule(50, 0.001, 0.01)[2][-1] < linear_noise_schedule(50, 0.001, 0.01)[2][0])',
        expected: 'True',
        hidden: true,
      },
      {
        id: '3',
        description: 'First beta equals beta_start',
        input: 'round(float(linear_noise_schedule(100, 0.0001, 0.02)[0][0]), 4)',
        expected: '0.0001',
        hidden: true,
      },
      {
        id: '4',
        description: 'alphas = 1 - betas relationship holds',
        input: `(lambda: (
    betas := linear_noise_schedule(50, 0.001, 0.02)[0],
    alphas := linear_noise_schedule(50, 0.001, 0.02)[1],
    bool(np.allclose(alphas, 1 - betas))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Alpha bars equal cumulative product of alphas',
        input: `(lambda: (
    result := linear_noise_schedule(40, 0.0001, 0.02),
    alphas := result[1],
    alpha_bars := result[2],
    bool(np.allclose(alpha_bars, np.cumprod(alphas)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Use np.linspace for linear interpolation',
      'alphas = 1 - betas',
      'alpha_bars = np.cumprod(alphas)',
    ],
    solution: `import numpy as np

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    # Linear schedule
    betas = np.linspace(beta_start, beta_end, T)

    # Compute alphas
    alphas = 1 - betas

    # Cumulative product
    alpha_bars = np.cumprod(alphas)

    return betas, alphas, alpha_bars
`,
  },
  {
    id: 'diffusion-forward',
    title: 'Diffusion Forward Process',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## Diffusion Forward Process (Adding Noise)

Implement the forward diffusion process that adds noise to data.

### Formula
\`\`\`
x_t = sqrt(ᾱ_t) * x_0 + sqrt(1 - ᾱ_t) * ε

where ε ~ N(0, I)
\`\`\`

### Intuition
- As t increases, ᾱ_t decreases
- More noise is added, signal is reduced
- At t=T, x_T ≈ pure noise
    `,
    examples: [
      {
        input: 'x_0 (image), t=500, T=1000',
        output: 'x_t (noisy image)',
        explanation: 'Halfway through diffusion process',
      },
    ],
    starterCode: `import numpy as np

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
    np.random.seed(42)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'diffusion_forward(np.ones((2, 4)), 50, np.linspace(0.99, 0.01, 100))[0].shape',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Noise shape matches input',
        input: 'diffusion_forward(np.ones((3, 5)), 10, np.linspace(0.99, 0.01, 100))[1].shape',
        expected: '(3, 5)',
        hidden: true,
      },
      {
        id: '3',
        description: 'When alpha_bar=1, x_t should equal x_0 (no noise added)',
        input: 'bool(np.allclose(diffusion_forward(np.array([[1.0, 2.0, 3.0]]), 0, np.array([1.0, 0.5, 0.1]))[0], np.array([[1.0, 2.0, 3.0]])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Verify formula: x_t = sqrt(alpha_bar_t)*x_0 + sqrt(1-alpha_bar_t)*noise',
        input: `(lambda: (
    x_0 := np.ones((2, 4)),
    alpha_bars := np.linspace(0.99, 0.01, 100),
    result := diffusion_forward(x_0, 50, alpha_bars),
    x_t := result[0],
    noise := result[1],
    ab := alpha_bars[50],
    expected := np.sqrt(ab) * x_0 + np.sqrt(1 - ab) * noise,
    bool(np.allclose(x_t, expected))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'When alpha_bar≈0, x_t is mostly noise (far from x_0)',
        input: `(lambda: (
    x_0 := np.ones((2, 3)) * 10,
    alpha_bars := np.array([0.001]),
    x_t := diffusion_forward(x_0, 0, alpha_bars)[0],
    bool(np.mean(np.abs(x_t - x_0)) > 5)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Get alpha_bar_t = alpha_bars[t]',
      'Sample noise from standard normal',
      'Apply formula: sqrt(alpha_bar_t) * x_0 + sqrt(1 - alpha_bar_t) * noise',
    ],
    solution: `import numpy as np

def diffusion_forward(x_0, t, alpha_bars):
    np.random.seed(42)

    alpha_bar_t = alpha_bars[t]

    # Sample noise
    noise = np.random.randn(*x_0.shape)

    # Forward process
    x_t = np.sqrt(alpha_bar_t) * x_0 + np.sqrt(1 - alpha_bar_t) * noise

    return x_t, noise
`,
  },
  {
    id: 'vqvae-quantization',
    title: 'VQ-VAE Vector Quantization',
    section: 'generative-models',
    difficulty: 'hard',
    description: `
## VQ-VAE Vector Quantization

Implement the vector quantization layer used in VQ-VAE (Vector Quantized Variational Autoencoder).

### Overview
Unlike standard VAEs that use continuous latent spaces, VQ-VAE uses **discrete** latent representations by mapping encoder outputs to the nearest embedding in a learned codebook.

### Quantization Process
1. **Encoder output**: z_e of shape (batch, H, W, D)
2. **Codebook**: K embedding vectors of dimension D
3. **Find nearest**: For each spatial position, find the closest codebook entry
4. **Quantize**: Replace z_e with the nearest codebook vector z_q

### Distance Calculation
\`\`\`
distances[b, h, w, k] = ||z_e[b, h, w] - codebook[k]||²
\`\`\`

### Straight-Through Estimator
During training, gradients flow through z_q to z_e by copying gradients:
\`\`\`
z_q = z_e + stop_gradient(z_q - z_e)
\`\`\`
(We don't implement this here, just the forward pass)

### VQ-VAE Loss Components
\`\`\`
L = reconstruction + ||sg[z_e] - e||² + β * ||z_e - sg[e]||²
\`\`\`
- **Codebook loss**: Moves embeddings toward encoder outputs
- **Commitment loss**: Commits encoder to embeddings

### Function Signature
\`\`\`python
def vq_quantize(z_e, codebook):
    # z_e: (batch, H, W, embedding_dim) - encoder output
    # codebook: (num_embeddings, embedding_dim) - K embedding vectors
    # Returns: z_q, indices
\`\`\`
    `,
    examples: [
      {
        input: 'z_e (2, 4, 4, 64), codebook (512, 64)',
        output: 'z_q (2, 4, 4, 64), indices (2, 4, 4)',
        explanation: 'Each spatial position mapped to one of 512 codes',
      },
    ],
    starterCode: `import numpy as np

def vq_quantize(z_e, codebook):
    """
    Vector quantization for VQ-VAE.

    Args:
        z_e: Encoder output (batch, H, W, embedding_dim)
        codebook: Embedding vectors (num_embeddings, embedding_dim)

    Returns:
        z_q: Quantized vectors (batch, H, W, embedding_dim)
        indices: Codebook indices used (batch, H, W)
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
        codebook_loss: Loss to update codebook
        commitment_loss: Loss to commit encoder to codebook
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'z_q output shape matches input',
        input: 'vq_quantize(np.random.randn(2, 4, 4, 8), np.random.randn(16, 8))[0].shape',
        expected: '(2, 4, 4, 8)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Indices shape is correct',
        input: 'vq_quantize(np.random.randn(2, 4, 4, 8), np.random.randn(16, 8))[1].shape',
        expected: '(2, 4, 4)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Indices are valid codebook indices (all less than K)',
        input: 'bool(np.all(vq_quantize(np.random.randn(2, 3, 3, 4), np.random.randn(8, 4))[1] < 8))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'VQ loss returns tuple of two values',
        input: 'len(vq_loss(np.random.randn(2, 3, 3, 4), np.random.randn(2, 3, 3, 4), 0.25))',
        expected: '2',
        hidden: true,
      },
      {
        id: '5',
        description: 'Quantized vectors come from codebook (each z_q vector is a codebook entry)',
        input: `(lambda: (
    np.random.seed(0),
    codebook := np.random.randn(8, 4),
    z_e := np.random.randn(1, 2, 2, 4),
    z_q := vq_quantize(z_e, codebook)[0],
    z_q_flat := z_q.reshape(-1, 4),
    all_in_codebook := all(any(bool(np.allclose(z_q_flat[i], codebook[j])) for j in range(8)) for i in range(4)),
    bool(all_in_codebook)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Commitment loss equals beta * codebook_loss',
        input: `(lambda: (
    np.random.seed(1),
    z_e := np.random.randn(2, 3, 3, 4),
    z_q := np.random.randn(2, 3, 3, 4),
    losses := vq_loss(z_e, z_q, 0.25),
    bool(abs(losses[1] - 0.25 * losses[0]) < 1e-4)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reshape z_e to (batch*H*W, D) for easier distance computation',
      'Use broadcasting: ||a - b||² = ||a||² + ||b||² - 2*a·b',
      'np.argmin along the codebook axis gives indices',
      'Index into codebook with the indices to get z_q',
      'Reshape back to original spatial dimensions',
      'For loss: codebook_loss = ||z_e.detach() - z_q||², commitment = ||z_e - z_q.detach()||²',
    ],
    solution: `import numpy as np

def vq_quantize(z_e, codebook):
    z_e = np.array(z_e)
    codebook = np.array(codebook)

    batch, H, W, D = z_e.shape
    K, _ = codebook.shape

    # Flatten spatial dimensions: (batch*H*W, D)
    z_flat = z_e.reshape(-1, D)

    # Compute distances using: ||a-b||² = ||a||² + ||b||² - 2*a·b
    # z_flat: (N, D), codebook: (K, D)
    z_sq = np.sum(z_flat ** 2, axis=1, keepdims=True)  # (N, 1)
    codebook_sq = np.sum(codebook ** 2, axis=1)        # (K,)
    cross = z_flat @ codebook.T                        # (N, K)

    distances = z_sq + codebook_sq - 2 * cross         # (N, K)

    # Find nearest codebook entry
    indices_flat = np.argmin(distances, axis=1)        # (N,)

    # Get quantized vectors
    z_q_flat = codebook[indices_flat]                  # (N, D)

    # Reshape back
    z_q = z_q_flat.reshape(batch, H, W, D)
    indices = indices_flat.reshape(batch, H, W)

    return z_q, indices


def vq_loss(z_e, z_q, beta=0.25):
    z_e = np.array(z_e)
    z_q = np.array(z_q)

    # Codebook loss: ||sg[z_e] - z_q||² (moves codebook toward encoder output)
    # In practice, sg[z_e] means z_e is treated as constant
    codebook_loss = np.mean((z_e - z_q) ** 2)

    # Commitment loss: ||z_e - sg[z_q]||² (commits encoder to codebook)
    # Same computation, but gradient only flows to z_e
    commitment_loss = beta * np.mean((z_e - z_q) ** 2)

    return round(codebook_loss, 4), round(commitment_loss, 4)
`,
  },
  {
    id: 'kl-divergence',
    title: 'KL Divergence (Gaussians)',
    section: 'generative-models',
    difficulty: 'easy',
    description: `
## KL Divergence Between Gaussians

Compute the KL divergence between two univariate Gaussian distributions.

### Formula
\`\`\`
KL(P || Q) = log(σ_q/σ_p) + (σ_p² + (μ_p - μ_q)²) / (2σ_q²) - 0.5
\`\`\`

Where P = N(μ_p, σ_p²) and Q = N(μ_q, σ_q²)

### Properties
- KL ≥ 0
- KL = 0 iff P = Q
- Not symmetric: KL(P||Q) ≠ KL(Q||P)
    `,
    examples: [
      {
        input: 'P = N(0, 1), Q = N(0, 1)',
        output: '0',
        explanation: 'Same distribution',
      },
    ],
    starterCode: `import numpy as np

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    """
    Compute KL divergence between two Gaussians.

    Args:
        mu_p, sigma_p: Mean and std of P
        mu_q, sigma_q: Mean and std of Q

    Returns:
        kl: KL(P || Q)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Same distribution',
        input: '(0, 1, 0, 1)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Different means',
        input: '(1, 1, 0, 1)',
        expected: '0.5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Different variances',
        input: '(0, 2, 0, 1)',
        expected: '0.8069',
        hidden: true,
      },
      {
        id: '4',
        description: 'KL is always non-negative',
        input: 'bool(kl_divergence_gaussian(3, 2, -1, 5) >= 0)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Asymmetry: KL(P||Q) != KL(Q||P)',
        input: 'bool(abs(kl_divergence_gaussian(0, 1, 1, 2) - kl_divergence_gaussian(1, 2, 0, 1)) > 0.01)',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Apply the formula directly',
      'Use np.log for natural logarithm',
      'Remember: σ² is variance, σ is std',
    ],
    solution: `import numpy as np

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    term1 = np.log(sigma_q / sigma_p)
    term2 = (sigma_p**2 + (mu_p - mu_q)**2) / (2 * sigma_q**2)
    term3 = -0.5

    kl = term1 + term2 + term3
    return round(kl, 4)
`,
  },
  {
    id: 'ddpm-sampling-step',
    title: 'DDPM Reverse Sampling Step',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## One Reverse Step of DDPM

A DDPM (Ho et al., 2020) generates data by starting from pure noise x_T ~ N(0, I) and denoising step by step. A network ε_θ(x_t, t) predicts the noise that was added; each reverse step removes a bit of it.

### Noise schedule
\`\`\`
α_t = 1 - β_t
ᾱ_t = α_0 · α_1 · ... · α_t        (cumulative product)
\`\`\`
Timesteps are **0-indexed** into \`betas\`, so t = 0 is the last (least noisy) step.

### Reverse step (Algorithm 2 of the paper)
\`\`\`
mean    = 1 / sqrt(α_t) · ( x_t - β_t / sqrt(1 - ᾱ_t) · ε_θ )
x_{t-1} = mean + σ_t · z          z ~ N(0, I)
\`\`\`
- Use **σ_t² = β_t** (the paper's first choice; the other one is the posterior variance β̃_t = (1 - ᾱ_{t-1}) / (1 - ᾱ_t) · β_t)
- At **t = 0** no noise is added: return the mean
- The noise z is passed in so the step is deterministic

### Sanity check
At t = 0, ᾱ_0 = α_0. If x_0' = sqrt(α_0)·x + sqrt(β_0)·ε and the model predicts ε exactly, the step returns x exactly.

### Function Signature
\`\`\`python
def ddpm_step(x_t, eps_pred, t, betas, z):
    # x_t, eps_pred, z: arrays of the same shape
    # t: int timestep (0-indexed); betas: (T,) schedule
    # returns x_{t-1}, same shape as x_t
\`\`\`
    `,
    examples: [
      {
        input: 'x_t = [1.0, -0.5], eps_pred = [0.2, 0.4], t = 2, betas = [0.1, 0.2, 0.3], z = [0.5, -1.0]',
        output: '[1.3673, -1.349]',
        explanation: 'ᾱ_2 = 0.9 · 0.8 · 0.7 = 0.504; mean = (x_t - 0.3 / sqrt(0.496) · ε) / sqrt(0.7), then add sqrt(0.3) · z',
      },
    ],
    starterCode: `import numpy as np

def ddpm_step(x_t, eps_pred, t, betas, z):
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
    testCases: [
      {
        id: '1',
        description: 'Step at t = 2 adds sigma_t * z',
        input: 'np.round(ddpm_step(np.array([1.0, -0.5]), np.array([0.2, 0.4]), 2, np.array([0.1, 0.2, 0.3]), np.array([0.5, -1.0])), 4).tolist()',
        expected: '[1.3673, -1.349]',
        hidden: false,
      },
      {
        id: '2',
        description: 'No noise at t = 0',
        input: `(lambda: (
    a := ddpm_step(np.array([1.0, -0.5]), np.array([0.2, 0.4]), 0, np.array([0.1, 0.2, 0.3]), np.array([0.5, -1.0])),
    b := ddpm_step(np.array([1.0, -0.5]), np.array([0.2, 0.4]), 0, np.array([0.1, 0.2, 0.3]), np.array([9.0, 9.0])),
    (np.round(a, 4).tolist(), bool(np.allclose(a, b)))
)[-1])()`,
        expected: '([0.9874, -0.6604], True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Middle step on a 2-D sample (values)',
        input: 'np.round(ddpm_step(np.array([[0.3, -1.2], [2.0, 0.0]]), np.array([[1.0, -0.5], [0.1, 0.8]]), 1, np.linspace(0.05, 0.25, 4), np.array([[0.2, 0.2], [-0.3, 1.5]])), 4).tolist()',
        expected: '[[0.078, -1.0537], [1.9946, 0.2647]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'With the true noise, the final step recovers x exactly',
        input: `(lambda: (
    x0 := np.random.randn(3, 4), eps := np.random.randn(3, 4), betas := np.linspace(1e-4, 0.02, 50),
    x1 := np.sqrt(1 - betas[0]) * x0 + np.sqrt(betas[0]) * eps,
    bool(np.allclose(ddpm_step(x1, eps, 0, betas, np.random.randn(3, 4)), x0))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'alphas = 1 - betas; alpha_bar = np.cumprod(alphas)',
      'mean = (x_t - betas[t] / np.sqrt(1 - alpha_bar[t]) * eps_pred) / np.sqrt(alphas[t])',
      'Return mean when t == 0, otherwise mean + np.sqrt(betas[t]) * z',
    ],
    solution: `import numpy as np

def ddpm_step(x_t, eps_pred, t, betas, z):
    x_t = np.asarray(x_t, dtype=float)
    eps_pred = np.asarray(eps_pred, dtype=float)
    betas = np.asarray(betas, dtype=float)

    alphas = 1.0 - betas
    alpha_bar = np.cumprod(alphas)

    # Posterior mean: remove the predicted noise, then rescale
    mean = (x_t - betas[t] / np.sqrt(1.0 - alpha_bar[t]) * eps_pred) / np.sqrt(alphas[t])

    if t == 0:
        return mean                     # last step: no noise
    sigma = np.sqrt(betas[t])           # sigma_t^2 = beta_t
    return mean + sigma * np.asarray(z, dtype=float)
`,
  },
  {
    id: 'classifier-free-guidance',
    title: 'Classifier-Free Guidance',
    section: 'generative-models',
    difficulty: 'easy',
    description: `
## Classifier-Free Guidance (CFG)

Conditional diffusion models (e.g. text-to-image) are trained with the condition randomly **dropped** (replaced by a null token) some fraction of the time, so the same network predicts both ε_c = ε_θ(x_t, t, c) and ε_u = ε_θ(x_t, t, ∅). At sampling time, Ho & Salimans (2022) extrapolate away from the unconditional prediction:
\`\`\`
ε_guided = ε_u + w · (ε_c - ε_u)
\`\`\`
- **w = 0**: unconditional prediction
- **w = 1**: plain conditional prediction (no guidance)
- **w > 1**: stronger guidance, samples follow the prompt more closely and lose diversity (Stable Diffusion's default guidance scale is 7.5)

This is the "guidance scale" convention used by most libraries. The paper writes ε̃ = (1 + w')·ε_c - w'·ε_u, which is the same formula with w = 1 + w'.

### Guided sampling step
Plug ε_guided into the DDPM reverse step (σ_t² = β_t, 0-indexed t, no noise at t = 0):
\`\`\`
α_t = 1 - β_t,  ᾱ_t = Π_{s<=t} α_s
x_{t-1} = 1 / sqrt(α_t) · ( x_t - β_t / sqrt(1 - ᾱ_t) · ε_guided ) + σ_t · z
\`\`\`

### What to implement
- \`guided_noise(eps_uncond, eps_cond, w)\`: returns ε_guided (same shape as the inputs)
- \`cfg_step(x_t, eps_uncond, eps_cond, w, t, betas, z)\`: returns x_{t-1}
    `,
    examples: [
      {
        input: 'eps_uncond = [0.1, -0.2], eps_cond = [0.3, 0.2], w = 3',
        output: '[0.7, 1.0]',
        explanation: '0.1 + 3·(0.3 - 0.1) = 0.7 and -0.2 + 3·(0.2 + 0.2) = 1.0',
      },
    ],
    starterCode: `import numpy as np

def guided_noise(eps_uncond, eps_cond, w):
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
        betas: (T,) noise schedule
        z: standard normal noise (ignored at t = 0)

    Returns:
        x_{t-1}
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Guidance scale 3 (values)',
        input: 'np.round(guided_noise(np.array([0.1, -0.2]), np.array([0.3, 0.2]), 3.0), 6).tolist()',
        expected: '[0.7, 1.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'w = 1 gives the conditional and w = 0 the unconditional prediction',
        input: `(lambda: (
    u := np.random.randn(2, 3), c := np.random.randn(2, 3),
    (bool(np.allclose(guided_noise(u, c, 1.0), c)), bool(np.allclose(guided_noise(u, c, 0.0), u)))
)[-1])()`,
        expected: '(True, True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Guided sampling step (values)',
        input: 'np.round(cfg_step(np.array([0.5, -1.0, 2.0]), np.array([0.1, 0.0, -0.3]), np.array([0.4, -0.2, 0.1]), 7.5, 3, np.linspace(0.01, 0.1, 5), np.array([1.0, -0.5, 0.25])), 4).tolist()',
        expected: '[0.3322, -0.8824, 1.6156]',
        hidden: true,
      },
      {
        id: '4',
        description: 'With w = 1 the unconditional prediction has no effect; t = 0 adds no noise',
        input: `(lambda: (
    x := np.random.randn(4), c := np.random.randn(4), betas := np.linspace(0.01, 0.2, 6),
    a := cfg_step(x, np.random.randn(4), c, 1.0, 4, betas, np.ones(4)),
    b := cfg_step(x, np.random.randn(4) * 10, c, 1.0, 4, betas, np.ones(4)),
    e := cfg_step(x, np.zeros(4), c, 2.0, 0, betas, np.random.randn(4)),
    (bool(np.allclose(a, b)), bool(np.allclose(e, (x - betas[0] / np.sqrt(betas[0]) * 2 * c) / np.sqrt(1 - betas[0]))))
)[-1])()`,
        expected: '(True, True)',
        hidden: true,
      },
    ],
    hints: [
      'guided = eps_uncond + w * (eps_cond - eps_uncond)',
      'alphas = 1 - betas; alpha_bar = np.cumprod(alphas)',
      'mean = (x_t - betas[t] / np.sqrt(1 - alpha_bar[t]) * guided) / np.sqrt(alphas[t]); add np.sqrt(betas[t]) * z only if t > 0',
    ],
    solution: `import numpy as np

def guided_noise(eps_uncond, eps_cond, w):
    eps_uncond = np.asarray(eps_uncond, dtype=float)
    eps_cond = np.asarray(eps_cond, dtype=float)
    return eps_uncond + w * (eps_cond - eps_uncond)


def cfg_step(x_t, eps_uncond, eps_cond, w, t, betas, z):
    x_t = np.asarray(x_t, dtype=float)
    betas = np.asarray(betas, dtype=float)
    eps = guided_noise(eps_uncond, eps_cond, w)

    alphas = 1.0 - betas
    alpha_bar = np.cumprod(alphas)
    mean = (x_t - betas[t] / np.sqrt(1.0 - alpha_bar[t]) * eps) / np.sqrt(alphas[t])

    if t == 0:
        return mean
    return mean + np.sqrt(betas[t]) * np.asarray(z, dtype=float)
`,
  },
  {
    id: 'flow-matching',
    title: 'Flow Matching (Rectified Flow)',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## Conditional Flow Matching

Flow matching (Lipman et al., 2023) and rectified flow (Liu et al., 2023) train a network v_θ(x, t) to be a **velocity field** that carries noise to data along an ODE. With straight-line paths, training is plain regression.

### Training target
Sample noise x0 ~ N(0, I), a data point x1, and a time t ~ U(0, 1) for each example. The point on the straight path and its velocity are:
\`\`\`
x_t      = (1 - t) · x0 + t · x1
target   = d x_t / dt = x1 - x0
loss     = mean( (v_pred - target)² )        (mean over every element of the batch)
\`\`\`
Here t = 0 is noise and t = 1 is data. \`t\` has shape (B,) and must broadcast over the remaining dimensions of x0 (reshape it to (B, 1, ..., 1)).

### Sampling with Euler steps
Start at x0 ~ N(0, I) and integrate dx/dt = v(x, t) from t = 0 to t = 1:
\`\`\`
x_{t+dt} = x_t + dt · v(x_t, t)
\`\`\`
With n steps, dt = 1/n and the times are t = 0, 1/n, ..., (n-1)/n. If the learned field is exactly the straight-line velocity, a **single** Euler step already lands on the data: that is the appeal of straight (rectified) paths.

### Expected Return Format
- \`flow_matching_loss(x0, x1, t, v_pred)\` returns a dictionary:
  - \`'x_t'\`: interpolated points, same shape as x0
  - \`'target'\`: target velocity x1 - x0, same shape as x0
  - \`'loss'\`: MSE between v_pred and target (Python float)
- \`euler_step(x_t, v, dt)\` returns x_t + dt · v
- \`euler_sample(x0, velocity_fn, n_steps)\` calls \`velocity_fn(x, t)\` (t a Python float) at each step and returns the final x
    `,
    examples: [
      {
        input: 'x0 = [[0, 0], [1, 1]], x1 = [[2, 4], [3, -1]], t = [0.25, 0.5]',
        output: "x_t = [[0.5, 1.0], [2.0, 0.0]], target = [[2, 4], [2, -2]]",
        explanation: 'Row 0 is a quarter of the way to its data point, row 1 halfway',
      },
    ],
    starterCode: `import numpy as np

def flow_matching_loss(x0, x1, t, v_pred):
    """
    Conditional flow matching with straight paths.

    Args:
        x0: (B, ...) noise samples
        x1: (B, ...) data samples
        t: (B,) times in [0, 1]
        v_pred: (B, ...) predicted velocities at (x_t, t)

    Returns:
        dict with 'x_t', 'target' (same shape as x0) and 'loss' (float)
    """
    # Your code here
    pass


def euler_step(x_t, v, dt):
    """One Euler step: x_t + dt * v"""
    # Your code here
    pass


def euler_sample(x0, velocity_fn, n_steps):
    """Integrate dx/dt = velocity_fn(x, t) from t = 0 to 1 with n_steps Euler steps."""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Interpolated points and target velocity',
        input: `(lambda r: (r['x_t'].tolist(), r['target'].tolist()))(flow_matching_loss(
    np.array([[0.0, 0.0], [1.0, 1.0]]), np.array([[2.0, 4.0], [3.0, -1.0]]), np.array([0.25, 0.5]), np.zeros((2, 2))))`,
        expected: '([[0.5, 1.0], [2.0, 0.0]], [[2.0, 4.0], [2.0, -2.0]])',
        hidden: false,
      },
      {
        id: '2',
        description: 'One Euler step',
        input: 'euler_step(np.array([1.0, -2.0]), np.array([0.5, 4.0]), 0.25).tolist()',
        expected: '[1.125, -1.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'MSE loss on image-shaped tensors with per-example t (values)',
        input: `(lambda: (
    x0 := np.arange(16.0).reshape(2, 2, 2, 2) / 10, x1 := np.ones((2, 2, 2, 2)),
    v := np.full((2, 2, 2, 2), 0.3),
    r := flow_matching_loss(x0, x1, np.array([0.1, 0.9]), v),
    (round(r['loss'], 6), np.round(r['x_t'][1, 0, 0], 4).tolist())
)[-1])()`,
        expected: '(0.215, [0.98, 0.99])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Euler sampling: exact straight field lands on the data; v = -x decays as (1 - 1/n)^n',
        input: `(lambda: (
    x0 := np.random.randn(3, 2), x1 := np.random.randn(3, 2),
    a := euler_sample(x0, lambda x, t: x1 - x0, 1),
    b := euler_sample(np.array([2.0]), lambda x, t: -x, 4),
    c := euler_sample(np.array([0.0]), lambda x, t: np.array([t]), 4),
    (bool(np.allclose(a, x1)), round(float(b[0]), 6), round(float(c[0]), 6))
)[-1])()`,
        expected: '(True, 0.632812, 0.375)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Endpoints: t = 0 gives the noise, t = 1 gives the data; perfect prediction has zero loss',
        input: `(lambda: (
    x0 := np.random.randn(2, 5), x1 := np.random.randn(2, 5),
    r := flow_matching_loss(x0, x1, np.array([0.0, 1.0]), x1 - x0),
    (bool(np.allclose(r['x_t'][0], x0[0]) and np.allclose(r['x_t'][1], x1[1])), r['loss'])
)[-1])()`,
        expected: '(True, 0.0)',
        hidden: true,
      },
    ],
    hints: [
      'Reshape t to (B, 1, ..., 1): t.reshape(-1, *([1] * (x0.ndim - 1)))',
      'x_t = (1 - t) * x0 + t * x1 and target = x1 - x0',
      'loss = np.mean((v_pred - target) ** 2)',
      'euler_sample: dt = 1 / n_steps; for i in range(n_steps): x = euler_step(x, velocity_fn(x, i * dt), dt)',
    ],
    solution: `import numpy as np

def flow_matching_loss(x0, x1, t, v_pred):
    x0 = np.asarray(x0, dtype=float)
    x1 = np.asarray(x1, dtype=float)
    t = np.asarray(t, dtype=float).reshape(-1, *([1] * (x0.ndim - 1)))

    x_t = (1 - t) * x0 + t * x1      # straight path from noise to data
    target = x1 - x0                 # its constant velocity
    loss = np.mean((np.asarray(v_pred, dtype=float) - target) ** 2)
    return {'x_t': x_t, 'target': target, 'loss': float(loss)}


def euler_step(x_t, v, dt):
    return np.asarray(x_t, dtype=float) + dt * np.asarray(v, dtype=float)


def euler_sample(x0, velocity_fn, n_steps):
    x = np.asarray(x0, dtype=float)
    dt = 1.0 / n_steps
    for i in range(n_steps):
        x = euler_step(x, velocity_fn(x, i * dt), dt)
    return x
`,
  },
];
