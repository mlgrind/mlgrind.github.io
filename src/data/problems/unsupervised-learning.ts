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
      {
        id: '4',
        description: 'Output shape matches number of samples',
        input: 'assign_clusters(np.random.randn(50, 3), np.random.randn(4, 3)).shape',
        expected: '(50,)',
        hidden: true,
      },
      {
        id: '5',
        description: 'All assignments in valid range',
        input: '(lambda: (assignments := assign_clusters(np.random.randn(20, 2), np.random.randn(5, 2)), bool(np.all(assignments >= 0) and np.all(assignments < 5)))[-1])()',
        expected: 'True',
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
      {
        id: '4',
        description: 'Centered data has zero column means',
        input: '(lambda: (X := np.array([[2.0, 4.0], [6.0, 8.0], [10.0, 12.0]]), centered := center_data(X), bool(np.allclose(centered.mean(axis=0), 0.0)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Output shape preserved',
        input: 'center_data(np.random.randn(15, 7)).shape',
        expected: '(15, 7)',
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
  {
    id: 'gmm-em',
    title: 'Gaussian Mixture Model (EM)',
    section: 'unsupervised-learning',
    difficulty: 'hard',
    description: `
## Gaussian Mixture Model with Expectation-Maximization (1D)

A Gaussian mixture models the density of \`x\` as a weighted sum of \`K\` Gaussians:
\`\`\`
p(x) = sum_k  pi_k * N(x | mu_k, var_k),     sum_k pi_k = 1
\`\`\`
EM alternates between softly assigning points to components (E-step) and re-estimating each component from its soft assignments (M-step). This problem uses **1-D data** (\`x\` has shape \`(n,)\`); each component has its own mean and variance. The initial parameters are passed in, so the result is deterministic.

Implement two functions.

### 1. \`gmm_e_step(x, means, variances, weights)\`: responsibilities in log space
\`\`\`
log N(x | mu, var) = -0.5 * log(2*pi*var) - (x - mu)^2 / (2*var)
log_joint[i, k]    = log(weights[k]) + log N(x_i | mu_k, var_k)        # (n, K)
log_px[i]          = logsumexp_k log_joint[i, k]                       # log p(x_i)
resp[i, k]         = exp(log_joint[i, k] - log_px[i])
log_likelihood     = sum_i log_px[i]
\`\`\`
Working in log space matters: for a point far from every component, all the densities underflow to \`0.0\` and the naive \`pdf / pdf.sum()\` becomes \`0/0 = nan\`.

Returns \`(resp, log_likelihood)\`, with \`resp\` of shape \`(n, K)\` (rows sum to 1) and \`log_likelihood\` a float.

### 2. \`gmm_em(x, means, variances, weights, n_iters, reg_covar=1e-6)\`
Repeat \`n_iters\` times:
1. **E-step** at the current parameters: \`resp, ll = gmm_e_step(...)\`; append \`ll\` to the history.
2. **M-step**:
\`\`\`
N_k        = sum_i resp[i, k]
weights_k  = N_k / n
means_k    = sum_i resp[i, k] * x_i / N_k
variances_k = sum_i resp[i, k] * (x_i - means_k)^2 / N_k  +  reg_covar
\`\`\`
(\`reg_covar\` stops a component from collapsing onto a single point; scikit-learn's \`GaussianMixture\` uses the same default.)

EM never decreases the likelihood, so \`log_likelihoods\` is **non-decreasing**.

### Expected Return Format
\`gmm_em\` returns a dictionary with these keys:
- \`'means'\`, \`'variances'\`, \`'weights'\`: final parameters, each of shape \`(K,)\`
- \`'log_likelihoods'\`: list of \`n_iters\` floats; entry \`t\` is the log-likelihood of the parameters **before** the \`t\`-th M-step (so entry 0 is the initial parameters)
    `,
    examples: [
      {
        input: 'gmm_e_step(np.array([0.0, 4.0]), means=[0, 4], variances=[1, 1], weights=[0.5, 0.5])',
        output: 'resp ≈ [[0.99966, 0.00034], [0.00034, 0.99966]], ll ≈ -3.2235',
        explanation: 'Each point is almost entirely explained by the component centred on it.',
      },
      {
        input: 'gmm_em(x, means=[-1, 1], variances=[1, 1], weights=[0.5, 0.5], n_iters=20) on two clusters at -3 and 3',
        output: 'means ≈ [-3, 3], log_likelihoods increasing',
        explanation: 'Starting near the middle, EM pulls each component onto one cluster.',
      },
    ],
    starterCode: `import numpy as np

def gmm_e_step(x, means, variances, weights):
    """
    E-step for a 1-D Gaussian mixture, computed in log space.

    Args:
        x: Data, shape (n,)
        means, variances, weights: Component parameters, each shape (K,)

    Returns:
        (resp, log_likelihood): responsibilities (n, K) and float sum_i log p(x_i)
    """
    # Your code here
    pass


def gmm_em(x, means, variances, weights, n_iters=10, reg_covar=1e-6):
    """
    Fit a 1-D Gaussian mixture with EM from the given initial parameters.

    Args:
        x: Data, shape (n,)
        means, variances, weights: Initial parameters, each shape (K,)
        n_iters: Number of EM iterations
        reg_covar: Added to every variance in the M-step

    Returns:
        dict with 'means', 'variances', 'weights' (each (K,)) and
        'log_likelihoods' (list of n_iters floats, before each M-step)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'E-step responsibilities for two points',
        input: '(lambda r: (np.round(r[0], 6).tolist(), round(r[1], 6)))(gmm_e_step(np.array([0.0, 4.0]), np.array([0.0, 4.0]), np.array([1.0, 1.0]), np.array([0.5, 0.5])))',
        expected: '([[0.999665, 0.000335], [0.000335, 0.999665]], -3.223501)',
        hidden: false,
      },
      {
        id: '2',
        description: 'EM recovers two clusters',
        input: `(lambda: (
    x := np.concatenate([np.random.randn(60) - 3, 0.5 * np.random.randn(40) + 3]),
    g := gmm_em(x, np.array([-1.0, 1.0]), np.array([1.0, 1.0]), np.array([0.5, 0.5]), 30),
    (np.round(g["means"], 1).tolist(), np.round(g["weights"], 1).tolist())
)[-1])()`,
        expected: '([-2.9, 3.0], [0.6, 0.4])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Log-likelihood is non-decreasing',
        input: `(lambda: (
    x := np.concatenate([np.random.randn(50), np.random.randn(50) * 2 + 5]),
    L := gmm_em(x, np.array([0.5, 1.0, 1.5]), np.array([4.0, 4.0, 4.0]), np.array([0.3, 0.3, 0.4]), 25)["log_likelihoods"],
    bool(len(L) == 25 and all(b >= a - 1e-9 for a, b in zip(L, L[1:])))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Log space: points far from every component',
        input: '(lambda r: (bool(np.all(np.isfinite(r[0]))), np.round(r[0], 6).tolist()))(gmm_e_step(np.array([-1000.0, 1000.0]), np.array([0.0, 1.0]), np.array([1.0, 1.0]), np.array([0.5, 0.5])))',
        expected: '(True, [[1.0, 0.0], [0.0, 1.0]])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Parameters after 3 EM iterations',
        input: '(lambda g: (np.round(g["means"], 6).tolist(), np.round(g["variances"], 6).tolist(), np.round(g["weights"], 6).tolist(), [round(v, 6) for v in g["log_likelihoods"]]))(gmm_em(np.array([-2.0, -1.5, -1.0, 0.5, 2.0, 2.5, 3.0]), np.array([-1.0, 1.0]), np.array([1.0, 1.0]), np.array([0.5, 0.5]), 3))',
        expected: '([-1.488781, 2.001145], [0.189915, 0.884933], [0.430137, 0.569863], [-15.125332, -12.582841, -12.057328])',
        hidden: true,
      },
      {
        id: '6',
        description: 'First log-likelihood is that of the initial parameters',
        input: '(lambda x: bool(np.isclose(gmm_em(x, np.array([0.0, 2.0]), np.array([1.0, 0.5]), np.array([0.6, 0.4]), 2)["log_likelihoods"][0], gmm_e_step(x, np.array([0.0, 2.0]), np.array([1.0, 0.5]), np.array([0.6, 0.4]))[1])))(np.random.randn(20))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Broadcast x[:, None] (n, 1) against the (K,) parameter arrays to get (n, K) log densities.',
      'logsumexp over components: m = max over k, then m + log(sum(exp(log_joint - m))). Responsibilities are exp(log_joint - log_px).',
      'M-step: N_k = resp.sum(0); weights = N_k / n; means = (resp * x[:, None]).sum(0) / N_k; variances use the NEW means, plus reg_covar.',
      'Record the log-likelihood from the E-step before updating the parameters.',
    ],
    solution: `import numpy as np

def gmm_e_step(x, means, variances, weights):
    x = np.asarray(x, dtype=float)[:, None]                    # (n, 1)
    means, variances, weights = (np.asarray(a, dtype=float) for a in (means, variances, weights))

    log_pdf = -0.5 * np.log(2 * np.pi * variances) - (x - means) ** 2 / (2 * variances)
    log_joint = np.log(weights) + log_pdf                      # (n, K)

    m = log_joint.max(axis=1, keepdims=True)
    log_px = m + np.log(np.exp(log_joint - m).sum(axis=1, keepdims=True))   # logsumexp
    resp = np.exp(log_joint - log_px)
    return resp, float(log_px.sum())


def gmm_em(x, means, variances, weights, n_iters=10, reg_covar=1e-6):
    x = np.asarray(x, dtype=float)
    means, variances, weights = (np.array(a, dtype=float) for a in (means, variances, weights))
    history = []

    for _ in range(n_iters):
        # E-step
        resp, ll = gmm_e_step(x, means, variances, weights)
        history.append(ll)

        # M-step
        Nk = resp.sum(axis=0)                                  # (K,)
        weights = Nk / len(x)
        means = (resp * x[:, None]).sum(axis=0) / Nk
        variances = (resp * (x[:, None] - means) ** 2).sum(axis=0) / Nk + reg_covar

    return {'means': means, 'variances': variances, 'weights': weights, 'log_likelihoods': history}
`,
  },
  {
    id: 'dbscan',
    title: 'DBSCAN Clustering',
    section: 'unsupervised-learning',
    difficulty: 'medium',
    description: `
## DBSCAN (Density-Based Spatial Clustering of Applications with Noise)

DBSCAN finds clusters of any shape as regions of high point density, and marks points in sparse regions as **noise**. Unlike k-means, you don't choose the number of clusters.

Implement \`dbscan(X, eps, min_samples)\` with the same semantics as scikit-learn's \`DBSCAN(eps, min_samples)\` (Euclidean metric).

### Definitions
- The **eps-neighbourhood** of point \`p\`: all points \`q\` with \`||p - q|| <= eps\`, **including \`p\` itself**.
- \`p\` is a **core point** if its neighbourhood has **at least \`min_samples\`** points (counting \`p\`).
- A **border point** is not core but lies in the neighbourhood of some core point.
- Everything else is **noise** (label \`-1\`).

### Algorithm (cluster ids in order of discovery)
\`\`\`
labels = [-1] * n;  cluster = 0
for p in 0 .. n-1:                       # scan in index order
    if labels[p] != -1 or p is not core:  continue
    labels[p] = cluster;  queue = [p]
    while queue:
        q = queue.pop(0)
        for each neighbour r of q (only expand from CORE points q):
            if labels[r] == -1:
                labels[r] = cluster
                if r is core: queue.append(r)
    cluster += 1
\`\`\`
- Only **core** points expand a cluster; border points join a cluster but don't spread it.
- A border point within reach of two clusters keeps the label of the **first cluster that reached it** (the one discovered earlier in the index-order scan). It is never reassigned.
- So cluster \`0\` contains the lowest-indexed core point, cluster \`1\` the lowest-indexed core point not in cluster \`0\`, and so on.

### Expected Return Format
- An int array of shape \`(n,)\`: \`-1\` for noise, otherwise the cluster id \`0, 1, 2, ...\`.
    `,
    examples: [
      {
        input: 'X = [[0], [0.3], [0.6], [1.4], [2.2], [2.5], [2.8], [10]], eps=0.9, min_samples=4',
        output: '[0, 0, 0, 0, 1, 1, 1, -1]',
        explanation: 'Core points are 0.6 and 2.2 (4 neighbours each, counting themselves). 1.4 is a border point of both; cluster 0 reaches it first. 10 is noise.',
      },
    ],
    starterCode: `import numpy as np

def dbscan(X, eps, min_samples):
    """
    DBSCAN clustering (Euclidean distance, same semantics as sklearn).

    Args:
        X: Data, shape (n, d)
        eps: Neighbourhood radius (distance <= eps counts, point itself included)
        min_samples: Minimum neighbourhood size for a core point

    Returns:
        Int labels of shape (n,): -1 for noise, clusters numbered 0, 1, ...
        in order of discovery when scanning points by index
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Two clusters and a noise point',
        input: 'dbscan(np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [10.0, 10.0], [10.0, 11.0], [11.0, 10.0], [50.0, 50.0]]), 1.5, 3).tolist()',
        expected: '[0, 0, 0, 1, 1, 1, -1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Shared border point goes to the first cluster',
        input: 'dbscan(np.array([[0.0], [0.3], [0.6], [1.4], [2.2], [2.5], [2.8], [10.0]]), 0.9, 4).tolist()',
        expected: '[0, 0, 0, 0, 1, 1, 1, -1]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Cluster ids follow index order of discovery',
        input: 'dbscan(np.array([[10.0], [0.0], [10.5], [0.5], [5.0], [11.0], [1.0]]), 0.6, 2).tolist()',
        expected: '[0, 1, 0, 1, -1, 0, 1]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Distance exactly eps counts and the point counts itself',
        input: 'dbscan(np.array([[0.0], [1.0], [3.0]]), 1.0, 2).tolist()',
        expected: '[0, 0, -1]',
        hidden: true,
      },
      {
        id: '5',
        description: 'min_samples = 1: every point is core',
        input: 'dbscan(np.array([[0.0], [5.0], [5.5], [20.0]]), 1.0, 1).tolist()',
        expected: '[0, 1, 1, 2]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Matches scikit-learn on random 2-D blobs',
        input: `(lambda: (
    X := np.concatenate([np.random.randn(15, 2) * 0.4, np.random.randn(15, 2) * 0.4 + 3, np.random.rand(5, 2) * 8 - 2]),
    dbscan(X, 0.6, 4).tolist()
)[-1])()`,
        expected: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, 0, -1, -1, -1]',
        hidden: true,
      },
      {
        id: '7',
        description: 'All points noise when nothing is dense',
        input: 'dbscan(np.array([[0.0, 0.0], [2.0, 0.0], [0.0, 2.0]]), 1.0, 2).tolist()',
        expected: '[-1, -1, -1]',
        hidden: true,
      },
    ],
    hints: [
      'Precompute all pairwise distances with broadcasting and the list of neighbours of each point (D[i] <= eps, which includes i itself).',
      'A point is core if len(neighbours[i]) >= min_samples.',
      'Scan p = 0..n-1; start a new cluster only at an unlabeled core point, then grow it with a queue, adding neighbours that are still unlabeled and enqueueing only those that are core.',
    ],
    solution: `import numpy as np

def dbscan(X, eps, min_samples):
    X = np.asarray(X, dtype=float)
    n = len(X)

    # Pairwise distances and eps-neighbourhoods (each point is its own neighbour)
    D = np.sqrt(((X[:, None, :] - X[None, :, :]) ** 2).sum(axis=-1))
    neighbours = [np.where(D[i] <= eps)[0] for i in range(n)]
    is_core = np.array([len(nb) >= min_samples for nb in neighbours])

    labels = np.full(n, -1, dtype=np.int64)
    cluster = 0
    for p in range(n):
        if labels[p] != -1 or not is_core[p]:
            continue
        labels[p] = cluster
        queue = [p]
        while queue:
            q = queue.pop(0)            # q is always a core point
            for r in neighbours[q]:
                if labels[r] == -1:
                    labels[r] = cluster
                    if is_core[r]:
                        queue.append(r)
        cluster += 1
    return labels
`,
  },
  {
    id: 'kmeans-full',
    title: 'K-Means from Scratch (k-means++ Init, Convergence, Empty Clusters)',
    section: 'unsupervised-learning',
    difficulty: 'hard',
    description: `
## K-Means from Scratch

Implement the complete k-means algorithm (Lloyd's algorithm): seeding with **k-means++**, alternating assignment and update steps, a convergence test, and a rule for clusters that end up empty.

You write two functions:
- \`kmeans_pp_init(X, k, seed=0)\`: k-means++ seeding, returns the \`(k, d)\` initial centroids
- \`kmeans(X, k, init='k-means++', max_iter=100, tol=1e-4, seed=0)\`: the full algorithm

### k-means++ seeding (follow exactly, so results are reproducible)
Create one generator \`rng = np.random.default_rng(seed)\` and draw every random number with \`u = rng.random()\`:
1. First centroid: the point at index \`floor(u * n)\`.
2. Each further centroid: compute \`D2[i]\`, the squared distance from point \`i\` to its **nearest already chosen** centroid, and \`cdf = cumsum(D2)\`. Pick the **first** index \`i\` with \`cdf[i] > u * cdf[-1]\`. This samples a point with probability proportional to \`D2\`.
3. If \`cdf[-1] == 0\` (every point coincides with a chosen centroid), pick index \`floor(u * n)\` instead.

### Lloyd iterations
Starting from the initial centroids \`C\` (k-means++ when \`init == 'k-means++'\`, otherwise \`init\` is a \`(k, d)\` array), repeat for \`it = 1, 2, ..., max_iter\`:
1. **Assign**: each point goes to its nearest centroid (squared Euclidean distance); ties go to the lowest centroid index.
2. **Update**: each non-empty cluster's centroid becomes the mean of its points.
3. **Empty clusters**: a cluster with no points is moved onto the point that is **farthest from its assigned centroid** in this iteration's assignment (largest squared distance; ties go to the lowest point index). If several clusters are empty, handle them in increasing cluster index, and a point can be used only once.
4. **Stop** if the labels did not change since the previous iteration, or if the largest centroid shift \`max_j ||C_new[j] - C[j]||\` is below \`tol\`.

\`\`\`
inertia = sum_i ||x_i - C[label_i]||^2
\`\`\`

### Expected Return Format
\`kmeans\` returns a dictionary with these keys:
- \`'centroids'\`: \`(k, d)\` float array, the centroids after the last update
- \`'labels'\`: \`(n,)\` int array, each point's nearest **returned** centroid (one final assignment step against the returned centroids)
- \`'inertia'\`: Python float, computed from those labels and centroids
- \`'n_iter'\`: int, the number of assign/update iterations performed (\`1 <= n_iter <= max_iter\`)
`,
    examples: [
      {
        input: 'kmeans(np.array([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=np.array([[1.0, 1.0], [5.0, 7.0]]))',
        output: "{'centroids': [[1.25, 1.5], [3.9, 5.1]], 'labels': [0, 0, 1, 1, 1, 1, 1], 'inertia': 8.525, 'n_iter': 3}",
        explanation: '(3, 4) is equally far from both initial centroids, so iteration 1 puts it in cluster 0 (lowest index); iteration 2 moves it to cluster 1; iteration 3 changes no label, so the loop stops.',
      },
      {
        input: 'kmeans_pp_init(np.array([[0.0, 0.0], [0.0, 1.0], [10.0, 10.0], [10.0, 11.0], [20.0, 0.0]]), 3, seed=0)',
        output: 'array([[10., 11.], [0., 0.], [20., 0.]])',
        explanation: 'The first draw u = 0.637 picks index floor(0.637 * 5) = 3; each later pick is drawn in proportion to the squared distance to the nearest centroid chosen so far.',
      },
    ],
    starterCode: `import numpy as np

def kmeans_pp_init(X, k, seed=0):
    """
    k-means++ seeding (see the description for the exact sampling rule).

    Args:
        X: Data, array of shape (n, d)
        k: Number of clusters
        seed: Seed for np.random.default_rng

    Returns:
        centroids: Initial centroids, array of shape (k, d)
    """
    # Your code here
    pass

def kmeans(X, k, init='k-means++', max_iter=100, tol=1e-4, seed=0):
    """
    Full k-means (Lloyd's algorithm).

    Args:
        X: Data, array of shape (n, d)
        k: Number of clusters
        init: 'k-means++' or an initial centroid array of shape (k, d)
        max_iter: Maximum number of assign/update iterations
        tol: Stop when the largest centroid shift is below tol
        seed: Seed for k-means++

    Returns:
        dict with 'centroids' (k, d), 'labels' (n,), 'inertia' (float), 'n_iter' (int)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Labels from given initial centroids',
        input: 'kmeans(np.array([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=np.array([[1.0, 1.0], [5.0, 7.0]]))["labels"].tolist()',
        expected: '[0, 0, 1, 1, 1, 1, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Final centroids',
        input: 'np.round(kmeans(np.array([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=np.array([[1.0, 1.0], [5.0, 7.0]]))["centroids"], 4).tolist()',
        expected: '[[1.25, 1.5], [3.9, 5.1]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'k-means++ picks (seed=0)',
        input: 'kmeans_pp_init(np.array([[0.0, 0.0], [0.0, 1.0], [10.0, 10.0], [10.0, 11.0], [20.0, 0.0]]), 3, seed=0).tolist()',
        expected: '[[10.0, 11.0], [0.0, 0.0], [20.0, 0.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'n_iter and inertia',
        input: '(lambda: (r := kmeans(np.array([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=np.array([[1.0, 1.0], [5.0, 7.0]])), (r["n_iter"], round(r["inertia"], 4)))[-1])()',
        expected: '(3, 8.525)',
        hidden: true,
      },
      {
        id: '5',
        description: 'max_iter=1: one update, then labels and inertia for the returned centroids',
        input: '(lambda: (r := kmeans(np.array([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=np.array([[1.0, 1.0], [1.5, 2.0]]), max_iter=1), (r["n_iter"], np.round(r["centroids"], 4).tolist(), r["labels"].tolist(), round(r["inertia"], 4)))[-1])()',
        expected: '(1, [[1.0, 1.0], [3.5, 4.5833]], [0, 0, 1, 1, 1, 1, 1], 11.2847)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Empty cluster is moved onto the farthest point',
        input: '(lambda: (r := kmeans(np.array([[0.0, 0.0], [1.0, 0.0], [0.0, 3.0], [10.0, 10.0], [11.0, 10.0]]), 3, init=np.array([[0.0, 0.0], [10.0, 10.0], [100.0, 100.0]])), (np.round(r["centroids"], 4).tolist(), r["labels"].tolist()))[-1])()',
        expected: '([[0.5, 0.0], [10.5, 10.0], [0.0, 3.0]], [0, 0, 2, 1, 1])',
        hidden: true,
      },
      {
        id: '7',
        description: 'Large tol stops after the first iteration',
        input: 'kmeans(np.array([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0], [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]]), 2, init=np.array([[1.0, 1.0], [1.5, 2.0]]), tol=10.0)["n_iter"]',
        expected: '1',
        hidden: true,
      },
      {
        id: '8',
        description: 'k-means++ picks, other seed',
        input: 'kmeans_pp_init(np.array([[0.0, 0.0], [0.0, 1.0], [10.0, 10.0], [10.0, 11.0], [20.0, 0.0]]), 4, seed=7).tolist()',
        expected: '[[10.0, 11.0], [20.0, 0.0], [0.0, 1.0], [0.0, 0.0]]',
        hidden: true,
      },
      {
        id: '9',
        description: 'Full run with k-means++ on three blobs',
        input: '(lambda: (X := np.vstack([np.random.randn(10, 2), np.random.randn(10, 2) + 6, np.random.randn(10, 2) + [6, -6]]), r := kmeans(X, 3, seed=1), (round(r["inertia"], 3), r["n_iter"], sorted(np.bincount(r["labels"]).tolist())))[-1])()',
        expected: '(52.505, 2, [10, 10, 10])',
        hidden: true,
      },
    ],
    hints: [
      'Compute all point-to-centroid squared distances at once with broadcasting: `((X[:, None, :] - C[None, :, :]) ** 2).sum(-1)` has shape (n, k).',
      'For the k-means++ draw, `np.sum(cdf <= u * cdf[-1])` is the first index whose cumulative weight exceeds `u * cdf[-1]`.',
      'Keep the previous labels to detect "no change", and compute the centroid shift before overwriting C.',
      'After the loop, run one more assignment so labels and inertia match the centroids you return.',
    ],
    solution: `import numpy as np

def kmeans_pp_init(X, k, seed=0):
    X = np.asarray(X, dtype=float)
    n = X.shape[0]
    rng = np.random.default_rng(seed)
    chosen = [int(rng.random() * n)]
    for _ in range(1, k):
        # Squared distance from every point to its nearest chosen centroid
        diff = X[:, None, :] - X[chosen][None, :, :]
        d2 = (diff ** 2).sum(axis=-1).min(axis=1)
        u = rng.random()
        cdf = np.cumsum(d2)
        if cdf[-1] == 0:
            chosen.append(int(u * n))
        else:
            # First index whose cumulative weight exceeds u * total
            chosen.append(min(int(np.sum(cdf <= u * cdf[-1])), n - 1))
    return X[chosen].copy()

def _assign(X, C):
    d2 = ((X[:, None, :] - C[None, :, :]) ** 2).sum(axis=-1)  # (n, k)
    return d2.argmin(axis=1), d2

def kmeans(X, k, init='k-means++', max_iter=100, tol=1e-4, seed=0):
    X = np.asarray(X, dtype=float)
    n = X.shape[0]
    if isinstance(init, str):
        C = kmeans_pp_init(X, k, seed)
    else:
        C = np.array(init, dtype=float)

    labels = None
    for n_iter in range(1, max_iter + 1):
        new_labels, d2 = _assign(X, C)
        new_C = C.copy()
        empty = []
        for j in range(k):
            members = new_labels == j
            if members.any():
                new_C[j] = X[members].mean(axis=0)
            else:
                empty.append(j)
        if empty:
            # Move each empty cluster onto the farthest point (each point used once)
            dist = d2[np.arange(n), new_labels].copy()
            for j in empty:
                far = int(dist.argmax())
                new_C[j] = X[far]
                dist[far] = -1.0

        shift = np.sqrt(((new_C - C) ** 2).sum(axis=1)).max()
        unchanged = labels is not None and np.array_equal(new_labels, labels)
        C, labels = new_C, new_labels
        if unchanged or shift < tol:
            break

    labels, d2 = _assign(X, C)
    inertia = float(d2[np.arange(n), labels].sum())
    return {'centroids': C, 'labels': labels, 'inertia': inertia, 'n_iter': n_iter}
`,
  },
];
