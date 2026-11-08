import { Problem } from '../../types';

export const dataPreprocessingProblems: Problem[] = [
  {
    id: 'normalize-features',
    title: 'Normalize Features (Min-Max Scaling)',
    section: 'data-preprocessing',
    difficulty: 'easy',
    description: `
## Normalize Features (Min-Max Scaling)

### What you'll build
A function that rescales a 1-D array linearly so its smallest value becomes 0 and its largest becomes 1.

### Background
Distance-based models and gradient descent are sensitive to feature scale: a feature in the thousands swamps one in fractions. Min-max scaling puts every feature on the same \`[0, 1]\` range. It is what scikit-learn's \`MinMaxScaler\` does for each column.

### Formula
\`\`\`text
x_norm[i] = (x[i] - min(x)) / (max(x) - min(x))
\`\`\`
where \`min(x)\` and \`max(x)\` are taken over the whole array.

### Inputs
- \`arr\`: 1-D array of shape \`(n,)\`, \`2 <= n <= 1000\`, finite ints or floats (tests may pass a Python list, so convert with \`np.asarray(arr, dtype=float)\`)

### Expected return format
A float array of shape \`(n,)\` with values in \`[0, 1]\`: the minimum maps to \`0.0\` and the maximum to \`1.0\`.

### Edge cases and conventions
- **Constant input** (\`max == min\`): the formula would divide by zero. Return an array of zeros instead, like \`MinMaxScaler\`.
- The order of the elements is preserved; the input doesn't need to be sorted.

### Constraints
- Use NumPy only; no loops are needed.

### Follow-up
- How would you scale a 2-D \`(n_samples, n_features)\` matrix column by column?
- Why is min-max scaling a poor choice when the data has outliers?
    `,
    examples: [
      {
        input: 'normalize(np.array([1, 2, 3, 4, 5]))',
        output: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        explanation: 'min = 1 and max = 5, so each value maps to (x - 1) / 4.',
      },
      {
        input: 'normalize(np.array([3.0, -1.0, 7.0, 1.0]))',
        output: '[0.5, 0.0, 1.0, 0.25]',
        explanation: 'Range 8: the order is kept, and -1 (the minimum) maps to 0.',
      },
      {
        input: 'normalize(np.array([4.0, 4.0, 4.0]))',
        output: '[0.0, 0.0, 0.0]',
        explanation: 'Constant input: max - min = 0, so return zeros instead of dividing by zero.',
      },
    ],
    starterCode: `import numpy as np

def normalize(arr: np.ndarray) -> np.ndarray:
    """
    Min-max scale a 1-D array to [0, 1].

    Args:
        arr: 1-D array (or list) of finite numbers, shape (n,)

    Returns:
        Float array of shape (n,): (arr - min) / (max - min),
        or all zeros if every value is the same
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
        description: 'Non-uniform floats',
        input: 'bool(np.allclose(normalize(np.array([10.0, 20.0, 30.0, 40.0])), [0.0, 1/3, 2/3, 1.0]))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Unsorted input keeps its order',
        input: 'normalize(np.array([3.0, -1.0, 7.0, 1.0])).tolist()',
        expected: '[0.5, 0.0, 1.0, 0.25]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Constant input returns zeros',
        input: 'normalize(np.array([4.0, 4.0, 4.0])).tolist()',
        expected: '[0.0, 0.0, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      'You need two numbers from the whole array before you can transform any element. Which ones?',
      'Compute the minimum and the range once, then apply the formula to the whole array with broadcasting.',
      'np.min(arr), np.max(arr) (or np.ptp for the range), then (arr - lo) / (hi - lo).',
      'Guard the constant case: if hi == lo, return np.zeros(len(arr)) instead of dividing by zero (which gives NaN).',
    ],
    solution: `import numpy as np

def normalize(arr: np.ndarray) -> np.ndarray:
    """
    Min-max scale a 1-D array to [0, 1] (all zeros for constant input).
    """
    arr = np.asarray(arr, dtype=float)
    lo, hi = arr.min(), arr.max()
    if hi == lo:                      # constant input: avoid 0 / 0
        return np.zeros_like(arr)
    return (arr - lo) / (hi - lo)

# Time O(n), extra space O(n) for the output.
`,
  },
  {
    id: 'handle-missing-data',
    title: 'Handle Missing Data (Mean Imputation)',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## Handle Missing Data (Mean Imputation)

### What you'll build
A function that replaces every missing value (\`NaN\`) in a 1-D array with the mean of the values that are present.

### Background
Most models can't consume \`NaN\`. The simplest fix is **imputation**: fill each gap with a statistic of the observed values. Mean imputation keeps the column mean unchanged; it is \`SimpleImputer(strategy='mean')\` in scikit-learn. (In a real pipeline the mean must come from the training split only: see **Leakage-Safe Imputation and Scaling**.)

### Formula
\`\`\`text
observed = { x[i] : x[i] is not NaN }
fill     = sum(observed) / |observed|
out[i]   = fill if x[i] is NaN else x[i]
\`\`\`

### Inputs
- \`arr\`: 1-D float array of shape \`(n,)\` with at least one non-NaN value; missing entries are \`np.nan\` (tests may pass a Python list)

### Expected return format
A **new** float array of shape \`(n,)\` with no NaNs. Values that were present are unchanged.

### Edge cases and conventions
- An array with no NaNs is returned unchanged (as a copy).
- **Don't modify the input**: \`arr[mask] = v\` on the caller's array would change their data. Work on a copy.
- \`np.mean\` of an array containing NaN is NaN, so you must exclude the missing values when computing the fill.

### Constraints
- Use NumPy; vectorise (no Python loop over elements).

### Follow-up
- When is the median a better fill than the mean?
- Why can adding a binary "was missing" feature help a model?
    `,
    examples: [
      {
        input: 'fill_missing_with_mean(np.array([1.0, np.nan, 3.0, np.nan, 5.0]))',
        output: '[1.0, 3.0, 3.0, 3.0, 5.0]',
        explanation: 'The observed values 1, 3, 5 have mean 3, which fills both gaps.',
      },
      {
        input: 'fill_missing_with_mean(np.array([np.nan, 10.0, 20.0]))',
        output: '[15.0, 10.0, 20.0]',
        explanation: 'A NaN at the start is filled the same way: mean(10, 20) = 15.',
      },
    ],
    starterCode: `import numpy as np

def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
    """
    Replace NaN values with the mean of the non-NaN values.

    Args:
        arr: 1-D float array of shape (n,), at least one value not NaN

    Returns:
        New float array of shape (n,) with every NaN replaced by the mean
        (the input array is left unchanged)
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
      {
        id: '5',
        description: 'The input array is not modified',
        input: '(lambda: (a := np.array([1.0, np.nan, 4.0]), out := fill_missing_with_mean(a), (int(np.isnan(a).sum()), out.tolist()))[-1])()',
        expected: '(1, [1.0, 2.5, 4.0])',
        hidden: true,
      },
      {
        id: '6',
        description: 'No NaN: values unchanged',
        input: 'fill_missing_with_mean(np.array([1.5, -2.0, 0.5])).tolist()',
        expected: '[1.5, -2.0, 0.5]',
        hidden: true,
      },
    ],
    hints: [
      'Two steps: compute the fill value from the values that are present, then write it into the gaps.',
      'Build a boolean mask of the missing entries once and reuse it for both steps.',
      'np.isnan(arr) gives the mask; np.nanmean(arr) (or arr[~mask].mean()) gives the fill; np.where(mask, fill, arr) builds the result.',
      "Don't assign into the caller's array: copy it first (arr.copy()) or use np.where, which returns a new array.",
    ],
    solution: `import numpy as np

def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
    """
    Replace NaN values with the mean of the non-NaN values (returns a new array).
    """
    arr = np.asarray(arr, dtype=float)
    mask = np.isnan(arr)
    fill = arr[~mask].mean()          # mean of the observed values only
    return np.where(mask, fill, arr)  # new array; the input is untouched

# Time O(n), extra space O(n).
`,
  },
  {
    id: 'one-hot-encode',
    title: 'One-Hot Encoding',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## One-Hot Encoding

### What you'll build
A function that turns a vector of integer class labels into a one-hot matrix: one row per label, with a single 1 in the column of that label.

### Background
Feeding category ids such as \`0, 1, 2\` straight into a linear model implies an order and a distance (2 is "twice" 1) that don't exist. One-hot vectors put every category at the same distance from every other. The same matrix is the target format for softmax cross-entropy (see **Neural Networks**).

### Formula
\`\`\`text
out[i, c] = 1 if labels[i] == c else 0        i = 0..n-1,  c = 0..num_classes-1
\`\`\`

### Inputs
- \`labels\`: 1-D integer array of shape \`(n,)\`, each value in \`[0, num_classes - 1]\` (tests may pass a Python list)
- \`num_classes\`: int, \`1 <= num_classes <= 100\`; it can be larger than \`max(labels) + 1\`

### Expected return format
An **integer** array of shape \`(n, num_classes)\` containing only 0s and 1s; every row sums to 1.

### Edge cases and conventions
- Classes that never appear still get a (zero) column, so the width is always \`num_classes\`.
- Labels can be in any order and can repeat.

### Constraints
- Use NumPy; vectorise (fancy indexing, no Python loop over samples).

### Follow-up
- How would you encode a feature with a million distinct values (hashing, embeddings)?
- How do you invert the encoding? (\`argmax\` along \`axis=1\`.)
    `,
    examples: [
      {
        input: 'one_hot_encode(np.array([0, 1, 2, 1]), 3)',
        output: '[[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0]]',
        explanation: 'Row i has its 1 in column labels[i].',
      },
      {
        input: 'one_hot_encode(np.array([0, 2]), 4)',
        output: '[[1, 0, 0, 0], [0, 0, 1, 0]]',
        explanation: 'num_classes = 4 gives 4 columns even though classes 1 and 3 never appear.',
      },
    ],
    starterCode: `import numpy as np

def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
    """
    Convert integer labels to a one-hot matrix.

    Args:
        labels: 1-D int array of shape (n,), values in [0, num_classes - 1]
        num_classes: Number of columns in the output

    Returns:
        Int array of shape (n, num_classes); row i has a 1 in column labels[i]
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
      {
        id: '5',
        description: 'Unordered labels round-trip through argmax',
        input: '(lambda: (y := np.array([4, 1, 3, 1, 0]), out := one_hot_encode(y, 6), (out.shape, out.sum(axis=1).tolist(), out.argmax(axis=1).tolist()))[-1])()',
        expected: '((5, 6), [1, 1, 1, 1, 1], [4, 1, 3, 1, 0])',
        hidden: true,
      },
    ],
    hints: [
      'Each output row is a row of the identity matrix. Which row?',
      'Start from zeros of shape (n, num_classes) and set exactly one entry per row, or select identity rows directly.',
      'np.eye(num_classes, dtype=int)[labels] picks one identity row per label; alternatively out[np.arange(n), labels] = 1.',
      'Use num_classes for the width, not labels.max() + 1, or unseen classes lose their column. Return ints, not floats.',
    ],
    solution: `import numpy as np

def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
    """
    Convert integer labels to a one-hot int matrix of shape (n, num_classes).
    """
    labels = np.asarray(labels, dtype=int)
    # Row c of the identity matrix is the one-hot vector of class c
    return np.eye(num_classes, dtype=int)[labels]

    # Equivalent: scatter ones with fancy indexing
    # out = np.zeros((len(labels), num_classes), dtype=int)
    # out[np.arange(len(labels)), labels] = 1
    # return out

# Time and space O(n * num_classes).
`,
  },
  {
    id: 'stratified-split',
    title: 'Stratified Train/Val/Test Split',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## Stratified Train / Validation / Test Split

### What you'll build
\`stratified_split(y, val_frac, test_frac, seed)\`, which splits the sample indices \`0 .. n-1\` into train, validation and test sets **class by class**, so every split keeps the class proportions of the full dataset.

### Background
A plain random split can leave a rare class badly under-represented, or missing entirely, from the validation or test set, which makes the metrics on those splits noisy or meaningless. Stratifying fixes the count of each class in each split. scikit-learn does this with \`train_test_split(..., stratify=y)\` (called twice for three splits); here the rounding rule is explicit so results are reproducible.

### Algorithm
1. Create **one** generator before the loop: \`rng = np.random.default_rng(seed)\`.
2. For each class \`c\` in **ascending** order (\`np.unique(y)\`):
   1. \`idx_c = np.where(y == c)[0]\` and \`perm = rng.permutation(idx_c)\`; let \`n_c = len(idx_c)\`.
   2. \`n_test = min(round_half_up(n_c * test_frac), n_c)\`
   3. \`n_val = min(round_half_up(n_c * val_frac), n_c - n_test)\` (validation gives way when the class is too small)
   4. The first \`n_test\` entries of \`perm\` go to **test**, the next \`n_val\` to **val**, and the rest to **train**.
3. Concatenate the per-class pieces and **sort** each split's indices in ascending order.

### Rounding rule
Counts are rounded **half up**, per class: \`round_half_up(v) = int(np.floor(v + 0.5))\`, so \`2.5 -> 3\` and \`0.5 -> 1\`. Python's built-in \`round\` uses banker's rounding (\`round(2.5) == 2\`), so don't use it here.

### Inputs
- \`y\`: integer class labels, shape \`(n,)\`
- \`val_frac\`, \`test_frac\`: fractions in \`[0, 1]\` of **each class** to put in validation and test
- \`seed\`: int seed for \`np.random.default_rng\`

### Expected Return Format
Return a dictionary with these keys:
- \`'train'\`: sorted int array of training indices
- \`'val'\`: sorted int array of validation indices
- \`'test'\`: sorted int array of test indices

### Guarantees and conventions
- The three arrays are **disjoint** and together contain every index \`0 .. n-1\` exactly once.
- Each class's count in each split is fixed by the rule above; only *which* samples go where depends on the seed.
- The same \`seed\` always gives the same split. The exact indices depend on drawing the permutations in ascending class order from a single generator.

### Constraints
- NumPy only; no sklearn.

### Follow-up
- How would you stratify a regression target? (Bin it into quantiles first.)
- How do you split when several rows belong to the same user? (Group-aware splits, e.g. \`GroupKFold\`, so a user never appears in both train and test.)
    `,
    examples: [
      {
        input: 'stratified_split(np.array([0]*10 + [1]*5), val_frac=0.2, test_frac=0.2, seed=0)',
        output: "{'train': [0, 1, 3, 5, 8, 9, 11, 13, 14], 'val': [2, 7, 12], 'test': [4, 6, 10]}",
        explanation: 'Class 0 (10 samples): 2 test, 2 val, 6 train. Class 1 (5 samples): 1 test, 1 val, 3 train. Each split keeps the 2:1 ratio (arrays shown as lists).',
      },
      {
        input: 'stratified_split(np.array([0, 0, 0, 0, 0, 1, 1]), val_frac=0.1, test_frac=0.3, seed=0)',
        output: "{'train': [0, 1, 6], 'val': [3], 'test': [2, 4, 5]}",
        explanation: 'Class 0: 5 * 0.3 = 1.5 rounds up to 2 test, 5 * 0.1 = 0.5 rounds up to 1 val. Class 1: 2 * 0.3 = 0.6 gives 1 test, 2 * 0.1 = 0.2 gives 0 val.',
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
      'Treat each class as its own small dataset: decide how many of its samples go to test, val and train, then pick which ones at random.',
      'Create rng = np.random.default_rng(seed) once, before the loop, and loop over np.unique(y) (ascending), calling rng.permutation(np.where(y == c)[0]) for each class.',
      'Counts: int(np.floor(n_c * frac + 0.5)) for half-up rounding; slice perm[:n_test], perm[n_test:n_test + n_val], perm[n_test + n_val:]; finish with np.sort(np.concatenate(parts)).',
      "Pitfalls: Python's round(2.5) == 2 (banker's rounding), re-creating the generator inside the loop changes the indices, and n_test + n_val must never exceed the class size.",
    ],
    solution: `import numpy as np

def stratified_split(y, val_frac=0.15, test_frac=0.15, seed=0):
    """
    Stratified train/val/test split.

    Returns:
        dict with sorted int index arrays 'train', 'val', 'test'
    """
    y = np.asarray(y)
    rng = np.random.default_rng(seed)           # one generator for all classes
    train, val, test = [], [], []

    for c in np.unique(y):                      # ascending class order
        idx_c = np.where(y == c)[0]
        perm = rng.permutation(idx_c)
        n_c = len(idx_c)

        # Round half up, per class; validation gives way if the class is tiny
        n_test = min(int(np.floor(n_c * test_frac + 0.5)), n_c)
        n_val = min(int(np.floor(n_c * val_frac + 0.5)), n_c - n_test)

        test.append(perm[:n_test])
        val.append(perm[n_test:n_test + n_val])
        train.append(perm[n_test + n_val:])

    def merge(parts):
        return np.sort(np.concatenate(parts)).astype(np.int64)

    return {'train': merge(train), 'val': merge(val), 'test': merge(test)}

# Time O(n log n) for the final sorts, space O(n).
`,
  },
  {
    id: 'leakage-safe-imputation',
    title: 'Leakage-Safe Imputation and Scaling',
    section: 'data-preprocessing',
    difficulty: 'medium',
    description: `
## Leakage-Safe Imputation and Scaling

### What you'll build
\`fit_transform_train_test(X_train, X_test, strategy)\`: fill missing values and standardise the features, learning every statistic from the **training split only** and applying the same transformation to both splits.

### Background
A classic preprocessing bug is to compute imputation values or scaling statistics on the **whole dataset** before splitting. The test set then leaks into training: its values shift the medians, means and standard deviations the model is trained with, and the offline score becomes optimistic. The fix is the scikit-learn \`Pipeline\` pattern: \`fit\` on train, \`transform\` train and test. This problem is \`SimpleImputer(strategy=...)\` followed by \`StandardScaler()\`.

### Algorithm
1. **Fit imputation on train**: for each column \`j\`, \`fill[j]\` is the median (\`strategy='median'\`) or the mean (\`strategy='mean'\`) of the **observed** (non-NaN) training values. The median follows NumPy: the average of the two middle values for an even count. If a column has no observed training values, \`fill[j] = 0.0\`.
2. **Impute both splits** with the same \`fill\` values.
3. **Fit scaling on the imputed train split**: \`mean[j]\` and \`std[j]\`, the population standard deviation (\`ddof=0\`).
4. **Standardise both splits**: \`(X - mean) / scale\` with \`scale[j] = std[j]\`, or \`1\` when \`std[j] == 0\`.

### Inputs
- \`X_train\`: float array \`(n_train, n_features)\`, may contain \`np.nan\`
- \`X_test\`: float array \`(n_test, n_features)\`, may contain \`np.nan\`
- \`strategy\`: \`'median'\` (default) or \`'mean'\`

### Expected Return Format
Return a dictionary with these keys:
- **Transformed data**: \`'X_train'\`, \`'X_test'\`: float arrays with the input shapes and no NaNs
- **Fitted statistics**, each of shape \`(n_features,)\` and computed from the training split only:
  - \`'fill'\`: the imputation values
  - \`'mean'\`: column means of the imputed training data
  - \`'std'\`: column population stds of the imputed training data (the raw value, \`0.0\` included)

### Edge cases and conventions
- **Zero-variance column** (\`std[j] == 0\`): divide by 1 instead, so it becomes 0 on train, as \`StandardScaler\` does.
- **All-NaN training column**: \`fill[j] = 0.0\`.
- **Don't modify the inputs**: work on copies.
- Nothing in \`X_test\` may influence \`fill\`, \`mean\`, \`std\` or the transformed \`X_train\`.

### Constraints
- NumPy only; no sklearn. A loop over columns is fine for the fill values; vectorise the rest.

### Follow-up
- With k-fold cross-validation, where must the imputer and scaler be fitted? (Inside each fold, on that fold's training part.)
- Why might a "was missing" indicator column be worth adding before imputing?
`,
    examples: [
      {
        input: 'fit_transform_train_test(np.array([[1.0, 10.0], [2.0, np.nan], [3.0, 30.0], [np.nan, 40.0]]), np.array([[100.0, np.nan], [np.nan, 0.0]]))',
        output: "{'fill': [2.0, 30.0], 'mean': [2.0, 27.5], 'std': [0.7071, 10.8972], 'X_test': [[138.5929, 0.2294], [0.0, -2.5236]], 'X_train': [[-1.4142, -1.6059], [0.0, 0.2294], [1.4142, 0.2294], [0.0, 1.1471]]}",
        explanation: 'The test value 100 does not move the median of column 0: fill, mean and std come from the four training rows only (values rounded to 4 decimals).',
      },
      {
        input: 'fit_transform_train_test(np.array([[5.0, 1.0], [5.0, 2.0], [np.nan, 3.0]]), np.array([[7.0, 2.0]]))',
        output: "{'fill': [5.0, 2.0], 'std': [0.0, 0.8165], 'X_train'[:, 0]: [0.0, 0.0, 0.0], 'X_test'[0, 0]: 2.0, ...}",
        explanation: 'Column 0 is constant on train (std 0), so it is divided by 1: the test value 7 becomes 7 - 5 = 2.',
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
      'Order matters: everything you compute must come from X_train; X_test is only ever transformed.',
      'Three stages: fill values per column, then mean and std of the imputed training data, then (X - mean) / scale for both splits.',
      'np.median / .mean() on X_train[~np.isnan(X_train[:, j]), j] for the fills, np.where(np.isnan(X), fill, X) to impute (it broadcasts over rows), and train.std(axis=0) (ddof=0).',
      "Pitfalls: np.nanmedian over the stacked train+test data leaks; std == 0 needs scale = np.where(std > 0, std, 1.0); and filling NaNs in place changes the caller's arrays.",
    ],
    solution: `import numpy as np

def fit_transform_train_test(X_train, X_test, strategy='median'):
    """
    Impute and standardise, fitting every statistic on the training split only.

    Returns:
        dict with 'X_train', 'X_test' (transformed) and 'fill', 'mean', 'std' (n_features,)
    """
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
    std = train.std(axis=0)                    # population std (ddof=0)
    scale = np.where(std > 0, std, 1.0)        # constant columns: divide by 1

    # 4. Apply the same transformation to both splits
    return {
        'X_train': (train - mean) / scale,
        'X_test': (test - mean) / scale,
        'fill': fill,
        'mean': mean,
        'std': std,
    }

# Time O((n_train + n_test) * d) plus the median sorts, space O((n_train + n_test) * d).
`,
  },
];
