import { Problem } from '../../types';

export const pythonBasicsProblems: Problem[] = [
  {
    id: 'numpy-array-sum',
    title: 'Array Sum',
    section: 'python-basics',
    difficulty: 'easy',
    description: `
## Array Sum

Given a NumPy array of numbers, implement a function that returns the sum of all elements.

### Function Signature
\`\`\`python
def array_sum(arr: np.ndarray) -> float:
\`\`\`

### Constraints
- Array length: 1 <= n <= 1000
- Element values: -10^6 <= arr[i] <= 10^6
    `,
    examples: [
      { input: 'np.array([1, 2, 3, 4, 5])', output: '15', explanation: '1 + 2 + 3 + 4 + 5 = 15' },
      { input: 'np.array([-1, 0, 1])', output: '0', explanation: '-1 + 0 + 1 = 0' },
    ],
    starterCode: `import numpy as np

def array_sum(arr: np.ndarray) -> float:
    """
    Calculate the sum of all elements in a NumPy array.

    Args:
        arr: A NumPy array of numbers

    Returns:
        The sum of all elements
    """
    # Your code here
    pass
`,
    testCases: [
      { id: '1', description: 'Basic positive numbers', input: '[1, 2, 3, 4, 5]', expected: '15', hidden: false },
      { id: '2', description: 'With negatives', input: '[-1, 0, 1]', expected: '0', hidden: false },
      { id: '3', description: 'Single element', input: '[42]', expected: '42', hidden: false },
      { id: '4', description: 'Larger array', input: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', expected: '55', hidden: true },
    ],
    hints: [
      'NumPy arrays have built-in methods for common operations.',
      'Try using np.sum() or the .sum() method on the array.',
    ],
    solution: `import numpy as np

def array_sum(arr: np.ndarray) -> float:
    """
    Calculate the sum of all elements in a NumPy array.
    """
    return np.sum(arr)
`,
  },
  {
    id: 'numpy-matrix-multiply',
    title: 'Matrix Multiplication',
    section: 'python-basics',
    difficulty: 'medium',
    description: `
## Matrix Multiplication

Implement matrix multiplication between two 2D NumPy arrays.

### Function Signature
\`\`\`python
def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- A has shape (m, n)
- B has shape (n, p)
- Result has shape (m, p)
- 1 <= m, n, p <= 100

### Note
You should use NumPy's built-in functions, not manual loops.
    `,
    examples: [
      {
        input: 'A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]]',
        output: '[[19, 22], [43, 50]]',
        explanation: 'Standard matrix multiplication',
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
        Result matrix of shape (m, p)
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
    ],
    hints: [
      'NumPy provides several ways to do matrix multiplication.',
      'Try np.dot(), np.matmul(), or the @ operator.',
    ],
    solution: `import numpy as np

def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """
    Multiply two matrices A and B.
    """
    return np.dot(A, B)
    # Alternative: return A @ B
    # Alternative: return np.matmul(A, B)
`,
  },
  {
    id: 'numpy-broadcast-add',
    title: 'Broadcasting Addition',
    section: 'python-basics',
    difficulty: 'medium',
    description: `
## Broadcasting Addition

Given a 2D matrix and a 1D vector, add the vector to each row of the matrix using broadcasting.

### Function Signature
\`\`\`python
def broadcast_add(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- Matrix has shape (m, n)
- Vector has shape (n,)
- 1 <= m, n <= 100

### Note
Broadcasting is a powerful NumPy feature that allows operations between arrays of different shapes.
    `,
    examples: [
      {
        input: 'matrix = [[1, 2, 3], [4, 5, 6]], vector = [10, 20, 30]',
        output: '[[11, 22, 33], [14, 25, 36]]',
        explanation: 'Vector is added to each row',
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
        Result matrix of shape (m, n)
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
    ],
    hints: [
      'NumPy automatically broadcasts the vector across rows.',
      'Simply use the + operator - NumPy handles the rest!',
    ],
    solution: `import numpy as np

def broadcast_add(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
    """
    Add a vector to each row of a matrix using broadcasting.
    """
    return matrix + vector
`,
  },
];
