import { Problem } from '../../types';

export const numpyFundamentalsProblems: Problem[] = [
  {
    id: 'numpy-array-creation',
    title: 'Array Creation Methods',
    section: 'numpy-fundamentals',
    difficulty: 'easy',
    description: `
## NumPy Array Creation

Implement a function that creates various NumPy arrays using different methods.

### Requirements
Create and return a dictionary with:
- \`zeros\`: 3x4 array of zeros
- \`ones\`: 2x3 array of ones
- \`arange\`: array from 0 to 9
- \`linspace\`: 5 evenly spaced values from 0 to 1
- \`eye\`: 4x4 identity matrix

### Function Signature
\`\`\`python
def create_arrays() -> dict:
\`\`\`
    `,
    examples: [
      {
        input: 'create_arrays()',
        output: "{'zeros': array([[0,0,0,0],...]), ...}",
        explanation: 'Dictionary with 5 different array types',
      },
    ],
    starterCode: `import numpy as np

def create_arrays() -> dict:
    """
    Create various NumPy arrays.

    Returns:
        Dictionary with keys: zeros, ones, arange, linspace, eye
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
    ],
    hints: [
      'Use np.zeros((3, 4)) for zero array',
      'np.linspace(start, stop, num) creates evenly spaced values',
      'np.eye(n) creates an identity matrix',
    ],
    solution: `import numpy as np

def create_arrays() -> dict:
    return {
        'zeros': np.zeros((3, 4)),
        'ones': np.ones((2, 3)),
        'arange': np.arange(10),
        'linspace': np.linspace(0, 1, 5),
        'eye': np.eye(4)
    }
`,
  },
  {
    id: 'numpy-indexing',
    title: 'Advanced Indexing',
    section: 'numpy-fundamentals',
    difficulty: 'medium',
    description: `
## NumPy Advanced Indexing

Implement various indexing operations on a 2D array.

### Given
\`\`\`python
arr = np.arange(20).reshape(4, 5)
# array([[ 0,  1,  2,  3,  4],
#        [ 5,  6,  7,  8,  9],
#        [10, 11, 12, 13, 14],
#        [15, 16, 17, 18, 19]])
\`\`\`

### Requirements
Return a dictionary with:
- \`row_1\`: Second row (index 1)
- \`col_2\`: Third column (index 2)
- \`subarray\`: Rows 1-2, columns 2-4
- \`diagonal\`: Main diagonal
- \`reversed\`: Array with rows reversed

### Function Signature
\`\`\`python
def advanced_indexing(arr: np.ndarray) -> dict:
\`\`\`
    `,
    examples: [
      {
        input: 'arr = np.arange(20).reshape(4, 5)',
        output: "{'row_1': [5,6,7,8,9], ...}",
        explanation: 'Various slicing and indexing operations',
      },
    ],
    starterCode: `import numpy as np

def advanced_indexing(arr: np.ndarray) -> dict:
    """
    Perform advanced indexing operations.

    Args:
        arr: 2D input array

    Returns:
        Dictionary with indexed results
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
    ],
    hints: [
      'arr[1] or arr[1, :] gets row 1',
      'arr[:, 2] gets column 2',
      'arr[1:3, 2:5] gets a subarray',
      'np.diag(arr) extracts diagonal',
      'arr[::-1] reverses rows',
    ],
    solution: `import numpy as np

def advanced_indexing(arr: np.ndarray) -> dict:
    return {
        'row_1': arr[1],
        'col_2': arr[:, 2],
        'subarray': arr[1:3, 2:5],
        'diagonal': np.diag(arr),
        'reversed': arr[::-1]
    }
`,
  },
  {
    id: 'numpy-broadcasting',
    title: 'Broadcasting Operations',
    section: 'numpy-fundamentals',
    difficulty: 'medium',
    description: `
## NumPy Broadcasting

Implement operations that leverage NumPy's broadcasting rules.

### Task
Given a 2D array of shape (3, 4):
1. Subtract the row means from each row (center rows)
2. Subtract the column means from each column (center columns)
3. Add a 1D bias vector of shape (4,) to each row
4. Multiply by a column vector of shape (3, 1)

### Broadcasting Rules
- Arrays are compatible when dimensions are equal or one of them is 1
- Operations proceed element-wise on matching dimensions

### Function Signature
\`\`\`python
def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
\`\`\`
    `,
    examples: [
      {
        input: 'arr (3,4), bias (4,), scale (3,1)',
        output: "{'row_centered': ..., 'col_centered': ..., 'biased': ..., 'scaled': ...}",
        explanation: 'Various broadcasting operations',
      },
    ],
    starterCode: `import numpy as np

def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
    """
    Perform broadcasting operations.

    Args:
        arr: 2D array of shape (3, 4)
        bias: 1D array of shape (4,)
        scale: 2D array of shape (3, 1)

    Returns:
        Dictionary with results of broadcasting operations
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
    ],
    hints: [
      'Row means: arr.mean(axis=1, keepdims=True)',
      'Column means: arr.mean(axis=0, keepdims=True) or arr.mean(axis=0)',
      'Bias shape (4,) broadcasts with arr shape (3, 4)',
      'Scale shape (3, 1) broadcasts with arr shape (3, 4)',
    ],
    solution: `import numpy as np

def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
    # Row centered: subtract mean of each row
    row_means = arr.mean(axis=1, keepdims=True)  # (3, 1)
    row_centered = arr - row_means

    # Column centered: subtract mean of each column
    col_means = arr.mean(axis=0)  # (4,)
    col_centered = arr - col_means

    # Add bias to each row
    biased = arr + bias  # bias (4,) broadcasts to (3, 4)

    # Scale each row
    scaled = arr * scale  # scale (3, 1) broadcasts to (3, 4)

    return {
        'row_centered': row_centered,
        'col_centered': col_centered,
        'biased': biased,
        'scaled': scaled
    }
`,
  },
  {
    id: 'numpy-aggregations',
    title: 'Aggregation Functions',
    section: 'numpy-fundamentals',
    difficulty: 'easy',
    description: `
## NumPy Aggregations

Implement common aggregation operations along different axes.

### Task
Given a 2D array, compute:
- Global statistics (mean, std, min, max, sum)
- Row-wise statistics (along axis=1)
- Column-wise statistics (along axis=0)
- Argmax and argmin (indices of max/min values)

### Expected Return Format
Return a dictionary with these keys:
- **Global**: \`'global_mean'\`, \`'global_std'\`, \`'global_min'\`, \`'global_max'\`, \`'global_sum'\`
- **Row-wise**: \`'row_mean'\`, \`'row_sum'\`
- **Column-wise**: \`'col_mean'\`, \`'col_sum'\`
- **Indices**: \`'argmax'\` (2D index tuple), \`'argmin'\` (2D index tuple)
    `,
    examples: [
      {
        input: 'np.array([[1, 2, 3], [4, 5, 6]])',
        output: "{'global_mean': 3.5, 'global_sum': 21, 'row_sum': [6, 15], 'col_mean': [2.5, 3.5, 4.5], 'argmax': (1, 2), ...}",
        explanation: 'Global, row-wise, and column-wise aggregations',
      },
    ],
    starterCode: `import numpy as np

def compute_aggregations(arr: np.ndarray) -> dict:
    """
    Compute aggregation statistics.

    Args:
        arr: 2D input array

    Returns:
        Dictionary with aggregation results
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
    ],
    hints: [
      'arr.mean() computes global mean',
      'arr.mean(axis=0) computes column means',
      'arr.mean(axis=1) computes row means',
      'np.argmax(arr) gives index of max in flattened array',
    ],
    solution: `import numpy as np

def compute_aggregations(arr: np.ndarray) -> dict:
    return {
        'global_mean': arr.mean(),
        'global_std': arr.std(),
        'global_min': arr.min(),
        'global_max': arr.max(),
        'global_sum': arr.sum(),
        'row_mean': arr.mean(axis=1),
        'row_sum': arr.sum(axis=1),
        'col_mean': arr.mean(axis=0),
        'col_sum': arr.sum(axis=0),
        'argmax': np.unravel_index(arr.argmax(), arr.shape),
        'argmin': np.unravel_index(arr.argmin(), arr.shape),
    }
`,
  },
  {
    id: 'numpy-reshape-transpose',
    title: 'Reshape and Transpose',
    section: 'numpy-fundamentals',
    difficulty: 'medium',
    description: `
## Reshape and Transpose Operations

Master array shape manipulation - essential for ML data pipelines.

### Task
Given a 1D array of 24 elements:
1. Reshape to (4, 6)
2. Reshape to (2, 3, 4)
3. Transpose the 2D version
4. Swap axes on the 3D version
5. Flatten back to 1D

### Important Concepts
- \`reshape\` changes shape without changing data order
- \`transpose\` swaps axes
- \`-1\` in reshape means "infer this dimension"

### Expected Return Format
Return a dictionary with these keys:
- \`'arr_2d'\`: Reshaped to (4, 6)
- \`'arr_3d'\`: Reshaped to (2, 3, 4)
- \`'arr_2d_transposed'\`: Transpose of arr_2d, shape (6, 4)
- \`'arr_3d_swapped'\`: arr_3d with axes swapped (2,1,0), shape (4, 3, 2)
- \`'arr_flat'\`: Flattened back to 1D, shape (24,)
    `,
    examples: [
      {
        input: 'np.arange(24)',
        output: "{'arr_2d': shape (4,6), 'arr_3d': shape (2,3,4), 'arr_2d_transposed': shape (6,4), ...}",
        explanation: 'Various reshape and transpose operations',
      },
    ],
    starterCode: `import numpy as np

def reshape_transpose(arr: np.ndarray) -> dict:
    """
    Perform reshape and transpose operations.

    Args:
        arr: 1D array of 24 elements

    Returns:
        Dictionary with reshaped arrays
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
    ],
    hints: [
      'arr.reshape(4, 6) or arr.reshape(4, -1)',
      'arr.reshape(2, 3, 4) for 3D',
      '.T or .transpose() for transpose',
      '.flatten() or .ravel() for 1D',
    ],
    solution: `import numpy as np

def reshape_transpose(arr: np.ndarray) -> dict:
    # 2D reshape
    arr_2d = arr.reshape(4, 6)

    # 3D reshape
    arr_3d = arr.reshape(2, 3, 4)

    # Transpose 2D
    arr_2d_T = arr_2d.T

    # Swap axes on 3D (swap axis 0 and 2)
    arr_3d_swapped = arr_3d.transpose(2, 1, 0)

    # Flatten
    arr_flat = arr_2d.flatten()

    return {
        'arr_2d': arr_2d,
        'arr_3d': arr_3d,
        'arr_2d_transposed': arr_2d_T,
        'arr_3d_swapped': arr_3d_swapped,
        'arr_flat': arr_flat
    }
`,
  },
];
