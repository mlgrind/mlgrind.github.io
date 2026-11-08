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
  'kmeans-full': {
    note: "Use broadcasting for distances (torch.cdist isn't supported in the browser). The k-means++ draws come from np.random.default_rng(seed) in both tracks, so results match the NumPy track.",
    starterCode: `import numpy as np
import torch

def kmeans_pp_init(X, k, seed=0):
    """
    k-means++ seeding (see the description for the exact sampling rule).
    Draw the random numbers with rng = np.random.default_rng(seed); u = rng.random().

    Args:
        X: Data, float tensor (n, d)
        k: Number of clusters
        seed: Seed for np.random.default_rng

    Returns:
        centroids: Initial centroids, tensor (k, d)
    """
    # Your code here
    pass

def kmeans(X, k, init='k-means++', max_iter=100, tol=1e-4, seed=0):
    """
    Full k-means (Lloyd's algorithm).

    Args:
        X: Data, float tensor (n, d)
        k: Number of clusters
        init: 'k-means++' or an initial centroid tensor (k, d)
        max_iter: Maximum number of assign/update iterations
        tol: Stop when the largest centroid shift is below tol
        seed: Seed for k-means++

    Returns:
        dict with 'centroids' (k, d) tensor, 'labels' (n,) int64 tensor,
        'inertia' (float), 'n_iter' (int)
    """
    # Your code here
    pass
`,
    solution: `import numpy as np
import torch

def kmeans_pp_init(X, k, seed=0):
    n = X.shape[0]
    rng = np.random.default_rng(seed)
    chosen = [int(rng.random() * n)]
    for _ in range(1, k):
        # Squared distance from every point to its nearest chosen centroid
        d2 = ((X[:, None, :] - X[chosen][None, :, :]) ** 2).sum(dim=-1).min(dim=1).values
        u = rng.random()
        cdf = torch.cumsum(d2, dim=0)
        total = cdf[-1].item()
        if total == 0:
            chosen.append(int(u * n))
        else:
            chosen.append(min(int((cdf <= u * total).sum().item()), n - 1))
    return X[chosen].clone()

def _assign(X, C):
    d2 = ((X[:, None, :] - C[None, :, :]) ** 2).sum(dim=-1)  # (n, k)
    return d2.argmin(dim=1), d2

def kmeans(X, k, init='k-means++', max_iter=100, tol=1e-4, seed=0):
    X = X.float()
    n = X.shape[0]
    C = kmeans_pp_init(X, k, seed) if isinstance(init, str) else init.float().clone()

    labels = None
    for n_iter in range(1, max_iter + 1):
        new_labels, d2 = _assign(X, C)
        new_C = C.clone()
        empty = []
        for j in range(k):
            members = new_labels == j
            if members.any():
                new_C[j] = X[members].mean(dim=0)
            else:
                empty.append(j)
        if empty:
            # Move each empty cluster onto the farthest point (each point used once)
            dist = d2[torch.arange(n), new_labels].clone()
            for j in empty:
                far = int(dist.argmax().item())
                new_C[j] = X[far]
                dist[far] = -1.0

        shift = ((new_C - C) ** 2).sum(dim=1).sqrt().max().item()
        unchanged = labels is not None and bool(torch.equal(new_labels, labels))
        C, labels = new_C, new_labels
        if unchanged or shift < tol:
            break

    labels, d2 = _assign(X, C)
    inertia = d2[torch.arange(n), labels].sum().item()
    return {'centroids': C, 'labels': labels, 'inertia': inertia, 'n_iter': n_iter}
`,
    testCases: [
      {
        id: '1',
        description: 'Labels from given initial centroids',
        input: 'kmeans(torch.tensor([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=torch.tensor([[1.0, 1.0], [5.0, 7.0]]))["labels"].tolist()',
        expected: '[0, 0, 1, 1, 1, 1, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Final centroids',
        input: '[[round(v, 4) for v in row] for row in kmeans(torch.tensor([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=torch.tensor([[1.0, 1.0], [5.0, 7.0]]))["centroids"].tolist()]',
        expected: '[[1.25, 1.5], [3.9, 5.1]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'k-means++ picks (seed=0)',
        input: 'kmeans_pp_init(torch.tensor([[0.0, 0.0], [0.0, 1.0], [10.0, 10.0], [10.0, 11.0], [20.0, 0.0]]), 3, seed=0).tolist()',
        expected: '[[10.0, 11.0], [0.0, 0.0], [20.0, 0.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'n_iter and inertia',
        input: '(lambda: (r := kmeans(torch.tensor([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=torch.tensor([[1.0, 1.0], [5.0, 7.0]])), (r["n_iter"], round(r["inertia"], 3)))[-1])()',
        expected: '(3, 8.525)',
        hidden: true,
      },
      {
        id: '5',
        description: 'max_iter=1: one update, then labels and inertia for the returned centroids',
        input: '(lambda: (r := kmeans(torch.tensor([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=torch.tensor([[1.0, 1.0], [1.5, 2.0]]), max_iter=1), (r["n_iter"], [[round(v, 4) for v in row] for row in r["centroids"].tolist()], r["labels"].tolist(), round(r["inertia"], 3)))[-1])()',
        expected: '(1, [[1.0, 1.0], [3.5, 4.5833]], [0, 0, 1, 1, 1, 1, 1], 11.285)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Empty cluster is moved onto the farthest point',
        input: '(lambda: (r := kmeans(torch.tensor([[0.0, 0.0], [1.0, 0.0], [0.0, 3.0], [10.0, 10.0], [11.0, 10.0]]), 3, init=torch.tensor([[0.0, 0.0], [10.0, 10.0], [100.0, 100.0]])), ([[round(v, 4) for v in row] for row in r["centroids"].tolist()], r["labels"].tolist()))[-1])()',
        expected: '([[0.5, 0.0], [10.5, 10.0], [0.0, 3.0]], [0, 0, 2, 1, 1])',
        hidden: true,
      },
      {
        id: '7',
        description: 'Large tol stops after the first iteration',
        input: 'kmeans(torch.tensor([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=torch.tensor([[1.0, 1.0], [1.5, 2.0]]), tol=10.0)["n_iter"]',
        expected: '1',
        hidden: true,
      },
      {
        id: '8',
        description: 'k-means++ picks, other seed',
        input: 'kmeans_pp_init(torch.tensor([[0.0, 0.0], [0.0, 1.0], [10.0, 10.0], [10.0, 11.0], [20.0, 0.0]]), 4, seed=7).tolist()',
        expected: '[[10.0, 11.0], [20.0, 0.0], [0.0, 1.0], [0.0, 0.0]]',
        hidden: true,
      },
      {
        id: '9',
        description: 'Full run with k-means++ on three blobs',
        input: '(lambda: (X := torch.from_numpy(np.vstack([np.random.randn(10, 2), np.random.randn(10, 2) + 6, np.random.randn(10, 2) + [6, -6]])).float(), r := kmeans(X, 3, seed=1), (round(r["inertia"], 1), r["n_iter"], sorted(torch.bincount(r["labels"]).tolist())))[-1])()',
        expected: '(52.5, 2, [10, 10, 10])',
        hidden: true,
      },
    ],
  },
};
