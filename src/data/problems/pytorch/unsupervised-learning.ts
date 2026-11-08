import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../unsupervised-learning.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const unsupervisedLearningPyTorch: Record<string, LanguageVariant> = {
  'kmeans-clustering': {
    note: 'Broadcast with unsqueeze to get all point-centroid differences at once, then take the norm over the feature dim and argmin over centroids.',
    starterCode: `import torch

def assign_clusters(X: torch.Tensor, centroids: torch.Tensor) -> torch.Tensor:
    """
    Assign each point to its nearest centroid.

    Args:
        X: Float data points of shape (n_samples, n_features)
        centroids: Float cluster centers of shape (k, n_features)

    Returns:
        int64 tensor of cluster assignments (shape: n_samples)
    """
    # Your code here
    pass
`,
    solution: `import torch

def assign_clusters(X: torch.Tensor, centroids: torch.Tensor) -> torch.Tensor:
    """
    Assign each point to its nearest centroid.
    """
    # (n, 1, d) - (1, k, d) -> (n, k, d) differences
    diffs = X.unsqueeze(1) - centroids.unsqueeze(0)

    # Euclidean distance from each point to each centroid: (n, k)
    distances = diffs.norm(dim=2)

    # Index of the closest centroid (first one wins ties)
    return distances.argmin(dim=1)
`,
    testCases: [
      {
        id: '1',
        description: 'Simple 2D case',
        input: 'assign_clusters(torch.tensor([[0.0, 0.0], [1.0, 1.0], [10.0, 10.0]]), torch.tensor([[0.0, 0.0], [10.0, 10.0]]))',
        expected: '[0, 0, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Three clusters',
        input: 'assign_clusters(torch.tensor([[0.0, 0.0], [5.0, 5.0], [10.0, 10.0]]), torch.tensor([[0.0, 0.0], [5.0, 5.0], [10.0, 10.0]]))',
        expected: '[0, 1, 2]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Tiebreaker (first centroid wins)',
        input: 'assign_clusters(torch.tensor([[5.0, 5.0]]), torch.tensor([[0.0, 0.0], [10.0, 10.0]]))',
        expected: '[0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Random points match a brute-force reference',
        input: `(lambda: (
    X := torch.randn(20, 3),
    C := torch.randn(4, 3),
    ref := ((X[:, None, :] - C[None, :, :]) ** 2).sum(dim=-1).argmin(dim=1),
    bool(torch.equal(assign_clusters(X, C), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'X.unsqueeze(1) has shape (n, 1, d); centroids.unsqueeze(0) has shape (1, k, d).',
      'diffs.norm(dim=2) gives the (n, k) Euclidean distances.',
      'distances.argmin(dim=1) picks the closest centroid.',
    ],
  },

  'pca-implementation': {
    note: 'Use X.mean(dim=0) and broadcasting.',
    starterCode: `import torch

def center_data(X: torch.Tensor) -> torch.Tensor:
    """
    Center the data by subtracting the mean of each feature.

    Args:
        X: Float data matrix of shape (n_samples, n_features)

    Returns:
        Centered data matrix of same shape
    """
    # Your code here
    pass
`,
    solution: `import torch

def center_data(X: torch.Tensor) -> torch.Tensor:
    """
    Center the data by subtracting the mean of each feature.
    """
    mean = X.mean(dim=0)  # (n_features,)
    return X - mean
`,
    testCases: [
      {
        id: '1',
        description: 'Basic centering',
        input: 'center_data(torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]))',
        expected: '[[-2.0, -2.0], [0.0, 0.0], [2.0, 2.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Already centered',
        input: 'center_data(torch.tensor([[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]]))',
        expected: '[[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Single column',
        input: 'center_data(torch.tensor([[10.0], [20.0], [30.0]]))',
        expected: '[[-10.0], [0.0], [10.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Columns of random data have zero mean',
        input: 'bool(torch.allclose(center_data(torch.randn(50, 4) * 3 + 7).mean(dim=0), torch.zeros(4), atol=1e-4))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'X.mean(dim=0) gives the mean of each column.',
      'Subtract it from X; broadcasting handles the rows.',
    ],
  },
};
