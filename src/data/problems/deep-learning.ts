import { Problem } from '../../types';

// Note: the ids of this section predate its content. `perceptron` is the ReLU
// problem and `backpropagation` is the softmax problem. Ids are stable (saved
// progress is keyed by them), so only titles and descriptions say what is asked.
export const deepLearningProblems: Problem[] = [
  {
    id: 'perceptron',
    title: 'ReLU Activation',
    section: 'deep-learning',
    difficulty: 'easy',
    description: `
## ReLU Activation

### What you'll build
The Rectified Linear Unit, \`relu(x)\`, applied element-wise to an array of any shape. It is the default non-linearity in the hidden layers of MLPs, CNNs and transformer feed-forward blocks.

### Background
Without a non-linearity, a stack of linear layers collapses into a single linear map, so depth buys nothing. ReLU is the simplest non-linearity that works well: it is cheap, it does not saturate for positive inputs (its gradient there is exactly 1, which helps against vanishing gradients), and it makes activations sparse.

### Formula
\`\`\`text
relu(x)  = max(0, x)           element-wise
relu'(x) = 1 if x > 0 else 0   (the value at x = 0 is a convention; frameworks use 0)
\`\`\`

### Inputs
- \`x\`: NumPy array of any shape (ints or floats).

### Expected return format
An array with the **same shape** as \`x\`: negative entries become 0, the rest are unchanged. Keep the input's dtype (an int array stays int).

### Edge cases and conventions
- \`relu(0) = 0\`.
- Tiny negatives such as \`-1e-10\` become exactly 0.

### Constraints
Vectorise: no Python loops over elements.

### Follow-up
- What is the "dying ReLU" problem, and how do Leaky ReLU and GELU address it? (You implement both in PyTorch Basics.)
- Why does ReLU pair with He initialization rather than Xavier? (See Xavier/He Weight Initialization in Neural Networks.)
    `,
    examples: [
      {
        input: 'relu(np.array([-2, -1, 0, 1, 2]))',
        output: '[0, 0, 0, 1, 2]',
        explanation: 'Negative values become 0; zero and positive values pass through unchanged.',
      },
      {
        input: 'relu(np.array([[-1.5, 2.0], [3.0, -4.0]]))',
        output: '[[0.0, 2.0], [3.0, 0.0]]',
        explanation: 'Works element-wise on any shape and keeps that shape.',
      },
    ],
    starterCode: `import numpy as np

def relu(x: np.ndarray) -> np.ndarray:
    """
    Apply the ReLU activation element-wise.

    Args:
        x: Input array of any shape

    Returns:
        Array of the same shape and dtype with max(0, x) applied element-wise
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Mixed values',
        input: '[-2, -1, 0, 1, 2]',
        expected: '[0, 0, 0, 1, 2]',
        hidden: false,
      },
      {
        id: '2',
        description: 'All negative',
        input: '[-5, -3, -1]',
        expected: '[0, 0, 0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'All positive',
        input: '[1, 2, 3]',
        expected: '[1, 2, 3]',
        hidden: true,
      },
      {
        id: '4',
        description: '2D input keeps its shape and values',
        input: 'relu(np.array([[-1.5, 2.0], [3.0, -4.0]])).tolist()',
        expected: '[[0.0, 2.0], [3.0, 0.0]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Zeros remain zero',
        input: 'relu(np.array([0, 0, 0])).tolist()',
        expected: '[0, 0, 0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large and tiny negative values clipped to zero',
        input: 'bool(np.all(relu(np.array([-1000, -0.001, -1e-10])) == 0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Positive floats unchanged',
        input: 'relu(np.array([0.5, 1.5, 100.0])).tolist()',
        expected: '[0.5, 1.5, 100.0]',
        hidden: true,
      },
      {
        id: '8',
        description: '3D random input matches the definition',
        input: '(lambda: (x := np.random.randn(2, 3, 4), r := relu(x), (r.shape, bool(np.array_equal(r, np.where(x > 0, x, 0.0)))))[-1])()',
        expected: '((2, 3, 4), True)',
        hidden: true,
      },
    ],
    hints: [
      'ReLU acts on each element independently, so think of one operation that compares every element with 0 at once.',
      'Compare the whole array with the scalar 0 and keep the larger value; NumPy broadcasting does the rest.',
      'np.maximum(0, x) is the idiom (np.where(x > 0, x, 0) also works). Note that np.max is a reduction, not an element-wise maximum.',
      "Don't write a Python loop or modify x in place (x[x < 0] = 0 changes the caller's array).",
    ],
    solution: `import numpy as np

def relu(x: np.ndarray) -> np.ndarray:
    """
    Apply the ReLU activation element-wise.

    Returns:
        Array of the same shape and dtype with max(0, x) applied element-wise
    """
    # np.maximum is element-wise and broadcasts the scalar 0; it returns a new array
    return np.maximum(0, x)

# Time O(n), space O(n) for the output.
`,
  },
  {
    id: 'neural-network-forward',
    title: 'Dense Layer Forward Pass (ReLU)',
    section: 'deep-learning',
    difficulty: 'medium',
    description: `
## Dense Layer Forward Pass (ReLU)

### What you'll build
The forward pass of one fully-connected (dense) layer with a ReLU activation, for a whole batch at once: \`dense_forward(X, W, b) = relu(X @ W + b)\`.

### Background
A dense layer is the basic unit of an MLP and of the feed-forward block inside every transformer. Each output unit computes a weighted sum of all inputs plus a bias, then a non-linearity. Processing a batch as one matrix product, instead of looping over examples, is what makes it fast on modern hardware.

### Formula
\`\`\`text
Z   = X @ W + b        # (batch, in_dim) @ (in_dim, out_dim) -> (batch, out_dim); b broadcasts over rows
out = max(0, Z)        # ReLU, element-wise
\`\`\`
- \`X\`: inputs, one example per row
- \`W\`: weights; column \`j\` holds the weights of output unit \`j\`
- \`b\`: one bias per output unit, added to every row

### Inputs
- \`X\`: array of shape \`(batch, in_dim)\`
- \`W\`: array of shape \`(in_dim, out_dim)\`
- \`b\`: array of shape \`(out_dim,)\`

### Expected return format
An array of shape \`(batch, out_dim)\` holding \`relu(X @ W + b)\`.

### Edge cases and conventions
- This uses the \`X @ W\` layout (weights stored as \`(in_dim, out_dim)\`). PyTorch's \`nn.Linear\` stores \`weight\` as \`(out_dim, in_dim)\` and computes \`X @ weight.T + bias\`.
- Pre-activations that are exactly 0 or negative give 0.

### Constraints
Use one matrix product for the whole batch (no loops over rows); NumPy only.

### Follow-up
- How many parameters does this layer have (\`in_dim * out_dim + out_dim\`), and what does the forward pass cost (\`batch * in_dim * out_dim\` multiply-adds)?
- Write the backward pass: given \`dOut\`, what are \`dW\`, \`db\` and \`dX\`? (Done in MLP Forward & Backward Pass.)
    `,
    examples: [
      {
        input: 'dense_forward(np.array([[1, 2]]), np.array([[1, 0], [0, 1]]), np.array([1, 1]))',
        output: '[[2, 3]]',
        explanation: 'X @ W = [[1, 2]] (identity weights), + b = [[2, 3]], and ReLU keeps positive values.',
      },
      {
        input: 'dense_forward(np.array([[1.0, -1.0], [0.5, 2.0]]), np.array([[1.0, -2.0, 0.5], [0.5, 1.0, -1.0]]), np.array([0.0, 0.5, -0.5]))',
        output: '[[0.5, 0.0, 1.0], [1.5, 1.5, 0.0]]',
        explanation: 'Z = [[0.5, -2.5, 1.0], [1.5, 1.5, -2.25]]; ReLU zeroes the two negative pre-activations.',
      },
    ],
    starterCode: `import numpy as np

def dense_forward(X: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Forward pass of a dense layer with ReLU activation: relu(X @ W + b).

    Args:
        X: Inputs, shape (batch, in_dim)
        W: Weights, shape (in_dim, out_dim)
        b: Bias, shape (out_dim,)

    Returns:
        Activations, shape (batch, out_dim)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic forward pass',
        input: '([[1, 2]], [[1, 0], [0, 1]], [1, 1])',
        expected: '[[2, 3]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative pre-activation',
        input: '([[1, 1]], [[1, -2], [-1, 1]], [0, 0])',
        expected: '[[0, 0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Batch of 2',
        input: '([[1, 0], [0, 1]], [[2, 0], [0, 2]], [0, 0])',
        expected: '[[2, 0], [0, 2]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Output shape is (batch, out_dim)',
        input: 'dense_forward(np.ones((4, 3)), np.ones((3, 5)), np.zeros(5)).shape',
        expected: '(4, 5)',
        hidden: true,
      },
      {
        id: '5',
        description: 'ReLU clips negative pre-activations',
        input: 'dense_forward(np.array([[1, 1]]), np.array([[-3, 2], [-3, 2]]), np.array([0, 0])).tolist()',
        expected: '[[0, 4]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Bias is added to every row',
        input: 'dense_forward(np.zeros((1, 2)), np.ones((2, 2)), np.array([3, -1])).tolist()',
        expected: '[[3.0, 0.0]]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Non-square float weights (2x2 @ 2x3)',
        input: 'dense_forward(np.array([[1.0, -1.0], [0.5, 2.0]]), np.array([[1.0, -2.0, 0.5], [0.5, 1.0, -1.0]]), np.array([0.0, 0.5, -0.5])).tolist()',
        expected: '[[0.5, 0.0, 1.0], [1.5, 1.5, 0.0]]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Random batch matches relu(X @ W + b)',
        input: '(lambda: (X := np.random.randn(5, 4), W := np.random.randn(4, 3), b := np.random.randn(3), bool(np.allclose(dense_forward(X, W, b), np.maximum(X @ W + b, 0))))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Two stages: an affine map (weighted sums plus bias), then the non-linearity.',
      'Check the shapes: (batch, in_dim) @ (in_dim, out_dim) gives (batch, out_dim), and b of shape (out_dim,) broadcasts across the rows.',
      'Z = X @ W + b (or np.dot(X, W) + b), then np.maximum(0, Z).',
      "Don't write W @ X or loop over the batch; and don't forget the ReLU: a plain linear layer fails the tests with negative pre-activations.",
    ],
    solution: `import numpy as np

def dense_forward(X: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Forward pass of a dense layer with ReLU activation: relu(X @ W + b).

    Returns:
        Activations, shape (batch, out_dim)
    """
    Z = X @ W + b            # (batch, out_dim); b broadcasts over the batch
    return np.maximum(0, Z)  # ReLU

# Time O(batch * in_dim * out_dim), space O(batch * out_dim).
`,
  },
  {
    id: 'backpropagation',
    title: 'Numerically Stable Softmax',
    section: 'deep-learning',
    difficulty: 'medium',
    description: `
## Numerically Stable Softmax

### What you'll build
The softmax function for a 1-D vector of scores (logits), implemented so it never overflows: \`softmax(x)\` returns a probability vector of the same length.

### Background
Classifiers and language models output unnormalised scores. Softmax turns them into a probability distribution: every output is positive, they sum to 1, and larger scores get larger probabilities. Done naively, \`np.exp(1000)\` overflows to \`inf\` and the result is \`nan\`. The fix is a one-line identity that every interviewer expects you to know.

### Formula
\`\`\`text
softmax(x)_i = exp(x_i) / sum_j exp(x_j)

Shift invariance: softmax(x - c) = softmax(x) for any constant c, because exp(-c) cancels.
Choose c = max(x): the largest exponent becomes exp(0) = 1, so nothing overflows,
and the denominator is at least 1, so nothing divides by zero.
\`\`\`

### Inputs
- \`x\`: 1-D NumPy array of length \`n >= 1\` (ints or floats, possibly very large or very negative).

### Expected return format
A 1-D float array of length \`n\` with positive entries summing to 1.

### Edge cases and conventions
- Equal inputs give the uniform distribution \`1/n\`.
- \`softmax([100, 101, 102])\` equals \`softmax([1, 2, 3])\` (shift invariance), and \`softmax([1000, 1001, 1002])\` must not produce \`nan\`.
- Very negative entries may get probabilities that are tiny but still positive.

### Constraints
NumPy only; vectorised, no loops.

### Follow-up
- Generalise to a batch: \`softmax(X, axis=-1)\`, using \`keepdims=True\` for the max and the sum.
- The Jacobian is \`diag(p) - p pᵀ\`; combined with cross-entropy, the gradient with respect to the logits is simply \`p - y\` (used in MLP Forward & Backward Pass).
- Log-softmax: \`x - max(x) - log(sum(exp(x - max(x))))\` is more stable than \`log(softmax(x))\` (used in Masked Cross-Entropy with Label Smoothing).
    `,
    examples: [
      {
        input: 'softmax(np.array([1.0, 2.0, 3.0]))',
        output: '[0.09, 0.2447, 0.6652] (rounded to 4 decimals)',
        explanation: 'exp([1, 2, 3]) = [2.718, 7.389, 20.086], divided by their sum 30.193.',
      },
      {
        input: 'softmax(np.array([1000.0, 1001.0, 1002.0]))',
        output: '[0.09, 0.2447, 0.6652] (rounded to 4 decimals)',
        explanation: 'Shifting by max(x) = 1002 gives exp([-2, -1, 0]); the naive version computes inf / inf = nan.',
      },
    ],
    starterCode: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """
    Numerically stable softmax of a 1-D vector.

    Args:
        x: Scores (logits), 1-D array of length n

    Returns:
        Probabilities, 1-D float array of length n (positive, sums to 1)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic softmax',
        input: 'bool(np.allclose(softmax(np.array([1, 2, 3])), [0.090031, 0.244728, 0.665241], atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Equal inputs give the uniform distribution',
        input: 'bool(np.allclose(softmax(np.array([1, 1, 1])), [0.333333, 0.333333, 0.333333], atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Shift invariance with large values',
        input: 'bool(np.allclose(softmax(np.array([100, 101, 102])), [0.090031, 0.244728, 0.665241], atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Values with negatives, rounded to 4 decimals',
        input: 'np.round(softmax(np.array([2, 5, -1, 0.5])), 4).tolist()',
        expected: '[0.0468, 0.9404, 0.0023, 0.0104]',
        hidden: true,
      },
      {
        id: '5',
        description: 'All outputs positive for very negative inputs',
        input: 'bool(np.all(softmax(np.array([-10, -20, -30])) > 0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Single dominant value gets the highest probability',
        input: 'int(np.argmax(softmax(np.array([0, 0, 10, 0]))))',
        expected: '2',
        hidden: true,
      },
      {
        id: '7',
        description: 'No overflow with very large values',
        input: '(lambda: (p := softmax(np.array([1000.0, 1001.0, 1002.0])), bool(np.all(np.isfinite(p))), np.round(p, 4).tolist())[1:])()',
        expected: '(True, [0.09, 0.2447, 0.6652])',
        hidden: true,
      },
      {
        id: '8',
        description: 'Random scores: sums to 1 and matches the reference',
        input: '(lambda: (x := np.random.randn(6) * 10, p := softmax(x), (round(float(p.sum()), 6), bool(np.allclose(p, np.exp(x) / np.exp(x).sum()))))[-1])()',
        expected: '(1.0, True)',
        hidden: true,
      },
    ],
    hints: [
      'Softmax has two jobs: make every score positive and make them sum to 1. Which function does each job?',
      'Before exponentiating, subtract a constant from every score; the constant cancels between numerator and denominator.',
      'Exponentiate x - np.max(x) with np.exp, then divide by np.sum of the result.',
      'Without the max-shift, np.exp(1000) is inf and inf / inf is nan. Use np.max (the reduction), not np.maximum.',
    ],
    solution: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """
    Numerically stable softmax of a 1-D vector.

    Returns:
        Probabilities, 1-D float array of length n (positive, sums to 1)
    """
    # Shift so the largest score is 0: exp never overflows, and the sum is >= 1
    exp_x = np.exp(x - np.max(x))
    return exp_x / np.sum(exp_x)

# Time O(n), space O(n).
`,
  },
];
