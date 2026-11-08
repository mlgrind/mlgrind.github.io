// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/supervised-learning.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const supervisedLearningPyTorchPending: Record<string, unknown> = {
  'knn-classifier': {
    note: 'Use torch.cdist or broadcasting for the distances, torch.argsort(..., stable=True) for the neighbour order and torch.bincount for the vote.',
    starterCode: `import torch

def knn_predict(X_train, y_train, X_test, k=3):
    """
    k-nearest neighbours classification with Euclidean distance.

    Args:
        X_train: Float tensor of training features, shape (n, d)
        y_train: int64 tensor of non-negative labels, shape (n,)
        X_test: Float tensor of query points, shape (m, d)
        k: Number of neighbours

    Returns:
        int64 tensor of predicted labels, shape (m,)
        (distance ties -> smaller training index first;
         vote ties -> smallest label)
    """
    # Your code here
    pass
`,
    solution: `import torch

def knn_predict(X_train, y_train, X_test, k=3):
    X_train, X_test = X_train.float(), X_test.float()
    n_classes = int(y_train.max()) + 1

    # Pairwise Euclidean distances, (m, n)
    D = ((X_test.unsqueeze(1) - X_train.unsqueeze(0)) ** 2).sum(dim=-1).sqrt()

    # Stable sort: equal distances keep training order
    nearest = torch.argsort(D, dim=1, stable=True)[:, :k]    # (m, k)

    preds = []
    for idx in nearest:
        votes = torch.bincount(y_train[idx], minlength=n_classes)
        preds.append(int(torch.argmax(votes)))   # first (smallest) label on ties
    return torch.tensor(preds, dtype=torch.int64)
`,
    testCases: [
      {
        id: '1',
        description: 'Two well-separated clusters',
        input: 'knn_predict(torch.tensor([[0.0, 0.0], [1.0, 0.0], [0.0, 1.0], [5.0, 5.0], [6.0, 5.0]]), torch.tensor([0, 0, 0, 1, 1]), torch.tensor([[0.5, 0.5], [5.5, 5.0]]), 3).tolist()',
        expected: '[0, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'k=1 returns the label of the nearest point',
        input: 'knn_predict(torch.tensor([[0.0], [3.0], [10.0]]), torch.tensor([2, 0, 1]), torch.tensor([[1.0], [2.0], [7.0], [100.0]]), 1).tolist()',
        expected: '[2, 0, 1, 1]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Vote tie goes to the smallest label',
        input: 'knn_predict(torch.tensor([[0.0], [2.0]]), torch.tensor([1, 0]), torch.tensor([[1.0]]), 2).tolist()',
        expected: '[0]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Distance tie: the smaller training index is taken first',
        input: 'knn_predict(torch.tensor([[-1.0], [1.0], [3.0]]), torch.tensor([2, 1, 1]), torch.tensor([[0.0]]), 1).tolist()',
        expected: '[2]',
        hidden: true,
      },
      {
        id: '5',
        description: 'k = n_train predicts the overall majority',
        input: 'knn_predict(torch.tensor([[0.0, 0.0], [9.0, 9.0], [9.0, 8.0], [8.0, 9.0]]), torch.tensor([0, 1, 1, 1]), torch.tensor([[0.0, 0.0], [0.1, 0.1]]), 4).tolist()',
        expected: '[1, 1]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Matches a brute-force reference on random 3-class data',
        input: `(lambda: (
    Xtr := torch.randn(40, 3),
    ytr := torch.randint(0, 3, (40,)),
    Xte := torch.randn(15, 3),
    ref := [int(torch.bincount(ytr[torch.argsort((Xtr - q).norm(dim=1), stable=True)[:5]], minlength=3).argmax()) for q in Xte],
    knn_predict(Xtr, ytr, Xte, 5).tolist() == ref
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      '(X_test.unsqueeze(1) - X_train.unsqueeze(0)) has shape (m, n, d); square, sum over dim=-1, sqrt.',
      'torch.argsort(D, dim=1, stable=True)[:, :k] keeps training order for equal distances.',
      'torch.bincount(labels, minlength=n_classes).argmax() picks the smallest label among tied counts.',
    ],
  },
  'naive-bayes': {
    note: 'Compute in log space and normalize with torch.logsumexp (or F.log_softmax). Return tensors.',
    starterCode: `import math
import torch

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    """
    Fit Gaussian Naive Bayes.

    Args:
        X: Float tensor of features, shape (n, d)
        y: int64 tensor of class labels, shape (n,)
        var_smoothing: Fraction of the largest feature variance added to all variances

    Returns:
        dict of tensors: 'classes' (C,), 'priors' (C,), 'means' (C, d), 'vars' (C, d)
    """
    # Your code here
    pass


def gaussian_nb_predict_proba(model, X):
    """
    Posterior class probabilities, computed in log space.

    Args:
        model: dict returned by gaussian_nb_fit
        X: Float tensor of features, shape (m, d)

    Returns:
        Tensor of probabilities, shape (m, C); rows sum to 1
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    X = X.float()
    classes = torch.unique(y)
    epsilon = var_smoothing * X.var(dim=0, unbiased=False).max()

    priors = torch.stack([(y == c).float().mean() for c in classes])
    means = torch.stack([X[y == c].mean(dim=0) for c in classes])
    variances = torch.stack([X[y == c].var(dim=0, unbiased=False) for c in classes]) + epsilon
    return {'classes': classes, 'priors': priors, 'means': means, 'vars': variances}


def gaussian_nb_predict_proba(model, X):
    X = X.float()
    means, variances = model['means'], model['vars']           # (C, d)

    log_norm = -0.5 * torch.log(2 * math.pi * variances).sum(dim=1)                   # (C,)
    sq = ((X.unsqueeze(1) - means.unsqueeze(0)) ** 2 / variances.unsqueeze(0)).sum(-1)  # (m, C)
    jll = torch.log(model['priors']) + log_norm - 0.5 * sq

    return torch.exp(jll - torch.logsumexp(jll, dim=1, keepdim=True))
`,
    testCases: [
      {
        id: '1',
        description: 'Priors and means',
        input: '(lambda m: (np.round(m["priors"].numpy(), 6).tolist(), np.round(m["means"].numpy(), 6).tolist()))(gaussian_nb_fit(torch.tensor([[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]), torch.tensor([0, 0, 0, 1, 1, 1])))',
        expected: '([0.5, 0.5], [[2.0], [7.0]])',
        hidden: false,
      },
      {
        id: '2',
        description: 'Midpoint between symmetric classes is 50/50',
        input: 'bool(torch.allclose(gaussian_nb_predict_proba(gaussian_nb_fit(torch.tensor([[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]), torch.tensor([0, 0, 0, 1, 1, 1])), torch.tensor([[4.5]])), torch.tensor([[0.5, 0.5]]), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Rows sum to 1, shape (m, C)',
        input: '(lambda X, y: (lambda P: (tuple(P.shape), bool(torch.allclose(P.sum(1), torch.ones(20), atol=1e-5))))(gaussian_nb_predict_proba(gaussian_nb_fit(X, y), X)))(torch.randn(20, 3), torch.arange(20) % 4)',
        expected: '((20, 4), True)',
        hidden: false,
      },
      {
        id: '4',
        description: 'var_smoothing adds epsilon = s * max feature variance',
        input: 'bool(torch.allclose(gaussian_nb_fit(torch.tensor([[0.0, 1.0], [0.0, 3.0], [2.0, 5.0], [2.0, 9.0]]), torch.tensor([0, 0, 1, 1]), var_smoothing=0.1)["vars"], torch.tensor([[0.875, 1.875], [0.875, 4.875]]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Posteriors match scikit-learn GaussianNB',
        input: 'bool(torch.allclose(gaussian_nb_predict_proba(gaussian_nb_fit(torch.tensor([[1.0, 2.0], [2.0, 3.0], [3.0, 3.0], [2.0, 1.0], [4.0, 5.0], [5.0, 4.0], [6.0, 6.0], [4.0, 3.0], [7.0, 2.0], [6.0, 1.0], [8.0, 3.0], [5.0, 2.0]]), torch.tensor([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2])), torch.tensor([[3.0, 3.0], [5.0, 3.5], [6.0, 2.0], [4.0, 4.0]])), torch.tensor([[0.891447, 0.101141, 0.007411], [9.1e-05, 0.927174, 0.072735], [0.0, 0.024231, 0.975769], [0.005153, 0.991937, 0.002909]]), atol=1e-4))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Log-space: far-away points still give valid probabilities',
        input: '(lambda P: bool(torch.isfinite(P).all() and torch.allclose(P, torch.tensor([[1.0, 0.0], [0.0, 1.0]]), atol=1e-6)))(gaussian_nb_predict_proba(gaussian_nb_fit(torch.tensor([[0.0], [1.0], [10.0], [11.0]]), torch.tensor([0, 0, 1, 1])), torch.tensor([[-500.0], [600.0]])))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'X[y == c].mean(dim=0) and X[y == c].var(dim=0, unbiased=False) per class; torch.stack the results.',
      'epsilon = var_smoothing * X.var(dim=0, unbiased=False).max()',
      'jll - torch.logsumexp(jll, dim=1, keepdim=True) is the log posterior.',
    ],
  },
  'ridge-lasso': {
    note: 'Ridge: torch.linalg.solve. Lasso: loop over coordinates with tensor ops; torch.sign(a) * torch.clamp(a.abs() - lam, min=0) is the soft-threshold.',
    starterCode: `import torch

def ridge_fit(X, y, lam):
    """
    Ridge regression in closed form (intercept not penalised).

    Args:
        X: Float tensor of features, shape (n, d)
        y: Float tensor of targets, shape (n,)
        lam: L2 penalty strength

    Returns:
        (w, b): weight tensor of shape (d,) and float intercept
    """
    # Your code here
    pass


def lasso_fit(X, y, lam, n_sweeps=100):
    """
    Lasso regression by cyclic coordinate descent with soft-thresholding.
    Objective: (1/(2n)) * ||y - Xw - b||^2 + lam * ||w||_1

    Args:
        X: Float tensor of features, shape (n, d)
        y: Float tensor of targets, shape (n,)
        lam: L1 penalty strength
        n_sweeps: Number of full passes over the coordinates

    Returns:
        (w, b): weight tensor of shape (d,) and float intercept
    """
    # Your code here
    pass
`,
    solution: `import torch

def ridge_fit(X, y, lam):
    x_mean, y_mean = X.mean(dim=0), y.mean()
    Xc, yc = X - x_mean, y - y_mean

    d = X.shape[1]
    w = torch.linalg.solve(Xc.T @ Xc + lam * torch.eye(d), Xc.T @ yc)
    b = (y_mean - x_mean @ w).item()
    return w, b


def soft_threshold(a, lam):
    return torch.sign(a) * torch.clamp(a.abs() - lam, min=0.0)


def lasso_fit(X, y, lam, n_sweeps=100):
    n, d = X.shape
    x_mean, y_mean = X.mean(dim=0), y.mean()
    Xc, yc = X - x_mean, y - y_mean

    w = torch.zeros(d)
    z = (Xc ** 2).sum(dim=0) / n
    r = yc.clone()
    for _ in range(n_sweeps):
        for j in range(d):
            if z[j] == 0:
                continue
            xj = Xc[:, j]
            rho = xj @ (r + xj * w[j]) / n
            w_new = soft_threshold(rho, lam) / z[j]
            r = r - xj * (w_new - w[j])
            w[j] = w_new

    b = (y_mean - x_mean @ w).item()
    return w, b
`,
    testCases: [
      {
        id: '1',
        description: 'Ridge with lam=0 is least squares',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([2.0]), atol=1e-4) and abs(wb[1] - 1.0) < 1e-4))(ridge_fit(torch.tensor([[1.0], [2.0], [3.0], [4.0]]), torch.tensor([3.0, 5.0, 7.0, 9.0]), 0.0))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Ridge shrinks the slope; intercept is not penalised',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([1.0]), atol=1e-4) and abs(wb[1] - 3.5) < 1e-4))(ridge_fit(torch.tensor([[1.0], [2.0], [3.0], [4.0]]), torch.tensor([3.0, 5.0, 7.0, 9.0]), 5.0))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Lasso zeroes the noise features exactly',
        input: `(lambda: (
    X := torch.randn(40, 5),
    y := 3 * X[:, 0] - 2 * X[:, 1] + 0.1 * torch.randn(40) + 4,
    w := lasso_fit(X, y, 0.3)[0],
    (int((w == 0).sum()), bool((w[2:] == 0).all()), bool((w[:2].abs() > 1).all()))
)[-1])()`,
        expected: '(3, True, True)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Ridge matches scikit-learn Ridge(alpha=2)',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([0.501562, 1.054956, 0.469557]), atol=1e-4) and abs(wb[1] - 1.770184) < 1e-4))(ridge_fit(torch.tensor([[1.0, 0.5, 2.0], [2.0, -1.0, 0.0], [0.0, 1.0, 1.0], [3.0, 2.0, -1.0], [1.5, 0.0, 0.5], [2.5, 1.5, 1.0]]), torch.tensor([4.0, 1.0, 3.0, 5.0, 2.5, 6.0]), 2.0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Lasso matches scikit-learn Lasso(alpha=0.1) after convergence',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([0.614221, 1.30941, 0.65289]), atol=1e-3) and abs(wb[1] - 1.30584) < 1e-3))(lasso_fit(torch.tensor([[1.0, 0.5, 2.0], [2.0, -1.0, 0.0], [0.0, 1.0, 1.0], [3.0, 2.0, -1.0], [1.5, 0.0, 0.5], [2.5, 1.5, 1.0]]), torch.tensor([4.0, 1.0, 3.0, 5.0, 2.5, 6.0]), 0.1, 500))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large lam gives all-zero weights and b = mean(y)',
        input: '(lambda wb: (bool((wb[0] == 0).all()), round(wb[1], 5)))(lasso_fit(torch.tensor([[1.0, 0.5], [2.0, -1.0], [0.0, 1.0], [3.0, 2.0]]), torch.tensor([4.0, 1.0, 3.0, 6.0]), 10.0))',
        expected: '(True, 3.5)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Lasso weights after 3 sweeps (in-order coordinate updates)',
        input: 'bool(torch.allclose(lasso_fit(torch.tensor([[1.0, 2.0], [2.0, 1.0], [3.0, 4.0], [4.0, 3.0]]), torch.tensor([1.0, 2.0, 2.0, 4.0]), 0.05, 3)[0], torch.tensor([1.003616, -0.26217]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Centre with X.mean(dim=0) and y.mean(); b = (y_mean - x_mean @ w).item().',
      'torch.linalg.solve(Xc.T @ Xc + lam * torch.eye(d), Xc.T @ yc)',
      'In the lasso loop, update the residual r = r - Xc[:, j] * (w_new - w[j]) before writing w[j] = w_new.',
    ],
  },
  'gradient-boosting': {
    note: 'Same algorithm with tensor ops; thresholds and leaf values are returned as Python floats, predictions as a tensor.',
    starterCode: `import torch

def fit_stump(X, r):
    """
    Exhaustively find the best depth-1 regression tree for targets r.

    Args:
        X: Float tensor of features, shape (n, d)
        r: Float tensor of targets (residuals), shape (n,)

    Returns:
        (feature, threshold, left_value, right_value) as Python int/floats.
        Left side is X[:, feature] <= threshold.
    """
    # Your code here
    pass


def gradient_boosting(X, y, n_rounds=10, learning_rate=0.1):
    """
    Gradient boosting with decision stumps on squared loss.

    Args:
        X: Float tensor of features, shape (n, d)
        y: Float tensor of targets, shape (n,)
        n_rounds: Number of boosting rounds
        learning_rate: Shrinkage applied to every stump

    Returns:
        dict with 'f0' (float), 'stumps' (list of tuples),
        'predictions' (tensor (n,)), 'losses' (list of n_rounds floats)
    """
    # Your code here
    pass
`,
    solution: `import torch

def fit_stump(X, r):
    X, r = X.float(), r.float()
    mean_r = r.mean().item()
    best, best_sse = (0, float('inf'), mean_r, mean_r), float('inf')
    total_sq = (r ** 2).sum()

    for j in range(X.shape[1]):
        u = torch.unique(X[:, j])
        thresholds = (u[:-1] + u[1:]) / 2                     # (T,)
        if len(thresholds) == 0:
            continue
        left = (X[:, j].unsqueeze(0) <= thresholds.unsqueeze(1)).float()   # (T, n)
        n_l = left.sum(dim=1)
        n_r = len(r) - n_l
        s_l = (left * r).sum(dim=1)
        s_r = r.sum() - s_l
        sse = total_sq - s_l ** 2 / n_l - s_r ** 2 / n_r
        k = int(torch.argmin(sse))
        if sse[k].item() < best_sse:
            best_sse = sse[k].item()
            best = (j, thresholds[k].item(), (s_l[k] / n_l[k]).item(), (s_r[k] / n_r[k]).item())
    return best


def stump_predict(stump, X):
    j, t, left, right = stump
    return torch.where(X[:, j] <= t, torch.tensor(left), torch.tensor(right))


def gradient_boosting(X, y, n_rounds=10, learning_rate=0.1):
    X, y = X.float(), y.float()
    f0 = y.mean().item()
    F = torch.full((len(y),), f0)
    stumps, losses = [], []

    for _ in range(n_rounds):
        residuals = y - F
        stump = fit_stump(X, residuals)
        F = F + learning_rate * stump_predict(stump, X)
        stumps.append(stump)
        losses.append(((y - F) ** 2).mean().item())

    return {'f0': f0, 'stumps': stumps, 'predictions': F, 'losses': losses}
`,
    testCases: [
      {
        id: '1',
        description: 'Stump separates a step perfectly',
        input: 'fit_stump(torch.tensor([[1.0], [2.0], [3.0], [4.0], [5.0], [6.0]]), torch.tensor([-2.0, -2.0, -2.0, 2.0, 2.0, 2.0]))',
        expected: '(0, 3.5, -2.0, 2.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Loss halves each round on a step function',
        input: '(lambda m: (m["f0"], [round(v, 5) for v in m["losses"]]))(gradient_boosting(torch.tensor([[1.0], [2.0], [3.0], [4.0], [5.0], [6.0]]), torch.tensor([1.0, 1.0, 1.0, 5.0, 5.0, 5.0]), 3, 0.5))',
        expected: '(3.0, [1.0, 0.25, 0.0625])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Training loss is non-increasing',
        input: `(lambda: (
    X := torch.rand(30, 2),
    y := torch.sin(4 * X[:, 0]) + X[:, 1] ** 2 + 0.1 * torch.randn(30),
    L := gradient_boosting(X, y, 15, 0.3)["losses"],
    bool(len(L) == 15 and all(b <= a + 1e-6 for a, b in zip(L, L[1:])) and L[-1] < y.var(unbiased=False).item())
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Stump picks the better feature and midpoint',
        input: 'fit_stump(torch.tensor([[1.0, 5.0], [2.0, 1.0], [3.0, 4.0], [4.0, 2.0]]), torch.tensor([1.0, -1.0, 1.0, -1.0]))',
        expected: '(1, 3.0, -1.0, 1.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Tie: the first feature / smallest threshold wins',
        input: 'fit_stump(torch.tensor([[0.0, 0.0], [1.0, 1.0], [2.0, 2.0], [3.0, 3.0]]), torch.tensor([0.0, 0.0, 4.0, 4.0]))',
        expected: '(0, 1.5, 0.0, 4.0)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Predictions and losses on a 2-feature problem',
        input: '(lambda m: bool(torch.allclose(m["predictions"], torch.tensor([1.583789, 2.435352, 2.435352, 5.610156, 3.935352]), atol=1e-4) and np.allclose(m["losses"], [1.3400000000000003, 0.6631250000000002, 0.31504882812500024, 0.20106521606445332], atol=1e-4)))(gradient_boosting(torch.tensor([[1.0, 3.0], [2.0, 1.0], [3.0, 2.0], [4.0, 5.0], [5.0, 4.0]]), torch.tensor([1.0, 3.0, 2.0, 6.0, 4.0]), 4, 0.5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'torch.unique(X[:, j]) is sorted; midpoints are (u[:-1] + u[1:]) / 2.',
      'Score all thresholds at once with a (T, n) mask: X[:, j].unsqueeze(0) <= thresholds.unsqueeze(1).',
      'torch.where(X[:, j] <= t, left, right) evaluates a stump.',
    ],
  },
};
