import { Problem } from '../../types';

export const pythonBasicsProblems: Problem[] = [
  {
    id: 'numpy-array-sum',
    title: 'Array Sum',
    section: 'python-basics',
    difficulty: 'easy',
    description: `
## Array Sum

### What you'll build
A function \`array_sum(arr)\` that returns the sum of every element of a NumPy array, using one vectorised call instead of a Python loop.

### Background
Summing is the simplest **reduction**, and the one hiding inside most ML code: a mean loss is a sum divided by the batch size, a dot product is a sum of products, and a softmax denominator is a sum of exponentials. \`np.sum\` runs a compiled loop over contiguous memory, so it is typically about 100x faster than a Python \`for\` loop on large arrays.

### Formula
\`\`\`text
array_sum(arr) = arr[0] + arr[1] + ... + arr[n-1]      (over every element, whatever the shape)
\`\`\`

### Inputs
- \`arr\`: NumPy array of numbers (integers or floats) with \`1 <= arr.size <= 1000\` and values in \`[-10^6, 10^6]\`. Usually 1D, but sum every element if it has more dimensions.

### Expected Return Format
A single number: the total. It may be a NumPy scalar (\`np.int64\` for integer input, \`np.float64\` for float input); the tests compare its value.

### Constraints
Use NumPy (\`np.sum\` or \`arr.sum()\`); no Python loops.

### Follow-up
- How would you sum each row of a 2D array instead? Each column?
- Summing many float32 values can lose precision. Why does NumPy's pairwise summation help?
    `,
    examples: [
      { input: 'array_sum(np.array([1, 2, 3, 4, 5]))', output: '15', explanation: '1 + 2 + 3 + 4 + 5 = 15' },
      { input: 'array_sum(np.array([-1, 0, 1]))', output: '0', explanation: 'Negative and positive values cancel: -1 + 0 + 1 = 0' },
      { input: 'array_sum(np.array([0.5, 1.5, -1.0]))', output: '1.0', explanation: 'Float input gives a float total.' },
    ],
    starterCode: `import numpy as np

def array_sum(arr: np.ndarray) -> float:
    """
    Calculate the sum of all elements in a NumPy array.

    Args:
        arr: NumPy array of numbers (any shape, at least one element)

    Returns:
        The sum of all elements, as a number (a NumPy scalar is fine)
    """
    # Your code here
    pass
`,
    testCases: [
      { id: '1', description: 'Basic positive numbers', input: '[1, 2, 3, 4, 5]', expected: '15', hidden: false },
      { id: '2', description: 'With negatives', input: '[-1, 0, 1]', expected: '0', hidden: false },
      { id: '3', description: 'Single element', input: '[42]', expected: '42', hidden: false },
      { id: '4', description: 'Larger array', input: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', expected: '55', hidden: true },
      { id: '5', description: 'Float values', input: '[1.5, -2.25, 0.75, 4.0]', expected: '4.0', hidden: true },
      { id: '6', description: 'Sums every element of a 2D array', input: 'array_sum(np.array([[1, 2], [3, 4]]))', expected: '10', hidden: true },
    ],
    hints: [
      'This is a reduction: many values collapse into one. NumPy has a built-in for exactly that.',
      'Hand the whole array to a single NumPy call instead of visiting elements one at a time.',
      'np.sum(arr) or arr.sum(); with no axis argument both add up every element, whatever the shape.',
      "Pitfall: Python's built-in sum(arr) iterates over the first axis only, so on a 2D array it returns a row of column sums, not a number.",
    ],
    solution: `import numpy as np

def array_sum(arr: np.ndarray) -> float:
    """
    Returns:
        The sum of all elements (a NumPy scalar).
    """
    # No axis: reduce over every element, whatever the shape
    return np.sum(arr)
    # O(n) time, O(1) extra space.
`,
  },
  {
    id: 'numpy-matrix-multiply',
    title: 'Matrix Multiplication',
    section: 'python-basics',
    difficulty: 'medium',
    description: `
## Matrix Multiplication

### What you'll build
A function \`matrix_multiply(A, B)\` that returns the matrix product of two 2D arrays.

### Background
Matrix multiplication is the workhorse of deep learning: a linear layer computes \`x @ W\`, attention computes \`Q @ K.T\`, and GPUs are built to do it fast. Knowing the shape rule by heart lets you debug most "shapes don't match" errors in seconds.

### Formula
For \`A\` of shape \`(m, n)\` and \`B\` of shape \`(n, p)\`:
\`\`\`text
C[i, j] = sum over k = 0 .. n-1 of A[i, k] * B[k, j]        C has shape (m, p)
\`\`\`
Entry \`(i, j)\` is the dot product of row \`i\` of \`A\` with column \`j\` of \`B\`. The inner dimensions must match and disappear.

### Inputs
- \`A\`: 2D array of shape \`(m, n)\`
- \`B\`: 2D array of shape \`(n, p)\`, with \`1 <= m, n, p <= 100\`. Integer or float entries.

### Expected Return Format
A 2D array of shape \`(m, p)\`. Integer inputs give an integer result.

### Edge cases and conventions
- \`A * B\` is the **elementwise** product, not matrix multiplication.
- A \`(1, n) @ (n, 1)\` product is still 2D: \`[[value]]\`, shape \`(1, 1)\`.

### Constraints
Use a NumPy matrix-product routine (\`@\`, \`np.matmul\` or \`np.dot\`), not Python loops.

### Follow-up
- Write the triple loop by hand. What is its time complexity? (O(m·n·p).)
- How do \`np.dot\` and \`np.matmul\` differ on 3D (batched) inputs?
    `,
    examples: [
      {
        input: 'matrix_multiply(np.array([[1, 2], [3, 4]]), np.array([[5, 6], [7, 8]]))',
        output: 'array([[19, 22],\n       [43, 50]])',
        explanation: 'C[0, 0] = 1*5 + 2*7 = 19 and C[1, 1] = 3*6 + 4*8 = 50.',
      },
      {
        input: 'matrix_multiply(np.array([[1, 2, 3]]), np.array([[1], [2], [3]]))',
        output: 'array([[14]])',
        explanation: '(1, 3) @ (3, 1) gives a (1, 1) matrix: 1*1 + 2*2 + 3*3 = 14.',
      },
    ],
    starterCode: `import numpy as np

def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
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
    testCases: [
      {
        id: '1',
        description: '2x2 matrices',
        input: '([[1, 2], [3, 4]], [[5, 6], [7, 8]])',
        expected: '[[19, 22], [43, 50]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Identity multiplication',
        input: '([[1, 0], [0, 1]], [[5, 6], [7, 8]])',
        expected: '[[5, 6], [7, 8]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Different dimensions',
        input: '([[1, 2, 3]], [[1], [2], [3]])',
        expected: '[[14]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Result shape check for non-square',
        input: 'matrix_multiply(np.array([[1, 2, 3]]), np.array([[1, 0], [0, 1], [1, 1]])).tolist()',
        expected: '[[4, 5]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Float matrices, (3, 2) @ (2, 3)',
        input: 'matrix_multiply(np.array([[1.0, 2.0], [0.5, -1.0], [0.0, 3.0]]), np.array([[2.0, 0.0, 1.0], [1.0, 1.0, 0.0]])).tolist()',
        expected: '[[4.0, 2.0, 1.0], [0.0, -1.0, 0.5], [3.0, 3.0, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Check the shapes first: (m, n) times (n, p). Which dimension disappears, and what shape is left?',
      'Each output entry is a row of A dotted with a column of B; NumPy computes all of them in one call.',
      'A @ B (equivalently np.matmul(A, B) or np.dot(A, B) for 2D inputs).',
      'Pitfall: A * B multiplies elementwise. It only works when the shapes broadcast, and even then it is not a matrix product.',
    ],
    solution: `import numpy as np

def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """
    Returns:
        A @ B, shape (m, p).
    """
    # C[i, j] = sum_k A[i, k] * B[k, j]; the inner dimension n is contracted
    return A @ B   # same as np.matmul(A, B); np.dot(A, B) also works for 2D
    # O(m * n * p) time, O(m * p) space for the result.
`,
  },
  {
    id: 'numpy-broadcast-add',
    title: 'Broadcasting Addition',
    section: 'python-basics',
    difficulty: 'medium',
    description: `
## Broadcasting Addition

### What you'll build
A function \`broadcast_add(matrix, vector)\` that adds a vector to every row of a matrix with a single \`+\`, letting broadcasting do the repetition.

### Background
This is exactly how a neural network layer adds its bias: \`x @ W\` has shape \`(batch, d_out)\` and the bias \`b\` has shape \`(d_out,)\`. Broadcasting stretches \`b\` across the batch without ever copying it, so the same code works for any batch size.

### Formula
\`\`\`text
result[i, j] = matrix[i, j] + vector[j]      for every row i
\`\`\`

### Broadcasting rule
NumPy compares shapes from the right. \`(m, n)\` and \`(n,)\` line up as \`(m, n)\` and \`(1, n)\`; the size-1 dimension is stretched to \`m\`, giving \`(m, n)\`.

### Inputs
- \`matrix\`: 2D array of shape \`(m, n)\`
- \`vector\`: 1D array of shape \`(n,)\`, with \`1 <= m, n <= 100\`. Integer or float entries.

### Expected Return Format
A 2D array of shape \`(m, n)\`: \`vector\` added to each row.

### Constraints
Use broadcasting; no loops, \`np.tile\` or \`np.repeat\`.

### Follow-up
- How would you add a value to every **column** instead, with one value per row? (Hint: a vector of shape \`(m, 1)\`.)
- What error do you get for a \`(2, 3)\` matrix plus a \`(2,)\` vector, and why?
    `,
    examples: [
      {
        input: 'broadcast_add(np.array([[1, 2, 3], [4, 5, 6]]), np.array([10, 20, 30]))',
        output: 'array([[11, 22, 33],\n       [14, 25, 36]])',
        explanation: 'The vector [10, 20, 30] is added to each of the two rows.',
      },
      {
        input: 'broadcast_add(np.array([[1, 2], [3, 4]]), np.array([-1, -2]))',
        output: 'array([[0, 0],\n       [2, 2]])',
        explanation: 'Column 0 gets -1 and column 1 gets -2 in every row.',
      },
    ],
    starterCode: `import numpy as np

def broadcast_add(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
    """
    Add a vector to each row of a matrix using broadcasting.

    Args:
        matrix: 2D array of shape (m, n)
        vector: 1D array of shape (n,)

    Returns:
        Array of shape (m, n) with result[i, j] = matrix[i, j] + vector[j]
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic broadcasting',
        input: '([[1, 2, 3], [4, 5, 6]], [10, 20, 30])',
        expected: '[[11, 22, 33], [14, 25, 36]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With zeros',
        input: '([[1, 2], [3, 4]], [0, 0])',
        expected: '[[1, 2], [3, 4]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Negative values',
        input: '([[1, 2], [3, 4]], [-1, -2])',
        expected: '[[0, 0], [2, 2]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Single row matrix',
        input: '([[5, 10, 15]], [1, 2, 3])',
        expected: '[[6, 12, 18]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Float values, 3 rows and 2 columns',
        input: 'broadcast_add(np.array([[0.5, 1.5], [2.0, -1.0], [0.0, 0.0]]), np.array([1.0, -0.5])).tolist()',
        expected: '[[1.5, 1.0], [3.0, -1.5], [1.0, -0.5]]',
        hidden: true,
      },
    ],
    hints: [
      'You want the same vector added to every row. Does NumPy need you to copy it m times?',
      'Line the shapes up from the right: (m, n) and (n,). They are compatible, so one arithmetic operator is enough.',
      'matrix + vector. NumPy treats the (n,) vector as (1, n) and stretches it over the m rows.',
      'Pitfall: a vector of shape (m,) would line up with the columns, not the rows. Reshape it to (m, 1) if you ever need to add per-row values.',
    ],
    solution: `import numpy as np

def broadcast_add(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
    """
    Returns:
        matrix + vector, shape (m, n).
    """
    # (m, n) + (n,): the vector is treated as (1, n) and stretched over the rows
    return matrix + vector
    # O(m * n) time; the vector is never physically copied.
`,
  },
];
