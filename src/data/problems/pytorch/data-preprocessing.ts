import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../data-preprocessing.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const dataPreprocessingPyTorch: Record<string, LanguageVariant> = {
  'normalize-features': {
    note: 'Use tensor reductions (arr.min(), arr.max()) and broadcasting; return all zeros for constant input.',
    starterCode: `import torch

def normalize(arr: torch.Tensor) -> torch.Tensor:
    """
    Min-max scale a 1-D tensor to [0, 1].

    Args:
        arr: 1-D float tensor, shape (n,)

    Returns:
        Float tensor of shape (n,): (arr - min) / (max - min),
        or all zeros if every value is the same
    """
    # Your code here
    pass
`,
    solution: `import torch

def normalize(arr: torch.Tensor) -> torch.Tensor:
    """
    Min-max scale a 1-D tensor to [0, 1] (all zeros for constant input).
    """
    arr = arr.float()
    lo, hi = arr.min(), arr.max()      # 0-d tensors broadcast against arr
    if hi == lo:                       # constant input: avoid 0 / 0
        return torch.zeros_like(arr)
    return (arr - lo) / (hi - lo)
`,
    testCases: [
      {
        id: '1',
        description: 'Basic normalization',
        input: 'normalize(torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0]))',
        expected: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative values',
        input: 'normalize(torch.tensor([-10.0, 0.0, 10.0]))',
        expected: '[0.0, 0.5, 1.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Larger range',
        input: 'normalize(torch.tensor([0.0, 50.0, 100.0]))',
        expected: '[0.0, 0.5, 1.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Unsorted input',
        input: 'normalize(torch.tensor([3.0, -1.0, 7.0, 1.0]))',
        expected: '[0.5, 0.0, 1.0, 0.25]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Constant input returns zeros',
        input: 'normalize(torch.tensor([4.0, 4.0, 4.0])).tolist()',
        expected: '[0.0, 0.0, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      'You need the minimum and the range of the whole tensor before transforming any element.',
      'arr.min() and arr.max() return 0-d tensors that broadcast against arr.',
      '(arr - lo) / (hi - lo), after converting to float with arr.float().',
      'Guard the constant case: if hi == lo, return torch.zeros_like(arr) instead of dividing by zero.',
    ],
  },
  'handle-missing-data': {
    note: 'Use torch.isnan and a boolean mask; return a new tensor (torch.where, or clone before assigning) so the input is not modified.',
    starterCode: `import torch

def fill_missing_with_mean(arr: torch.Tensor) -> torch.Tensor:
    """
    Replace NaN values with the mean of the non-NaN values.

    Args:
        arr: 1-D float tensor of shape (n,), at least one value not NaN

    Returns:
        New float tensor of shape (n,) with every NaN replaced by the mean
        (the input tensor is left unchanged)
    """
    # Your code here
    pass
`,
    solution: `import torch

def fill_missing_with_mean(arr: torch.Tensor) -> torch.Tensor:
    """
    Replace NaN values with the mean of the non-NaN values (returns a new tensor).
    """
    mask = torch.isnan(arr)
    fill = arr[~mask].mean()             # mean of the observed values only
    return torch.where(mask, fill, arr)  # new tensor; the input is untouched
`,
    testCases: [
      {
        id: '1',
        description: 'Basic case',
        input: 'fill_missing_with_mean(torch.tensor([1.0, float("nan"), 3.0, float("nan"), 5.0]))',
        expected: '[1.0, 3.0, 3.0, 3.0, 5.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single NaN',
        input: 'fill_missing_with_mean(torch.tensor([2.0, 4.0, float("nan"), 6.0]))',
        expected: '[2.0, 4.0, 4.0, 6.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'NaN at start',
        input: 'fill_missing_with_mean(torch.tensor([float("nan"), 10.0, 20.0]))',
        expected: '[15.0, 10.0, 20.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'No NaN: unchanged',
        input: 'fill_missing_with_mean(torch.tensor([1.5, -2.0, 0.5]))',
        expected: '[1.5, -2.0, 0.5]',
        hidden: true,
      },
      {
        id: '5',
        description: 'The input tensor is not modified',
        input: '(lambda: (a := torch.tensor([1.0, float("nan"), 4.0]), out := fill_missing_with_mean(a), (int(torch.isnan(a).sum().item()), out.tolist()))[-1])()',
        expected: '(1, [1.0, 2.5, 4.0])',
        hidden: true,
      },
    ],
    hints: [
      'Two steps: compute the fill value from the values that are present, then write it into the gaps.',
      'torch.isnan(arr) gives a boolean mask of the missing values; reuse it for both steps.',
      'arr[~mask].mean() is the fill; torch.where(mask, fill, arr) builds the result.',
      "arr.mean() is NaN if any value is NaN. And don't assign into arr itself: use torch.where or arr.clone() first.",
    ],
  },
  'one-hot-encode': {
    note: 'F.one_hot(labels, num_classes) is the built-in and is fine here; indexing torch.eye(num_classes) also works. Return an integer (int64) tensor.',
    starterCode: `import torch
import torch.nn.functional as F

def one_hot_encode(labels: torch.Tensor, num_classes: int) -> torch.Tensor:
    """
    Convert integer labels to a one-hot matrix.

    Args:
        labels: 1-D int64 tensor of shape (n,), values in [0, num_classes - 1]
        num_classes: Number of columns in the output

    Returns:
        Int64 tensor of shape (n, num_classes); row i has a 1 in column labels[i]
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def one_hot_encode(labels: torch.Tensor, num_classes: int) -> torch.Tensor:
    """
    Convert integer labels to one-hot encoded format.
    """
    # Method 1: built-in
    return F.one_hot(labels, num_classes)

    # Method 2: index rows of the identity matrix
    # return torch.eye(num_classes)[labels].long()
`,
    testCases: [
      {
        id: '1',
        description: 'Basic encoding',
        input: 'one_hot_encode(torch.tensor([0, 1, 2]), 3)',
        expected: '[[1, 0, 0], [0, 1, 0], [0, 0, 1]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Repeated labels',
        input: 'one_hot_encode(torch.tensor([0, 0, 1, 1]), 2)',
        expected: '[[1, 0], [1, 0], [0, 1], [0, 1]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'More classes than used',
        input: 'one_hot_encode(torch.tensor([0, 2]), 4)',
        expected: '[[1, 0, 0, 0], [0, 0, 1, 0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Each row sums to 1',
        input: 'one_hot_encode(torch.tensor([3, 1, 4, 1, 0]), 5).sum(dim=1).tolist()',
        expected: '[1, 1, 1, 1, 1]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Unordered labels round-trip through argmax',
        input: '(lambda: (y := torch.tensor([4, 1, 3, 1, 0]), out := one_hot_encode(y, 6), (tuple(out.shape), out.argmax(dim=1).tolist()))[-1])()',
        expected: '((5, 6), [4, 1, 3, 1, 0])',
        hidden: true,
      },
    ],
    hints: [
      'Each output row is a row of the identity matrix: which one?',
      'F.one_hot(labels, num_classes) does it in one call and returns int64.',
      'Or torch.eye(num_classes)[labels].long() picks one identity row per label.',
      'Pass num_classes explicitly: without it F.one_hot uses labels.max() + 1, so unseen classes lose their column.',
    ],
  },
  // Ported with the new problems from the ML Coding Lab fork.
  'stratified-split': {
    note: 'Seeded RNG streams differ between this shim and real PyTorch, so the tests check counts, coverage and reproducibility rather than exact indices. Use torch.manual_seed(seed) + torch.randperm.',
    starterCode: `import torch

def stratified_split(y, val_frac=0.15, test_frac=0.15, seed=0):
    """
    Stratified train/val/test split.

    Args:
        y: int64 tensor of class labels, shape (n,)
        val_frac: Fraction of each class to put in the validation set
        test_frac: Fraction of each class to put in the test set
        seed: Seed (call torch.manual_seed(seed) once, before the class loop)

    Returns:
        dict with sorted int64 index tensors 'train', 'val', 'test'
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def stratified_split(y, val_frac=0.15, test_frac=0.15, seed=0):
    torch.manual_seed(seed)
    train, val, test = [], [], []

    for c in torch.unique(y):                   # sorted ascending
        idx_c = torch.nonzero(y == c).flatten()
        perm = idx_c[torch.randperm(len(idx_c))]
        n_c = len(idx_c)

        # Round half up, per class
        n_test = min(math.floor(n_c * test_frac + 0.5), n_c)
        n_val = min(math.floor(n_c * val_frac + 0.5), n_c - n_test)

        test.append(perm[:n_test])
        val.append(perm[n_test:n_test + n_val])
        train.append(perm[n_test + n_val:])

    def merge(parts):
        return torch.sort(torch.cat(parts)).values.long()

    return {'train': merge(train), 'val': merge(val), 'test': merge(test)}
`,
    testCases: [
      {
        id: '1',
        description: 'Split sizes for a 10/5 dataset',
        input: '(lambda s: (len(s["train"]), len(s["val"]), len(s["test"])))(stratified_split(torch.tensor([0]*10 + [1]*5), 0.2, 0.2, 0))',
        expected: '(9, 3, 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Splits are disjoint and cover every index',
        input: '(lambda y, s: bool(torch.equal(torch.sort(torch.cat([s["train"], s["val"], s["test"]])).values, torch.arange(len(y)))))(torch.tensor([2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 0, 2]), stratified_split(torch.tensor([2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 0, 2]), 0.25, 0.25, 3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Each split keeps the class proportions',
        input: '(lambda y: (lambda s: [torch.bincount(y[s[k]], minlength=2).tolist() for k in ("train", "val", "test")])(stratified_split(y, 0.2, 0.2, 1)))(torch.tensor([0]*20 + [1]*5))',
        expected: '[[12, 3], [4, 1], [4, 1]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Round half up per class (1.5 -> 2, 0.5 -> 1)',
        input: '(lambda y: (lambda s: [torch.bincount(y[s[k]], minlength=2).tolist() for k in ("train", "val", "test")])(stratified_split(y, 0.1, 0.3, 0)))(torch.tensor([0, 0, 0, 0, 0, 1, 1]))',
        expected: '[[2, 1], [1, 0], [2, 1]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Sorted int64 indices, reproducible with the same seed',
        input: '(lambda y: (lambda a, b: bool(all(torch.equal(a[k], b[k]) and a[k].dtype == torch.int64 and bool((a[k][1:] > a[k][:-1]).all()) for k in a)))(stratified_split(y, 0.2, 0.2, 7), stratified_split(y, 0.2, 0.2, 7)))(torch.arange(30) % 3)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Fractions that overflow a tiny class are clipped',
        input: '(lambda s: (len(s["train"]), len(s["val"]), len(s["test"])))(stratified_split(torch.tensor([0, 1, 1, 1]), 0.5, 0.6, 0))',
        expected: '(0, 1, 3)',
        hidden: true,
      },
    ],
    hints: [
      'Treat each class as its own small dataset: decide how many of its samples go to test, val and train, then pick which ones at random.',
      'Call torch.manual_seed(seed) once, loop over torch.unique(y) (sorted), get the indices with torch.nonzero(y == c).flatten() and shuffle with idx_c[torch.randperm(len(idx_c))].',
      'Counts: math.floor(n_c * frac + 0.5) for half-up rounding; slice the permutation into test, val, train; finish with torch.sort(torch.cat(parts)).values.',
      "Pitfalls: Python's round(2.5) == 2 (banker's rounding), and n_test + n_val must never exceed the class size.",
    ],
  },
  'leakage-safe-imputation': {
    note: "torch.median returns the LOWER middle value for an even count, but this problem uses NumPy's median (the average of the two middle values): sort the observed values instead. Use population std (unbiased=False). Don't use sklearn.",
    starterCode: `import torch

def fit_transform_train_test(X_train, X_test, strategy='median'):
    """
    Impute missing values and standardise, fitting statistics on the training split only.

    Args:
        X_train: Training features with NaNs, float tensor (n_train, n_features)
        X_test: Test features with NaNs, float tensor (n_test, n_features)
        strategy: 'median' or 'mean' imputation

    Returns:
        dict with 'X_train', 'X_test' (transformed tensors) and the fitted
        statistics 'fill', 'mean', 'std' (each shape (n_features,))
    """
    # Your code here
    pass
`,
    solution: `import torch

def _median(v):
    # NumPy convention: average the two middle values for an even count
    s = torch.sort(v).values
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2

def fit_transform_train_test(X_train, X_test, strategy='median'):
    n_features = X_train.shape[1]

    # 1. Imputation values from the observed training values only
    fill = torch.zeros(n_features)
    for j in range(n_features):
        observed = X_train[~torch.isnan(X_train[:, j]), j]
        if len(observed):
            fill[j] = _median(observed) if strategy == 'median' else observed.mean()

    # 2. Impute both splits with the same values (torch.where returns new tensors)
    train = torch.where(torch.isnan(X_train), fill, X_train)
    test = torch.where(torch.isnan(X_test), fill, X_test)

    # 3. Scaling statistics from the imputed training split
    mean = train.mean(dim=0)
    std = train.std(dim=0, unbiased=False)
    scale = torch.where(std > 0, std, torch.ones_like(std))

    # 4. Apply to both splits
    return {
        'X_train': (train - mean) / scale,
        'X_test': (test - mean) / scale,
        'fill': fill,
        'mean': mean,
        'std': std,
    }
`,
    hints: [
      'Order matters: everything you compute must come from X_train; X_test is only ever transformed.',
      'Three stages: fill values per column, then mean and std of the imputed training data, then (X - mean) / scale for both splits.',
      'X_train[~torch.isnan(X_train[:, j]), j] gives the observed values of column j; torch.where(torch.isnan(X), fill, X) imputes; train.std(dim=0, unbiased=False) is the population std.',
      "Pitfalls: torch.median returns the lower middle value for an even count (sort and average the two middle values instead); std == 0 needs a scale of 1; don't fill NaNs in place.",
    ],
    testCases: [
      {
        id: '1',
        description: 'Median fill values come from train only',
        input: 'fit_transform_train_test(torch.tensor([[1.0, 10.0], [2.0, float(\'nan\')], [3.0, 30.0], [float(\'nan\'), 40.0]]), torch.tensor([[100.0, float(\'nan\')], [float(\'nan\'), 0.0]]))["fill"].tolist()',
        expected: '[2.0, 30.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Transformed test split',
        input: '[[round(v, 3) for v in row] for row in fit_transform_train_test(torch.tensor([[1.0, 10.0], [2.0, float(\'nan\')], [3.0, 30.0], [float(\'nan\'), 40.0]]), torch.tensor([[100.0, float(\'nan\')], [float(\'nan\'), 0.0]]))["X_test"].tolist()]',
        expected: '[[138.593, 0.229], [0.0, -2.524]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Transformed train split',
        input: '[[round(v, 3) for v in row] for row in fit_transform_train_test(torch.tensor([[1.0, 10.0], [2.0, float(\'nan\')], [3.0, 30.0], [float(\'nan\'), 40.0]]), torch.tensor([[100.0, float(\'nan\')], [float(\'nan\'), 0.0]]))["X_train"].tolist()]',
        expected: '[[-1.414, -1.606], [0.0, 0.229], [1.414, 0.229], [0.0, 1.147]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Mean strategy: fill, mean and std',
        input: '(lambda: (r := fit_transform_train_test(torch.tensor([[1.0, 10.0], [2.0, float(\'nan\')], [3.0, 30.0], [float(\'nan\'), 40.0]]), torch.tensor([[100.0, float(\'nan\')], [float(\'nan\'), 0.0]]), strategy="mean"), [[round(v, 3) for v in r[k].tolist()] for k in ("fill", "mean", "std")])[-1])()',
        expected: '[[2.0, 26.667], [2.0, 26.667], [0.707, 10.801]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Changing the test split does not change anything fitted (no leakage)',
        input: '(lambda: (a := fit_transform_train_test(torch.tensor([[1.0, 10.0], [2.0, float(\'nan\')], [3.0, 30.0], [float(\'nan\'), 40.0]]), torch.tensor([[100.0, float(\'nan\')], [float(\'nan\'), 0.0]])), b := fit_transform_train_test(torch.tensor([[1.0, 10.0], [2.0, float(\'nan\')], [3.0, 30.0], [float(\'nan\'), 40.0]]), torch.tensor([[1e6, -1e6], [float("nan"), float("nan")], [5.0, 5.0]])), bool(all(torch.allclose(a[k], b[k]) for k in ("fill", "mean", "std", "X_train"))))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Even count: median averages the two middle values',
        input: '(lambda: (r := fit_transform_train_test(torch.tensor([[1.0], [2.0], [4.0], [10.0], [float("nan")]]), torch.tensor([[float("nan")]])), r["fill"].tolist())[-1])()',
        expected: '[3.0]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Zero-variance column is divided by 1',
        input: '(lambda: (r := fit_transform_train_test(torch.tensor([[5.0, 1.0], [5.0, 2.0], [float("nan"), 3.0]]), torch.tensor([[7.0, 2.0]])), (r["std"][0].item(), r["X_train"][:, 0].tolist(), r["X_test"][0, 0].item()))[-1])()',
        expected: '(0.0, [0.0, 0.0, 0.0], 2.0)',
        hidden: true,
      },
      {
        id: '8',
        description: 'All-NaN training column is filled with 0',
        input: '(lambda: (r := fit_transform_train_test(torch.tensor([[float("nan"), 1.0], [float("nan"), 3.0]]), torch.tensor([[4.0, float("nan")]])), (r["fill"].tolist(), r["X_test"].tolist()))[-1])()',
        expected: '([0.0, 2.0], [[4.0, 0.0]])',
        hidden: true,
      },
      {
        id: '9',
        description: 'Inputs are not modified',
        input: '(lambda: (A := torch.tensor([[1.0, 10.0], [2.0, float(\'nan\')], [3.0, 30.0], [float(\'nan\'), 40.0]]), B := torch.tensor([[100.0, float(\'nan\')], [float(\'nan\'), 0.0]]), _ := fit_transform_train_test(A, B)["fill"], (int(torch.isnan(A).sum().item()), int(torch.isnan(B).sum().item())))[-1])()',
        expected: '(2, 2)',
        hidden: true,
      },
      {
        id: '10',
        description: 'Random data with missing values',
        input: '(lambda: (A := np.random.randn(20, 3) * [1.0, 5.0, 0.1] + [0.0, 10.0, -3.0], A := np.where(np.random.rand(20, 3) < 0.2, np.nan, A), B := np.random.randn(6, 3) * 10, B := np.where(np.random.rand(6, 3) < 0.3, np.nan, B), r := fit_transform_train_test(torch.from_numpy(A).float(), torch.from_numpy(B).float()), ([round(v, 3) for v in r["fill"].tolist()], [round(v, 3) for v in r["X_test"][0].tolist()]))[-1])()',
        expected: '([0.323, 10.608, -3.038], [-8.643, 1.862, -0.088])',
        hidden: true,
      },
    ],
  },
};
