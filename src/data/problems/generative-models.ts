import { Problem } from '../../types';

export const generativeModelProblems: Problem[] = [
  {
    id: 'vae-reparameterization',
    title: 'VAE Reparameterization Trick',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## VAE Reparameterization Trick

### What you'll build
The sampling step of a VAE: draw \`z ~ N(μ, σ²)\` in a way that lets gradients flow back into the encoder outputs \`μ\` and \`log σ²\`.

### Background
A VAE encoder outputs a Gaussian per input, and the decoder needs a sample from it. "Sample from N(μ, σ²)" is not a differentiable operation in μ and σ, so backprop would stop there. The trick moves the randomness into an input that does not depend on the parameters:
- draw \`ε ~ N(0, I)\` (independent of μ, σ)
- set \`z = μ + σ ⊙ ε\`, a deterministic, differentiable function of μ and σ

Then \`∂z/∂μ = 1\` and \`∂z/∂σ = ε\`, so ordinary backprop trains the encoder.

### Formula
\`\`\`text
σ = exp(0.5 · log_var)          # log_var = log σ², so this is sqrt(σ²)
ε ~ N(0, I)                     # shape (batch, latent_dim)
z = μ + σ ⊙ ε                   # elementwise
\`\`\`
Encoders predict \`log_var\` rather than σ because it is unconstrained (any real number) while σ must be positive.

### Inputs
- \`mu\`: float array \`(batch, latent_dim)\`
- \`log_var\`: float array \`(batch, latent_dim)\`, any real values (very negative means σ ≈ 0)

### Expected return format
- \`z\`: float array \`(batch, latent_dim)\`

### Conventions (the tests rely on these)
- The starter code calls \`np.random.seed(42)\` first. Keep it, then draw the noise **once** with \`np.random.randn(*mu.shape)\`, so the tests can reproduce your ε.
- With \`log_var\` very negative, σ underflows to 0 and \`z = mu\` exactly.

### Constraints
NumPy only, vectorised (no Python loops).

### Follow-up
- Why does the KL term in the VAE loss stop σ from collapsing to 0?
- How would you reparameterize a categorical latent? (Gumbel-softmax.)
    `,
    examples: [
      {
        input: 'mu = np.array([[0.0, 1.0]]), log_var = np.array([[0.0, 0.0]])',
        output: 'array([[0.4967, 0.8617]])',
        explanation: 'log_var = 0 gives σ = 1, so z = mu + ε with ε = [0.4967, -0.1383] (the first two draws after seed 42)',
      },
      {
        input: 'mu = np.array([[0.0, 1.0]]), log_var = np.log(np.array([[4.0, 4.0]]))',
        output: 'array([[0.9934, 0.7235]])',
        explanation: 'σ² = 4 gives σ = 2, so the same ε is doubled before adding mu',
      },
    ],
    starterCode: `import numpy as np

def reparameterize(mu, log_var):
    """
    Sample z ~ N(mu, exp(log_var)) with the reparameterization trick.

    Args:
        mu: Mean of the latent distribution, shape (batch, latent_dim)
        log_var: Log variance of the latent distribution, shape (batch, latent_dim)

    Returns:
        z: Sampled latent vectors, shape (batch, latent_dim)
    """
    np.random.seed(42)  # keep: draw eps once with np.random.randn(*mu.shape)
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
      {
        id: '6',
        description: 'Concrete values: log_var = 0 means z = mu + eps',
        input: 'np.round(reparameterize(np.array([[0.0, 1.0]]), np.array([[0.0, 0.0]])), 4).tolist()',
        expected: '[[0.4967, 0.8617]]',
        hidden: false,
      },
    ],
    hints: [
      'The randomness must not depend on mu or log_var. Draw it separately, then combine it with the parameters through a differentiable formula.',
      'Two steps: turn log_var into a standard deviation, then shift and scale a standard normal sample.',
      'std = np.exp(0.5 * log_var); eps = np.random.randn(*mu.shape); z = mu + std * eps.',
      'Pitfall: np.exp(log_var) is the variance, not the std. Also draw eps exactly once, after the seed, or the tests cannot reproduce it.',
    ],
    solution: `import numpy as np

def reparameterize(mu, log_var):
    """
    Returns z = mu + exp(0.5 * log_var) * eps, shape (batch, latent_dim).
    """
    np.random.seed(42)
    std = np.exp(0.5 * log_var)           # log_var = log(sigma^2)
    eps = np.random.randn(*mu.shape)      # independent of mu and log_var
    return mu + std * eps                 # differentiable in mu and std

# Time and space: O(batch * latent_dim)
`,
  },
  {
    id: 'vae-loss',
    title: 'VAE Loss Function',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## VAE Loss (Negative ELBO)

### What you'll build
The training loss of a Gaussian VAE: a reconstruction term plus the KL divergence between the encoder's distribution and the standard-normal prior.

### Background
Maximising the evidence lower bound (ELBO) is the same as minimising

\`\`\`text
L = E_q[ -log p(x | z) ] + KL( q(z | x) || N(0, I) )
\`\`\`

The first term makes the decoder reproduce its input; the second keeps every posterior close to the prior, so random \`z ~ N(0, I)\` decode to realistic samples. With a Gaussian decoder the first term becomes a squared error; with a diagonal-Gaussian encoder the KL has a closed form.

### Formula
For example \`i\` with latent dimension \`d\`:
\`\`\`text
KL_i = -0.5 · Σ_{j=1..d} ( 1 + log_var_ij − mu_ij² − exp(log_var_ij) )
\`\`\`
This course uses the standard convention (Kingma & Welling; the official PyTorch VAE example), averaged over the batch:
- \`recon_loss = mean((x − x_reconstructed)²)\` over **all** elements (plain MSE)
- \`kl_loss = mean_i KL_i\`: **sum over latent dims, mean over the batch**
- \`total_loss = recon_loss + kl_loss\`

The capstone **E2E: Variational Autoencoder** uses exactly the same convention.

### Inputs
- \`x\`, \`x_reconstructed\`: float arrays \`(batch, features)\`
- \`mu\`, \`log_var\`: float arrays \`(batch, latent_dim)\`

### Expected return format
A tuple of three Python floats, each rounded to 4 decimals, in this order:
\`(total_loss, recon_loss, kl_loss)\`

### Edge cases
- \`mu = 0\`, \`log_var = 0\` (posterior equals the prior) gives \`kl_loss = 0.0\`.
- Each latent dim's KL is ≥ 0, so \`kl_loss ≥ 0\`.

### Constraints
NumPy only, vectorised.

### Follow-up
- Why weight the KL with β (β-VAE), and what is "posterior collapse"?
- How does the loss change for binary data (BCE reconstruction)?
    `,
    examples: [
      {
        input: 'x = [[1.0, 2.0]], x_reconstructed = [[0.0, 0.0]], mu = [[0.5, -0.5]], log_var = [[0.0, 1.0]]',
        output: '(3.1091, 2.5, 0.6091)',
        explanation: 'recon = (1 + 4) / 2 = 2.5; KL = -0.5·[(1 + 0 − 0.25 − 1) + (1 + 1 − 0.25 − e)] = 0.6091',
      },
      {
        input: 'x = x_reconstructed = zeros((2, 3)), mu = [[1.0, 1.0], [0.0, 0.0]], log_var = zeros((2, 2))',
        output: '(0.5, 0.0, 0.5)',
        explanation: 'Row 0 has KL 0.5 + 0.5 = 1 (summed over latent dims), row 1 has 0; the batch mean is 0.5',
      },
    ],
    starterCode: `import numpy as np

def vae_loss(x, x_reconstructed, mu, log_var):
    """
    Compute the VAE loss (negative ELBO).

    Args:
        x: Original input, shape (batch, features)
        x_reconstructed: Decoder output, shape (batch, features)
        mu: Latent mean, shape (batch, latent_dim)
        log_var: Latent log variance, shape (batch, latent_dim)

    Returns:
        (total_loss, recon_loss, kl_loss): Python floats rounded to 4 decimals.
        recon_loss is the MSE over all elements; kl_loss sums over latent dims
        and averages over the batch; total_loss = recon_loss + kl_loss.
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
      {
        id: '6',
        description: 'Concrete values: reconstruction and KL both non-zero',
        input: 'vae_loss(np.array([[1.0, 2.0]]), np.zeros((1, 2)), np.array([[0.5, -0.5]]), np.array([[0.0, 1.0]]))',
        expected: '(3.1091, 2.5, 0.6091)',
        hidden: false,
      },
      {
        id: '7',
        description: 'KL sums over latent dims and averages over the batch',
        input: 'vae_loss(np.zeros((2, 3)), np.zeros((2, 3)), np.array([[1.0, 1.0], [0.0, 0.0]]), np.zeros((2, 2)))',
        expected: '(0.5, 0.0, 0.5)',
        hidden: true,
      },
    ],
    hints: [
      'The loss has two independent parts: how well the decoder reproduces x, and how far each posterior N(mu, exp(log_var)) is from N(0, I).',
      'Compute the reconstruction MSE, then a per-example KL (one number per row), then average the KL over the batch.',
      'recon = np.mean((x - x_reconstructed) ** 2); kl = np.mean(-0.5 * np.sum(1 + log_var - mu**2 - np.exp(log_var), axis=1)).',
      'Pitfall: np.mean over the whole KL array also divides by latent_dim, which under-weights the KL. Sum over axis=1 first. Round only the returned values.',
    ],
    solution: `import numpy as np

def vae_loss(x, x_reconstructed, mu, log_var):
    """
    Returns (total_loss, recon_loss, kl_loss) as floats rounded to 4 decimals.
    """
    # Gaussian decoder -> squared error, averaged over every element
    recon_loss = np.mean((x - x_reconstructed) ** 2)

    # Closed-form KL(N(mu, sigma^2) || N(0, 1)) per latent dim,
    # summed over latent dims (axis=1), then averaged over the batch
    kl_per_example = -0.5 * np.sum(1 + log_var - mu**2 - np.exp(log_var), axis=1)
    kl_loss = np.mean(kl_per_example)

    total_loss = recon_loss + kl_loss
    return round(float(total_loss), 4), round(float(recon_loss), 4), round(float(kl_loss), 4)
`,
  },
  {
    id: 'diffusion-noise-schedule',
    title: 'Diffusion Noise Schedule',
    section: 'generative-models',
    difficulty: 'easy',
    description: `
## Diffusion Noise Schedule

### What you'll build
The linear β schedule from DDPM (Ho et al., 2020) and the two quantities every diffusion step uses: \`α_t\` and the cumulative product \`ᾱ_t\`.

### Background
The forward process adds a little Gaussian noise at each of T steps; \`β_t\` is the variance added at step t. Because Gaussians compose, you never simulate the steps one by one: the noise level after t steps is fully described by \`ᾱ_t\`, which falls from about 1 (clean data) towards 0 (pure noise).

### Formula
Timesteps are **0-indexed**, \`t = 0, 1, ..., T−1\` (the same indexing as the sampling problems):
\`\`\`text
β_t  = β_start + t · (β_end − β_start) / (T − 1)     # evenly spaced, both ends included
α_t  = 1 − β_t
ᾱ_t  = α_0 · α_1 · ... · α_t                         # cumulative product, ᾱ_0 = α_0
\`\`\`
With the DDPM defaults (T = 1000, β from 1e-4 to 0.02), ᾱ is 0.9999 at t = 0, about 0.0786 at t = 499 and 4.0e-5 at t = 999.

### Inputs
- \`T\`: int ≥ 2, the number of steps
- \`beta_start\`, \`beta_end\`: floats with \`0 < beta_start < beta_end < 1\`

### Expected return format
A tuple of three float arrays, each of shape \`(T,)\`: \`(betas, alphas, alpha_bars)\`

### Constraints
NumPy only, no loops.

### Follow-up
- Why did Improved DDPM switch to a cosine schedule? (The linear one destroys information too early for small images.)
- What is the signal-to-noise ratio \`ᾱ_t / (1 − ᾱ_t)\` at the last step, and why should it be close to 0?
    `,
    examples: [
      {
        input: 'T = 3, beta_start = 0.1, beta_end = 0.3',
        output: 'betas = [0.1, 0.2, 0.3], alphas = [0.9, 0.8, 0.7], alpha_bars = [0.9, 0.72, 0.504]',
        explanation: 'ᾱ is the running product: 0.9, 0.9·0.8 = 0.72, 0.72·0.7 = 0.504',
      },
      {
        input: 'T = 1000 (DDPM defaults)',
        output: 'alpha_bars[0] = 0.9999, alpha_bars[-1] ≈ 4.0e-05',
        explanation: 'The last step is almost pure noise',
      },
    ],
    starterCode: `import numpy as np

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    """
    Create the linear DDPM noise schedule (0-indexed timesteps).

    Args:
        T: Number of diffusion steps (int)
        beta_start: beta_0
        beta_end: beta_{T-1}

    Returns:
        (betas, alphas, alpha_bars): float arrays of shape (T,), where
        alphas = 1 - betas and alpha_bars is the cumulative product of alphas
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
      {
        id: '6',
        description: 'Small schedule, exact values',
        input: '(lambda s: (np.round(s[0], 6).tolist(), np.round(s[1], 6).tolist(), np.round(s[2], 6).tolist()))(linear_noise_schedule(3, 0.1, 0.3))',
        expected: '([0.1, 0.2, 0.3], [0.9, 0.8, 0.7], [0.9, 0.72, 0.504])',
        hidden: false,
      },
      {
        id: '7',
        description: 'DDPM defaults: alpha_bar at t = 499 and t = 999 (scaled by 1e5)',
        input: '(lambda ab: (round(float(ab[499]), 4), round(float(ab[-1]) * 1e5, 4)))(linear_noise_schedule(1000)[2])',
        expected: '(0.0786, 4.0358)',
        hidden: true,
      },
    ],
    hints: [
      'β grows linearly from beta_start to beta_end, and both endpoints are included.',
      'Build betas first; alphas and alpha_bars follow from it in one line each.',
      'np.linspace(beta_start, beta_end, T) for betas; alphas = 1 - betas; np.cumprod(alphas) for alpha_bars.',
      'Pitfall: np.arange(beta_start, beta_end, step) drops the endpoint and suffers float drift; np.linspace includes both ends.',
    ],
    solution: `import numpy as np

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    """
    Returns (betas, alphas, alpha_bars), each of shape (T,).
    """
    betas = np.linspace(beta_start, beta_end, T)   # endpoints included
    alphas = 1.0 - betas
    alpha_bars = np.cumprod(alphas)                # alpha_bar_t = prod_{s<=t} alpha_s
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

### What you'll build
The closed-form forward process \`q(x_t | x_0)\`: jump straight from clean data to its noisy version at step t, and return the noise you used (it is the training target of the denoiser).

### Background
Adding \`N(0, β_t)\` noise T times in a row is equivalent to adding a single Gaussian whose size depends only on \`ᾱ_t\`. That is what makes diffusion training cheap: pick a random t, noise the batch in one shot, and train the network to predict ε.

### Formula
\`\`\`text
ε    ~ N(0, I)                                      # same shape as x_0
x_t  = sqrt(ᾱ_t) · x_0 + sqrt(1 − ᾱ_t) · ε
\`\`\`
- \`ᾱ_t = alpha_bars[t]\` (0-indexed, as in **Diffusion Noise Schedule**)
- \`ᾱ_t = 1\` returns \`x_0\` unchanged; \`ᾱ_t → 0\` gives (almost) pure noise
- The variance is preserved: if \`x_0\` has unit variance, so does \`x_t\`

### Inputs
- \`x_0\`: float array of any shape \`(batch, ...)\`
- \`t\`: int, an index into \`alpha_bars\`
- \`alpha_bars\`: float array \`(T,)\` with values in [0, 1]

### Expected return format
A tuple \`(x_t, noise)\`, both float arrays with the shape of \`x_0\`.

### Conventions (the tests rely on these)
The starter code calls \`np.random.seed(42)\`. Keep it and draw the noise **once** with \`np.random.randn(*x_0.shape)\`.

### Constraints
NumPy only, vectorised.

### Follow-up
- In training, t is sampled per example. How would you vectorise with a \`(batch,)\` array of timesteps? (Index \`alpha_bars[t]\` and reshape to \`(batch, 1, ...)\`.)
- Why predict ε instead of x_0 directly?
    `,
    examples: [
      {
        input: 'x_0 = np.array([[1.0, -1.0]]), t = 1, alpha_bars = np.array([0.9, 0.5])',
        output: 'x_t = [[1.0583, -0.8049]], noise = [[0.4967, -0.1383]]',
        explanation: 'ᾱ_1 = 0.5, so x_t = sqrt(0.5)·x_0 + sqrt(0.5)·ε with ε the first draws after seed 42',
      },
      {
        input: 'x_0 = np.array([[1.0, 2.0, 3.0]]), t = 0, alpha_bars = np.array([1.0, 0.5, 0.1])',
        output: 'x_t = [[1.0, 2.0, 3.0]]',
        explanation: 'ᾱ = 1 means no noise has been added yet',
      },
    ],
    starterCode: `import numpy as np

def diffusion_forward(x_0, t, alpha_bars):
    """
    Sample x_t ~ q(x_t | x_0) in closed form.

    Args:
        x_0: Clean data, shape (batch, ...)
        t: Timestep (int, 0-indexed into alpha_bars)
        alpha_bars: Cumulative alpha products, shape (T,)

    Returns:
        (x_t, noise): both with the shape of x_0
    """
    np.random.seed(42)  # keep: draw the noise once with np.random.randn(*x_0.shape)
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
      {
        id: '6',
        description: 'Concrete values at alpha_bar = 0.5',
        input: '(lambda r: (np.round(r[0], 4).tolist(), np.round(r[1], 4).tolist()))(diffusion_forward(np.array([[1.0, -1.0]]), 1, np.array([0.9, 0.5])))',
        expected: '([[1.0583, -0.8049]], [[0.4967, -0.1383]])',
        hidden: false,
      },
      {
        id: '7',
        description: 'The returned noise is the seeded standard normal draw',
        input: '(lambda: (n := diffusion_forward(np.zeros((2, 3)), 0, np.array([0.3]))[1], np.random.seed(42), bool(np.allclose(n, np.random.randn(2, 3))))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'You do not need a loop over steps: all the noise added up to step t is summarised by a single number, alpha_bars[t].',
      'Look up ᾱ_t, draw ε with the shape of x_0, then mix signal and noise.',
      'x_t = np.sqrt(ab) * x_0 + np.sqrt(1 - ab) * noise, with noise = np.random.randn(*x_0.shape).',
      'Pitfall: the coefficients are square roots of ᾱ and 1 − ᾱ (they are variances). Return the same noise array you used.',
    ],
    solution: `import numpy as np

def diffusion_forward(x_0, t, alpha_bars):
    """
    Returns (x_t, noise) with x_t = sqrt(ab) * x_0 + sqrt(1 - ab) * noise.
    """
    np.random.seed(42)
    alpha_bar_t = alpha_bars[t]
    noise = np.random.randn(*x_0.shape)   # the denoiser's training target
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

### What you'll build
The discrete bottleneck of a VQ-VAE (van den Oord et al., 2017): snap every encoder vector to its nearest codebook entry, and compute the two auxiliary losses that train the codebook and the encoder.

### Background
A VQ-VAE replaces the Gaussian latent of a VAE with a **discrete** one: a grid of indices into a learned codebook of K vectors. Discrete codes are what image and audio tokenizers (VQGAN, SoundStream, the image tokens of many multimodal LLMs) produce, so a Transformer can then model them like text.

### Algorithm: \`vq_quantize\`
1. Flatten the encoder output \`z_e\` from \`(B, H, W, D)\` to \`N = B·H·W\` vectors of size D.
2. Compute all squared distances to the K codes with the expansion
   \`||z − e_k||² = ||z||² − 2·z·e_k + ||e_k||²\`, giving an \`(N, K)\` matrix.
3. \`indices = argmin\` over K (ties go to the **lowest** index, as \`np.argmin\` does).
4. \`z_q = codebook[indices]\`, reshaped back to \`(B, H, W, D)\`; indices to \`(B, H, W)\`.

### Losses: \`vq_loss\`
\`sg[·]\` is stop-gradient (\`.detach()\` in PyTorch):
\`\`\`text
codebook_loss   = mean( (sg[z_e] − z_q)² )          # pulls codes toward encoder outputs
commitment_loss = β · mean( (z_e − sg[z_q])² )      # keeps the encoder near its codes
\`\`\`
Means are over **all** elements. In a forward pass both squared errors have the same value (\`sg\` only changes gradients), so \`commitment_loss = β · codebook_loss\`. The full VQ-VAE loss is \`reconstruction + codebook_loss + commitment_loss\`. The straight-through estimator \`z_q = z_e + sg[z_q − z_e]\` copies the decoder's gradient to the encoder; it only matters in an autograd framework (see the PyTorch track and **E2E: VQ-VAE**).

### Inputs
- \`z_e\`: float array \`(B, H, W, D)\`
- \`codebook\`: float array \`(K, D)\`
- \`beta\`: float, commitment weight (default 0.25)

### Expected return format
- \`vq_quantize\` returns \`(z_q, indices)\`: \`z_q\` float \`(B, H, W, D)\`, \`indices\` int \`(B, H, W)\`
- \`vq_loss\` returns \`(codebook_loss, commitment_loss)\`: Python floats rounded to 4 decimals

### Constraints
NumPy only. Vectorise the distance computation: no loop over positions or codes.

### Follow-up
- What is codebook collapse, and how do EMA codebook updates or dead-code restarts fix it?
- Memory of the \`(N, K)\` distance matrix for a 32×32 grid, batch 64 and K = 8192? (64·1024·8192·4 bytes ≈ 2 GB, so chunk it.)
    `,
    examples: [
      {
        input: 'z_e = [[[[1, 1], [9, 8], [4, 6]]]] (shape (1, 1, 3, 2)), codebook = [[0, 0], [10, 10], [5, 5]]',
        output: 'indices = [[[0, 1, 2]]], z_q = [[[[0, 0], [10, 10], [5, 5]]]]',
        explanation: '[9, 8] is at squared distance 5 from [10, 10] but 25 from [5, 5]; [4, 6] is 2 from [5, 5]',
      },
      {
        input: 'vq_loss(z_e, z_q, beta=0.25) for the example above',
        output: '(1.5, 0.375)',
        explanation: 'Squared errors 1, 1, 1, 4, 1, 1 have mean 1.5; the commitment loss is 0.25 · 1.5',
      },
    ],
    starterCode: `import numpy as np

def vq_quantize(z_e, codebook):
    """
    Vector quantization for VQ-VAE.

    Args:
        z_e: Encoder output, shape (batch, H, W, embedding_dim)
        codebook: Code vectors, shape (num_embeddings, embedding_dim)

    Returns:
        z_q: Nearest code for every position, shape (batch, H, W, embedding_dim)
        indices: Index of that code, int array of shape (batch, H, W);
                 ties go to the lowest index
    """
    # Your code here
    pass


def vq_loss(z_e, z_q, beta=0.25):
    """
    Codebook and commitment losses (forward values).

    Args:
        z_e: Encoder output, shape (batch, H, W, embedding_dim)
        z_q: Quantized vectors, same shape
        beta: Commitment loss weight (default 0.25)

    Returns:
        (codebook_loss, commitment_loss): Python floats rounded to 4 decimals,
        codebook_loss = mean((z_e - z_q)**2), commitment_loss = beta * that
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
      {
        id: '7',
        description: 'Nearest codes and losses on a hand-checked example',
        input: `(lambda: (
    z := np.array([[[[1.0, 1.0], [9.0, 8.0], [4.0, 6.0]]]]),
    cb := np.array([[0.0, 0.0], [10.0, 10.0], [5.0, 5.0]]),
    q := vq_quantize(z, cb),
    (q[1].tolist(), q[0].tolist(), vq_loss(z, q[0], 0.25))
)[-1])()`,
        expected: '([[[0, 1, 2]]], [[[[0.0, 0.0], [10.0, 10.0], [5.0, 5.0]]]], (1.5, 0.375))',
        hidden: false,
      },
      {
        id: '8',
        description: 'Indices match a brute-force search; ties go to the lowest index',
        input: `(lambda: (
    z := np.random.randn(2, 3, 3, 4), cb := np.random.randn(8, 4),
    brute := ((z[..., None, :] - cb) ** 2).sum(-1).argmin(-1),
    tie := vq_quantize(np.zeros((1, 1, 1, 2)), np.array([[1.0, 0.0], [-1.0, 0.0]]))[1],
    (bool(np.array_equal(vq_quantize(z, cb)[1], brute)), tie.tolist())
)[-1])()`,
        expected: '(True, [[[0]]])',
        hidden: true,
      },
    ],
    hints: [
      'Quantization is a nearest-neighbour lookup: for every encoder vector, which of the K codes is closest?',
      'Flatten z_e to (N, D), build an (N, K) matrix of squared distances, take the argmin per row, index the codebook, and reshape back.',
      'Distances without a loop: np.sum(z**2, axis=1, keepdims=True) - 2 * z @ codebook.T + np.sum(codebook**2, axis=1); then np.argmin(d, axis=1) and codebook[idx].',
      'Pitfall: z_e[..., None, :] - codebook also works but builds an (N, K, D) array, which runs out of memory for real codebooks. Both losses use the mean over all elements, not the sum.',
    ],
    solution: `import numpy as np

def vq_quantize(z_e, codebook):
    """
    Returns (z_q, indices): z_q has z_e's shape, indices has shape (batch, H, W).
    """
    batch, H, W, D = z_e.shape
    z_flat = z_e.reshape(-1, D)                                  # (N, D)

    # ||z - e||^2 = ||z||^2 - 2 z.e + ||e||^2, for all (vector, code) pairs
    distances = (np.sum(z_flat ** 2, axis=1, keepdims=True)      # (N, 1)
                 - 2 * z_flat @ codebook.T                        # (N, K)
                 + np.sum(codebook ** 2, axis=1))                 # (K,)

    indices_flat = np.argmin(distances, axis=1)                  # first index wins ties
    z_q = codebook[indices_flat].reshape(batch, H, W, D)
    return z_q, indices_flat.reshape(batch, H, W)


def vq_loss(z_e, z_q, beta=0.25):
    """
    Returns (codebook_loss, commitment_loss) as floats rounded to 4 decimals.
    """
    mse = np.mean((z_e - z_q) ** 2)
    # Same forward value; with autograd the codebook loss updates only the codes
    # (sg on z_e) and the commitment loss only the encoder (sg on z_q).
    codebook_loss = mse
    commitment_loss = beta * mse
    return round(float(codebook_loss), 4), round(float(commitment_loss), 4)

# Time: O(N * K * D) for the distances; space: O(N * K)
`,
  },
  {
    id: 'kl-divergence',
    title: 'KL Divergence (Gaussians)',
    section: 'generative-models',
    difficulty: 'easy',
    description: `
## KL Divergence Between Two Gaussians

### What you'll build
The closed-form KL divergence \`KL(P || Q)\` between two univariate Gaussians.

### Background
KL divergence measures how many extra nats you pay, on average, for encoding samples from P with a code optimised for Q. It appears all over generative modelling: the VAE regulariser is \`KL(q(z|x) || N(0, 1))\`, diffusion's ELBO is a sum of Gaussian KLs, and RLHF penalises \`KL(π || π_ref)\`. For Gaussians it has a closed form, so no sampling is needed.

### Formula
With \`P = N(μ_p, σ_p²)\` and \`Q = N(μ_q, σ_q²)\` (σ are **standard deviations**):
\`\`\`text
KL(P || Q) = log(σ_q / σ_p) + (σ_p² + (μ_p − μ_q)²) / (2 σ_q²) − 1/2
\`\`\`
Setting \`μ_q = 0, σ_q = 1\` and writing \`log_var = log σ_p²\` gives the VAE term \`−0.5·(1 + log_var − μ² − exp(log_var))\` used in **VAE Loss Function**.

### Properties
- \`KL ≥ 0\`, with equality iff P = Q
- **Not symmetric**: \`KL(P || Q) ≠ KL(Q || P)\` in general
- Units are nats because the log is natural

### Inputs
\`mu_p, sigma_p, mu_q, sigma_q\`: Python numbers (or NumPy scalars), with \`sigma_p, sigma_q > 0\`.

### Expected return format
\`kl\`: a Python float rounded to 4 decimals.

### Constraints
Use the closed form (no sampling).

### Follow-up
- Which direction does a VAE minimise, and why does reverse KL lead to mode-seeking behaviour?
- Generalise to diagonal multivariate Gaussians (sum the per-dimension KLs).
    `,
    examples: [
      {
        input: 'mu_p = 1, sigma_p = 1, mu_q = 0, sigma_q = 1',
        output: '0.5',
        explanation: 'Equal widths, so only the mean term remains: 1² / 2',
      },
      {
        input: 'mu_p = 0, sigma_p = 2, mu_q = 0, sigma_q = 1',
        output: '0.8069',
        explanation: 'log(1/2) + 4/2 − 0.5 = 0.8069; swapping P and Q gives 0.3181, so KL is not symmetric',
      },
    ],
    starterCode: `import numpy as np

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    """
    KL(P || Q) for P = N(mu_p, sigma_p^2) and Q = N(mu_q, sigma_q^2).

    Args:
        mu_p, sigma_p: Mean and standard deviation of P (sigma_p > 0)
        mu_q, sigma_q: Mean and standard deviation of Q (sigma_q > 0)

    Returns:
        kl: Python float rounded to 4 decimals
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
      {
        id: '6',
        description: 'Reverse direction of test 3 (asymmetry, exact value)',
        input: 'kl_divergence_gaussian(0, 1, 0, 2)',
        expected: '0.3181',
        hidden: true,
      },
    ],
    hints: [
      'KL compares a width ratio and a mean gap, both measured relative to Q (the distribution in the denominator).',
      'There are three terms: a log ratio of standard deviations, a squared-error term scaled by 2σ_q², and a constant.',
      'kl = np.log(sigma_q / sigma_p) + (sigma_p**2 + (mu_p - mu_q)**2) / (2 * sigma_q**2) - 0.5.',
      'Pitfall: the inputs are standard deviations, so square them for the variance term but not inside the log ratio. Return a Python float: round(float(kl), 4).',
    ],
    solution: `import numpy as np

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    """
    Returns KL(N(mu_p, sigma_p^2) || N(mu_q, sigma_q^2)) rounded to 4 decimals.
    """
    log_ratio = np.log(sigma_q / sigma_p)                         # width mismatch
    spread = (sigma_p**2 + (mu_p - mu_q)**2) / (2 * sigma_q**2)   # variance + mean gap
    return round(float(log_ratio + spread - 0.5), 4)
`,
  },
  {
    id: 'ddpm-sampling-step',
    title: 'DDPM Reverse Sampling Step',
    section: 'generative-models',
    difficulty: 'medium',
    description: `
## One Reverse Step of DDPM

### What you'll build
A single denoising step of DDPM sampling (Ho et al., 2020, Algorithm 2): given the current noisy sample \`x_t\` and the network's noise prediction, produce \`x_{t-1}\`.

### Background
Sampling starts from pure noise \`x_T ~ N(0, I)\` and applies this step T times. A network \`ε_θ(x_t, t)\` predicts the noise contained in \`x_t\`; the step removes the right fraction of it, rescales, and (except at the very end) injects a little fresh noise so the chain stays stochastic.

### Formula
Schedule, with timesteps **0-indexed** into \`betas\` (t = 0 is the last, least noisy step):
\`\`\`text
α_t = 1 − β_t
ᾱ_t = α_0 · α_1 · ... · α_t                    # cumulative product
\`\`\`
Reverse step:
\`\`\`text
mean    = ( x_t − β_t / sqrt(1 − ᾱ_t) · ε_θ ) / sqrt(α_t)
x_{t-1} = mean + σ_t · z,     σ_t = sqrt(β_t),  z ~ N(0, I)
\`\`\`
- Use **σ_t² = β_t** (the paper's first choice; the alternative is the posterior variance \`β̃_t = (1 − ᾱ_{t−1}) / (1 − ᾱ_t) · β_t\`).
- At **t = 0** add no noise: return \`mean\`, and ignore \`z\`.
- \`z\` is passed in, so the step is deterministic and testable.

### Inputs
- \`x_t\`, \`eps_pred\`, \`z\`: float arrays of the same (any) shape
- \`t\`: int in \`[0, T−1]\`
- \`betas\`: float array \`(T,)\`

### Expected return format
\`x_{t-1}\`: float array with the shape of \`x_t\`.

### Sanity check
At t = 0, \`ᾱ_0 = α_0\`. If \`x = sqrt(α_0)·x_0 + sqrt(β_0)·ε\` and the model predicts ε exactly, the step returns \`x_0\` exactly.

### Constraints
NumPy only, vectorised over the sample.

### Follow-up
- Why does DDIM allow 50 steps instead of 1000? (A deterministic, non-Markovian sampler on the same trained model.)
- Where would classifier-free guidance plug in? (Replace \`eps_pred\`; see the next problem.)
    `,
    examples: [
      {
        input: 'x_t = [1.0, -0.5], eps_pred = [0.2, 0.4], t = 2, betas = [0.1, 0.2, 0.3], z = [0.5, -1.0]',
        output: '[1.3673, -1.349]',
        explanation: 'ᾱ_2 = 0.9 · 0.8 · 0.7 = 0.504; mean = (x_t − 0.3 / sqrt(0.496) · ε) / sqrt(0.7), then add sqrt(0.3) · z',
      },
      {
        input: 'Same inputs with t = 0',
        output: '[0.9874, -0.6604]',
        explanation: 'Final step: mean = (x_t − 0.1 / sqrt(0.1) · ε) / sqrt(0.9), and z is ignored',
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
      'The step has two parts: a deterministic mean that strips out the predicted noise, then optional fresh noise. Which steps should get fresh noise?',
      'Precompute alphas and alpha_bar from betas, compute the mean, and branch on t == 0.',
      'alpha_bar = np.cumprod(1 - betas); mean = (x_t - betas[t] / np.sqrt(1 - alpha_bar[t]) * eps_pred) / np.sqrt(1 - betas[t]); add np.sqrt(betas[t]) * z when t > 0.',
      'Pitfall: the noise coefficient uses 1 − ᾱ_t (cumulative) while the outer division uses α_t (this step only). Mixing them up still gives the right shape but wrong values.',
    ],
    solution: `import numpy as np

def ddpm_step(x_t, eps_pred, t, betas, z):
    """
    Returns x_{t-1}, same shape as x_t (sigma_t^2 = beta_t, no noise at t = 0).
    """
    x_t = np.asarray(x_t, dtype=float)
    eps_pred = np.asarray(eps_pred, dtype=float)
    betas = np.asarray(betas, dtype=float)

    alphas = 1.0 - betas
    alpha_bar = np.cumprod(alphas)

    # Posterior mean, parameterised by the predicted noise
    mean = (x_t - betas[t] / np.sqrt(1.0 - alpha_bar[t]) * eps_pred) / np.sqrt(alphas[t])

    if t == 0:
        return mean                     # last step: no noise
    sigma = np.sqrt(betas[t])           # sigma_t^2 = beta_t
    return mean + sigma * np.asarray(z, dtype=float)

# Time: O(T + size of x_t) per step (precompute alpha_bar once in a real sampler)
`,
  },
  {
    id: 'classifier-free-guidance',
    title: 'Classifier-Free Guidance',
    section: 'generative-models',
    difficulty: 'easy',
    description: `
## Classifier-Free Guidance (CFG)

### What you'll build
The guidance rule that makes text-to-image diffusion follow the prompt, plus a DDPM reverse step that uses the guided noise prediction.

### Background
A conditional diffusion model is trained with its condition randomly **dropped** (replaced by a null token, typically 10–20% of the time), so one network predicts both
\`ε_c = ε_θ(x_t, t, c)\` and \`ε_u = ε_θ(x_t, t, ∅)\`. At sampling time Ho & Salimans (2022) push the prediction further in the direction the condition points:

### Formula
\`\`\`text
ε_guided = ε_u + w · (ε_c − ε_u)
\`\`\`
| Guidance scale w | Effect |
|------------------|--------|
| 0 | unconditional prediction |
| 1 | plain conditional prediction (no guidance) |
| > 1 | follows the prompt more closely, less diversity (Stable Diffusion's default is 7.5) |

This is the "guidance scale" convention used by most libraries. The paper writes \`ε̃ = (1 + w')·ε_c − w'·ε_u\`, the same formula with \`w = 1 + w'\`.

Guided step: plug \`ε_guided\` into the DDPM reverse step from **DDPM Reverse Sampling Step** (0-indexed t, σ_t² = β_t, no noise at t = 0):
\`\`\`text
α_t = 1 − β_t,   ᾱ_t = Π_{s ≤ t} α_s
x_{t-1} = ( x_t − β_t / sqrt(1 − ᾱ_t) · ε_guided ) / sqrt(α_t)  +  σ_t · z     (z term only if t > 0)
\`\`\`

### Inputs
- \`eps_uncond\`, \`eps_cond\`, \`x_t\`, \`z\`: float arrays of the same shape
- \`w\`: float guidance scale
- \`t\`: int in \`[0, T−1]\`; \`betas\`: float array \`(T,)\`

### Expected return format
- \`guided_noise(eps_uncond, eps_cond, w)\` returns \`ε_guided\` (same shape as the inputs)
- \`cfg_step(x_t, eps_uncond, eps_cond, w, t, betas, z)\` returns \`x_{t-1}\` (same shape as \`x_t\`)

### Constraints
NumPy only. Reuse \`guided_noise\` inside \`cfg_step\`.

### Follow-up
- CFG doubles the cost of each step (two forward passes). How do batching and guidance distillation reduce it?
- Why do very high guidance scales oversaturate images?
    `,
    examples: [
      {
        input: 'eps_uncond = [0.1, -0.2], eps_cond = [0.3, 0.2], w = 3',
        output: '[0.7, 1.0]',
        explanation: '0.1 + 3·(0.3 − 0.1) = 0.7 and −0.2 + 3·(0.2 + 0.2) = 1.0',
      },
      {
        input: 'x_t = [0.5, -1.0, 2.0], eps_uncond = [0.1, 0.0, -0.3], eps_cond = [0.4, -0.2, 0.1], w = 7.5, t = 3, betas = linspace(0.01, 0.1, 5), z = [1.0, -0.5, 0.25]',
        output: '[0.3322, -0.8824, 1.6156]',
        explanation: 'Guide the noise first, then apply the usual DDPM step with σ_3 = sqrt(β_3)',
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
      'Guidance is a linear extrapolation from the unconditional prediction through the conditional one. What should w = 0 and w = 1 give?',
      'Write guided_noise first, then make cfg_step call it and run the ordinary DDPM step on the result.',
      'guided = eps_uncond + w * (eps_cond - eps_uncond); alpha_bar = np.cumprod(1 - betas); mean = (x_t - betas[t] / np.sqrt(1 - alpha_bar[t]) * guided) / np.sqrt(1 - betas[t]).',
      'Pitfall: add np.sqrt(betas[t]) * z only when t > 0, and keep the w convention (w = 1 means no guidance, not w = 0).',
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
## Conditional Flow Matching (Rectified Flow)

### What you'll build
The training target and loss of flow matching with straight paths, and an Euler sampler that integrates the learned velocity field from noise to data.

### Background
Flow matching (Lipman et al., 2023) and rectified flow (Liu et al., 2023) train a network \`v_θ(x, t)\` to be a **velocity field** whose ODE carries noise to data. With straight-line paths between a noise sample and a data sample, training is plain regression, with no noise schedule or variance bookkeeping. Stable Diffusion 3 and Flux are trained this way.

### Formula (training)
Sample noise \`x0 ~ N(0, I)\`, a data point \`x1\`, and \`t ~ U(0, 1)\` per example:
\`\`\`text
x_t    = (1 − t) · x0 + t · x1           # point on the straight path
target = d x_t / dt = x1 − x0            # its constant velocity
loss   = mean( (v_pred − target)² )      # mean over every element of the batch
\`\`\`
Here **t = 0 is noise and t = 1 is data** (some papers use the opposite convention). \`t\` has shape \`(B,)\`: reshape it to \`(B, 1, ..., 1)\` so it broadcasts over the remaining dimensions.

### Algorithm (sampling with Euler steps)
1. Start from \`x = x0\` and set \`dt = 1 / n_steps\`.
2. For \`i = 0, ..., n_steps − 1\`: \`t = i · dt\` (a Python float), \`x ← x + dt · velocity_fn(x, t)\`.
3. Return \`x\`.

If the learned field is exactly the straight-line velocity, a **single** Euler step lands on the data: that is the appeal of straight (rectified) paths.

### Inputs
- \`x0\`, \`x1\`, \`v_pred\`: float arrays \`(B, ...)\` of the same shape
- \`t\`: float array \`(B,)\` with values in [0, 1]
- \`velocity_fn(x, t)\`: callable returning an array shaped like \`x\`; \`n_steps\`: int ≥ 1

### Expected return format
- \`flow_matching_loss(x0, x1, t, v_pred)\` returns a dict:
  - \`'x_t'\`: interpolated points, same shape as \`x0\`
  - \`'target'\`: target velocity \`x1 − x0\`, same shape as \`x0\`
  - \`'loss'\`: MSE between \`v_pred\` and \`target\` (Python float)
- \`euler_step(x_t, v, dt)\` returns \`x_t + dt · v\`
- \`euler_sample(x0, velocity_fn, n_steps)\` returns the final \`x\` (same shape as \`x0\`)

### Constraints
NumPy only; the Euler loop is over steps, never over elements.

### Follow-up
- How is this related to diffusion? (With Gaussian paths, flow matching recovers a probability-flow ODE of a diffusion model.)
- What does "reflow" do to make one-step sampling work for a real, imperfect model?
    `,
    examples: [
      {
        input: 'x0 = [[0, 0], [1, 1]], x1 = [[2, 4], [3, -1]], t = [0.25, 0.5]',
        output: "x_t = [[0.5, 1.0], [2.0, 0.0]], target = [[2, 4], [2, -2]]",
        explanation: 'Row 0 is a quarter of the way to its data point, row 1 halfway',
      },
      {
        input: 'euler_sample(np.array([2.0]), lambda x, t: -x, 4)',
        output: 'array([0.6328])',
        explanation: 'Each step multiplies x by (1 − 1/4), so 2 · 0.75⁴ = 0.6328 (the exact ODE solution is 2·e⁻¹ = 0.7358)',
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
      'On a straight line from x0 to x1 the velocity does not depend on t. What is it?',
      'flow_matching_loss: broadcast t, interpolate, form the target, take the MSE. euler_sample: a loop over steps that calls euler_step.',
      't = t.reshape(-1, *([1] * (x0.ndim - 1))); x_t = (1 - t) * x0 + t * x1; target = x1 - x0; loss = float(np.mean((v_pred - target) ** 2)).',
      'Pitfall: in euler_sample the time passed at step i is i * dt (start of the interval), so the last call uses (n − 1)/n, not 1. A (B,) t without reshaping broadcasts against the last axis instead of the batch.',
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
