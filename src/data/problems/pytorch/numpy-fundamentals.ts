import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../numpy-fundamentals.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const numpyFundamentalsPyTorch: Record<string, LanguageVariant> = {
  'numpy-array-creation': {
    note: 'Use the torch creation functions: torch.zeros, torch.ones, torch.arange, torch.linspace, torch.eye.',
    starterCode: `import torch

def create_arrays() -> dict:
    """
    Create various tensors.

    Returns:
        Dictionary with keys: zeros, ones, arange, linspace, eye
    """
    # Your code here
    pass
`,
    solution: `import torch

def create_arrays() -> dict:
    return {
        'zeros': torch.zeros(3, 4),
        'ones': torch.ones(2, 3),
        'arange': torch.arange(10),
        'linspace': torch.linspace(0, 1, 5),
        'eye': torch.eye(4),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Zeros shape correct',
        input: 'tuple(create_arrays()["zeros"].shape)',
        expected: '(3, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Linspace values',
        input: 'create_arrays()["linspace"].tolist()',
        expected: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Arange values',
        input: 'create_arrays()["arange"].tolist()',
        expected: '[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Eye is identity',
        input: 'bool(torch.equal(create_arrays()["eye"], torch.eye(4)))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Ones and zeros have the right values',
        input: 'create_arrays()["ones"].tolist() + create_arrays()["zeros"][0].tolist()',
        expected: '[[1.0, 1.0, 1.0], [1.0, 1.0, 1.0], 0.0, 0.0, 0.0, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      'torch.zeros(3, 4) takes the sizes as separate arguments (a tuple works too)',
      'torch.linspace(start, end, steps) includes both endpoints',
      'torch.eye(n) creates an identity matrix',
    ],
  },

  'numpy-indexing': {
    note: 'Tensors support the same slicing as NumPy, except negative steps: use torch.flip instead of arr[::-1].',
    starterCode: `import torch

def advanced_indexing(arr: torch.Tensor) -> dict:
    """
    Perform advanced indexing operations.

    Args:
        arr: 2D input tensor

    Returns:
        Dictionary with indexed results
    """
    # Your code here
    pass
`,
    solution: `import torch

def advanced_indexing(arr: torch.Tensor) -> dict:
    return {
        'row_1': arr[1],
        'col_2': arr[:, 2],
        'subarray': arr[1:3, 2:5],
        'diagonal': torch.diag(arr),
        'reversed': torch.flip(arr, dims=[0]),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Row extraction',
        input: 'advanced_indexing(torch.arange(20).reshape(4, 5))["row_1"].tolist()',
        expected: '[5, 6, 7, 8, 9]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Subarray correct',
        input: 'advanced_indexing(torch.arange(20).reshape(4, 5))["subarray"].tolist()',
        expected: '[[7, 8, 9], [12, 13, 14]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Column extraction',
        input: 'advanced_indexing(torch.arange(20).reshape(4, 5))["col_2"].tolist()',
        expected: '[2, 7, 12, 17]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Diagonal',
        input: 'advanced_indexing(torch.arange(20).reshape(4, 5))["diagonal"].tolist()',
        expected: '[0, 6, 12, 18]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Rows reversed',
        input: 'advanced_indexing(torch.arange(20).reshape(4, 5))["reversed"][:, 0].tolist()',
        expected: '[15, 10, 5, 0]',
        hidden: true,
      },
    ],
    hints: [
      'arr[1] gets row 1, arr[:, 2] gets column 2',
      'arr[1:3, 2:5] gets a subarray',
      'torch.diag(arr) extracts the main diagonal',
      'torch.flip(arr, dims=[0]) reverses the rows (arr[::-1] raises an error for tensors)',
    ],
  },

  'numpy-broadcasting': {
    note: 'Reductions take dim= and keepdim= (instead of axis= and keepdims=).',
    starterCode: `import torch

def broadcasting_ops(arr: torch.Tensor, bias: torch.Tensor, scale: torch.Tensor) -> dict:
    """
    Perform broadcasting operations.

    Args:
        arr: 2D float tensor of shape (3, 4)
        bias: 1D tensor of shape (4,)
        scale: 2D tensor of shape (3, 1)

    Returns:
        Dictionary with results of broadcasting operations
    """
    # Your code here
    pass
`,
    solution: `import torch

def broadcasting_ops(arr: torch.Tensor, bias: torch.Tensor, scale: torch.Tensor) -> dict:
    # Row centered: subtract mean of each row
    row_means = arr.mean(dim=1, keepdim=True)  # (3, 1)
    row_centered = arr - row_means

    # Column centered: subtract mean of each column
    col_means = arr.mean(dim=0)  # (4,)
    col_centered = arr - col_means

    # Add bias to each row: (4,) broadcasts to (3, 4)
    biased = arr + bias

    # Scale each row: (3, 1) broadcasts to (3, 4)
    scaled = arr * scale

    return {
        'row_centered': row_centered,
        'col_centered': col_centered,
        'biased': biased,
        'scaled': scaled,
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Row centering',
        input: 'broadcasting_ops(torch.arange(1, 13).float().reshape(3, 4), torch.zeros(4), torch.ones(3, 1))["row_centered"].tolist()',
        expected: '[[-1.5, -0.5, 0.5, 1.5], [-1.5, -0.5, 0.5, 1.5], [-1.5, -0.5, 0.5, 1.5]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Bias addition',
        input: 'broadcasting_ops(torch.arange(1, 13).float().reshape(3, 4), torch.tensor([1.0, 2.0, 3.0, 4.0]), torch.ones(3, 1))["biased"].tolist()',
        expected: '[[2.0, 4.0, 6.0, 8.0], [6.0, 8.0, 10.0, 12.0], [10.0, 12.0, 14.0, 16.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Column centering',
        input: 'broadcasting_ops(torch.arange(1, 13).float().reshape(3, 4), torch.zeros(4), torch.ones(3, 1))["col_centered"].tolist()',
        expected: '[[-4.0, -4.0, -4.0, -4.0], [0.0, 0.0, 0.0, 0.0], [4.0, 4.0, 4.0, 4.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Row scaling',
        input: 'broadcasting_ops(torch.arange(1, 13).float().reshape(3, 4), torch.zeros(4), torch.tensor([[1.0], [2.0], [3.0]]))["scaled"].tolist()',
        expected: '[[1.0, 2.0, 3.0, 4.0], [10.0, 12.0, 14.0, 16.0], [27.0, 30.0, 33.0, 36.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Row means: arr.mean(dim=1, keepdim=True) has shape (3, 1)',
      'Column means: arr.mean(dim=0) has shape (4,)',
      'Bias shape (4,) broadcasts with arr shape (3, 4)',
      'Scale shape (3, 1) broadcasts with arr shape (3, 4)',
    ],
  },

  'numpy-aggregations': {
    note: 'torch.std is unbiased by default; pass unbiased=False to match NumPy. Tensors have no unravel_index helper: convert the flat argmax yourself.',
    starterCode: `import torch

def compute_aggregations(arr: torch.Tensor) -> dict:
    """
    Compute aggregation statistics.

    Args:
        arr: 2D float tensor

    Returns:
        Dictionary with aggregation results
    """
    # Your code here
    pass
`,
    solution: `import torch

def compute_aggregations(arr: torch.Tensor) -> dict:
    n_cols = arr.shape[1]
    flat_max = arr.argmax().item()
    flat_min = arr.argmin().item()
    return {
        'global_mean': arr.mean(),
        'global_std': arr.std(unbiased=False),  # population std, like np.std
        'global_min': arr.min(),
        'global_max': arr.max(),
        'global_sum': arr.sum(),
        'row_mean': arr.mean(dim=1),
        'row_sum': arr.sum(dim=1),
        'col_mean': arr.mean(dim=0),
        'col_sum': arr.sum(dim=0),
        'argmax': (flat_max // n_cols, flat_max % n_cols),
        'argmin': (flat_min // n_cols, flat_min % n_cols),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Global mean',
        input: 'compute_aggregations(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]))["global_mean"]',
        expected: '3.5',
        hidden: false,
      },
      {
        id: '2',
        description: 'Row sums',
        input: 'compute_aggregations(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]))["row_sum"].tolist()',
        expected: '[6.0, 15.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Column means',
        input: 'compute_aggregations(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]))["col_mean"].tolist()',
        expected: '[2.5, 3.5, 4.5]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Population standard deviation',
        input: 'round(float(compute_aggregations(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]))["global_std"]), 4)',
        expected: '1.7078',
        hidden: true,
      },
      {
        id: '5',
        description: '2D argmax and argmin',
        input: '(lambda r: (tuple(int(i) for i in r["argmax"]), tuple(int(i) for i in r["argmin"])))(compute_aggregations(torch.tensor([[3.0, 9.0, 1.0], [4.0, 0.0, 6.0]])))',
        expected: '((0, 1), (1, 1))',
        hidden: true,
      },
    ],
    hints: [
      'arr.mean() computes the global mean; arr.mean(dim=0) the column means',
      'arr.std(unbiased=False) matches np.std',
      'arr.argmax() gives the index in the flattened tensor: row = idx // n_cols, col = idx % n_cols',
    ],
  },

  'numpy-reshape-transpose': {
    note: 'torch uses .view/.reshape, .T, .permute(...) (the equivalent of np.transpose with axes) and .flatten().',
    starterCode: `import torch

def reshape_transpose(arr: torch.Tensor) -> dict:
    """
    Perform reshape and transpose operations.

    Args:
        arr: 1D tensor of 24 elements

    Returns:
        Dictionary with reshaped tensors
    """
    # Your code here
    pass
`,
    solution: `import torch

def reshape_transpose(arr: torch.Tensor) -> dict:
    # 2D reshape
    arr_2d = arr.view(4, 6)

    # 3D reshape
    arr_3d = arr.view(2, 3, 4)

    # Transpose 2D
    arr_2d_T = arr_2d.T

    # Reverse the axes of the 3D tensor
    arr_3d_swapped = arr_3d.permute(2, 1, 0)

    # Flatten
    arr_flat = arr_2d.flatten()

    return {
        'arr_2d': arr_2d,
        'arr_3d': arr_3d,
        'arr_2d_transposed': arr_2d_T,
        'arr_3d_swapped': arr_3d_swapped,
        'arr_flat': arr_flat,
    }
`,
    testCases: [
      {
        id: '1',
        description: '2D reshape shape',
        input: 'tuple(reshape_transpose(torch.arange(24))["arr_2d"].shape)',
        expected: '(4, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: '3D reshape shape',
        input: 'tuple(reshape_transpose(torch.arange(24))["arr_3d"].shape)',
        expected: '(2, 3, 4)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Transposed values',
        input: 'reshape_transpose(torch.arange(24))["arr_2d_transposed"][:2].tolist()',
        expected: '[[0, 6, 12, 18], [1, 7, 13, 19]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Axes reversed on the 3D tensor',
        input: 'reshape_transpose(torch.arange(24))["arr_3d_swapped"][:, 0, :].tolist()',
        expected: '[[0, 12], [1, 13], [2, 14], [3, 15]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Flattened back to the original order',
        input: 'reshape_transpose(torch.arange(24))["arr_flat"].tolist() == list(range(24))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'arr.view(4, 6) or arr.reshape(4, -1)',
      'arr.view(2, 3, 4) for 3D',
      '.T transposes a 2D tensor; .permute(2, 1, 0) reorders the axes of a 3D tensor',
      '.flatten() gives back a 1D tensor',
    ],
  },
};
