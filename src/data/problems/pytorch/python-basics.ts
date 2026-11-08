import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../python-basics.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const pythonBasicsPyTorch: Record<string, LanguageVariant> = {
  'numpy-array-sum': {
    note: 'Use torch.sum or the .sum() method. A 0-d tensor result is fine (tests call .item() for you).',
    starterCode: `import torch

def array_sum(arr: torch.Tensor) -> float:
    """
    Calculate the sum of all elements in a tensor.

    Args:
        arr: A tensor of numbers

    Returns:
        The sum of all elements
    """
    # Your code here
    pass
`,
    solution: `import torch

def array_sum(arr: torch.Tensor) -> float:
    """
    Calculate the sum of all elements in a tensor.
    """
    return torch.sum(arr)
`,
    testCases: [
      { id: '1', description: 'Basic positive numbers', input: 'array_sum(torch.tensor([1, 2, 3, 4, 5]))', expected: '15', hidden: false },
      { id: '2', description: 'With negatives', input: 'array_sum(torch.tensor([-1, 0, 1]))', expected: '0', hidden: false },
      { id: '3', description: 'Single element', input: 'array_sum(torch.tensor([42]))', expected: '42', hidden: false },
      { id: '4', description: 'Larger array', input: 'array_sum(torch.arange(1, 11))', expected: '55', hidden: true },
      { id: '5', description: 'Float values', input: 'array_sum(torch.tensor([0.5, 1.5, -1.0]))', expected: '1.0', hidden: true },
    ],
    hints: [
      'Tensors have built-in reductions, just like NumPy arrays.',
      'Try torch.sum(arr) or arr.sum().',
    ],
  },

  'numpy-matrix-multiply': {
    note: 'Use torch.matmul, torch.mm or the @ operator, not Python loops.',
    starterCode: `import torch

def matrix_multiply(A: torch.Tensor, B: torch.Tensor) -> torch.Tensor:
    """
    Multiply two matrices A and B.

    Args:
        A: First matrix of shape (m, n)
        B: Second matrix of shape (n, p)

    Returns:
        Result matrix of shape (m, p)
    """
    # Your code here
    pass
`,
    solution: `import torch

def matrix_multiply(A: torch.Tensor, B: torch.Tensor) -> torch.Tensor:
    """
    Multiply two matrices A and B.
    """
    return A @ B
    # Alternatives: torch.matmul(A, B), torch.mm(A, B)
`,
    testCases: [
      {
        id: '1',
        description: '2x2 matrices',
        input: 'matrix_multiply(torch.tensor([[1, 2], [3, 4]]), torch.tensor([[5, 6], [7, 8]]))',
        expected: '[[19, 22], [43, 50]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Identity multiplication',
        input: 'matrix_multiply(torch.tensor([[1, 0], [0, 1]]), torch.tensor([[5, 6], [7, 8]]))',
        expected: '[[5, 6], [7, 8]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Different dimensions',
        input: 'matrix_multiply(torch.tensor([[1, 2, 3]]), torch.tensor([[1], [2], [3]]))',
        expected: '[[14]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Float matrices, non-square',
        input: 'matrix_multiply(torch.tensor([[1.0, 2.0], [0.5, -1.0], [0.0, 3.0]]), torch.tensor([[2.0, 0.0, 1.0], [1.0, 1.0, 0.0]]))',
        expected: '[[4.0, 2.0, 1.0], [0.0, -1.0, 0.5], [3.0, 3.0, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'PyTorch provides several ways to do matrix multiplication.',
      'Try torch.matmul(), torch.mm(), or the @ operator.',
    ],
  },

  'numpy-broadcast-add': {
    note: 'Tensors broadcast with the same rules as NumPy arrays.',
    starterCode: `import torch

def broadcast_add(matrix: torch.Tensor, vector: torch.Tensor) -> torch.Tensor:
    """
    Add a vector to each row of a matrix using broadcasting.

    Args:
        matrix: 2D tensor of shape (m, n)
        vector: 1D tensor of shape (n,)

    Returns:
        Result matrix of shape (m, n)
    """
    # Your code here
    pass
`,
    solution: `import torch

def broadcast_add(matrix: torch.Tensor, vector: torch.Tensor) -> torch.Tensor:
    """
    Add a vector to each row of a matrix using broadcasting.
    """
    return matrix + vector
`,
    testCases: [
      {
        id: '1',
        description: 'Basic broadcasting',
        input: 'broadcast_add(torch.tensor([[1, 2, 3], [4, 5, 6]]), torch.tensor([10, 20, 30]))',
        expected: '[[11, 22, 33], [14, 25, 36]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With zeros',
        input: 'broadcast_add(torch.tensor([[1, 2], [3, 4]]), torch.tensor([0, 0]))',
        expected: '[[1, 2], [3, 4]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Negative values',
        input: 'broadcast_add(torch.tensor([[1, 2], [3, 4]]), torch.tensor([-1, -2]))',
        expected: '[[0, 0], [2, 2]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Float values, 3 rows',
        input: 'broadcast_add(torch.ones(3, 2), torch.tensor([0.5, -1.0]))',
        expected: '[[1.5, 0.0], [1.5, 0.0], [1.5, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'PyTorch automatically broadcasts the vector across rows.',
      'Simply use the + operator.',
    ],
  },
};
