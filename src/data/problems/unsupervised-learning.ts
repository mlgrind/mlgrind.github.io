import { Problem } from '../../types';

export const unsupervisedLearningProblems: Problem[] = [
  {
    id: 'kmeans-clustering',
    title: 'K-Means: Assign to Nearest Centroid',
    section: 'unsupervised-learning',
    difficulty: 'medium',
    description: `
## K-Means: Assign to Nearest Centroid

### What you'll build
The **assignment step** of k-means: given data points and centroids, return the index of the nearest centroid for every point, without a Python loop over points.

### Background
k-means alternates two steps: *assign* each point to its nearest centroid, then *update* each centroid to the mean of its points. The assignment step is where almost all of the compute goes, \`O(n * k * d)\` per iteration, so vectorising it is the main skill being tested. The same pairwise-distance pattern powers k-NN and vector search. (The full algorithm is **K-Means from Scratch** later in this section.)

### Formula
\`\`\`text
d(i, j)  = sqrt( sum_f (X[i, f] - centroids[j, f])^2 )      # Euclidean distance
label[i] = argmin_j d(i, j)
\`\`\`
The square root doesn't change which centroid is nearest, so comparing squared distances gives the same labels.

### Inputs
- \`X\`: data points, shape \`(n_samples, n_features)\`
- \`centroids\`: cluster centres, shape \`(k, n_features)\`

(Tests may pass nested Python lists; \`np.asarray\` them.)

### Expected return format
An integer array of shape \`(n_samples,)\` with values in \`0 .. k-1\`.

### Edge cases and conventions
- **Ties**: a point equally far from several centroids goes to the **lowest centroid index** (what \`np.argmin\` returns).

### Constraints
- NumPy only, vectorised with broadcasting: \`X[:, None, :] - centroids[None, :, :]\` has shape \`(n, k, d)\`.

### Follow-up
- For large \`n\` and \`d\`, avoid the \`(n, k, d)\` intermediate with \`||x||^2 - 2 x.c + ||c||^2\` (one matrix multiply). What numerical issue can that introduce?
    `,
    examples: [
      {
        input: 'assign_clusters(np.array([[0, 0], [1, 1], [10, 10]]), np.array([[0, 0], [10, 10]]))',
        output: '[0, 0, 1]',
        explanation: '(1, 1) is at distance 1.41 from centroid 0 and 12.7 from centroid 1.',
      },
      {
        input: 'assign_clusters(np.array([[5, 5]]), np.array([[0, 0], [10, 10]]))',
        output: '[0]',
        explanation: 'Equidistant from both centroids: the tie goes to the lower index.',
      },
    ],
    starterCode: `import numpy as np

def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Assign each point to its nearest centroid (Euclidean distance).

    Args:
        X: Data points, shape (n_samples, n_features)
        centroids: Cluster centres, shape (k, n_features)

    Returns:
        Int array of shape (n_samples,) with values in 0..k-1
        (ties go to the lowest centroid index)
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
      {
        id: '6',
        description: 'Matches a per-point loop on random data',
        input: '(lambda: (X := np.random.randn(30, 4), C := np.random.randn(6, 4), ref := [int(np.argmin([np.sum((x - c) ** 2) for c in C])) for x in X], assign_clusters(X, C).tolist() == ref)[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'You need the distance from every point to every centroid: an (n, k) table. Then pick the smallest entry in each row.',
      'Broadcasting builds all differences at once: X[:, None, :] has shape (n, 1, d) and centroids[None, :, :] has shape (1, k, d).',
      'np.linalg.norm(diff, axis=2) (or (diff ** 2).sum(axis=2)) gives the (n, k) distances; np.argmin(..., axis=1) picks the closest centroid.',
      'Reduce over the feature axis (axis=2), not the centroid axis; and argmin over axis=1 already breaks ties towards the lowest index.',
    ],
    solution: `import numpy as np

def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Assign each point to its nearest centroid (ties -> lowest index).
    """
    X = np.asarray(X, dtype=float)
    C = np.asarray(centroids, dtype=float)

    # (n, 1, d) - (1, k, d) -> (n, k, d); squared distances are enough for argmin
    d2 = ((X[:, None, :] - C[None, :, :]) ** 2).sum(axis=2)   # (n, k)
    return np.argmin(d2, axis=1)                             # first minimum on ties

# Time O(n * k * d), extra space O(n * k * d) for the broadcast.
`,
  },
  {
    id: 'pca-implementation',
    title: 'PCA Step 1: Center the Data',
    section: 'unsupervised-learning',
    difficulty: 'easy',
    description: `
## PCA Step 1: Center the Data

### What you'll build
The first step of Principal Component Analysis: subtract each feature's mean so every column of the data has mean 0.

### Background
PCA looks for the directions along which the data varies most, which are the eigenvectors of the covariance matrix \`Xc^T Xc / (n - 1)\`. That formula is only the covariance if \`Xc\` is **centred**. Skip this step and the first "principal component" points from the origin towards the data's mean instead of along its spread. scikit-learn's \`PCA\` centres automatically and stores the mean as \`mean_\`, which it reuses to transform new data.

### Formula
\`\`\`text
mu[f]     = (1/n) * sum_i X[i, f]          # column means, shape (n_features,)
Xc[i, f]  = X[i, f] - mu[f]
\`\`\`

### Inputs
- \`X\`: data matrix of shape \`(n_samples, n_features)\`, ints or floats (tests may pass nested lists)

### Expected return format
A float array with the same shape as \`X\`, whose column means are all 0 (up to floating-point error).

### Edge cases and conventions
- Means are taken **per column** (\`axis=0\`), not over the whole matrix.
- Already-centred data comes back unchanged; a single column works the same way.
- Don't modify the input; return a new array.

### Constraints
- NumPy only, no loops: broadcasting subtracts the \`(n_features,)\` mean from every row.

### Follow-up
- Finish PCA: compute the covariance, take \`np.linalg.eigh\`, sort the eigenvalues in descending order and project onto the top \`k\` eigenvectors. Why is the SVD of \`Xc\` often preferred?
- At inference time, which mean do you subtract from a new sample?
    `,
    examples: [
      {
        input: 'center_data(np.array([[1, 2], [3, 4], [5, 6]]))',
        output: '[[-2.0, -2.0], [0.0, 0.0], [2.0, 2.0]]',
        explanation: 'The column means are [3, 4]; subtracting them from every row centres each column.',
      },
      {
        input: 'center_data(np.array([[10], [20], [30]]))',
        output: '[[-10.0], [0.0], [10.0]]',
        explanation: 'A single feature with mean 20.',
      },
    ],
    starterCode: `import numpy as np

def center_data(X: np.ndarray) -> np.ndarray:
    """
    Center the data by subtracting the mean of each feature (column).

    Args:
        X: Data matrix of shape (n_samples, n_features)

    Returns:
        Float array of the same shape whose columns have mean 0
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
      {
        id: '6',
        description: 'Random matrix: equals X minus its column means',
        input: '(lambda: (X := np.random.randn(8, 3) * [1.0, 10.0, 0.1] + [5.0, -2.0, 0.3], bool(np.allclose(center_data(X), X - X.mean(axis=0))))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Each feature (column) gets its own mean. Which axis do you average over?',
      'Compute one mean per column, then subtract that row vector from every row.',
      'np.mean(X, axis=0) has shape (n_features,), and X - mean broadcasts it over the rows.',
      'axis=1 (row means) or a single global np.mean(X) gives the wrong answer; convert to float so integer input returns floats.',
    ],
    solution: `import numpy as np

def center_data(X: np.ndarray) -> np.ndarray:
    """
    Center the data by subtracting the mean of each feature (column).
    """
    X = np.asarray(X, dtype=float)
    mu = X.mean(axis=0)          # (n_features,): one mean per column
    return X - mu                # broadcasts over the rows; returns a new array

# Time and space O(n * d).
`,
  },
  {
    id: 'gmm-em',
    title: 'Gaussian Mixture Model (EM)',
    section: 'unsupervised-learning',
    difficulty: 'hard',
    description: `
## Gaussian Mixture Model (EM)

### What you'll build
Two functions for a 1-D Gaussian mixture: a numerically stable **E-step** that computes responsibilities in log space, and the full **EM loop** that fits the weights, means and variances from given initial values.

### Background
A Gaussian mixture models the density of \`x\` as a weighted sum of \`K\` Gaussians. It is "soft k-means": instead of a hard label, each point gets a probability (**responsibility**) for each component. EM alternates between computing responsibilities from the current parameters (E-step) and re-estimating the parameters from the responsibilities (M-step), and the log-likelihood never decreases. scikit-learn's \`GaussianMixture\` does the same with full covariance matrices in higher dimensions.

### Model
\`\`\`text
p(x) = sum_k  weights[k] * N(x | means[k], variances[k]),      sum_k weights[k] = 1
log N(x | mu, var) = -0.5 * log(2*pi*var) - (x - mu)^2 / (2*var)
\`\`\`

### 1. \`gmm_e_step(x, means, variances, weights)\`
\`\`\`text
log_joint[i, k] = log(weights[k]) + log N(x[i] | means[k], variances[k])     # (n, K)
log_px[i]       = logsumexp_k log_joint[i, k]                               # log p(x_i)
resp[i, k]      = exp(log_joint[i, k] - log_px[i])
log_likelihood  = sum_i log_px[i]
logsumexp(a)    = max(a) + log(sum(exp(a - max(a))))
\`\`\`

### 2. \`gmm_em(x, means, variances, weights, n_iters, reg_covar=1e-6)\`
Repeat \`n_iters\` times:
1. **E-step** at the current parameters: \`resp, ll = gmm_e_step(...)\`; append \`ll\` to the history.
2. **M-step**, with \`N_k = sum_i resp[i, k]\`:
\`\`\`text
weights[k]   = N_k / n
means[k]     = sum_i resp[i, k] * x[i] / N_k
variances[k] = sum_i resp[i, k] * (x[i] - means[k])^2 / N_k  +  reg_covar     # uses the NEW means
\`\`\`

### Inputs
- \`x\`: 1-D float array, shape \`(n,)\`
- \`means\`, \`variances\`, \`weights\`: initial parameters, each shape \`(K,)\`; variances \`> 0\`, weights sum to 1
- \`n_iters\`: number of EM iterations (\`>= 1\`); \`reg_covar\`: small float added to every variance

### Expected Return Format
- \`gmm_e_step\` returns a tuple \`(resp, log_likelihood)\`: \`resp\` has shape \`(n, K)\` with rows summing to 1, and \`log_likelihood\` is a Python float.
- \`gmm_em\` returns a dictionary with these keys:
  - \`'means'\`, \`'variances'\`, \`'weights'\`: final parameters, each shape \`(K,)\`
  - \`'log_likelihoods'\`: list of \`n_iters\` floats; entry \`t\` is the log-likelihood **before** the \`t\`-th M-step (entry 0 belongs to the initial parameters)

### Edge cases and conventions
- **Underflow**: for a point far from every component all densities are \`0.0\` in floating point, and the naive \`pdf / pdf.sum()\` gives \`0/0 = nan\`. Log space with logsumexp avoids it.
- \`reg_covar\` (default \`1e-6\`, as in scikit-learn) stops a component from collapsing onto a single point with variance 0.
- The log-likelihood history is non-decreasing (up to floating-point error).

### Constraints
- NumPy only, vectorised over points and components.

### Follow-up
- How would you choose \`K\`? (BIC/AIC, held-out likelihood.)
- Show that k-means is the limit of EM with equal, shared variances shrinking to 0.
    `,
    examples: [
      {
        input: 'gmm_e_step(np.array([0.0, 4.0]), np.array([0.0, 4.0]), np.array([1.0, 1.0]), np.array([0.5, 0.5]))',
        output: '(array([[0.999665, 0.000335], [0.000335, 0.999665]]), -3.223501)',
        explanation: 'Each point is almost entirely explained by the component centred on it (values rounded to 6 decimals).',
      },
      {
        input: 'gmm_em(x, np.array([-1.0, 1.0]), np.array([1.0, 1.0]), np.array([0.5, 0.5]), 30), where x has 60 points around -3 and 40 points around 3',
        output: "means ≈ [-2.9, 3.0], weights ≈ [0.6, 0.4]",
        explanation: 'Starting near the middle, EM pulls each component onto one cluster and the weights converge to the cluster fractions.',
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
      'Think of the E-step as Bayes rule per point: prior weight times likelihood, normalised over components. Do it with logs.',
      'Broadcast x[:, None] (n, 1) against the (K,) parameter arrays to get the (n, K) log-joint table; the M-step is then three weighted averages over axis 0.',
      'logsumexp: m = log_joint.max(axis=1, keepdims=True); log_px = m + np.log(np.exp(log_joint - m).sum(axis=1, keepdims=True)); resp = np.exp(log_joint - log_px).',
      'Record the log-likelihood before updating the parameters, compute the variances with the NEW means, and add reg_covar.',
    ],
    solution: `import numpy as np

def gmm_e_step(x, means, variances, weights):
    """
    Returns (resp (n, K), log_likelihood float), computed in log space.
    """
    x = np.asarray(x, dtype=float)[:, None]                    # (n, 1)
    means, variances, weights = (np.asarray(a, dtype=float) for a in (means, variances, weights))

    log_pdf = -0.5 * np.log(2 * np.pi * variances) - (x - means) ** 2 / (2 * variances)
    log_joint = np.log(weights) + log_pdf                      # (n, K)

    # logsumexp over components: subtract the row max so exp never overflows
    m = log_joint.max(axis=1, keepdims=True)
    log_px = m + np.log(np.exp(log_joint - m).sum(axis=1, keepdims=True))
    resp = np.exp(log_joint - log_px)
    return resp, float(log_px.sum())


def gmm_em(x, means, variances, weights, n_iters=10, reg_covar=1e-6):
    """
    Returns dict with 'means', 'variances', 'weights' (K,) and 'log_likelihoods' (list).
    """
    x = np.asarray(x, dtype=float)
    means, variances, weights = (np.array(a, dtype=float) for a in (means, variances, weights))
    history = []

    for _ in range(n_iters):
        # E-step at the current parameters
        resp, ll = gmm_e_step(x, means, variances, weights)
        history.append(ll)

        # M-step: responsibility-weighted averages
        Nk = resp.sum(axis=0)                                  # (K,)
        weights = Nk / len(x)
        means = (resp * x[:, None]).sum(axis=0) / Nk
        variances = (resp * (x[:, None] - means) ** 2).sum(axis=0) / Nk + reg_covar

    return {'means': means, 'variances': variances, 'weights': weights, 'log_likelihoods': history}

# Each iteration costs O(n * K) time and space.
`,
  },
  {
    id: 'dbscan',
    title: 'DBSCAN Clustering',
    section: 'unsupervised-learning',
    difficulty: 'medium',
    description: `
## DBSCAN Clustering

### What you'll build
\`dbscan(X, eps, min_samples)\`: density-based clustering that returns a cluster id for every point, or \`-1\` for noise, with the same labels as scikit-learn's \`DBSCAN(eps=eps, min_samples=min_samples)\` (Euclidean metric).

### Background
DBSCAN (Density-Based Spatial Clustering of Applications with Noise) finds clusters of any shape as regions where points are packed densely, and labels points in sparse regions as noise. Unlike k-means you don't choose the number of clusters, and outliers don't drag centroids around. It is a common choice for anomaly detection and geospatial data.

### Definitions
- The **eps-neighbourhood** of point \`p\`: all points \`q\` with \`||p - q|| <= eps\`, **including \`p\` itself**.
- \`p\` is a **core point** if its neighbourhood has **at least \`min_samples\`** points (counting \`p\`), as in scikit-learn.
- A **border point** is not core but lies in the neighbourhood of some core point.
- Everything else is **noise** (label \`-1\`).

### Algorithm
\`\`\`text
labels = [-1] * n;  cluster = 0
for p in 0 .. n-1:                        # scan in index order
    if labels[p] != -1 or p is not core:  continue
    labels[p] = cluster;  queue = [p]
    while queue:
        q = queue.pop(0)                  # q is always a core point
        for each neighbour r of q:
            if labels[r] == -1:
                labels[r] = cluster
                if r is core: queue.append(r)
    cluster += 1
\`\`\`
1. Only **core** points expand a cluster; border points join a cluster but don't spread it.
2. Clusters are numbered in order of discovery: cluster \`0\` contains the lowest-indexed core point, cluster \`1\` the lowest-indexed core point not in cluster \`0\`, and so on.

### Inputs
- \`X\`: data, shape \`(n, d)\`
- \`eps\`: neighbourhood radius (\`> 0\`); a distance exactly equal to \`eps\` counts
- \`min_samples\`: minimum neighbourhood size (point included) for a core point, \`>= 1\`

### Expected Return Format
An int array of shape \`(n,)\`: \`-1\` for noise, otherwise the cluster id \`0, 1, 2, ...\`.

### Edge cases and conventions
- A **border point within reach of two clusters** keeps the label of the first cluster that reached it (the one discovered earlier) and is never reassigned. This is also what scikit-learn does; it is the one order-dependent part of DBSCAN.
- \`min_samples = 1\`: every point is core, so isolated points become singleton clusters and nothing is noise.
- If no point is core, every label is \`-1\`.

### Constraints
- NumPy only (no sklearn). Vectorise the distance matrix; the cluster expansion is a plain loop.

### Follow-up
- How would you pick \`eps\`? (Plot each point's distance to its \`min_samples\`-th neighbour, sorted, and look for the knee.)
- The distance matrix is \`O(n^2)\` memory. How do spatial indexes (k-d trees, ball trees) help?
    `,
    examples: [
      {
        input: 'dbscan(np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [10.0, 10.0], [10.0, 11.0], [11.0, 10.0], [50.0, 50.0]]), 1.5, 3)',
        output: '[0, 0, 0, 1, 1, 1, -1]',
        explanation: 'Each corner triangle has 3 points within 1.5 of each other, so all are core; (50, 50) has only itself and is noise.',
      },
      {
        input: 'dbscan(np.array([[0.0], [0.3], [0.6], [1.4], [2.2], [2.5], [2.8], [10.0]]), 0.9, 4)',
        output: '[0, 0, 0, 0, 1, 1, 1, -1]',
        explanation: 'Only 0.6 and 2.2 are core (4 neighbours each, counting themselves). 1.4 is a border point of both and stays in cluster 0, which reaches it first.',
      },
    ],
    starterCode: `import numpy as np

def dbscan(X, eps, min_samples):
    """
    DBSCAN clustering (Euclidean distance, same labels as sklearn).

    Args:
        X: Data, shape (n, d)
        eps: Neighbourhood radius (distance <= eps counts, the point itself included)
        min_samples: Minimum neighbourhood size for a core point

    Returns:
        Int array of shape (n,): -1 for noise, clusters numbered 0, 1, ...
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
      'Split the work in two: decide which points are core (a pure function of the distances), then grow clusters outward from core points.',
      'Precompute the (n, n) distance matrix with broadcasting, each point\'s neighbour list (D[i] <= eps, which includes i) and an is_core mask (len(neighbours) >= min_samples).',
      'Scan p = 0..n-1; start a new cluster only at an unlabelled core point and grow it with a queue (a list or collections.deque): label unlabelled neighbours, and enqueue only the ones that are core.',
      'Pitfalls: forgetting that a point is its own neighbour, using < eps instead of <= eps, letting border points expand the cluster, or relabelling a border point that another cluster already claimed.',
    ],
    solution: `import numpy as np

def dbscan(X, eps, min_samples):
    """
    Returns int labels (n,): -1 for noise, clusters 0, 1, ... in discovery order.
    """
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
            q = queue.pop(0)            # only core points are ever enqueued
            for r in neighbours[q]:
                if labels[r] == -1:     # first cluster to reach a point keeps it
                    labels[r] = cluster
                    if is_core[r]:
                        queue.append(r)
        cluster += 1
    return labels

# Time and memory O(n^2) for the distance matrix; the expansion is O(n^2) worst case.
`,
  },
  {
    id: 'kmeans-full',
    title: 'K-Means from Scratch (k-means++ Init, Convergence, Empty Clusters)',
    section: 'unsupervised-learning',
    difficulty: 'hard',
    description: `
## K-Means from Scratch (k-means++ Init, Convergence, Empty Clusters)

### What you'll build
The complete k-means algorithm (Lloyd's algorithm): **k-means++** seeding, alternating assignment and update steps, a convergence test, and a rule for clusters that end up empty. Two functions:
- \`kmeans_pp_init(X, k, seed=0)\`: k-means++ seeding, returns the \`(k, d)\` initial centroids
- \`kmeans(X, k, init='k-means++', max_iter=100, tol=1e-4, seed=0)\`: the full algorithm

### Background
k-means minimises the inertia \`sum_i ||x_i - C[label_i]||^2\`. Each assignment step and each update step can only lower it, so the algorithm converges, but only to a local minimum: initialisation matters. k-means++ spreads the initial centroids out by sampling each new one with probability proportional to its squared distance from the centroids chosen so far, which gives an \`O(log k)\` approximation guarantee in expectation.

### k-means++ seeding (follow exactly, so results are reproducible)
Create one generator \`rng = np.random.default_rng(seed)\` and draw every random number with \`u = rng.random()\`:
1. First centroid: the point at index \`floor(u * n)\`.
2. Each further centroid: compute \`D2[i]\`, the squared distance from point \`i\` to its **nearest already chosen** centroid, and \`cdf = np.cumsum(D2)\`. Draw \`u\` and pick the **first** index \`i\` with \`cdf[i] > u * cdf[-1]\`.
3. If \`cdf[-1] == 0\` (every point coincides with a chosen centroid), pick index \`floor(u * n)\` instead (using the \`u\` already drawn for this centroid).

### Lloyd iterations
Start from the initial centroids \`C\` (k-means++ when \`init == 'k-means++'\`, otherwise \`init\` is a \`(k, d)\` array). For \`it = 1, 2, ..., max_iter\`:
1. **Assign**: each point goes to its nearest centroid by squared Euclidean distance; ties go to the lowest centroid index.
2. **Update**: each non-empty cluster's centroid becomes the mean of its points.
3. **Empty clusters**: a cluster with no points is moved onto the point **farthest from its assigned centroid** in this iteration's assignment (largest squared distance; ties go to the lowest point index). Handle several empty clusters in increasing cluster index; each point can be used only once.
4. **Stop** if the labels did not change since the previous iteration, or if the largest centroid shift \`max_j ||C_new[j] - C[j]||\` is below \`tol\`.

### Inputs
- \`X\`: data, shape \`(n, d)\`; \`k\`: number of clusters, \`1 <= k <= n\`
- \`init\`: \`'k-means++'\` or a \`(k, d)\` array of initial centroids
- \`max_iter\` (int \`>= 1\`), \`tol\` (absolute shift threshold), \`seed\` (int, used only by k-means++)

### Expected Return Format
\`kmeans_pp_init\` returns a \`(k, d)\` float array. \`kmeans\` returns a dictionary with these keys:
- \`'centroids'\`: \`(k, d)\` float array, the centroids after the last update
- \`'labels'\`: \`(n,)\` int array, each point's nearest **returned** centroid (one final assignment step against the returned centroids)
- \`'inertia'\`: Python float, \`sum_i ||x_i - centroids[labels_i]||^2\` for those labels
- \`'n_iter'\`: int, the number of assign/update iterations performed (\`1 <= n_iter <= max_iter\`)

### Differences from scikit-learn's \`KMeans\`
scikit-learn's k-means++ tries several candidates per step and keeps the best ("greedy k-means++"), scales \`tol\` by the data variance, and runs several initialisations (\`n_init\`). This problem uses the plain version so every number is reproducible.

### Constraints
- NumPy only; vectorise the distance computations.

### Follow-up
- How do you choose \`k\`? (Elbow on inertia, silhouette score.)
- What is mini-batch k-means, and when would you use it?
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
      'Structure the code as: initial centroids, then a loop of assign -> update -> fix empty clusters -> check convergence, then one final assignment for the returned labels and inertia.',
      'All point-to-centroid squared distances at once: ((X[:, None, :] - C[None, :, :]) ** 2).sum(-1) has shape (n, k); argmin over axis 1 assigns, and d2.min(axis=1) gives the k-means++ D2.',
      'For the k-means++ draw, int(np.sum(cdf <= u * cdf[-1])) is the first index whose cumulative weight exceeds u * cdf[-1].',
      'Pitfalls: draw exactly one u per centroid from a single generator, compute the centroid shift before overwriting C, and mark a point as used (e.g. set its distance to -1) after moving an empty cluster onto it.',
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

# Each iteration costs O(n * k * d) time; the broadcast uses O(n * k * d) memory.
`,
  },
];
