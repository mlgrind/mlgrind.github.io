import { Problem } from '../../types';

export const e2eImplementationProblems: Problem[] = [
  {
    id: 'e2e-mlp',
    title: 'E2E: 2-Layer MLP with Backprop',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End 2-Layer MLP

Implement a complete 2-layer MLP with forward pass, backward pass, and training loop.

### Architecture
\`\`\`
Input (batch, input_dim)
  ↓
Linear(input_dim, hidden_dim) + ReLU
  ↓
Linear(hidden_dim, output_dim)
  ↓
Softmax + Cross-Entropy Loss
\`\`\`

### Forward Pass
\`\`\`python
h = relu(X @ W1 + b1)
logits = h @ W2 + b2
loss = cross_entropy(softmax(logits), y)
\`\`\`

### Backward Pass (Chain Rule)
\`\`\`python
# Output layer
d_logits = softmax(logits) - y_onehot  # (batch, output_dim)
d_W2 = h.T @ d_logits
d_b2 = d_logits.sum(axis=0)

# Hidden layer
d_h = d_logits @ W2.T
d_relu = d_h * (h > 0)  # ReLU derivative
d_W1 = X.T @ d_relu
d_b1 = d_relu.sum(axis=0)
\`\`\`

### Task
Implement forward, backward, and training step.
    `,
    examples: [
      {
        input: 'MLP(784, 128, 10) on MNIST-like data',
        output: 'Trained model with decreasing loss',
        explanation: 'Full training loop',
      },
    ],
    starterCode: `import numpy as np

class MLP:
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        """Initialize 2-layer MLP with random weights."""
        np.random.seed(42)
        # Xavier initialization
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros(hidden_dim)
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros(output_dim)

        # Cache for backward pass
        self.cache = {}

    def relu(self, x):
        return np.maximum(0, x)

    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

    def forward(self, X: np.ndarray) -> np.ndarray:
        """
        Forward pass.

        Args:
            X: Input (batch, input_dim)

        Returns:
            logits: Output (batch, output_dim)
        """
        # Your code here
        pass

    def compute_loss(self, logits: np.ndarray, y: np.ndarray) -> float:
        """
        Compute cross-entropy loss.

        Args:
            logits: Model output (batch, output_dim)
            y: True labels (batch,) as integers

        Returns:
            loss: Scalar loss value
        """
        # Your code here
        pass

    def backward(self, y: np.ndarray) -> dict:
        """
        Backward pass.

        Args:
            y: True labels (batch,) as integers

        Returns:
            gradients: Dictionary with dW1, db1, dW2, db2
        """
        # Your code here
        pass

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float = 0.01) -> float:
        """
        Single training step: forward, loss, backward, update.

        Returns:
            loss: Loss value before update
        """
        # Your code here
        pass


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    """Train MLP and return loss history."""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Forward pass shape',
        input: 'MLP(784, 128, 10).forward(np.random.randn(4, 784)).shape',
        expected: '(4, 10)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Loss decreases',
        input: '(lambda: (m := MLP(10, 8, 3), X := np.random.randn(16, 10), y := np.array([0,1,2,0,1,2,0,1,2,0,1,2,0,1,2,0]), losses := [m.train_step(X, y) for _ in range(50)], losses[-1] < losses[0])[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gradients computed',
        input: '(lambda: (m := MLP(10, 8, 3), X := np.random.randn(4, 10), y := np.array([0,1,2,0]), _ := m.forward(X), _ := m.compute_loss(m.cache["logits"], y), g := m.backward(y), all(k in g for k in ["dW1", "db1", "dW2", "db2"]))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Forward pass produces finite values',
        input: '(lambda: (m := MLP(20, 16, 5), X := np.random.randn(8, 20), logits := m.forward(X), bool(np.all(np.isfinite(logits))))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gradient shapes match weight shapes',
        input: '(lambda: (m := MLP(10, 8, 3), X := np.random.randn(4, 10), y := np.array([0,1,2,0]), _ := m.forward(X), _ := m.compute_loss(m.cache["logits"], y), g := m.backward(y), bool(g["dW1"].shape == (10, 8) and g["dW2"].shape == (8, 3) and g["db1"].shape == (8,) and g["db2"].shape == (3,)))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Cache X, h (hidden activations), and logits in forward pass',
      'd_logits = probs - y_onehot (softmax gradient combined with cross-entropy)',
      'ReLU gradient: 1 if x > 0, else 0',
      'Update: W = W - lr * dW',
    ],
    solution: `import numpy as np

class MLP:
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        np.random.seed(42)
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros(hidden_dim)
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros(output_dim)
        self.cache = {}

    def relu(self, x):
        return np.maximum(0, x)

    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

    def forward(self, X: np.ndarray) -> np.ndarray:
        # Layer 1: Linear + ReLU
        z1 = X @ self.W1 + self.b1
        h = self.relu(z1)

        # Layer 2: Linear
        logits = h @ self.W2 + self.b2

        # Cache for backward
        self.cache = {'X': X, 'z1': z1, 'h': h, 'logits': logits}

        return logits

    def compute_loss(self, logits: np.ndarray, y: np.ndarray) -> float:
        probs = self.softmax(logits)
        batch_size = logits.shape[0]
        correct_probs = probs[np.arange(batch_size), y]
        loss = -np.mean(np.log(np.clip(correct_probs, 1e-15, 1)))
        self.cache['probs'] = probs
        return loss

    def backward(self, y: np.ndarray) -> dict:
        X = self.cache['X']
        h = self.cache['h']
        z1 = self.cache['z1']
        probs = self.cache['probs']
        batch_size = X.shape[0]

        # One-hot encode targets
        y_onehot = np.zeros_like(probs)
        y_onehot[np.arange(batch_size), y] = 1

        # Output layer gradients
        d_logits = (probs - y_onehot) / batch_size
        dW2 = h.T @ d_logits
        db2 = d_logits.sum(axis=0)

        # Hidden layer gradients
        d_h = d_logits @ self.W2.T
        d_relu = d_h * (z1 > 0)  # ReLU derivative
        dW1 = X.T @ d_relu
        db1 = d_relu.sum(axis=0)

        return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float = 0.01) -> float:
        logits = self.forward(X)
        loss = self.compute_loss(logits, y)
        grads = self.backward(y)

        # Update weights
        self.W1 -= lr * grads['dW1']
        self.b1 -= lr * grads['db1']
        self.W2 -= lr * grads['dW2']
        self.b2 -= lr * grads['db2']

        return loss


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    input_dim = X_train.shape[1]
    output_dim = len(np.unique(y_train))
    model = MLP(input_dim, 64, output_dim)

    losses = []
    for _ in range(epochs):
        loss = model.train_step(X_train, y_train, lr)
        losses.append(loss)

    return model, losses
`,
  },
  {
    id: 'e2e-transformer',
    title: 'E2E: Transformer Encoder',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End Transformer Encoder

Implement a complete Transformer encoder block.

### Architecture
\`\`\`
Input Embeddings + Positional Encoding
  ↓
Multi-Head Self-Attention
  ↓
Add & LayerNorm (Residual)
  ↓
Feed-Forward Network (FFN)
  ↓
Add & LayerNorm (Residual)
  ↓
Output
\`\`\`

### Components
1. **Positional Encoding**: Sinusoidal position embeddings
2. **Multi-Head Attention**: Parallel attention heads
3. **FFN**: Two linear layers with ReLU
4. **Layer Normalization**: Normalize across features
5. **Residual Connections**: Add input to output

### Task
Implement all components and combine into encoder block.
    `,
    examples: [
      {
        input: 'TransformerEncoder(d_model=64, nhead=8, dim_ff=256)',
        output: 'Encoded sequence (batch, seq_len, d_model)',
        explanation: 'Complete encoder forward pass',
      },
    ],
    starterCode: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


def layer_norm(x, gamma, beta, eps=1e-5):
    """Layer normalization."""
    # Your code here
    pass


def positional_encoding(seq_len, d_model):
    """Sinusoidal positional encoding."""
    # Your code here
    pass


def scaled_dot_product_attention(Q, K, V, mask=None):
    """Scaled dot-product attention."""
    # Your code here
    pass


def multi_head_attention(Q, K, V, num_heads):
    """Multi-head attention."""
    # Your code here
    pass


def feed_forward(x, W1, b1, W2, b2):
    """Position-wise feed-forward network: Linear -> ReLU -> Linear"""
    # Your code here
    pass


class TransformerEncoderBlock:
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        """
        Initialize transformer encoder block.

        Args:
            d_model: Model dimension
            num_heads: Number of attention heads
            d_ff: Feed-forward hidden dimension
        """
        np.random.seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        # Initialize weights
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass through encoder block.

        Args:
            x: Input (batch, seq_len, d_model)

        Returns:
            output: (batch, seq_len, d_model)
        """
        # Your code here
        pass


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    """Stack multiple encoder blocks."""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'transformer_encoder(np.random.randn(2, 10, 64), num_layers=2, d_model=64, num_heads=8, d_ff=256).shape',
        expected: '(2, 10, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Attention weights sum to 1',
        input: '(lambda: (Q := np.random.randn(2, 5, 64), K := np.random.randn(2, 5, 64), V := np.random.randn(2, 5, 64), out_attn := scaled_dot_product_attention(Q, K, V), bool(np.allclose(out_attn[1].sum(axis=-1), 1.0)))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Layer norm output has zero mean',
        input: '(lambda: (x := np.random.randn(2, 5, 64), gamma := np.ones(64), beta := np.zeros(64), out := layer_norm(x, gamma, beta), bool(np.allclose(out.mean(axis=-1), 0.0, atol=1e-5)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Positional encoding shape',
        input: 'positional_encoding(10, 64).shape',
        expected: '(10, 64)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Encoder output is finite',
        input: '(lambda: (out := transformer_encoder(np.random.randn(2, 8, 64), num_layers=1, d_model=64, num_heads=8, d_ff=128), bool(np.all(np.isfinite(out))))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Attention: softmax(QK^T / sqrt(d_k)) @ V',
      'Layer norm: (x - mean) / sqrt(var + eps) * gamma + beta',
      'Residual: output = LayerNorm(x + Sublayer(x))',
      'FFN: max(0, xW1 + b1)W2 + b2',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


def layer_norm(x, gamma, beta, eps=1e-5):
    mean = np.mean(x, axis=-1, keepdims=True)
    var = np.var(x, axis=-1, keepdims=True)
    return gamma * (x - mean) / np.sqrt(var + eps) + beta


def positional_encoding(seq_len, d_model):
    PE = np.zeros((seq_len, d_model))
    position = np.arange(seq_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))
    PE[:, 0::2] = np.sin(position * div_term)
    PE[:, 1::2] = np.cos(position * div_term)
    return PE


def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k)
    if mask is not None:
        scores = scores + mask
    attention = softmax(scores, axis=-1)
    return attention @ V, attention


def multi_head_attention(Q, K, V, num_heads):
    batch, seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    Q = Q.reshape(batch, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)
    K = K.reshape(batch, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)
    V = V.reshape(batch, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)

    d_k = Q.shape[-1]
    scores = np.einsum('bhqd,bhkd->bhqk', Q, K) / np.sqrt(d_k)
    attention = softmax(scores, axis=-1)
    output = np.einsum('bhqk,bhkd->bhqd', attention, V)

    output = output.transpose(0, 2, 1, 3).reshape(batch, seq_len, d_model)
    return output


def feed_forward(x, W1, b1, W2, b2):
    hidden = np.maximum(0, x @ W1 + b1)
    return hidden @ W2 + b2


class TransformerEncoderBlock:
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        np.random.seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        # Layer norm parameters
        self.ln1_gamma = np.ones(d_model)
        self.ln1_beta = np.zeros(d_model)
        self.ln2_gamma = np.ones(d_model)
        self.ln2_beta = np.zeros(d_model)

        # FFN parameters
        self.W1 = np.random.randn(d_model, d_ff) * 0.02
        self.b1 = np.zeros(d_ff)
        self.W2 = np.random.randn(d_ff, d_model) * 0.02
        self.b2 = np.zeros(d_model)

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Multi-head self-attention + residual + layer norm
        attn_output = multi_head_attention(x, x, x, self.num_heads)
        x = layer_norm(x + attn_output, self.ln1_gamma, self.ln1_beta)

        # Feed-forward + residual + layer norm
        ff_output = feed_forward(x, self.W1, self.b1, self.W2, self.b2)
        x = layer_norm(x + ff_output, self.ln2_gamma, self.ln2_beta)

        return x


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    batch, seq_len, _ = x.shape

    # Add positional encoding
    PE = positional_encoding(seq_len, d_model)
    x = x + PE

    # Stack encoder blocks
    for _ in range(num_layers):
        block = TransformerEncoderBlock(d_model, num_heads, d_ff)
        x = block.forward(x)

    return x
`,
  },
  {
    id: 'e2e-vae',
    title: 'E2E: Variational Autoencoder',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End Variational Autoencoder

Implement a complete VAE with encoder, decoder, reparameterization, and ELBO loss.

### Architecture
\`\`\`
Encoder: x → h → (μ, log_σ²)
         ↓
Reparameterization: z = μ + σ * ε, ε ~ N(0,1)
         ↓
Decoder: z → h → x_reconstructed
\`\`\`

### Loss (ELBO)
\`\`\`
L = Reconstruction Loss + KL Divergence
L = ||x - x_hat||² + KL(q(z|x) || p(z))
KL = -0.5 * sum(1 + log_var - μ² - exp(log_var))
\`\`\`

### Task
Implement encoder, decoder, reparameterization trick, and loss computation.
    `,
    examples: [
      {
        input: 'VAE(input_dim=784, latent_dim=20)',
        output: 'Reconstructed images + latent samples',
        explanation: 'Full VAE forward pass',
      },
    ],
    starterCode: `import numpy as np

class VAE:
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        """
        Initialize VAE.

        Args:
            input_dim: Input dimension (e.g., 784 for MNIST)
            hidden_dim: Hidden layer dimension
            latent_dim: Latent space dimension
        """
        np.random.seed(42)

        # Encoder weights
        self.W_enc = np.random.randn(input_dim, hidden_dim) * 0.01
        self.b_enc = np.zeros(hidden_dim)

        # Latent space (mean and log variance)
        self.W_mu = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_mu = np.zeros(latent_dim)
        self.W_logvar = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_logvar = np.zeros(latent_dim)

        # Decoder weights
        self.W_dec1 = np.random.randn(latent_dim, hidden_dim) * 0.01
        self.b_dec1 = np.zeros(hidden_dim)
        self.W_dec2 = np.random.randn(hidden_dim, input_dim) * 0.01
        self.b_dec2 = np.zeros(input_dim)

        self.latent_dim = latent_dim

    def encode(self, x: np.ndarray) -> tuple:
        """
        Encode input to latent distribution parameters.

        Returns:
            mu: Mean of latent distribution
            log_var: Log variance of latent distribution
        """
        # Your code here
        pass

    def reparameterize(self, mu: np.ndarray, log_var: np.ndarray) -> np.ndarray:
        """
        Reparameterization trick: z = mu + std * epsilon
        """
        # Your code here
        pass

    def decode(self, z: np.ndarray) -> np.ndarray:
        """
        Decode latent vector to reconstruction.
        """
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> dict:
        """
        Full forward pass.

        Returns:
            Dictionary with mu, log_var, z, x_reconstructed
        """
        # Your code here
        pass

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     mu: np.ndarray, log_var: np.ndarray) -> dict:
        """
        Compute VAE loss (ELBO).

        Returns:
            Dictionary with total_loss, recon_loss, kl_loss
        """
        # Your code here
        pass

    def sample(self, num_samples: int) -> np.ndarray:
        """
        Generate samples by decoding random latent vectors.
        """
        # Your code here
        pass
`,
    testCases: [
      {
        id: '1',
        description: 'Reconstruction shape',
        input: 'VAE(784, 256, 20).forward(np.random.randn(4, 784))["x_recon"].shape',
        expected: '(4, 784)',
        hidden: false,
      },
      {
        id: '2',
        description: 'KL divergence non-negative',
        input: '(lambda: (vae := VAE(784, 256, 20), x := np.random.randn(4, 784), out := vae.forward(x), loss := vae.compute_loss(x, out["x_recon"], out["mu"], out["log_var"]), bool(loss["kl_loss"] >= 0))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Latent space shape',
        input: 'VAE(784, 256, 20).forward(np.random.randn(4, 784))["z"].shape',
        expected: '(4, 20)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Sample shape matches input dim',
        input: 'VAE(784, 256, 20).sample(3).shape',
        expected: '(3, 784)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Total loss equals recon + KL',
        input: '(lambda: (vae := VAE(784, 256, 20), x := np.random.randn(4, 784), out := vae.forward(x), loss := vae.compute_loss(x, out["x_recon"], out["mu"], out["log_var"]), bool(np.allclose(loss["total_loss"], loss["recon_loss"] + loss["kl_loss"])))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Encoder: h = relu(x @ W + b), then mu = h @ W_mu, logvar = h @ W_logvar',
      'Reparameterize: std = exp(0.5 * log_var), z = mu + std * epsilon',
      'KL = -0.5 * mean(1 + log_var - mu² - exp(log_var))',
      'Reconstruction loss: MSE or BCE',
    ],
    solution: `import numpy as np

class VAE:
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        np.random.seed(42)

        self.W_enc = np.random.randn(input_dim, hidden_dim) * 0.01
        self.b_enc = np.zeros(hidden_dim)
        self.W_mu = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_mu = np.zeros(latent_dim)
        self.W_logvar = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_logvar = np.zeros(latent_dim)
        self.W_dec1 = np.random.randn(latent_dim, hidden_dim) * 0.01
        self.b_dec1 = np.zeros(hidden_dim)
        self.W_dec2 = np.random.randn(hidden_dim, input_dim) * 0.01
        self.b_dec2 = np.zeros(input_dim)
        self.latent_dim = latent_dim

    def encode(self, x: np.ndarray) -> tuple:
        h = np.maximum(0, x @ self.W_enc + self.b_enc)
        mu = h @ self.W_mu + self.b_mu
        log_var = h @ self.W_logvar + self.b_logvar
        return mu, log_var

    def reparameterize(self, mu: np.ndarray, log_var: np.ndarray) -> np.ndarray:
        std = np.exp(0.5 * log_var)
        eps = np.random.randn(*mu.shape)
        return mu + std * eps

    def decode(self, z: np.ndarray) -> np.ndarray:
        h = np.maximum(0, z @ self.W_dec1 + self.b_dec1)
        x_recon = 1 / (1 + np.exp(-(h @ self.W_dec2 + self.b_dec2)))  # Sigmoid
        return x_recon

    def forward(self, x: np.ndarray) -> dict:
        mu, log_var = self.encode(x)
        z = self.reparameterize(mu, log_var)
        x_recon = self.decode(z)
        return {'mu': mu, 'log_var': log_var, 'z': z, 'x_recon': x_recon}

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     mu: np.ndarray, log_var: np.ndarray) -> dict:
        # Reconstruction loss (MSE)
        recon_loss = np.mean((x - x_recon) ** 2)

        # KL divergence
        kl_loss = -0.5 * np.mean(1 + log_var - mu**2 - np.exp(log_var))

        total_loss = recon_loss + kl_loss

        return {'total_loss': total_loss, 'recon_loss': recon_loss, 'kl_loss': kl_loss}

    def sample(self, num_samples: int) -> np.ndarray:
        z = np.random.randn(num_samples, self.latent_dim)
        return self.decode(z)
`,
  },
  {
    id: 'e2e-vqvae',
    title: 'E2E: Vector Quantized VAE',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End VQ-VAE

Implement a complete VQ-VAE (Vector Quantized Variational Autoencoder) with encoder, vector quantization, and decoder.

### Architecture
\`\`\`
Encoder: x → z_e (continuous latents)
           ↓
Vector Quantization: z_e → z_q (discrete latents from codebook)
           ↓
Decoder: z_q → x_reconstructed
\`\`\`

### Key Difference from VAE
- VAE: Continuous latent space with KL regularization
- VQ-VAE: Discrete latent space using learned codebook

### Vector Quantization
1. Encoder outputs continuous vectors z_e
2. Find nearest codebook entry for each spatial position
3. Replace z_e with quantized z_q from codebook
4. Use straight-through estimator for gradients

### Loss Function
\`\`\`
L = L_reconstruction + L_codebook + β * L_commitment

L_reconstruction = ||x - x_hat||²
L_codebook = ||sg[z_e] - e||²  (moves codebook toward encoder output)
L_commitment = ||z_e - sg[e]||²  (commits encoder to codebook)
\`\`\`
Where sg[] is stop-gradient.

### Codebook EMA Update (Alternative)
Instead of gradient updates, codebook can be updated with exponential moving average:
\`\`\`
N_i = γ * N_i + (1 - γ) * n_i     (count of assignments)
m_i = γ * m_i + (1 - γ) * sum(z_e assigned to i)
e_i = m_i / N_i
\`\`\`

### Task
Implement encoder, vector quantization layer, decoder, and all loss components.
    `,
    examples: [
      {
        input: 'VQVAE(input_dim=784, num_embeddings=512, embedding_dim=64)',
        output: 'Reconstructed images + discrete codes',
        explanation: 'Full VQ-VAE forward pass',
      },
    ],
    starterCode: `import numpy as np

class VectorQuantizer:
    def __init__(self, num_embeddings: int, embedding_dim: int):
        """
        Vector Quantization layer.

        Args:
            num_embeddings: Size of codebook (K)
            embedding_dim: Dimension of each embedding
        """
        np.random.seed(42)
        # Initialize codebook with small random values
        self.embedding = np.random.randn(num_embeddings, embedding_dim) * 0.1
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: np.ndarray) -> tuple:
        """
        Quantize encoder output to nearest codebook entries.

        Args:
            z_e: Encoder output (batch, height, width, embedding_dim)

        Returns:
            z_q: Quantized vectors (same shape as z_e)
            indices: Codebook indices (batch, height, width)
            distances: Distances to nearest embeddings
        """
        # Your code here
        pass

    def compute_loss(self, z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        """
        Compute VQ losses.

        Args:
            z_e: Encoder output
            z_q: Quantized vectors
            beta: Commitment loss weight

        Returns:
            Dictionary with codebook_loss and commitment_loss
        """
        # Your code here
        pass


class VQVAE:
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        """
        Initialize VQ-VAE.

        Args:
            input_channels: Number of input channels
            hidden_dim: Hidden layer dimension
            num_embeddings: Codebook size
            embedding_dim: Embedding dimension
        """
        np.random.seed(42)

        # Encoder: conv layers to get spatial feature maps
        self.enc_conv1_w = np.random.randn(hidden_dim, input_channels, 4, 4) * 0.1
        self.enc_conv1_b = np.zeros(hidden_dim)
        self.enc_conv2_w = np.random.randn(embedding_dim, hidden_dim, 4, 4) * 0.1
        self.enc_conv2_b = np.zeros(embedding_dim)

        # Vector Quantizer
        self.vq = VectorQuantizer(num_embeddings, embedding_dim)

        # Decoder: transposed conv to reconstruct
        self.dec_conv1_w = np.random.randn(hidden_dim, embedding_dim, 4, 4) * 0.1
        self.dec_conv1_b = np.zeros(hidden_dim)
        self.dec_conv2_w = np.random.randn(input_channels, hidden_dim, 4, 4) * 0.1
        self.dec_conv2_b = np.zeros(input_channels)

        self.embedding_dim = embedding_dim

    def encode(self, x: np.ndarray) -> np.ndarray:
        """
        Encode input to continuous latent representation.

        Args:
            x: Input (batch, channels, height, width)

        Returns:
            z_e: Encoder output (batch, height', width', embedding_dim)
        """
        # Your code here (simplified: use strided conv or just reshape for demo)
        pass

    def decode(self, z_q: np.ndarray) -> np.ndarray:
        """
        Decode quantized latents to reconstruction.

        Args:
            z_q: Quantized vectors (batch, height, width, embedding_dim)

        Returns:
            x_recon: Reconstructed input
        """
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> dict:
        """
        Full forward pass.

        Returns:
            Dictionary with z_e, z_q, indices, x_recon
        """
        # Your code here
        pass

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        """
        Compute total VQ-VAE loss.

        Returns:
            Dictionary with total_loss, recon_loss, vq_loss, commitment_loss
        """
        # Your code here
        pass

    def get_codebook_usage(self, indices: np.ndarray) -> np.ndarray:
        """
        Compute codebook usage statistics.

        Returns:
            usage: Count of each codebook entry used
        """
        # Your code here
        pass
`,
    testCases: [
      {
        id: '1',
        description: 'Quantization shape',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), z_q, idx, dist := vq.quantize(z_e), z_q.shape == z_e.shape)[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Indices valid range',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), z_q, idx, dist := vq.quantize(z_e), bool(np.all(idx >= 0) and np.all(idx < 512)))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Quantized from codebook',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), z_q, idx, dist := vq.quantize(z_e), bool(np.allclose(z_q[0, 0, 0], vq.embedding[idx[0, 0, 0]])))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Loss values correct',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), z_q, idx, dist := vq.quantize(z_e), losses := vq.compute_loss(z_e, z_q), bool(losses["codebook_loss"] >= 0 and losses["commitment_loss"] >= 0))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'For quantization: flatten spatial dims, compute distances, find argmin',
      'Distance: ||z - e||² = ||z||² + ||e||² - 2*z·e',
      'Straight-through: z_q = z_e + stop_grad(z_q - z_e)',
      'Codebook loss uses z_e detached, commitment uses z_q detached',
      'For simplified encoder/decoder, use reshape operations',
    ],
    solution: `import numpy as np

class VectorQuantizer:
    def __init__(self, num_embeddings: int, embedding_dim: int):
        np.random.seed(42)
        self.embedding = np.random.randn(num_embeddings, embedding_dim) * 0.1
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: np.ndarray) -> tuple:
        # z_e: (batch, H, W, D)
        batch, H, W, D = z_e.shape

        # Flatten spatial dimensions
        z_flat = z_e.reshape(-1, D)  # (N, D) where N = batch * H * W

        # Compute distances: ||z - e||² = ||z||² + ||e||² - 2*z·e
        z_sq = np.sum(z_flat ** 2, axis=1, keepdims=True)  # (N, 1)
        e_sq = np.sum(self.embedding ** 2, axis=1)          # (K,)
        cross = z_flat @ self.embedding.T                    # (N, K)
        distances = z_sq + e_sq - 2 * cross                  # (N, K)

        # Find nearest embedding
        indices_flat = np.argmin(distances, axis=1)          # (N,)

        # Get quantized vectors
        z_q_flat = self.embedding[indices_flat]              # (N, D)

        # Reshape back
        z_q = z_q_flat.reshape(batch, H, W, D)
        indices = indices_flat.reshape(batch, H, W)
        min_distances = np.min(distances, axis=1).reshape(batch, H, W)

        return z_q, indices, min_distances

    def compute_loss(self, z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        # Codebook loss: ||sg[z_e] - z_q||²
        # In practice, this updates the codebook to move toward encoder output
        codebook_loss = np.mean((z_e - z_q) ** 2)

        # Commitment loss: ||z_e - sg[z_q]||²
        # This commits the encoder output to stay close to codebook
        commitment_loss = beta * np.mean((z_e - z_q) ** 2)

        return {
            'codebook_loss': codebook_loss,
            'commitment_loss': commitment_loss
        }


class VQVAE:
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        np.random.seed(42)

        self.input_channels = input_channels
        self.hidden_dim = hidden_dim
        self.embedding_dim = embedding_dim

        # Simplified: use linear projection instead of conv for demo
        # Encoder projects input to embedding space
        self.enc_w1 = np.random.randn(input_channels * 16, hidden_dim) * 0.1
        self.enc_b1 = np.zeros(hidden_dim)
        self.enc_w2 = np.random.randn(hidden_dim, embedding_dim) * 0.1
        self.enc_b2 = np.zeros(embedding_dim)

        # Vector Quantizer
        self.vq = VectorQuantizer(num_embeddings, embedding_dim)

        # Decoder projects back
        self.dec_w1 = np.random.randn(embedding_dim, hidden_dim) * 0.1
        self.dec_b1 = np.zeros(hidden_dim)
        self.dec_w2 = np.random.randn(hidden_dim, input_channels * 16) * 0.1
        self.dec_b2 = np.zeros(input_channels * 16)

    def encode(self, x: np.ndarray) -> np.ndarray:
        # x: (batch, channels, H, W) - assume H=W=4 for simplicity
        batch = x.shape[0]

        # Flatten spatial dimensions
        x_flat = x.reshape(batch, -1)  # (batch, channels * H * W)

        # Encode
        h = np.maximum(0, x_flat @ self.enc_w1 + self.enc_b1)  # ReLU
        z_e = x_flat @ self.enc_w1[:, :self.embedding_dim] + self.enc_b1[:self.embedding_dim]

        # Reshape to spatial format (batch, 2, 2, embedding_dim)
        z_e = z_e.reshape(batch, 1, 1, self.embedding_dim)

        return z_e

    def decode(self, z_q: np.ndarray) -> np.ndarray:
        batch = z_q.shape[0]

        # Flatten
        z_flat = z_q.reshape(batch, -1)  # (batch, embedding_dim)

        # Decode
        h = np.maximum(0, z_flat @ self.dec_w1 + self.dec_b1)  # ReLU
        x_recon = h @ self.dec_w2 + self.dec_b2

        # Reshape to image format
        x_recon = x_recon.reshape(batch, self.input_channels, 4, 4)

        return x_recon

    def forward(self, x: np.ndarray) -> dict:
        # Encode
        z_e = self.encode(x)

        # Quantize
        z_q, indices, distances = self.vq.quantize(z_e)

        # Straight-through estimator: gradient flows through z_q to z_e
        # z_q_st = z_e + (z_q - z_e).detach()
        # For forward pass, we just use z_q

        # Decode
        x_recon = self.decode(z_q)

        return {
            'z_e': z_e,
            'z_q': z_q,
            'indices': indices,
            'x_recon': x_recon
        }

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        # Reconstruction loss
        recon_loss = np.mean((x - x_recon) ** 2)

        # VQ losses
        vq_losses = self.vq.compute_loss(z_e, z_q, beta)

        # Total loss
        total_loss = recon_loss + vq_losses['codebook_loss'] + vq_losses['commitment_loss']

        return {
            'total_loss': total_loss,
            'recon_loss': recon_loss,
            'codebook_loss': vq_losses['codebook_loss'],
            'commitment_loss': vq_losses['commitment_loss']
        }

    def get_codebook_usage(self, indices: np.ndarray) -> np.ndarray:
        usage = np.bincount(indices.flatten(), minlength=self.vq.num_embeddings)
        return usage
`,
  },
  {
    id: 'e2e-diffusion',
    title: 'E2E: Diffusion Model',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End Diffusion Model

Implement core components of a diffusion model (DDPM-style).

### Forward Process (Adding Noise)
\`\`\`
x_t = sqrt(α_bar_t) * x_0 + sqrt(1 - α_bar_t) * ε
\`\`\`

### Noise Schedule
\`\`\`
β_t: Linear from β_start to β_end
α_t = 1 - β_t
α_bar_t = cumulative product of α_t
\`\`\`

### Training Objective
\`\`\`
L = ||ε - ε_θ(x_t, t)||²
\`\`\`

Model learns to predict the noise added at timestep t.

### Reverse Process (Sampling)
\`\`\`
x_{t-1} = (1/sqrt(α_t)) * (x_t - (β_t/sqrt(1-α_bar_t)) * ε_θ(x_t, t)) + σ_t * z
\`\`\`

### Task
Implement noise schedule, forward process, and reverse sampling.
    `,
    examples: [
      {
        input: 'DiffusionModel(T=1000)',
        output: 'Denoised samples',
        explanation: 'Forward and reverse diffusion',
      },
    ],
    starterCode: `import numpy as np

class DiffusionModel:
    def __init__(self, T: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        """
        Initialize diffusion model.

        Args:
            T: Number of diffusion timesteps
            beta_start: Starting noise level
            beta_end: Ending noise level
        """
        self.T = T

        # Compute noise schedule
        # Your code here
        pass

    def get_noise_schedule(self) -> dict:
        """Return computed noise schedule parameters."""
        # Your code here
        pass

    def forward_diffusion(self, x_0: np.ndarray, t: int) -> tuple:
        """
        Add noise to data at timestep t.

        Args:
            x_0: Original data (batch, ...)
            t: Timestep

        Returns:
            x_t: Noisy data
            noise: The noise that was added
        """
        np.random.seed(42)
        # Your code here
        pass

    def reverse_step(self, x_t: np.ndarray, t: int, predicted_noise: np.ndarray) -> np.ndarray:
        """
        Single reverse diffusion step.

        Args:
            x_t: Noisy data at timestep t
            t: Current timestep
            predicted_noise: Noise predicted by model

        Returns:
            x_{t-1}: Less noisy data
        """
        # Your code here
        pass

    def compute_loss(self, true_noise: np.ndarray, predicted_noise: np.ndarray) -> float:
        """Compute MSE loss between true and predicted noise."""
        # Your code here
        pass

    def sample(self, shape: tuple, noise_predictor) -> np.ndarray:
        """
        Generate samples using reverse diffusion.

        Args:
            shape: Shape of samples to generate
            noise_predictor: Function that predicts noise given (x_t, t)

        Returns:
            Generated samples
        """
        # Your code here
        pass
`,
    testCases: [
      {
        id: '1',
        description: 'Alpha bar decreases',
        input: '(lambda: (dm := DiffusionModel(1000), sched := dm.get_noise_schedule(), bool(sched["alpha_bars"][-1] < sched["alpha_bars"][0]))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Forward noise shape',
        input: '(lambda: (dm := DiffusionModel(1000), x_0 := np.random.randn(4, 32), x_t, noise := dm.forward_diffusion(x_0, 500), x_t.shape == x_0.shape)[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Noise schedule length matches T',
        input: '(lambda: (dm := DiffusionModel(500), sched := dm.get_noise_schedule(), len(sched["betas"]) == 500 and len(sched["alpha_bars"]) == 500)[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'MSE loss is zero for identical noise',
        input: '(lambda: (dm := DiffusionModel(100), noise := np.random.randn(4, 16), round(dm.compute_loss(noise, noise), 6))[-1])()',
        expected: '0.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Forward diffusion at t=0 is close to original',
        input: '(lambda: (dm := DiffusionModel(1000), x_0 := np.ones((2, 8)), x_t, noise := dm.forward_diffusion(x_0, 0), bool(np.allclose(x_t, x_0, atol=0.5)))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'betas = np.linspace(beta_start, beta_end, T)',
      'alpha_bars = np.cumprod(1 - betas)',
      'x_t = sqrt(alpha_bar) * x_0 + sqrt(1 - alpha_bar) * noise',
      'Reverse: use mean and add small noise (except at t=0)',
    ],
    solution: `import numpy as np

class DiffusionModel:
    def __init__(self, T: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        self.T = T

        # Linear noise schedule
        self.betas = np.linspace(beta_start, beta_end, T)
        self.alphas = 1 - self.betas
        self.alpha_bars = np.cumprod(self.alphas)

        # For reverse process
        self.sqrt_alpha_bars = np.sqrt(self.alpha_bars)
        self.sqrt_one_minus_alpha_bars = np.sqrt(1 - self.alpha_bars)
        self.sqrt_alphas = np.sqrt(self.alphas)

    def get_noise_schedule(self) -> dict:
        return {
            'betas': self.betas,
            'alphas': self.alphas,
            'alpha_bars': self.alpha_bars
        }

    def forward_diffusion(self, x_0: np.ndarray, t: int) -> tuple:
        np.random.seed(42)
        noise = np.random.randn(*x_0.shape)

        sqrt_alpha_bar = self.sqrt_alpha_bars[t]
        sqrt_one_minus_alpha_bar = self.sqrt_one_minus_alpha_bars[t]

        x_t = sqrt_alpha_bar * x_0 + sqrt_one_minus_alpha_bar * noise

        return x_t, noise

    def reverse_step(self, x_t: np.ndarray, t: int, predicted_noise: np.ndarray) -> np.ndarray:
        alpha = self.alphas[t]
        alpha_bar = self.alpha_bars[t]
        beta = self.betas[t]

        # Mean of reverse distribution
        coef1 = 1 / np.sqrt(alpha)
        coef2 = beta / np.sqrt(1 - alpha_bar)
        mean = coef1 * (x_t - coef2 * predicted_noise)

        if t > 0:
            # Add noise (except at final step)
            sigma = np.sqrt(beta)
            noise = np.random.randn(*x_t.shape)
            x_prev = mean + sigma * noise
        else:
            x_prev = mean

        return x_prev

    def compute_loss(self, true_noise: np.ndarray, predicted_noise: np.ndarray) -> float:
        return np.mean((true_noise - predicted_noise) ** 2)

    def sample(self, shape: tuple, noise_predictor) -> np.ndarray:
        # Start from pure noise
        x = np.random.randn(*shape)

        # Reverse diffusion
        for t in reversed(range(self.T)):
            predicted_noise = noise_predictor(x, t)
            x = self.reverse_step(x, t, predicted_noise)

        return x
`,
  },
  {
    id: 'e2e-cnn',
    title: 'E2E: Convolutional Neural Network',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End CNN

Implement a complete CNN for image classification.

### Architecture
\`\`\`
Input (batch, channels, height, width)
  ↓
Conv2D(in_channels, 32, kernel=3) + ReLU
  ↓
MaxPool2D(2x2)
  ↓
Conv2D(32, 64, kernel=3) + ReLU
  ↓
MaxPool2D(2x2)
  ↓
Flatten
  ↓
Linear(flattened_size, 128) + ReLU
  ↓
Linear(128, num_classes)
  ↓
Softmax
\`\`\`

### Components
- 2D Convolution (no padding for simplicity)
- Max Pooling
- Flatten
- Fully Connected layers

### Task
Implement conv2d, maxpool, and combine into CNN.
    `,
    examples: [
      {
        input: 'CNN on 28x28 grayscale images',
        output: 'Class probabilities',
        explanation: 'Full CNN forward pass',
      },
    ],
    starterCode: `import numpy as np

def conv2d(x: np.ndarray, kernel: np.ndarray, bias: np.ndarray) -> np.ndarray:
    """
    2D convolution (no padding, stride=1).

    Args:
        x: Input (batch, in_channels, height, width)
        kernel: Weights (out_channels, in_channels, kH, kW)
        bias: Bias (out_channels,)

    Returns:
        output: (batch, out_channels, out_height, out_width)
    """
    # Your code here
    pass


def maxpool2d(x: np.ndarray, pool_size: int = 2) -> np.ndarray:
    """
    2D max pooling.

    Args:
        x: Input (batch, channels, height, width)
        pool_size: Size of pooling window

    Returns:
        output: Pooled tensor
    """
    # Your code here
    pass


def flatten(x: np.ndarray) -> np.ndarray:
    """Flatten all dimensions except batch."""
    # Your code here
    pass


class CNN:
    def __init__(self, input_shape: tuple, num_classes: int):
        """
        Initialize CNN.

        Args:
            input_shape: (channels, height, width)
            num_classes: Number of output classes
        """
        np.random.seed(42)
        in_channels, H, W = input_shape

        # Conv layer 1: in_channels -> 32
        self.conv1_w = np.random.randn(32, in_channels, 3, 3) * 0.1
        self.conv1_b = np.zeros(32)

        # Conv layer 2: 32 -> 64
        self.conv2_w = np.random.randn(64, 32, 3, 3) * 0.1
        self.conv2_b = np.zeros(64)

        # Calculate flattened size after convolutions and pooling
        # Your code to compute this
        pass

        # Fully connected layers
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass through CNN.

        Args:
            x: Input images (batch, channels, height, width)

        Returns:
            logits: (batch, num_classes)
        """
        # Your code here
        pass


def test_cnn():
    """Test CNN with sample data."""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Conv output shape',
        input: 'conv2d(np.random.randn(2, 1, 8, 8), np.random.randn(32, 1, 3, 3), np.zeros(32)).shape',
        expected: '(2, 32, 6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Pool output shape',
        input: 'maxpool2d(np.random.randn(2, 32, 8, 8), pool_size=2).shape',
        expected: '(2, 32, 4, 4)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Flatten preserves batch dimension',
        input: 'flatten(np.random.randn(4, 64, 3, 3)).shape',
        expected: '(4, 576)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Full CNN forward pass shape',
        input: 'CNN(input_shape=(1, 28, 28), num_classes=10).forward(np.random.randn(2, 1, 28, 28)).shape',
        expected: '(2, 10)',
        hidden: true,
      },
    ],
    hints: [
      'Conv output size: (input - kernel + 1) for stride=1, no padding',
      'Pool output size: input // pool_size',
      'Use nested loops for convolution (or np.lib.stride_tricks)',
      'Flatten: x.reshape(batch_size, -1)',
    ],
    solution: `import numpy as np

def conv2d(x: np.ndarray, kernel: np.ndarray, bias: np.ndarray) -> np.ndarray:
    batch, in_ch, H, W = x.shape
    out_ch, _, kH, kW = kernel.shape
    out_H = H - kH + 1
    out_W = W - kW + 1

    output = np.zeros((batch, out_ch, out_H, out_W))

    for b in range(batch):
        for oc in range(out_ch):
            for i in range(out_H):
                for j in range(out_W):
                    receptive_field = x[b, :, i:i+kH, j:j+kW]
                    output[b, oc, i, j] = np.sum(receptive_field * kernel[oc]) + bias[oc]

    return output


def maxpool2d(x: np.ndarray, pool_size: int = 2) -> np.ndarray:
    batch, channels, H, W = x.shape
    out_H = H // pool_size
    out_W = W // pool_size

    output = np.zeros((batch, channels, out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            h_start = i * pool_size
            w_start = j * pool_size
            output[:, :, i, j] = np.max(
                x[:, :, h_start:h_start+pool_size, w_start:w_start+pool_size],
                axis=(2, 3)
            )

    return output


def flatten(x: np.ndarray) -> np.ndarray:
    return x.reshape(x.shape[0], -1)


class CNN:
    def __init__(self, input_shape: tuple, num_classes: int):
        np.random.seed(42)
        in_channels, H, W = input_shape

        # Conv layers
        self.conv1_w = np.random.randn(32, in_channels, 3, 3) * 0.1
        self.conv1_b = np.zeros(32)
        self.conv2_w = np.random.randn(64, 32, 3, 3) * 0.1
        self.conv2_b = np.zeros(64)

        # Calculate size after convolutions and pooling
        # After conv1 (3x3): H-2, W-2
        # After pool1 (2x2): (H-2)//2, (W-2)//2
        # After conv2 (3x3): (H-2)//2 - 2, (W-2)//2 - 2
        # After pool2 (2x2): ((H-2)//2 - 2)//2, ((W-2)//2 - 2)//2
        h1 = (H - 2) // 2
        w1 = (W - 2) // 2
        h2 = (h1 - 2) // 2
        w2 = (w1 - 2) // 2
        flat_size = 64 * h2 * w2

        # FC layers
        self.fc1_w = np.random.randn(flat_size, 128) * 0.1
        self.fc1_b = np.zeros(128)
        self.fc2_w = np.random.randn(128, num_classes) * 0.1
        self.fc2_b = np.zeros(num_classes)

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Conv block 1
        x = conv2d(x, self.conv1_w, self.conv1_b)
        x = np.maximum(0, x)  # ReLU
        x = maxpool2d(x)

        # Conv block 2
        x = conv2d(x, self.conv2_w, self.conv2_b)
        x = np.maximum(0, x)  # ReLU
        x = maxpool2d(x)

        # Flatten
        x = flatten(x)

        # FC layers
        x = np.maximum(0, x @ self.fc1_w + self.fc1_b)  # ReLU
        x = x @ self.fc2_w + self.fc2_b  # Logits

        return x


def test_cnn():
    # Test with MNIST-like data
    cnn = CNN(input_shape=(1, 28, 28), num_classes=10)
    x = np.random.randn(4, 1, 28, 28)
    logits = cnn.forward(x)
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {logits.shape}")
    return logits.shape == (4, 10)
`,
  },
];
