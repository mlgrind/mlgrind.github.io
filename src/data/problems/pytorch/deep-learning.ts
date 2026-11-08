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
};
