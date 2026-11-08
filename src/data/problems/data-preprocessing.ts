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
      {
        id: '4',
        description: 'All same values edge case avoided - non-uniform floats',
        input: 'bool(np.allclose(normalize(np.array([10.0, 20.0, 30.0, 40.0])), [0.0, 1/3, 2/3, 1.0]))',
        expected: 'True',
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
      {
        id: '4',
        description: 'Multiple NaNs with one valid value',
        input: 'bool(np.allclose(fill_missing_with_mean(np.array([float("nan"), float("nan"), 7.0])), [7.0, 7.0, 7.0]))',
        expected: 'True',
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
      {
        id: '4',
        description: 'Single label with many classes',
        input: 'one_hot_encode(np.array([3]), 5).tolist()',
        expected: '[[0, 0, 0, 1, 0]]',
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
  {
    id: 'stratified-split',
    title: 'Stratified Train/Val/Test Split',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## Stratified Train / Validation / Test Split

A plain random split can leave a rare class badly under-represented (or missing) in the validation or test set. A **stratified** split splits *each class separately*, so every split keeps roughly the class proportions of the full dataset.

Implement \`stratified_split(y, val_frac, test_frac, seed)\` that returns **index arrays** into \`y\`.

### Algorithm
1. Create a generator once: \`rng = np.random.default_rng(seed)\`.
2. For each class \`c\` in **ascending** order (\`np.unique(y)\`):
   - \`idx_c = np.where(y == c)[0]\` and \`perm = rng.permutation(idx_c)\`
   - \`n_c = len(idx_c)\`
   - \`n_test = round_half_up(n_c * test_frac)\`, \`n_val = round_half_up(n_c * val_frac)\`
   - If \`n_test + n_val > n_c\`, shrink \`n_val\` so that \`n_test + n_val = n_c\` (and \`n_test\` to \`n_c\` if needed)
   - The first \`n_test\` entries of \`perm\` go to **test**, the next \`n_val\` to **val**, the rest to **train**
3. Concatenate the per-class pieces and **sort** each split's indices in ascending order.

### Rounding rule
Counts are rounded **half up** per class: \`round_half_up(v) = int(np.floor(v + 0.5))\`, so \`2.5 → 3\` and \`0.5 → 1\`.
(Python's built-in \`round\` uses banker's rounding, \`round(2.5) == 2\`, so don't use it here.)

### Guarantees
- The three index arrays are **disjoint** and together **cover** \`0 .. n-1\` exactly once.
- For every class, its count in each split is fixed by the rule above (so proportions are preserved up to rounding).
- The same \`seed\` always gives the same split.

### Expected Return Format
Return a dictionary with these keys:
- \`'train'\`: sorted int array of training indices
- \`'val'\`: sorted int array of validation indices
- \`'test'\`: sorted int array of test indices

This mirrors calling scikit-learn's \`train_test_split(..., stratify=y)\` twice, but with an explicit, reproducible rounding rule.
    `,
    examples: [
      {
        input: 'y = np.array([0]*10 + [1]*5), val_frac=0.2, test_frac=0.2, seed=0',
        output: '{\'train\': 9 indices, \'val\': 3 indices, \'test\': 3 indices}',
        explanation: 'Class 0: n_test = n_val = round_half_up(2.0) = 2, train 6. Class 1: round_half_up(1.0) = 1 each, train 3. Each split keeps the 2:1 ratio.',
      },
      {
        input: 'y = np.array([0, 0, 0, 0, 0, 1, 1]), val_frac=0.1, test_frac=0.3, seed=0',
        output: 'counts per class: test {0: 2, 1: 1}, val {0: 1, 1: 0}',
        explanation: 'Class 0: 5*0.3 = 1.5 rounds up to 2; 5*0.1 = 0.5 rounds up to 1. Class 1: 2*0.3 = 0.6 -> 1; 2*0.1 = 0.2 -> 0.',
      },
    ],
    starterCode: `import numpy as np

def stratified_split(y, val_frac=0.15, test_frac=0.15, seed=0):
    """
    Stratified train/val/test split.

    Args:
        y: Integer class labels, shape (n,)
        val_frac: Fraction of each class to put in the validation set
        test_frac: Fraction of each class to put in the test set
        seed: Seed for np.random.default_rng

    Returns:
        dict with sorted int index arrays 'train', 'val', 'test'
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Split sizes for a 10/5 dataset',
        input: '(lambda s: (len(s["train"]), len(s["val"]), len(s["test"])))(stratified_split(np.array([0]*10 + [1]*5), 0.2, 0.2, 0))',
        expected: '(9, 3, 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Splits are disjoint and cover every index',
        input: '(lambda y, s: bool(np.array_equal(np.sort(np.concatenate([s["train"], s["val"], s["test"]])), np.arange(len(y)))))(np.array([2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 0, 2]), stratified_split(np.array([2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 0, 2]), 0.25, 0.25, 3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Each split keeps the class proportions',
        input: '(lambda y: (lambda s: [np.bincount(y[s[k]], minlength=2).tolist() for k in ("train", "val", "test")])(stratified_split(y, 0.2, 0.2, 1)))(np.array([0]*20 + [1]*5))',
        expected: '[[12, 3], [4, 1], [4, 1]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Round half up per class (1.5 -> 2, 0.5 -> 1)',
        input: '(lambda y: (lambda s: [np.bincount(y[s[k]], minlength=2).tolist() for k in ("train", "val", "test")])(stratified_split(y, 0.1, 0.3, 0)))(np.array([0, 0, 0, 0, 0, 1, 1]))',
        expected: '[[2, 1], [1, 0], [2, 1]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Index arrays are sorted and the same seed is reproducible',
        input: '(lambda y: (lambda a, b: bool(all(np.array_equal(a[k], b[k]) and np.all(np.diff(a[k]) > 0) for k in a)))(stratified_split(y, 0.2, 0.2, 7), stratified_split(y, 0.2, 0.2, 7)))(np.arange(30) % 3)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Exact indices follow the documented RNG procedure',
        input: '(lambda s: {k: v.tolist() for k, v in s.items()})(stratified_split(np.array([1, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 0.2, 0.2, 42))',
        expected: '{"train": [1, 2, 3, 5, 7, 9], "val": [4, 8], "test": [0, 6]}',
        hidden: true,
      },
      {
        id: '7',
        description: 'Fractions that overflow a tiny class are clipped',
        input: '(lambda s: (len(s["train"]), len(s["val"]), len(s["test"])))(stratified_split(np.array([0, 1, 1, 1]), 0.5, 0.6, 0))',
        expected: '(0, 1, 3)',
        hidden: true,
      },
    ],
    hints: [
      'Handle each class independently: np.unique(y) gives the classes in ascending order, np.where(y == c)[0] their indices.',
      'Create rng = np.random.default_rng(seed) once, before the loop, and call rng.permutation(idx_c) for each class in turn.',
      'Round half up with int(np.floor(v + 0.5)); clip n_val so that n_test + n_val never exceeds the class size.',
      'Collect per-class pieces in lists, then np.sort(np.concatenate(parts)) for each split.',
    ],
    solution: `import numpy as np

def stratified_split(y, val_frac=0.15, test_frac=0.15, seed=0):
    y = np.asarray(y)
    rng = np.random.default_rng(seed)
    train, val, test = [], [], []

    for c in np.unique(y):                      # ascending class order
        idx_c = np.where(y == c)[0]
        perm = rng.permutation(idx_c)
        n_c = len(idx_c)

        # Round half up, per class
        n_test = min(int(np.floor(n_c * test_frac + 0.5)), n_c)
        n_val = min(int(np.floor(n_c * val_frac + 0.5)), n_c - n_test)

        test.append(perm[:n_test])
        val.append(perm[n_test:n_test + n_val])
        train.append(perm[n_test + n_val:])

    def merge(parts):
        return np.sort(np.concatenate(parts)).astype(np.int64)

    return {'train': merge(train), 'val': merge(val), 'test': merge(test)}
`,
  },
  {
    id: 'leakage-safe-imputation',
    title: 'Leakage-Safe Imputation and Scaling',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## Leakage-Safe Imputation and Scaling

A classic preprocessing bug is to compute imputation values or scaling statistics on the **whole dataset** before splitting. The test set then leaks into training: its values shift the medians, means and standard deviations the model is trained with, and the offline score becomes optimistic.

Implement the leakage-safe version: **fit every statistic on the training split only**, then apply the same transformation to both splits (what \`SimpleImputer\` followed by \`StandardScaler\` does in a scikit-learn \`Pipeline\`).

### Steps
1. **Fit imputation on train**: for each column, \`fill[j]\` = the median (\`strategy='median'\`) or mean (\`strategy='mean'\`) of the **observed** (non-NaN) training values. Median uses NumPy's convention: the average of the two middle values for an even count. If a column has no observed training values, \`fill[j] = 0.0\`.
2. **Impute both splits** with the same \`fill\` values.
3. **Fit scaling on the imputed train split**: \`mean[j]\` and \`std[j]\` (population std, \`ddof=0\`).
4. **Standardise both splits**: \`(X - mean) / std\`. A column with \`std[j] == 0\` is divided by 1 instead (it becomes 0 on train), like scikit-learn's \`StandardScaler\`.

Don't modify the input arrays.

### Expected Return Format
Return a dictionary with these keys:
- **Transformed data**: \`'X_train'\`, \`'X_test'\`, float arrays with the input shapes and no NaNs
- **Fitted statistics** (all computed from the training split, shape \`(n_features,)\`): \`'fill'\` (imputation values), \`'mean'\` and \`'std'\` (of the imputed training data; \`std\` is the raw value, 0 included)
`,
    examples: [
      {
        input: 'fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[100.0, np.nan], [np.nan, 0.0]]))',
        output: "{'fill': [2., 30.], 'mean': [2., 27.5], 'std': [0.7071, 10.8972], 'X_test': [[138.5929, 0.2294], [0., -2.5236]], ...}",
        explanation: 'The test row with 100 does not move the median of column 0: fill, mean and std come from the four training rows only (values rounded).',
      },
    ],
    starterCode: `import numpy as np

def fit_transform_train_test(X_train, X_test, strategy='median'):
    """
    Impute missing values and standardise, fitting statistics on the training split only.

    Args:
        X_train: Training features with NaNs, array (n_train, n_features)
        X_test: Test features with NaNs, array (n_test, n_features)
        strategy: 'median' or 'mean' imputation

    Returns:
        dict with 'X_train', 'X_test' (transformed arrays) and the fitted
        statistics 'fill', 'mean', 'std' (each shape (n_features,))
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Median fill values come from train only',
        input: 'fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[100.0, np.nan], [np.nan, 0.0]]))["fill"].tolist()',
        expected: '[2.0, 30.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Transformed test split',
        input: 'np.round(fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[100.0, np.nan], [np.nan, 0.0]]))["X_test"], 4).tolist()',
        expected: '[[138.5929, 0.2294], [0.0, -2.5236]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Transformed train split',
        input: 'np.round(fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[100.0, np.nan], [np.nan, 0.0]]))["X_train"], 4).tolist()',
        expected: '[[-1.4142, -1.6059], [0.0, 0.2294], [1.4142, 0.2294], [0.0, 1.1471]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Mean strategy: fill, mean and std',
        input: '(lambda: (r := fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[100.0, np.nan], [np.nan, 0.0]]), strategy="mean"), [np.round(r[k], 4).tolist() for k in ("fill", "mean", "std")])[-1])()',
        expected: '[[2.0, 26.6667], [2.0, 26.6667], [0.7071, 10.8012]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Changing the test split does not change anything fitted (no leakage)',
        input: '(lambda: (a := fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[100.0, np.nan], [np.nan, 0.0]])), b := fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[1e6, -1e6], [np.nan, np.nan], [5.0, 5.0]])), bool(all(np.allclose(a[k], b[k]) for k in ("fill", "mean", "std", "X_train"))))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Even count: median averages the two middle values',
        input: 'fit_transform_train_test(np.array([[1.0], [2.0], [4.0], [10.0], [np.nan]]), np.array([[np.nan]]))["fill"].tolist()',
        expected: '[3.0]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Zero-variance column is divided by 1',
        input: '(lambda: (r := fit_transform_train_test(np.array([[5.0, 1.0], [5.0, 2.0], [np.nan, 3.0]]), np.array([[7.0, 2.0]])), (r["std"][0], r["X_train"][:, 0].tolist(), r["X_test"][0, 0]))[-1])()',
        expected: '(0.0, [0.0, 0.0, 0.0], 2.0)',
        hidden: true,
      },
      {
        id: '8',
        description: 'All-NaN training column is filled with 0',
        input: '(lambda: (r := fit_transform_train_test(np.array([[np.nan, 1.0], [np.nan, 3.0]]), np.array([[4.0, np.nan]])), (r["fill"].tolist(), r["X_test"].tolist()))[-1])()',
        expected: '([0.0, 2.0], [[4.0, 0.0]])',
        hidden: true,
      },
      {
        id: '9',
        description: 'Inputs are not modified',
        input: '(lambda: (A := np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), B := np.array([[100.0, np.nan], [np.nan, 0.0]]), _ := fit_transform_train_test(A, B)["fill"], (int(np.isnan(A).sum()), int(np.isnan(B).sum())))[-1])()',
        expected: '(2, 2)',
        hidden: true,
      },
      {
        id: '10',
        description: 'Random data with missing values',
        input: '(lambda: (A := np.random.randn(20, 3) * [1.0, 5.0, 0.1] + [0.0, 10.0, -3.0], A := np.where(np.random.rand(20, 3) < 0.2, np.nan, A), B := np.random.randn(6, 3) * 10, B := np.where(np.random.rand(6, 3) < 0.3, np.nan, B), r := fit_transform_train_test(A, B), (np.round(r["fill"], 4).tolist(), np.round(r["X_test"][0], 4).tolist()))[-1])()',
        expected: '([0.3234, 10.6084, -3.0375], [-8.6427, 1.8623, -0.0885])',
        hidden: true,
      },
    ],
    hints: [
      'Compute everything from X_train first (fill, then mean and std of the imputed train), and only then touch X_test.',
      '`np.where(np.isnan(X), fill, X)` broadcasts the per-column fill values over the rows.',
      'Guard the division: `scale = np.where(std > 0, std, 1.0)`.',
      "Use `np.array(X, dtype=float)` (a copy) rather than filling NaNs in place, so the caller's arrays stay unchanged.",
    ],
    solution: `import numpy as np

def fit_transform_train_test(X_train, X_test, strategy='median'):
    X_train = np.array(X_train, dtype=float)  # copies: the inputs stay untouched
    X_test = np.array(X_test, dtype=float)
    n_features = X_train.shape[1]

    # 1. Imputation values from the observed training values only
    fill = np.zeros(n_features)
    for j in range(n_features):
        observed = X_train[~np.isnan(X_train[:, j]), j]
        if observed.size:
            fill[j] = np.median(observed) if strategy == 'median' else observed.mean()

    # 2. Impute both splits with the same values
    train = np.where(np.isnan(X_train), fill, X_train)
    test = np.where(np.isnan(X_test), fill, X_test)

    # 3. Scaling statistics from the imputed training split
    mean = train.mean(axis=0)
    std = train.std(axis=0)
    scale = np.where(std > 0, std, 1.0)

    # 4. Apply to both splits
    return {
        'X_train': (train - mean) / scale,
        'X_test': (test - mean) / scale,
        'fill': fill,
        'mean': mean,
        'std': std,
    }
`,
  },
];
