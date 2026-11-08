import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../python-basics.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const pythonBasicsPyTorch: Record<string, LanguageVariant> = {
  'numpy-array-sum': {
    note: 'Use torch.sum or the .sum() method, not a Python loop. Returning the 0-d tensor is fine: the tests read its value.',
    starterCode: `import torch

def array_sum(arr: torch.Tensor) -> float:
    """
    Calculate the sum of all elements in a tensor.

    Args:
        arr: tensor of numbers (any shape, at least one element)

    Returns:
        The sum of all elements (a 0-d tensor is fine)
    """
    # Your code here
    pass
`,
    solution: `import torch

def array_sum(arr: torch.Tensor) -> float:
    """
    Returns:
        The sum of all elements, as a 0-d tensor.
    """
    # No dim: reduce over every element, whatever the shape
    return torch.sum(arr)
`,
    testCases: [
      { id: '1', description: 'Basic positive numbers', input: 'array_sum(torch.tensor([1, 2, 3, 4, 5]))', expected: '15', hidden: false },
      { id: '2', description: 'With negatives', input: 'array_sum(torch.tensor([-1, 0, 1]))', expected: '0', hidden: false },
      { id: '3', description: 'Single element', input: 'array_sum(torch.tensor([42]))', expected: '42', hidden: false },
      { id: '4', description: 'Larger array', input: 'array_sum(torch.arange(1, 11))', expected: '55', hidden: true },
      { id: '5', description: 'Float values', input: 'array_sum(torch.tensor([0.5, 1.5, -1.0]))', expected: '1.0', hidden: true },
      { id: '6', description: 'Sums every element of a 2D tensor', input: 'array_sum(torch.tensor([[1, 2], [3, 4]]))', expected: '10', hidden: true },
    ],
    hints: [
      'This is a reduction: many values collapse into one. Tensors have a built-in for exactly that.',
      'Hand the whole tensor to a single torch call instead of visiting elements one at a time.',
      'torch.sum(arr) or arr.sum(); with no dim argument both add up every element and return a 0-d tensor.',
      "Pitfall: Python's built-in sum(arr) iterates over the first dim only, so on a 2D tensor it returns a 1D tensor of column sums, not a number.",
    ],
  },

  'numpy-matrix-multiply': {
    note: 'Use the @ operator, torch.matmul or torch.mm, not Python loops. A * B is elementwise, not a matrix product.',
    starterCode: `import torch

def matrix_multiply(A: torch.Tensor, B: torch.Tensor) -> torch.Tensor:
    """
    Multiply two matrices A and B.

    Args:
        A: First matrix of shape (m, n)
        B: Second matrix of shape (n, p)

    Returns:
        Matrix product A @ B of shape (m, p)
    """
    # Your code here
    pass
`,
    solution: `import torch

def matrix_multiply(A: torch.Tensor, B: torch.Tensor) -> torch.Tensor:
    """
    Returns:
        A @ B, shape (m, p).
    """
    # C[i, j] = sum_k A[i, k] * B[k, j]; same as torch.matmul(A, B) or torch.mm(A, B)
    return A @ B
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
      'Check the shapes first: (m, n) times (n, p). Which dimension disappears, and what shape is left?',
      'Each output entry is a row of A dotted with a column of B; torch computes all of them in one call.',
      'A @ B, torch.matmul(A, B) or torch.mm(A, B) (mm is 2D-only; matmul also handles batches).',
      'Pitfall: A * B multiplies elementwise. Also, torch refuses to multiply mixed dtypes (an int tensor @ a float tensor raises an error): cast with .float() first.',
    ],
  },

  'numpy-broadcast-add': {
    note: 'Tensors broadcast with the same rules as NumPy arrays: one + is enough. Don\'t use .expand, .repeat or loops.',
    starterCode: `import torch

def broadcast_add(matrix: torch.Tensor, vector: torch.Tensor) -> torch.Tensor:
    """
    Add a vector to each row of a matrix using broadcasting.

    Args:
        matrix: 2D tensor of shape (m, n)
        vector: 1D tensor of shape (n,)

    Returns:
        Tensor of shape (m, n) with result[i, j] = matrix[i, j] + vector[j]
    """
    # Your code here
    pass
`,
    solution: `import torch

def broadcast_add(matrix: torch.Tensor, vector: torch.Tensor) -> torch.Tensor:
    """
    Returns:
        matrix + vector, shape (m, n).
    """
    # (m, n) + (n,): the vector is treated as (1, n) and stretched over the rows
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
      'You want the same vector added to every row. Does torch need you to copy it m times?',
      'Line the shapes up from the right: (m, n) and (n,). They are compatible, so one arithmetic operator is enough.',
      'matrix + vector. torch treats the (n,) vector as (1, n) and stretches it over the m rows, exactly like NumPy.',
      'Pitfall: a vector of shape (m,) would line up with the columns, not the rows. Use vector.unsqueeze(1) (shape (m, 1)) if you ever need per-row values.',
    ],
  },
};
