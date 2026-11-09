import { Problem } from '../../types';

export const e2eImplementationProblems: Problem[] = [
  {
    id: 'e2e-mlp',
    title: 'E2E: 2-Layer MLP with Backprop',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End 2-Layer MLP with Backprop

### What you'll build
A complete 2-layer classifier in plain NumPy: forward pass, softmax cross-entropy, hand-derived backward pass, an SGD step and a training loop. This is the "implement backprop from scratch" interview question.

### Architecture
| Step | Operation | Output shape |
|------|-----------|--------------|
| input | \`X\` | \`(batch, input_dim)\` |
| layer 1 | \`z1 = X @ W1 + b1\` | \`(batch, hidden_dim)\` |
| activation | \`h = relu(z1)\` | \`(batch, hidden_dim)\` |
| layer 2 | \`logits = h @ W2 + b2\` | \`(batch, output_dim)\` |
| loss | \`mean_i −log softmax(logits)[i, y_i]\` | scalar |

The constructor (given) uses He initialization, \`W ~ N(0, 2 / fan_in)\`, with \`np.random.seed(42)\`, and zero biases.

### Backward pass
With the loss averaged over the batch \`N\`, softmax and cross-entropy combine into a simple gradient:
\`\`\`python
d_logits = (probs - y_onehot) / N         # (N, output_dim)
dW2 = h.T @ d_logits                      # (hidden_dim, output_dim)
db2 = d_logits.sum(axis=0)                # (output_dim,)
d_h = d_logits @ W2.T                     # (N, hidden_dim)
d_z1 = d_h * (z1 > 0)                     # ReLU passes gradient only where z1 > 0
dW1 = X.T @ d_z1                          # (input_dim, hidden_dim)
db1 = d_z1.sum(axis=0)                    # (hidden_dim,)
\`\`\`

### Method contract
| Method | Does | Returns |
|--------|------|---------|
| \`forward(X)\` | computes logits and stores \`self.cache = {'X', 'z1', 'h', 'logits'}\` | \`logits (batch, output_dim)\` |
| \`compute_loss(logits, y)\` | softmax (max-subtracted) + mean cross-entropy; stores \`self.cache['probs']\` | float |
| \`backward(y)\` | uses the cache from \`forward\` and \`compute_loss\` | dict \`{'dW1', 'db1', 'dW2', 'db2'}\`, each shaped like its parameter |
| \`train_step(X, y, lr=0.01)\` | forward, loss, backward, then \`param -= lr * grad\` for all four | the loss **before** the update (float) |
| \`train_mlp(X_train, y_train, epochs=100, lr=0.01)\` | builds \`MLP(input_dim, 64, num_classes)\` (classes = \`len(np.unique(y_train))\`) and calls \`train_step\` on the full batch each epoch | \`(model, losses)\`, with \`len(losses) == epochs\` |

### Inputs
- \`X\`: float array \`(batch, input_dim)\`
- \`y\`: int array \`(batch,)\` with class ids in \`[0, output_dim)\`

### Edge cases and conventions
- Clip the picked probabilities to \`[1e-15, 1]\` before the log (or use log-softmax) so a confident wrong prediction does not give \`log(0)\`.
- The ReLU derivative at exactly 0 is taken as 0 (\`z1 > 0\`).

### Constraints
NumPy only; vectorise over the batch (no per-example loops).

### Follow-up
- How would you verify the gradients? (Finite differences: \`(L(w + ε) − L(w − ε)) / 2ε\`.)
- Add L2 weight decay or momentum; what changes in \`backward\` and \`train_step\`?
    `,
    examples: [
      {
        input: 'm = MLP(3, 2, 2); X = np.array([[1.0, -1.0, 0.5], [0.0, 2.0, -1.0]]); m.forward(X)',
        output: 'array([[0.0, 0.0], [0.7148, 2.4115]])',
        explanation: 'Both hidden units are negative for row 0, so ReLU zeroes them and the logits equal b2 = 0',
      },
      {
        input: 'm.compute_loss(m.cache["logits"], np.array([1, 0]))',
        output: '1.2791',
        explanation: 'Row 0: −log 0.5 = 0.6931; row 1: −log softmax([0.7148, 2.4115])[0] = 1.8650; the mean is 1.2791',
      },
      {
        input: '[m.train_step(X, np.array([1, 0]), lr=0.5) for _ in range(3)]',
        output: '[1.2791, 0.4081, 0.3437]',
        explanation: 'Each value is the loss before that step, so the first equals the loss above',
      },
    ],
    starterCode: `import numpy as np

class MLP:
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        """Initialize a 2-layer MLP (given; keep as is)."""
        np.random.seed(42)
        # He initialization: N(0, 2 / fan_in), suited to ReLU
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
        Forward pass. Store X, z1, h and logits in self.cache.

        Args:
            X: Input (batch, input_dim)

        Returns:
            logits: (batch, output_dim)
        """
        # Your code here
        pass

    def compute_loss(self, logits: np.ndarray, y: np.ndarray) -> float:
        """
        Mean softmax cross-entropy. Store the softmax probabilities in self.cache['probs'].

        Args:
            logits: Model output (batch, output_dim)
            y: True labels (batch,) as integers

        Returns:
            loss: Python float
        """
        # Your code here
        pass

    def backward(self, y: np.ndarray) -> dict:
        """
        Backward pass for the mean loss, using self.cache.

        Args:
            y: True labels (batch,) as integers

        Returns:
            gradients: {'dW1', 'db1', 'dW2', 'db2'}, each shaped like its parameter
        """
        # Your code here
        pass

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float = 0.01) -> float:
        """
        Forward, loss, backward, SGD update of W1, b1, W2, b2.

        Returns:
            loss: Loss value before the update
        """
        # Your code here
        pass


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    """
    Build MLP(input_dim, 64, num_classes) and run \`epochs\` full-batch train steps.

    Returns:
        (model, losses): the trained MLP and the list of per-epoch losses
    """
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
      {
        id: '6',
        description: 'Forward and loss values for a fixed input',
        input: '(lambda: (m := MLP(3, 2, 2), X := np.array([[1.0, -1.0, 0.5], [0.0, 2.0, -1.0]]), logits := m.forward(X), (np.round(logits, 4).tolist(), round(float(m.compute_loss(logits, np.array([1, 0]))), 4)))[-1])()',
        expected: '([[0.0, 0.0], [0.7148, 2.4115]], 1.2791)',
        hidden: false,
      },
      {
        id: '7',
        description: 'Gradient values (mean loss, so divided by the batch size)',
        input: '(lambda: (m := MLP(3, 2, 2), X := np.array([[1.0, -1.0, 0.5], [0.0, 2.0, -1.0]]), y := np.array([1, 0]), m.forward(X), m.compute_loss(m.cache["logits"], y), g := m.backward(y), (np.round(g["dW1"], 4).tolist(), np.round(g["db2"], 4).tolist()))[-1])()',
        expected: '([[0.0, 0.0], [-0.686, 0.8553], [0.343, -0.4276]], [-0.1726, 0.1726])',
        hidden: true,
      },
      {
        id: '8',
        description: 'dW1 matches a finite-difference gradient check',
        input: `(lambda: (
    m := MLP(5, 4, 3), X := np.random.randn(6, 5), y := np.array([0, 1, 2, 0, 1, 2]),
    m.forward(X), m.compute_loss(m.cache["logits"], y), g := m.backward(y),
    L := lambda: float(m.compute_loss(m.forward(X), y)),
    num := np.array([[(lambda a: (m.W1.__setitem__((i, j), a + 1e-6), lp := L(), m.W1.__setitem__((i, j), a - 1e-6), lm := L(), m.W1.__setitem__((i, j), a), (lp - lm) / 2e-6)[-1])(m.W1[i, j]) for j in range(4)] for i in range(5)]),
    bool(np.allclose(num, g["dW1"], atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '9',
        description: 'train_step returns the pre-update loss; train_mlp returns (model, losses)',
        input: `(lambda: (
    m := MLP(3, 2, 2), X := np.array([[1.0, -1.0, 0.5], [0.0, 2.0, -1.0]]),
    steps := [round(float(m.train_step(X, np.array([1, 0]), 0.5)), 4) for _ in range(3)],
    r := train_mlp(np.random.randn(20, 4), np.arange(20) % 3, epochs=30, lr=0.1),
    (steps, len(r[1]), r[0].W1.shape, bool(r[1][-1] < r[1][0]))
)[-1])()`,
        expected: '([1.2791, 0.4081, 0.3437], 30, (4, 64), True)',
        hidden: true,
      },
    ],
    hints: [
      'Backprop is the chain rule applied layer by layer in reverse; everything the backward pass needs (X, z1, h, probs) must be saved during the forward pass.',
      'Order: forward (cache X, z1, h, logits) → compute_loss (cache probs) → backward (output layer first, then the hidden layer) → SGD update.',
      'd_logits = (probs - one_hot(y)) / N; dW2 = h.T @ d_logits; d_z1 = (d_logits @ W2.T) * (z1 > 0); dW1 = X.T @ d_z1; biases sum over axis 0.',
      'Pitfall: forgetting the / N makes gradients N times too large (the loss is a mean). Index probabilities with probs[np.arange(N), y], not probs[:, y].',
    ],
    solution: `import numpy as np

class MLP:
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        np.random.seed(42)
        # He initialization: N(0, 2 / fan_in)
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros(hidden_dim)
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros(output_dim)
        self.cache = {}

    def relu(self, x):
        return np.maximum(0, x)

    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))   # stable
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

    def forward(self, X: np.ndarray) -> np.ndarray:
        z1 = X @ self.W1 + self.b1          # (N, H)
        h = self.relu(z1)
        logits = h @ self.W2 + self.b2      # (N, C)
        self.cache = {'X': X, 'z1': z1, 'h': h, 'logits': logits}
        return logits

    def compute_loss(self, logits: np.ndarray, y: np.ndarray) -> float:
        probs = self.softmax(logits)
        n = logits.shape[0]
        correct_probs = probs[np.arange(n), y]
        self.cache['probs'] = probs
        return float(-np.mean(np.log(np.clip(correct_probs, 1e-15, 1.0))))

    def backward(self, y: np.ndarray) -> dict:
        X, z1, h, probs = (self.cache[k] for k in ('X', 'z1', 'h', 'probs'))
        n = X.shape[0]

        # Softmax + cross-entropy: dL/dlogits = (p - onehot) / N for the mean loss
        d_logits = probs.copy()
        d_logits[np.arange(n), y] -= 1
        d_logits /= n

        dW2 = h.T @ d_logits
        db2 = d_logits.sum(axis=0)

        d_z1 = (d_logits @ self.W2.T) * (z1 > 0)   # ReLU gate
        dW1 = X.T @ d_z1
        db1 = d_z1.sum(axis=0)
        return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float = 0.01) -> float:
        loss = self.compute_loss(self.forward(X), y)
        grads = self.backward(y)
        for name in ('W1', 'b1', 'W2', 'b2'):
            setattr(self, name, getattr(self, name) - lr * grads['d' + name])
        return loss


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    model = MLP(X_train.shape[1], 64, len(np.unique(y_train)))
    losses = [model.train_step(X_train, y_train, lr) for _ in range(epochs)]
    return model, losses

# Per step: O(N * (input_dim * H + H * C)) time, O(N * H) memory for the cache
`,
  },
  {
    id: 'e2e-transformer',
    title: 'E2E: Transformer Encoder',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End Transformer Encoder

### What you'll build
Every piece of the original (post-norm) Transformer encoder from "Attention Is All You Need", written as small functions and then stacked: layer norm, sinusoidal positions, scaled dot-product attention, multi-head attention, the feed-forward network, an encoder block and a multi-layer encoder.

### Architecture
| Step | Operation | Shape |
|------|-----------|-------|
| input | \`x\` | \`(batch, seq_len, d_model)\` |
| positions | \`x = x + positional_encoding(seq_len, d_model)\` | same |
| per block: attention | \`a = multi_head_attention(x, x, x, num_heads)\` | same |
| per block: add & norm | \`x = layer_norm(x + a, ln1_gamma, ln1_beta)\` | same |
| per block: FFN | \`f = relu(x @ W1 + b1) @ W2 + b2\` | hidden \`(…, d_ff)\`, out same |
| per block: add & norm | \`x = layer_norm(x + f, ln2_gamma, ln2_beta)\` | same |

This is **post-norm** (LayerNorm after the residual add), as in the 2017 paper. GPT-style models use pre-norm; see **Mini GPT**.

### Function contract
| Function | Formula / behaviour | Returns |
|----------|---------------------|---------|
| \`layer_norm(x, gamma, beta, eps=1e-5)\` | \`gamma · (x − mean) / sqrt(var + eps) + beta\` over the last axis, population variance | array shaped like \`x\` |
| \`positional_encoding(seq_len, d_model)\` | \`PE[p, 2i] = sin(p / 10000^(2i/d_model))\`, \`PE[p, 2i+1] = cos(…)\` | \`(seq_len, d_model)\` |
| \`scaled_dot_product_attention(Q, K, V, mask=None)\` | \`A = softmax(Q Kᵀ / sqrt(d_k) + mask)\`; \`mask\` is **additive** (0 or −inf) | tuple \`(A @ V, A)\` for 3-D inputs \`(batch, seq, d_k)\` |
| \`multi_head_attention(Q, K, V, num_heads)\` | split \`d_model\` into \`num_heads\` heads of \`d_k = d_model / num_heads\`, attend per head, concatenate | output only, \`(batch, seq_len, d_model)\` |
| \`feed_forward(x, W1, b1, W2, b2)\` | \`relu(x @ W1 + b1) @ W2 + b2\` | \`(…, d_model)\` |
| \`TransformerEncoderBlock(d_model, num_heads, d_ff)\` | attributes below; \`forward(x)\` runs one post-norm block | \`(batch, seq_len, d_model)\` |
| \`transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256)\` | add positions, then \`num_layers\` fresh blocks | \`(batch, seq_len, d_model)\` |

**Simplification:** \`multi_head_attention\` has **no learned projections**: the heads are slices of the given Q, K, V and there is no \`W_O\`. Real layers project first (\`Q = x W_Q\` etc.); the PyTorch \`nn.MultiheadAttention\` and the **Mini GPT** problem do.

### Block parameters (the tests use these names)
After \`np.random.seed(42)\` (in the starter), create, in this order:
- \`ln1_gamma\`, \`ln2_gamma\`: ones \`(d_model,)\`; \`ln1_beta\`, \`ln2_beta\`: zeros \`(d_model,)\`
- \`W1 = np.random.randn(d_model, d_ff) * 0.02\`, then \`W2 = np.random.randn(d_ff, d_model) * 0.02\`; \`b1\`, \`b2\` zeros

Because every block re-seeds, all blocks in \`transformer_encoder\` start with identical weights; that keeps the exercise deterministic.

### Edge cases and conventions
- Subtract the row max inside softmax (the provided \`softmax\` does).
- \`d_model\` must be divisible by \`num_heads\`.

### Constraints
NumPy only, no loops over batch, heads or positions (\`einsum\` or \`@\` with transposes).

### Follow-up
- Attention costs \`O(seq_len² · d_model)\` time and \`O(seq_len²)\` memory per head. What do FlashAttention and sliding windows change?
- Why does pre-norm train more stably than post-norm in deep stacks?
    `,
    examples: [
      {
        input: 'layer_norm(np.array([[1.0, 2.0, 3.0, 4.0]]), np.ones(4), np.zeros(4))',
        output: 'array([[-1.3416, -0.4472, 0.4472, 1.3416]])',
        explanation: 'Mean 2.5 and population variance 1.25, so each value becomes (x − 2.5) / 1.118',
      },
      {
        input: 'positional_encoding(3, 4)[2]',
        output: 'array([0.9093, -0.4161, 0.02, 0.9998])',
        explanation: 'Position 2: sin(2), cos(2), then the slower pair sin(2/100), cos(2/100)',
      },
      {
        input: 'Q = K = [[[1, 0], [0, 1]]], V = [[[1, 2], [3, 4]]]; scaled_dot_product_attention(Q, K, V)',
        output: '(array([[[1.6605, 2.6605], [2.3395, 3.3395]]]), array([[[0.6698, 0.3302], [0.3302, 0.6698]]]))',
        explanation: 'Scores are I / sqrt(2), so each query puts softmax([0.707, 0]) = [0.67, 0.33] on itself and the other key',
      },
    ],
    starterCode: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


def layer_norm(x, gamma, beta, eps=1e-5):
    """Normalize over the last axis (population variance), then scale and shift."""
    # Your code here
    pass


def positional_encoding(seq_len, d_model):
    """Sinusoidal positional encoding, shape (seq_len, d_model): sin on even, cos on odd columns."""
    # Your code here
    pass


def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q, K, V: (batch, seq_len, d_k). mask: optional additive mask (0 / -inf).

    Returns:
        (output, attention): (batch, seq_len, d_k) and (batch, seq_len, seq_len)
    """
    # Your code here
    pass


def multi_head_attention(Q, K, V, num_heads):
    """
    Split d_model into num_heads heads (no learned projections), attend per head,
    concatenate. Returns the output only: (batch, seq_len, d_model).
    """
    # Your code here
    pass


def feed_forward(x, W1, b1, W2, b2):
    """Position-wise feed-forward network: Linear -> ReLU -> Linear"""
    # Your code here
    pass


class TransformerEncoderBlock:
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        """
        Post-norm encoder block.

        Create: ln1_gamma, ln1_beta, ln2_gamma, ln2_beta (ones / zeros, shape (d_model,)),
        W1 = np.random.randn(d_model, d_ff) * 0.02, b1 = zeros(d_ff),
        W2 = np.random.randn(d_ff, d_model) * 0.02, b2 = zeros(d_model)  (W1 drawn before W2).
        """
        np.random.seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        # Initialize weights
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        x = LN1(x + MHA(x)); x = LN2(x + FFN(x)).

        Args:
            x: Input (batch, seq_len, d_model)

        Returns:
            output: (batch, seq_len, d_model)
        """
        # Your code here
        pass


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    """Add positional encoding, then apply num_layers new TransformerEncoderBlocks."""
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
      {
        id: '6',
        description: 'layer_norm and positional_encoding values',
        input: '(lambda: (np.round(layer_norm(np.array([[1.0, 2.0, 3.0, 4.0]]), np.ones(4), np.zeros(4)), 4).tolist(), np.round(positional_encoding(3, 4), 4).tolist()))()',
        expected: '([[-1.3416, -0.4472, 0.4472, 1.3416]], [[0.0, 1.0, 0.0, 1.0], [0.8415, 0.5403, 0.01, 1.0], [0.9093, -0.4161, 0.02, 0.9998]])',
        hidden: false,
      },
      {
        id: '7',
        description: 'Attention output and weights (values), and an additive causal mask',
        input: `(lambda: (
    Q := np.array([[[1.0, 0.0], [0.0, 1.0]]]), V := np.array([[[1.0, 2.0], [3.0, 4.0]]]),
    r := scaled_dot_product_attention(Q, Q, V),
    m := scaled_dot_product_attention(Q, Q, V, np.array([[0.0, -np.inf], [0.0, 0.0]]))[1],
    (np.round(r[0], 4).tolist(), np.round(r[1], 4).tolist(), np.round(m, 4).tolist())
)[-1])()`,
        expected: '([[[1.6605, 2.6605], [2.3395, 3.3395]]], [[[0.6698, 0.3302], [0.3302, 0.6698]]], [[[1.0, 0.0], [0.3302, 0.6698]]])',
        hidden: true,
      },
      {
        id: '8',
        description: 'Multi-head attention equals attention applied to each head slice',
        input: `(lambda: (
    x := np.random.randn(2, 5, 8),
    ref := np.concatenate([scaled_dot_product_attention(x[..., h*2:(h+1)*2], x[..., h*2:(h+1)*2], x[..., h*2:(h+1)*2])[0] for h in range(4)], axis=-1),
    bool(np.allclose(multi_head_attention(x, x, x, 4), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '9',
        description: 'Block forward is post-norm: LN2(y + FFN(y)) with y = LN1(x + MHA(x))',
        input: `(lambda: (
    blk := TransformerEncoderBlock(8, 2, 16),
    blk.__setattr__('ln1_gamma', np.linspace(0.5, 1.5, 8)), blk.__setattr__('ln2_beta', np.full(8, 0.1)),
    blk.__setattr__('W1', np.random.randn(8, 16) * 0.5), blk.__setattr__('W2', np.random.randn(16, 8) * 0.5),
    x := np.random.randn(2, 3, 8),
    ln := lambda z, g, b: g * (z - z.mean(-1, keepdims=True)) / np.sqrt(z.var(-1, keepdims=True) + 1e-5) + b,
    y := ln(x + multi_head_attention(x, x, x, 2), blk.ln1_gamma, blk.ln1_beta),
    ref := ln(y + np.maximum(0, y @ blk.W1 + blk.b1) @ blk.W2 + blk.b2, blk.ln2_gamma, blk.ln2_beta),
    bool(np.allclose(blk.forward(x), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '10',
        description: 'Full encoder values with the documented initialization',
        input: '(lambda: (x := np.random.randn(1, 4, 8), np.round(transformer_encoder(x, num_layers=2, d_model=8, num_heads=2, d_ff=16)[0, 0], 4).tolist())[-1])()',
        expected: '[0.352, -0.1325, -0.7185, 2.3788, 0.2482, -0.829, -0.863, -0.436]',
        hidden: true,
      },
    ],
    hints: [
      'Build bottom-up: get layer_norm, positional_encoding and attention right on tiny inputs before assembling the block; the block is just two "sublayer, add, normalize" steps.',
      'Multi-head attention is reshaping: (B, T, D) → (B, T, H, D/H) → (B, H, T, D/H), attend over the last two axes, then undo the transposes and reshape back to (B, T, D).',
      'scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k) (or np.einsum("bhqd,bhkd->bhqk", ...)); PE uses div = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model)).',
      'Pitfall: np.var defaults to the population variance (what LayerNorm wants); adding the mask after the softmax, or forgetting to transpose before the final reshape, silently scrambles heads.',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


def layer_norm(x, gamma, beta, eps=1e-5):
    mean = np.mean(x, axis=-1, keepdims=True)
    var = np.var(x, axis=-1, keepdims=True)          # population variance
    return gamma * (x - mean) / np.sqrt(var + eps) + beta


def positional_encoding(seq_len, d_model):
    PE = np.zeros((seq_len, d_model))
    position = np.arange(seq_len)[:, None]                                   # (T, 1)
    div_term = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))
    PE[:, 0::2] = np.sin(position * div_term)
    PE[:, 1::2] = np.cos(position * div_term)
    return PE


def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k)      # (B, T, T)
    if mask is not None:
        scores = scores + mask                            # additive: 0 or -inf
    attention = softmax(scores, axis=-1)
    return attention @ V, attention


def multi_head_attention(Q, K, V, num_heads):
    batch, seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    def split_heads(x):                                   # (B, T, D) -> (B, H, T, d_k)
        return x.reshape(batch, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)

    q, k, v = split_heads(Q), split_heads(K), split_heads(V)
    scores = np.einsum('bhqd,bhkd->bhqk', q, k) / np.sqrt(d_k)
    out = np.einsum('bhqk,bhkd->bhqd', softmax(scores, axis=-1), v)
    return out.transpose(0, 2, 1, 3).reshape(batch, seq_len, d_model)   # concat heads


def feed_forward(x, W1, b1, W2, b2):
    return np.maximum(0, x @ W1 + b1) @ W2 + b2


class TransformerEncoderBlock:
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        np.random.seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        self.ln1_gamma = np.ones(d_model)
        self.ln1_beta = np.zeros(d_model)
        self.ln2_gamma = np.ones(d_model)
        self.ln2_beta = np.zeros(d_model)

        self.W1 = np.random.randn(d_model, d_ff) * 0.02
        self.b1 = np.zeros(d_ff)
        self.W2 = np.random.randn(d_ff, d_model) * 0.02
        self.b2 = np.zeros(d_model)

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Post-norm: sublayer, residual add, then LayerNorm
        x = layer_norm(x + multi_head_attention(x, x, x, self.num_heads),
                       self.ln1_gamma, self.ln1_beta)
        x = layer_norm(x + feed_forward(x, self.W1, self.b1, self.W2, self.b2),
                       self.ln2_gamma, self.ln2_beta)
        return x


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    x = x + positional_encoding(x.shape[1], d_model)
    for _ in range(num_layers):
        x = TransformerEncoderBlock(d_model, num_heads, d_ff).forward(x)
    return x

# Per block: O(B * T^2 * D) for attention + O(B * T * D * d_ff) for the FFN
`,
  },
  {
    id: 'e2e-vae',
    title: 'E2E: Variational Autoencoder',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End Variational Autoencoder

### What you'll build
A complete VAE in NumPy: an MLP encoder that outputs a Gaussian per input, the reparameterization trick, an MLP decoder, the negative-ELBO loss, and sampling from the prior. It assembles **VAE Reparameterization Trick** and **VAE Loss Function** from Generative Models into one model.

### Architecture
| Stage | Operation | Shape |
|-------|-----------|-------|
| input | \`x\` | \`(batch, input_dim)\` |
| encoder hidden | \`h = relu(x @ W_enc + b_enc)\` | \`(batch, hidden_dim)\` |
| latent mean | \`mu = h @ W_mu + b_mu\` | \`(batch, latent_dim)\` |
| latent log-variance | \`log_var = h @ W_logvar + b_logvar\` | \`(batch, latent_dim)\` |
| sample | \`z = mu + exp(0.5·log_var) ⊙ ε\`, \`ε = np.random.randn(*mu.shape)\` | \`(batch, latent_dim)\` |
| decoder hidden | \`h' = relu(z @ W_dec1 + b_dec1)\` | \`(batch, hidden_dim)\` |
| reconstruction | \`x_recon = sigmoid(h' @ W_dec2 + b_dec2)\` | \`(batch, input_dim)\`, values in (0, 1) |

The constructor (given) seeds \`np.random.seed(42)\` and initializes every weight as \`N(0, 0.01²)\` with zero biases.

### Loss (negative ELBO)
The same convention as **VAE Loss Function** (the standard one from Kingma & Welling and the PyTorch VAE example):
\`\`\`text
recon_loss = mean((x − x_recon)²)                                        # over all elements
kl_loss    = mean_i [ −0.5 · Σ_j (1 + log_var_ij − mu_ij² − exp(log_var_ij)) ]   # sum over latent dims, mean over batch
total_loss = recon_loss + kl_loss
\`\`\`
Earlier versions of this problem averaged the KL over latent dims as well; that shrinks it by a factor of \`latent_dim\` relative to the reconstruction term. The convention above is the one both problems now use.

### Method contract
| Method | Returns |
|--------|---------|
| \`encode(x)\` | tuple \`(mu, log_var)\`, each \`(batch, latent_dim)\` |
| \`reparameterize(mu, log_var)\` | \`z\`, drawing ε once with \`np.random.randn(*mu.shape)\` (no re-seeding) |
| \`decode(z)\` | \`x_recon\` \`(batch, input_dim)\`, sigmoid output |
| \`forward(x)\` | dict \`{'mu', 'log_var', 'z', 'x_recon'}\` |
| \`compute_loss(x, x_recon, mu, log_var)\` | dict \`{'total_loss', 'recon_loss', 'kl_loss'}\` of floats |
| \`sample(num_samples)\` | \`decode(z)\` with \`z = np.random.randn(num_samples, latent_dim)\`: \`(num_samples, input_dim)\` |

### Edge cases and conventions
- With the tiny initial weights, \`mu ≈ 0\` and \`log_var ≈ 0\`, so the initial KL is close to 0 and \`x_recon ≈ 0.5\`.
- \`kl_loss ≥ 0\` always; \`total_loss\` is exactly the sum of the other two.

### Constraints
NumPy only, vectorised over the batch. Training (backprop) is not required here; the PyTorch track's autograd makes it a one-liner.

### Follow-up
- With sigmoid outputs and binary data, why is BCE the more principled reconstruction loss?
- How do you detect posterior collapse (KL → 0 for every latent dim), and what do KL annealing and free bits do?
    `,
    examples: [
      {
        input: 'vae.compute_loss(x=[[1.0, 2.0]], x_recon=[[0.0, 0.0]], mu=[[0.5, -0.5]], log_var=[[0.0, 1.0]])',
        output: "{'total_loss': 3.1091, 'recon_loss': 2.5, 'kl_loss': 0.6091} (rounded)",
        explanation: 'Same numbers as the VAE Loss Function example: recon = 5/2, KL summed over the 2 latent dims',
      },
      {
        input: 'VAE(784, 256, 20).forward(np.random.randn(4, 784))',
        output: "{'mu': (4, 20), 'log_var': (4, 20), 'z': (4, 20), 'x_recon': (4, 784)}",
        explanation: 'Shapes of the returned arrays',
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
        h = relu(x @ W_enc + b_enc); mu = h @ W_mu + b_mu; log_var = h @ W_logvar + b_logvar

        Returns:
            (mu, log_var): each (batch, latent_dim)
        """
        # Your code here
        pass

    def reparameterize(self, mu: np.ndarray, log_var: np.ndarray) -> np.ndarray:
        """
        Reparameterization trick: z = mu + exp(0.5 * log_var) * eps,
        with eps = np.random.randn(*mu.shape) (drawn once, no re-seeding).
        """
        # Your code here
        pass

    def decode(self, z: np.ndarray) -> np.ndarray:
        """
        Decode latent vectors: relu(z @ W_dec1 + b_dec1), then sigmoid(... @ W_dec2 + b_dec2).

        Returns:
            x_recon: (batch, input_dim), values in (0, 1)
        """
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> dict:
        """
        Full forward pass.

        Returns:
            {'mu', 'log_var', 'z', 'x_recon'}
        """
        # Your code here
        pass

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     mu: np.ndarray, log_var: np.ndarray) -> dict:
        """
        Negative ELBO.
        recon_loss = MSE over all elements;
        kl_loss = -0.5 * sum over latent dims of (1 + log_var - mu^2 - exp(log_var)), averaged over the batch.

        Returns:
            {'total_loss', 'recon_loss', 'kl_loss'} as floats, total = recon + kl
        """
        # Your code here
        pass

    def sample(self, num_samples: int) -> np.ndarray:
        """
        Decode z = np.random.randn(num_samples, latent_dim) drawn from the prior.

        Returns:
            (num_samples, input_dim)
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
      {
        id: '6',
        description: 'compute_loss values: KL sums over latent dims and averages over the batch',
        input: `(lambda: (
    vae := VAE(4, 3, 2),
    a := vae.compute_loss(np.array([[1.0, 2.0]]), np.zeros((1, 2)), np.array([[0.5, -0.5]]), np.array([[0.0, 1.0]])),
    b := vae.compute_loss(np.full((2, 3), 0.5), np.zeros((2, 3)), np.array([[1.0, 1.0], [0.0, 0.0]]), np.zeros((2, 2))),
    [round(float(d[k]), 4) for d in (a, b) for k in ('total_loss', 'recon_loss', 'kl_loss')]
)[-1])()`,
        expected: '[3.1091, 2.5, 0.6091, 0.75, 0.25, 0.5]',
        hidden: false,
      },
      {
        id: '7',
        description: 'encode and decode values (weights scaled up so the outputs are not tiny)',
        input: `(lambda: (
    vae := VAE(4, 3, 2),
    [setattr(vae, n, getattr(vae, n) * 100) for n in ('W_enc', 'W_mu', 'W_logvar', 'W_dec1', 'W_dec2')],
    mu_lv := vae.encode(np.array([[1.0, 0.0, -1.0, 2.0]])),
    (np.round(mu_lv[0], 4).tolist(), np.round(mu_lv[1], 4).tolist(), np.round(vae.decode(np.array([[0.5, -1.0]])), 4).tolist())
)[-1])()`,
        expected: '([[-0.1875, 0.0533]], [[0.0102, -0.2683]], [[0.6317, 0.3098, 0.5342, 0.2166]])',
        hidden: true,
      },
      {
        id: '8',
        description: 'forward is consistent: x_recon = decode(z), and z - mu is scaled by exp(0.5 * log_var)',
        input: `(lambda: (
    vae := VAE(6, 5, 3),
    [setattr(vae, n, getattr(vae, n) * 100) for n in ('W_enc', 'W_mu', 'W_logvar', 'W_dec1', 'W_dec2')],
    out := vae.forward(np.random.randn(4, 6)),
    eps := (out['z'] - out['mu']) / np.exp(0.5 * out['log_var']),
    s := vae.sample(5),
    bool(np.allclose(out['x_recon'], vae.decode(out['z'])) and abs(eps.std() - 1) < 0.6 and s.shape == (5, 6) and np.all((s > 0) & (s < 1)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'A VAE is an autoencoder whose bottleneck is a distribution: encode to (mu, log_var), sample z, decode. The loss pays for both bad reconstructions and posteriors far from N(0, I).',
      'Write the methods in order: encode → reparameterize → decode → forward (chains the three and returns a dict) → compute_loss → sample (decode prior samples).',
      'Encoder: h = np.maximum(0, x @ W_enc + b_enc), then two linear heads. Decoder ends with 1 / (1 + np.exp(-a)). KL: np.mean(-0.5 * np.sum(1 + log_var - mu**2 - np.exp(log_var), axis=1)).',
      'Pitfall: np.mean over the whole (batch, latent_dim) KL array divides by latent_dim too; sum over axis=1 first. Use exp(0.5 * log_var) (the std), not exp(log_var).',
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
        log_var = h @ self.W_logvar + self.b_logvar    # unconstrained, unlike sigma
        return mu, log_var

    def reparameterize(self, mu: np.ndarray, log_var: np.ndarray) -> np.ndarray:
        eps = np.random.randn(*mu.shape)               # randomness outside the parameters
        return mu + np.exp(0.5 * log_var) * eps

    def decode(self, z: np.ndarray) -> np.ndarray:
        h = np.maximum(0, z @ self.W_dec1 + self.b_dec1)
        return 1 / (1 + np.exp(-(h @ self.W_dec2 + self.b_dec2)))   # sigmoid

    def forward(self, x: np.ndarray) -> dict:
        mu, log_var = self.encode(x)
        z = self.reparameterize(mu, log_var)
        return {'mu': mu, 'log_var': log_var, 'z': z, 'x_recon': self.decode(z)}

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     mu: np.ndarray, log_var: np.ndarray) -> dict:
        recon_loss = float(np.mean((x - x_recon) ** 2))
        # KL(q(z|x) || N(0, I)): sum over latent dims, mean over the batch
        kl_loss = float(np.mean(-0.5 * np.sum(1 + log_var - mu**2 - np.exp(log_var), axis=1)))
        return {'total_loss': recon_loss + kl_loss, 'recon_loss': recon_loss, 'kl_loss': kl_loss}

    def sample(self, num_samples: int) -> np.ndarray:
        z = np.random.randn(num_samples, self.latent_dim)   # prior N(0, I)
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

### What you'll build
A small but complete VQ-VAE: a vector-quantization layer with its losses, an encoder and decoder around it, the total loss, and codebook-usage statistics. It extends **VQ-VAE Vector Quantization** (Generative Models) into a model.

### Background
A VQ-VAE autoencodes through a **discrete** bottleneck: each encoder vector is replaced by its nearest codebook entry. The indices are a compressed, tokenized version of the input that a Transformer can model later (this is how VQGAN and many audio and image tokenizers work). Unlike a VAE there is no KL term; the codebook and commitment losses keep encoder outputs and codes close.

### Architecture (simplified to MLPs on 4×4 inputs)
| Stage | Operation | Shape |
|-------|-----------|-------|
| input | \`x\` | \`(batch, C, 4, 4)\` |
| flatten | \`x.reshape(batch, -1)\` | \`(batch, 16·C)\` |
| encoder | \`relu(· @ enc_w1 + enc_b1) @ enc_w2 + enc_b2\` | \`(batch, D)\` |
| as a 1×1 latent grid | reshape | \`z_e: (batch, 1, 1, D)\` |
| quantize | nearest row of \`vq.embedding\` | \`z_q: (batch, 1, 1, D)\`, \`indices: (batch, 1, 1)\` |
| decoder | \`relu(flat(z_q) @ dec_w1 + dec_b1) @ dec_w2 + dec_b2\` | \`(batch, 16·C)\` |
| reshape | | \`x_recon: (batch, C, 4, 4)\` (no output activation) |

\`D = embedding_dim\`, \`K = num_embeddings\`. Both constructors are given: they seed \`np.random.seed(42)\` and create the weights listed above (the codebook \`vq.embedding\` is \`N(0, 0.1²)\` of shape \`(K, D)\`).

### Losses
\`sg[·]\` is stop-gradient; in a NumPy forward pass the two VQ terms have the same value:
\`\`\`text
recon_loss      = mean((x − x_recon)²)
codebook_loss   = mean((sg[z_e] − z_q)²)        # trains the codebook
commitment_loss = β · mean((z_e − sg[z_q])²)     # trains the encoder; β is already included here
total_loss      = recon_loss + codebook_loss + commitment_loss
\`\`\`
With autograd, the decoder's gradient reaches the encoder through the straight-through estimator \`z_q_st = z_e + sg[z_q − z_e]\` (forward value \`z_q\`); the PyTorch track implements it.

### Method contract
| Method | Returns |
|--------|---------|
| \`VectorQuantizer.quantize(z_e)\` | tuple \`(z_q, indices, distances)\`: \`z_q\` like \`z_e\`; \`indices\` int \`(batch, H, W)\` (ties → lowest index); \`distances\` = squared distance to the chosen code, \`(batch, H, W)\` |
| \`VectorQuantizer.compute_loss(z_e, z_q, beta=0.25)\` | dict \`{'codebook_loss', 'commitment_loss'}\` (floats) |
| \`VQVAE.encode(x)\` | \`z_e (batch, 1, 1, D)\` |
| \`VQVAE.decode(z_q)\` | \`x_recon (batch, C, 4, 4)\` |
| \`VQVAE.forward(x)\` | dict \`{'z_e', 'z_q', 'indices', 'x_recon'}\` (decode \`z_q\`, not \`z_e\`) |
| \`VQVAE.compute_loss(x, x_recon, z_e, z_q, beta=0.25)\` | dict \`{'total_loss', 'recon_loss', 'codebook_loss', 'commitment_loss'}\` |
| \`VQVAE.get_codebook_usage(indices)\` | int array \`(K,)\`: how many times each code was chosen (zeros for unused codes) |

### Constraints
NumPy only; vectorised nearest-neighbour search (no loop over positions or codes).

### Follow-up
- **Codebook collapse**: few codes get all the assignments. Usage statistics reveal it; dead-code restarts fix it.
- **EMA codebook updates** replace the codebook loss: \`N_k ← γN_k + (1−γ)n_k\`, \`m_k ← γm_k + (1−γ)Σ z_e assigned to k\`, \`e_k = m_k / N_k\`.
    `,
    examples: [
      {
        input: 'vq.embedding = [[0, 0], [10, 10], [5, 5]]; vq.quantize(np.array([[[[1, 1], [9, 8], [4, 6]]]]))',
        output: 'indices = [[[0, 1, 2]]], distances = [[[2.0, 5.0, 2.0]]]',
        explanation: '[9, 8] is 1² + 2² = 5 from [10, 10]; the others are 2 from their nearest code',
      },
      {
        input: 'vq.compute_loss(z_e, z_q) for the example above',
        output: "{'codebook_loss': 1.5, 'commitment_loss': 0.375}",
        explanation: 'Mean squared error 9 / 6 = 1.5, and β = 0.25 times that',
      },
      {
        input: 'model.get_codebook_usage(np.array([[[0]], [[2]], [[2]]])) with K = 6',
        output: 'array([1, 0, 2, 0, 0, 0])',
        explanation: 'Code 0 used once, code 2 twice, the rest never',
      },
    ],
    starterCode: `import numpy as np

class VectorQuantizer:
    def __init__(self, num_embeddings: int, embedding_dim: int):
        """
        Vector quantization layer (given).

        Args:
            num_embeddings: Size of codebook (K)
            embedding_dim: Dimension of each embedding (D)
        """
        np.random.seed(42)
        self.embedding = np.random.randn(num_embeddings, embedding_dim) * 0.1   # (K, D)
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: np.ndarray) -> tuple:
        """
        Replace every vector of z_e by its nearest codebook entry.

        Args:
            z_e: Encoder output (batch, H, W, D)

        Returns:
            z_q: Quantized vectors (same shape as z_e)
            indices: Codebook indices (batch, H, W); ties go to the lowest index
            distances: Squared distance to the chosen code (batch, H, W)
        """
        # Your code here
        pass

    def compute_loss(self, z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        """
        Returns:
            {'codebook_loss': mean((z_e - z_q)**2),
             'commitment_loss': beta * mean((z_e - z_q)**2)}
        """
        # Your code here
        pass


class VQVAE:
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        """
        VQ-VAE for (batch, input_channels, 4, 4) inputs, with MLP encoder/decoder (given).
        """
        np.random.seed(42)
        self.input_channels = input_channels
        self.hidden_dim = hidden_dim
        self.embedding_dim = embedding_dim

        # Encoder: (C*16) -> hidden_dim -> embedding_dim
        self.enc_w1 = np.random.randn(input_channels * 16, hidden_dim) * 0.1
        self.enc_b1 = np.zeros(hidden_dim)
        self.enc_w2 = np.random.randn(hidden_dim, embedding_dim) * 0.1
        self.enc_b2 = np.zeros(embedding_dim)

        # Vector quantizer (re-seeds, so its codebook does not depend on the encoder size)
        self.vq = VectorQuantizer(num_embeddings, embedding_dim)

        # Decoder: embedding_dim -> hidden_dim -> (C*16)
        self.dec_w1 = np.random.randn(embedding_dim, hidden_dim) * 0.1
        self.dec_b1 = np.zeros(hidden_dim)
        self.dec_w2 = np.random.randn(hidden_dim, input_channels * 16) * 0.1
        self.dec_b2 = np.zeros(input_channels * 16)

    def encode(self, x: np.ndarray) -> np.ndarray:
        """
        x: (batch, C, 4, 4) -> flatten -> relu(x @ enc_w1 + enc_b1) @ enc_w2 + enc_b2

        Returns:
            z_e: (batch, 1, 1, embedding_dim)
        """
        # Your code here
        pass

    def decode(self, z_q: np.ndarray) -> np.ndarray:
        """
        z_q: (batch, 1, 1, D) -> flatten -> relu(z @ dec_w1 + dec_b1) @ dec_w2 + dec_b2

        Returns:
            x_recon: (batch, C, 4, 4)
        """
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> dict:
        """
        Encode, quantize, decode z_q.

        Returns:
            {'z_e', 'z_q', 'indices', 'x_recon'}
        """
        # Your code here
        pass

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        """
        Returns:
            {'total_loss', 'recon_loss', 'codebook_loss', 'commitment_loss'},
            total = recon + codebook + commitment (commitment already includes beta)
        """
        # Your code here
        pass

    def get_codebook_usage(self, indices: np.ndarray) -> np.ndarray:
        """
        Returns:
            usage: int array (num_embeddings,), count of each code in indices
        """
        # Your code here
        pass
`,
    testCases: [
      {
        id: '1',
        description: 'Quantization shape',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), bool(out[0].shape == z_e.shape))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Indices valid range',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), bool(np.all(out[1] >= 0) and np.all(out[1] < 512)))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Quantized from codebook',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), bool(np.allclose(out[0][0, 0, 0], vq.embedding[out[1][0, 0, 0]])))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Loss values correct',
        input: '(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), losses := vq.compute_loss(z_e, out[0]), bool(losses["codebook_loss"] >= 0 and losses["commitment_loss"] >= 0))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Nearest codes, distances and VQ losses on a hand-checked example',
        input: `(lambda: (
    vq := VectorQuantizer(3, 2),
    vq.__setattr__('embedding', np.array([[0.0, 0.0], [10.0, 10.0], [5.0, 5.0]])),
    z := np.array([[[[1.0, 1.0], [9.0, 8.0], [4.0, 6.0]]]]),
    q := vq.quantize(z),
    l := vq.compute_loss(z, q[0]),
    (q[1].tolist(), np.round(q[2], 4).tolist(), round(float(l['codebook_loss']), 4), round(float(l['commitment_loss']), 4))
)[-1])()`,
        expected: '([[[0, 1, 2]]], [[[2.0, 5.0, 2.0]]], 1.5, 0.375)',
        hidden: false,
      },
      {
        id: '6',
        description: 'VQVAE forward shapes and decoder input is z_q',
        input: `(lambda: (
    m := VQVAE(1, 8, 6, 3), x := np.random.randn(5, 1, 4, 4), o := m.forward(x),
    (o['z_e'].shape, o['z_q'].shape, o['indices'].shape, o['x_recon'].shape, bool(np.allclose(o['x_recon'], m.decode(o['z_q']))))
)[-1])()`,
        expected: '((5, 1, 1, 3), (5, 1, 1, 3), (5, 1, 1), (5, 1, 4, 4), True)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Total loss values and codebook usage',
        input: `(lambda: (
    m := VQVAE(1, 8, 6, 3), x := np.random.randn(5, 1, 4, 4), o := m.forward(x),
    L := m.compute_loss(x, o['x_recon'], o['z_e'], o['z_q']),
    ([round(float(L[k]), 4) for k in ('total_loss', 'recon_loss', 'codebook_loss', 'commitment_loss')],
     m.get_codebook_usage(o['indices']).tolist(), m.get_codebook_usage(np.array([[[0]], [[2]], [[2]]])).tolist())
)[-1])()`,
        expected: '([1.0413, 1.0323, 0.0072, 0.0018], [1, 0, 1, 2, 0, 1], [1, 0, 2, 0, 0, 0])',
        hidden: true,
      },
    ],
    hints: [
      'Three moving parts: an encoder to continuous vectors, a nearest-neighbour lookup into the codebook, and a decoder from the chosen codes. The losses compare z_e with z_q and x with x_recon.',
      'quantize: flatten to (N, D), compute an (N, K) distance matrix, argmin per row, gather codes, reshape back. encode/decode: flatten, two linear layers with a ReLU between, reshape.',
      'Distances: np.sum(z**2, 1, keepdims=True) - 2 * z @ E.T + np.sum(E**2, 1); usage: np.bincount(indices.ravel(), minlength=K).',
      'Pitfall: decode z_q (not z_e) in forward; commitment_loss already includes β, so do not multiply by β again in the total. Without minlength, bincount drops trailing unused codes.',
    ],
    solution: `import numpy as np

class VectorQuantizer:
    def __init__(self, num_embeddings: int, embedding_dim: int):
        np.random.seed(42)
        self.embedding = np.random.randn(num_embeddings, embedding_dim) * 0.1
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: np.ndarray) -> tuple:
        batch, H, W, D = z_e.shape
        z_flat = z_e.reshape(-1, D)                                    # (N, D)

        # ||z - e||^2 = ||z||^2 - 2 z.e + ||e||^2 for every (vector, code) pair
        distances = (np.sum(z_flat ** 2, axis=1, keepdims=True)
                     - 2 * z_flat @ self.embedding.T
                     + np.sum(self.embedding ** 2, axis=1))              # (N, K)

        indices_flat = np.argmin(distances, axis=1)                    # ties -> lowest index
        z_q = self.embedding[indices_flat].reshape(batch, H, W, D)
        indices = indices_flat.reshape(batch, H, W)
        min_distances = distances[np.arange(len(indices_flat)), indices_flat].reshape(batch, H, W)
        return z_q, indices, min_distances

    def compute_loss(self, z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        mse = float(np.mean((z_e - z_q) ** 2))
        # Same forward value; the stop-gradient decides which side each term trains
        return {'codebook_loss': mse, 'commitment_loss': beta * mse}


class VQVAE:
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        np.random.seed(42)
        self.input_channels = input_channels
        self.hidden_dim = hidden_dim
        self.embedding_dim = embedding_dim

        self.enc_w1 = np.random.randn(input_channels * 16, hidden_dim) * 0.1
        self.enc_b1 = np.zeros(hidden_dim)
        self.enc_w2 = np.random.randn(hidden_dim, embedding_dim) * 0.1
        self.enc_b2 = np.zeros(embedding_dim)

        self.vq = VectorQuantizer(num_embeddings, embedding_dim)

        self.dec_w1 = np.random.randn(embedding_dim, hidden_dim) * 0.1
        self.dec_b1 = np.zeros(hidden_dim)
        self.dec_w2 = np.random.randn(hidden_dim, input_channels * 16) * 0.1
        self.dec_b2 = np.zeros(input_channels * 16)

    def encode(self, x: np.ndarray) -> np.ndarray:
        batch = x.shape[0]
        h = np.maximum(0, x.reshape(batch, -1) @ self.enc_w1 + self.enc_b1)
        z_e = h @ self.enc_w2 + self.enc_b2                             # (batch, D)
        return z_e.reshape(batch, 1, 1, self.embedding_dim)            # a 1x1 latent grid

    def decode(self, z_q: np.ndarray) -> np.ndarray:
        batch = z_q.shape[0]
        h = np.maximum(0, z_q.reshape(batch, -1) @ self.dec_w1 + self.dec_b1)
        x_recon = h @ self.dec_w2 + self.dec_b2
        return x_recon.reshape(batch, self.input_channels, 4, 4)

    def forward(self, x: np.ndarray) -> dict:
        z_e = self.encode(x)
        z_q, indices, _ = self.vq.quantize(z_e)
        # With autograd you would decode z_e + sg[z_q - z_e] (straight-through);
        # its forward value is z_q.
        return {'z_e': z_e, 'z_q': z_q, 'indices': indices, 'x_recon': self.decode(z_q)}

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        recon_loss = float(np.mean((x - x_recon) ** 2))
        vq = self.vq.compute_loss(z_e, z_q, beta)
        total = recon_loss + vq['codebook_loss'] + vq['commitment_loss']
        return {'total_loss': total, 'recon_loss': recon_loss,
                'codebook_loss': vq['codebook_loss'], 'commitment_loss': vq['commitment_loss']}

    def get_codebook_usage(self, indices: np.ndarray) -> np.ndarray:
        return np.bincount(indices.ravel(), minlength=self.vq.num_embeddings)

# Quantization: O(N * K * D) time, O(N * K) memory for the distance matrix
`,
  },
  {
    id: 'e2e-diffusion',
    title: 'E2E: Diffusion Model',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End Diffusion Model (DDPM)

### What you'll build
The full DDPM machinery as one class: the noise schedule, closed-form forward noising, the ε-prediction training loss, the reverse step and the sampling loop. A real model would plug a neural network in as \`noise_predictor\`; here any callable works, so you can test the plumbing. It combines **Diffusion Noise Schedule**, **Diffusion Forward Process** and **DDPM Reverse Sampling Step** from Generative Models.

### Pipeline
| Phase | Step | Formula |
|-------|------|---------|
| setup | schedule (0-indexed \`t = 0..T−1\`) | \`β = linspace(β_start, β_end, T)\`, \`α = 1 − β\`, \`ᾱ_t = Π_{s≤t} α_s\` |
| training | noise data at a random t | \`x_t = sqrt(ᾱ_t)·x_0 + sqrt(1 − ᾱ_t)·ε\` |
| training | loss | \`mean((ε − ε_θ(x_t, t))²)\` |
| sampling | reverse step | \`mean = (x_t − β_t / sqrt(1 − ᾱ_t)·ε_θ) / sqrt(α_t)\`; \`x_{t−1} = mean + sqrt(β_t)·z\` for t > 0, \`mean\` at t = 0 |
| sampling | loop | start from \`x ~ N(0, I)\` and apply the reverse step for \`t = T−1, T−2, ..., 0\` |

### Method contract
| Method | Returns |
|--------|---------|
| \`__init__(T=1000, beta_start=1e-4, beta_end=0.02)\` | stores \`self.T\` and the schedule arrays \`self.betas\`, \`self.alphas\`, \`self.alpha_bars\` |
| \`get_noise_schedule()\` | dict \`{'betas', 'alphas', 'alpha_bars'}\`, each \`(T,)\` |
| \`forward_diffusion(x_0, t)\` | tuple \`(x_t, noise)\`, both shaped like \`x_0\`. Keep the starter's \`np.random.seed(42)\` and draw \`noise = np.random.randn(*x_0.shape)\` |
| \`reverse_step(x_t, t, predicted_noise)\` | \`x_{t−1}\` shaped like \`x_t\`. For t > 0 draw \`z = np.random.randn(*x_t.shape)\` (no re-seeding); at t = 0 draw nothing |
| \`compute_loss(true_noise, predicted_noise)\` | float, the MSE over all elements |
| \`sample(shape, noise_predictor)\` | final \`x\` of the given shape; calls \`noise_predictor(x, t)\` once per step with \`t\` from \`T−1\` down to \`0\` |

### Inputs
- \`x_0\`, \`x_t\`, \`predicted_noise\`, \`true_noise\`: float arrays of any matching shape
- \`t\`: int in \`[0, T−1]\`; \`shape\`: tuple; \`noise_predictor(x, t)\`: callable returning an array shaped like \`x\`

### Constraints
NumPy only; vectorised inside each step (the only loop is over timesteps in \`sample\`).

### Follow-up
- Sampling needs T network calls. How do DDIM or a shorter flow-matching ODE cut this to 20–50?
- Why do training batches sample a random \`t\` per example instead of looping over all t?
    `,
    examples: [
      {
        input: "DiffusionModel(T=3, beta_start=0.1, beta_end=0.3).get_noise_schedule()",
        output: "{'betas': [0.1, 0.2, 0.3], 'alphas': [0.9, 0.8, 0.7], 'alpha_bars': [0.9, 0.72, 0.504]}",
        explanation: 'ᾱ is the running product of α',
      },
      {
        input: 'dm.forward_diffusion(np.array([[1.0, -1.0]]), t=1) for the same model',
        output: '(array([[1.1114, -0.9217]]), array([[0.4967, -0.1383]]))',
        explanation: 'x_1 = sqrt(0.72)·x_0 + sqrt(0.28)·ε with ε the first draws after seed 42',
      },
      {
        input: 'dm.reverse_step(np.array([1.0, -0.5]), t=0, predicted_noise=np.array([0.2, 0.4]))',
        output: 'array([0.9874, -0.6604])',
        explanation: 'At t = 0 there is no added noise: (x − 0.1 / sqrt(0.1)·ε) / sqrt(0.9)',
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

        # Compute the linear schedule: self.betas, self.alphas, self.alpha_bars (each (T,))
        # Your code here
        pass

    def get_noise_schedule(self) -> dict:
        """Return {'betas', 'alphas', 'alpha_bars'}."""
        # Your code here
        pass

    def forward_diffusion(self, x_0: np.ndarray, t: int) -> tuple:
        """
        Add noise to data at timestep t.

        Args:
            x_0: Original data (batch, ...)
            t: Timestep (0-indexed)

        Returns:
            (x_t, noise): x_t = sqrt(alpha_bar_t) * x_0 + sqrt(1 - alpha_bar_t) * noise
        """
        np.random.seed(42)  # keep: draw noise once with np.random.randn(*x_0.shape)
        # Your code here
        pass

    def reverse_step(self, x_t: np.ndarray, t: int, predicted_noise: np.ndarray) -> np.ndarray:
        """
        Single reverse diffusion step.

        Args:
            x_t: Noisy data at timestep t
            t: Current timestep (0-indexed)
            predicted_noise: Noise predicted by the model

        Returns:
            x_{t-1}: mean + sqrt(beta_t) * z for t > 0 (z = np.random.randn(*x_t.shape)),
                     just the mean at t = 0
        """
        # Your code here
        pass

    def compute_loss(self, true_noise: np.ndarray, predicted_noise: np.ndarray) -> float:
        """MSE between true and predicted noise (Python float)."""
        # Your code here
        pass

    def sample(self, shape: tuple, noise_predictor) -> np.ndarray:
        """
        Generate samples using reverse diffusion.

        Args:
            shape: Shape of samples to generate
            noise_predictor: Function that predicts noise given (x_t, t)

        Returns:
            Generated samples: start from np.random.randn(*shape), then
            reverse_step for t = T-1, ..., 0
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
        input: '(lambda: (dm := DiffusionModel(1000), x_0 := np.random.randn(4, 32), out := dm.forward_diffusion(x_0, 500), bool(out[0].shape == x_0.shape))[-1])()',
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
        input: '(lambda: (dm := DiffusionModel(1000), x_0 := np.ones((2, 8)), out := dm.forward_diffusion(x_0, 0), bool(np.allclose(out[0], x_0, atol=0.5)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Schedule and forward-diffusion values',
        input: `(lambda: (
    dm := DiffusionModel(3, 0.1, 0.3), s := dm.get_noise_schedule(),
    r := dm.forward_diffusion(np.array([[1.0, -1.0]]), 1),
    (np.round(s['alpha_bars'], 4).tolist(), np.round(r[0], 4).tolist(), np.round(r[1], 4).tolist())
)[-1])()`,
        expected: '([0.9, 0.72, 0.504], [[1.1114, -0.9217]], [[0.4967, -0.1383]])',
        hidden: false,
      },
      {
        id: '7',
        description: 'Reverse step: deterministic at t = 0, adds sqrt(beta_t) * z otherwise',
        input: `(lambda: (
    dm := DiffusionModel(3, 0.1, 0.3),
    a := dm.reverse_step(np.array([1.0, -0.5]), 0, np.array([0.2, 0.4])),
    np.random.seed(5), b := dm.reverse_step(np.array([1.0, -0.5]), 2, np.array([0.2, 0.4])),
    np.random.seed(5), z := np.random.randn(2),
    mean := (np.array([1.0, -0.5]) - 0.3 / np.sqrt(1 - 0.504) * np.array([0.2, 0.4])) / np.sqrt(0.7),
    (np.round(a, 4).tolist(), bool(np.allclose(b, mean + np.sqrt(0.3) * z)))
)[-1])()`,
        expected: '([0.9874, -0.6604], True)',
        hidden: true,
      },
      {
        id: '8',
        description: 'compute_loss value; sample calls the predictor for t = T-1 down to 0',
        input: `(lambda: (
    dm := DiffusionModel(3, 0.1, 0.3), calls := [],
    out := dm.sample((2, 2), lambda x, t: (calls.append(t), np.zeros_like(x))[1]),
    (round(float(dm.compute_loss(np.array([1.0, 2.0]), np.array([0.0, 0.0]))), 4), calls, out.shape)
)[-1])()`,
        expected: '(2.5, [2, 1, 0], (2, 2))',
        hidden: true,
      },
    ],
    hints: [
      'Everything derives from the schedule: compute betas, alphas and alpha_bars once in __init__ and reuse them in every method.',
      'forward_diffusion is one line of mixing; reverse_step computes the mean, then adds noise only when t > 0; sample loops t over reversed(range(T)).',
      'np.linspace and np.cumprod for the schedule; mean = (x_t - betas[t] / np.sqrt(1 - alpha_bars[t]) * eps) / np.sqrt(alphas[t]); sigma_t = np.sqrt(betas[t]).',
      'Pitfall: the reverse step divides by sqrt(α_t) (this step) but scales ε by β_t / sqrt(1 − ᾱ_t) (cumulative). Do not re-seed inside reverse_step, or every step draws the same z.',
    ],
    solution: `import numpy as np

class DiffusionModel:
    def __init__(self, T: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        self.T = T
        self.betas = np.linspace(beta_start, beta_end, T)
        self.alphas = 1 - self.betas
        self.alpha_bars = np.cumprod(self.alphas)

    def get_noise_schedule(self) -> dict:
        return {'betas': self.betas, 'alphas': self.alphas, 'alpha_bars': self.alpha_bars}

    def forward_diffusion(self, x_0: np.ndarray, t: int) -> tuple:
        np.random.seed(42)
        noise = np.random.randn(*x_0.shape)
        ab = self.alpha_bars[t]
        x_t = np.sqrt(ab) * x_0 + np.sqrt(1 - ab) * noise   # q(x_t | x_0) in one shot
        return x_t, noise

    def reverse_step(self, x_t: np.ndarray, t: int, predicted_noise: np.ndarray) -> np.ndarray:
        beta, alpha, ab = self.betas[t], self.alphas[t], self.alpha_bars[t]
        mean = (x_t - beta / np.sqrt(1 - ab) * predicted_noise) / np.sqrt(alpha)
        if t == 0:
            return mean                                   # final step: no noise
        return mean + np.sqrt(beta) * np.random.randn(*x_t.shape)   # sigma_t^2 = beta_t

    def compute_loss(self, true_noise: np.ndarray, predicted_noise: np.ndarray) -> float:
        return float(np.mean((true_noise - predicted_noise) ** 2))

    def sample(self, shape: tuple, noise_predictor) -> np.ndarray:
        x = np.random.randn(*shape)                       # x_{T-1} ~ N(0, I)
        for t in reversed(range(self.T)):
            x = self.reverse_step(x, t, noise_predictor(x, t))
        return x

# Sampling: T calls of the noise predictor, O(T * size(x)) extra work
`,
  },
  {
    id: 'e2e-cnn',
    title: 'E2E: Convolutional Neural Network',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End CNN

### What you'll build
A LeNet-style image classifier in NumPy: 2-D convolution, max pooling and flatten as standalone functions, then a \`CNN\` class that chains two conv blocks and two fully connected layers into logits.

### Architecture (input \`(batch, C, H, W)\`, e.g. MNIST \`(batch, 1, 28, 28)\`)
| Layer | Operation | Output shape (28×28 input) |
|-------|-----------|----------------------------|
| conv1 | \`conv2d(x, conv1_w (32, C, 3, 3), conv1_b)\` + ReLU | \`(batch, 32, 26, 26)\` |
| pool1 | \`maxpool2d(·, 2)\` | \`(batch, 32, 13, 13)\` |
| conv2 | \`conv2d(·, conv2_w (64, 32, 3, 3), conv2_b)\` + ReLU | \`(batch, 64, 11, 11)\` |
| pool2 | \`maxpool2d(·, 2)\` | \`(batch, 64, 5, 5)\` |
| flatten | \`flatten(·)\` | \`(batch, 1600)\` |
| fc1 | \`· @ fc1_w + fc1_b\` + ReLU | \`(batch, 128)\` |
| fc2 | \`· @ fc2_w + fc2_b\` | \`(batch, num_classes)\` **logits** (no softmax) |

General sizes: a 3×3 valid conv maps \`H → H − 2\`; a 2×2 pool maps \`H → H // 2\` (an odd leftover row/column is dropped). So \`flat_size = 64 · h2 · w2\` with \`h1 = (H − 2) // 2\`, \`h2 = (h1 − 2) // 2\` (same for W).

### Function contract
| Function | Behaviour | Returns |
|----------|-----------|---------|
| \`conv2d(x, kernel, bias)\` | stride 1, no padding, **cross-correlation** (no kernel flip, like every DL framework): \`out[b, o, i, j] = Σ_{c,u,v} x[b, c, i+u, j+v] · kernel[o, c, u, v] + bias[o]\` | \`(batch, out_ch, H − kH + 1, W − kW + 1)\` |
| \`maxpool2d(x, pool_size=2)\` | non-overlapping windows (stride = pool_size), max per window and channel | \`(batch, ch, H // p, W // p)\` |
| \`flatten(x)\` | keep the batch axis, merge the rest | \`(batch, −1)\` |
| \`CNN(input_shape, num_classes)\` | creates \`conv1_w/b\`, \`conv2_w/b\` (given, after \`np.random.seed(42)\`), then \`fc1_w (flat_size, 128)\`, \`fc1_b\`, \`fc2_w (128, num_classes)\`, \`fc2_b\` (weights \`N(0, 0.1²)\`, zero biases) | |
| \`CNN.forward(x)\` | the table above | logits \`(batch, num_classes)\` |
| \`test_cnn()\` | a smoke test: build \`CNN((1, 28, 28), 10)\`, run 4 random images | \`True\` if the logits have shape \`(4, 10)\` |

### Constraints
NumPy only. Loops over output positions are acceptable for clarity, but try to vectorise \`conv2d\` (\`np.lib.stride_tricks.sliding_window_view\` + \`np.einsum\`): the naive 4-level loop is very slow in the browser.

### Follow-up
- Parameter count of conv1 and fc1 for MNIST? (32·1·9 + 32 = 320 and 1600·128 + 128 = 204,928: the dense layer dominates.)
- How does im2col turn convolution into one matrix multiply?
    `,
    examples: [
      {
        input: 'conv2d(np.arange(16.0).reshape(1, 1, 4, 4), np.array([[[[1.0, 0.0], [2.0, -1.0]]]]), np.array([0.5]))',
        output: '[[[[3.5, 5.5, 7.5], [11.5, 13.5, 15.5], [19.5, 21.5, 23.5]]]]',
        explanation: 'With x[i, j] = 4i + j, each output is x[i, j] + 2·x[i+1, j] − x[i+1, j+1] + 0.5 = 8i + 2j + 3.5',
      },
      {
        input: 'maxpool2d(np.array([[[[1, 3, 2, 0], [4, 2, 1, 5], [0, 1, 7, 6], [2, 8, 3, 1]]]]))',
        output: '[[[[4.0, 5.0], [8.0, 7.0]]]]',
        explanation: 'The max of each non-overlapping 2×2 block',
      },
      {
        input: 'CNN((1, 28, 28), 10).forward(np.random.randn(2, 1, 28, 28)).shape',
        output: '(2, 10)',
        explanation: '28 → 26 → 13 → 11 → 5, so fc1 sees 64·5·5 = 1600 features',
      },
    ],
    starterCode: `import numpy as np

def conv2d(x: np.ndarray, kernel: np.ndarray, bias: np.ndarray) -> np.ndarray:
    """
    2D convolution (cross-correlation, no padding, stride=1).

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
    2D max pooling with non-overlapping windows (stride = pool_size).

    Args:
        x: Input (batch, channels, height, width)
        pool_size: Size of pooling window

    Returns:
        output: (batch, channels, height // pool_size, width // pool_size)
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

        # Flattened size after conv(3x3) -> pool(2) -> conv(3x3) -> pool(2)
        # Your code here

        # Fully connected layers: fc1_w (flat_size, 128), fc1_b (128,),
        # fc2_w (128, num_classes), fc2_b (num_classes,); weights * 0.1, biases zero
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass through CNN.

        Args:
            x: Input images (batch, channels, height, width)

        Returns:
            logits: (batch, num_classes), no softmax
        """
        # Your code here
        pass


def test_cnn():
    """Smoke test: CNN((1, 28, 28), 10) on 4 random images; return True if logits are (4, 10)."""
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
      {
        id: '5',
        description: 'conv2d and maxpool2d values',
        input: '(lambda: (conv2d(np.arange(16.0).reshape(1, 1, 4, 4), np.array([[[[1.0, 0.0], [2.0, -1.0]]]]), np.array([0.5])).tolist(), maxpool2d(np.array([[[[1.0, 3, 2, 0], [4, 2, 1, 5], [0, 1, 7, 6], [2, 8, 3, 1]]]])).tolist(), maxpool2d(np.arange(25.0).reshape(1, 1, 5, 5)).tolist()))()',
        expected: '([[[[3.5, 5.5, 7.5], [11.5, 13.5, 15.5], [19.5, 21.5, 23.5]]]], [[[[4.0, 5.0], [8.0, 7.0]]]], [[[[6.0, 8.0], [16.0, 18.0]]]])',
        hidden: false,
      },
      {
        id: '6',
        description: 'conv2d matches a reference on random multi-channel inputs',
        input: `(lambda: (
    x := np.random.randn(2, 3, 7, 6), k := np.random.randn(4, 3, 3, 2), b := np.random.randn(4),
    ref := np.einsum('bchwij,ocij->bohw', np.lib.stride_tricks.sliding_window_view(x, (3, 2), axis=(2, 3)), k) + b[None, :, None, None],
    bool(np.allclose(conv2d(x, k, b), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'forward follows the architecture (checked against the model weights)',
        input: `(lambda: (
    m := CNN((1, 14, 14), 3), x := np.random.randn(2, 1, 14, 14),
    cv := lambda a, k, b: np.einsum('bchwij,ocij->bohw', np.lib.stride_tricks.sliding_window_view(a, k.shape[2:], axis=(2, 3)), k) + b[None, :, None, None],
    pl := lambda a: a[:, :, :a.shape[2] // 2 * 2, :a.shape[3] // 2 * 2].reshape(a.shape[0], a.shape[1], a.shape[2] // 2, 2, a.shape[3] // 2, 2).max(axis=(3, 5)),
    h := pl(np.maximum(0, cv(pl(np.maximum(0, cv(x, m.conv1_w, m.conv1_b))), m.conv2_w, m.conv2_b))).reshape(2, -1),
    ref := np.maximum(0, h @ m.fc1_w + m.fc1_b) @ m.fc2_w + m.fc2_b,
    (m.fc1_w.shape, m.fc2_w.shape, bool(np.allclose(m.forward(x), ref)))
)[-1])()`,
        expected: '((256, 128), (128, 3), True)',
        hidden: true,
      },
    ],
    hints: [
      'Track shapes layer by layer first: write down H and W after every conv (H − k + 1) and pool (H // 2); that gives the input size of fc1.',
      'Write conv2d, maxpool2d and flatten as standalone functions, test them on tiny arrays, then chain them in forward with ReLU after each conv and after fc1.',
      'Vectorised conv: windows = np.lib.stride_tricks.sliding_window_view(x, (kH, kW), axis=(2, 3)); out = np.einsum("bchwij,ocij->bohw", windows, kernel) + bias[None, :, None, None]. Pool: reshape to (B, C, H//p, p, W//p, p) and take .max(axis=(3, 5)).',
      'Pitfall: crop odd sizes before the pooling reshape (13 → 12), and do not flip the kernel; frameworks compute cross-correlation. forward returns logits, not softmax probabilities.',
    ],
    solution: `import numpy as np

def conv2d(x: np.ndarray, kernel: np.ndarray, bias: np.ndarray) -> np.ndarray:
    """Valid cross-correlation, stride 1: (B, C, H, W) -> (B, O, H-kH+1, W-kW+1)."""
    kH, kW = kernel.shape[2:]
    # windows[b, c, i, j, u, v] = x[b, c, i+u, j+v]  (a view, no copy)
    windows = np.lib.stride_tricks.sliding_window_view(x, (kH, kW), axis=(2, 3))
    return np.einsum('bchwij,ocij->bohw', windows, kernel) + bias[None, :, None, None]


def maxpool2d(x: np.ndarray, pool_size: int = 2) -> np.ndarray:
    B, C, H, W = x.shape
    p = pool_size
    Ho, Wo = H // p, W // p
    x = x[:, :, :Ho * p, :Wo * p]                         # drop the odd leftover row/column
    return x.reshape(B, C, Ho, p, Wo, p).max(axis=(3, 5))


def flatten(x: np.ndarray) -> np.ndarray:
    return x.reshape(x.shape[0], -1)


class CNN:
    def __init__(self, input_shape: tuple, num_classes: int):
        np.random.seed(42)
        in_channels, H, W = input_shape

        self.conv1_w = np.random.randn(32, in_channels, 3, 3) * 0.1
        self.conv1_b = np.zeros(32)
        self.conv2_w = np.random.randn(64, 32, 3, 3) * 0.1
        self.conv2_b = np.zeros(64)

        # conv 3x3: H -> H-2; pool 2: H -> H//2 (twice)
        h2 = ((H - 2) // 2 - 2) // 2
        w2 = ((W - 2) // 2 - 2) // 2
        flat_size = 64 * h2 * w2

        self.fc1_w = np.random.randn(flat_size, 128) * 0.1
        self.fc1_b = np.zeros(128)
        self.fc2_w = np.random.randn(128, num_classes) * 0.1
        self.fc2_b = np.zeros(num_classes)

    def forward(self, x: np.ndarray) -> np.ndarray:
        x = maxpool2d(np.maximum(0, conv2d(x, self.conv1_w, self.conv1_b)))
        x = maxpool2d(np.maximum(0, conv2d(x, self.conv2_w, self.conv2_b)))
        x = flatten(x)
        x = np.maximum(0, x @ self.fc1_w + self.fc1_b)
        return x @ self.fc2_w + self.fc2_b                # logits


def test_cnn():
    cnn = CNN(input_shape=(1, 28, 28), num_classes=10)
    logits = cnn.forward(np.random.randn(4, 1, 28, 28))
    return logits.shape == (4, 10)

# conv2d: O(B * O * C * kH * kW * H_out * W_out) time
`,
  },
  {
    id: 'e2e-mini-gpt',
    title: 'Mini GPT (Character-Level Language Model)',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## Mini GPT: a Character-Level Language Model

### What you'll build
A tiny decoder-only Transformer with the same architecture as GPT-2 (just very small), run end to end: forward pass, next-token loss, a training loop and greedy generation.

### Architecture
| Step | Operation | Shape |
|------|-----------|-------|
| input | \`idx\`: integer token ids, \`T ≤ block_size\` | \`(B, T)\` |
| embeddings | \`x = tok_emb[idx] + pos_emb[:T]\` | \`(B, T, C)\` |
| per block (pre-norm) | \`x = x + attention(LN1(x))\` | \`(B, T, C)\` |
| per block (pre-norm) | \`x = x + gelu(LN2(x) @ W_1 + b_1) @ W_2 + b_2\` | hidden \`(B, T, 4C)\` |
| final norm | \`h = LN_f(x)\` = \`hidden_states(idx)\` | \`(B, T, C)\` |
| LM head (untied) | \`logits = h @ W_lm\` | \`(B, T, V)\` |

### Causal self-attention (per block, \`H = n_heads\`, \`d_head = C / H\`)
1. \`q, k, v = split(x @ W_qkv, 3, axis=-1)\`: each \`(B, T, C)\`; the columns of \`W_qkv\` are \`[Q | K | V]\`.
2. Reshape each to \`(B, H, T, d_head)\`; head \`h\` uses columns \`h·d_head : (h+1)·d_head\`.
3. \`scores = q @ kᵀ / sqrt(d_head)\`, set to \`−inf\` where the key position is **after** the query position.
4. \`out = softmax(scores) @ v\`, merged back to \`(B, T, C)\`, then \`@ W_o\`. No biases in attention.

The constructor (given) creates every parameter with GPT-2-style \`N(0, 0.02²)\` weights from \`np.random.default_rng(seed)\`; LayerNorm (\`eps = 1e-5\`), tanh-GELU and softmax helpers are provided.

### Method contract
| Method | Returns |
|--------|---------|
| \`attention(x, blk)\` | \`(B, T, C)\`, using the block dict's \`W_qkv\` and \`W_o\` |
| \`hidden_states(idx)\` | \`(B, T, C)\`: embeddings → blocks → final LayerNorm |
| \`forward(idx)\` | logits \`(B, T, vocab_size)\` |
| \`loss(idx, targets)\` | float: mean cross-entropy over all \`B·T\` positions; \`targets[b, t]\` is the token after \`idx[b, t]\` |
| \`generate(idx, max_new_tokens)\` | int array \`(B, T + max_new_tokens)\` starting with \`idx\` |
| \`train_step(idx, targets, lr)\` | *(provided in the NumPy track)* one SGD step on \`W_lm\` only, using \`dL/dlogits = (softmax − one_hot) / N\` |
| \`train(model, idx, targets, steps=20, lr=1.0)\` | list of \`steps\` losses, each computed **before** that step's update |

### Conventions
- **Initial loss ≈ log(V)**: with std-0.02 weights the logits start near 0, so the model guesses uniformly.
- **Greedy generation**: repeat \`max_new_tokens\` times: crop the context to the last \`block_size\` tokens, run \`forward\`, append the **argmax** of the last position's logits.
- Use a numerically stable log-softmax in \`loss\` (subtract the max).

### Constraints
NumPy only; no loops over batch, heads or positions (only over blocks and generation steps).

### Follow-up
- Generation re-runs the whole context each step: how does a **KV cache** make each new token \`O(T)\` instead of \`O(T²)\`?
- Why do GPT-2 and most LLMs **tie** the LM head to \`tok_emb\`? (See **Transformer Bug Hunt**, which does.)
`,
    examples: [
      {
        input: 'model = MiniGPT(vocab_size=5); model.forward(np.zeros((2, 8), dtype=int)).shape',
        output: '(2, 8, 5)',
        explanation: 'One distribution over the 5 tokens for every position of every sequence',
      },
      {
        input: 'seq = np.array([[i % 5 for i in range(9)]]); model.loss(seq[:, :-1], seq[:, 1:])',
        output: '1.6769',
        explanation: 'Close to log 5 = 1.6094: the untrained model is nearly uniform over the 5 tokens',
      },
      {
        input: 'After train(model, seq[:, :-1], seq[:, 1:], steps=30, lr=2.0) on two shifted copies of the cycle 0→1→2→3→4→0: model.generate(np.array([[0, 1, 2]]), 5)',
        output: '[[0, 1, 2, 3, 4, 0, 1, 2]]',
        explanation: 'The prompt is kept and greedy decoding continues the learned cycle',
      },
    ],
    starterCode: `import numpy as np

def layer_norm(x, gamma, beta, eps=1e-5):
    mu = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return (x - mu) / np.sqrt(var + eps) * gamma + beta


def gelu(x):
    # tanh approximation (GPT-2)
    return 0.5 * x * (1.0 + np.tanh(np.sqrt(2.0 / np.pi) * (x + 0.044715 * x ** 3)))


def softmax(x, axis=-1):
    e = np.exp(x - x.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


class MiniGPT:
    """A tiny character-level GPT: pre-norm decoder blocks, untied LM head."""

    def __init__(self, vocab_size, d_model=16, n_heads=2, n_layers=1, block_size=8, seed=0):
        rng = np.random.default_rng(seed)

        def normal(*shape):
            return rng.normal(0.0, 0.02, size=shape)  # GPT-2 style small init

        self.vocab_size, self.d_model = vocab_size, d_model
        self.n_heads, self.block_size = n_heads, block_size
        self.tok_emb = normal(vocab_size, d_model)   # (V, C)
        self.pos_emb = normal(block_size, d_model)   # (block_size, C)
        self.blocks = []
        for _ in range(n_layers):
            self.blocks.append({
                'ln1_g': np.ones(d_model), 'ln1_b': np.zeros(d_model),
                'W_qkv': normal(d_model, 3 * d_model),    # columns: [Q | K | V]
                'W_o': normal(d_model, d_model),
                'ln2_g': np.ones(d_model), 'ln2_b': np.zeros(d_model),
                'W_1': normal(d_model, 4 * d_model), 'b_1': np.zeros(4 * d_model),
                'W_2': normal(4 * d_model, d_model), 'b_2': np.zeros(d_model),
            })
        self.lnf_g, self.lnf_b = np.ones(d_model), np.zeros(d_model)
        self.W_lm = normal(d_model, vocab_size)      # (C, V)

    def attention(self, x, blk):
        """Causal multi-head self-attention. x: (B, T, C) -> (B, T, C)"""
        # Your code here
        pass

    def hidden_states(self, idx):
        """Embeddings -> blocks -> final LayerNorm. idx: (B, T) -> (B, T, C)"""
        # Your code here
        pass

    def forward(self, idx):
        """Return logits (B, T, vocab_size)."""
        # Your code here
        pass

    def loss(self, idx, targets):
        """Mean next-token cross-entropy (float)."""
        # Your code here
        pass

    def generate(self, idx, max_new_tokens):
        """Greedy decoding. Returns (B, T + max_new_tokens)."""
        # Your code here
        pass

    def train_step(self, idx, targets, lr=1.0):
        """(Provided) One SGD step on the LM head W_lm only; everything else stays frozen.
        For mean cross-entropy, dL/dlogits = (softmax(logits) - one_hot(targets)) / N."""
        h = self.hidden_states(idx)                  # (B, T, C)
        probs = softmax(h @ self.W_lm)               # (B, T, V)
        dlogits = (probs - np.eye(self.vocab_size)[targets]) / targets.size
        grad = h.reshape(-1, self.d_model).T @ dlogits.reshape(-1, self.vocab_size)
        self.W_lm -= lr * grad


def train(model, idx, targets, steps=20, lr=1.0):
    """Call model.train_step \`steps\` times. Return the list of losses,
    each computed before that step's update."""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'forward returns (B, T, vocab_size)',
        input: 'MiniGPT(5).forward(np.random.randint(0, 5, size=(2, 8))).shape',
        expected: '(2, 8, 5)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Causal: changing a future token leaves earlier logits unchanged',
        input: '(lambda m, a: (lambda b: bool(np.allclose(m.forward(a)[:, :5], m.forward(b)[:, :5]) and not np.allclose(m.forward(a)[:, 5:], m.forward(b)[:, 5:])))(np.concatenate([a[:, :5], (a[:, 5:] + 1) % 5], axis=1)))(MiniGPT(5, n_layers=2), np.random.randint(0, 5, size=(2, 8)))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Initial loss is about log(vocab_size)',
        input: '(lambda: (seq := np.array([[i % 5 for i in range(9)], [(i + 2) % 5 for i in range(9)]]), bool(abs(MiniGPT(5).loss(seq[:, :-1], seq[:, 1:]) - np.log(5)) < 0.1))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'generate keeps the prompt and appends max_new_tokens tokens',
        input: '(lambda out: (out.shape, out[:, :3].tolist()))(MiniGPT(5).generate(np.array([[0, 1, 2]]), 5))',
        expected: '((1, 8), [[0, 1, 2]])',
        hidden: false,
      },
      {
        id: '5',
        description: 'Training reduces the loss',
        input: '(lambda: (seq := np.array([[i % 5 for i in range(9)], [(i + 2) % 5 for i in range(9)]]), losses := train(MiniGPT(5), seq[:, :-1], seq[:, 1:], steps=20, lr=1.0), bool(len(losses) == 20 and losses[-1] < losses[0] - 0.5))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Generation is greedy (argmax of the last-position logits)',
        input: '(lambda m, p: bool(m.generate(p, 1)[0, -1] == m.forward(p)[0, -1].argmax()))(MiniGPT(5, seed=3), np.array([[4, 1, 3]]))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'After training, generation continues the cycle',
        input: '(lambda: (seq := np.array([[i % 5 for i in range(9)], [(i + 2) % 5 for i in range(9)]]), m := MiniGPT(5), train(m, seq[:, :-1], seq[:, 1:], steps=30, lr=2.0), m.generate(np.array([[0, 1, 2]]), 5).tolist())[-1])()',
        expected: '[[0, 1, 2, 3, 4, 0, 1, 2]]',
        hidden: true,
      },
      {
        id: '8',
        description: 'generate crops the context to block_size',
        input: 'MiniGPT(5, block_size=8).generate(np.array([[0, 1, 2, 3, 4, 0]]), 6).shape',
        expected: '(1, 12)',
        hidden: true,
      },
      {
        id: '9',
        description: 'Exact logits for a fixed seed (architecture details)',
        input: 'round(float(np.abs(MiniGPT(5, n_layers=2, seed=1).forward(np.array([[0, 1, 2, 3, 4, 0, 1, 2]])) * 1000).sum()), 4)',
        expected: '2475.9754',
        hidden: true,
      },
    ],
    hints: [
      'Build it in the order data flows: attention for one block, then hidden_states (embeddings, blocks, final norm), then forward, loss and generate on top. Test the causal property early: changing a later token must not change earlier logits.',
      'Attention is reshaping plus one masked softmax: split x @ W_qkv into q, k, v, move heads to axis 1, compute (B, H, T, T) scores, mask, softmax, multiply by v, move heads back, project with W_o.',
      'np.split(x @ W_qkv, 3, axis=-1); a.reshape(B, T, H, d).transpose(0, 2, 1, 3); mask with np.where(np.triu(np.ones((T, T), bool), k=1), -np.inf, scores); loss with np.take_along_axis(log_probs, targets[..., None], axis=-1).',
      'Pitfalls: the residual adds to x, not to LN(x) (pre-norm); generate must crop to idx[:, -block_size:] or pos_emb runs out of rows; record each training loss before calling train_step.',
    ],
    solution: `import numpy as np

def layer_norm(x, gamma, beta, eps=1e-5):
    mu = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return (x - mu) / np.sqrt(var + eps) * gamma + beta


def gelu(x):
    # tanh approximation (GPT-2)
    return 0.5 * x * (1.0 + np.tanh(np.sqrt(2.0 / np.pi) * (x + 0.044715 * x ** 3)))


def softmax(x, axis=-1):
    e = np.exp(x - x.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


class MiniGPT:
    """A tiny character-level GPT: pre-norm decoder blocks, untied LM head."""

    def __init__(self, vocab_size, d_model=16, n_heads=2, n_layers=1, block_size=8, seed=0):
        rng = np.random.default_rng(seed)

        def normal(*shape):
            return rng.normal(0.0, 0.02, size=shape)  # GPT-2 style small init

        self.vocab_size, self.d_model = vocab_size, d_model
        self.n_heads, self.block_size = n_heads, block_size
        self.tok_emb = normal(vocab_size, d_model)   # (V, C)
        self.pos_emb = normal(block_size, d_model)   # (block_size, C)
        self.blocks = []
        for _ in range(n_layers):
            self.blocks.append({
                'ln1_g': np.ones(d_model), 'ln1_b': np.zeros(d_model),
                'W_qkv': normal(d_model, 3 * d_model),    # columns: [Q | K | V]
                'W_o': normal(d_model, d_model),
                'ln2_g': np.ones(d_model), 'ln2_b': np.zeros(d_model),
                'W_1': normal(d_model, 4 * d_model), 'b_1': np.zeros(4 * d_model),
                'W_2': normal(4 * d_model, d_model), 'b_2': np.zeros(d_model),
            })
        self.lnf_g, self.lnf_b = np.ones(d_model), np.zeros(d_model)
        self.W_lm = normal(d_model, vocab_size)      # (C, V)

    def attention(self, x, blk):
        B, T, C = x.shape
        H = self.n_heads
        d_head = C // H
        q, k, v = np.split(x @ blk['W_qkv'], 3, axis=-1)                 # each (B, T, C)
        q, k, v = (a.reshape(B, T, H, d_head).transpose(0, 2, 1, 3) for a in (q, k, v))
        scores = q @ k.transpose(0, 1, 3, 2) / np.sqrt(d_head)            # (B, H, T, T)
        future = np.triu(np.ones((T, T), dtype=bool), k=1)
        scores = np.where(future, -np.inf, scores)
        out = softmax(scores) @ v                                          # (B, H, T, d_head)
        out = out.transpose(0, 2, 1, 3).reshape(B, T, C)
        return out @ blk['W_o']

    def hidden_states(self, idx):
        T = idx.shape[1]
        x = self.tok_emb[idx] + self.pos_emb[:T]
        for blk in self.blocks:
            x = x + self.attention(layer_norm(x, blk['ln1_g'], blk['ln1_b']), blk)
            h = layer_norm(x, blk['ln2_g'], blk['ln2_b'])
            x = x + gelu(h @ blk['W_1'] + blk['b_1']) @ blk['W_2'] + blk['b_2']
        return layer_norm(x, self.lnf_g, self.lnf_b)

    def forward(self, idx):
        return self.hidden_states(idx) @ self.W_lm

    def loss(self, idx, targets):
        logits = self.forward(idx)
        m = logits.max(axis=-1, keepdims=True)
        log_probs = logits - m - np.log(np.exp(logits - m).sum(axis=-1, keepdims=True))
        picked = np.take_along_axis(log_probs, targets[..., None], axis=-1)
        return float(-picked.mean())

    def generate(self, idx, max_new_tokens):
        for _ in range(max_new_tokens):
            context = idx[:, -self.block_size:]
            next_logits = self.forward(context)[:, -1, :]
            next_token = next_logits.argmax(axis=-1)[:, None]
            idx = np.concatenate([idx, next_token], axis=1)
        return idx

    def train_step(self, idx, targets, lr=1.0):
        """(Provided) One SGD step on the LM head W_lm only; everything else stays frozen.
        For mean cross-entropy, dL/dlogits = (softmax(logits) - one_hot(targets)) / N."""
        h = self.hidden_states(idx)                  # (B, T, C)
        probs = softmax(h @ self.W_lm)               # (B, T, V)
        dlogits = (probs - np.eye(self.vocab_size)[targets]) / targets.size
        grad = h.reshape(-1, self.d_model).T @ dlogits.reshape(-1, self.vocab_size)
        self.W_lm -= lr * grad


def train(model, idx, targets, steps=20, lr=1.0):
    losses = []
    for _ in range(steps):
        losses.append(model.loss(idx, targets))
        model.train_step(idx, targets, lr)
    return losses
`,
  },
  {
    id: 'e2e-vit-classifier',
    title: 'E2E: Tiny Vision Transformer',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## End-to-End Tiny Vision Transformer (ViT)

### What you'll build
\`TinyViT\`: a Vision Transformer classifier with **one pre-norm encoder block**, including patch extraction, the [CLS] token, position embeddings, the loss and a training step.

### Background
A Vision Transformer (Dosovitskiy et al., 2021) treats an image as a **sequence of patches**: cut it into \`P × P\` tiles, embed each tile linearly, prepend a learnable **[CLS]** token, add **position embeddings**, run a Transformer encoder, and classify from the final CLS token. With no convolutions, everything the model knows about 2-D layout comes from the patch order and the position embeddings.

### Architecture
\`\`\`text
x (B, C, H, W)
  │ patchify                  (B, N, P*P*C)       N = (H/P) * (W/P)
  │ @ W_patch + b_patch       (B, N, D)
  │ prepend CLS token         (B, N+1, D)
  │ + pos_emb (N+1, D)        (only if use_pos_emb)
  ▼
  t = t + MHA(LN1(t))         pre-norm attention with residual
  t = t + MLP(LN2(t))         MLP: Linear(D, mlp_dim) -> GELU -> Linear(mlp_dim, D)
  ▼
  cls = LN_f(t[:, 0])         (B, D)      <- cls_features(x)
  logits = cls @ W_head + b_head  (B, num_classes)
\`\`\`

### Details
- **Patch order**: patches in row-major order over the \`(H/P, W/P)\` grid; inside a patch, flatten as \`(p1, p2, c)\`, i.e. einops \`'b c (h p1) (w p2) -> b (h w) (p1 p2 c)'\`. This matches a stride-\`P\` convolution.
- **MHA**: \`qkv = h @ W_qkv\` (no bias) split into \`Q, K, V\` of width \`D\`; reshape to \`num_heads\` heads of size \`D / num_heads\`; \`softmax(Q K^T / sqrt(d_head)) V\`; merge heads; output projection \`@ W_o\` (no bias). No mask: every token attends to every token.
- **LayerNorm**: over the last dimension, \`eps = 1e-5\`, with learnable gain (init 1) and bias (init 0).
- **GELU**: tanh approximation, \`0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))\`.
- **Initialization**: weights \`~ N(0, 1/fan_in)\`, biases 0, CLS token and position embeddings \`~ N(0, 0.02^2)\`.

### Why position embeddings matter
Self-attention is **permutation-equivariant**, and the CLS token attends to all patches with the same weights regardless of where they are. So **without** position embeddings, shuffling the patches of an image leaves the CLS output (and the prediction) unchanged. Position embeddings are the only source of spatial order.

### Method contract
| Method | Returns |
|--------|---------|
| \`TinyViT(img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2, mlp_dim=32, num_classes=2, use_pos_emb=True)\` | creates all parameters (initialization above) |
| \`patchify(x)\` | \`(B, C, H, W) → (B, N, P·P·C)\` |
| \`cls_features(x)\` | final-LayerNormed CLS token, \`(B, D)\` |
| \`forward(x)\` | logits \`(B, num_classes)\` |
| \`loss(x, y)\` | float, mean cross-entropy with integer labels \`y (B,)\` |
| \`train_step(x, y, lr=0.1)\` | float, the loss **before** one plain SGD step |

\`train_step\` differs by track:
- **NumPy track**: update only the classification head (\`W_head\`, \`b_head\`); the encoder stays frozen (a *linear probe*). Gradient: \`dlogits = (softmax(logits) − onehot(y)) / B\`, \`dW_head = clsᵀ @ dlogits\`, \`db_head = dlogits.sum(0)\`.
- **PyTorch track**: autograd updates **every** parameter.

In the NumPy track, parameter names and storage are up to you (the tests only use the methods above); the PyTorch starter names the patch embedding \`patch_embed\`.

### Constraints
NumPy only, no loops over batch, heads or tokens.

### Follow-up
- Attention over N patches costs \`O(N²)\`: what happens to the cost if you halve the patch size?
- Why do ViTs need more data (or strong augmentation) than CNNs? (They lack the convolutional inductive bias of locality and translation equivariance.)
    `,
    examples: [
      {
        input: 'TinyViT(img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2, num_classes=3).forward(np.random.randn(4, 1, 8, 8))',
        output: 'logits of shape (4, 3)',
        explanation: '4 patches of 4x4 pixels -> 5 tokens (with CLS) of width 16 -> CLS head.',
      },
      {
        input: 'model.patchify(np.arange(32.).reshape(1, 2, 4, 4)) with patch_size=2',
        output: 'shape (1, 4, 8); first patch [0, 16, 1, 17, 4, 20, 5, 21]',
        explanation: 'Order (p1, p2, c): pixel (0,0) of both channels, then pixel (0,1), then (1,0), then (1,1).',
      },
    ],
    starterCode: `import numpy as np

class TinyViT:
    def __init__(self, img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2,
                 mlp_dim=32, num_classes=2, use_pos_emb=True):
        """
        Create all parameters (weights ~ N(0, 1/fan_in), biases 0,
        CLS token and position embeddings ~ N(0, 0.02^2), LayerNorm gains 1).
        """
        self.patch_size = patch_size
        self.num_heads = num_heads
        self.use_pos_emb = use_pos_emb
        # Your code here

    def patchify(self, x):
        """(B, C, H, W) -> (B, N, P*P*C), patches row-major, flattened as (p1, p2, c)."""
        # Your code here
        pass

    def cls_features(self, x):
        """Embed patches, prepend CLS, add pos-emb, one pre-norm block, final LN on CLS -> (B, D)."""
        # Your code here
        pass

    def forward(self, x):
        """Logits (B, num_classes)."""
        # Your code here
        pass

    def loss(self, x, y):
        """Mean cross-entropy (float)."""
        # Your code here
        pass

    def train_step(self, x, y, lr=0.1):
        """One SGD step on the head (W_head, b_head); returns the loss before the step."""
        # Your code here
        pass
`,
    testCases: [
      {
        id: '1',
        description: 'Logits shape',
        input: 'TinyViT(img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2, num_classes=3).forward(np.random.randn(4, 1, 8, 8)).shape',
        expected: '(4, 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Patchify order (p1, p2, c)',
        input: '(lambda pt: (pt.shape, pt[0, 0].tolist(), pt[0, 3].tolist()))(TinyViT(img_size=4, patch_size=2, in_chans=2).patchify(np.arange(32.0).reshape(1, 2, 4, 4)))',
        expected: '((1, 4, 8), [0.0, 16.0, 1.0, 17.0, 4.0, 20.0, 5.0, 21.0], [10.0, 26.0, 11.0, 27.0, 14.0, 30.0, 15.0, 31.0])',
        hidden: false,
      },
      {
        id: '3',
        description: 'CLS features are LayerNormed, shape (B, D)',
        input: '(lambda f: (f.shape, bool(np.allclose(f.mean(-1), 0, atol=1e-6) and np.allclose(f.std(-1), 1, atol=1e-3))))(TinyViT(dim=16).cls_features(np.random.randn(3, 1, 8, 8)))',
        expected: '((3, 16), True)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Without pos-emb, permuting patches leaves the CLS output unchanged',
        input: `(lambda: (
    m := TinyViT(img_size=8, patch_size=4, use_pos_emb=False),
    x := np.random.randn(2, 1, 8, 8),
    x_perm := np.roll(np.roll(x, 4, axis=-1), 4, axis=-2),
    bool(np.allclose(m.cls_features(x), m.cls_features(x_perm), atol=1e-6) and not np.allclose(x, x_perm))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'With pos-emb, permuting patches changes the CLS output',
        input: `(lambda: (
    m := TinyViT(img_size=8, patch_size=4, use_pos_emb=True),
    x := np.random.randn(2, 1, 8, 8),
    bool(not np.allclose(m.cls_features(x), m.cls_features(np.roll(x, 4, axis=-1)), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Loss equals cross-entropy of the logits',
        input: `(lambda: (
    m := TinyViT(num_classes=3),
    x := np.random.randn(5, 1, 8, 8), y := np.array([0, 1, 2, 1, 0]),
    z := m.forward(x),
    ref := float(np.mean(np.log(np.exp(z).sum(1)) - z[np.arange(5), y])),
    bool(abs(m.loss(x, y) - ref) < 1e-6)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'A few training steps reduce the loss',
        input: `(lambda: (
    m := TinyViT(),
    x := (np.random.randn(8, 1, 8, 8) * 0.3 + (np.arange(8) % 2)[:, None, None, None] * (np.arange(8)[None, None, :, None] < 4)),
    y := np.arange(8) % 2,
    losses := [m.train_step(x, y, 0.5) for _ in range(20)],
    bool(len(losses) == 20 and m.loss(x, y) < 0.8 * losses[0])
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Follow the shapes: an image becomes N patch vectors, then N + 1 tokens of width D with the CLS token in front; only token 0 is used for classification.',
      'patchify is pure reshaping: (B, C, H, W) → (B, C, H/P, P, W/P, P) → transpose to (B, H/P, W/P, P, P, C) → (B, N, P·P·C). Then embed, prepend CLS, add pos, run one pre-norm block, LayerNorm the CLS row.',
      'Prepend with np.concatenate([np.broadcast_to(cls, (B, 1, D)), tokens], axis=1). Attention: np.split(h @ W_qkv, 3, axis=-1), heads via reshape(B, T, nh, hd).transpose(0, 2, 1, 3), scores = q @ k.transpose(0, 1, 3, 2) / np.sqrt(hd).',
      'Pitfall: the transpose order decides the (p1, p2, c) flattening; a plain reshape without it mixes pixels from different patches. In the NumPy train_step compute the loss before updating the head.',
    ],
    solution: `import numpy as np


def layer_norm(x, g, b, eps=1e-5):
    mu = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return g * (x - mu) / np.sqrt(var + eps) + b


def gelu(x):
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))


def softmax(x, axis=-1):
    e = np.exp(x - x.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


class TinyViT:
    def __init__(self, img_size=8, patch_size=4, in_chans=1, dim=16, num_heads=2,
                 mlp_dim=32, num_classes=2, use_pos_emb=True):
        self.patch_size = patch_size
        self.num_heads = num_heads
        self.use_pos_emb = use_pos_emb
        n_patches = (img_size // patch_size) ** 2
        patch_dim = patch_size * patch_size * in_chans

        def w(fan_in, fan_out):
            return np.random.randn(fan_in, fan_out) / np.sqrt(fan_in)

        self.p = {
            'W_patch': w(patch_dim, dim), 'b_patch': np.zeros(dim),
            'cls': np.random.randn(dim) * 0.02,
            'pos': np.random.randn(n_patches + 1, dim) * 0.02,
            'ln1_g': np.ones(dim), 'ln1_b': np.zeros(dim),
            'W_qkv': w(dim, 3 * dim), 'W_o': w(dim, dim),
            'ln2_g': np.ones(dim), 'ln2_b': np.zeros(dim),
            'W1': w(dim, mlp_dim), 'b1': np.zeros(mlp_dim),
            'W2': w(mlp_dim, dim), 'b2': np.zeros(dim),
            'lnf_g': np.ones(dim), 'lnf_b': np.zeros(dim),
            'W_head': w(dim, num_classes), 'b_head': np.zeros(num_classes),
        }

    def patchify(self, x):
        B, C, H, W = x.shape
        P = self.patch_size
        x = x.reshape(B, C, H // P, P, W // P, P)          # b c h p1 w p2
        x = x.transpose(0, 2, 4, 3, 5, 1)                  # b h w p1 p2 c
        return x.reshape(B, (H // P) * (W // P), P * P * C)

    def attention(self, h):
        B, T, D = h.shape
        nh = self.num_heads
        hd = D // nh
        q, k, v = np.split(h @ self.p['W_qkv'], 3, axis=-1)                  # (B, T, D) each
        q, k, v = (a.reshape(B, T, nh, hd).transpose(0, 2, 1, 3) for a in (q, k, v))
        att = softmax(q @ k.transpose(0, 1, 3, 2) / np.sqrt(hd))            # (B, nh, T, T)
        out = (att @ v).transpose(0, 2, 1, 3).reshape(B, T, D)
        return out @ self.p['W_o']

    def cls_features(self, x):
        p = self.p
        tokens = self.patchify(x) @ p['W_patch'] + p['b_patch']             # (B, N, D)
        cls = np.broadcast_to(p['cls'], (x.shape[0], 1, len(p['cls'])))
        t = np.concatenate([cls, tokens], axis=1)                            # (B, N+1, D)
        if self.use_pos_emb:
            t = t + p['pos']

        t = t + self.attention(layer_norm(t, p['ln1_g'], p['ln1_b']))
        h = layer_norm(t, p['ln2_g'], p['ln2_b'])
        t = t + gelu(h @ p['W1'] + p['b1']) @ p['W2'] + p['b2']
        return layer_norm(t[:, 0], p['lnf_g'], p['lnf_b'])

    def forward(self, x):
        return self.cls_features(x) @ self.p['W_head'] + self.p['b_head']

    def loss(self, x, y):
        probs = softmax(self.forward(x))
        return float(-np.mean(np.log(probs[np.arange(len(y)), y] + 1e-12)))

    def train_step(self, x, y, lr=0.1):
        feats = self.cls_features(x)                                         # encoder is frozen
        logits = feats @ self.p['W_head'] + self.p['b_head']
        probs = softmax(logits)
        B = len(y)
        loss = float(-np.mean(np.log(probs[np.arange(B), y] + 1e-12)))

        dlogits = probs.copy()
        dlogits[np.arange(B), y] -= 1
        dlogits /= B
        self.p['W_head'] -= lr * feats.T @ dlogits
        self.p['b_head'] -= lr * dlogits.sum(axis=0)
        return loss
`,
  },
  {
    id: 'transformer-bug-hunt',
    title: 'Transformer Bug Hunt: Fix a Broken Mini-GPT',
    section: 'e2e-implementations',
    difficulty: 'hard',
    description: `
## Transformer Bug Hunt: Fix a Broken Mini-GPT

### What you'll build
A working \`gpt_forward\` by debugging a broken one. Reading and fixing someone else's model code is a common interview format, and these four bugs are the classic silent ones: the code runs and the shapes are right, but the numbers are wrong.

### The setup
The starter code is a tiny GPT-style language model: token and position embeddings, one causal self-attention block, one MLP block, a final LayerNorm and an LM head. It runs without errors on short inputs, but its outputs are wrong.

**There are exactly 4 bugs, all inside \`gpt_forward\`.** The helpers \`init_params\`, \`layer_norm\`, \`softmax\` and \`gelu\` are correct. Find and fix the bugs; you shouldn't need to rewrite the model.

### Reference architecture (what the code should compute)
For token ids \`tokens\` of length \`T\` (positions \`t = 0 .. T-1\`), with \`d = d_model\`:
\`\`\`text
x   = wte[tokens] + wpe[t]                               # learned positions, t starts at 0

h   = LN1(x)
q, k, v = h @ W_q, h @ W_k, h @ W_v
S   = q @ k.T / sqrt(d)
S[i, j] = -inf  for j > i                                # causal mask, applied BEFORE the softmax
att = softmax(S)                                         # row-wise, each row sums to 1
x   = x + (att @ v) @ W_o                                # residual 1

x   = x + GELU(LN2(x) @ W_1 + b_1) @ W_2 + b_2           # residual 2 (pre-LN)

logits = LN_f(x) @ wte.T                                 # tied LM head
\`\`\`
\`LN(x) = g * (x - mean) / sqrt(var + 1e-5) + b\` over the last axis (population variance), and GELU uses the tanh approximation.

### Expected Return Format
\`gpt_forward(tokens, params)\` returns a tuple \`(logits, att)\`:
- \`logits\`: \`(T, vocab_size)\` array
- \`att\`: \`(T, T)\` attention probabilities, row \`i\` holds query \`i\`'s weights

### How it is tested
The tests check properties every correct decoder must have (causality, attention rows summing to 1), compare against an independent reference computation with the attention and MLP outputs switched off, and check exact logits and attention values for fixed \`init_params\` weights.

### Debugging tips
Write small experiments in the editor: inspect \`att\`, try a single token, zero out \`W_o\` or \`W_2\`, compare positions.

### Constraints
Edit only \`gpt_forward\`; keep the signature and the \`(logits, att)\` return.

### Follow-up
- Which of these bugs would still let training loss go down? (Most of them: that is why they are dangerous.)
- What unit tests would have caught each bug before training?
`,
    examples: [
      {
        input: 'logits, att = gpt_forward([3, 1, 4, 1, 5], init_params())',
        output: 'logits.shape == (5, 11), att.shape == (5, 5)',
        explanation: 'In the fixed model every row of att sums to 1 and att is lower-triangular.',
      },
      {
        input: 'gpt_forward([6], init_params(seed=3))[1]',
        output: 'array([[1.]])',
        explanation: 'A single token can only attend to itself.',
      },
    ],
    starterCode: `import numpy as np

def init_params(vocab_size=11, d_model=8, max_len=8, seed=0):
    """Deterministic random weights for a 1-layer, single-head model. (Correct.)"""
    rng = np.random.default_rng(seed)
    def w(*shape, scale=0.5):
        return rng.standard_normal(shape) * scale
    d = d_model
    return {
        'wte': w(vocab_size, d), 'wpe': w(max_len, d),
        'ln1_g': 1 + w(d, scale=0.1), 'ln1_b': w(d, scale=0.1),
        'W_q': w(d, d), 'W_k': w(d, d), 'W_v': w(d, d), 'W_o': w(d, d),
        'ln2_g': 1 + w(d, scale=0.1), 'ln2_b': w(d, scale=0.1),
        'W_1': w(d, 4 * d), 'b_1': w(4 * d, scale=0.1),
        'W_2': w(4 * d, d), 'b_2': w(d, scale=0.1),
        'lnf_g': 1 + w(d, scale=0.1), 'lnf_b': w(d, scale=0.1),
    }

def layer_norm(x, g, b, eps=1e-5):
    """(Correct.)"""
    mu = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return g * (x - mu) / np.sqrt(var + eps) + b

def softmax(x):
    """Row-wise softmax over the last axis. (Correct.)"""
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def gelu(x):
    """GELU, tanh approximation. (Correct.)"""
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))

def gpt_forward(tokens, params):
    """
    Forward pass of a 1-layer, single-head, pre-LayerNorm GPT.

    Args:
        tokens: List of T token ids (T <= max_len)
        params: Dict from init_params

    Returns:
        logits: (T, vocab_size)
        att: (T, T) attention probabilities (row i = how query i attends)
    """
    p = params
    tokens = np.asarray(tokens)
    T = len(tokens)
    d = p['wte'].shape[1]

    # Token + position embeddings
    x = p['wte'][tokens] + p['wpe'][1:T + 1]

    # Causal self-attention block
    h = layer_norm(x, p['ln1_g'], p['ln1_b'])
    q, k, v = h @ p['W_q'], h @ p['W_k'], h @ p['W_v']
    scores = q @ k.T
    att = softmax(scores)
    mask = np.tril(np.ones((T, T)))
    att = att * mask
    x = x + (att @ v) @ p['W_o']

    # MLP block
    h = layer_norm(x, p['ln2_g'], p['ln2_b'])
    x = h + gelu(h @ p['W_1'] + p['b_1']) @ p['W_2'] + p['b_2']

    # Final LayerNorm and tied LM head
    x = layer_norm(x, p['lnf_g'], p['lnf_b'])
    logits = x @ p['wte'].T
    return logits, att
`,
    testCases: [
      {
        id: '1',
        description: 'Attention rows sum to 1',
        input: '(lambda: (att := gpt_forward([3, 1, 4, 1, 5], init_params())[1], bool(np.allclose(att.sum(axis=-1), 1.0)))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Causal: future tokens do not change earlier logits',
        input: '(lambda: (p := init_params(), a := gpt_forward([3, 1, 4, 1, 5], p)[0], b := gpt_forward([3, 1, 4, 9, 2], p)[0], bool(np.allclose(a[:3], b[:3]) and not np.allclose(a[3:], b[3:])))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Logits at the last position',
        input: 'np.round(gpt_forward([3, 1, 4, 1, 5], init_params())[0][-1], 4).tolist()',
        expected: '[0.9804, 1.7947, 1.4926, -0.8742, 0.5473, 0.9547, -1.353, -0.5766, -1.0425, 0.0565, 0.4188]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Attention matrix values',
        input: 'np.round(gpt_forward([3, 1, 4, 1, 5], init_params())[1], 4).tolist()',
        expected: '[[1.0, 0.0, 0.0, 0.0, 0.0], [0.9902, 0.0098, 0.0, 0.0, 0.0], [0.9094, 0.0496, 0.041, 0.0, 0.0], [0.1944, 0.1077, 0.683, 0.0149, 0.0], [0.0085, 0.2214, 0.4181, 0.3425, 0.0095]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Blocks switched off: logits = LN_f(wte[tok] + wpe[pos]) @ wte.T',
        input: `(lambda: (
    p := init_params(seed=1),
    p.update(W_o=np.zeros((8, 8)), W_2=np.zeros((32, 8)), b_2=np.zeros(8)),
    x := p['wte'][[2, 7, 7]] + p['wpe'][:3],
    ref := ((x - x.mean(-1, keepdims=True)) / np.sqrt(x.var(-1, keepdims=True) + 1e-5) * p['lnf_g'] + p['lnf_b']) @ p['wte'].T,
    bool(np.allclose(gpt_forward([2, 7, 7], p)[0], ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Single token: attention is [[1.0]]',
        input: '(lambda: (r := gpt_forward([6], init_params(seed=3)), (r[1].tolist(), np.round(r[0][0], 4).tolist()))[-1])()',
        expected: '([[1.0]], [0.4063, 0.193, 0.5711, -0.4405, -0.7826, 0.9105, 1.9319, -2.5145, -3.4605, 2.9529, 0.3863])',
        hidden: true,
      },
      {
        id: '7',
        description: 'Full-length sequence (T = max_len), another seed',
        input: '(lambda: (r := gpt_forward([0, 10, 5, 5, 2, 8, 1, 9], init_params(seed=2)), [round(float(r[0][t].sum()), 4) for t in range(8)])[-1])()',
        expected: '[12.4282, 10.718, -0.1298, 8.7555, -4.6297, 7.4221, 5.3064, 8.6238]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Logits for every position',
        input: 'np.round(gpt_forward([10, 9, 8, 7], init_params(seed=4))[0], 3).tolist()',
        expected: '[[-1.969, 1.632, -0.206, -1.279, 0.272, 0.039, -0.283, 1.057, -0.17, 0.604, 0.178], [-2.429, -0.206, -0.147, 1.808, -0.819, 1.405, 1.213, -0.222, -0.38, -1.632, -3.174], [-2.019, 0.926, -0.257, -1.104, 0.154, 0.941, 0.565, 0.681, 0.462, 1.348, -0.084], [-3.442, -0.246, 0.035, 0.732, 0.437, 0.005, -0.368, 1.483, 1.503, -1.133, -1.956]]',
        hidden: true,
      },
    ],
    hints: [
      'Check the shape-preserving steps against the reference line by line: embeddings, scores, masking, softmax, residuals.',
      'Print `att.sum(axis=-1)` for the starter: a correct softmax gives all ones. What does masking after the softmax do to that?',
      'Positions start at 0. Which rows of `wpe` does a length-T sequence use?',
      'In a pre-LN block the residual stream carries `x`; LayerNorm is applied only to the sublayer input.',
    ],
    solution: `import numpy as np

def init_params(vocab_size=11, d_model=8, max_len=8, seed=0):
    """Deterministic random weights for a 1-layer, single-head model. (Correct.)"""
    rng = np.random.default_rng(seed)
    def w(*shape, scale=0.5):
        return rng.standard_normal(shape) * scale
    d = d_model
    return {
        'wte': w(vocab_size, d), 'wpe': w(max_len, d),
        'ln1_g': 1 + w(d, scale=0.1), 'ln1_b': w(d, scale=0.1),
        'W_q': w(d, d), 'W_k': w(d, d), 'W_v': w(d, d), 'W_o': w(d, d),
        'ln2_g': 1 + w(d, scale=0.1), 'ln2_b': w(d, scale=0.1),
        'W_1': w(d, 4 * d), 'b_1': w(4 * d, scale=0.1),
        'W_2': w(4 * d, d), 'b_2': w(d, scale=0.1),
        'lnf_g': 1 + w(d, scale=0.1), 'lnf_b': w(d, scale=0.1),
    }

def layer_norm(x, g, b, eps=1e-5):
    """(Correct.)"""
    mu = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return g * (x - mu) / np.sqrt(var + eps) + b

def softmax(x):
    """Row-wise softmax over the last axis. (Correct.)"""
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def gelu(x):
    """GELU, tanh approximation. (Correct.)"""
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))

def gpt_forward(tokens, params):
    p = params
    tokens = np.asarray(tokens)
    T = len(tokens)
    d = p['wte'].shape[1]

    # Token + position embeddings: position t uses wpe[t], starting at 0
    # (bug 1 was wpe[1:T + 1])
    x = p['wte'][tokens] + p['wpe'][:T]

    # Causal self-attention block
    h = layer_norm(x, p['ln1_g'], p['ln1_b'])
    q, k, v = h @ p['W_q'], h @ p['W_k'], h @ p['W_v']
    # Scale by 1/sqrt(d) (bug 2: the scaling was missing)
    scores = q @ k.T / np.sqrt(d)
    # Mask the future with -inf BEFORE the softmax (bug 3: the mask zeroed
    # probabilities after the softmax, so rows no longer summed to 1)
    mask = np.tril(np.ones((T, T), dtype=bool))
    scores = np.where(mask, scores, -np.inf)
    att = softmax(scores)
    x = x + (att @ v) @ p['W_o']

    # MLP block: the residual adds to the block input x, not to LN(x)
    # (bug 4 was x = h + ...)
    h = layer_norm(x, p['ln2_g'], p['ln2_b'])
    x = x + gelu(h @ p['W_1'] + p['b_1']) @ p['W_2'] + p['b_2']

    # Final LayerNorm and tied LM head
    x = layer_norm(x, p['lnf_g'], p['lnf_b'])
    logits = x @ p['wte'].T
    return logits, att
`,
  },
];
