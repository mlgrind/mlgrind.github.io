import { Problem } from '../../types';

export const numpyFundamentalsProblems: Problem[] = [
  {
    id: 'numpy-array-creation',
    title: 'Array Creation Methods',
    section: 'numpy-fundamentals',
    difficulty: 'easy',
    description: `
## Array Creation Methods

### What you'll build
A function \`create_arrays()\` that builds five arrays with NumPy's constructors and returns them in a dictionary.

### Background
Almost every ML array starts life in one of these constructors: biases start as \`np.zeros\`, attention masks as \`np.ones\`, \`np.arange\` builds index and position vectors, \`np.linspace\` builds evenly spaced grids (learning-rate sweeps, plot axes, diffusion noise schedules), and \`np.eye\` gives identity matrices and one-hot rows. Knowing which one takes a **shape** and which takes a **range** saves a lot of debugging.

### Constructors
| Call | Result | Notes |
|------|--------|-------|
| \`np.zeros(shape)\` | all \`0.0\` | \`shape\` is a tuple, e.g. \`(3, 4)\`; dtype float64 |
| \`np.ones(shape)\` | all \`1.0\` | same shape convention |
| \`np.arange(stop)\` | \`0, 1, ..., stop - 1\` | half-open: \`stop\` is excluded; integer dtype for integer arguments |
| \`np.linspace(start, stop, num)\` | \`num\` evenly spaced values | closed: both endpoints included; step = \`(stop - start) / (num - 1)\` |
| \`np.eye(n)\` | \`n x n\` identity | 1.0 on the diagonal, 0.0 elsewhere |

### Inputs
None. The function takes no arguments.

### Expected Return Format
Return a dictionary with these keys:
- \`'zeros'\`: array of shape \`(3, 4)\` filled with \`0.0\`
- \`'ones'\`: array of shape \`(2, 3)\` filled with \`1.0\`
- \`'arange'\`: the integers \`0\` to \`9\`, shape \`(10,)\`
- \`'linspace'\`: 5 evenly spaced values from 0 to 1 inclusive, \`[0.0, 0.25, 0.5, 0.75, 1.0]\`
- \`'eye'\`: the \`4 x 4\` identity matrix

### Edge cases and conventions
- \`np.zeros(3, 4)\` is a bug: the second positional argument is the dtype, so it raises a \`TypeError\`. Pass the shape as one tuple.
- \`np.arange\` excludes its end point; \`np.linspace\` includes it.

### Constraints
Use NumPy constructors; don't type the values out as Python lists.

### Follow-up
- What does \`np.linspace(0, 1, 5, endpoint=False)\` return, and when is that the version you want?
- Why prefer \`np.linspace\` over \`np.arange(0, 1.01, 0.25)\` when you need a fixed number of float points?
    `,
    examples: [
      {
        input: 'create_arrays()["linspace"]',
        output: 'array([0.  , 0.25, 0.5 , 0.75, 1.  ])',
        explanation: '5 points from 0 to 1 inclusive, so the step is (1 - 0) / (5 - 1) = 0.25.',
      },
      {
        input: 'create_arrays()["arange"]',
        output: 'array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])',
        explanation: 'np.arange(10) stops before 10.',
      },
      {
        input: 'create_arrays()["zeros"].shape',
        output: '(3, 4)',
        explanation: '3 rows and 4 columns of 0.0.',
      },
    ],
    starterCode: `import numpy as np

def create_arrays() -> dict:
    """
    Create five arrays with NumPy constructors.

    Returns:
        dict with keys:
            'zeros':    (3, 4) array of 0.0
            'ones':     (2, 3) array of 1.0
            'arange':   integers 0..9, shape (10,)
            'linspace': 5 evenly spaced values from 0 to 1 inclusive
            'eye':      (4, 4) identity matrix
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Zeros shape correct',
        input: 'create_arrays()["zeros"].shape',
        expected: '(3, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Linspace length correct',
        input: 'len(create_arrays()["linspace"])',
        expected: '5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Eye is identity',
        input: 'bool(np.allclose(create_arrays()["eye"], np.eye(4)))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Ones shape and values',
        input: 'bool(np.allclose(create_arrays()["ones"], np.ones((2, 3))))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Arange values correct',
        input: 'create_arrays()["arange"].tolist()',
        expected: '[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Linspace endpoints correct',
        input: 'bool(create_arrays()["linspace"][0] == 0.0 and create_arrays()["linspace"][-1] == 1.0)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Zeros values are all zero',
        input: 'bool(np.allclose(create_arrays()["zeros"], 0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Eye shape correct',
        input: 'create_arrays()["eye"].shape',
        expected: '(4, 4)',
        hidden: true,
      },
      {
        id: '9',
        description: 'Linspace values are evenly spaced',
        input: 'create_arrays()["linspace"].tolist()',
        expected: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        hidden: true,
      },
    ],
    hints: [
      'Each key maps to exactly one NumPy constructor. Ask yourself: does it need a shape, or a range of values?',
      'Shape-based: np.zeros, np.ones, np.eye. Range-based: np.arange (by step) and np.linspace (by count).',
      'np.zeros((3, 4)) takes the shape as a tuple; np.arange(10) gives 0..9; np.linspace(0, 1, 5) includes both 0 and 1.',
      'Pitfall: np.zeros(3, 4) raises a TypeError because the second argument is the dtype. Also, np.arange excludes its stop value while np.linspace includes it.',
    ],
    solution: `import numpy as np

def create_arrays() -> dict:
    """
    Returns:
        dict with 'zeros' (3, 4), 'ones' (2, 3), 'arange' 0..9,
        'linspace' [0, 0.25, 0.5, 0.75, 1] and 'eye' (4, 4).
    """
    return {
        'zeros': np.zeros((3, 4)),          # shape goes in as one tuple
        'ones': np.ones((2, 3)),
        'arange': np.arange(10),            # half-open: 0..9
        'linspace': np.linspace(0, 1, 5),   # closed: includes 1.0
        'eye': np.eye(4),
    }
`,
  },
  {
    id: 'numpy-indexing',
    title: 'Indexing and Slicing',
    section: 'numpy-fundamentals',
    difficulty: 'medium',
    description: `
## Indexing and Slicing

### What you'll build
A function \`advanced_indexing(arr)\` that pulls a row, a column, a sub-block, the diagonal and a row-reversed version out of a 2D array.

### Background
Selecting the right slice is daily work in ML: one sample is a row of the design matrix \`X[i]\`, one feature is a column \`X[:, j]\`, a mini-batch is a block of rows \`X[start:end]\`, and a confusion matrix's correct predictions sit on its diagonal. Getting an axis or an end point wrong usually doesn't crash; it silently gives you the wrong data.

### Rules
- \`arr[i]\` is row \`i\`; \`arr[:, j]\` is column \`j\`. Both come back 1D.
- Slices are **half-open**: \`arr[r0:r1, c0:c1]\` takes rows \`r0 .. r1 - 1\` and columns \`c0 .. c1 - 1\`.
- A negative step walks backwards: \`arr[::-1]\` reverses the order along axis 0.
- \`np.diag(arr)\` returns \`arr[i, i]\` for \`i = 0 .. min(n_rows, n_cols) - 1\`, so it also works on non-square arrays.
- Basic slices return **views** that share memory with \`arr\`. Writing to a view changes \`arr\`; call \`.copy()\` when you need an independent array.

For example, \`arr = np.arange(20).reshape(4, 5)\` is:
\`\`\`text
[[ 0,  1,  2,  3,  4],
 [ 5,  6,  7,  8,  9],
 [10, 11, 12, 13, 14],
 [15, 16, 17, 18, 19]]
\`\`\`

### Inputs
- \`arr\`: 2D array of shape \`(n_rows, n_cols)\` with \`n_rows >= 3\` and \`n_cols >= 3\` (the tests use shapes like \`(4, 5)\`), any numeric dtype.

### Expected Return Format
Return a dictionary with these keys:
- \`'row_1'\`: the second row, \`arr[1]\`, shape \`(n_cols,)\`
- \`'col_2'\`: the third column, \`arr[:, 2]\`, shape \`(n_rows,)\`
- \`'subarray'\`: rows 1-2 and columns 2-4, i.e. \`arr[1:3, 2:5]\` (columns past the edge are simply dropped)
- \`'diagonal'\`: the main diagonal, shape \`(min(n_rows, n_cols),)\`
- \`'reversed'\`: \`arr\` with its rows in reverse order (last row first), columns unchanged

### Constraints
Use indexing and slicing (plus \`np.diag\`); no Python loops.

### Follow-up
- "Advanced" (fancy) indexing uses arrays as indices: \`arr[[0, 2]]\` picks rows 0 and 2, \`arr[arr % 2 == 0]\` picks the even entries. Unlike slices, both return copies. Why can't they be views?
- How would you reverse the columns instead, or both axes at once?
    `,
    examples: [
      {
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["subarray"]',
        output: 'array([[ 7,  8,  9],\n       [12, 13, 14]])',
        explanation: 'Rows 1 and 2 (the end index 3 is excluded) and columns 2, 3 and 4.',
      },
      {
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["diagonal"]',
        output: 'array([ 0,  6, 12, 18])',
        explanation: 'arr[0, 0], arr[1, 1], arr[2, 2], arr[3, 3]: a 4 x 5 array has 4 diagonal entries.',
      },
      {
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["reversed"][0]',
        output: 'array([15, 16, 17, 18, 19])',
        explanation: 'After reversing the rows, the last row comes first.',
      },
    ],
    starterCode: `import numpy as np

def advanced_indexing(arr: np.ndarray) -> dict:
    """
    Select parts of a 2D array with indexing and slicing.

    Args:
        arr: 2D array of shape (n_rows, n_cols), n_rows >= 3 and n_cols >= 3

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
    testCases: [
      {
        id: '1',
        description: 'Row extraction',
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["row_1"].tolist()',
        expected: '[5, 6, 7, 8, 9]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Subarray correct',
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["subarray"].tolist()',
        expected: '[[7, 8, 9], [12, 13, 14]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Column extraction',
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["col_2"].tolist()',
        expected: '[2, 7, 12, 17]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Diagonal values',
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["diagonal"].tolist()',
        expected: '[0, 6, 12, 18]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Reversed rows',
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["reversed"][0].tolist()',
        expected: '[15, 16, 17, 18, 19]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Subarray shape',
        input: 'advanced_indexing(np.arange(20).reshape(4, 5))["subarray"].shape',
        expected: '(2, 3)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Works with different input array',
        input: 'advanced_indexing(np.ones((4, 5)))["row_1"].tolist()',
        expected: '[1.0, 1.0, 1.0, 1.0, 1.0]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Wide 3 x 6 array: diagonal, subarray and reversed rows',
        input: '(lambda r: (r["diagonal"].tolist(), r["subarray"].tolist(), r["reversed"][:, 0].tolist()))(advanced_indexing(np.arange(18).reshape(3, 6)))',
        expected: '([0, 7, 14], [[8, 9, 10], [14, 15, 16]], [12, 6, 0])',
        hidden: true,
      },
    ],
    hints: [
      'Think of each request as "which rows?" and "which columns?". A colon means "all of them".',
      'The row and the column are single integer indices; the sub-block is a pair of slices; reversing is a slice with a negative step.',
      'arr[1], arr[:, 2], arr[1:3, 2:5], np.diag(arr) and arr[::-1].',
      'Pitfall: slice ends are exclusive, so rows 1-2 are 1:3, not 1:2. And slices are views: modifying one modifies arr.',
    ],
    solution: `import numpy as np

def advanced_indexing(arr: np.ndarray) -> dict:
    """
    Returns:
        dict with 'row_1', 'col_2', 'subarray', 'diagonal' and 'reversed'.
    """
    return {
        'row_1': arr[1],              # one integer index -> 1D row
        'col_2': arr[:, 2],           # all rows, column 2 -> 1D column
        'subarray': arr[1:3, 2:5],    # half-open: rows 1-2, columns 2-4
        'diagonal': np.diag(arr),     # arr[i, i] for i < min(n_rows, n_cols)
        'reversed': arr[::-1],        # negative step along axis 0
    }
    # All of these are views (no copy): O(1) time and extra space.
`,
  },
  {
    id: 'numpy-broadcasting',
    title: 'Broadcasting Operations',
    section: 'numpy-fundamentals',
    difficulty: 'medium',
    description: `
## Broadcasting Operations

### What you'll build
A function \`broadcasting_ops(arr, bias, scale)\` that performs four **independent** operations on the same matrix, each using broadcasting instead of loops.

### Background
Broadcasting is how a bias vector gets added to every row of a layer's output, how features are standardised with per-column statistics, and how per-sample weights scale a batch. It lets NumPy combine arrays of different shapes without copying data.

### Broadcasting rules
1. Line the two shapes up from the **right** (trailing dimensions first).
2. Each pair of dimensions must be equal, or one of them must be 1. A missing leading dimension counts as 1.
3. Dimensions of size 1 are stretched to match the other array.

| Operation | Shapes | Result |
|-----------|--------|--------|
| \`arr - arr.mean(axis=1, keepdims=True)\` | \`(m, n)\` and \`(m, 1)\` | \`(m, n)\` |
| \`arr - arr.mean(axis=0)\` | \`(m, n)\` and \`(n,)\` | \`(m, n)\` |
| \`arr + bias\` | \`(m, n)\` and \`(n,)\` | \`(m, n)\` |
| \`arr * scale\` | \`(m, n)\` and \`(m, 1)\` | \`(m, n)\` |

### Inputs
- \`arr\`: 2D numeric array of shape \`(m, n)\`, e.g. \`(3, 4)\`
- \`bias\`: 1D array of shape \`(n,)\`
- \`scale\`: 2D array of shape \`(m, 1)\` (a column vector)

### Expected Return Format
Return a dictionary with these keys. Each value is computed from the **original** \`arr\` (the operations are not chained) and has shape \`(m, n)\`:
- \`'row_centered'\`: \`arr\` minus each row's mean, so every row of the result has mean 0
- \`'col_centered'\`: \`arr\` minus each column's mean, so every column of the result has mean 0
- \`'biased'\`: \`arr + bias\`, i.e. \`bias[j]\` added to column \`j\` of every row
- \`'scaled'\`: \`arr * scale\`, i.e. row \`i\` multiplied by \`scale[i, 0]\`

### Edge cases and conventions
- Means are floats, so the centred outputs are float even for integer input.
- \`arr.mean(axis=1)\` has shape \`(m,)\`. Subtracting it from an \`(m, n)\` array either fails (when \`m != n\`) or, for a square matrix, silently subtracts along the **wrong axis**. Keep the reduced axis with \`keepdims=True\`.

### Constraints
Use broadcasting; no Python loops, \`np.tile\` or \`np.repeat\`.

### Follow-up
- Standardise each column to mean 0 and standard deviation 1. What goes wrong for a constant column?
- What shape does \`np.ones((3, 1)) + np.ones((1, 4))\` have, and why?
    `,
    examples: [
      {
        input: 'arr = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])\nbroadcasting_ops(arr, np.zeros(4), np.ones((3, 1)))["row_centered"][0]',
        output: 'array([-1.5, -0.5,  0.5,  1.5])',
        explanation: 'Row 0 has mean 2.5, which is subtracted from each of its entries.',
      },
      {
        input: 'broadcasting_ops(arr, np.zeros(4), np.ones((3, 1)))["col_centered"]',
        output: 'array([[-4., -4., -4., -4.],\n       [ 0.,  0.,  0.,  0.],\n       [ 4.,  4.,  4.,  4.]])',
        explanation: 'The column means are [5, 6, 7, 8]; each row sits 4 below, at, or 4 above them.',
      },
      {
        input: 'broadcasting_ops(arr, np.array([10, 20, 30, 40]), np.array([[1], [2], [3]]))["scaled"]',
        output: 'array([[ 1,  2,  3,  4],\n       [10, 12, 14, 16],\n       [27, 30, 33, 36]])',
        explanation: 'The (3, 1) column scales row i by scale[i, 0].',
      },
    ],
    starterCode: `import numpy as np

def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
    """
    Four independent broadcasting operations on arr.

    Args:
        arr:   2D array of shape (m, n), e.g. (3, 4)
        bias:  1D array of shape (n,)
        scale: 2D array of shape (m, 1)

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
    testCases: [
      {
        id: '1',
        description: 'Row centering',
        input: 'bool(np.allclose(broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1)))["row_centered"].mean(axis=1), 0))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Bias addition shape',
        input: 'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.array([1,1,1,1]), np.ones((3,1)))["biased"].shape',
        expected: '(3, 4)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Column centering has zero column means',
        input: 'bool(np.allclose(broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1)))["col_centered"].mean(axis=0), 0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Bias addition values correct',
        input: 'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.array([10,20,30,40]), np.ones((3,1)))["biased"][0].tolist()',
        expected: '[11, 22, 33, 44]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Scale multiplication correct',
        input: 'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.array([[2],[3],[4]]))["scaled"][0].tolist()',
        expected: '[2, 4, 6, 8]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Row centered values for first row',
        input: 'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1)))["row_centered"][0].tolist()',
        expected: '[-1.5, -0.5, 0.5, 1.5]',
        hidden: true,
      },
      {
        id: '7',
        description: 'All outputs have correct shape',
        input: '(lambda: (r := broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1))), bool(all(r[k].shape == (3, 4) for k in r)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Column centering and row scaling values',
        input: '(lambda r: (r["col_centered"].tolist(), r["scaled"].tolist()))(broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.array([[1],[2],[3]])))',
        expected: '([[-4.0, -4.0, -4.0, -4.0], [0.0, 0.0, 0.0, 0.0], [4.0, 4.0, 4.0, 4.0]], [[1, 2, 3, 4], [10, 12, 14, 16], [27, 30, 33, 36]])',
        hidden: true,
      },
      {
        id: '9',
        description: 'Square matrix: row means subtracted along the right axis',
        input: '(lambda r: (r["row_centered"].tolist(), r["col_centered"].tolist()))(broadcasting_ops(np.array([[1.0, 2.0], [3.0, 4.0]]), np.zeros(2), np.ones((2, 1))))',
        expected: '([[-0.5, 0.5], [-0.5, 0.5]], [[-1.0, -1.0], [1.0, 1.0]])',
        hidden: true,
      },
    ],
    hints: [
      "Each output is one arithmetic operation between arr and a smaller array. Work out the smaller array's shape first.",
      'Row statistics need one value per row, shape (m, 1); column statistics need one value per column, shape (n,). bias and scale already have broadcastable shapes.',
      'arr.mean(axis=1, keepdims=True) keeps the row means as an (m, 1) column; arr.mean(axis=0) gives the (n,) column means. Then plain -, + and * do the rest.',
      'Pitfall: without keepdims=True the row means have shape (m,). On a square matrix that broadcasts along the wrong axis with no error, so always check the shape of what you subtract.',
    ],
    solution: `import numpy as np

def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
    """
    Returns:
        dict with 'row_centered', 'col_centered', 'biased' and 'scaled',
        each of shape (m, n) and computed from the original arr.
    """
    # (m, n) - (m, 1): keepdims keeps the row means as a column
    row_centered = arr - arr.mean(axis=1, keepdims=True)

    # (m, n) - (n,): the column means line up with the last axis
    col_centered = arr - arr.mean(axis=0)

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
    # O(m * n) time; broadcasting never materialises the stretched operands.
`,
  },
  {
    id: 'numpy-aggregations',
    title: 'Aggregation Functions',
    section: 'numpy-fundamentals',
    difficulty: 'easy',
    description: `
## Aggregation Functions

### What you'll build
A function \`compute_aggregations(arr)\` that summarises a 2D array globally, per row and per column, and locates its largest and smallest entries.

### Background
Reductions are everywhere in ML: a loss is the mean over a batch, feature standardisation needs per-column means and standard deviations, and a classifier's prediction is the \`argmax\` over class scores in each row. The \`axis\` argument decides which dimension disappears.

### Axis convention
For an array of shape \`(n_rows, n_cols)\`:
- no \`axis\`: reduce everything to one number
- \`axis=1\`: reduce **across the columns**, giving one value per row, shape \`(n_rows,)\`
- \`axis=0\`: reduce **down the rows**, giving one value per column, shape \`(n_cols,)\`

The standard deviation is the population version (NumPy's default, \`ddof=0\`):
\`\`\`text
std = sqrt( sum((x - mean)^2) / N )      N = total number of entries
\`\`\`

### Inputs
- \`arr\`: 2D numeric array of shape \`(n_rows, n_cols)\` with at least one entry.

### Expected Return Format
Return a dictionary with these keys:
- **Global** (scalars): \`'global_mean'\`, \`'global_std'\` (population, \`ddof=0\`), \`'global_min'\`, \`'global_max'\`, \`'global_sum'\`
- **Row-wise** (shape \`(n_rows,)\`): \`'row_mean'\`, \`'row_sum'\`
- **Column-wise** (shape \`(n_cols,)\`): \`'col_mean'\`, \`'col_sum'\`
- **Indices**: \`'argmax'\` and \`'argmin'\`, each a \`(row, col)\` tuple of integers

### Edge cases and conventions
- Ties: \`argmax\`/\`argmin\` return the **first** occurrence in row-major order (row by row, left to right).
- \`arr.argmax()\` returns a flat index into the flattened array; convert it to \`(row, col)\` with \`np.unravel_index\` (or \`divmod(idx, n_cols)\`).

### Constraints
Use NumPy reductions; no Python loops.

### Follow-up
- When would you want \`ddof=1\`, and what happens with it for an array of one element?
- How do you get the argmax of each row, as used for classifier predictions?
    `,
    examples: [
      {
        input: 'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))',
        output: "{'global_mean': 3.5, 'global_std': 1.707825127659933, 'global_min': 1, 'global_max': 6, 'global_sum': 21, 'row_mean': array([2., 5.]), 'row_sum': array([ 6, 15]), 'col_mean': array([2.5, 3.5, 4.5]), 'col_sum': array([5, 7, 9]), 'argmax': (1, 2), 'argmin': (0, 0)}",
        explanation: 'The max (6) sits at row 1, column 2; std = sqrt(17.5 / 6) = 1.7078.',
      },
      {
        input: 'compute_aggregations(np.array([[5, 1], [5, 0]]))["argmax"]',
        output: '(0, 0)',
        explanation: 'Both 5s tie; the first one in row-major order wins.',
      },
    ],
    starterCode: `import numpy as np

def compute_aggregations(arr: np.ndarray) -> dict:
    """
    Global, row-wise and column-wise statistics of a 2D array.

    Args:
        arr: 2D numeric array of shape (n_rows, n_cols)

    Returns:
        dict with keys:
            'global_mean', 'global_std' (ddof=0), 'global_min',
            'global_max', 'global_sum':   scalars
            'row_mean', 'row_sum':        shape (n_rows,)
            'col_mean', 'col_sum':        shape (n_cols,)
            'argmax', 'argmin':           (row, col) tuples, first occurrence
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Global mean',
        input: 'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["global_mean"]',
        expected: '3.5',
        hidden: false,
      },
      {
        id: '2',
        description: 'Row sums',
        input: 'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["row_sum"].tolist()',
        expected: '[6, 15]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Column means',
        input: 'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["col_mean"].tolist()',
        expected: '[2.5, 3.5, 4.5]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Global std correct',
        input: 'round(float(compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["global_std"]), 4)',
        expected: '1.7078',
        hidden: true,
      },
      {
        id: '5',
        description: 'Argmax returns correct 2D index',
        input: 'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["argmax"]',
        expected: '(1, 2)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Argmin returns correct 2D index',
        input: 'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["argmin"]',
        expected: '(0, 0)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Global sum and min/max correct',
        input: '(lambda: (r := compute_aggregations(np.array([[10, 20], [30, 40]])), bool(r["global_sum"] == 100 and r["global_min"] == 10 and r["global_max"] == 40))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Row means, column sums and std with negatives and ties',
        input: '(lambda r: (r["row_mean"].tolist(), r["col_sum"].tolist(), round(float(r["global_std"]), 4), tuple(int(i) for i in r["argmax"]), tuple(int(i) for i in r["argmin"])))(compute_aggregations(np.array([[-3.0, 7.0, 7.0], [0.5, -3.0, 2.0]])))',
        expected: '([3.6666666666666665, -0.16666666666666666], [-2.5, 4.0, 9.0], 4.1206, (0, 1), (0, 0))',
        hidden: true,
      },
    ],
    hints: [
      'For each key, decide which dimension should disappear: all of them (global), the columns (one value per row) or the rows (one value per column).',
      'Global stats take no axis; per-row stats use axis=1; per-column stats use axis=0. For the indices, find the flat position first, then convert it to (row, col).',
      'arr.mean(), arr.std(), arr.sum(axis=1), arr.mean(axis=0), and np.unravel_index(arr.argmax(), arr.shape).',
      'Pitfall: axis=0 gives one value per column, not per row. And arr.argmax() on its own is a flat index, not a (row, col) pair.',
    ],
    solution: `import numpy as np

def compute_aggregations(arr: np.ndarray) -> dict:
    """
    Returns:
        dict with global scalars, row-wise (n_rows,) and column-wise (n_cols,)
        means and sums, and (row, col) tuples for 'argmax' and 'argmin'.
    """
    return {
        'global_mean': arr.mean(),
        'global_std': arr.std(),           # population std (ddof=0)
        'global_min': arr.min(),
        'global_max': arr.max(),
        'global_sum': arr.sum(),
        'row_mean': arr.mean(axis=1),      # collapse the columns -> one per row
        'row_sum': arr.sum(axis=1),
        'col_mean': arr.mean(axis=0),      # collapse the rows -> one per column
        'col_sum': arr.sum(axis=0),
        # argmax/argmin give a flat index (first occurrence); turn it into (row, col)
        'argmax': np.unravel_index(arr.argmax(), arr.shape),
        'argmin': np.unravel_index(arr.argmin(), arr.shape),
    }
    # Each reduction is O(n_rows * n_cols).
`,
  },
  {
    id: 'numpy-reshape-transpose',
    title: 'Reshape and Transpose',
    section: 'numpy-fundamentals',
    difficulty: 'medium',
    description: `
## Reshape and Transpose

### What you'll build
A function \`reshape_transpose(arr)\` that reshapes a 24-element vector into 2D and 3D arrays, transposes them, and flattens back.

### Background
Shape changes glue ML pipelines together: flattening images before a linear layer, splitting \`d_model\` into attention heads, moving channels between \`(N, H, W, C)\` and \`(N, C, H, W)\`. Mixing up **reshape** (same order, new grouping) and **transpose** (same data, axes reordered) is one of the most common silent bugs.

### Key ideas
- NumPy stores arrays in row-major (C) order: the **last** axis changes fastest.
- \`reshape\` keeps that order and regroups it. In a \`(4, 6)\` array, entry \`[i, j]\` is element \`6*i + j\` of the vector; in a \`(2, 3, 4)\` array, entry \`[i, j, k]\` is element \`12*i + 4*j + k\`. One dimension may be \`-1\` ("infer it").
- \`transpose\` reorders axes: \`out = a.transpose(2, 1, 0)\` means \`out[k, j, i] = a[i, j, k]\`. For 2D, \`a.T[j, i] = a[i, j]\`. No data moves; only the strides change.
- \`flatten()\` reads an array back out in row-major order (always a copy); \`ravel()\` does the same but returns a view when it can.

### Inputs
- \`arr\`: 1D array of exactly 24 elements (the tests mostly use \`np.arange(24)\`).

### Expected Return Format
Return a dictionary with these keys:
- \`'arr_2d'\`: \`arr\` reshaped to \`(4, 6)\`
- \`'arr_3d'\`: \`arr\` reshaped to \`(2, 3, 4)\`
- \`'arr_2d_transposed'\`: transpose of \`arr_2d\`, shape \`(6, 4)\`
- \`'arr_3d_swapped'\`: \`arr_3d\` with its axes reversed, \`transpose(2, 1, 0)\`, shape \`(4, 3, 2)\`
- \`'arr_flat'\`: \`arr_2d\` flattened back to 1D in row-major order, shape \`(24,)\` (equal to the input)

### Edge cases and conventions
- \`arr_2d.reshape(6, 4)\` has the right shape but is **not** the transpose: its first row is \`[0, 1, 2, 3]\`, while the transpose's first row is \`[0, 6, 12, 18]\`.
- Flattening the transposed array gives a different order (\`[0, 6, 12, 18, 1, ...]\`), which is why \`'arr_flat'\` flattens \`arr_2d\`.

### Constraints
Use \`reshape\`, \`transpose\`/\`.T\` and \`flatten\`/\`ravel\`; no loops.

### Follow-up
- Convert a batch of images from \`(N, H, W, C)\` to \`(N, C, H, W)\`. Which axis order do you pass to \`transpose\`?
- Why does \`.view(...)\` on a transposed tensor fail in PyTorch, while \`.reshape(...)\` works?
    `,
    examples: [
      {
        input: 'reshape_transpose(np.arange(24))["arr_2d_transposed"][:2]',
        output: 'array([[ 0,  6, 12, 18],\n       [ 1,  7, 13, 19]])',
        explanation: 'Row j of the transpose is column j of arr_2d.',
      },
      {
        input: 'reshape_transpose(np.arange(24))["arr_3d_swapped"][:, 0, :]',
        output: 'array([[ 0, 12],\n       [ 1, 13],\n       [ 2, 14],\n       [ 3, 15]])',
        explanation: 'out[k, 0, i] = arr_3d[i, 0, k] = 12*i + k.',
      },
      {
        input: 'reshape_transpose(np.arange(24))["arr_3d"].shape',
        output: '(2, 3, 4)',
        explanation: 'The same 24 values, grouped as 2 blocks of 3 rows of 4.',
      },
    ],
    starterCode: `import numpy as np

def reshape_transpose(arr: np.ndarray) -> dict:
    """
    Reshape, transpose and flatten a 24-element array.

    Args:
        arr: 1D array of 24 elements

    Returns:
        dict with keys:
            'arr_2d':            arr reshaped to (4, 6)
            'arr_3d':            arr reshaped to (2, 3, 4)
            'arr_2d_transposed': arr_2d transposed, shape (6, 4)
            'arr_3d_swapped':    arr_3d with axes reversed (2, 1, 0), shape (4, 3, 2)
            'arr_flat':          arr_2d flattened back to shape (24,)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: '2D reshape shape',
        input: 'reshape_transpose(np.arange(24))["arr_2d"].shape',
        expected: '(4, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: '3D reshape shape',
        input: 'reshape_transpose(np.arange(24))["arr_3d"].shape',
        expected: '(2, 3, 4)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Transpose shape correct',
        input: 'reshape_transpose(np.arange(24))["arr_2d_transposed"].shape',
        expected: '(6, 4)',
        hidden: true,
      },
      {
        id: '4',
        description: '3D swapped axes shape',
        input: 'reshape_transpose(np.arange(24))["arr_3d_swapped"].shape',
        expected: '(4, 3, 2)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Flatten is 1D with 24 elements',
        input: 'reshape_transpose(np.arange(24))["arr_flat"].shape',
        expected: '(24,)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Data preserved after reshape (first row of 2D)',
        input: 'reshape_transpose(np.arange(24))["arr_2d"][0].tolist()',
        expected: '[0, 1, 2, 3, 4, 5]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Transpose preserves data (first column of transposed equals first row of original)',
        input: 'bool(np.allclose(reshape_transpose(np.arange(24))["arr_2d_transposed"][:, 0], reshape_transpose(np.arange(24))["arr_2d"][0]))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Transposed and axis-reversed values (not just reshaped)',
        input: '(lambda r: (r["arr_2d_transposed"][:2].tolist(), r["arr_3d_swapped"][1].tolist()))(reshape_transpose(np.arange(24)))',
        expected: '([[0, 6, 12, 18], [1, 7, 13, 19]], [[1, 13], [5, 17], [9, 21]])',
        hidden: true,
      },
      {
        id: '9',
        description: 'Different input values: 3D block and flatten order',
        input: '(lambda r: (r["arr_3d"][1, 2].tolist(), r["arr_flat"].tolist() == list(range(100, 124))))(reshape_transpose(np.arange(100, 124)))',
        expected: '([120, 121, 122, 123], True)',
        hidden: true,
      },
    ],
    hints: [
      'Two different things happen here: regrouping the same sequence into a new shape, and reordering which axis is which. Which key needs which?',
      'Use reshape for arr_2d and arr_3d, transpose for the two transposed keys, and flatten arr_2d at the end.',
      'arr.reshape(4, 6) (or reshape(4, -1)), arr.reshape(2, 3, 4), arr_2d.T, arr_3d.transpose(2, 1, 0), arr_2d.flatten().',
      'Pitfall: reshape(6, 4) is not a transpose. It has the right shape but the wrong values: row 0 of the transpose must be [0, 6, 12, 18].',
    ],
    solution: `import numpy as np

def reshape_transpose(arr: np.ndarray) -> dict:
    """
    Returns:
        dict with 'arr_2d' (4, 6), 'arr_3d' (2, 3, 4), 'arr_2d_transposed' (6, 4),
        'arr_3d_swapped' (4, 3, 2) and 'arr_flat' (24,).
    """
    arr_2d = arr.reshape(4, 6)                    # same row-major order, new grouping
    arr_3d = arr.reshape(2, 3, 4)
    arr_2d_t = arr_2d.T                           # out[j, i] = arr_2d[i, j]
    arr_3d_swapped = arr_3d.transpose(2, 1, 0)    # out[k, j, i] = arr_3d[i, j, k]
    arr_flat = arr_2d.flatten()                   # back to the original order (a copy)

    return {
        'arr_2d': arr_2d,
        'arr_3d': arr_3d,
        'arr_2d_transposed': arr_2d_t,
        'arr_3d_swapped': arr_3d_swapped,
        'arr_flat': arr_flat,
    }
    # reshape and transpose are O(1) views; flatten copies in O(n).
`,
  },
];
