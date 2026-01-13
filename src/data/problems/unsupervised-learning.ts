import { Problem } from '../../types';

export const unsupervisedLearningProblems: Problem[] = [
  {
    id: 'kmeans-clustering',
    title: 'K-Means: Assign to Nearest Centroid',
    section: 'unsupervised-learning',
    difficulty: 'medium',
    description: `
## K-Means: Assign Points to Nearest Centroid

Implement the assignment step of K-means clustering: given data points and centroids, assign each point to its nearest centroid.

### Function Signature
\`\`\`python
def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
\`\`\`

### Args
- X: Data points of shape (n_samples, n_features)
- centroids: Cluster centers of shape (k, n_features)

### Returns
- Array of cluster assignments (integers 0 to k-1)

### Distance
Use Euclidean distance: sqrt(sum((x - c)^2))
    `,
    examples: [
      {
        input: 'X = [[0, 0], [1, 1], [10, 10]], centroids = [[0, 0], [10, 10]]',
        output: '[0, 0, 1]',
        explanation: 'First two points closer to centroid 0, last point closer to centroid 1',
      },
    ],
    starterCode: `import numpy as np

def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Assign each point to its nearest centroid.

    Args:
        X: Data points of shape (n_samples, n_features)
        centroids: Cluster centers of shape (k, n_features)

    Returns:
        Array of cluster assignments (shape: n_samples)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Simple 2D case',
        input: '([[0, 0], [1, 1], [10, 10]], [[0, 0], [10, 10]])',
        expected: '[0, 0, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Three clusters',
        input: '([[0, 0], [5, 5], [10, 10]], [[0, 0], [5, 5], [10, 10]])',
        expected: '[0, 1, 2]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Tiebreaker (first centroid wins)',
        input: '([[5, 5]], [[0, 0], [10, 10]])',
        expected: '[0]',
        hidden: true,
      },
    ],
    hints: [
      'Calculate distance from each point to each centroid.',
      'Use np.linalg.norm() for Euclidean distance.',
      'Use np.argmin() to find the closest centroid.',
    ],
    solution: `import numpy as np

def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Assign each point to its nearest centroid.
    """
    # Calculate distances from each point to each centroid
    # Using broadcasting: X[:, np.newaxis] has shape (n, 1, d)
    # centroids has shape (k, d)
    # Difference has shape (n, k, d)
    distances = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)

    # Return index of minimum distance for each point
    return np.argmin(distances, axis=1)
`,
  },
  {
    id: 'pca-implementation',
    title: 'PCA: Center Data',
    section: 'unsupervised-learning',
    difficulty: 'easy',
    description: `
## PCA: Center the Data

The first step in PCA is to center the data by subtracting the mean of each feature.

### Function Signature
\`\`\`python
def center_data(X: np.ndarray) -> np.ndarray:
\`\`\`

### Args
- X: Data matrix of shape (n_samples, n_features)

### Returns
- Centered data where each column has mean 0

### Why Center?
Centering ensures PCA finds directions of maximum variance from the origin, not from an arbitrary point.
    `,
    examples: [
      {
        input: 'X = [[1, 2], [3, 4], [5, 6]]',
        output: '[[-2, -2], [0, 0], [2, 2]]',
        explanation: 'Column means are [3, 4], so we subtract them',
      },
    ],
    starterCode: `import numpy as np

def center_data(X: np.ndarray) -> np.ndarray:
    """
    Center the data by subtracting the mean of each feature.

    Args:
        X: Data matrix of shape (n_samples, n_features)

    Returns:
        Centered data matrix of same shape
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic centering',
        input: '[[1, 2], [3, 4], [5, 6]]',
        expected: '[[-2.0, -2.0], [0.0, 0.0], [2.0, 2.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Already centered',
        input: '[[-1, -1], [0, 0], [1, 1]]',
        expected: '[[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Single column',
        input: '[[10], [20], [30]]',
        expected: '[[-10.0], [0.0], [10.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Calculate the mean of each column using np.mean() with axis=0.',
      'Subtract the mean from the data (broadcasting handles this).',
    ],
    solution: `import numpy as np

def center_data(X: np.ndarray) -> np.ndarray:
    """
    Center the data by subtracting the mean of each feature.
    """
    mean = np.mean(X, axis=0)
    return X - mean
`,
  },
];
