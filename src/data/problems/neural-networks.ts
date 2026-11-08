import { Problem } from '../../types';

export const neuralNetworkProblems: Problem[] = [
  {
    id: 'mlp-forward-backward',
    title: 'MLP Forward & Backward Pass',
    section: 'neural-networks',
    difficulty: 'hard',
    description: `
## MLP Forward & Backward Pass

### What you'll build
Two functions for a 2-layer MLP classifier: \`mlp_forward\` computes class probabilities and a cache, and \`mlp_backward\` uses the cache to compute the gradients of the mean cross-entropy loss with respect to every weight and bias, by hand (backpropagation).

### Background
Backprop is the chain rule applied layer by layer, from the loss back to the inputs, reusing values saved during the forward pass. "Write the backward pass of a small MLP in NumPy" is one of the most common ML coding interview questions, and getting the shapes right is most of the work.

### Architecture
\`\`\`text
X (m, n_features) -> [W1, b1] -> ReLU -> (m, n_hidden) -> [W2, b2] -> softmax -> (m, n_classes)
\`\`\`

### Forward pass
\`\`\`text
Z1 = X @ W1 + b1          # (m, n_hidden)
A1 = relu(Z1)             # (m, n_hidden)
Z2 = A1 @ W2 + b2         # (m, n_classes), the logits
output = softmax(Z2)      # row-wise probabilities
cache = (X, Z1, A1, Z2, W1, W2)
\`\`\`

### Backward pass
The loss is the mean cross-entropy \`L = -(1/m) * sum(Y * log(output))\`, with \`Y\` one-hot. Softmax followed by cross-entropy has a famously simple gradient with respect to the logits, \`output - Y\` (per example; the \`1/m\` comes from the mean):
\`\`\`text
dZ2 = output - Y                      # (m, n_classes)
dW2 = (1/m) * A1.T @ dZ2              # (n_hidden, n_classes)
db2 = (1/m) * sum(dZ2, axis=0)        # (n_classes,)
dA1 = dZ2 @ W2.T                      # (m, n_hidden)
dZ1 = dA1 * (Z1 > 0)                  # ReLU passes gradient only where Z1 > 0
dW1 = (1/m) * X.T @ dZ1               # (n_features, n_hidden)
db1 = (1/m) * sum(dZ1, axis=0)        # (n_hidden,)
\`\`\`
Every gradient has the same shape as its parameter: a quick sanity check.

### Inputs
- \`X\`: \`(m, n_features)\`; \`W1\`: \`(n_features, n_hidden)\`; \`b1\`: \`(n_hidden,)\`; \`W2\`: \`(n_hidden, n_classes)\`; \`b2\`: \`(n_classes,)\`
- \`Y\`: one-hot labels \`(m, n_classes)\`; \`output\` and \`cache\` come from \`mlp_forward\`

### Expected return format
- \`mlp_forward\` returns the tuple \`(output, cache)\`: \`output\` has shape \`(m, n_classes)\` with rows summing to 1, and \`cache\` is the tuple \`(X, Z1, A1, Z2, W1, W2)\` in that order.
- \`mlp_backward\` returns a dictionary with these keys:
  - \`'dW1'\`: \`(n_features, n_hidden)\`
  - \`'db1'\`: \`(n_hidden,)\`
  - \`'dW2'\`: \`(n_hidden, n_classes)\`
  - \`'db2'\`: \`(n_classes,)\`

### Edge cases and conventions
- The ReLU derivative at exactly \`Z1 = 0\` is taken as 0 (\`Z1 > 0\`).
- Gradients are averaged over the batch (divide by \`m\`), matching a mean loss.
- The \`relu\` and \`softmax\` helpers (stable, row-wise) are provided in the starter code.

### Constraints
NumPy only, fully vectorised over the batch (no loops over examples). Don't modify the inputs.

### Follow-up
- Check your gradients numerically: perturb one weight by \`±1e-5\` and compare \`(L+ - L-) / 2e-5\` with your analytic value.
- Add L2 weight decay: what changes in \`dW1\` and \`dW2\`? (Add \`λ * W\`.)
    `,
    examples: [
      {
        input: 'mlp_forward(np.array([[1.0, 0.0], [0.0, 1.0]]), np.eye(2), np.zeros(2), np.eye(2), np.zeros(2))[0]',
        output: '[[0.7311, 0.2689], [0.2689, 0.7311]] (rounded)',
        explanation: 'With identity weights the logits equal the inputs, so each row is softmax([1, 0]) or softmax([0, 1]).',
      },
      {
        input: "X = [[1, 2]], W1 = I, b1 = 0, W2 = zeros((2, 2)), b2 = 0, Y = [[1, 0]]: mlp_backward(Y, *mlp_forward(X, W1, b1, W2, b2))",
        output: "{'dW1': [[0, 0], [0, 0]], 'db1': [0, 0], 'dW2': [[-0.5, 0.5], [-1.0, 1.0]], 'db2': [-0.5, 0.5]}",
        explanation: 'output = [0.5, 0.5], so dZ2 = [-0.5, 0.5] and dW2 = A1.T @ dZ2 with A1 = [1, 2]. W2 = 0 blocks any gradient into layer 1.',
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
    Forward pass for a 2-layer MLP (ReLU hidden layer, softmax output).

    Args:
        X: Input data (m, n_features)
        W1: First layer weights (n_features, n_hidden)
        b1: First layer bias (n_hidden,)
        W2: Second layer weights (n_hidden, n_classes)
        b2: Second layer bias (n_classes,)

    Returns:
        output: Class probabilities (m, n_classes), rows sum to 1
        cache: Tuple (X, Z1, A1, Z2, W1, W2) for backprop
    """
    # Your code here
    pass

def mlp_backward(Y, output, cache):
    """
    Backward pass for the 2-layer MLP with mean cross-entropy loss.

    Args:
        Y: One-hot labels (m, n_classes)
        output: Probabilities from mlp_forward (m, n_classes)
        cache: Tuple (X, Z1, A1, Z2, W1, W2) from mlp_forward

    Returns:
        grads: dict with 'dW1' (n_features, n_hidden), 'db1' (n_hidden,),
               'dW2' (n_hidden, n_classes), 'db2' (n_classes,)
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
        description: 'Forward: identity weights give softmax of the input',
        input: 'np.round(mlp_forward(np.array([[1.0, 0.0], [0.0, 1.0]]), np.eye(2), np.zeros(2), np.eye(2), np.zeros(2))[0], 4).tolist()',
        expected: '[[0.7311, 0.2689], [0.2689, 0.7311]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Backward: keys present and shapes match the parameters',
        input: `(lambda: (
            X := np.array([[1.0, 2.0], [3.0, 4.0]]),
            W1 := np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
            b1 := np.zeros(3),
            W2 := np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            b2 := np.zeros(2),
            result := mlp_forward(X, W1, b1, W2, b2),
            grads := mlp_backward(np.array([[1, 0], [0, 1]]), result[0], result[1]),
            (sorted(grads.keys()), grads['dW1'].shape, grads['db1'].shape, grads['dW2'].shape, grads['db2'].shape)
        )[-1])()`,
        expected: "(['dW1', 'dW2', 'db1', 'db2'], (2, 3), (3,), (3, 2), (2,))",
        hidden: false,
      },
      {
        id: '4',
        description: 'Backward: hand-computed dW2 and db2 (W2 = 0 blocks layer-1 gradients)',
        input: `(lambda: (
            r := mlp_forward(np.array([[1.0, 2.0]]), np.eye(2), np.zeros(2), np.zeros((2, 2)), np.zeros(2)),
            g := mlp_backward(np.array([[1.0, 0.0]]), r[0], r[1]),
            (g['dW2'].tolist(), g['db2'].tolist(), float(np.abs(g['dW1']).sum()))
        )[-1])()`,
        expected: '([[-0.5, 0.5], [-1.0, 1.0]], [-0.5, 0.5], 0.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Backward: all gradient values on a batch with inactive ReLUs',
        input: `(lambda: (
            X := np.array([[1.0, 2.0], [3.0, -4.0], [0.5, 0.5]]),
            W1 := np.array([[0.1, -0.2, 0.3], [0.4, 0.5, -0.6]]),
            b1 := np.array([0.1, 0.0, -0.1]),
            W2 := np.array([[0.1, 0.2], [-0.3, 0.4], [0.5, -0.6]]),
            b2 := np.array([0.05, -0.05]),
            r := mlp_forward(X, W1, b1, W2, b2),
            g := mlp_backward(np.array([[1, 0], [0, 1], [0, 1]]), r[0], r[1]),
            {k: np.round(g[k], 5).tolist() for k in ('dW1', 'db1', 'dW2', 'db2')}
        )[-1])()`,
        expected: "{'dW1': [[0.01305, 0.09134, 1.07131], [0.03426, 0.23984, -1.42841]], 'db1': [0.00488, 0.03417, 0.3571], 'dW2': [[-0.15498, 0.15498], [-0.14522, 0.14522], [1.03884, -1.03884]], 'db2': [0.27582, -0.27582]}",
        hidden: true,
      },
      {
        id: '6',
        description: 'Backward: dW1 matches a finite-difference estimate of the loss',
        input: `(lambda: (
            X := np.random.randn(4, 3), W1 := np.random.randn(3, 5), b1 := np.random.randn(5),
            W2 := np.random.randn(5, 2), b2 := np.random.randn(2), Y := np.eye(2)[[0, 1, 1, 0]],
            loss := lambda: float(-np.sum(Y * np.log(mlp_forward(X, W1, b1, W2, b2)[0])) / 4),
            g := mlp_backward(Y, *mlp_forward(X, W1, b1, W2, b2)),
            bump := lambda d: (W1.__setitem__((1, 2), W1[1, 2] + d), loss())[-1],
            fd := (bump(1e-5) - bump(-2e-5)) / 2e-5,
            bump(1e-5),
            bool(abs(g['dW1'][1, 2] - fd) < 1e-6)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Forward is four lines: affine, ReLU, affine, softmax. Save exactly (X, Z1, A1, Z2, W1, W2) in the cache, in that order.',
      'Backward goes in reverse: output layer first (dZ2, dW2, db2), then push the gradient through W2 and the ReLU (dA1, dZ1), then the first layer (dW1, db1).',
      'dZ2 = output - Y; dW2 = A1.T @ dZ2 / m; db2 = dZ2.sum(axis=0) / m; dZ1 = (dZ2 @ W2.T) * (Z1 > 0); dW1 = X.T @ dZ1 / m; db1 = dZ1.sum(axis=0) / m.',
      'Pitfalls: forgetting the 1/m, using A1 > 0 vs Z1 > 0 inconsistently (both work here, but be deliberate), or writing dZ2 @ W2 instead of dZ2 @ W2.T. Check every gradient shape against its parameter.',
    ],
    solution: `import numpy as np

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True)

def mlp_forward(X, W1, b1, W2, b2):
    """
    Forward pass for a 2-layer MLP (ReLU hidden layer, softmax output).

    Returns:
        output: Class probabilities (m, n_classes)
        cache: Tuple (X, Z1, A1, Z2, W1, W2)
    """
    Z1 = X @ W1 + b1          # (m, n_hidden)
    A1 = relu(Z1)
    Z2 = A1 @ W2 + b2         # (m, n_classes) logits
    output = softmax(Z2)
    cache = (X, Z1, A1, Z2, W1, W2)
    return output, cache

def mlp_backward(Y, output, cache):
    """
    Backward pass for the 2-layer MLP with mean cross-entropy loss.

    Returns:
        grads: dict with 'dW1', 'db1', 'dW2', 'db2' (same shapes as the parameters)
    """
    X, Z1, A1, Z2, W1, W2 = cache
    m = X.shape[0]

    # Softmax + cross-entropy: dL/dZ2 = (output - Y) / m; the 1/m is applied below
    dZ2 = output - Y
    dW2 = A1.T @ dZ2 / m
    db2 = dZ2.sum(axis=0) / m

    # Back through W2, then through the ReLU (gradient flows only where Z1 > 0)
    dA1 = dZ2 @ W2.T
    dZ1 = dA1 * (Z1 > 0)
    dW1 = X.T @ dZ1 / m
    db1 = dZ1.sum(axis=0) / m

    return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}

# Time O(m * (n_features * n_hidden + n_hidden * n_classes)) for each pass;
# memory O(m * n_hidden) for the cache.
`,
  },
  {
    id: 'cross-entropy-loss',
    title: 'Cross-Entropy Loss',
    section: 'neural-networks',
    difficulty: 'easy',
    description: `
## Cross-Entropy Loss

### What you'll build
The mean cross-entropy loss between predicted class probabilities and one-hot labels, rounded to 4 decimals.

### Background
Cross-entropy is the standard classification loss. Minimising it is maximum likelihood: it is the average negative log-probability the model gave to the correct class. A confident correct prediction costs almost nothing; a confident wrong one costs a lot (\`-log(0.01) ≈ 4.6\`).

### Formula
\`\`\`text
L = -(1/m) * sum_i sum_c  Y[i, c] * log(Y_pred[i, c] + eps)        eps = 1e-15
\`\`\`
- \`m\`: batch size (number of rows)
- \`Y[i, c]\`: 1 if example \`i\` belongs to class \`c\`, else 0
- \`Y_pred[i, c]\`: predicted probability of class \`c\` for example \`i\`
- With one-hot labels, only the true class contributes: \`L = mean_i(-log(p_i,true))\`.

### Inputs
- \`Y_pred\`: probabilities, shape \`(m, n_classes)\`, each row sums to 1, values in \`[0, 1]\`
- \`Y_true\`: one-hot labels, shape \`(m, n_classes)\`

### Expected return format
A Python \`float\`: the mean loss over the batch, **rounded to 4 decimals** with \`round(loss, 4)\`.

### Edge cases and conventions
- Add \`eps = 1e-15\` inside the log so a predicted probability of exactly 0 gives a large finite loss (\`-log(1e-15) = 34.5388\`) instead of \`inf\`.
- A perfect prediction gives \`0.0\` (up to the sign of a tiny rounding error).

### Constraints
NumPy only, vectorised. Use the probabilities as given (this function does not apply softmax).

### Follow-up
- In practice frameworks take **logits**, not probabilities, and compute \`logsumexp(z) - z_y\`, which is stable without an eps. Why is that better than \`log(softmax(z))\`?
- With class indices instead of one-hot labels, use \`-log(p[np.arange(m), y])\`.
    `,
    examples: [
      {
        input: 'cross_entropy_loss(np.array([[0.7, 0.2, 0.1], [0.1, 0.8, 0.1]]), np.array([[1, 0, 0], [0, 1, 0]]))',
        output: '0.2899',
        explanation: '-(log(0.7) + log(0.8)) / 2 = (0.3567 + 0.2231) / 2.',
      },
      {
        input: 'cross_entropy_loss(np.array([[0.0, 1.0]]), np.array([[1, 0]]))',
        output: '34.5388',
        explanation: 'The true class got probability 0, so the loss is -log(1e-15): large but finite thanks to eps.',
      },
    ],
    starterCode: `import numpy as np

def cross_entropy_loss(Y_pred, Y_true):
    """
    Mean cross-entropy loss for one-hot labels.

    Args:
        Y_pred: Predicted probabilities (m, n_classes)
        Y_true: One-hot true labels (m, n_classes)

    Returns:
        loss: Mean cross-entropy as a float, rounded to 4 decimals
              (use eps = 1e-15 inside the log)
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
      {
        id: '3',
        description: 'Uniform predictions',
        input: 'round(cross_entropy_loss(np.array([[0.5, 0.5]]), np.array([[1, 0]])), 4)',
        expected: '0.6931',
        hidden: true,
      },
      {
        id: '4',
        description: 'Three classes',
        input: 'round(cross_entropy_loss(np.array([[0.1, 0.8, 0.1]]), np.array([[0, 1, 0]])), 4)',
        expected: '0.2231',
        hidden: true,
      },
      {
        id: '5',
        description: 'Zero probability on the true class uses eps = 1e-15',
        input: 'cross_entropy_loss(np.array([[0.0, 1.0], [0.5, 0.5]]), np.array([[1, 0], [1, 0]]))',
        expected: '17.616',
        hidden: true,
      },
      {
        id: '6',
        description: 'Random batch matches the mean negative log-likelihood',
        input: '(lambda: (Z := np.random.randn(6, 4), P := np.exp(Z) / np.exp(Z).sum(1, keepdims=True), y := np.array([0, 3, 1, 2, 2, 0]), cross_entropy_loss(P, np.eye(4)[y]) == round(float(-np.log(P[np.arange(6), y]).mean()), 4))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Only the true class of each example contributes, because Y_true is 0 everywhere else.',
      'Take the log of the predictions, multiply element-wise by the labels, sum everything, negate, and divide by the batch size m.',
      'np.log(Y_pred + 1e-15), then -np.sum(Y_true * log_probs) / Y_pred.shape[0]; finish with round(loss, 4).',
      'Divide by m (rows), not by m * n_classes, so np.mean over the whole array is wrong. Without eps, a 0 probability gives inf.',
    ],
    solution: `import numpy as np

def cross_entropy_loss(Y_pred, Y_true):
    """
    Mean cross-entropy loss for one-hot labels.

    Returns:
        loss: Mean cross-entropy as a float, rounded to 4 decimals
    """
    m = Y_pred.shape[0]
    log_probs = np.log(Y_pred + 1e-15)          # eps avoids log(0) = -inf
    loss = -np.sum(Y_true * log_probs) / m      # only the true class contributes
    return round(float(loss), 4)

# Time and space O(m * n_classes).
`,
  },
  {
    id: 'weight-init',
    title: 'Xavier/He Weight Initialization',
    section: 'neural-networks',
    difficulty: 'medium',
    description: `
## Xavier/He Weight Initialization

### What you'll build
A function that draws a weight matrix with Xavier (Glorot) normal or He (Kaiming) normal initialization and returns the **empirical standard deviation** of the sampled weights, so you can check it lands on the theoretical value.

### Background
If weights are too small, activations shrink layer after layer and gradients vanish; too large, and they explode. Good initialization picks the variance so that the signal keeps roughly the same scale through the network:
- **Xavier** (Glorot & Bengio, 2010) balances the forward and backward pass for symmetric activations like tanh: \`Var(W) = 2 / (n_in + n_out)\`.
- **He** (He et al., 2015) accounts for ReLU zeroing half of its inputs, which halves the variance, by doubling it: \`Var(W) = 2 / n_in\`.

### Formula
\`\`\`text
Xavier normal:  W = randn(n_in, n_out) * sqrt(2 / (n_in + n_out))
He normal:      W = randn(n_in, n_out) * sqrt(2 / n_in)
return round(std(W), 4)
\`\`\`

### Inputs
- \`n_in\`: number of input units (fan-in), positive int
- \`n_out\`: number of output units (fan-out), positive int
- \`method\`: \`'xavier'\` or \`'he'\`

### Expected return format
A float: \`np.std(W)\` of the sampled \`(n_in, n_out)\` matrix, **rounded to 4 decimals**. It is close to, but not exactly, the theoretical std (sampling noise).

### Edge cases and conventions
- Call \`np.random.seed(42)\` at the start of the function (the starter code does this), then draw exactly one \`np.random.randn(n_in, n_out)\` and scale it. The expected values depend on this exact sequence.
- Any other \`method\` may raise a \`ValueError\` (not tested).

### Constraints
NumPy only.

### Follow-up
- The uniform variants draw from \`U(-a, a)\` with \`a = sqrt(3) * std\`. Why \`sqrt(3)\`? (The variance of \`U(-a, a)\` is \`a² / 3\`.)
- PyTorch's \`nn.Linear\` default is Kaiming-uniform with \`a = sqrt(5)\`, which gives \`U(-1/sqrt(n_in), 1/sqrt(n_in))\`. Why do transformers often use a small fixed std like 0.02 instead?
    `,
    examples: [
      {
        input: 'initialize_weights(784, 256, "he")',
        output: '0.0505',
        explanation: 'The theoretical std is sqrt(2/784) = 0.0505; with 200k samples the empirical std matches to 4 decimals.',
      },
      {
        input: 'initialize_weights(100, 50, "xavier")',
        output: '0.1151',
        explanation: 'Theoretical sqrt(2/150) = 0.1155; with only 5,000 samples the empirical std is slightly off.',
      },
    ],
    starterCode: `import numpy as np

def initialize_weights(n_in, n_out, method='xavier'):
    """
    Sample an (n_in, n_out) weight matrix with Xavier or He normal initialization.

    Args:
        n_in: Number of input units (fan-in)
        n_out: Number of output units (fan-out)
        method: 'xavier' (std = sqrt(2 / (n_in + n_out))) or 'he' (std = sqrt(2 / n_in))

    Returns:
        std: Empirical standard deviation of the sampled weights, rounded to 4 decimals
    """
    np.random.seed(42)  # For reproducibility: draw one np.random.randn(n_in, n_out) after this
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Xavier std',
        input: '(100, 50, "xavier")',
        expected: '0.1151',
        hidden: false,
      },
      {
        id: '2',
        description: 'He std',
        input: '(100, 50, "he")',
        expected: '0.1409',
        hidden: false,
      },
      {
        id: '3',
        description: 'Xavier with large layers',
        input: '(784, 256, "xavier")',
        expected: '0.0438',
        hidden: true,
      },
      {
        id: '4',
        description: 'He with large layers',
        input: '(784, 256, "he")',
        expected: '0.0505',
        hidden: true,
      },
      {
        id: '5',
        description: 'Square layer: He std is sqrt(2) times the Xavier std',
        input: '(lambda: (initialize_weights(256, 256, "xavier"), initialize_weights(256, 256, "he")))()',
        expected: '(0.0626, 0.0886)',
        hidden: true,
      },
    ],
    hints: [
      'Both methods draw from a standard normal and only differ in the scale they multiply by.',
      'Pick the std from the method, sample W = np.random.randn(n_in, n_out) * std, and measure np.std(W).',
      "Xavier: np.sqrt(2.0 / (n_in + n_out)); He: np.sqrt(2.0 / n_in). Return round(float(np.std(W)), 4).",
      "Keep np.random.seed(42) first and draw exactly one randn(n_in, n_out) array; a different shape order (n_out, n_in) or extra random calls change the numbers. Don't return the theoretical std.",
    ],
    solution: `import numpy as np

def initialize_weights(n_in, n_out, method='xavier'):
    """
    Sample an (n_in, n_out) weight matrix with Xavier or He normal initialization.

    Returns:
        std: Empirical standard deviation of the sampled weights, rounded to 4 decimals
    """
    np.random.seed(42)

    if method == 'xavier':
        std = np.sqrt(2.0 / (n_in + n_out))   # balances forward and backward variance
    elif method == 'he':
        std = np.sqrt(2.0 / n_in)             # compensates for ReLU halving the variance
    else:
        raise ValueError("method must be 'xavier' or 'he'")

    W = np.random.randn(n_in, n_out) * std
    return round(float(np.std(W)), 4)
`,
  },
  {
    id: 'batch-norm',
    title: 'Batch Normalization',
    section: 'neural-networks',
    difficulty: 'medium',
    description: `
## Batch Normalization (training-mode forward)

### What you'll build
The forward pass of batch normalization for a 2-D batch of activations, in training mode: normalise every feature with the mean and variance of the current batch, then apply a learned scale and shift. Return the output and a cache for the backward pass.

### Background
BatchNorm (Ioffe & Szegedy, 2015) keeps each layer's inputs at a stable scale, which allows higher learning rates and makes deep CNNs much easier to train. Because the statistics come from the batch, every example's output depends slightly on the others, which also acts as a mild regulariser.

### Formula
For \`X\` of shape \`(batch, features)\`, per feature \`j\`:
\`\`\`text
1. mu_j    = mean(X[:, j])                       # batch mean,            shape (features,)
2. var_j   = mean((X[:, j] - mu_j)^2)            # biased batch variance, shape (features,)
3. X_norm  = (X - mu) / sqrt(var + eps)          # shape (batch, features)
4. out     = gamma * X_norm + beta               # learned scale and shift, broadcast over rows
\`\`\`

### Inputs
- \`X\`: \`(batch, features)\` float array
- \`gamma\`, \`beta\`: \`(features,)\`
- \`eps\`: small constant, default \`1e-5\`

### Expected return format
Return the tuple \`(out, cache)\`:
- \`out\`: \`(batch, features)\`, the normalised, scaled and shifted output
- \`cache\`: the tuple \`(X, X_norm, mu, var, gamma, eps)\`, in this order, for the backward pass

### Edge cases and conventions
- Use the **biased** variance (divide by \`batch\`, NumPy's default \`np.var\`), as BatchNorm does in training.
- \`eps\` goes **inside** the square root.
- A constant feature has \`var = 0\`; \`eps\` keeps the division finite and \`X_norm\` becomes 0.

### Constraints
NumPy only; vectorised over the batch (reduce with \`axis=0\`).

### Follow-up
- At inference time BatchNorm uses running averages of \`mu\` and \`var\` collected during training. What goes wrong if you forget \`model.eval()\`?
- Derive the backward pass from the cache; the compact form is \`dX = (gamma / (batch * std)) * (batch * dout - dout.sum(0) - X_norm * (dout * X_norm).sum(0))\`.
- LayerNorm normalises each example across its features instead (Transformers section). Why does it suit variable-length sequences better?
    `,
    examples: [
      {
        input: 'batch_norm_forward(np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.ones(2), np.zeros(2))[0]',
        output: '[[-1.2247, -1.2247], [0.0, 0.0], [1.2247, 1.2247]] (rounded)',
        explanation: 'mu = [3, 4] and var = [8/3, 8/3] (biased), so the rows map to -2, 0, 2 divided by sqrt(8/3) = 1.633.',
      },
      {
        input: 'batch_norm_forward(np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.array([2.0, 2.0]), np.array([0.5, -1.0]))[0]',
        output: '[[-1.9495, -3.4495], [0.5, -1.0], [2.9495, 1.4495]] (rounded)',
        explanation: 'gamma = 2 doubles the normalised values and beta shifts each column.',
      },
    ],
    starterCode: `import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    """
    Batch normalization forward pass (training mode, batch statistics).

    Args:
        X: Input (batch, features)
        gamma: Scale (features,)
        beta: Shift (features,)
        eps: Added to the variance inside the square root

    Returns:
        out: Normalized, scaled and shifted output (batch, features)
        cache: Tuple (X, X_norm, mu, var, gamma, eps) for the backward pass
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
      {
        id: '3',
        description: 'Normalized values on a small batch',
        input: 'np.round(batch_norm_forward(np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.ones(2), np.zeros(2))[0], 4).tolist()',
        expected: '[[-1.2247, -1.2247], [0.0, 0.0], [1.2247, 1.2247]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Output variance near 1',
        input: 'bool(np.allclose(np.var(batch_norm_forward(np.random.randn(100, 4), np.ones(4), np.zeros(4))[0], axis=0), 1, atol=0.1))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Cache has 6 elements',
        input: 'len(batch_norm_forward(np.random.randn(4, 3), np.ones(3), np.zeros(3))[1])',
        expected: '6',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gamma and beta applied per feature',
        input: 'np.round(batch_norm_forward(np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.array([2.0, 2.0]), np.array([0.5, -1.0]))[0], 4).tolist()',
        expected: '[[-1.9495, -3.4495], [0.5, -1.0], [2.9495, 1.4495]]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Cache holds the batch mean, biased variance and eps in order',
        input: '(lambda: (c := batch_norm_forward(np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.ones(2), np.zeros(2), eps=1e-3)[1], (c[2].tolist(), np.round(c[3], 6).tolist(), c[5], bool(np.allclose(c[1], (c[0] - c[2]) / np.sqrt(c[3] + 1e-3)))))[-1])()',
        expected: '([3.0, 4.0], [2.666667, 2.666667], 0.001, True)',
        hidden: true,
      },
      {
        id: '8',
        description: 'Constant feature stays finite (eps inside the sqrt)',
        input: 'np.round(batch_norm_forward(np.array([[2.0, 1.0], [2.0, 3.0]]), np.ones(2), np.array([0.5, 0.0]))[0], 4).tolist()',
        expected: '[[0.5, -1.0], [0.5, 1.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Each feature (column) gets its own mean and variance, computed over the batch dimension.',
      'Four steps: batch mean, batch variance, normalise, then scale by gamma and shift by beta. Keep the intermediates for the cache.',
      'mu = X.mean(axis=0); var = X.var(axis=0); X_norm = (X - mu) / np.sqrt(var + eps); out = gamma * X_norm + beta.',
      'Use the biased variance (np.var default, ddof=0), put eps inside the sqrt, reduce over axis=0 (not axis=1, which would be LayerNorm), and return the cache in the documented order.',
    ],
    solution: `import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    """
    Batch normalization forward pass (training mode, batch statistics).

    Returns:
        out: (batch, features)
        cache: Tuple (X, X_norm, mu, var, gamma, eps)
    """
    mu = X.mean(axis=0)                    # per-feature batch mean
    var = X.var(axis=0)                    # biased variance (divide by batch)
    X_norm = (X - mu) / np.sqrt(var + eps)
    out = gamma * X_norm + beta            # gamma, beta broadcast over the batch
    cache = (X, X_norm, mu, var, gamma, eps)
    return out, cache

# Time and space O(batch * features).
`,
  },
  {
    id: 'dropout',
    title: 'Dropout',
    section: 'neural-networks',
    difficulty: 'easy',
    description: `
## Dropout (inverted)

### What you'll build
The forward pass of **inverted dropout**: in training, zero each activation independently with probability \`1 - keep_prob\` and scale the survivors by \`1 / keep_prob\`; at inference, return the input unchanged. Also return the mask, which the backward pass needs.

### Background
Dropout (Srivastava et al., 2014) is a regulariser: randomly removing units prevents them from co-adapting, a bit like training an ensemble of thinned networks that share weights. The "inverted" variant scales during training so that the expected value of each activation is unchanged, which means inference needs no rescaling at all. This is what \`nn.Dropout\` does.

### Algorithm
\`\`\`text
training:
    mask = (rand(X.shape) < keep_prob) / keep_prob     # entries are 0 or 1/keep_prob
    out  = X * mask
    return out, mask
inference:
    return X, None
\`\`\`
\`E[out] = keep_prob * (X / keep_prob) + (1 - keep_prob) * 0 = X\`.

### Inputs
- \`X\`: array of any shape
- \`keep_prob\`: probability of **keeping** a unit, in \`(0, 1]\` (note: \`nn.Dropout(p)\` takes the drop probability \`p = 1 - keep_prob\`)
- \`training\`: \`True\` for training mode, \`False\` for inference

### Expected return format
Return the tuple \`(out, mask)\`:
- training: \`out\` has the shape of \`X\` and equals \`X * mask\`; \`mask\` has the shape of \`X\` with entries \`0\` or \`1 / keep_prob\`
- inference: \`(X, None)\`

### Edge cases and conventions
- Draw the mask with \`np.random.rand\` (uniform in \`[0, 1)\`) and keep where \`rand < keep_prob\`. The tests seed NumPy, check the structure of the mask and statistics over many units, not one specific mask.
- \`keep_prob = 1.0\` keeps everything: \`out\` equals \`X\`.
- Don't modify \`X\` in place.

### Constraints
NumPy only, vectorised.

### Follow-up
- The backward pass is \`dX = dout * mask\`. Why is storing the scaled mask convenient?
- Why is dropout rarely used together with BatchNorm in CNNs, and why do many LLMs train with dropout 0?
    `,
    examples: [
      {
        input: 'dropout_forward(np.array([[1, 2, 3, 4]]), keep_prob=0.5, training=False)',
        output: '(array([[1, 2, 3, 4]]), None)',
        explanation: 'At inference dropout is the identity, and there is no mask.',
      },
      {
        input: 'dropout_forward(np.array([[1.0, 2.0, 3.0, 4.0]]), keep_prob=0.5, training=True)',
        output: 'e.g. (array([[2., 0., 6., 0.]]), array([[2., 0., 2., 0.]]))',
        explanation: 'Each unit is kept with probability 0.5; kept units are scaled by 1/0.5 = 2. The exact mask depends on the random draw.',
      },
    ],
    starterCode: `import numpy as np

def dropout_forward(X, keep_prob=0.5, training=True):
    """
    Inverted dropout forward pass.

    Args:
        X: Input array (any shape)
        keep_prob: Probability of keeping each unit, in (0, 1]
        training: True for training mode, False for inference

    Returns:
        out: X * mask in training; X unchanged in inference
        mask: Array like X with entries 0 or 1/keep_prob in training; None in inference
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Inference returns the input unchanged',
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
      {
        id: '3',
        description: 'Output shape preserved',
        input: `(lambda: (
            np.random.seed(0),
            dropout_forward(np.random.randn(4, 8), 0.5, True)[0].shape
        )[-1])()`,
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Some values are zeroed in training',
        input: `(lambda: (
            np.random.seed(42),
            out := dropout_forward(np.ones((10, 10)), 0.5, True)[0],
            bool(np.any(out == 0))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Mask returned in training, None in inference',
        input: `(lambda: (
            np.random.seed(42),
            (dropout_forward(np.ones((4, 4)), 0.5, True)[1] is not None, dropout_forward(np.ones((4, 4)), 0.5, False)[1] is None)
        )[-1])()`,
        expected: '(True, True)',
        hidden: true,
      },
      {
        id: '6',
        description: 'out equals X * mask, and mask entries are 0 or 1/keep_prob',
        input: '(lambda: (X := np.random.randn(6, 5), r := dropout_forward(X, 0.7, True), m := r[1], (bool(np.allclose(r[0], X * m)), bool(np.all(np.isclose(m, 0) | np.isclose(m, 1 / 0.7)))))[-1])()',
        expected: '(True, True)',
        hidden: true,
      },
      {
        id: '7',
        description: 'About keep_prob of the units survive',
        input: '(lambda: (m := dropout_forward(np.ones((100, 100)), 0.7, True)[1], bool(abs((m > 0).mean() - 0.7) < 0.02))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'keep_prob = 1 keeps every unit unchanged',
        input: '(lambda: (X := np.random.randn(3, 4), bool(np.allclose(dropout_forward(X, 1.0, True)[0], X)))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Handle inference first: dropout does nothing there. In training, each unit needs its own independent coin flip.',
      'Build a mask of the same shape as X, scale it so the expected value is unchanged, then multiply.',
      'mask = (np.random.rand(*X.shape) < keep_prob) / keep_prob; out = X * mask. Inference: return X, None.',
      'keep_prob is the probability of keeping, not dropping (nn.Dropout takes the drop probability). Forgetting the 1/keep_prob scale shrinks activations at train time only.',
    ],
    solution: `import numpy as np

def dropout_forward(X, keep_prob=0.5, training=True):
    """
    Inverted dropout forward pass.

    Returns:
        out: X * mask in training; X unchanged in inference
        mask: entries 0 or 1/keep_prob in training; None in inference
    """
    if not training:
        return X, None

    # Keep each unit with probability keep_prob; scale survivors so E[out] = X
    mask = (np.random.rand(*X.shape) < keep_prob) / keep_prob
    return X * mask, mask

# Time and space O(size of X).
`,
  },
  {
    id: 'masked-label-smoothing-ce',
    title: 'Masked Cross-Entropy with Label Smoothing',
    section: 'neural-networks',
    difficulty: 'medium',
    description: `
## Masked Cross-Entropy with Label Smoothing

### What you'll build
Token-level cross-entropy from **logits**, with a padding mask (\`ignore_index\`) and **label smoothing**, matching PyTorch's \`F.cross_entropy(logits, targets, ignore_index=..., label_smoothing=...)\` with mean reduction.

### Background
Language-model training computes a loss per token, but batches are padded to a common length and padding tokens must not count. Many training recipes also smooth the labels: instead of a one-hot target, the model is trained towards \`(1 - eps)\` on the true class plus \`eps\` spread over all classes, which discourages over-confident logits and often improves calibration.

### Formula
For one token with logits \`z\` (\`V\` classes) and target class \`y\`:
\`\`\`text
log_p = z - logsumexp(z)                        # log-softmax, computed stably
q_c   = (1 - eps) * [c == y] + eps / V          # smoothed target: eps spread over ALL V classes
loss  = -sum_c q_c * log_p_c
      = (1 - eps) * (-log_p_y) + eps * mean_c(-log_p_c)
\`\`\`
The final loss is the **mean over non-ignored tokens only**:
\`\`\`text
L = sum_{tokens with y != ignore_index} loss / (number of such tokens)
\`\`\`
where \`logsumexp(z) = m + log(sum_c exp(z_c - m))\` with \`m = max(z)\`.

### Inputs
- \`logits\`: float array \`(N, V)\` or \`(B, T, V)\`
- \`targets\`: int array \`(N,)\` or \`(B, T)\`, matching the leading dimensions of \`logits\`
- \`ignore_index\`: target value that marks padding (default \`-100\`; may also be a real class id such as a pad id of 0)
- \`smoothing\`: label smoothing \`eps\` in \`[0, 1]\` (default 0)

### Expected return format
A Python \`float\`: the mean loss over non-ignored tokens.

### Edge cases and conventions
- Flatten the leading dimensions to \`(N, V)\` and \`(N,)\` first.
- Select the kept tokens **before** indexing by target: \`-100\` is not a valid class index.
- If every token is ignored, return \`nan\` (what PyTorch's mean reduction gives).
- With \`smoothing = 0\` this is the ordinary cross-entropy.
- Logits of magnitude 1000 must not overflow: use the max-shift inside \`logsumexp\`.

### Constraints
NumPy only, vectorised (no Python loop over tokens).

### Follow-up
- PyTorch's \`reduction='sum'\` divides by nothing; why do LM trainers often normalise by the number of tokens across the whole (accumulated) batch instead of per micro-batch?
- What is the minimum achievable loss with smoothing \`eps > 0\`? (It is the entropy of \`q\`, not 0.)
`,
    examples: [
      {
        input: 'masked_label_smoothing_ce(np.array([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0], [1.0, 1.0, 1.0], [-2.0, 0.0, 3.0]]), np.array([0, 1, -100, 2]))',
        output: '0.2084 (rounded)',
        explanation: 'The third token is padding, so the loss is the mean of the other three per-token losses.',
      },
      {
        input: 'masked_label_smoothing_ce(np.array([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0], [1.0, 1.0, 1.0], [-2.0, 0.0, 3.0]]), np.array([0, 1, -100, 2]), smoothing=0.1)',
        output: '0.3906 (rounded)',
        explanation: 'Smoothing moves 10% of the target mass onto all classes, which raises the loss of confident correct predictions.',
      },
    ],
    starterCode: `import numpy as np

def masked_label_smoothing_ce(logits, targets, ignore_index=-100, smoothing=0.0):
    """
    Token-level cross-entropy with label smoothing and a padding mask.

    Args:
        logits: Unnormalized scores, array (N, V) or (B, T, V)
        targets: Class ids, int array (N,) or (B, T); ignore_index marks padding
        ignore_index: Target value whose tokens are excluded from the loss
        smoothing: Label smoothing eps in [0, 1]

    Returns:
        Mean loss over non-ignored tokens (float); nan if every token is ignored
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'No smoothing, one token',
        input: 'round(masked_label_smoothing_ce(np.array([[2.0, 1.0, 0.1]]), np.array([0])), 4)',
        expected: '0.417',
        hidden: false,
      },
      {
        id: '2',
        description: 'Padding token is ignored',
        input: 'round(masked_label_smoothing_ce(np.array([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0], [1.0, 1.0, 1.0], [-2.0, 0.0, 3.0]]), np.array([0, 1, -100, 2])), 4)',
        expected: '0.2084',
        hidden: false,
      },
      {
        id: '3',
        description: 'Smoothing 0.1 with padding',
        input: 'round(masked_label_smoothing_ce(np.array([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0], [1.0, 1.0, 1.0], [-2.0, 0.0, 3.0]]), np.array([0, 1, -100, 2]), smoothing=0.1), 4)',
        expected: '0.3906',
        hidden: true,
      },
      {
        id: '4',
        description: '3-D logits (B, T, V), random padding, smoothing 0.2',
        input: '(lambda: (L := np.random.randn(2, 6, 5) * 2, T := np.where(np.random.rand(2, 6) < 0.3, -100, np.random.randint(0, 5, size=(2, 6))), round(masked_label_smoothing_ce(L, T, smoothing=0.2), 4))[-1])()',
        expected: '2.7471',
        hidden: true,
      },
      {
        id: '5',
        description: 'Pad id 0 used as ignore_index',
        input: '(lambda: (L := np.random.randn(6, 4) * 3, round(masked_label_smoothing_ce(L, np.array([0, 3, 0, 1, 2, 0]), ignore_index=0, smoothing=0.25), 4))[-1])()',
        expected: '3.8851',
        hidden: true,
      },
      {
        id: '6',
        description: 'Every token ignored gives nan',
        input: 'bool(np.isnan(masked_label_smoothing_ce(np.random.randn(3, 4), np.array([-100, -100, -100]))))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Large logits stay finite',
        input: 'round(masked_label_smoothing_ce(np.array([[1000.0, 0.0, -1000.0], [0.0, 500.0, 0.0]]), np.array([0, 2]), smoothing=0.1), 4)',
        expected: '291.6667',
        hidden: true,
      },
      {
        id: '8',
        description: 'Padding does not change the loss of the real tokens',
        input: '(lambda: (L := np.array([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0], [1.0, 1.0, 1.0], [-2.0, 0.0, 3.0]]), a := masked_label_smoothing_ce(L, np.array([0, 1, -100, 2]), smoothing=0.3), b := masked_label_smoothing_ce(L[[0, 1, 3]], np.array([0, 1, 2]), smoothing=0.3), bool(abs(a - b) < 1e-9))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reduce the problem to a flat list of tokens: reshape logits to (N, V) and targets to (N,), then decide which tokens count.',
      'Build keep = targets != ignore_index and select the kept rows before any indexing by target; then compute a stable log-softmax of those rows.',
      'log_p = z - m - np.log(np.exp(z - m).sum(-1, keepdims=True)) with m the row max; nll = -log_p[np.arange(n), y]; the smoothed loss is (1 - eps) * nll + eps * (-log_p).mean(-1).',
      'Pitfalls: indexing with -100 silently picks the last class; spreading eps over V - 1 classes instead of V (PyTorch uses V); and averaging over all tokens instead of only the kept ones.',
    ],
    solution: `import numpy as np

def masked_label_smoothing_ce(logits, targets, ignore_index=-100, smoothing=0.0):
    """
    Token-level cross-entropy with label smoothing and a padding mask.

    Returns:
        Mean loss over non-ignored tokens (float); nan if every token is ignored
    """
    logits = np.asarray(logits, dtype=float)
    targets = np.asarray(targets)
    V = logits.shape[-1]
    logits = logits.reshape(-1, V)
    targets = targets.reshape(-1)

    keep = targets != ignore_index
    if not keep.any():
        return float('nan')
    z, y = logits[keep], targets[keep]      # select BEFORE indexing by target

    # Stable log-softmax
    m = z.max(axis=-1, keepdims=True)
    log_p = z - m - np.log(np.exp(z - m).sum(axis=-1, keepdims=True))

    nll = -log_p[np.arange(len(y)), y]      # -log p_y
    uniform = -log_p.mean(axis=-1)          # mean_c -log p_c
    loss = (1 - smoothing) * nll + smoothing * uniform
    return float(loss.mean())

# Time and space O(N * V).
`,
  },
];
