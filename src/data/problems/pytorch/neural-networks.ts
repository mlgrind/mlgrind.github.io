import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../neural-networks.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const neuralNetworksPyTorch: Record<string, LanguageVariant> = {
  'mlp-forward-backward': {
    note: "Write the forward pass with tensor ops and derive the backward pass by hand. Don't call loss.backward() inside mlp_backward. A hidden test checks your gradients against autograd.",
    starterCode: `import torch

def relu(x):
    return torch.clamp(x, min=0)

def softmax(x):
    exp_x = torch.exp(x - x.max(dim=1, keepdim=True)[0])
    return exp_x / exp_x.sum(dim=1, keepdim=True)

def mlp_forward(X, W1, b1, W2, b2):
    """
    Forward pass for a 2-layer MLP.

    Args:
        X: Input data (batch_size, n_features)
        W1: First layer weights (n_features, n_hidden)
        b1: First layer bias (n_hidden,)
        W2: Second layer weights (n_hidden, n_classes)
        b2: Second layer bias (n_classes,)

    Returns:
        output: Class probabilities (batch_size, n_classes)
        cache: Tuple (X, Z1, A1, Z2, W1, W2) for backprop
    """
    # Your code here
    pass

def mlp_backward(Y, output, cache):
    """
    Backward pass (backpropagation) for 2-layer MLP, derived by hand.

    Args:
        Y: One-hot encoded labels (batch_size, n_classes)
        output: Predicted probabilities from forward pass
        cache: Cached values from forward pass (X, Z1, A1, Z2, W1, W2)

    Returns:
        grads: Dictionary with dW1, db1, dW2, db2
    """
    X, Z1, A1, Z2, W1, W2 = cache
    m = X.shape[0]  # batch size

    # Your code here
    pass
`,
    solution: `import torch

def relu(x):
    return torch.clamp(x, min=0)

def softmax(x):
    exp_x = torch.exp(x - x.max(dim=1, keepdim=True)[0])
    return exp_x / exp_x.sum(dim=1, keepdim=True)

def mlp_forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1
    A1 = relu(Z1)
    Z2 = A1 @ W2 + b2
    output = softmax(Z2)
    cache = (X, Z1, A1, Z2, W1, W2)
    return output, cache

def mlp_backward(Y, output, cache):
    X, Z1, A1, Z2, W1, W2 = cache
    m = X.shape[0]

    # Softmax + cross-entropy: dL/dZ2 = output - Y
    dZ2 = output - Y
    dW2 = A1.T @ dZ2 / m
    db2 = dZ2.sum(dim=0) / m

    # Through W2 and the ReLU
    dA1 = dZ2 @ W2.T
    dZ1 = dA1 * (Z1 > 0).float()
    dW1 = X.T @ dZ1 / m
    db1 = dZ1.sum(dim=0) / m

    return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}
`,
    testCases: [
      {
        id: '1',
        description: 'Forward: output shape correct',
        input: 'mlp_forward(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), torch.ones(3, 4), torch.zeros(4), torch.ones(4, 2), torch.zeros(2))[0].shape',
        expected: '(2, 2)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Forward: identity weights give softmax of the input',
        input: 'bool(torch.allclose(mlp_forward(torch.tensor([[1.0, 0.0], [0.0, 1.0]]), torch.eye(2), torch.zeros(2), torch.eye(2), torch.zeros(2))[0], torch.tensor([[0.7311, 0.2689], [0.2689, 0.7311]]), atol=1e-4))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Backward: all gradient keys present with the right shapes',
        input: `(lambda: (
            X := torch.tensor([[1.0, 2.0], [3.0, 4.0]]),
            W1 := torch.tensor([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
            W2 := torch.tensor([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            result := mlp_forward(X, W1, torch.zeros(3), W2, torch.zeros(2)),
            grads := mlp_backward(torch.tensor([[1.0, 0.0], [0.0, 1.0]]), result[0], result[1]),
            (sorted(grads.keys()), tuple(grads['dW1'].shape), tuple(grads['dW2'].shape))
        )[-1])()`,
        expected: "(['dW1', 'dW2', 'db1', 'db2'], (2, 3), (3, 2))",
        hidden: false,
      },
      {
        id: '4',
        description: 'Backward: dW2 matches a hand-computed value',
        input: `(lambda: (
            X := torch.tensor([[1.0, 2.0]]),
            W1 := torch.tensor([[1.0, 0.0], [0.0, 1.0]]),
            W2 := torch.tensor([[0.0, 0.0], [0.0, 0.0]]),
            result := mlp_forward(X, W1, torch.zeros(2), W2, torch.zeros(2)),
            grads := mlp_backward(torch.tensor([[1.0, 0.0]]), result[0], result[1]),
            bool(torch.allclose(grads['dW2'], torch.tensor([[-0.5, 0.5], [-1.0, 1.0]]), atol=1e-6))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Backward: manual gradients match autograd',
        input: `(lambda: (
            X := torch.tensor([[1.0, 2.0], [3.0, -4.0], [0.5, 0.5]]),
            W1 := torch.tensor([[0.1, -0.2, 0.3], [0.4, 0.5, -0.6]], requires_grad=True),
            b1 := torch.tensor([0.1, 0.0, -0.1], requires_grad=True),
            W2 := torch.tensor([[0.1, 0.2], [-0.3, 0.4], [0.5, -0.6]], requires_grad=True),
            b2 := torch.tensor([0.05, -0.05], requires_grad=True),
            Y := torch.tensor([[1.0, 0.0], [0.0, 1.0], [0.0, 1.0]]),
            result := mlp_forward(X, W1, b1, W2, b2),
            grads := mlp_backward(Y, result[0], result[1]),
            loss := -(Y * torch.log(result[0])).sum() / 3,
            loss.backward(),
            bool(torch.allclose(grads['dW1'], W1.grad, atol=1e-5) and torch.allclose(grads['db1'], b1.grad, atol=1e-5)
                 and torch.allclose(grads['dW2'], W2.grad, atol=1e-5) and torch.allclose(grads['db2'], b2.grad, atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Forward: Z1 = X @ W1 + b1, A1 = relu(Z1), Z2 = A1 @ W2 + b2, output = softmax(Z2)',
      'Backward: dZ2 = output - Y; dW2 = A1.T @ dZ2 / m; db2 = dZ2.sum(dim=0) / m',
      'ReLU derivative as a float mask: (Z1 > 0).float()',
      'You can check your result yourself: build the loss from output, call loss.backward(), and compare with W1.grad',
    ],
  },
  'cross-entropy-loss': {
    note: "Implement with tensor ops (torch.log, sum). Don't use F.cross_entropy, F.nll_loss or nn.CrossEntropyLoss.",
    starterCode: `import torch

def cross_entropy_loss(Y_pred, Y_true):
    """
    Compute cross-entropy loss.

    Args:
        Y_pred: Predicted probabilities, tensor (batch_size, n_classes)
        Y_true: One-hot encoded true labels, tensor (batch_size, n_classes)

    Returns:
        loss: Scalar cross-entropy loss as a Python float (rounded to 4 decimals)
    """
    # Your code here
    pass
`,
    solution: `import torch

def cross_entropy_loss(Y_pred, Y_true):
    m = Y_pred.shape[0]
    epsilon = 1e-15
    log_probs = torch.log(Y_pred + epsilon)
    loss = -(Y_true * log_probs).sum() / m
    return round(loss.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect prediction',
        input: 'abs(cross_entropy_loss(torch.tensor([[1.0, 0.0], [0.0, 1.0]]), torch.tensor([[1.0, 0.0], [0.0, 1.0]])))',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Typical case',
        input: 'cross_entropy_loss(torch.tensor([[0.7, 0.3], [0.2, 0.8]]), torch.tensor([[1.0, 0.0], [0.0, 1.0]]))',
        expected: '0.2899',
        hidden: false,
      },
      {
        id: '3',
        description: 'Three classes',
        input: 'cross_entropy_loss(torch.tensor([[0.5, 0.3, 0.2], [0.1, 0.1, 0.8]]), torch.tensor([[1.0, 0.0, 0.0], [0.0, 0.0, 1.0]]))',
        expected: '0.4581',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches the negative log-likelihood of random probabilities',
        input: `(lambda: (
            p := torch.softmax(torch.randn(6, 4), dim=1),
            labels := torch.tensor([0, 3, 1, 2, 2, 0]),
            ref := -torch.log(p[torch.arange(6), labels]).mean().item(),
            bool(abs(cross_entropy_loss(p, torch.nn.functional.one_hot(labels, 4).float()) - ref) < 1e-3)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'torch.log(Y_pred + 1e-15) avoids log(0)',
      'Multiply element-wise by Y_true, sum, negate and divide by the batch size',
      'Return a Python float: round(loss.item(), 4)',
    ],
  },
  'weight-init': {
    note: "Scale torch.randn yourself. Don't use nn.init.xavier_normal_ or nn.init.kaiming_normal_ (and note that torch reads fan_in from dim 1 of a weight).",
    starterCode: `import torch

def initialize_weights(n_in, n_out, method='xavier'):
    """
    Initialize weights using Xavier or He initialization.

    Args:
        n_in: Number of input units
        n_out: Number of output units
        method: 'xavier' or 'he'

    Returns:
        std: Standard deviation of initialized weights as a Python float (rounded to 4 decimals)
    """
    torch.manual_seed(42)  # For reproducibility
    # Your code here
    pass
`,
    solution: `import math
import torch

def initialize_weights(n_in, n_out, method='xavier'):
    torch.manual_seed(42)

    if method == 'xavier':
        std = math.sqrt(2.0 / (n_in + n_out))
    elif method == 'he':
        std = math.sqrt(2.0 / n_in)
    else:
        raise ValueError("Method must be 'xavier' or 'he'")

    W = torch.randn(n_in, n_out) * std
    return round(W.std().item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Xavier std close to sqrt(2 / (n_in + n_out)) = 0.1155',
        input: 'bool(abs(initialize_weights(100, 50, "xavier") - 0.1155) < 0.005)',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'He std close to sqrt(2 / n_in) = 0.1414',
        input: 'bool(abs(initialize_weights(100, 50, "he") - 0.1414) < 0.005)',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'He on a large layer: std close to sqrt(2 / 1000) = 0.0447',
        input: 'bool(abs(initialize_weights(1000, 500, "he") - 0.0447) < 0.0005)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Xavier on a large layer: std close to sqrt(2 / 1500) = 0.0365',
        input: 'bool(abs(initialize_weights(1000, 500, "xavier") - 0.0365) < 0.0005)',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'torch.randn(n_in, n_out) samples from N(0, 1)',
      'Xavier: multiply by sqrt(2 / (n_in + n_out)); He: multiply by sqrt(2 / n_in)',
      'Return W.std().item() rounded to 4 decimals',
    ],
  },
  'batch-norm': {
    note: "Implement with tensor ops (mean, var(unbiased=False)). Don't use F.batch_norm or nn.BatchNorm1d.",
    starterCode: `import torch

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    """
    Batch normalization forward pass.

    Args:
        X: Input tensor (batch_size, features)
        gamma: Scale parameter (features,)
        beta: Shift parameter (features,)
        eps: Small constant for numerical stability

    Returns:
        out: Normalized output (batch_size, features)
        cache: Tuple (X, X_norm, mu, var, gamma, eps) for backward pass
    """
    # Your code here
    pass
`,
    solution: `import torch

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    # Batch statistics (biased variance, like BatchNorm in training mode)
    mu = X.mean(dim=0)
    var = X.var(dim=0, unbiased=False)

    X_norm = (X - mu) / torch.sqrt(var + eps)
    out = gamma * X_norm + beta

    cache = (X, X_norm, mu, var, gamma, eps)
    return out, cache
`,
    testCases: [
      {
        id: '1',
        description: 'Output mean near zero',
        input: 'bool(torch.allclose(batch_norm_forward(torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), torch.ones(2), torch.zeros(2))[0].mean(dim=0), torch.zeros(2), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Cache holds the batch mean and (biased) variance',
        input: `(lambda: (
            cache := batch_norm_forward(torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), torch.ones(2), torch.zeros(2))[1],
            bool(torch.allclose(cache[2], torch.tensor([3.0, 4.0])) and torch.allclose(cache[3], torch.tensor([8.0 / 3, 8.0 / 3])))
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gamma scales output',
        input: 'list(round(v, 1) for v in batch_norm_forward(torch.tensor([[0.0, 0.0], [2.0, 2.0]]), torch.tensor([2.0, 3.0]), torch.zeros(2))[0][1].tolist())',
        expected: '[2.0, 3.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches F.batch_norm (training mode) on random data',
        input: `(lambda: (
            X := torch.randn(8, 5) * 3 + 1,
            g := torch.rand(5) + 0.5,
            b := torch.randn(5),
            bool(torch.allclose(batch_norm_forward(X, g, b)[0], torch.nn.functional.batch_norm(X, None, None, g, b, training=True, eps=1e-5), atol=1e-4))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Use X.mean(dim=0) and X.var(dim=0, unbiased=False): BatchNorm uses the biased variance',
      'Normalize: (X - mu) / torch.sqrt(var + eps)',
      'Scale and shift: gamma * X_norm + beta',
    ],
  },
  'dropout': {
    note: "Build the mask yourself with torch.rand_like; don't call F.dropout or nn.Dropout, which don't return the mask.",
    starterCode: `import torch

def dropout_forward(X: torch.Tensor, keep_prob: float = 0.5, training: bool = True):
    """
    Apply dropout to input.

    Args:
        X: Input tensor
        keep_prob: Probability of keeping a neuron
        training: Whether in training mode

    Returns:
        out: Output after dropout
        mask: Dropout mask (for backward pass), None in inference
    """
    # Your code here
    pass
`,
    solution: `import torch

def dropout_forward(X: torch.Tensor, keep_prob: float = 0.5, training: bool = True):
    if not training:
        return X, None

    # Inverted dropout: keep with probability keep_prob, scale by 1/keep_prob
    mask = (torch.rand_like(X) < keep_prob).float() / keep_prob
    out = X * mask

    return out, mask
`,
    testCases: [
      {
        id: '1',
        description: 'Inference returns the input unchanged',
        input: 'dropout_forward(torch.tensor([[1.0, 2.0, 3.0, 4.0]]), 0.5, False)[0].tolist()',
        expected: '[[1.0, 2.0, 3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Output shape preserved in training',
        input: 'tuple(dropout_forward(torch.randn(4, 8), 0.5, True)[0].shape)',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '3',
        description: 'out equals X * mask, and mask entries are 0 or 1/keep_prob',
        input: `(lambda: (
    X := torch.randn(6, 5),
    r := dropout_forward(X, 0.7, True),
    m := r[1],
    bool(torch.allclose(r[0], X * m)),
    bool(torch.logical_or(m == 0, torch.isclose(m, torch.full_like(m, 1 / 0.7))).all()),
)[-2:])()`,
        expected: '(True, True)',
        hidden: true,
      },
      {
        id: '4',
        description: 'About keep_prob of the units survive',
        input: '(lambda: (m := dropout_forward(torch.ones(100, 100), 0.7, True)[1], abs((m > 0).float().mean().item() - 0.7) < 0.02)[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Expected value preserved',
        input: '(lambda: (out := dropout_forward(torch.ones(1000, 100), 0.8, True)[0], abs(out.mean().item() - 1.0) < 0.02)[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'No mask in inference',
        input: 'dropout_forward(torch.ones(3, 3), 0.5, False)[1] is None',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'In training: mask = (torch.rand_like(X) < keep_prob).float()',
      'Scale the mask by 1 / keep_prob (inverted dropout), then out = X * mask',
      'In inference: return X, None',
    ],
  },
  'masked-label-smoothing-ce': {
    note: "Implement it with tensor ops (torch.logsumexp is fine); don't call F.cross_entropy, nn.CrossEntropyLoss or F.nll_loss. The hidden tests compare against F.cross_entropy(..., ignore_index=..., label_smoothing=...).",
    starterCode: `import torch

def masked_label_smoothing_ce(logits, targets, ignore_index=-100, smoothing=0.0):
    """
    Token-level cross-entropy with label smoothing and a padding mask.

    Args:
        logits: Unnormalized scores, float tensor (N, V) or (B, T, V)
        targets: Class ids, int64 tensor (N,) or (B, T); ignore_index marks padding
        ignore_index: Target value whose tokens are excluded from the loss
        smoothing: Label smoothing eps in [0, 1]

    Returns:
        Mean loss over non-ignored tokens (float); nan if every token is ignored
    """
    # Your code here
    pass
`,
    solution: `import torch

def masked_label_smoothing_ce(logits, targets, ignore_index=-100, smoothing=0.0):
    V = logits.shape[-1]
    logits = logits.reshape(-1, V)
    targets = targets.reshape(-1)

    keep = targets != ignore_index
    if not keep.any():
        return float('nan')
    z, y = logits[keep], targets[keep]

    log_p = z - torch.logsumexp(z, dim=-1, keepdim=True)    # stable log-softmax
    nll = -log_p[torch.arange(len(y)), y]                   # -log p_y
    uniform = -log_p.mean(dim=-1)                           # mean_c -log p_c
    loss = (1 - smoothing) * nll + smoothing * uniform
    return loss.mean().item()
`,
    testCases: [
      {
        id: '1',
        description: 'No smoothing, one token',
        input: 'round(masked_label_smoothing_ce(torch.tensor([[2.0, 1.0, 0.1]]), torch.tensor([0])), 4)',
        expected: '0.417',
        hidden: false,
      },
      {
        id: '2',
        description: 'Padding token is ignored',
        input: 'round(masked_label_smoothing_ce(torch.tensor([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0], [1.0, 1.0, 1.0], [-2.0, 0.0, 3.0]]), torch.tensor([0, 1, -100, 2])), 4)',
        expected: '0.2084',
        hidden: false,
      },
      {
        id: '3',
        description: 'Smoothing 0.1 with padding',
        input: 'round(masked_label_smoothing_ce(torch.tensor([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0], [1.0, 1.0, 1.0], [-2.0, 0.0, 3.0]]), torch.tensor([0, 1, -100, 2]), smoothing=0.1), 4)',
        expected: '0.3906',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches F.cross_entropy on (B, T, V) with padding',
        input: `(lambda: (
    L := torch.from_numpy(np.random.randn(3, 5, 7) * 2).float(),
    T := torch.from_numpy(np.random.randint(0, 7, size=(3, 5))),
    T := torch.where(torch.from_numpy(np.random.rand(3, 5) < 0.3), torch.full((3, 5), -100), T),
    ours := masked_label_smoothing_ce(L, T, smoothing=0.1),
    ref := torch.nn.functional.cross_entropy(L.reshape(-1, 7), T.reshape(-1), ignore_index=-100, label_smoothing=0.1).item(),
    bool(abs(ours - ref) < 1e-5)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Matches F.cross_entropy with pad id 0',
        input: `(lambda: (
    L := torch.from_numpy(np.random.randn(6, 4) * 3).float(),
    T := torch.tensor([0, 3, 0, 1, 2, 0]),
    ours := masked_label_smoothing_ce(L, T, ignore_index=0, smoothing=0.25),
    ref := torch.nn.functional.cross_entropy(L, T, ignore_index=0, label_smoothing=0.25).item(),
    bool(abs(ours - ref) < 1e-5)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Every token ignored gives nan',
        input: 'bool(np.isnan(masked_label_smoothing_ce(torch.from_numpy(np.random.randn(3, 4)).float(), torch.tensor([-100, -100, -100]))))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Large logits stay finite',
        input: 'round(masked_label_smoothing_ce(torch.tensor([[1000.0, 0.0, -1000.0], [0.0, 500.0, 0.0]]), torch.tensor([0, 2]), smoothing=0.1), 4)',
        expected: '291.6667',
        hidden: true,
      },
    ],
  },
};
