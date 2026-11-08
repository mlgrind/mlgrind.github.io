import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../deep-learning.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const deepLearningPyTorch: Record<string, LanguageVariant> = {
  'neural-network-forward': {
    note: 'Use the @ operator and broadcasting for the bias; apply ReLU with torch.clamp (no nn.Linear needed).',
    starterCode: `import torch

def dense_forward(X: torch.Tensor, W: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
    """
    Compute forward pass of a dense layer with ReLU activation.

    Args:
        X: Input of shape (batch_size, input_dim)
        W: Weights of shape (input_dim, output_dim)
        b: Bias of shape (output_dim,)

    Returns:
        Output of shape (batch_size, output_dim)
    """
    # Your code here
    pass
`,
    solution: `import torch

def dense_forward(X: torch.Tensor, W: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
    """
    Compute forward pass of a dense layer with ReLU activation.
    """
    # Linear transformation
    Z = X @ W + b
    # ReLU activation
    return torch.clamp(Z, min=0)
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
    ],
    hints: [
      'First compute the linear transformation: Z = X @ W + b',
      'Then apply ReLU: torch.clamp(Z, min=0)',
    ],
  },
  'perceptron': {
    note: "Implement it with tensor ops (torch.clamp or torch.where); don't call torch.relu, F.relu or nn.ReLU. A hidden test compares your output with F.relu.",
    starterCode: `import torch

def relu(x: torch.Tensor) -> torch.Tensor:
    """
    Apply ReLU activation function.

    Args:
        x: Input tensor of any shape

    Returns:
        Tensor with ReLU applied element-wise
    """
    # Your code here
    pass
`,
    solution: `import torch

def relu(x: torch.Tensor) -> torch.Tensor:
    """
    Apply ReLU activation function.
    """
    return torch.clamp(x, min=0)
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
      'torch.clamp(x, min=0) keeps positive values and sets negative ones to 0.',
      'torch.where(x > 0, x, torch.zeros_like(x)) works too.',
    ],
  },
  'backpropagation': {
    note: "Implement it with torch.exp and reductions; don't call torch.softmax, F.softmax or nn.Softmax. A hidden test compares your output with F.softmax.",
    starterCode: `import torch

def softmax(x: torch.Tensor) -> torch.Tensor:
    """
    Compute softmax probabilities.

    Args:
        x: Input tensor (1D)

    Returns:
        Tensor of same shape with softmax probabilities
    """
    # Your code here
    # Hint: subtract max for numerical stability
    pass
`,
    solution: `import torch

def softmax(x: torch.Tensor) -> torch.Tensor:
    """
    Compute softmax probabilities.
    """
    # Subtract max for numerical stability
    x_shifted = x - x.max()
    exp_x = torch.exp(x_shifted)
    return exp_x / exp_x.sum()
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
      'Subtract x.max() for numerical stability.',
      'Compute torch.exp of the shifted tensor.',
      'Divide by its .sum().',
    ],
  },
};
