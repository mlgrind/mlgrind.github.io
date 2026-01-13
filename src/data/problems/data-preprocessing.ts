import { Problem } from '../../types';

export const dataPreprocessingProblems: Problem[] = [
  {
    id: 'normalize-features',
    title: 'Normalize Features',
    section: 'data-preprocessing',
    difficulty: 'easy',
    description: `
## Normalize Features (Min-Max Scaling)

Implement min-max normalization to scale features to the range [0, 1].

### Formula
\`\`\`
X_normalized = (X - X_min) / (X_max - X_min)
\`\`\`

### Function Signature
\`\`\`python
def normalize(arr: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- Input is a 1D array
- Array length: 2 <= n <= 1000
- All elements are finite numbers
    `,
    examples: [
      {
        input: 'np.array([1, 2, 3, 4, 5])',
        output: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        explanation: 'min=1, max=5, so (x-1)/(5-1) gives [0, 0.25, 0.5, 0.75, 1]',
      },
    ],
    starterCode: `import numpy as np

def normalize(arr: np.ndarray) -> np.ndarray:
    """
    Apply min-max normalization to scale values to [0, 1].

    Args:
        arr: Input array of numbers

    Returns:
        Normalized array with values in [0, 1]
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic normalization',
        input: '[1, 2, 3, 4, 5]',
        expected: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative values',
        input: '[-10, 0, 10]',
        expected: '[0.0, 0.5, 1.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Larger range',
        input: '[0, 50, 100]',
        expected: '[0.0, 0.5, 1.0]',
        hidden: true,
      },
    ],
    hints: [
      'Use np.min() and np.max() to find the range.',
      'Apply the formula: (x - min) / (max - min)',
    ],
    solution: `import numpy as np

def normalize(arr: np.ndarray) -> np.ndarray:
    """
    Apply min-max normalization to scale values to [0, 1].
    """
    arr_min = np.min(arr)
    arr_max = np.max(arr)
    return (arr - arr_min) / (arr_max - arr_min)
`,
  },
  {
    id: 'handle-missing-data',
    title: 'Handle Missing Data',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## Handle Missing Data

Replace NaN (missing) values in an array with the mean of non-NaN values.

### Function Signature
\`\`\`python
def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- Input is a 1D array
- Array contains at least one non-NaN value
- NaN values are represented as np.nan
    `,
    examples: [
      {
        input: 'np.array([1.0, np.nan, 3.0, np.nan, 5.0])',
        output: '[1.0, 3.0, 3.0, 3.0, 5.0]',
        explanation: 'Mean of [1, 3, 5] is 3, which replaces NaN values',
      },
    ],
    starterCode: `import numpy as np

def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
    """
    Replace NaN values with the mean of non-NaN values.

    Args:
        arr: Input array that may contain NaN values

    Returns:
        Array with NaN values replaced by the mean
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic case',
        input: '[1.0, float("nan"), 3.0, float("nan"), 5.0]',
        expected: '[1.0, 3.0, 3.0, 3.0, 5.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single NaN',
        input: '[2.0, 4.0, float("nan"), 6.0]',
        expected: '[2.0, 4.0, 4.0, 6.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'NaN at start',
        input: '[float("nan"), 10.0, 20.0]',
        expected: '[15.0, 10.0, 20.0]',
        hidden: true,
      },
    ],
    hints: [
      'Use np.isnan() to find NaN values.',
      'Use np.nanmean() to compute mean ignoring NaN values.',
      'Use boolean indexing to replace values.',
    ],
    solution: `import numpy as np

def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
    """
    Replace NaN values with the mean of non-NaN values.
    """
    arr = arr.copy()  # Don't modify original
    mean_val = np.nanmean(arr)
    arr[np.isnan(arr)] = mean_val
    return arr
`,
  },
  {
    id: 'one-hot-encode',
    title: 'One-Hot Encoding',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## One-Hot Encoding

Convert an array of categorical integers to one-hot encoded format.

### Function Signature
\`\`\`python
def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
\`\`\`

### Example
For labels [0, 1, 2] with 3 classes:
\`\`\`
[[1, 0, 0],
 [0, 1, 0],
 [0, 0, 1]]
\`\`\`

### Constraints
- Labels are integers in range [0, num_classes - 1]
- 1 <= num_classes <= 100
    `,
    examples: [
      {
        input: 'labels = [0, 1, 2, 1], num_classes = 3',
        output: '[[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0]]',
        explanation: 'Each label becomes a row with 1 at the label index',
      },
    ],
    starterCode: `import numpy as np

def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
    """
    Convert integer labels to one-hot encoded format.

    Args:
        labels: 1D array of integer labels
        num_classes: Total number of classes

    Returns:
        2D array of shape (len(labels), num_classes)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic encoding',
        input: '([0, 1, 2], 3)',
        expected: '[[1, 0, 0], [0, 1, 0], [0, 0, 1]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Repeated labels',
        input: '([0, 0, 1, 1], 2)',
        expected: '[[1, 0], [1, 0], [0, 1], [0, 1]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'More classes than used',
        input: '([0, 2], 4)',
        expected: '[[1, 0, 0, 0], [0, 0, 1, 0]]',
        hidden: true,
      },
    ],
    hints: [
      'Create a zeros matrix of shape (num_samples, num_classes).',
      'Use array indexing to set the appropriate positions to 1.',
      'np.eye() can be useful for creating one-hot encodings.',
    ],
    solution: `import numpy as np

def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
    """
    Convert integer labels to one-hot encoded format.
    """
    # Method 1: Using np.eye
    return np.eye(num_classes)[labels].astype(int)

    # Method 2: Manual approach
    # one_hot = np.zeros((len(labels), num_classes), dtype=int)
    # one_hot[np.arange(len(labels)), labels] = 1
    # return one_hot
`,
  },
];
