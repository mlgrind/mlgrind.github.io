import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../deep-learning.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const deepLearningPyTorch: Record<string, LanguageVariant> = {
  'neural-network-forward': {
    note: "Use the @ operator and broadcasting for the bias, then a ReLU (torch.clamp or torch.relu). Don't use nn.Linear or F.linear: W here is (in_dim, out_dim), the transpose of nn.Linear.weight.",
    starterCode: `import torch

def dense_forward(X: torch.Tensor, W: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
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
    solution: `import torch

def dense_forward(X: torch.Tensor, W: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
    """
    Forward pass of a dense layer with ReLU activation: relu(X @ W + b).

    Returns:
        Activations, shape (batch, out_dim)
    """
    Z = X @ W + b                 # (batch, out_dim); b broadcasts over the batch
    return torch.clamp(Z, min=0)  # ReLU

# Time O(batch * in_dim * out_dim), space O(batch * out_dim).
`,
    testCases: [
      {
        id: '1',
        description: 'Basic forward pass',
        input: 'dense_forward(torch.tensor([[1, 2]]), torch.tensor([[1, 0], [0, 1]]), torch.tensor([1, 1]))',
        expected: '[[2, 3]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative pre-activation',
        input: 'dense_forward(torch.tensor([[1, 1]]), torch.tensor([[1, -2], [-1, 1]]), torch.tensor([0, 0]))',
        expected: '[[0, 0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Batch of 2',
        input: 'dense_forward(torch.tensor([[1, 0], [0, 1]]), torch.tensor([[2, 0], [0, 2]]), torch.tensor([0, 0]))',
        expected: '[[2, 0], [0, 2]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Random float inputs match relu(X @ W + b)',
        input: `(lambda: (
    X := torch.randn(4, 3),
    W := torch.randn(3, 5),
    b := torch.randn(5),
    bool(torch.allclose(dense_forward(X, W, b), torch.relu(X @ W + b), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Non-square float weights (2x2 @ 2x3)',
        input: 'dense_forward(torch.tensor([[1.0, -1.0], [0.5, 2.0]]), torch.tensor([[1.0, -2.0, 0.5], [0.5, 1.0, -1.0]]), torch.tensor([0.0, 0.5, -0.5])).tolist()',
        expected: '[[0.5, 0.0, 1.0], [1.5, 1.5, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Two stages: an affine map (weighted sums plus bias), then the non-linearity.',
      'Shapes: (batch, in_dim) @ (in_dim, out_dim) -> (batch, out_dim); a bias of shape (out_dim,) broadcasts across the rows.',
      'Z = X @ W + b, then torch.clamp(Z, min=0) (or torch.relu(Z)).',
      "Don't use nn.Linear here: it stores its weight as (out_dim, in_dim) and computes X @ weight.T + bias.",
    ],
  },
  'perceptron': {
    note: "Implement it with tensor ops (torch.clamp or torch.where); don't call torch.relu, F.relu or nn.ReLU. A hidden test compares your output with F.relu.",
    starterCode: `import torch

def relu(x: torch.Tensor) -> torch.Tensor:
    """
    Apply the ReLU activation element-wise.

    Args:
        x: Input tensor of any shape

    Returns:
        Tensor of the same shape with max(0, x) applied element-wise
    """
    # Your code here
    pass
`,
    solution: `import torch

def relu(x: torch.Tensor) -> torch.Tensor:
    """
    Apply the ReLU activation element-wise.

    Returns:
        Tensor of the same shape with max(0, x) applied element-wise
    """
    # clamp is differentiable: gradient 1 where x > 0, 0 elsewhere
    return torch.clamp(x, min=0)

# Time O(n), space O(n).
`,
    testCases: [
      {
        id: '1',
        description: 'Mixed values',
        input: 'relu(torch.tensor([-2.0, -1.0, 0.0, 1.0, 2.0])).tolist()',
        expected: '[0.0, 0.0, 0.0, 1.0, 2.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'All negative',
        input: 'relu(torch.tensor([-5.0, -3.0, -1.0])).tolist()',
        expected: '[0.0, 0.0, 0.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Shape preserved and values correct (2D)',
        input: 'relu(torch.tensor([[-1.0, 2.0], [3.0, -4.0]])).tolist()',
        expected: '[[0.0, 2.0], [3.0, 0.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches F.relu on random input',
        input: '(lambda: (x := torch.randn(5, 7), bool(torch.equal(relu(x), torch.nn.functional.relu(x))))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gradient is 1 where x > 0 and 0 where x < 0',
        input: '(lambda: (x := torch.tensor([-1.5, 2.0, 3.0, -0.1], requires_grad=True), relu(x).sum().backward(), x.grad.tolist())[-1])()',
        expected: '[0.0, 1.0, 1.0, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      'ReLU acts on each element independently: compare every element with 0 at once.',
      'Keep the larger of x and 0, element-wise; broadcasting handles any shape.',
      'torch.clamp(x, min=0) is the idiom; torch.where(x > 0, x, torch.zeros_like(x)) also works.',
      "Avoid in-place edits like x[x < 0] = 0: they change the caller's tensor and can break autograd.",
    ],
  },
  'backpropagation': {
    note: "Implement it with torch.exp and reductions; don't call torch.softmax, F.softmax or nn.Softmax. A hidden test compares your output with F.softmax.",
    starterCode: `import torch

def softmax(x: torch.Tensor) -> torch.Tensor:
    """
    Numerically stable softmax of a 1-D tensor.

    Args:
        x: Scores (logits), 1-D float tensor of length n

    Returns:
        Probabilities, 1-D tensor of length n (positive, sums to 1)
    """
    # Your code here
    pass
`,
    solution: `import torch

def softmax(x: torch.Tensor) -> torch.Tensor:
    """
    Numerically stable softmax of a 1-D tensor.

    Returns:
        Probabilities, 1-D tensor of length n (positive, sums to 1)
    """
    # Shift so the largest score is 0: exp never overflows, and the sum is >= 1
    exp_x = torch.exp(x - x.max())
    return exp_x / exp_x.sum()

# Time O(n), space O(n).
`,
    testCases: [
      {
        id: '1',
        description: 'Basic softmax',
        input: 'bool(torch.allclose(softmax(torch.tensor([1.0, 2.0, 3.0])), torch.tensor([0.090031, 0.244728, 0.665241]), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Equal inputs',
        input: 'bool(torch.allclose(softmax(torch.tensor([1.0, 1.0, 1.0])), torch.tensor([0.333333, 0.333333, 0.333333]), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large values are shift-invariant',
        input: 'bool(torch.allclose(softmax(torch.tensor([100.0, 101.0, 102.0])), torch.tensor([0.090031, 0.244728, 0.665241]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Numerical stability with very large values',
        input: '(lambda: (p := softmax(torch.tensor([1000.0, 1001.0, 1002.0])), bool(torch.isfinite(p).all()) and round(p.sum().item(), 5))[-1])()',
        expected: '1.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Matches F.softmax on random input',
        input: '(lambda: (x := torch.randn(7) * 5, bool(torch.allclose(softmax(x), torch.nn.functional.softmax(x, dim=0), atol=1e-6)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Probabilities rounded to 4 decimals',
        input: '[round(v, 4) for v in softmax(torch.tensor([2.0, 5.0, -1.0, 0.5])).tolist()]',
        expected: '[0.0468, 0.9404, 0.0023, 0.0104]',
        hidden: true,
      },
    ],
    hints: [
      'Softmax has two jobs: make every score positive and make them sum to 1. Which op does each job?',
      'Subtract a constant from every score before exponentiating; it cancels between numerator and denominator.',
      'Exponentiate x - x.max() with torch.exp, then divide by the .sum() of the result.',
      'Without the max-shift, torch.exp(torch.tensor(1000.)) is inf and the result is nan.',
    ],
  },
};
