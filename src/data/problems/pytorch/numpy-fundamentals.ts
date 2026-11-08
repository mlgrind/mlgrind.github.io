import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../numpy-fundamentals.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const numpyFundamentalsPyTorch: Record<string, LanguageVariant> = {
  'numpy-array-creation': {
    note: 'Use the torch constructors (torch.zeros, torch.ones, torch.arange, torch.linspace, torch.eye), not torch.tensor of hand-typed lists. torch.linspace needs the number of steps explicitly.',
    starterCode: `import torch

def create_arrays() -> dict:
    """
    Create five tensors with torch constructors.

    Returns:
        dict with keys:
            'zeros':    (3, 4) tensor of 0.0
            'ones':     (2, 3) tensor of 1.0
            'arange':   integers 0..9, shape (10,)
            'linspace': 5 evenly spaced values from 0 to 1 inclusive
            'eye':      (4, 4) identity matrix
    """
    # Your code here
    pass
`,
    solution: `import torch

def create_arrays() -> dict:
    """
    Returns:
        dict with 'zeros' (3, 4), 'ones' (2, 3), 'arange' 0..9,
        'linspace' [0, 0.25, 0.5, 0.75, 1] and 'eye' (4, 4).
    """
    return {
        'zeros': torch.zeros(3, 4),          # sizes as separate args (a tuple works too)
        'ones': torch.ones(2, 3),
        'arange': torch.arange(10),          # half-open, int64
        'linspace': torch.linspace(0, 1, 5), # closed, float32
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
      {
        id: '6',
        description: 'Zeros and eye shapes',
        input: '(lambda r: (tuple(r["zeros"].shape), tuple(r["eye"].shape)))(create_arrays())',
        expected: '((3, 4), (4, 4))',
        hidden: true,
      },
    ],
    hints: [
      'Each key maps to exactly one torch constructor. Does it need a size, or a range of values?',
      'Size-based: torch.zeros, torch.ones, torch.eye. Range-based: torch.arange (by step) and torch.linspace (by count).',
      'torch.zeros(3, 4) accepts the sizes as separate arguments or as a tuple; torch.arange(10) gives 0..9 as int64; torch.linspace(0, 1, 5) includes both endpoints.',
      'Pitfall: torch.arange excludes its end value while torch.linspace includes it. torch.arange(10) is int64, so cast with .float() before mixing it with float tensors in later problems.',
    ],
  },

  'numpy-indexing': {
    note: 'Tensors support the same slicing as NumPy except negative steps: arr[::-1] raises an error, so use torch.flip.',
    starterCode: `import torch

def advanced_indexing(arr: torch.Tensor) -> dict:
    """
    Select parts of a 2D tensor with indexing and slicing.

    Args:
        arr: 2D tensor of shape (n_rows, n_cols), n_rows >= 3 and n_cols >= 3

    Returns:
        dict with keys:
            'row_1':    second row, shape (n_cols,)
            'col_2':    third column, shape (n_rows,)
            'subarray': rows 1-2, columns 2-4 (arr[1:3, 2:5])
            'diagonal': main diagonal, shape (min(n_rows, n_cols),)
            'reversed': arr with its rows in reverse order
    """
    # Your code here
    pass
`,
    solution: `import torch

def advanced_indexing(arr: torch.Tensor) -> dict:
    """
    Returns:
        dict with 'row_1', 'col_2', 'subarray', 'diagonal' and 'reversed'.
    """
    return {
        'row_1': arr[1],                          # one index -> 1D row
        'col_2': arr[:, 2],                       # all rows, column 2
        'subarray': arr[1:3, 2:5],                # half-open: rows 1-2, columns 2-4
        'diagonal': torch.diag(arr),              # arr[i, i] for i < min(n_rows, n_cols)
        'reversed': torch.flip(arr, dims=[0]),    # tensors don't allow arr[::-1]
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
      {
        id: '6',
        description: 'Wide 3 x 6 tensor: diagonal, subarray and reversed rows',
        input: '(lambda r: (r["diagonal"].tolist(), r["subarray"].tolist(), r["reversed"][:, 0].tolist()))(advanced_indexing(torch.arange(18).reshape(3, 6)))',
        expected: '([0, 7, 14], [[8, 9, 10], [14, 15, 16]], [12, 6, 0])',
        hidden: true,
      },
    ],
    hints: [
      'Think of each request as "which rows?" and "which columns?". A colon means "all of them".',
      'The row and the column are single integer indices; the sub-block is a pair of slices; reversing the rows needs a dedicated function in torch.',
      'arr[1], arr[:, 2], arr[1:3, 2:5], torch.diag(arr) and torch.flip(arr, dims=[0]).',
      'Pitfall: slice ends are exclusive (rows 1-2 are 1:3), and arr[::-1] raises a ValueError for tensors because torch has no negative strides.',
    ],
  },

  'numpy-broadcasting': {
    note: 'Reductions take dim= and keepdim= (instead of axis= and keepdims=). Use broadcasting, not .expand, .repeat or loops.',
    starterCode: `import torch

def broadcasting_ops(arr: torch.Tensor, bias: torch.Tensor, scale: torch.Tensor) -> dict:
    """
    Four independent broadcasting operations on arr.

    Args:
        arr:   2D float tensor of shape (m, n), e.g. (3, 4)
        bias:  1D tensor of shape (n,)
        scale: 2D tensor of shape (m, 1)

    Returns:
        dict with keys (each computed from the original arr, shape (m, n)):
            'row_centered': arr minus each row's mean
            'col_centered': arr minus each column's mean
            'biased':       arr + bias (bias added to every row)
            'scaled':       arr * scale (row i multiplied by scale[i, 0])
    """
    # Your code here
    pass
`,
    solution: `import torch

def broadcasting_ops(arr: torch.Tensor, bias: torch.Tensor, scale: torch.Tensor) -> dict:
    """
    Returns:
        dict with 'row_centered', 'col_centered', 'biased' and 'scaled',
        each of shape (m, n) and computed from the original arr.
    """
    # (m, n) - (m, 1): keepdim keeps the row means as a column
    row_centered = arr - arr.mean(dim=1, keepdim=True)

    # (m, n) - (n,): the column means line up with the last dim
    col_centered = arr - arr.mean(dim=0)

    # (m, n) + (n,): bias[j] is added to column j of every row
    biased = arr + bias

    # (m, n) * (m, 1): row i is multiplied by scale[i, 0]
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
      {
        id: '5',
        description: 'Square matrix: row means subtracted along the right dim',
        input: '(lambda r: (r["row_centered"].tolist(), r["col_centered"].tolist()))(broadcasting_ops(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), torch.zeros(2), torch.ones(2, 1)))',
        expected: '([[-0.5, 0.5], [-0.5, 0.5]], [[-1.0, -1.0], [1.0, 1.0]])',
        hidden: true,
      },
    ],
    hints: [
      "Each output is one arithmetic operation between arr and a smaller tensor. Work out the smaller tensor's shape first.",
      'Row statistics need one value per row, shape (m, 1); column statistics need one value per column, shape (n,). bias and scale already broadcast.',
      'arr.mean(dim=1, keepdim=True) gives an (m, 1) column; arr.mean(dim=0) gives the (n,) column means. Then plain -, + and * do the rest.',
      'Pitfall: without keepdim=True the row means have shape (m,). On a square matrix that broadcasts along the wrong dim with no error.',
    ],
  },

  'numpy-aggregations': {
    note: 'torch.std is unbiased (divides by N - 1) by default: pass unbiased=False (or correction=0) to match np.std. Convert the flat argmax to (row, col) yourself.',
    starterCode: `import torch

def compute_aggregations(arr: torch.Tensor) -> dict:
    """
    Global, row-wise and column-wise statistics of a 2D tensor.

    Args:
        arr: 2D float tensor of shape (n_rows, n_cols)

    Returns:
        dict with keys:
            'global_mean', 'global_std' (population, unbiased=False),
            'global_min', 'global_max', 'global_sum':   scalars
            'row_mean', 'row_sum':                      shape (n_rows,)
            'col_mean', 'col_sum':                      shape (n_cols,)
            'argmax', 'argmin':                         (row, col) tuples of ints
    """
    # Your code here
    pass
`,
    solution: `import torch

def compute_aggregations(arr: torch.Tensor) -> dict:
    """
    Returns:
        dict with global scalars, row-wise (n_rows,) and column-wise (n_cols,)
        means and sums, and (row, col) tuples for 'argmax' and 'argmin'.
    """
    n_cols = arr.shape[1]
    # argmax/argmin return a flat index; divmod turns it into (row, col)
    flat_max = arr.argmax().item()
    flat_min = arr.argmin().item()
    return {
        'global_mean': arr.mean(),
        'global_std': arr.std(unbiased=False),  # population std, like np.std
        'global_min': arr.min(),
        'global_max': arr.max(),
        'global_sum': arr.sum(),
        'row_mean': arr.mean(dim=1),            # collapse the columns
        'row_sum': arr.sum(dim=1),
        'col_mean': arr.mean(dim=0),            # collapse the rows
        'col_sum': arr.sum(dim=0),
        'argmax': divmod(flat_max, n_cols),
        'argmin': divmod(flat_min, n_cols),
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
      {
        id: '6',
        description: 'Row means, column sums, min/max and ties',
        input: '(lambda r: (r["row_mean"].tolist(), r["col_sum"].tolist(), float(r["global_min"]), float(r["global_max"]), tuple(int(i) for i in r["argmax"])))(compute_aggregations(torch.tensor([[-3.0, 7.0, 7.0], [0.5, -3.0, 2.0]])))',
        expected: '([3.6666667461395264, -0.1666666716337204], [-2.5, 4.0, 9.0], -3.0, 7.0, (0, 1))',
        hidden: true,
      },
    ],
    hints: [
      'For each key, decide which dim should disappear: all of them (global), the columns (one value per row) or the rows (one value per column).',
      'Global stats take no dim; per-row stats use dim=1; per-column stats use dim=0. For the indices, find the flat position first, then split it into (row, col).',
      'arr.mean(), arr.std(unbiased=False), arr.sum(dim=1), arr.mean(dim=0); arr.argmax().item() gives the flat index, and divmod(idx, n_cols) gives (row, col).',
      'Pitfall: arr.std() divides by N - 1 by default, unlike np.std, so 1.8708 instead of 1.7078 for the example. Also, dim=0 gives one value per column, not per row.',
    ],
  },

  'numpy-reshape-transpose': {
    note: 'torch uses .view/.reshape, .T (2D), .permute(...) (np.transpose with an axis order) and .flatten(). .view only works on contiguous tensors, so flatten arr_2d, not its transpose.',
    starterCode: `import torch

def reshape_transpose(arr: torch.Tensor) -> dict:
    """
    Reshape, transpose and flatten a 24-element tensor.

    Args:
        arr: 1D tensor of 24 elements

    Returns:
        dict with keys:
            'arr_2d':            arr reshaped to (4, 6)
            'arr_3d':            arr reshaped to (2, 3, 4)
            'arr_2d_transposed': arr_2d transposed, shape (6, 4)
            'arr_3d_swapped':    arr_3d with dims reversed (2, 1, 0), shape (4, 3, 2)
            'arr_flat':          arr_2d flattened back to shape (24,)
    """
    # Your code here
    pass
`,
    solution: `import torch

def reshape_transpose(arr: torch.Tensor) -> dict:
    """
    Returns:
        dict with 'arr_2d' (4, 6), 'arr_3d' (2, 3, 4), 'arr_2d_transposed' (6, 4),
        'arr_3d_swapped' (4, 3, 2) and 'arr_flat' (24,).
    """
    arr_2d = arr.view(4, 6)                    # same row-major order, new grouping
    arr_3d = arr.view(2, 3, 4)
    arr_2d_t = arr_2d.T                        # out[j, i] = arr_2d[i, j]
    arr_3d_swapped = arr_3d.permute(2, 1, 0)   # out[k, j, i] = arr_3d[i, j, k]
    arr_flat = arr_2d.flatten()                # back to the original order

    return {
        'arr_2d': arr_2d,
        'arr_3d': arr_3d,
        'arr_2d_transposed': arr_2d_t,
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
      {
        id: '6',
        description: 'Different input values: 3D block and swapped shape',
        input: '(lambda r: (r["arr_3d"][1, 2].tolist(), tuple(r["arr_3d_swapped"].shape)))(reshape_transpose(torch.arange(100, 124)))',
        expected: '([120, 121, 122, 123], (4, 3, 2))',
        hidden: true,
      },
    ],
    hints: [
      'Two different things happen here: regrouping the same sequence into a new shape, and reordering which dim is which. Which key needs which?',
      'Use view/reshape for arr_2d and arr_3d, .T and .permute for the transposed keys, and flatten arr_2d at the end.',
      'arr.view(4, 6) (or reshape(4, -1)), arr.view(2, 3, 4), arr_2d.T, arr_3d.permute(2, 1, 0), arr_2d.flatten().',
      'Pitfall: view(6, 4) is not a transpose (wrong values, right shape). And .view on a permuted tensor raises an error because it is no longer contiguous; use .reshape or .contiguous() there.',
    ],
  },
};
