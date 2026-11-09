import { Problem } from '../../types';

export const modelEvaluationProblems: Problem[] = [
  {
    id: 'precision-recall-f1',
    title: 'Precision and Recall',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## Precision and Recall

### What you'll build
A function that compares binary predictions with the true labels and returns \`(precision, recall)\`, the two quantities that F1 and the precision-recall curve are built from.

### Background
Accuracy hides what kind of mistakes a model makes. **Precision** asks "when the model says positive, how often is it right?" and **recall** asks "of all the real positives, how many did it find?". Raising the threshold usually trades recall for precision. These are \`sklearn.metrics.precision_score\` and \`recall_score\` with \`pos_label=1\`.

### Formula
\`\`\`text
TP = #{y_pred = 1 and y_true = 1}      (true positives)
FP = #{y_pred = 1 and y_true = 0}      (false positives)
FN = #{y_pred = 0 and y_true = 1}      (false negatives)

precision = TP / (TP + FP)
recall    = TP / (TP + FN)
\`\`\`

### Inputs
- \`y_true\`: binary labels (0 or 1), shape \`(n,)\`
- \`y_pred\`: binary predictions (0 or 1), shape \`(n,)\`

(Tests may pass Python lists; convert with \`np.asarray\`.)

### Expected return format
A tuple \`(precision, recall)\` of Python floats, each rounded to 4 decimals with \`round(x, 4)\`.

### Edge cases and conventions
- **Zero division**: if nothing is predicted positive (\`TP + FP = 0\`), precision is \`0.0\`; if there are no actual positives (\`TP + FN = 0\`), recall is \`0.0\`. This matches scikit-learn's default \`zero_division\` behaviour (0, with a warning).
- The positive class is \`1\`; true negatives don't enter either formula.

### Constraints
- NumPy only (no sklearn); count with boolean masks, no Python loops.

### Follow-up
- Compute F1 = \`2 * P * R / (P + R)\` from your result. Why is it the *harmonic* mean rather than the arithmetic mean?
- How would you extend this to multi-class (macro vs micro averaging)?
    `,
    examples: [
      {
        input: 'precision_recall(np.array([1, 1, 0, 1, 0]), np.array([1, 0, 0, 1, 1]))',
        output: '(0.6667, 0.6667)',
        explanation: 'TP = 2, FP = 1 (index 4), FN = 1 (index 1): precision = 2/3 and recall = 2/3.',
      },
      {
        input: 'precision_recall(np.array([1, 1, 1, 1, 0]), np.array([1, 0, 0, 0, 0]))',
        output: '(1.0, 0.25)',
        explanation: 'A cautious model: its one positive prediction is right, but it finds only 1 of the 4 positives.',
      },
      {
        input: 'precision_recall(np.array([1, 1, 0]), np.array([0, 0, 0]))',
        output: '(0.0, 0.0)',
        explanation: 'No positive predictions: TP + FP = 0, so precision falls back to 0.0; recall is 0 / 2 = 0.0.',
      },
    ],
    starterCode: `import numpy as np

def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
    """
    Precision and recall for binary classification (positive class = 1).

    Args:
        y_true: True labels (0 or 1), shape (n,)
        y_pred: Predicted labels (0 or 1), shape (n,)

    Returns:
        Tuple (precision, recall) of floats rounded to 4 decimals;
        a metric whose denominator is 0 is returned as 0.0
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Mixed predictions',
        input: '([1, 1, 0, 1, 0], [1, 0, 0, 1, 1])',
        expected: '(0.6667, 0.6667)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfect predictions',
        input: '([1, 1, 0, 0], [1, 1, 0, 0])',
        expected: '(1.0, 1.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'High precision, low recall',
        input: '([1, 1, 1, 1, 0], [1, 0, 0, 0, 0])',
        expected: '(1.0, 0.25)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Low precision, high recall (all predicted positive)',
        input: '([1, 0, 0, 0, 0], [1, 1, 1, 1, 1])',
        expected: '(0.2, 1.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'No positive predictions: precision falls back to 0.0',
        input: 'precision_recall(np.array([1, 1, 0]), np.array([0, 0, 0]))',
        expected: '(0.0, 0.0)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Longer mixed example',
        input: 'precision_recall(np.array([1, 0, 1, 1, 0, 0, 1, 0, 1, 1]), np.array([1, 1, 1, 0, 0, 1, 1, 0, 1, 1]))',
        expected: '(0.7143, 0.8333)',
        hidden: true,
      },
    ],
    hints: [
      'Every sample falls into one of four cells (TP, FP, FN, TN). Which three do you need?',
      'Build boolean masks for "actually positive" and "predicted positive", then count their combinations.',
      'np.sum((y_true == 1) & (y_pred == 1)) counts TP; FP and FN are the same pattern with one side flipped.',
      'Guard both denominators (TP + FP can be 0 when nothing is predicted positive), and return Python floats rounded with round(x, 4).',
    ],
    solution: `import numpy as np

def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
    """
    Returns (precision, recall), rounded to 4 decimals; 0.0 when a denominator is 0.
    """
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)

    tp = int(np.sum((y_true == 1) & (y_pred == 1)))
    fp = int(np.sum((y_true == 0) & (y_pred == 1)))
    fn = int(np.sum((y_true == 1) & (y_pred == 0)))

    precision = tp / (tp + fp) if tp + fp > 0 else 0.0   # zero_division -> 0
    recall = tp / (tp + fn) if tp + fn > 0 else 0.0

    return (round(precision, 4), round(recall, 4))

# Time O(n), space O(n) for the masks.
`,
  },
  {
    id: 'cross-validation',
    title: 'K-Fold Cross-Validation Indices',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## K-Fold Cross-Validation Indices

### What you'll build
\`kfold_indices(n_samples, k)\`: the train and validation index lists for each of the \`k\` folds of k-fold cross-validation, without shuffling.

### Background
A single train/validation split gives a noisy estimate of model quality. K-fold cross-validation splits the indices into \`k\` contiguous folds; fold \`i\` is the validation set once while the other \`k - 1\` folds train the model, and the \`k\` scores are averaged. Every sample is validated exactly once. This is scikit-learn's \`KFold(n_splits=k, shuffle=False)\`.

### Algorithm
1. Fold sizes: every fold gets \`n_samples // k\` samples, and the **first** \`n_samples % k\` folds get one extra.
2. Walk through \`0 .. n_samples-1\` in order: fold \`i\` takes the next \`size_i\` consecutive indices as its validation set.
3. The training set of fold \`i\` is every other index, in increasing order.

### Inputs
- \`n_samples\`: int, \`n_samples >= k\`
- \`k\`: int number of folds, \`k >= 2\`

### Expected return format
A list of \`k\` tuples \`(train_indices, val_indices)\`, in fold order. Both are Python lists of ints in increasing order.

### Edge cases and conventions
- **Uneven folds**: with \`n_samples = 7, k = 3\` the sizes are \`3, 2, 2\` (the extra samples go to the first folds).
- \`k = n_samples\` is leave-one-out cross-validation.
- No shuffling: the folds are contiguous blocks. (Shuffle the data first, or use a seeded permutation, if its order carries information such as time or class.)

### Constraints
- Plain Python or NumPy; no sklearn.

### Follow-up
- Why is shuffled k-fold wrong for time series, and what do you use instead? (Forward-chaining splits such as \`TimeSeriesSplit\`.)
- How would you make the folds stratified by class?
    `,
    examples: [
      {
        input: 'kfold_indices(6, 3)',
        output: '[([2, 3, 4, 5], [0, 1]), ([0, 1, 4, 5], [2, 3]), ([0, 1, 2, 3], [4, 5])]',
        explanation: '6 samples split into 3 folds of 2; each fold validates on its block and trains on the rest.',
      },
      {
        input: 'kfold_indices(7, 3)',
        output: '[([3, 4, 5, 6], [0, 1, 2]), ([0, 1, 2, 5, 6], [3, 4]), ([0, 1, 2, 3, 4], [5, 6])]',
        explanation: '7 // 3 = 2 with remainder 1, so the first fold gets one extra sample: sizes 3, 2, 2.',
      },
    ],
    starterCode: `import numpy as np

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Train/validation indices for k-fold cross-validation (no shuffling).

    Args:
        n_samples: Total number of samples (>= k)
        k: Number of folds

    Returns:
        List of k tuples (train_indices, val_indices), each a sorted list of ints;
        the first n_samples % k folds have one extra validation sample
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic 3-fold',
        input: '(6, 3)',
        expected: '[[[2, 3, 4, 5], [0, 1]], [[0, 1, 4, 5], [2, 3]], [[0, 1, 2, 3], [4, 5]]]',
        hidden: false,
      },
      {
        id: '2',
        description: '2-fold',
        input: '(4, 2)',
        expected: '[[[2, 3], [0, 1]], [[0, 1], [2, 3]]]',
        hidden: false,
      },
      {
        id: '3',
        description: '4-fold',
        input: '(8, 4)',
        expected: '[[[2, 3, 4, 5, 6, 7], [0, 1]], [[0, 1, 4, 5, 6, 7], [2, 3]], [[0, 1, 2, 3, 6, 7], [4, 5]], [[0, 1, 2, 3, 4, 5], [6, 7]]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Number of folds equals k',
        input: 'len(kfold_indices(10, 5))',
        expected: '5',
        hidden: true,
      },
      {
        id: '5',
        description: 'Uneven folds: the first n % k folds get one extra sample',
        input: 'kfold_indices(7, 3)',
        expected: '[([3, 4, 5, 6], [0, 1, 2]), ([0, 1, 2, 5, 6], [3, 4]), ([0, 1, 2, 3, 4], [5, 6])]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Every index is validated exactly once and never trained on in its own fold',
        input: '(lambda f: (sorted(i for _, v in f for i in v) == list(range(11)), all(set(t).isdisjoint(v) and len(t) + len(v) == 11 for t, v in f)))(kfold_indices(11, 4))',
        expected: '(True, True)',
        hidden: true,
      },
    ],
    hints: [
      'First decide how big each fold is, then walk along the indices handing out consecutive blocks.',
      'Sizes: n_samples // k for every fold, plus one for the first n_samples % k folds; keep a running start offset.',
      'Validation = list(range(start, start + size)); training = list(range(0, start)) + list(range(start + size, n_samples)). (np.array_split(np.arange(n), k) produces the same blocks.)',
      'Pitfall: giving the remainder to the last fold (or dropping it) changes the folds; and return lists of ints, not NumPy arrays of floats.',
    ],
    solution: `import numpy as np

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Returns a list of k (train_indices, val_indices) tuples of sorted int lists.
    """
    fold_sizes = [n_samples // k + (1 if i < n_samples % k else 0) for i in range(k)]

    folds = []
    start = 0
    for size in fold_sizes:
        stop = start + size
        val = list(range(start, stop))
        train = list(range(0, start)) + list(range(stop, n_samples))  # already sorted
        folds.append((train, val))
        start = stop
    return folds

# Time and space O(k * n): each fold lists every index once.
`,
  },
  {
    id: 'confusion-matrix',
    title: 'Accuracy from the Confusion Matrix',
    section: 'model-evaluation',
    difficulty: 'easy',
    description: `
## Accuracy from the Confusion Matrix

### What you'll build
\`accuracy(y_true, y_pred)\`: the fraction of predictions that match the true labels, for binary or multi-class labels.

### Background
The **confusion matrix** \`M\` of a \`C\`-class problem has \`M[a, p]\` = the number of samples with true class \`a\` that were predicted as class \`p\`. Correct predictions sit on its diagonal, so accuracy is the diagonal sum over the total. It is the first metric everyone reports and the most misleading one on imbalanced data: a model that always predicts "not fraud" on a 1%-fraud dataset scores 0.99. This is \`sklearn.metrics.accuracy_score\`.

### Formula
\`\`\`text
accuracy = (1/n) * sum_i [y_pred[i] == y_true[i]]  =  trace(M) / n
\`\`\`
For binary labels this is \`(TP + TN) / (TP + TN + FP + FN)\`.

### Inputs
- \`y_true\`: true integer labels, shape \`(n,)\`, \`n >= 1\`
- \`y_pred\`: predicted integer labels, shape \`(n,)\`

(Tests may pass Python lists; convert with \`np.asarray\`.)

### Expected return format
A float in \`[0, 1]\` (not rounded).

### Edge cases and conventions
- Works unchanged for any number of classes: only equality matters.
- All correct gives \`1.0\`; all wrong gives \`0.0\`.

### Constraints
- NumPy only, vectorised (no loop over samples).

### Follow-up
- Build the full \`(C, C)\` confusion matrix with \`np.add.at\` or \`np.bincount(C * y_true + y_pred, minlength=C * C)\`.
- What is balanced accuracy, and when would you report it instead?
    `,
    examples: [
      {
        input: 'accuracy(np.array([0, 1, 1, 0, 1]), np.array([0, 1, 0, 0, 1]))',
        output: '0.8',
        explanation: '4 of the 5 predictions match (index 2 is wrong). The confusion matrix is [[2, 0], [1, 2]] with trace 4.',
      },
      {
        input: 'accuracy(np.array([0, 1, 2, 0, 1, 2]), np.array([0, 1, 2, 2, 1, 0]))',
        output: '0.6666666666666666',
        explanation: 'Multi-class works the same way: 4 of 6 labels match.',
      },
    ],
    starterCode: `import numpy as np

def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Fraction of predictions equal to the true labels.

    Args:
        y_true: True integer labels, shape (n,)
        y_pred: Predicted integer labels, shape (n,)

    Returns:
        Accuracy, a float in [0, 1]
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic accuracy',
        input: '([0, 1, 1, 0, 1], [0, 1, 0, 0, 1])',
        expected: '0.8',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfect accuracy',
        input: '([1, 1, 0, 0], [1, 1, 0, 0])',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Zero accuracy',
        input: '([0, 0, 1, 1], [1, 1, 0, 0])',
        expected: '0.0',
        hidden: true,
      },
      {
        id: '4',
        description: 'Multi-class accuracy',
        input: '([0, 1, 2, 0, 1, 2], [0, 1, 2, 2, 1, 0])',
        expected: '0.666667',
        hidden: true,
      },
      {
        id: '5',
        description: 'Four-class predictions',
        input: '(lambda: (yt := np.random.randint(0, 4, 30), yp := np.where(np.random.rand(30) < 0.6, yt, np.random.randint(0, 4, 30)), round(float(accuracy(yt, yp)), 6))[-1])()',
        expected: '0.666667',
        hidden: true,
      },
    ],
    hints: [
      'Accuracy only asks whether each prediction equals its label.',
      'Compare the two arrays element-wise to get a boolean array, then turn it into a fraction.',
      'np.mean(y_true == y_pred): the mean of a boolean array is the fraction of True values.',
      'Convert lists with np.asarray first: comparing two Python lists with == returns a single bool, not an element-wise result.',
    ],
    solution: `import numpy as np

def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Fraction of predictions equal to the true labels.
    """
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    # Mean of the boolean match array = trace(confusion matrix) / n
    return float(np.mean(y_true == y_pred))

# Time O(n), space O(n).
`,
  },
  {
    id: 'roc-auc',
    title: 'ROC Curve & AUC (with Ties)',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## ROC Curve & AUC (with Ties)

### What you'll build
\`roc_curve_auc(y_true, scores)\`: the ROC curve at every distinct score threshold and the area under it, with tied scores handled the way scikit-learn handles them.

### Background
A classifier that outputs scores becomes a yes/no decision with a threshold: predict positive when \`score >= t\`. The **ROC curve** shows every trade-off between catching positives and raising false alarms, and its area (**AUC**) summarises ranking quality in one threshold-free number: 1.0 is a perfect ranking, 0.5 is random.

### Formula
For a threshold \`t\`, with \`P\` positives and \`N\` negatives:
\`\`\`text
TPR(t) = #{score >= t and y = 1} / P        (recall)
FPR(t) = #{score >= t and y = 0} / N
\`\`\`
**Thresholds**: \`+inf\` first (nothing predicted positive: the point \`(0, 0)\`), then **every distinct score in decreasing order**. The last threshold is the smallest score, where everything is predicted positive: \`(1, 1)\`.

**AUC by the trapezoidal rule** over consecutive curve points:
\`\`\`text
AUC = sum_i (FPR[i+1] - FPR[i]) * (TPR[i+1] + TPR[i]) / 2
\`\`\`
With ties handled as below, this equals the normalised **Mann-Whitney U statistic**, the probability that a random positive outscores a random negative, counting ties as one half:
\`\`\`text
AUC = (1 / (P * N)) * sum_{i in pos} sum_{j in neg} ( [s_i > s_j] + 0.5 * [s_i == s_j] )
\`\`\`

### Inputs
- \`y_true\`: binary labels (0/1), shape \`(n,)\`, with **both classes present**
- \`scores\`: real-valued scores, shape \`(n,)\`; higher means more likely positive

### Expected Return Format
Return a dictionary with these keys (\`T\` = number of distinct scores):
- \`'thresholds'\`: float array of shape \`(T + 1,)\`: \`[inf, s_max, ..., s_min]\`
- \`'fpr'\`: float array of shape \`(T + 1,)\`, from \`0.0\` to \`1.0\`, non-decreasing
- \`'tpr'\`: float array of shape \`(T + 1,)\`, from \`0.0\` to \`1.0\`, non-decreasing
- \`'auc'\`: Python float

### Edge cases and conventions
- **Tied scores form a single threshold.** All the tied samples cross it together, so the curve takes one diagonal step instead of a staircase. Never break ties by sample order: that would make the AUC depend on how the data happens to be sorted.
- This matches \`sklearn.metrics.roc_curve(y_true, scores, drop_intermediate=False)\` (recent versions also start with \`inf\`), and the AUC matches \`sklearn.metrics.roc_auc_score\`.

### Constraints
- NumPy only (no sklearn). Vectorise the counts.

### Follow-up
- Compute the AUC in \`O(n log n)\` from ranks alone (average ranks for ties).
- Why can ROC-AUC look excellent on a heavily imbalanced problem where precision is poor?
    `,
    examples: [
      {
        input: 'y_true = [0, 0, 1, 1], scores = [0.1, 0.4, 0.35, 0.8]',
        output: 'thresholds [inf, 0.8, 0.4, 0.35, 0.1], fpr [0, 0, 0.5, 0.5, 1], tpr [0, 0.5, 0.5, 1, 1], auc 0.75',
        explanation: '3 of the 4 positive/negative pairs are ranked correctly.',
      },
      {
        input: 'y_true = [0, 1], scores = [0.5, 0.5]',
        output: 'fpr [0, 1], tpr [0, 1], auc 0.5',
        explanation: 'A tie is a single diagonal step: worth half a correctly ranked pair.',
      },
    ],
    starterCode: `import numpy as np

def roc_curve_auc(y_true, scores):
    """
    ROC curve over all distinct thresholds, and AUC by the trapezoidal rule.

    Args:
        y_true: Binary labels (0/1), shape (n,)
        scores: Real-valued scores, shape (n,); higher means more positive

    Returns:
        dict with 'thresholds', 'fpr', 'tpr' (each shape (T+1,)) and 'auc' (float)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Curve points without ties',
        input: '(lambda r: (r["thresholds"].tolist(), r["fpr"].tolist(), r["tpr"].tolist(), r["auc"]))(roc_curve_auc(np.array([0, 0, 1, 1]), np.array([0.1, 0.4, 0.35, 0.8])))',
        expected: '([inf, 0.8, 0.4, 0.35, 0.1], [0.0, 0.0, 0.5, 0.5, 1.0], [0.0, 0.5, 0.5, 1.0, 1.0], 0.75)',
        hidden: false,
      },
      {
        id: '2',
        description: 'A single tied pair is a diagonal step (AUC 0.5)',
        input: '(lambda r: (r["fpr"].tolist(), r["tpr"].tolist(), r["auc"]))(roc_curve_auc(np.array([0, 1]), np.array([0.5, 0.5])))',
        expected: '([0.0, 1.0], [0.0, 1.0], 0.5)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Perfect and reversed rankings',
        input: '(lambda: (roc_curve_auc(np.array([0, 0, 1, 1]), np.array([1, 2, 3, 4]))["auc"], roc_curve_auc(np.array([0, 0, 1, 1]), np.array([4, 3, 2, 1]))["auc"]))()',
        expected: '(1.0, 0.0)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Ties across classes match roc_auc_score',
        input: '(lambda r: (r["fpr"].tolist(), r["tpr"].tolist(), round(r["auc"], 6)))(roc_curve_auc(np.array([1, 0, 1, 1, 0, 0, 1, 0]), np.array([0.9, 0.9, 0.7, 0.5, 0.5, 0.5, 0.2, 0.1])))',
        expected: '([0.0, 0.25, 0.25, 0.75, 0.75, 1.0], [0.0, 0.25, 0.5, 0.75, 1.0, 1.0], 0.59375)',
        hidden: true,
      },
      {
        id: '5',
        description: 'AUC equals the Mann-Whitney statistic on heavily tied scores',
        input: `(lambda: (
    y := np.random.randint(0, 2, 60),
    s := np.random.randint(0, 5, 60) / 4,
    p := s[y == 1], q := s[y == 0],
    u := ((p[:, None] > q[None, :]) + 0.5 * (p[:, None] == q[None, :])).mean(),
    bool(np.isclose(roc_curve_auc(y, s)["auc"], u))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Endpoints and monotonicity on random scores',
        input: `(lambda: (
    y := np.random.randint(0, 2, 40),
    s := np.round(np.random.rand(40), 1),
    r := roc_curve_auc(y, s),
    (r["fpr"][0], r["tpr"][0], r["fpr"][-1], r["tpr"][-1], bool(np.all(np.diff(r["fpr"]) >= 0) and np.all(np.diff(r["tpr"]) >= 0)), len(r["thresholds"]) == len(np.unique(s)) + 1)
)[-1])()`,
        expected: '(0.0, 0.0, 1.0, 1.0, True, True)',
        hidden: true,
      },
      {
        id: '7',
        description: 'AUC on a fixed example with ties',
        input: 'round(roc_curve_auc(np.array([0, 1, 1, 0, 1, 0, 0, 1, 1, 0]), np.array([0.3, 0.6, 0.6, 0.6, 0.2, 0.1, 0.3, 0.9, 0.3, 0.45]))["auc"], 6)',
        expected: '0.68',
        hidden: true,
      },
    ],
    hints: [
      'Each distinct score is a candidate threshold; at each one, count how many positives and negatives score at least that much.',
      'thresholds = np.concatenate([[np.inf], np.unique(scores)[::-1]]): np.unique sorts and merges tied scores into a single threshold.',
      'predicted = scores[None, :] >= thresholds[:, None] is a (T+1, n) boolean matrix; TPR = (predicted & pos).sum(1) / P, FPR = (predicted & ~pos).sum(1) / N; then the trapezoid sum over consecutive points.',
      'Pitfall: sorting the samples and stepping one sample at a time breaks ties by order and gives a staircase; tied scores must enter together.',
    ],
    solution: `import numpy as np

def roc_curve_auc(y_true, scores):
    """
    Returns dict with 'thresholds', 'fpr', 'tpr' (each (T+1,)) and 'auc' (float).
    """
    y_true = np.asarray(y_true)
    scores = np.asarray(scores, dtype=float)
    pos = y_true == 1
    P, N = pos.sum(), (~pos).sum()

    # +inf, then every distinct score from high to low (ties = one threshold)
    thresholds = np.concatenate([[np.inf], np.unique(scores)[::-1]])

    # predicted[k, i] = sample i is predicted positive at threshold k
    predicted = scores[None, :] >= thresholds[:, None]
    tpr = (predicted & pos).sum(axis=1) / P
    fpr = (predicted & ~pos).sum(axis=1) / N

    # Trapezoidal rule; a tied group contributes one diagonal segment
    auc = float(np.sum((fpr[1:] - fpr[:-1]) * (tpr[1:] + tpr[:-1]) / 2))
    return {'thresholds': thresholds, 'fpr': fpr, 'tpr': tpr, 'auc': auc}

# The broadcast is O(n * T) time and memory; sorting + cumulative sums gives O(n log n).
`,
  },
  {
    id: 'calibration-ece',
    title: 'Expected Calibration Error',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## Expected Calibration Error

### What you'll build
\`expected_calibration_error(probs, labels, n_bins=10)\`: bin predictions by confidence and measure the average gap between confidence and accuracy, returning the per-bin statistics too (the data behind a reliability diagram).

### Background
A classifier is **calibrated** if, among the predictions it makes with confidence 0.8, about 80% are correct. Calibrated probabilities matter whenever a downstream decision uses the number itself: thresholds, expected-cost calculations, abstaining when unsure. Modern neural networks are often over-confident, and ECE measures by how much.

### Formula
For each sample \`i\` with predicted class probabilities \`probs[i]\` (shape \`(C,)\`):
\`\`\`text
confidence_i = max_c probs[i, c]
prediction_i = argmax_c probs[i, c]          (ties: the lowest class index, as np.argmax)
correct_i    = 1 if prediction_i == labels[i] else 0
\`\`\`
Split \`[0, 1]\` into \`M = n_bins\` equal-width bins with edges \`np.linspace(0, 1, M + 1)\`. Bin \`m\` is the half-open interval \`(m/M, (m+1)/M]\` (bin 0 also includes \`0.0\`). Then
\`\`\`text
count_m = |B_m|
acc_m   = mean(correct_i     for i in B_m)     (0 for an empty bin)
conf_m  = mean(confidence_i  for i in B_m)     (0 for an empty bin)
ECE     = sum_m (count_m / n) * |acc_m - conf_m|
\`\`\`

### Inputs
- \`probs\`: predicted probabilities, shape \`(n, C)\`, rows sum to 1
- \`labels\`: true class indices, shape \`(n,)\`
- \`n_bins\`: number of equal-width bins \`M\` (\`>= 1\`)

### Expected Return Format
Return a dictionary with these keys:
- \`'ece'\`: Python float in \`[0, 1]\`
- \`'bin_acc'\`: float array of shape \`(M,)\`: accuracy per bin
- \`'bin_conf'\`: float array of shape \`(M,)\`: mean confidence per bin
- \`'bin_count'\`: int array of shape \`(M,)\`: number of samples per bin

### Edge cases and conventions
- **Edges go to the bin below**: with \`M = 4\`, a confidence of exactly 0.5 is in bin 1 = \`(0.25, 0.5]\` and 1.0 is in bin 3. In NumPy the bin index is \`np.searchsorted(edges[1:-1], confidence, side='left')\`, the number of interior edges strictly below the confidence.
- Empty bins report \`acc = conf = 0\` and contribute nothing to the ECE.
- ECE is 0 for a perfectly calibrated model (on the binned data).

### Constraints
- NumPy only, vectorised (\`np.searchsorted\`, \`np.bincount\` with \`weights\`).

### Follow-up
- ECE depends on the number of bins. What are the alternatives (adaptive equal-mass bins, the Brier score)?
- How does temperature scaling fix over-confidence without changing the model's accuracy?
    `,
    examples: [
      {
        input: 'expected_calibration_error(np.array([[0.9, 0.1], [0.8, 0.2], [0.4, 0.6], [0.3, 0.7]]), np.array([0, 1, 1, 0]), n_bins=2)',
        output: "{'ece': 0.25, 'bin_acc': [0.0, 0.5], 'bin_conf': [0.0, 0.75], 'bin_count': [0, 4]}",
        explanation: 'All confidences (0.9, 0.8, 0.6, 0.7) fall in (0.5, 1]: mean confidence 0.75 but only 2 of 4 are correct, so ECE = 1.0 * |0.5 - 0.75| = 0.25.',
      },
      {
        input: 'expected_calibration_error(np.array([[0.75, 0.25]] * 4 + [[0.5, 0.5]] * 2), np.array([0, 0, 0, 1, 0, 1]), n_bins=4)',
        output: "{'ece': 0.0, 'bin_acc': [0.0, 0.5, 0.75, 0.0], 'bin_conf': [0.0, 0.5, 0.75, 0.0], 'bin_count': [0, 2, 4, 0]}",
        explanation: 'Confidence 0.5 lands in bin 1 = (0.25, 0.5] (edges go to the bin below) with 1 of 2 correct; the four 0.75 predictions have 3 of 4 correct. Every bin is calibrated, so ECE = 0.'
      },
    ],
    starterCode: `import numpy as np

def expected_calibration_error(probs, labels, n_bins=10):
    """
    Expected calibration error with equal-width (lo, hi] confidence bins.

    Args:
        probs: Predicted class probabilities, shape (n, C)
        labels: True class indices, shape (n,)
        n_bins: Number of equal-width bins over [0, 1]

    Returns:
        dict with 'ece' (float), 'bin_acc' (M,), 'bin_conf' (M,), 'bin_count' (M,) int
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Over-confident model in one bin',
        input: '(lambda r: (round(r["ece"], 6), r["bin_count"].tolist(), np.round(r["bin_conf"], 6).tolist(), np.round(r["bin_acc"], 6).tolist()))(expected_calibration_error(np.array([[0.9, 0.1], [0.8, 0.2], [0.4, 0.6], [0.3, 0.7]]), np.array([0, 1, 1, 0]), 2))',
        expected: '(0.25, [0, 4], [0.0, 0.75], [0.0, 0.5])',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfectly calibrated bins give ECE 0',
        input: 'round(expected_calibration_error(np.array([[0.75, 0.25]] * 4 + [[0.5, 0.5]] * 2), np.array([0, 0, 0, 1, 0, 1]), 4)["ece"], 6)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Edge values go to the bin below: (lo, hi]',
        input: 'expected_calibration_error(np.array([[0.25, 0.25, 0.25, 0.25], [0.5, 0.5, 0.0, 0.0], [0.75, 0.25, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0], [0.3, 0.3, 0.2, 0.2]]), np.array([0, 0, 0, 0, 0]), 4)["bin_count"].tolist()',
        expected: '[1, 2, 1, 1]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Per-bin accuracy, confidence and ECE with 10 bins',
        input: '(lambda r: (round(r["ece"], 6), r["bin_count"].tolist(), np.round(r["bin_acc"], 6).tolist(), np.round(r["bin_conf"], 6).tolist()))(expected_calibration_error(np.array([[0.95, 0.05], [0.92, 0.08], [0.15, 0.85], [0.33, 0.67], [0.6, 0.4], [0.55, 0.45], [0.1, 0.9], [0.72, 0.28]]), np.array([0, 1, 1, 1, 0, 1, 1, 1]), 10))',
        expected: '(0.29, [0, 0, 0, 0, 0, 2, 1, 1, 2, 2], [0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 1.0, 0.0, 1.0, 0.5], [0.0, 0.0, 0.0, 0.0, 0.0, 0.575, 0.67, 0.72, 0.875, 0.935])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Random 3-class predictions: ECE matches a loop reference',
        input: `(lambda: (
    logits := np.random.randn(50, 3) * 2,
    P := np.exp(logits) / np.exp(logits).sum(1, keepdims=True),
    y := np.random.randint(0, 3, 50),
    conf := P.max(1), cor := (P.argmax(1) == y),
    ref := sum((((conf > lo) & (conf <= lo + 0.2)).sum() / 50) * abs(cor[(conf > lo) & (conf <= lo + 0.2)].mean() - conf[(conf > lo) & (conf <= lo + 0.2)].mean()) for lo in [0.0, 0.2, 0.4, 0.6, 0.8] if ((conf > lo) & (conf <= lo + 0.2)).any()),
    bool(np.isclose(expected_calibration_error(P, y, 5)["ece"], ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reduce each row to two numbers first: how confident the model was, and whether it was right. Then group those numbers by confidence bin.',
      'confidence = probs.max(axis=1); correct = probs.argmax(axis=1) == labels.',
      "Bin index for (lo, hi] bins: np.searchsorted(np.linspace(0, 1, M + 1)[1:-1], confidence, side='left'); then np.bincount(bins, weights=..., minlength=M) gives per-bin counts and sums.",
      'Pitfalls: np.digitize / side=\'right\' puts edge values in the bin above, and dividing by an empty bin\'s count gives NaN (divide by max(count, 1)).',
    ],
    solution: `import numpy as np

def expected_calibration_error(probs, labels, n_bins=10):
    """
    Returns dict with 'ece' (float), 'bin_acc', 'bin_conf' (M,) and 'bin_count' (M,) int.
    """
    probs = np.asarray(probs, dtype=float)
    labels = np.asarray(labels)
    n = len(labels)

    confidence = probs.max(axis=1)
    correct = (probs.argmax(axis=1) == labels).astype(float)

    # (lo, hi] bins; a confidence of 0.0 lands in bin 0
    edges = np.linspace(0, 1, n_bins + 1)
    bins = np.searchsorted(edges[1:-1], confidence, side='left')

    count = np.bincount(bins, minlength=n_bins)
    acc_sum = np.bincount(bins, weights=correct, minlength=n_bins)
    conf_sum = np.bincount(bins, weights=confidence, minlength=n_bins)

    safe = np.maximum(count, 1)        # empty bins: stats stay 0
    bin_acc = acc_sum / safe
    bin_conf = conf_sum / safe

    ece = float(np.sum(count / n * np.abs(bin_acc - bin_conf)))
    return {'ece': ece, 'bin_acc': bin_acc, 'bin_conf': bin_conf, 'bin_count': count}

# Time O(n * C) for the max/argmax, then O(n + M) for the binning.
`,
  },
  {
    id: 'pr-curve-thresholds',
    title: 'Precision-Recall Curve and Best-F1 Threshold',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## Precision-Recall Curve and Best-F1 Threshold

### What you'll build
\`pr_curve(y_true, scores)\`: precision, recall and F1 at **every distinct score threshold**, plus the threshold with the best F1, which is a common way to pick a model's operating point.

### Background
When positives are rare (fraud, disease, defects), the precision-recall curve says far more than ROC: it shows how many false alarms you pay for each extra positive found. Teams often pick the deployment threshold by maximising F1 (or another F-beta) on validation data.

### Formula
For a threshold \`t\`, predict positive when \`score >= t\`:
\`\`\`text
TP(t) = #{score >= t and y = 1}      FP(t) = #{score >= t and y = 0}
P     = #{y = 1}                     FN(t) = P - TP(t)

precision(t) = TP / (TP + FP)
recall(t)    = TP / P
F1(t)        = 2 * TP / (2 * TP + FP + FN)      (equals 2PR / (P + R) when P + R > 0)
\`\`\`

### Inputs
- \`y_true\`: binary labels (0/1), shape \`(n,)\`
- \`scores\`: classifier scores, shape \`(n,)\`

### Expected Return Format
Return a dictionary with these keys:
- \`'thresholds'\`: list of floats, the distinct scores in **descending** order
- \`'precision'\`, \`'recall'\`, \`'f1'\`: lists of floats, one per threshold
- \`'best_threshold'\`: float, the threshold with the highest F1
- \`'best_f1'\`: float, that F1

### Edge cases and conventions
- **Ties**: tied scores enter together: the threshold equal to a tied score counts every sample with that score.
- Every threshold is an observed score, so \`TP + FP >= 1\` and precision is always defined.
- **No positive labels** (\`P = 0\`): recall is set to \`1.0\` at every threshold, as scikit-learn's \`precision_recall_curve\` does, and F1 is 0 (it is 0 whenever \`TP = 0\`).
- **Best threshold ties**: the **higher** threshold wins (the first one in the descending list).
- **Differences from \`sklearn.metrics.precision_recall_curve\`**: scikit-learn lists thresholds in increasing order and appends a final \`(precision=1, recall=0)\` point with no threshold; we use descending order and no extra point.

### Constraints
- NumPy only (no sklearn); \`O(n log n)\` with a sort and cumulative sums.

### Follow-up
- How would you pick a threshold that guarantees precision \`>= 0.9\` with maximum recall?
- Compute average precision (the step-wise area under this curve).
`,
    examples: [
      {
        input: 'pr_curve(np.array([1, 0, 1, 0, 1, 0, 1, 0]), np.array([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))',
        output: "{'thresholds': [0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.1], 'precision': [1.0, 0.5, 0.5, 0.6, 0.5, 0.5714, 0.5], 'recall': [0.25, 0.25, 0.5, 0.75, 0.75, 1.0, 1.0], 'f1': [0.4, 0.3333, 0.5, 0.6667, 0.6, 0.7273, 0.6667], 'best_threshold': 0.3, 'best_f1': 0.7273}",
        explanation: 'At t = 0.7 both tied samples (one positive, one negative) become positive at once. Values are shown rounded to 4 decimals.',
      },
    ],
    starterCode: `import numpy as np

def pr_curve(y_true, scores):
    """
    Precision, recall and F1 at every distinct score threshold.

    Args:
        y_true: Binary labels (0/1), array (n,)
        scores: Classifier scores, array (n,); predict positive when score >= threshold

    Returns:
        dict with 'thresholds' (descending), 'precision', 'recall', 'f1' (lists of floats),
        'best_threshold' (float) and 'best_f1' (float)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Distinct thresholds, descending',
        input: 'pr_curve(np.array([1, 0, 1, 0, 1, 0, 1, 0]), np.array([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["thresholds"]',
        expected: '[0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Precision at each threshold',
        input: '[round(v, 4) for v in pr_curve(np.array([1, 0, 1, 0, 1, 0, 1, 0]), np.array([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["precision"]]',
        expected: '[1.0, 0.5, 0.5, 0.6, 0.5, 0.5714, 0.5]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Recall at each threshold',
        input: '[round(v, 4) for v in pr_curve(np.array([1, 0, 1, 0, 1, 0, 1, 0]), np.array([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["recall"]]',
        expected: '[0.25, 0.25, 0.5, 0.75, 0.75, 1.0, 1.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'F1 at each threshold',
        input: '[round(v, 4) for v in pr_curve(np.array([1, 0, 1, 0, 1, 0, 1, 0]), np.array([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["f1"]]',
        expected: '[0.4, 0.3333, 0.5, 0.6667, 0.6, 0.7273, 0.6667]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Best threshold and F1',
        input: '(lambda: (r := pr_curve(np.array([1, 0, 1, 0, 1, 0, 1, 0]), np.array([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1])), (r["best_threshold"], round(r["best_f1"], 4)))[-1])()',
        expected: '(0.3, 0.7273)',
        hidden: true,
      },
      {
        id: '6',
        description: 'All scores tied: one threshold',
        input: '(lambda: (r := pr_curve(np.array([1, 0, 0, 1, 0]), np.array([0.5, 0.5, 0.5, 0.5, 0.5])), (r["thresholds"], r["precision"], r["recall"]))[-1])()',
        expected: '([0.5], [0.4], [1.0])',
        hidden: true,
      },
      {
        id: '7',
        description: 'No positives: recall 1.0, F1 0.0, highest threshold wins',
        input: '(lambda: (r := pr_curve(np.array([0, 0, 0]), np.array([0.2, 0.9, 0.5])), (r["recall"], r["f1"], r["best_threshold"]))[-1])()',
        expected: '([1.0, 1.0, 1.0], [0.0, 0.0, 0.0], 0.9)',
        hidden: true,
      },
      {
        id: '8',
        description: 'F1 ties go to the higher threshold',
        input: '(lambda: (r := pr_curve(np.array([1, 0, 1, 0, 0, 1]), np.array([0.9, 0.8, 0.7, 0.6, 0.5, 0.4])), (r["best_threshold"], round(r["best_f1"], 4)))[-1])()',
        expected: '(0.7, 0.6667)',
        hidden: true,
      },
      {
        id: '9',
        description: 'Random scores with many ties',
        input: '(lambda: (y := (np.random.rand(50) < 0.4).astype(int), s := np.round(np.random.rand(50), 1), r := pr_curve(y, s), (len(r["thresholds"]), round(r["best_threshold"], 1), round(r["best_f1"], 4)))[-1])()',
        expected: '(11, 0.2, 0.4706)',
        hidden: true,
      },
    ],
    hints: [
      'If you sort the samples by score from high to low, "predict the first i+1 samples positive" is exactly "threshold = the (i+1)-th score".',
      'After sorting, np.cumsum(y) gives TP and np.cumsum(1 - y) gives FP for each prefix.',
      'Ties: keep only the cumulative counts at the last index of each run of equal scores (np.diff(s) != 0 marks the run ends); then F1 = 2*TP / (2*TP + FP + FN) and np.argmax picks the first (highest) best threshold.',
      'Pitfalls: computing F1 from P and R gives 0/0 when both are 0, and P = 0 needs the recall = 1.0 convention instead of a division by zero.',
    ],
    solution: `import numpy as np

def pr_curve(y_true, scores):
    """
    Returns dict with 'thresholds' (descending), 'precision', 'recall', 'f1' (lists),
    'best_threshold' and 'best_f1' (floats).
    """
    y = np.asarray(y_true).astype(int)
    s = np.asarray(scores, dtype=float)

    # Sort by score, descending; cumulative counts give TP/FP for "score >= s[i]"
    order = np.argsort(-s, kind='stable')
    y, s = y[order], s[order]
    tps = np.cumsum(y)
    fps = np.cumsum(1 - y)

    # Keep the last position of each run of tied scores
    last = np.r_[np.where(np.diff(s) != 0)[0], len(s) - 1]
    thresholds = s[last]
    tp, fp = tps[last], fps[last]
    n_pos = y.sum()
    fn = n_pos - tp

    precision = tp / (tp + fp)
    recall = tp / n_pos if n_pos > 0 else np.ones(len(tp))
    f1 = 2 * tp / (2 * tp + fp + fn)

    best = int(np.argmax(f1))  # first maximum = highest threshold
    return {
        'thresholds': thresholds.tolist(),
        'precision': precision.tolist(),
        'recall': recall.tolist(),
        'f1': f1.tolist(),
        'best_threshold': float(thresholds[best]),
        'best_f1': float(f1[best]),
    }

# Time O(n log n) for the sort, space O(n).
`,
  },
];
