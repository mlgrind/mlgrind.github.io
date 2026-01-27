import { Problem } from '../../types';

export const neuralNetworkProblems: Problem[] = [
  {
    id: 'mlp-forward-backward',
    title: 'MLP Forward & Backward Pass',
    section: 'neural-networks',
    difficulty: 'hard',
    description: `
## MLP Forward & Backward Pass

Implement both forward and backward passes for a 2-layer MLP (Multi-Layer Perceptron).

### Architecture
\`\`\`
Input (n_features) → Hidden (n_hidden) → Output (n_classes)
\`\`\`

### Forward Pass
\`\`\`
Z1 = X @ W1 + b1
A1 = ReLU(Z1)
Z2 = A1 @ W2 + b2
output = softmax(Z2)
\`\`\`

Return: \`(output, cache)\` where cache = \`(X, Z1, A1, Z2, W1, W2)\`

### Backward Pass (Backpropagation)
Using the chain rule, gradients flow backwards:

\`\`\`
Loss → dZ2 → dW2, db2 → dA1 → dZ1 (ReLU) → dW1, db1
\`\`\`

**Key Formulas:**
- \`dZ2 = output - Y_onehot\` (softmax + cross-entropy derivative)
- \`dW2 = (1/m) * A1.T @ dZ2\`
- \`db2 = (1/m) * sum(dZ2, axis=0)\`
- \`dZ1 = (dZ2 @ W2.T) * (Z1 > 0)\` (ReLU derivative)
- \`dW1 = (1/m) * X.T @ dZ1\`
- \`db1 = (1/m) * sum(dZ1, axis=0)\`

Return: \`{'dW1': ..., 'db1': ..., 'dW2': ..., 'db2': ...}\`
    `,
    examples: [
      {
        input: 'X shape (2, 3), hidden_size=4, output_size=2',
        output: 'Forward: probabilities (2, 2), rows sum to 1. Backward: gradients for all weights/biases',
        explanation: 'Forward computes predictions; backward computes gradients for training',
      },
    ],
    starterCode: `import numpy as np

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True)

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
    Backward pass (backpropagation) for 2-layer MLP.

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
    testCases: [
      {
        id: '1',
        description: 'Forward: output shape correct',
        input: 'mlp_forward(np.array([[1, 2, 3], [4, 5, 6]]), np.ones((3, 4)), np.zeros(4), np.ones((4, 2)), np.zeros(2))[0].shape',
        expected: '(2, 2)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Forward: probabilities sum to 1',
        input: 'round(float(np.sum(mlp_forward(np.array([[1, 0], [0, 1]]), np.array([[1, 0], [0, 1]]), np.zeros(2), np.array([[1, 0], [0, 1]]), np.zeros(2))[0][0])), 1)',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Backward: dW2 shape matches W2',
        input: `(lambda: (
            X := np.array([[1.0, 2.0], [3.0, 4.0]]),
            W1 := np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
            b1 := np.zeros(3),
            W2 := np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            b2 := np.zeros(2),
            result := mlp_forward(X, W1, b1, W2, b2),
            output := result[0],
            cache := result[1],
            Y := np.array([[1, 0], [0, 1]]),
            grads := mlp_backward(Y, output, cache),
            grads['dW2'].shape == W2.shape
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Backward: gradients are non-zero',
        input: `(lambda: (
            X := np.array([[1.0, 2.0], [3.0, 4.0]]),
            W1 := np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
            b1 := np.zeros(3),
            W2 := np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            b2 := np.zeros(2),
            result := mlp_forward(X, W1, b1, W2, b2),
            output := result[0],
            cache := result[1],
            Y := np.array([[1, 0], [0, 1]]),
            grads := mlp_backward(Y, output, cache),
            bool(np.any(grads['dW1'] != 0) and np.any(grads['dW2'] != 0))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Backward: all gradient keys present',
        input: `(lambda: (
            X := np.array([[1.0, 2.0]]),
            W1 := np.array([[0.1, 0.2], [0.3, 0.4]]),
            b1 := np.zeros(2),
            W2 := np.array([[0.1], [0.2]]),
            b2 := np.zeros(1),
            result := mlp_forward(X, W1, b1, W2, b2),
            grads := mlp_backward(np.array([[1]]), result[0], result[1]),
            sorted(grads.keys())
        )[-1])()`,
        expected: '["dW1", "dW2", "db1", "db2"]',
        hidden: true,
      },
    ],
    hints: [
      'Forward: Compute Z1 = X @ W1 + b1, then A1 = ReLU(Z1)',
      'Forward: Compute Z2 = A1 @ W2 + b2, then output = softmax(Z2)',
      'Forward: Store cache = (X, Z1, A1, Z2, W1, W2) for backprop',
      'Backward: Start from output layer: dZ2 = output - Y',
      'Backward: dW2 = (1/m) * A1.T @ dZ2, db2 = (1/m) * sum(dZ2, axis=0)',
      'Backward: Propagate through ReLU: dZ1 = (dZ2 @ W2.T) * (Z1 > 0)',
      'Backward: dW1 = (1/m) * X.T @ dZ1, db1 = (1/m) * sum(dZ1, axis=0)',
    ],
    solution: `import numpy as np

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True)

def mlp_forward(X, W1, b1, W2, b2):
    # First layer
    Z1 = X @ W1 + b1
    A1 = relu(Z1)

    # Second layer
    Z2 = A1 @ W2 + b2
    output = softmax(Z2)

    # Cache for backprop
    cache = (X, Z1, A1, Z2, W1, W2)

    return output, cache

def mlp_backward(Y, output, cache):
    X, Z1, A1, Z2, W1, W2 = cache
    m = X.shape[0]

    # Output layer gradient (softmax + cross-entropy)
    dZ2 = output - Y
    dW2 = (1/m) * A1.T @ dZ2
    db2 = (1/m) * np.sum(dZ2, axis=0)

    # Hidden layer gradient
    dA1 = dZ2 @ W2.T
    dZ1 = dA1 * (Z1 > 0)  # ReLU derivative
    dW1 = (1/m) * X.T @ dZ1
    db1 = (1/m) * np.sum(dZ1, axis=0)

    return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}
`,
  },
  {
    id: 'cross-entropy-loss',
    title: 'Cross-Entropy Loss',
    section: 'neural-networks',
    difficulty: 'easy',
    description: `
## Cross-Entropy Loss

Implement the cross-entropy loss function for multi-class classification.

### Formula
\`\`\`
L = -1/m * sum(Y * log(Y_pred))
\`\`\`

Where:
- Y is one-hot encoded true labels
- Y_pred is predicted probabilities
- m is batch size

### Numerical Stability
Add small epsilon to avoid log(0):
\`\`\`python
np.log(Y_pred + 1e-15)
\`\`\`
    `,
    examples: [
      {
        input: 'Y_pred = [[0.7, 0.2, 0.1], [0.1, 0.8, 0.1]], Y = [[1,0,0], [0,1,0]]',
        output: '0.2231',
        explanation: '-1/2 * (log(0.7) + log(0.8))',
      },
    ],
    starterCode: `import numpy as np

def cross_entropy_loss(Y_pred, Y_true):
    """
    Compute cross-entropy loss.

    Args:
        Y_pred: Predicted probabilities (batch_size, n_classes)
        Y_true: One-hot encoded true labels (batch_size, n_classes)

    Returns:
        loss: Scalar cross-entropy loss
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect prediction',
        input: 'abs(cross_entropy_loss(np.array([[1.0, 0.0], [0.0, 1.0]]), np.array([[1, 0], [0, 1]])))',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Typical case',
        input: 'cross_entropy_loss(np.array([[0.7, 0.3], [0.2, 0.8]]), np.array([[1, 0], [0, 1]]))',
        expected: '0.2899',
        hidden: false,
      },
    ],
    hints: [
      'Use np.log with a small epsilon for numerical stability',
      'Multiply element-wise: Y_true * np.log(Y_pred)',
      'Sum and negate, then divide by batch size',
    ],
    solution: `import numpy as np

def cross_entropy_loss(Y_pred, Y_true):
    m = Y_pred.shape[0]
    epsilon = 1e-15
    log_probs = np.log(Y_pred + epsilon)
    loss = -np.sum(Y_true * log_probs) / m
    return round(loss, 4)
`,
  },
  {
    id: 'weight-init',
    title: 'Xavier/He Weight Initialization',
    section: 'neural-networks',
    difficulty: 'medium',
    description: `
## Weight Initialization

Implement Xavier and He weight initialization to prevent vanishing/exploding gradients.

### Xavier Initialization (for tanh/sigmoid)
\`\`\`
W = randn(n_in, n_out) * sqrt(2 / (n_in + n_out))
\`\`\`

### He Initialization (for ReLU)
\`\`\`
W = randn(n_in, n_out) * sqrt(2 / n_in)
\`\`\`

### Why It Matters
- Keeps variance of activations stable across layers
- Prevents gradients from vanishing or exploding
- Enables training of deep networks
    `,
    examples: [
      {
        input: 'n_in=784, n_out=256, method="he"',
        output: 'Weights with std ≈ 0.0505',
        explanation: 'sqrt(2/784) ≈ 0.0505',
      },
    ],
    starterCode: `import numpy as np

def initialize_weights(n_in, n_out, method='xavier'):
    """
    Initialize weights using Xavier or He initialization.

    Args:
        n_in: Number of input units
        n_out: Number of output units
        method: 'xavier' or 'he'

    Returns:
        std: Standard deviation of initialized weights (rounded to 4 decimals)
    """
    np.random.seed(42)  # For reproducibility
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Xavier std correct',
        input: '(100, 50, "xavier")',
        expected: '0.1151',
        hidden: false,
      },
      {
        id: '2',
        description: 'He std correct',
        input: '(100, 50, "he")',
        expected: '0.1409',
        hidden: false,
      },
    ],
    hints: [
      'Use np.random.randn to generate random numbers',
      'Xavier: multiply by sqrt(2 / (n_in + n_out))',
      'He: multiply by sqrt(2 / n_in)',
    ],
    solution: `import numpy as np

def initialize_weights(n_in, n_out, method='xavier'):
    np.random.seed(42)

    if method == 'xavier':
        std = np.sqrt(2.0 / (n_in + n_out))
    elif method == 'he':
        std = np.sqrt(2.0 / n_in)
    else:
        raise ValueError("Method must be 'xavier' or 'he'")

    W = np.random.randn(n_in, n_out) * std
    return round(np.std(W), 4)
`,
  },
  {
    id: 'batch-norm',
    title: 'Batch Normalization',
    section: 'neural-networks',
    difficulty: 'medium',
    description: `
## Batch Normalization

Implement batch normalization to stabilize training.

### Forward Pass
\`\`\`
1. Compute batch mean: μ = mean(x, axis=0)
2. Compute batch variance: σ² = var(x, axis=0)
3. Normalize: x_norm = (x - μ) / sqrt(σ² + ε)
4. Scale and shift: out = γ * x_norm + β
\`\`\`

### Return Format
Return \`(out, cache)\` where:
- \`out\`: Normalized and scaled output
- \`cache\`: Tuple \`(X, X_norm, mu, var, gamma, eps)\` for backward pass

### Benefits
- Reduces internal covariate shift
- Allows higher learning rates
- Acts as regularization
    `,
    examples: [
      {
        input: 'X with mean=5, var=4, gamma=1, beta=0',
        output: 'Normalized X with mean≈0, var≈1',
        explanation: 'BatchNorm normalizes each feature',
      },
    ],
    starterCode: `import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    """
    Batch normalization forward pass.

    Args:
        X: Input (batch_size, features)
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
    testCases: [
      {
        id: '1',
        description: 'Output mean near zero',
        input: 'bool(np.allclose(np.mean(batch_norm_forward(np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.ones(2), np.zeros(2))[0], axis=0), 0, atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Gamma scales output',
        input: 'list(np.round(batch_norm_forward(np.array([[0.0, 0.0], [2.0, 2.0]]), np.array([2.0, 3.0]), np.zeros(2))[0][1], 1))',
        expected: '[2.0, 3.0]',
        hidden: true,
      },
    ],
    hints: [
      'Compute mean along axis=0 (batch dimension)',
      'Compute variance along axis=0',
      'Normalize: (X - mean) / sqrt(var + eps)',
      'Apply scale and shift: gamma * normalized + beta',
    ],
    solution: `import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    # Compute batch statistics
    mu = np.mean(X, axis=0)
    var = np.var(X, axis=0)

    # Normalize
    X_norm = (X - mu) / np.sqrt(var + eps)

    # Scale and shift
    out = gamma * X_norm + beta

    # Cache for backward pass
    cache = (X, X_norm, mu, var, gamma, eps)

    return out, cache
`,
  },
  {
    id: 'dropout',
    title: 'Dropout',
    section: 'neural-networks',
    difficulty: 'easy',
    description: `
## Dropout Regularization

Implement dropout to prevent overfitting.

### Training Mode
\`\`\`
1. Generate mask: mask = (rand < keep_prob) / keep_prob
2. Apply mask: out = x * mask
\`\`\`

### Key Points
- Randomly "drop" neurons with probability (1 - keep_prob)
- Scale by 1/keep_prob to maintain expected value
- Disabled during inference (return input unchanged)
    `,
    examples: [
      {
        input: 'X = [[1, 2, 3, 4]], keep_prob=0.5',
        output: 'Some values zeroed, others scaled by 2',
        explanation: 'Half neurons dropped, rest doubled',
      },
    ],
    starterCode: `import numpy as np

def dropout_forward(X, keep_prob=0.5, training=True):
    """
    Apply dropout to input.

    Args:
        X: Input array
        keep_prob: Probability of keeping a neuron
        training: Whether in training mode

    Returns:
        out: Output after dropout
        mask: Dropout mask (for backward pass)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Inference returns unchanged',
        input: 'dropout_forward(np.array([[1, 2, 3, 4]]), 0.5, False)[0].tolist()',
        expected: '[[1, 2, 3, 4]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Expected value preserved',
        input: `(lambda: (
            np.random.seed(42),
            X := np.ones((1000, 100)),
            out := dropout_forward(X, 0.8, True)[0],
            bool(abs(np.mean(out) - 1.0) < 0.1)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'In training: create binary mask with np.random.rand',
      'Scale mask by 1/keep_prob (inverted dropout)',
      'In inference: return input unchanged',
    ],
    solution: `import numpy as np

def dropout_forward(X, keep_prob=0.5, training=True):
    if not training:
        return X, None

    # Create mask and scale
    mask = (np.random.rand(*X.shape) < keep_prob) / keep_prob
    out = X * mask

    return out, mask
`,
  },
];
