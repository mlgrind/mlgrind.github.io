import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../e2e-implementations.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const e2eImplementationsPyTorch: Record<string, LanguageVariant> = {
  'e2e-mlp': {
    note: "MLP is an nn.Module with nn.Parameter weights. Write backward() by hand (no loss.backward() or F.cross_entropy inside the class); a hidden test checks your gradients against autograd. compute_loss returns a scalar tensor.",
    starterCode: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class MLP(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        """Initialize 2-layer MLP with random weights."""
        super().__init__()
        torch.manual_seed(42)
        # He initialization
        self.W1 = nn.Parameter(torch.randn(input_dim, hidden_dim) * math.sqrt(2.0 / input_dim))
        self.b1 = nn.Parameter(torch.zeros(hidden_dim))
        self.W2 = nn.Parameter(torch.randn(hidden_dim, output_dim) * math.sqrt(2.0 / hidden_dim))
        self.b2 = nn.Parameter(torch.zeros(output_dim))

        # Cache for backward pass
        self.cache = {}

    def forward(self, X: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.

        Args:
            X: Input (batch, input_dim)

        Returns:
            logits: Output (batch, output_dim)
        """
        # Your code here
        pass

    def compute_loss(self, logits: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
        """
        Compute cross-entropy loss (and cache the softmax probabilities).

        Args:
            logits: Model output (batch, output_dim)
            y: True labels (batch,) as int64

        Returns:
            loss: Scalar tensor (call .item() for a float)
        """
        # Your code here
        pass

    def backward(self, y: torch.Tensor) -> dict:
        """
        Backward pass, derived by hand from the cached forward values.

        Args:
            y: True labels (batch,) as int64

        Returns:
            gradients: Dictionary with dW1, db1, dW2, db2 (mean loss over the batch)
        """
        # Your code here
        pass

    def train_step(self, X: torch.Tensor, y: torch.Tensor, lr: float = 0.01) -> float:
        """
        Single training step: forward, loss, backward, update.

        Returns:
            loss: Loss value before update (Python float)
        """
        # Your code here
        pass


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    """Train MLP (hidden_dim=64) and return (model, loss history)."""
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class MLP(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        super().__init__()
        torch.manual_seed(42)
        self.W1 = nn.Parameter(torch.randn(input_dim, hidden_dim) * math.sqrt(2.0 / input_dim))
        self.b1 = nn.Parameter(torch.zeros(hidden_dim))
        self.W2 = nn.Parameter(torch.randn(hidden_dim, output_dim) * math.sqrt(2.0 / hidden_dim))
        self.b2 = nn.Parameter(torch.zeros(output_dim))
        self.cache = {}

    def forward(self, X: torch.Tensor) -> torch.Tensor:
        z1 = X @ self.W1 + self.b1
        h = torch.relu(z1)
        logits = h @ self.W2 + self.b2
        self.cache = {'X': X, 'z1': z1, 'h': h, 'logits': logits}
        return logits

    def compute_loss(self, logits: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
        # Numerically stable log-softmax
        log_probs = logits - torch.logsumexp(logits, dim=-1, keepdim=True)
        self.cache['probs'] = log_probs.exp()
        return -log_probs[torch.arange(logits.shape[0]), y].mean()

    def backward(self, y: torch.Tensor) -> dict:
        with torch.no_grad():
            X = self.cache['X'].detach()
            z1 = self.cache['z1'].detach()
            h = self.cache['h'].detach()
            probs = self.cache['probs'].detach()
            batch_size = X.shape[0]

            y_onehot = F.one_hot(y, probs.shape[1]).float()

            # Output layer (softmax + cross-entropy, mean over the batch)
            d_logits = (probs - y_onehot) / batch_size
            dW2 = h.T @ d_logits
            db2 = d_logits.sum(dim=0)

            # Hidden layer
            d_h = d_logits @ self.W2.T
            d_relu = d_h * (z1 > 0).float()
            dW1 = X.T @ d_relu
            db1 = d_relu.sum(dim=0)

        return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}

    def train_step(self, X: torch.Tensor, y: torch.Tensor, lr: float = 0.01) -> float:
        logits = self.forward(X)
        loss = self.compute_loss(logits, y)
        grads = self.backward(y)

        # Plain SGD update on the parameters (no autograd tracking)
        with torch.no_grad():
            self.W1 -= lr * grads['dW1']
            self.b1 -= lr * grads['db1']
            self.W2 -= lr * grads['dW2']
            self.b2 -= lr * grads['db2']

        return loss.item()


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    input_dim = X_train.shape[1]
    output_dim = len(torch.unique(y_train))
    model = MLP(input_dim, 64, output_dim)

    losses = []
    for _ in range(epochs):
        losses.append(model.train_step(X_train, y_train, lr))
    return model, losses
`,
    testCases: [
      {
        id: '1',
        description: 'Forward pass shape',
        input: 'MLP(784, 128, 10).forward(torch.randn(4, 784)).shape',
        expected: '(4, 10)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Loss decreases',
        input: '(lambda: (m := MLP(10, 8, 3), X := torch.randn(16, 10), y := torch.tensor([0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0]), losses := [m.train_step(X, y) for _ in range(50)], bool(losses[-1] < losses[0]))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Loss matches the cross-entropy of the logits',
        input: '(lambda: (m := MLP(10, 8, 3), X := torch.randn(4, 10), y := torch.tensor([0, 1, 2, 0]), logits := m.forward(X), bool(abs(float(m.compute_loss(logits, y)) - torch.nn.functional.cross_entropy(logits, y).item()) < 1e-5))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Gradients computed for every parameter',
        input: '(lambda: (m := MLP(10, 8, 3), X := torch.randn(4, 10), y := torch.tensor([0, 1, 2, 0]), _ := m.compute_loss(m.forward(X), y), g := m.backward(y), sorted(g.keys()))[-1])()',
        expected: '["dW1", "dW2", "db1", "db2"]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Manual gradients match autograd',
        input: `(lambda: (
            m := MLP(10, 8, 3), X := torch.randn(6, 10), y := torch.tensor([0, 1, 2, 0, 2, 1]),
            loss := m.compute_loss(m.forward(X), y),
            g := m.backward(y),
            loss.backward(),
            bool(torch.allclose(g['dW1'], m.W1.grad, atol=1e-5) and torch.allclose(g['db1'], m.b1.grad, atol=1e-5)
                 and torch.allclose(g['dW2'], m.W2.grad, atol=1e-5) and torch.allclose(g['db2'], m.b2.grad, atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'train_step applies W -= lr * dW',
        input: `(lambda: (
            m := MLP(5, 4, 2), X := torch.randn(3, 5), y := torch.tensor([0, 1, 1]),
            W2_before := m.W2.detach().clone(),
            _ := m.compute_loss(m.forward(X), y), g := m.backward(y),
            _ := m.train_step(X, y, lr=0.5),
            bool(isinstance(m, torch.nn.Module) and torch.allclose(m.W2.detach(), W2_before - 0.5 * g['dW2'], atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'train_mlp returns the model and a decreasing loss history',
        input: '(lambda: (r := train_mlp(torch.randn(20, 5), torch.tensor([0, 1] * 10), epochs=20, lr=0.1), bool(len(r[1]) == 20 and r[1][-1] < r[1][0]))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Cache X, z1 (pre-activation), h and logits in forward',
      'Stable log-softmax: logits - torch.logsumexp(logits, dim=-1, keepdim=True)',
      'd_logits = (probs - one_hot(y)) / batch_size; dW2 = h.T @ d_logits; d_relu = (d_logits @ W2.T) * (z1 > 0)',
      'Update parameters inside torch.no_grad(): self.W1 -= lr * dW1',
    ],
  },

  'e2e-transformer': {
    note: "TransformerEncoderBlock is an nn.Module with nn.Parameter weights. Implement attention and layer norm with tensor ops: don't use nn.MultiheadAttention, F.scaled_dot_product_attention, F.layer_norm/nn.LayerNorm or nn.TransformerEncoderLayer. Hidden tests compare each piece against those built-ins.",
    starterCode: `import math
import torch
import torch.nn as nn


def softmax(x, dim=-1):
    return torch.softmax(x, dim=dim)


def layer_norm(x, gamma, beta, eps=1e-5):
    """Layer normalization over the last dimension."""
    # Your code here
    pass


def positional_encoding(seq_len, d_model):
    """Sinusoidal positional encoding (seq_len, d_model)."""
    # Your code here
    pass


def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Scaled dot-product attention over the last two dims.
    mask (optional) is additive (0 / -inf) and is added to the scores.

    Returns:
        (output, attention_weights)
    """
    # Your code here
    pass


def multi_head_attention(Q, K, V, num_heads):
    """Multi-head attention on (batch, seq_len, d_model) inputs, no projections."""
    # Your code here
    pass


def feed_forward(x, W1, b1, W2, b2):
    """Position-wise feed-forward network: Linear -> ReLU -> Linear"""
    # Your code here
    pass


class TransformerEncoderBlock(nn.Module):
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        """
        Initialize transformer encoder block.

        Args:
            d_model: Model dimension
            num_heads: Number of attention heads
            d_ff: Feed-forward hidden dimension
        """
        super().__init__()
        torch.manual_seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        # Initialize weights as nn.Parameter
        # Your code here

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through encoder block (post-norm).

        Args:
            x: Input (batch, seq_len, d_model)

        Returns:
            output: (batch, seq_len, d_model)
        """
        # Your code here
        pass


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    """Add positional encoding, then stack multiple encoder blocks."""
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn as nn


def softmax(x, dim=-1):
    return torch.softmax(x, dim=dim)


def layer_norm(x, gamma, beta, eps=1e-5):
    mean = x.mean(dim=-1, keepdim=True)
    var = x.var(dim=-1, keepdim=True, unbiased=False)
    return gamma * (x - mean) / torch.sqrt(var + eps) + beta


def positional_encoding(seq_len, d_model):
    PE = torch.zeros(seq_len, d_model)
    position = torch.arange(seq_len).float().unsqueeze(1)
    div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
    PE[:, 0::2] = torch.sin(position * div_term)
    PE[:, 1::2] = torch.cos(position * div_term)
    return PE


def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
    if mask is not None:
        scores = scores + mask
    attention = softmax(scores, dim=-1)
    return attention @ V, attention


def multi_head_attention(Q, K, V, num_heads):
    batch, seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    # (batch, seq_len, d_model) -> (batch, num_heads, seq_len, d_k)
    def split_heads(x):
        return x.reshape(batch, seq_len, num_heads, d_k).transpose(1, 2)

    out, _ = scaled_dot_product_attention(split_heads(Q), split_heads(K), split_heads(V))

    # Concatenate heads back to (batch, seq_len, d_model)
    return out.transpose(1, 2).reshape(batch, seq_len, d_model)


def feed_forward(x, W1, b1, W2, b2):
    return torch.relu(x @ W1 + b1) @ W2 + b2


class TransformerEncoderBlock(nn.Module):
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        super().__init__()
        torch.manual_seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        # Layer norm parameters
        self.ln1_gamma = nn.Parameter(torch.ones(d_model))
        self.ln1_beta = nn.Parameter(torch.zeros(d_model))
        self.ln2_gamma = nn.Parameter(torch.ones(d_model))
        self.ln2_beta = nn.Parameter(torch.zeros(d_model))

        # FFN parameters
        self.W1 = nn.Parameter(torch.randn(d_model, d_ff) * 0.02)
        self.b1 = nn.Parameter(torch.zeros(d_ff))
        self.W2 = nn.Parameter(torch.randn(d_ff, d_model) * 0.02)
        self.b2 = nn.Parameter(torch.zeros(d_model))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Self-attention sublayer + residual + layer norm
        attn_output = multi_head_attention(x, x, x, self.num_heads)
        x = layer_norm(x + attn_output, self.ln1_gamma, self.ln1_beta)

        # Feed-forward sublayer + residual + layer norm
        ff_output = feed_forward(x, self.W1, self.b1, self.W2, self.b2)
        return layer_norm(x + ff_output, self.ln2_gamma, self.ln2_beta)


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    seq_len = x.shape[1]
    x = x + positional_encoding(seq_len, d_model)
    for _ in range(num_layers):
        x = TransformerEncoderBlock(d_model, num_heads, d_ff)(x)
    return x
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'transformer_encoder(torch.randn(2, 10, 64), num_layers=2, d_model=64, num_heads=8, d_ff=256).shape',
        expected: '(2, 10, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Attention weights sum to 1',
        input: '(lambda: (Q := torch.randn(2, 5, 64), K := torch.randn(2, 5, 64), V := torch.randn(2, 5, 64), out_attn := scaled_dot_product_attention(Q, K, V), bool(torch.allclose(out_attn[1].sum(dim=-1), torch.ones(2, 5))))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Encoder output is layer-normalized (mean 0, variance 1 per position)',
        input: `(lambda: (
            out := transformer_encoder(torch.randn(2, 6, 16), num_layers=2, d_model=16, num_heads=4, d_ff=32),
            bool(torch.allclose(out.mean(dim=-1), torch.zeros(2, 6), atol=1e-4) and torch.allclose(out.var(dim=-1, unbiased=False), torch.ones(2, 6), atol=1e-3))
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Attention (with an additive causal mask) matches F.scaled_dot_product_attention',
        input: `(lambda: (
            Q := torch.randn(2, 5, 8), K := torch.randn(2, 5, 8), V := torch.randn(2, 5, 8),
            mask := torch.triu(torch.full((5, 5), float('-inf')), diagonal=1),
            bool(torch.allclose(scaled_dot_product_attention(Q, K, V, mask)[0], torch.nn.functional.scaled_dot_product_attention(Q, K, V, attn_mask=mask), atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'layer_norm matches F.layer_norm',
        input: `(lambda: (
            x := torch.randn(2, 3, 8) * 3, g := torch.randn(8), b := torch.randn(8),
            bool(torch.allclose(layer_norm(x, g, b), torch.nn.functional.layer_norm(x, (8,), g, b), atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'multi_head_attention matches per-head attention',
        input: `(lambda: (
            Q := torch.randn(2, 5, 16), K := torch.randn(2, 5, 16), V := torch.randn(2, 5, 16),
            heads := lambda t: t.reshape(2, 5, 4, 4).transpose(1, 2),
            ref := torch.nn.functional.scaled_dot_product_attention(heads(Q), heads(K), heads(V)).transpose(1, 2).reshape(2, 5, 16),
            bool(torch.allclose(multi_head_attention(Q, K, V, 4), ref, atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Block is an nn.Module with registered parameters; feed_forward is Linear-ReLU-Linear',
        input: `(lambda: (
            blk := TransformerEncoderBlock(8, 2, 16),
            x := torch.tensor([[1.0, -2.0]]), W1 := torch.tensor([[1.0, 0.0], [0.0, 1.0]]), W2 := torch.tensor([[2.0], [3.0]]),
            bool(isinstance(blk, torch.nn.Module) and len(list(blk.parameters())) >= 4
                 and torch.allclose(feed_forward(x, W1, torch.zeros(2), W2, torch.tensor([0.5])), torch.tensor([[2.5]])))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Positional encoding values',
        input: 'bool(torch.allclose(positional_encoding(3, 4)[2], torch.tensor([0.909297, -0.416147, 0.019999, 0.9998]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Attention: softmax(Q @ K.transpose(-2, -1) / sqrt(d_k) + mask) @ V',
      'Heads: reshape to (batch, seq, heads, d_k) and transpose(1, 2); undo it after attention',
      'Layer norm: (x - mean) / sqrt(var(unbiased=False) + eps) * gamma + beta over dim=-1',
      'Register weights as nn.Parameter in __init__ (after super().__init__())',
      'Post-norm block: x = LN(x + MHA(x)); x = LN(x + FFN(x))',
    ],
  },

  'e2e-vae': {
    note: 'VAE is an nn.Module built from nn.Linear layers. Write the reparameterization trick and the KL term yourself (no torch.distributions). compute_loss returns tensors so you can call total_loss.backward().',
    starterCode: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VAE(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        """
        Initialize VAE.

        Args:
            input_dim: Input dimension (e.g., 784 for MNIST)
            hidden_dim: Hidden layer dimension
            latent_dim: Latent space dimension
        """
        super().__init__()
        torch.manual_seed(42)

        # Encoder
        self.enc = nn.Linear(input_dim, hidden_dim)

        # Latent space (mean and log variance)
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)

        # Decoder
        self.dec1 = nn.Linear(latent_dim, hidden_dim)
        self.dec2 = nn.Linear(hidden_dim, input_dim)

        self.latent_dim = latent_dim

    def encode(self, x: torch.Tensor) -> tuple:
        """
        Encode input to latent distribution parameters.

        Returns:
            mu: Mean of latent distribution
            log_var: Log variance of latent distribution
        """
        # Your code here
        pass

    def reparameterize(self, mu: torch.Tensor, log_var: torch.Tensor) -> torch.Tensor:
        """
        Reparameterization trick: z = mu + std * epsilon
        """
        # Your code here
        pass

    def decode(self, z: torch.Tensor) -> torch.Tensor:
        """
        Decode latent vector to reconstruction (sigmoid output in [0, 1]).
        """
        # Your code here
        pass

    def forward(self, x: torch.Tensor) -> dict:
        """
        Full forward pass.

        Returns:
            Dictionary with 'mu', 'log_var', 'z', 'x_recon'
        """
        # Your code here
        pass

    def compute_loss(self, x: torch.Tensor, x_recon: torch.Tensor,
                     mu: torch.Tensor, log_var: torch.Tensor) -> dict:
        """
        Compute VAE loss (ELBO): MSE reconstruction + KL (both averaged over all elements).

        Returns:
            Dictionary with 'total_loss', 'recon_loss', 'kl_loss' (scalar tensors)
        """
        # Your code here
        pass

    def sample(self, num_samples: int) -> torch.Tensor:
        """
        Generate samples by decoding random latent vectors.
        """
        # Your code here
        pass
`,
    solution: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VAE(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        super().__init__()
        torch.manual_seed(42)
        self.enc = nn.Linear(input_dim, hidden_dim)
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)
        self.dec1 = nn.Linear(latent_dim, hidden_dim)
        self.dec2 = nn.Linear(hidden_dim, input_dim)
        self.latent_dim = latent_dim

    def encode(self, x: torch.Tensor) -> tuple:
        h = torch.relu(self.enc(x))
        return self.fc_mu(h), self.fc_logvar(h)

    def reparameterize(self, mu: torch.Tensor, log_var: torch.Tensor) -> torch.Tensor:
        std = torch.exp(0.5 * log_var)
        eps = torch.randn_like(std)
        return mu + std * eps

    def decode(self, z: torch.Tensor) -> torch.Tensor:
        h = torch.relu(self.dec1(z))
        return torch.sigmoid(self.dec2(h))

    def forward(self, x: torch.Tensor) -> dict:
        mu, log_var = self.encode(x)
        z = self.reparameterize(mu, log_var)
        x_recon = self.decode(z)
        return {'mu': mu, 'log_var': log_var, 'z': z, 'x_recon': x_recon}

    def compute_loss(self, x: torch.Tensor, x_recon: torch.Tensor,
                     mu: torch.Tensor, log_var: torch.Tensor) -> dict:
        recon_loss = F.mse_loss(x_recon, x)
        kl_loss = -0.5 * torch.mean(1 + log_var - mu.pow(2) - log_var.exp())
        total_loss = recon_loss + kl_loss
        return {'total_loss': total_loss, 'recon_loss': recon_loss, 'kl_loss': kl_loss}

    def sample(self, num_samples: int) -> torch.Tensor:
        with torch.no_grad():
            z = torch.randn(num_samples, self.latent_dim)
            return self.decode(z)
`,
    testCases: [
      {
        id: '1',
        description: 'Reconstruction shape',
        input: 'VAE(784, 256, 20).forward(torch.randn(4, 784))["x_recon"].shape',
        expected: '(4, 784)',
        hidden: false,
      },
      {
        id: '2',
        description: 'KL divergence non-negative',
        input: '(lambda: (vae := VAE(784, 256, 20), x := torch.randn(4, 784), out := vae.forward(x), loss := vae.compute_loss(x, out["x_recon"], out["mu"], out["log_var"]), bool(loss["kl_loss"] >= 0))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Loss values for fixed inputs',
        input: `(lambda: (
            loss := VAE(4, 8, 2).compute_loss(torch.tensor([[1.0, 0.0]]), torch.tensor([[0.5, 0.5]]), torch.ones(1, 2), torch.zeros(1, 2)),
            (round(float(loss["recon_loss"]), 4), round(float(loss["kl_loss"]), 4), round(float(loss["total_loss"]), 4))
        )[-1])()`,
        expected: '(0.25, 0.5, 0.75)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Forward uses the reparameterization trick: z = mu + exp(0.5 * log_var) * eps',
        input: `(lambda: (
            vae := VAE(6, 8, 3),
            out := vae.forward(torch.randn(5, 6)),
            eps := (out["z"] - out["mu"]) / torch.exp(0.5 * out["log_var"]),
            bool(out["z"].shape == (5, 3) and abs(eps.mean().item()) < 1.5 and not torch.allclose(out["z"], out["mu"]))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gradients reach every parameter through the sample',
        input: `(lambda: (
            vae := VAE(10, 8, 2), x := torch.rand(4, 10),
            out := vae(x),
            loss := vae.compute_loss(x, out["x_recon"], out["mu"], out["log_var"]),
            loss["total_loss"].backward(),
            bool(isinstance(vae, torch.nn.Module) and all(p.grad is not None for p in vae.parameters()))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Samples have the right shape and lie in [0, 1]',
        input: '(lambda: (s := VAE(12, 8, 3).sample(5), bool(s.shape == (5, 12) and s.min().item() >= 0 and s.max().item() <= 1))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Encoder: h = relu(enc(x)); mu = fc_mu(h); log_var = fc_logvar(h)',
      'Reparameterize: std = torch.exp(0.5 * log_var); z = mu + std * torch.randn_like(std)',
      'Decoder: sigmoid(dec2(relu(dec1(z))))',
      'KL = -0.5 * torch.mean(1 + log_var - mu**2 - log_var.exp()); return tensors so total_loss.backward() works',
    ],
  },

  'e2e-vqvae': {
    note: "Both classes are nn.Modules; the codebook is an nn.Parameter. Use .detach() for stop-gradients and the straight-through estimator z_e + (z_q - z_e).detach() in forward. Don't use torch.cdist.",
    starterCode: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VectorQuantizer(nn.Module):
    def __init__(self, num_embeddings: int, embedding_dim: int):
        """
        Vector Quantization layer.

        Args:
            num_embeddings: Size of codebook (K)
            embedding_dim: Dimension of each embedding
        """
        super().__init__()
        torch.manual_seed(42)
        # Codebook with small random values, learnable
        self.embedding = nn.Parameter(torch.randn(num_embeddings, embedding_dim) * 0.1)
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: torch.Tensor) -> tuple:
        """
        Quantize encoder output to nearest codebook entries.

        Args:
            z_e: Encoder output (batch, height, width, embedding_dim)

        Returns:
            z_q: Quantized vectors (same shape as z_e), rows of the codebook
            indices: Codebook indices (batch, height, width), int64
            distances: Squared distance to the nearest embedding (batch, height, width)
        """
        # Your code here
        pass

    def compute_loss(self, z_e: torch.Tensor, z_q: torch.Tensor, beta: float = 0.25) -> dict:
        """
        Compute VQ losses.

        Returns:
            Dictionary with 'codebook_loss' (||sg[z_e] - z_q||^2) and
            'commitment_loss' (beta * ||z_e - sg[z_q]||^2), scalar tensors
        """
        # Your code here
        pass


class VQVAE(nn.Module):
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        """
        Initialize VQ-VAE for (batch, input_channels, 4, 4) inputs.

        Args:
            input_channels: Number of input channels
            hidden_dim: Hidden layer dimension
            num_embeddings: Codebook size
            embedding_dim: Embedding dimension
        """
        super().__init__()
        torch.manual_seed(42)
        self.input_channels = input_channels
        self.embedding_dim = embedding_dim

        # Simplified MLP encoder/decoder on the flattened 4x4 input
        self.enc1 = nn.Linear(input_channels * 16, hidden_dim)
        self.enc2 = nn.Linear(hidden_dim, embedding_dim)
        self.vq = VectorQuantizer(num_embeddings, embedding_dim)
        self.dec1 = nn.Linear(embedding_dim, hidden_dim)
        self.dec2 = nn.Linear(hidden_dim, input_channels * 16)

    def encode(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input (batch, channels, 4, 4)

        Returns:
            z_e: Encoder output (batch, 1, 1, embedding_dim)
        """
        # Your code here
        pass

    def decode(self, z_q: torch.Tensor) -> torch.Tensor:
        """
        Args:
            z_q: Quantized vectors (batch, 1, 1, embedding_dim)

        Returns:
            x_recon: Reconstructed input (batch, channels, 4, 4)
        """
        # Your code here
        pass

    def forward(self, x: torch.Tensor) -> dict:
        """
        Full forward pass with the straight-through estimator.

        Returns:
            Dictionary with 'z_e', 'z_q', 'indices', 'x_recon'
        """
        # Your code here
        pass

    def compute_loss(self, x: torch.Tensor, x_recon: torch.Tensor,
                     z_e: torch.Tensor, z_q: torch.Tensor, beta: float = 0.25) -> dict:
        """
        Compute total VQ-VAE loss.

        Returns:
            Dictionary with 'total_loss', 'recon_loss', 'codebook_loss', 'commitment_loss'
        """
        # Your code here
        pass

    def get_codebook_usage(self, indices: torch.Tensor) -> torch.Tensor:
        """
        Compute codebook usage statistics.

        Returns:
            usage: Count of each codebook entry used (num_embeddings,)
        """
        # Your code here
        pass
`,
    solution: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VectorQuantizer(nn.Module):
    def __init__(self, num_embeddings: int, embedding_dim: int):
        super().__init__()
        torch.manual_seed(42)
        self.embedding = nn.Parameter(torch.randn(num_embeddings, embedding_dim) * 0.1)
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: torch.Tensor) -> tuple:
        batch, H, W, D = z_e.shape
        z_flat = z_e.reshape(-1, D)

        # ||z - e||^2 = ||z||^2 + ||e||^2 - 2 z.e  -> (N, K)
        distances = ((z_flat ** 2).sum(dim=1, keepdim=True)
                     + (self.embedding ** 2).sum(dim=1)
                     - 2 * z_flat @ self.embedding.T)

        indices_flat = distances.argmin(dim=1)
        z_q = self.embedding[indices_flat].reshape(batch, H, W, D)
        indices = indices_flat.reshape(batch, H, W)
        min_distances = distances.min(dim=1)[0].reshape(batch, H, W)
        return z_q, indices, min_distances

    def compute_loss(self, z_e: torch.Tensor, z_q: torch.Tensor, beta: float = 0.25) -> dict:
        # Codebook loss moves the codes toward the (frozen) encoder output
        codebook_loss = F.mse_loss(z_q, z_e.detach())
        # Commitment loss keeps the encoder close to the (frozen) codes
        commitment_loss = beta * F.mse_loss(z_e, z_q.detach())
        return {'codebook_loss': codebook_loss, 'commitment_loss': commitment_loss}


class VQVAE(nn.Module):
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        super().__init__()
        torch.manual_seed(42)
        self.input_channels = input_channels
        self.embedding_dim = embedding_dim
        self.enc1 = nn.Linear(input_channels * 16, hidden_dim)
        self.enc2 = nn.Linear(hidden_dim, embedding_dim)
        self.vq = VectorQuantizer(num_embeddings, embedding_dim)
        self.dec1 = nn.Linear(embedding_dim, hidden_dim)
        self.dec2 = nn.Linear(hidden_dim, input_channels * 16)

    def encode(self, x: torch.Tensor) -> torch.Tensor:
        batch = x.shape[0]
        h = torch.relu(self.enc1(x.reshape(batch, -1)))
        return self.enc2(h).reshape(batch, 1, 1, self.embedding_dim)

    def decode(self, z_q: torch.Tensor) -> torch.Tensor:
        batch = z_q.shape[0]
        h = torch.relu(self.dec1(z_q.reshape(batch, -1)))
        return self.dec2(h).reshape(batch, self.input_channels, 4, 4)

    def forward(self, x: torch.Tensor) -> dict:
        z_e = self.encode(x)
        z_q, indices, _ = self.vq.quantize(z_e)

        # Straight-through estimator: forward uses z_q, backward copies grads to z_e
        z_q_st = z_e + (z_q - z_e).detach()
        x_recon = self.decode(z_q_st)
        return {'z_e': z_e, 'z_q': z_q, 'indices': indices, 'x_recon': x_recon}

    def compute_loss(self, x: torch.Tensor, x_recon: torch.Tensor,
                     z_e: torch.Tensor, z_q: torch.Tensor, beta: float = 0.25) -> dict:
        recon_loss = F.mse_loss(x_recon, x)
        vq_losses = self.vq.compute_loss(z_e, z_q, beta)
        total_loss = recon_loss + vq_losses['codebook_loss'] + vq_losses['commitment_loss']
        return {
            'total_loss': total_loss,
            'recon_loss': recon_loss,
            'codebook_loss': vq_losses['codebook_loss'],
            'commitment_loss': vq_losses['commitment_loss'],
        }

    def get_codebook_usage(self, indices: torch.Tensor) -> torch.Tensor:
        return torch.bincount(indices.flatten(), minlength=self.vq.num_embeddings)
`,
    testCases: [
      {
        id: '1',
        description: 'Quantization shape',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := torch.randn(2, 4, 4, 64), q := vq.quantize(z_e), q[0].shape == z_e.shape)[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Indices valid range',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := torch.randn(2, 4, 4, 64), q := vq.quantize(z_e), bool((q[1] >= 0).all() and (q[1] < 512).all() and q[1].shape == (2, 4, 4)))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Quantized from codebook, with brute-force nearest codes and distances',
        input: `(lambda: (
            vq := VectorQuantizer(16, 4), z_e := torch.randn(2, 3, 3, 4), q := vq.quantize(z_e),
            d := ((z_e.unsqueeze(-2) - vq.embedding.detach()) ** 2).sum(dim=-1),
            bool(torch.allclose(q[0], vq.embedding[q[1]]) and torch.equal(q[1], d.argmin(dim=-1)) and torch.allclose(q[2], d.min(dim=-1)[0], atol=1e-4))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Loss values correct',
        input: '(lambda: (vq := VectorQuantizer(8, 2), losses := vq.compute_loss(torch.ones(1, 1, 2, 2), torch.zeros(1, 1, 2, 2), 0.25), (round(float(losses["codebook_loss"]), 4), round(float(losses["commitment_loss"]), 4)))[-1])()',
        expected: '(1.0, 0.25)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Straight-through: gradients reach the encoder, decoder and codebook',
        input: `(lambda: (
            m := VQVAE(1, 16, 8, 4), x := torch.randn(3, 1, 4, 4),
            out := m(x),
            loss := m.compute_loss(x, out["x_recon"], out["z_e"], out["z_q"]),
            loss["total_loss"].backward(),
            bool(out["x_recon"].shape == (3, 1, 4, 4) and all(p.grad is not None for p in m.parameters()) and m.vq.embedding.grad.abs().sum().item() > 0)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Codebook usage counts',
        input: 'VQVAE(1, 16, 8, 4).get_codebook_usage(torch.tensor([[0, 1], [1, 3]])).tolist()',
        expected: '[1, 2, 0, 1, 0, 0, 0, 0]',
        hidden: true,
      },
    ],
    hints: [
      'Flatten z_e to (N, D); distances = (z**2).sum(1, keepdim=True) + (e**2).sum(1) - 2 * z @ e.T',
      'argmin over the codebook axis gives indices; self.embedding[indices] gives z_q',
      'Losses: F.mse_loss(z_q, z_e.detach()) and beta * F.mse_loss(z_e, z_q.detach())',
      'Straight-through: decode z_e + (z_q - z_e).detach()',
      'Usage: torch.bincount(indices.flatten(), minlength=K)',
    ],
  },

  'e2e-diffusion': {
    note: 'DiffusionModel is an nn.Module that stores its schedule with register_buffer. Use torch.linspace/cumprod and torch.randn_like. Tests use a small T so sampling stays fast.',
    starterCode: `import torch
import torch.nn as nn
import torch.nn.functional as F

class DiffusionModel(nn.Module):
    def __init__(self, T: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        """
        Initialize diffusion model.

        Args:
            T: Number of diffusion timesteps
            beta_start: Starting noise level
            beta_end: Ending noise level
        """
        super().__init__()
        self.T = T

        # Compute noise schedule and store it with self.register_buffer(name, tensor)
        # Your code here

    def get_noise_schedule(self) -> dict:
        """Return computed noise schedule parameters ('betas', 'alphas', 'alpha_bars')."""
        # Your code here
        pass

    def forward_diffusion(self, x_0: torch.Tensor, t: int) -> tuple:
        """
        Add noise to data at timestep t.

        Args:
            x_0: Original data (batch, ...)
            t: Timestep

        Returns:
            x_t: Noisy data
            noise: The noise that was added
        """
        torch.manual_seed(42)
        # Your code here
        pass

    def reverse_step(self, x_t: torch.Tensor, t: int, predicted_noise: torch.Tensor) -> torch.Tensor:
        """
        Single reverse diffusion step (adds sigma_t * z for t > 0, none at t = 0).

        Args:
            x_t: Noisy data at timestep t
            t: Current timestep
            predicted_noise: Noise predicted by model

        Returns:
            x_{t-1}: Less noisy data
        """
        # Your code here
        pass

    def compute_loss(self, true_noise: torch.Tensor, predicted_noise: torch.Tensor) -> torch.Tensor:
        """Compute MSE loss between true and predicted noise (scalar tensor)."""
        # Your code here
        pass

    def sample(self, shape: tuple, noise_predictor) -> torch.Tensor:
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
    solution: `import torch
import torch.nn as nn
import torch.nn.functional as F

class DiffusionModel(nn.Module):
    def __init__(self, T: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        super().__init__()
        self.T = T

        betas = torch.linspace(beta_start, beta_end, T)
        alphas = 1 - betas
        alpha_bars = torch.cumprod(alphas, dim=0)

        # Buffers: part of the module's state, but not learnable parameters
        self.register_buffer('betas', betas)
        self.register_buffer('alphas', alphas)
        self.register_buffer('alpha_bars', alpha_bars)

    def get_noise_schedule(self) -> dict:
        return {'betas': self.betas, 'alphas': self.alphas, 'alpha_bars': self.alpha_bars}

    def forward_diffusion(self, x_0: torch.Tensor, t: int) -> tuple:
        torch.manual_seed(42)
        noise = torch.randn_like(x_0)
        alpha_bar = self.alpha_bars[t]
        x_t = torch.sqrt(alpha_bar) * x_0 + torch.sqrt(1 - alpha_bar) * noise
        return x_t, noise

    def reverse_step(self, x_t: torch.Tensor, t: int, predicted_noise: torch.Tensor) -> torch.Tensor:
        alpha = self.alphas[t]
        alpha_bar = self.alpha_bars[t]
        beta = self.betas[t]

        # Mean of p(x_{t-1} | x_t)
        mean = (x_t - beta / torch.sqrt(1 - alpha_bar) * predicted_noise) / torch.sqrt(alpha)

        if t > 0:
            return mean + torch.sqrt(beta) * torch.randn_like(x_t)
        return mean

    def compute_loss(self, true_noise: torch.Tensor, predicted_noise: torch.Tensor) -> torch.Tensor:
        return F.mse_loss(predicted_noise, true_noise)

    @torch.no_grad()
    def sample(self, shape: tuple, noise_predictor) -> torch.Tensor:
        x = torch.randn(*shape)
        for t in reversed(range(self.T)):
            x = self.reverse_step(x, t, noise_predictor(x, t))
        return x
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
        input: '(lambda: (dm := DiffusionModel(1000), x_0 := torch.randn(4, 32), fd := dm.forward_diffusion(x_0, 500), fd[0].shape == x_0.shape)[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Schedule values for T=3',
        input: `(lambda: (
            s := DiffusionModel(3, 0.1, 0.3).get_noise_schedule(),
            bool(torch.allclose(s["betas"], torch.tensor([0.1, 0.2, 0.3])) and torch.allclose(s["alphas"], torch.tensor([0.9, 0.8, 0.7])) and torch.allclose(s["alpha_bars"], torch.tensor([0.9, 0.72, 0.504])))
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Forward process follows x_t = sqrt(ab) x_0 + sqrt(1 - ab) noise',
        input: `(lambda: (
            dm := DiffusionModel(100), x0 := torch.randn(3, 5), r := dm.forward_diffusion(x0, 40), ab := dm.alpha_bars[40],
            bool(torch.allclose(r[0], ab.sqrt() * x0 + (1 - ab).sqrt() * r[1], atol=1e-6))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Reverse step at t=0 is the deterministic posterior mean',
        input: `(lambda: (
            dm := DiffusionModel(10, 0.1, 0.5), x := torch.tensor([[1.0, -2.0]]), eps := torch.tensor([[0.5, 0.5]]),
            ref := (x - 0.1 / (1 - 0.9) ** 0.5 * eps) / 0.9 ** 0.5,
            bool(torch.allclose(dm.reverse_step(x, 0, eps), ref, atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Noise prediction loss is the MSE',
        input: 'round(float(DiffusionModel(10).compute_loss(torch.zeros(2, 2), torch.tensor([[1.0, -1.0], [2.0, 0.0]]))), 4)',
        expected: '1.5',
        hidden: true,
      },
      {
        id: '7',
        description: 'Sampling runs T reverse steps and keeps the shape; schedule lives in buffers',
        input: `(lambda: (
            dm := DiffusionModel(10), calls := [],
            s := dm.sample((3, 2), lambda x, t: (calls.append(t), torch.zeros_like(x))[1]),
            bool(s.shape == (3, 2) and calls == list(range(9, -1, -1)) and isinstance(dm, torch.nn.Module) and len(list(dm.buffers())) >= 3)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'betas = torch.linspace(beta_start, beta_end, T); alpha_bars = torch.cumprod(1 - betas, dim=0)',
      "self.register_buffer('betas', betas) makes the schedule part of the module state",
      'x_t = sqrt(alpha_bar) * x_0 + sqrt(1 - alpha_bar) * noise',
      'Reverse mean: (x_t - beta / sqrt(1 - alpha_bar) * eps) / sqrt(alpha); add sqrt(beta) * z only for t > 0',
    ],
  },

  'e2e-cnn': {
    note: "Write conv2d and maxpool2d with tensor ops: don't use nn.Conv2d, F.conv2d, nn.MaxPool2d, F.max_pool2d or unfold (hidden tests compare against them). CNN is an nn.Module; nn.Linear is fine for the fully connected layers.",
    starterCode: `import torch
import torch.nn as nn


def conv2d(x: torch.Tensor, kernel: torch.Tensor, bias: torch.Tensor) -> torch.Tensor:
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


def maxpool2d(x: torch.Tensor, pool_size: int = 2) -> torch.Tensor:
    """
    2D max pooling (window = stride = pool_size).

    Args:
        x: Input (batch, channels, height, width)
        pool_size: Size of pooling window

    Returns:
        output: Pooled tensor
    """
    # Your code here
    pass


def flatten(x: torch.Tensor) -> torch.Tensor:
    """Flatten all dimensions except batch."""
    # Your code here
    pass


class CNN(nn.Module):
    def __init__(self, input_shape: tuple, num_classes: int):
        """
        Initialize CNN.

        Args:
            input_shape: (channels, height, width)
            num_classes: Number of output classes
        """
        super().__init__()
        torch.manual_seed(42)
        in_channels, H, W = input_shape

        # Conv layer 1: in_channels -> 32
        self.conv1_w = nn.Parameter(torch.randn(32, in_channels, 3, 3) * 0.1)
        self.conv1_b = nn.Parameter(torch.zeros(32))

        # Conv layer 2: 32 -> 64
        self.conv2_w = nn.Parameter(torch.randn(64, 32, 3, 3) * 0.1)
        self.conv2_b = nn.Parameter(torch.zeros(64))

        # Calculate flattened size after convolutions and pooling
        # Your code to compute this

        # Fully connected layers (nn.Linear)
        # Your code here

    def forward(self, x: torch.Tensor) -> torch.Tensor:
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
    """Test CNN with sample data; return True if the output shape is right."""
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn as nn


def conv2d(x: torch.Tensor, kernel: torch.Tensor, bias: torch.Tensor) -> torch.Tensor:
    batch, in_ch, H, W = x.shape
    out_ch, _, kH, kW = kernel.shape
    out_H, out_W = H - kH + 1, W - kW + 1

    # For each kernel tap (a, b): contract the shifted input over input channels
    output = torch.zeros(batch, out_ch, out_H, out_W)
    for a in range(kH):
        for b in range(kW):
            patch = x[:, :, a:a + out_H, b:b + out_W]               # (batch, in_ch, out_H, out_W)
            output = output + torch.einsum('bchw,oc->bohw', patch, kernel[:, :, a, b])

    return output + bias.view(1, -1, 1, 1)


def maxpool2d(x: torch.Tensor, pool_size: int = 2) -> torch.Tensor:
    batch, channels, H, W = x.shape
    p = pool_size
    out_H, out_W = H // p, W // p

    # Crop, split each spatial axis into (blocks, p) and take the max inside each block
    x = x[:, :, :out_H * p, :out_W * p].reshape(batch, channels, out_H, p, out_W, p)
    return x.max(dim=5)[0].max(dim=3)[0]


def flatten(x: torch.Tensor) -> torch.Tensor:
    return x.reshape(x.shape[0], -1)


class CNN(nn.Module):
    def __init__(self, input_shape: tuple, num_classes: int):
        super().__init__()
        torch.manual_seed(42)
        in_channels, H, W = input_shape

        self.conv1_w = nn.Parameter(torch.randn(32, in_channels, 3, 3) * 0.1)
        self.conv1_b = nn.Parameter(torch.zeros(32))
        self.conv2_w = nn.Parameter(torch.randn(64, 32, 3, 3) * 0.1)
        self.conv2_b = nn.Parameter(torch.zeros(64))

        # conv 3x3 (-2) -> pool 2 (//2) -> conv 3x3 (-2) -> pool 2 (//2)
        h2 = ((H - 2) // 2 - 2) // 2
        w2 = ((W - 2) // 2 - 2) // 2
        flat_size = 64 * h2 * w2

        self.fc1 = nn.Linear(flat_size, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = maxpool2d(torch.relu(conv2d(x, self.conv1_w, self.conv1_b)))
        x = maxpool2d(torch.relu(conv2d(x, self.conv2_w, self.conv2_b)))
        x = flatten(x)
        x = torch.relu(self.fc1(x))
        return self.fc2(x)


def test_cnn():
    cnn = CNN(input_shape=(1, 28, 28), num_classes=10)
    x = torch.randn(4, 1, 28, 28)
    logits = cnn(x)
    return tuple(logits.shape) == (4, 10)
`,
    testCases: [
      {
        id: '1',
        description: 'Conv output shape',
        input: 'conv2d(torch.randn(2, 1, 8, 8), torch.randn(32, 1, 3, 3), torch.zeros(32)).shape',
        expected: '(2, 32, 6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Pool output shape',
        input: 'maxpool2d(torch.randn(2, 32, 8, 8), pool_size=2).shape',
        expected: '(2, 32, 4, 4)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Conv values with bias (hand-computed)',
        input: 'conv2d(torch.ones(1, 2, 3, 3), torch.ones(1, 2, 2, 2), torch.tensor([1.0])).tolist()',
        expected: '[[[[9.0, 9.0], [9.0, 9.0]]]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'conv2d matches F.conv2d on random multi-channel input',
        input: `(lambda: (
            x := torch.randn(2, 3, 7, 6), k := torch.randn(4, 3, 3, 2), b := torch.randn(4),
            bool(torch.allclose(conv2d(x, k, b), torch.nn.functional.conv2d(x, k, b), atol=1e-4))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'maxpool2d matches F.max_pool2d',
        input: `(lambda: (
            x := torch.randn(2, 3, 9, 8),
            bool(torch.allclose(maxpool2d(x, 2), torch.nn.functional.max_pool2d(x, 2)) and torch.allclose(maxpool2d(x, 3), torch.nn.functional.max_pool2d(x, 3)))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'CNN forward shape, nn.Module, and gradients reach every parameter',
        input: `(lambda: (
            m := CNN((1, 12, 12), 3), out := m(torch.randn(2, 1, 12, 12)),
            out.sum().backward(),
            bool(out.shape == (2, 3) and isinstance(m, torch.nn.Module) and all(p.grad is not None for p in m.parameters()))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'test_cnn runs on 28x28 inputs',
        input: 'test_cnn()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Conv output size: (input - kernel + 1) for stride=1, no padding',
      'Loop over kernel taps: output += einsum("bchw,oc->bohw", x[:, :, a:a+out_H, b:b+out_W], kernel[:, :, a, b])',
      'Pool: reshape to (B, C, out_H, p, out_W, p) and max over the two p axes',
      'Flatten: x.reshape(x.shape[0], -1); FC layers: nn.Linear',
    ],
  },
  // Ported with the new problems from the ML Coding Lab fork.
  'e2e-mini-gpt': {
    note: 'Build attention yourself (masked_fill + softmax). Don\'t use nn.TransformerEncoderLayer, nn.TransformerDecoderLayer, nn.MultiheadAttention or F.scaled_dot_product_attention. nn.Embedding, nn.Linear, nn.LayerNorm, nn.GELU, F.cross_entropy and torch.optim are fine.',
    starterCode: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class CausalSelfAttention(nn.Module):
    def __init__(self, d_model, n_heads, block_size):
        super().__init__()
        # Your code here: a fused qkv projection, an output projection, a causal mask buffer
        pass

    def forward(self, x):
        """x: (B, T, C) -> (B, T, C)"""
        # Your code here
        pass


class Block(nn.Module):
    """Pre-norm block: x + attn(ln1(x)), then x + mlp(ln2(x)); mlp = Linear(C, 4C) -> GELU -> Linear(4C, C)."""
    def __init__(self, d_model, n_heads, block_size):
        super().__init__()
        # Your code here
        pass

    def forward(self, x):
        # Your code here
        pass


class MiniGPT(nn.Module):
    def __init__(self, vocab_size, d_model=16, n_heads=2, n_layers=1, block_size=8):
        super().__init__()
        # Your code here: token + position embeddings, blocks, final LayerNorm, LM head.
        # Initialize Linear/Embedding weights with std 0.02 so the initial loss is ~log(V).
        pass

    def forward(self, idx):
        """idx: (B, T) long -> logits (B, T, vocab_size)"""
        # Your code here
        pass

    def loss(self, idx, targets):
        """Mean next-token cross-entropy (0-d tensor)."""
        # Your code here
        pass

    @torch.no_grad()
    def generate(self, idx, max_new_tokens):
        """Greedy decoding. Returns (B, T + max_new_tokens)."""
        # Your code here
        pass


def train(model, idx, targets, steps=20, lr=1e-2):
    """Train with torch.optim.AdamW for \`steps\` steps. Return the list of
    losses (floats), each computed before that step's update."""
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class CausalSelfAttention(nn.Module):
    def __init__(self, d_model, n_heads, block_size):
        super().__init__()
        self.n_heads = n_heads
        self.qkv = nn.Linear(d_model, 3 * d_model)
        self.proj = nn.Linear(d_model, d_model)
        self.register_buffer('causal', torch.tril(torch.ones(block_size, block_size, dtype=torch.bool)))

    def forward(self, x):
        B, T, C = x.shape
        H, d_head = self.n_heads, C // self.n_heads
        q, k, v = self.qkv(x).split(C, dim=-1)
        q, k, v = (a.view(B, T, H, d_head).transpose(1, 2) for a in (q, k, v))   # (B, H, T, d_head)
        scores = q @ k.transpose(-2, -1) / math.sqrt(d_head)
        scores = scores.masked_fill(~self.causal[:T, :T], float('-inf'))
        out = torch.softmax(scores, dim=-1) @ v
        return self.proj(out.transpose(1, 2).reshape(B, T, C))


class Block(nn.Module):
    def __init__(self, d_model, n_heads, block_size):
        super().__init__()
        self.ln1 = nn.LayerNorm(d_model)
        self.attn = CausalSelfAttention(d_model, n_heads, block_size)
        self.ln2 = nn.LayerNorm(d_model)
        self.mlp = nn.Sequential(nn.Linear(d_model, 4 * d_model), nn.GELU(), nn.Linear(4 * d_model, d_model))

    def forward(self, x):
        x = x + self.attn(self.ln1(x))
        return x + self.mlp(self.ln2(x))


class MiniGPT(nn.Module):
    def __init__(self, vocab_size, d_model=16, n_heads=2, n_layers=1, block_size=8):
        super().__init__()
        self.block_size = block_size
        self.tok_emb = nn.Embedding(vocab_size, d_model)
        self.pos_emb = nn.Embedding(block_size, d_model)
        self.blocks = nn.ModuleList([Block(d_model, n_heads, block_size) for _ in range(n_layers)])
        self.ln_f = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        for module in self.modules():  # GPT-2 style init
            if isinstance(module, (nn.Linear, nn.Embedding)):
                nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if isinstance(module, nn.Linear) and module.bias is not None:
                nn.init.zeros_(module.bias)

    def forward(self, idx):
        T = idx.shape[1]
        x = self.tok_emb(idx) + self.pos_emb(torch.arange(T))
        for block in self.blocks:
            x = block(x)
        return self.lm_head(self.ln_f(x))

    def loss(self, idx, targets):
        logits = self.forward(idx)
        return F.cross_entropy(logits.reshape(-1, logits.shape[-1]), targets.reshape(-1))

    @torch.no_grad()
    def generate(self, idx, max_new_tokens):
        for _ in range(max_new_tokens):
            logits = self.forward(idx[:, -self.block_size:])
            next_token = logits[:, -1, :].argmax(dim=-1, keepdim=True)
            idx = torch.cat([idx, next_token], dim=1)
        return idx


def train(model, idx, targets, steps=20, lr=1e-2):
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
    losses = []
    for _ in range(steps):
        loss = model.loss(idx, targets)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        losses.append(loss.item())
    return losses
`,
    testCases: [
      {
        id: '1',
        description: 'forward returns (B, T, vocab_size)',
        input: 'MiniGPT(5).forward(torch.randint(0, 5, (2, 8))).shape',
        expected: '(2, 8, 5)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Causal: changing a future token leaves earlier logits unchanged',
        input: '(lambda m, a: (lambda b: bool(torch.allclose(m(a)[:, :5], m(b)[:, :5], atol=1e-6) and not torch.allclose(m(a)[:, 5:], m(b)[:, 5:])))(torch.cat([a[:, :5], (a[:, 5:] + 1) % 5], dim=1)))(MiniGPT(5, n_layers=2), torch.randint(0, 5, (2, 8)))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Initial loss is about log(vocab_size)',
        input: '(lambda: (seq := torch.tensor([[i % 5 for i in range(9)], [(i + 2) % 5 for i in range(9)]]), bool(abs(MiniGPT(5).loss(seq[:, :-1], seq[:, 1:]).item() - math.log(5)) < 0.15))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'generate keeps the prompt and appends max_new_tokens tokens',
        input: '(lambda out: (tuple(out.shape), out[:, :3].tolist()))(MiniGPT(5).generate(torch.tensor([[0, 1, 2]]), 5))',
        expected: '((1, 8), [[0, 1, 2]])',
        hidden: false,
      },
      {
        id: '5',
        description: 'Training with autograd reduces the loss',
        input: '(lambda: (seq := torch.tensor([[i % 5 for i in range(9)], [(i + 2) % 5 for i in range(9)]]), losses := train(MiniGPT(5), seq[:, :-1], seq[:, 1:], steps=20, lr=1e-2), bool(len(losses) == 20 and losses[-1] < losses[0] - 0.5))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Generation is greedy (argmax of the last-position logits)',
        input: '(lambda m, p: bool(m.generate(p, 1)[0, -1].item() == m(p)[0, -1].argmax().item()))(MiniGPT(5), torch.tensor([[4, 1, 3]]))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'After training, generation continues the cycle',
        input: '(lambda: (seq := torch.tensor([[i % 5 for i in range(9)], [(i + 2) % 5 for i in range(9)]]), m := MiniGPT(5), train(m, seq[:, :-1], seq[:, 1:], steps=40, lr=2e-2), m.generate(torch.tensor([[0, 1, 2]]), 5).tolist())[-1])()',
        expected: '[[0, 1, 2, 3, 4, 0, 1, 2]]',
        hidden: true,
      },
      {
        id: '8',
        description: 'generate crops the context to block_size',
        input: 'tuple(MiniGPT(5, block_size=8).generate(torch.tensor([[0, 1, 2, 3, 4, 0]]), 6).shape)',
        expected: '(1, 12)',
        hidden: true,
      },
      {
        id: '9',
        description: 'Every parameter gets a gradient',
        input: '(lambda: (seq := torch.tensor([[i % 5 for i in range(9)], [(i + 2) % 5 for i in range(9)]]), m := MiniGPT(5), m.loss(seq[:, :-1], seq[:, 1:]).backward(), all(p.grad is not None for p in m.parameters()))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Attention: q, k, v = self.qkv(x).split(C, dim=-1); view each as (B, T, H, d_head).transpose(1, 2); mask with masked_fill(~tril[:T, :T], -inf).',
      'Init: loop over self.modules() and call nn.init.normal_(m.weight, std=0.02) on Linear/Embedding layers so the initial loss is ~log(V).',
      'loss: F.cross_entropy(logits.reshape(-1, V), targets.reshape(-1)).',
      'train: optimizer = torch.optim.AdamW(model.parameters(), lr=lr); loop zero_grad, loss.backward(), step; record loss.item().',
    ],
  },
  'e2e-vit-classifier': {
    note: 'nn.Linear, nn.LayerNorm and F.gelu(approximate=\'tanh\') are fine; write the multi-head attention yourself (no nn.MultiheadAttention or F.scaled_dot_product_attention). train_step updates every parameter with plain SGD via autograd.',
    starterCode: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class TinyViT(nn.Module):
    def __init__(self, img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2,
                 mlp_dim=32, num_classes=2, use_pos_emb=True):
        """
        Patch embedding (nn.Linear), CLS token and position embeddings (nn.Parameter,
        ~ N(0, 0.02^2)), one pre-norm encoder block, final LayerNorm and a linear head.
        """
        super().__init__()
        self.patch_size = patch_size
        self.num_heads = num_heads
        self.use_pos_emb = use_pos_emb
        # Your code here

    def patchify(self, x):
        """(B, C, H, W) -> (B, N, P*P*C), patches row-major, flattened as (p1, p2, c)."""
        # Your code here
        pass

    def cls_features(self, x):
        """Final-LayerNormed CLS token, (B, D)."""
        # Your code here
        pass

    def forward(self, x):
        """Logits (B, num_classes)."""
        # Your code here
        pass

    def loss(self, x, y):
        """Mean cross-entropy as a Python float."""
        # Your code here
        pass

    def train_step(self, x, y, lr=0.1):
        """One plain SGD step on ALL parameters; returns the loss before the step (float)."""
        # Your code here
        pass
`,
    solution: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class TinyViT(nn.Module):
    def __init__(self, img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2,
                 mlp_dim=32, num_classes=2, use_pos_emb=True):
        super().__init__()
        self.patch_size = patch_size
        self.num_heads = num_heads
        self.use_pos_emb = use_pos_emb
        n_patches = (img_size // patch_size) ** 2

        self.patch_embed = nn.Linear(patch_size * patch_size * in_chans, dim)
        self.cls = nn.Parameter(torch.randn(dim) * 0.02)
        self.pos = nn.Parameter(torch.randn(n_patches + 1, dim) * 0.02)
        self.ln1 = nn.LayerNorm(dim)
        self.qkv = nn.Linear(dim, 3 * dim, bias=False)
        self.proj = nn.Linear(dim, dim, bias=False)
        self.ln2 = nn.LayerNorm(dim)
        self.fc1 = nn.Linear(dim, mlp_dim)
        self.fc2 = nn.Linear(mlp_dim, dim)
        self.ln_f = nn.LayerNorm(dim)
        self.head = nn.Linear(dim, num_classes)

    def patchify(self, x):
        B, C, H, W = x.shape
        P = self.patch_size
        x = x.reshape(B, C, H // P, P, W // P, P).permute(0, 2, 4, 3, 5, 1)   # b h w p1 p2 c
        return x.reshape(B, (H // P) * (W // P), P * P * C)

    def attention(self, h):
        B, T, D = h.shape
        nh, hd = self.num_heads, D // self.num_heads
        q, k, v = self.qkv(h).chunk(3, dim=-1)
        q, k, v = (a.reshape(B, T, nh, hd).transpose(1, 2) for a in (q, k, v))   # (B, nh, T, hd)
        att = F.softmax(q @ k.transpose(-2, -1) / math.sqrt(hd), dim=-1)
        out = (att @ v).transpose(1, 2).reshape(B, T, D)
        return self.proj(out)

    def cls_features(self, x):
        tokens = self.patch_embed(self.patchify(x))                          # (B, N, D)
        cls = self.cls.expand(x.shape[0], 1, -1)
        t = torch.cat([cls, tokens], dim=1)                                  # (B, N+1, D)
        if self.use_pos_emb:
            t = t + self.pos
        t = t + self.attention(self.ln1(t))
        t = t + self.fc2(F.gelu(self.fc1(self.ln2(t)), approximate='tanh'))
        return self.ln_f(t[:, 0])

    def forward(self, x):
        return self.head(self.cls_features(x))

    def loss(self, x, y):
        with torch.no_grad():
            return F.cross_entropy(self.forward(x), y).item()

    def train_step(self, x, y, lr=0.1):
        self.zero_grad()
        loss = F.cross_entropy(self.forward(x), y)
        loss.backward()
        with torch.no_grad():
            for p in self.parameters():
                p -= lr * p.grad
        return loss.item()
`,
    testCases: [
      {
        id: '1',
        description: 'Logits shape',
        input: 'tuple(TinyViT(img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2, num_classes=3)(torch.randn(4, 1, 8, 8)).shape)',
        expected: '(4, 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Patchify order (p1, p2, c)',
        input: '(lambda pt: (tuple(pt.shape), pt[0, 0].tolist(), pt[0, 3].tolist()))(TinyViT(img_size=4, patch_size=2, in_chans=2).patchify(torch.arange(32.0).reshape(1, 2, 4, 4)))',
        expected: '((1, 4, 8), [0.0, 16.0, 1.0, 17.0, 4.0, 20.0, 5.0, 21.0], [10.0, 26.0, 11.0, 27.0, 14.0, 30.0, 15.0, 31.0])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Patchify + Linear equals a stride-P convolution',
        input: `(lambda: (
    m := TinyViT(img_size=8, patch_size=4, in_chans=3, dim=16),
    x := torch.randn(2, 3, 8, 8),
    w := m.patch_embed.weight.detach().reshape(16, 4, 4, 3).permute(0, 3, 1, 2),
    ref := F.conv2d(x, w, m.patch_embed.bias.detach(), stride=4).flatten(2).transpose(1, 2),
    bool(torch.allclose(m.patch_embed(m.patchify(x)).detach(), ref, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Without pos-emb, permuting patches leaves the CLS output unchanged',
        input: `(lambda: (
    m := TinyViT(img_size=8, patch_size=4, use_pos_emb=False),
    x := torch.randn(2, 1, 8, 8),
    x_perm := torch.roll(torch.roll(x, 4, dims=-1), 4, dims=-2),
    bool(torch.allclose(m.cls_features(x), m.cls_features(x_perm), atol=1e-5) and not torch.allclose(x, x_perm))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'With pos-emb, permuting patches changes the CLS output',
        input: `(lambda: (
    m := TinyViT(img_size=8, patch_size=4, use_pos_emb=True),
    x := torch.randn(2, 1, 8, 8),
    bool(not torch.allclose(m.cls_features(x), m.cls_features(torch.roll(x, 4, dims=-1)), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'A few training steps reduce the loss (all parameters get gradients)',
        input: `(lambda: (
    m := TinyViT(),
    x := (torch.randn(8, 1, 8, 8) * 0.3 + (torch.arange(8) % 2).view(8, 1, 1, 1).float() * (torch.arange(8).view(1, 1, 8, 1) < 4).float()),
    y := torch.arange(8) % 2,
    losses := [m.train_step(x, y, 0.1) for _ in range(15)],
    bool(len(losses) == 15 and m.loss(x, y) < 0.5 * losses[0] and all(p.grad is not None for p in m.parameters()))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'patchify: x.reshape(B, C, H//P, P, W//P, P).permute(0, 2, 4, 3, 5, 1).reshape(B, N, P*P*C).',
      'Prepend CLS with torch.cat([self.cls.expand(B, 1, -1), tokens], dim=1).',
      'Attention: self.qkv(h).chunk(3, dim=-1), reshape to (B, T, heads, d_head).transpose(1, 2), softmax(Q @ K^T / sqrt(d_head)) @ V.',
      'train_step: zero_grad, loss.backward(), then under torch.no_grad() do p -= lr * p.grad for every parameter.',
    ],
  },
};
