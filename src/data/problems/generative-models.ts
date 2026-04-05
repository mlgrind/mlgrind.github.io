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
L_KL = -0.5 * sum(1 + log_var - mu² - exp(log_var))
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
        input: '(np.zeros((2, 4)), np.zeros((2, 4)), np.zeros((2, 2)), np.zeros((2, 2)))',
        expected: '(0.0, 0.0, 0.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Non-zero KL',
        input: '(np.zeros((1, 4)), np.zeros((1, 4)), np.ones((1, 2)), np.zeros((1, 2)))',
        expected: '(0.3161, 0.0, 0.3161)',
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
      'KL: -0.5 * sum(1 + log_var - mu² - exp(log_var))',
      'Average over batch',
    ],
    solution: `import numpy as np

def vae_loss(x, x_reconstructed, mu, log_var):
    # Reconstruction loss (MSE)
    recon_loss = np.mean((x - x_reconstructed) ** 2)

    # KL divergence
    kl_loss = -0.5 * np.mean(1 + log_var - mu**2 - np.exp(log_var))

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
β_t = β_start + t * (β_end - β_start) / T

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
L = reconstruction + β * ||sg[z_e] - e||² + ||z_e - sg[e]||²
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
];
