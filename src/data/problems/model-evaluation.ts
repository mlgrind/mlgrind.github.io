import { Problem } from '../../types';

export const modelEvaluationProblems: Problem[] = [
  {
    id: 'precision-recall-f1',
    title: 'Precision and Recall',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## Precision and Recall

Calculate precision and recall from true labels and predictions.

### Formulas
\`\`\`
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
\`\`\`

Where:
- TP = True Positives (predicted 1, actual 1)
- FP = False Positives (predicted 1, actual 0)
- FN = False Negatives (predicted 0, actual 1)

### Function Signature
\`\`\`python
def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
\`\`\`

Returns (precision, recall) rounded to 4 decimal places.
    `,
    examples: [
      {
        input: 'y_true = [1, 1, 0, 1, 0], y_pred = [1, 0, 0, 1, 1]',
        output: '(0.6667, 0.6667)',
        explanation: 'TP=2, FP=1, FN=1. Precision=2/3, Recall=2/3',
      },
    ],
    starterCode: `import numpy as np

def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
    """
    Calculate precision and recall for binary classification.

    Args:
        y_true: True labels (0 or 1)
        y_pred: Predicted labels (0 or 1)

    Returns:
        Tuple of (precision, recall) rounded to 4 decimal places
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
    ],
    hints: [
      'Count TP where both y_true and y_pred are 1.',
      'Count FP where y_pred is 1 but y_true is 0.',
      'Count FN where y_true is 1 but y_pred is 0.',
    ],
    solution: `import numpy as np

def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
    """
    Calculate precision and recall for binary classification.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Calculate TP, FP, FN
    tp = np.sum((y_true == 1) & (y_pred == 1))
    fp = np.sum((y_true == 0) & (y_pred == 1))
    fn = np.sum((y_true == 1) & (y_pred == 0))

    # Calculate precision and recall
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0

    return (round(precision, 4), round(recall, 4))
`,
  },
  {
    id: 'cross-validation',
    title: 'K-Fold Split Indices',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## K-Fold Cross-Validation Indices

Generate train and validation indices for K-fold cross-validation.

### Concept
Split data into K equal parts. For each fold:
- Use 1 part for validation
- Use remaining K-1 parts for training

### Function Signature
\`\`\`python
def kfold_indices(n_samples: int, k: int) -> list:
\`\`\`

Returns list of (train_indices, val_indices) tuples for each fold.
    `,
    examples: [
      {
        input: 'n_samples = 6, k = 3',
        output: '[([2,3,4,5], [0,1]), ([0,1,4,5], [2,3]), ([0,1,2,3], [4,5])]',
        explanation: 'Split [0,1,2,3,4,5] into 3 folds of size 2',
      },
    ],
    starterCode: `import numpy as np

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Generate train/validation indices for K-fold cross-validation.

    Args:
        n_samples: Total number of samples
        k: Number of folds

    Returns:
        List of (train_indices, val_indices) tuples
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
    ],
    hints: [
      'Divide indices into k equal-sized chunks.',
      'For each fold, one chunk is validation, rest are training.',
      'Use np.array_split() to create chunks.',
    ],
    solution: `import numpy as np

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Generate train/validation indices for K-fold cross-validation.
    """
    indices = np.arange(n_samples)
    fold_sizes = np.full(k, n_samples // k)
    fold_sizes[:n_samples % k] += 1

    folds = []
    current = 0
    for fold_size in fold_sizes:
        val_indices = list(range(current, current + fold_size))
        train_indices = [i for i in range(n_samples) if i not in val_indices]
        folds.append((train_indices, val_indices))
        current += fold_size

    return folds
`,
  },
  {
    id: 'confusion-matrix',
    title: 'Accuracy Score',
    section: 'model-evaluation',
    difficulty: 'easy',
    description: `
## Accuracy Score

Calculate the accuracy of predictions - the proportion of correct predictions.

### Formula
\`\`\`
Accuracy = (Number of correct predictions) / (Total predictions)
\`\`\`

### Function Signature
\`\`\`python
def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
\`\`\`

### Note
While simple, accuracy can be misleading for imbalanced datasets.
    `,
    examples: [
      {
        input: 'y_true = [0, 1, 1, 0, 1], y_pred = [0, 1, 0, 0, 1]',
        output: '0.8',
        explanation: '4 correct out of 5 predictions',
      },
    ],
    starterCode: `import numpy as np

def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Calculate accuracy of predictions.

    Args:
        y_true: True labels
        y_pred: Predicted labels

    Returns:
        Accuracy score between 0 and 1
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
    ],
    hints: [
      'Compare y_true and y_pred element-wise.',
      'Count matches and divide by total.',
      'np.mean() of boolean array gives proportion of True.',
    ],
    solution: `import numpy as np

def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Calculate accuracy of predictions.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return np.mean(y_true == y_pred)
`,
  },
  {
    id: 'roc-auc',
    title: 'ROC Curve & AUC (with Ties)',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## ROC Curve and AUC

A classifier that outputs scores can be turned into a yes/no decision with a threshold: predict positive when \`score >= t\`. The **ROC curve** traces, over all thresholds,
\`\`\`
TPR(t) = TP(t) / P        (recall: fraction of positives with score >= t)
FPR(t) = FP(t) / N        (fraction of negatives with score >= t)
\`\`\`
where \`P\` and \`N\` are the numbers of positive and negative samples. **AUC** is the area under this curve.

Implement \`roc_curve_auc(y_true, scores)\`.

### Thresholds
- Use \`+inf\` first (nothing is predicted positive, giving the point \`(0, 0)\`), then **every distinct score in decreasing order**.
- The last threshold is the smallest score, where everything is predicted positive: \`(1, 1)\`.
- **Tied scores form a single threshold.** Several samples cross the threshold together, so the curve takes one diagonal step instead of a staircase. Never break ties by sample order.

This matches \`sklearn.metrics.roc_curve(y_true, scores, drop_intermediate=False)\`.

### AUC by the trapezoidal rule
\`\`\`
AUC = sum_i (FPR[i+1] - FPR[i]) * (TPR[i+1] + TPR[i]) / 2
\`\`\`
With ties handled as above, this equals \`sklearn.metrics.roc_auc_score\` and the normalized **Mann-Whitney U statistic**: the probability that a random positive outscores a random negative, counting ties as one half:
\`\`\`
AUC = (1 / (P * N)) * sum_{i in pos} sum_{j in neg} ( [s_i > s_j] + 0.5 * [s_i == s_j] )
\`\`\`
You may assume both classes are present.

### Expected Return Format
Return a dictionary with these keys:
- \`'thresholds'\`: array of shape \`(T + 1,)\`, \`[inf, s_max, ..., s_min]\` for \`T\` distinct scores
- \`'fpr'\`: array of shape \`(T + 1,)\`, starting at \`0.0\` and ending at \`1.0\`
- \`'tpr'\`: array of shape \`(T + 1,)\`, starting at \`0.0\` and ending at \`1.0\`
- \`'auc'\`: float
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
      'thresholds = [inf] followed by np.unique(scores)[::-1]: np.unique merges tied scores into one threshold.',
      'A (T+1, n) boolean matrix scores[None, :] >= thresholds[:, None] gives every confusion count at once.',
      'TPR = (predicted & positive).sum(1) / P, FPR = (predicted & negative).sum(1) / N, then the trapezoid sum over consecutive points.',
    ],
    solution: `import numpy as np

def roc_curve_auc(y_true, scores):
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

    auc = float(np.sum((fpr[1:] - fpr[:-1]) * (tpr[1:] + tpr[:-1]) / 2))
    return {'thresholds': thresholds, 'fpr': fpr, 'tpr': tpr, 'auc': auc}
`,
  },
  {
    id: 'calibration-ece',
    title: 'Expected Calibration Error',
    section: 'model-evaluation',
    difficulty: 'medium',
    description: `
## Expected Calibration Error (ECE)

A classifier is **calibrated** if, among the predictions it makes with confidence 0.8, about 80% are correct. Modern neural networks are often *over-confident*, and ECE measures by how much.

Implement \`expected_calibration_error(probs, labels, n_bins=10)\`.

### Confidence and correctness
For each sample \`i\` with predicted class probabilities \`probs[i]\` (shape \`(C,)\`):
\`\`\`
confidence_i = max_c probs[i, c]
prediction_i = argmax_c probs[i, c]
correct_i    = (prediction_i == labels[i])
\`\`\`

### Equal-width bins: (lo, hi] convention
Split \`[0, 1]\` into \`M = n_bins\` bins with edges \`np.linspace(0, 1, M + 1)\`. Bin \`m\` is the half-open interval
\`\`\`
B_m = (m/M, (m+1)/M]       for m = 0 .. M-1     (bin 0 also includes 0.0)
\`\`\`
so a confidence exactly on an edge goes to the bin **below** it (e.g. with \`M = 4\`, 0.5 goes to bin 1 = (0.25, 0.5] and 1.0 goes to bin 3).
In NumPy, the bin index is \`np.searchsorted(edges[1:-1], confidence, side='left')\`, which equals the number of interior edges strictly below the confidence.

### Per-bin statistics and ECE
\`\`\`
count_m = |B_m|
acc_m   = mean(correct_i     for i in B_m)     (0 for an empty bin)
conf_m  = mean(confidence_i  for i in B_m)     (0 for an empty bin)

ECE = sum_m (count_m / n) * |acc_m - conf_m|
\`\`\`
ECE is 0 for a perfectly calibrated model and at most 1.

### Expected Return Format
Return a dictionary with these keys:
- \`'ece'\`: float
- \`'bin_acc'\`: array of shape \`(M,)\`, accuracy per bin
- \`'bin_conf'\`: array of shape \`(M,)\`, mean confidence per bin
- \`'bin_count'\`: int array of shape \`(M,)\`, number of samples per bin
    `,
    examples: [
      {
        input: 'probs = [[0.9, 0.1], [0.8, 0.2], [0.4, 0.6], [0.3, 0.7]], labels = [0, 1, 1, 0], n_bins = 2',
        output: 'bin_count [0, 4], bin_conf [0, 0.75], bin_acc [0, 0.5], ece 0.25',
        explanation: 'All confidences (0.9, 0.8, 0.6, 0.7) fall in (0.5, 1]; mean confidence 0.75 but only 2 of 4 are correct.',
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
      'confidence = probs.max(axis=1); correct = probs.argmax(axis=1) == labels.',
      'Bin index for (lo, hi] bins: np.searchsorted(np.linspace(0, 1, M + 1)[1:-1], confidence, side=\'left\').',
      'np.bincount(bins, weights=..., minlength=M) sums correctness and confidence per bin; divide by max(count, 1) so empty bins stay 0.',
    ],
    solution: `import numpy as np

def expected_calibration_error(probs, labels, n_bins=10):
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
`,
  },
];
