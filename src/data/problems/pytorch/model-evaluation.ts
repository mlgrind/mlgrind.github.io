import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../model-evaluation.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const modelEvaluationPyTorch: Record<string, LanguageVariant> = {
  'precision-recall-f1': {
    note: "Count with boolean masks and .sum().item(); don't use sklearn or torchmetrics. Return Python floats.",
    starterCode: `import torch

def precision_recall(y_true: torch.Tensor, y_pred: torch.Tensor) -> tuple:
    """
    Precision and recall for binary classification (positive class = 1).

    Args:
        y_true: True labels (0 or 1), int64 tensor of shape (n,)
        y_pred: Predicted labels (0 or 1), int64 tensor of shape (n,)

    Returns:
        Tuple (precision, recall) of floats rounded to 4 decimals;
        a metric whose denominator is 0 is returned as 0.0
    """
    # Your code here
    pass
`,
    solution: `import torch

def precision_recall(y_true: torch.Tensor, y_pred: torch.Tensor) -> tuple:
    """
    Calculate precision and recall for binary classification.
    """
    # Calculate TP, FP, FN as Python ints
    tp = ((y_true == 1) & (y_pred == 1)).sum().item()
    fp = ((y_true == 0) & (y_pred == 1)).sum().item()
    fn = ((y_true == 1) & (y_pred == 0)).sum().item()

    # Calculate precision and recall
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0

    return (round(precision, 4), round(recall, 4))
`,
    testCases: [
      {
        id: '1',
        description: 'Mixed predictions',
        input: 'precision_recall(torch.tensor([1, 1, 0, 1, 0]), torch.tensor([1, 0, 0, 1, 1]))',
        expected: '(0.6667, 0.6667)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfect predictions',
        input: 'precision_recall(torch.tensor([1, 1, 0, 0]), torch.tensor([1, 1, 0, 0]))',
        expected: '(1.0, 1.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'High precision, low recall',
        input: 'precision_recall(torch.tensor([1, 1, 1, 1, 0]), torch.tensor([1, 0, 0, 0, 0]))',
        expected: '(1.0, 0.25)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Low precision, full recall',
        input: 'precision_recall(torch.tensor([0, 0, 1, 0, 0, 0, 1]), torch.tensor([1, 1, 1, 0, 1, 0, 1]))',
        expected: '(0.4, 1.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'No positive predictions: precision falls back to 0.0',
        input: 'precision_recall(torch.tensor([1, 1, 0]), torch.tensor([0, 0, 0]))',
        expected: '(0.0, 0.0)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Longer mixed example',
        input: 'precision_recall(torch.tensor([1, 0, 1, 1, 0, 0, 1, 0, 1, 1]), torch.tensor([1, 1, 1, 0, 0, 1, 1, 0, 1, 1]))',
        expected: '(0.7143, 0.8333)',
        hidden: true,
      },
    ],
    hints: [
      'Every sample falls into one of four cells (TP, FP, FN, TN). Which three do you need?',
      'Build boolean masks with == and combine them with &.',
      '((y_true == 1) & (y_pred == 1)).sum().item() is TP as a Python int; FP and FN flip one side.',
      'Guard both denominators (nothing predicted positive gives TP + FP = 0) and round with round(x, 4).',
    ],
  },
  'cross-validation': {
    note: "Slice torch.arange(n_samples) into contiguous folds and join the rest with torch.cat; don't use sklearn's KFold. Return plain Python lists (.tolist()).",
    starterCode: `import torch

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Train/validation indices for k-fold cross-validation (no shuffling).

    Args:
        n_samples: Total number of samples (>= k)
        k: Number of folds

    Returns:
        List of k tuples (train_indices, val_indices), each a sorted Python list of ints;
        the first n_samples % k folds have one extra validation sample
    """
    # Your code here
    pass
`,
    solution: `import torch

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Generate train/validation indices for K-fold cross-validation.
    """
    indices = torch.arange(n_samples)

    # The first n_samples % k folds get one extra sample
    fold_sizes = [n_samples // k + (1 if i < n_samples % k else 0) for i in range(k)]

    folds = []
    start = 0
    for size in fold_sizes:
        val_idx = indices[start:start + size]
        train_idx = torch.cat([indices[:start], indices[start + size:]])
        folds.append((train_idx.tolist(), val_idx.tolist()))
        start += size

    return folds
`,
    testCases: [
      {
        id: '1',
        description: 'Basic 3-fold',
        input: 'kfold_indices(6, 3)',
        expected: '[[[2, 3, 4, 5], [0, 1]], [[0, 1, 4, 5], [2, 3]], [[0, 1, 2, 3], [4, 5]]]',
        hidden: false,
      },
      {
        id: '2',
        description: '2-fold',
        input: 'kfold_indices(4, 2)',
        expected: '[[[2, 3], [0, 1]], [[0, 1], [2, 3]]]',
        hidden: false,
      },
      {
        id: '3',
        description: '4-fold',
        input: 'kfold_indices(8, 4)',
        expected: '[[[2, 3, 4, 5, 6, 7], [0, 1]], [[0, 1, 4, 5, 6, 7], [2, 3]], [[0, 1, 2, 3, 6, 7], [4, 5]], [[0, 1, 2, 3, 4, 5], [6, 7]]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Uneven folds (first fold gets the extra sample)',
        input: 'kfold_indices(5, 2)',
        expected: '[[[3, 4], [0, 1, 2]], [[0, 1, 2], [3, 4]]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Uneven folds: the first n % k folds get one extra sample',
        input: 'kfold_indices(7, 3)',
        expected: '[([3, 4, 5, 6], [0, 1, 2]), ([0, 1, 2, 5, 6], [3, 4]), ([0, 1, 2, 3, 4], [5, 6])]',
        hidden: true,
      },
    ],
    hints: [
      'First decide how big each fold is, then walk along the indices handing out consecutive blocks.',
      'Fold sizes: n_samples // k, plus one for the first n_samples % k folds; keep a running start offset.',
      'indices[start:start + size] is the validation fold; torch.cat([indices[:start], indices[start + size:]]) is the training set; .tolist() both.',
      'Pitfall: giving the remainder to the last fold changes every fold boundary.',
    ],
  },
  'confusion-matrix': {
    note: "Compare tensors element-wise and average; don't use sklearn or torchmetrics. Return a Python float (.item()).",
    starterCode: `import torch

def accuracy(y_true: torch.Tensor, y_pred: torch.Tensor) -> float:
    """
    Fraction of predictions equal to the true labels.

    Args:
        y_true: True integer labels, int64 tensor of shape (n,)
        y_pred: Predicted integer labels, int64 tensor of shape (n,)

    Returns:
        Accuracy, a Python float in [0, 1]
    """
    # Your code here
    pass
`,
    solution: `import torch

def accuracy(y_true: torch.Tensor, y_pred: torch.Tensor) -> float:
    """
    Calculate accuracy of predictions.
    """
    # A bool tensor has no mean(): convert to float first
    return (y_true == y_pred).float().mean().item()
`,
    testCases: [
      {
        id: '1',
        description: 'Basic accuracy',
        input: 'accuracy(torch.tensor([0, 1, 1, 0, 1]), torch.tensor([0, 1, 0, 0, 1]))',
        expected: '0.8',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfect accuracy',
        input: 'accuracy(torch.tensor([1, 1, 0, 0]), torch.tensor([1, 1, 0, 0]))',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Zero accuracy',
        input: 'accuracy(torch.tensor([0, 0, 1, 1]), torch.tensor([1, 1, 0, 0]))',
        expected: '0.0',
        hidden: true,
      },
      {
        id: '4',
        description: 'Multi-class labels',
        input: 'accuracy(torch.tensor([2, 0, 1, 2, 1, 0, 2, 1]), torch.tensor([2, 1, 1, 2, 0, 0, 2, 2]))',
        expected: '0.625',
        hidden: true,
      },
      {
        id: '5',
        description: 'Four-class predictions',
        input: 'round(accuracy(torch.tensor([0, 1, 2, 3, 3, 2, 1, 0, 0, 2]), torch.tensor([0, 1, 1, 3, 2, 2, 1, 0, 3, 2])), 6)',
        expected: '0.7',
        hidden: true,
      },
    ],
    hints: [
      'Accuracy only asks whether each prediction equals its label.',
      'y_true == y_pred gives a boolean tensor.',
      '(y_true == y_pred).float().mean().item(): the mean of the 0/1 values is the fraction correct.',
      'Integer and boolean tensors have no .mean(): convert with .float() first.',
    ],
  },
  // Ported with the new problems from the ML Coding Lab fork.
  'roc-auc': {
    note: "Implement with tensor ops; don't use sklearn or torchmetrics. torch.unique returns sorted values, so flip them for decreasing thresholds. Return tensors for the curve and a Python float for the AUC.",
    starterCode: `import torch

def roc_curve_auc(y_true, scores):
    """
    ROC curve over all distinct thresholds, and AUC by the trapezoidal rule.

    Args:
        y_true: int64 tensor of binary labels (0/1), shape (n,)
        scores: Float tensor of scores, shape (n,)

    Returns:
        dict with tensors 'thresholds', 'fpr', 'tpr' (each (T+1,)) and float 'auc'
    """
    # Your code here
    pass
`,
    solution: `import torch

def roc_curve_auc(y_true, scores):
    scores = scores.float()
    pos = y_true == 1
    P, N = pos.sum().item(), (~pos).sum().item()

    thresholds = torch.cat([torch.tensor([float('inf')]), torch.unique(scores).flip(0)])

    predicted = scores.unsqueeze(0) >= thresholds.unsqueeze(1)    # (T+1, n)
    tpr = (predicted & pos).sum(dim=1).float() / P
    fpr = (predicted & ~pos).sum(dim=1).float() / N

    auc = ((fpr[1:] - fpr[:-1]) * (tpr[1:] + tpr[:-1]) / 2).sum().item()
    return {'thresholds': thresholds, 'fpr': fpr, 'tpr': tpr, 'auc': auc}
`,
    testCases: [
      {
        id: '1',
        description: 'Curve points without ties',
        input: '(lambda r: (r["fpr"].tolist(), r["tpr"].tolist(), r["auc"]))(roc_curve_auc(torch.tensor([0, 0, 1, 1]), torch.tensor([0.1, 0.4, 0.35, 0.8])))',
        expected: '([0.0, 0.0, 0.5, 0.5, 1.0], [0.0, 0.5, 0.5, 1.0, 1.0], 0.75)',
        hidden: false,
      },
      {
        id: '2',
        description: 'A single tied pair is a diagonal step (AUC 0.5)',
        input: '(lambda r: (r["fpr"].tolist(), r["tpr"].tolist(), r["auc"]))(roc_curve_auc(torch.tensor([0, 1]), torch.tensor([0.5, 0.5])))',
        expected: '([0.0, 1.0], [0.0, 1.0], 0.5)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Thresholds start at +inf and decrease',
        input: '(lambda t: (t[0].item(), [round(v, 4) for v in t[1:].tolist()]))(roc_curve_auc(torch.tensor([0, 0, 1, 1]), torch.tensor([0.1, 0.4, 0.35, 0.8]))["thresholds"])',
        expected: '(inf, [0.8, 0.4, 0.35, 0.1])',
        hidden: false,
      },
      {
        id: '4',
        description: 'Ties across classes match roc_auc_score',
        input: '(lambda r: (r["fpr"].tolist(), r["tpr"].tolist(), round(r["auc"], 6)))(roc_curve_auc(torch.tensor([1, 0, 1, 1, 0, 0, 1, 0]), torch.tensor([0.9, 0.9, 0.7, 0.5, 0.5, 0.5, 0.2, 0.1])))',
        expected: '([0.0, 0.25, 0.25, 0.75, 0.75, 1.0], [0.0, 0.25, 0.5, 0.75, 1.0, 1.0], 0.59375)',
        hidden: true,
      },
      {
        id: '5',
        description: 'AUC equals the Mann-Whitney statistic on heavily tied scores',
        input: `(lambda: (
    y := torch.randint(0, 2, (60,)),
    s := torch.randint(0, 5, (60,)).float() / 4,
    p := s[y == 1], q := s[y == 0],
    u := ((p.unsqueeze(1) > q.unsqueeze(0)).float() + 0.5 * (p.unsqueeze(1) == q.unsqueeze(0)).float()).mean().item(),
    bool(abs(roc_curve_auc(y, s)["auc"] - u) < 1e-6)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'AUC on a fixed example with ties',
        input: 'round(roc_curve_auc(torch.tensor([0, 1, 1, 0, 1, 0, 0, 1, 1, 0]), torch.tensor([0.3, 0.6, 0.6, 0.6, 0.2, 0.1, 0.3, 0.9, 0.3, 0.45]))["auc"], 6)',
        expected: '0.68',
        hidden: true,
      },
    ],
    hints: [
      'Each distinct score is a candidate threshold; at each one, count how many positives and negatives score at least that much.',
      "thresholds = torch.cat([torch.tensor([float('inf')]), torch.unique(scores).flip(0)]): torch.unique merges tied scores into one threshold.",
      'predicted = scores.unsqueeze(0) >= thresholds.unsqueeze(1) is (T+1, n); combine with the positive mask using & and sum over dim=1, cast to float, divide by P or N, then sum the trapezoids and call .item().',
      'Pitfall: stepping one sorted sample at a time breaks ties by order; tied scores must enter together.',
    ],
  },
  'calibration-ece': {
    note: "Implement with tensor ops; don't use torchmetrics. Bin with comparisons against the interior edges (or torch.bucketize(conf, edges, right=False)); return tensors for the per-bin stats and a Python float for the ECE.",
    starterCode: `import torch

def expected_calibration_error(probs, labels, n_bins=10):
    """
    Expected calibration error with equal-width (lo, hi] confidence bins.

    Args:
        probs: Float tensor of class probabilities, shape (n, C)
        labels: int64 tensor of true classes, shape (n,)
        n_bins: Number of equal-width bins over [0, 1]

    Returns:
        dict with float 'ece' and tensors 'bin_acc' (M,), 'bin_conf' (M,), 'bin_count' (M,) int64
    """
    # Your code here
    pass
`,
    solution: `import torch

def expected_calibration_error(probs, labels, n_bins=10):
    n = labels.shape[0]
    confidence, prediction = probs.max(dim=1)
    correct = (prediction == labels).float()

    # (lo, hi] bins: index = number of interior edges strictly below the confidence
    inner = torch.linspace(0, 1, n_bins + 1)[1:-1]
    bins = (confidence.unsqueeze(1) > inner.unsqueeze(0)).sum(dim=1)

    count = torch.bincount(bins, minlength=n_bins)
    onehot = (bins.unsqueeze(1) == torch.arange(n_bins).unsqueeze(0)).float()   # (n, M)
    safe = count.clamp(min=1).float()
    bin_acc = (onehot * correct.unsqueeze(1)).sum(dim=0) / safe
    bin_conf = (onehot * confidence.unsqueeze(1)).sum(dim=0) / safe

    ece = (count.float() / n * (bin_acc - bin_conf).abs()).sum().item()
    return {'ece': ece, 'bin_acc': bin_acc, 'bin_conf': bin_conf, 'bin_count': count}
`,
    testCases: [
      {
        id: '1',
        description: 'Over-confident model in one bin',
        input: '(lambda r: (round(r["ece"], 5), r["bin_count"].tolist(), [round(v, 5) for v in r["bin_conf"].tolist()], [round(v, 5) for v in r["bin_acc"].tolist()]))(expected_calibration_error(torch.tensor([[0.9, 0.1], [0.8, 0.2], [0.4, 0.6], [0.3, 0.7]]), torch.tensor([0, 1, 1, 0]), 2))',
        expected: '(0.25, [0, 4], [0.0, 0.75], [0.0, 0.5])',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfectly calibrated bins give ECE 0',
        input: 'round(expected_calibration_error(torch.tensor([[0.75, 0.25]] * 4 + [[0.5, 0.5]] * 2), torch.tensor([0, 0, 0, 1, 0, 1]), 4)["ece"], 5)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Edge values go to the bin below: (lo, hi]',
        input: 'expected_calibration_error(torch.tensor([[0.25, 0.25, 0.25, 0.25], [0.5, 0.5, 0.0, 0.0], [0.75, 0.25, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0], [0.3, 0.3, 0.2, 0.2]]), torch.tensor([0, 0, 0, 0, 0]), 4)["bin_count"].tolist()',
        expected: '[1, 2, 1, 1]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Per-bin accuracy, confidence and ECE with 10 bins',
        input: '(lambda r: bool(abs(r["ece"] - 0.29) < 1e-5 and r["bin_count"].tolist() == [0, 0, 0, 0, 0, 2, 1, 1, 2, 2] and torch.allclose(r["bin_acc"], torch.tensor([0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 1.0, 0.0, 1.0, 0.5], dtype=torch.float32))))(expected_calibration_error(torch.tensor([[0.95, 0.05], [0.92, 0.08], [0.15, 0.85], [0.33, 0.67], [0.6, 0.4], [0.55, 0.45], [0.1, 0.9], [0.72, 0.28]]), torch.tensor([0, 1, 1, 1, 0, 1, 1, 1]), 10))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Random 3-class predictions: ECE matches a loop reference',
        input: `(lambda: (
    P := torch.softmax(torch.randn(50, 3) * 2, dim=1),
    y := torch.randint(0, 3, (50,)),
    conf := P.max(dim=1).values, cor := (P.argmax(dim=1) == y).float(),
    ref := sum((((conf > lo) & (conf <= lo + 0.2)).float().mean() * (cor[(conf > lo) & (conf <= lo + 0.2)].mean() - conf[(conf > lo) & (conf <= lo + 0.2)].mean()).abs()).item() for lo in [0.0, 0.2, 0.4, 0.6, 0.8] if bool(((conf > lo) & (conf <= lo + 0.2)).any())),
    bool(abs(expected_calibration_error(P, y, 5)["ece"] - ref) < 1e-5)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reduce each row to two numbers first (confidence and correctness), then group them by confidence bin.',
      'confidence, prediction = probs.max(dim=1); correct = (prediction == labels).float().',
      'bins = (confidence.unsqueeze(1) > inner_edges.unsqueeze(0)).sum(dim=1) implements the (lo, hi] rule; torch.bincount(bins, minlength=M) counts, and torch.bincount(bins, weights=..., minlength=M) sums.',
      "Pitfalls: right=True in torch.bucketize puts edge values in the bin above, and empty bins must not divide by zero (clamp the counts to at least 1).",
    ],
  },
  'pr-curve-thresholds': {
    note: "Implement with tensor ops; don't use sklearn or torchmetrics. Return Python lists and floats (.tolist() / .item()). Comparing each score with every threshold by broadcasting is fine at this size.",
    starterCode: `import torch

def pr_curve(y_true, scores):
    """
    Precision, recall and F1 at every distinct score threshold.

    Args:
        y_true: Binary labels (0/1), int64 tensor (n,)
        scores: Classifier scores, float tensor (n,); predict positive when score >= threshold

    Returns:
        dict with 'thresholds' (descending), 'precision', 'recall', 'f1' (lists of floats),
        'best_threshold' (float) and 'best_f1' (float)
    """
    # Your code here
    pass
`,
    solution: `import torch

def pr_curve(y_true, scores):
    y = y_true.long()
    thresholds = torch.unique(scores).flip(0)            # distinct scores, descending

    # pred[i, j]: sample j is predicted positive at threshold i
    pred = scores[None, :] >= thresholds[:, None]
    pos = (y == 1)[None, :]
    tp = (pred & pos).sum(dim=1).float()
    fp = (pred & ~pos).sum(dim=1).float()
    n_pos = int(y.sum().item())
    fn = n_pos - tp

    precision = tp / (tp + fp)
    recall = tp / n_pos if n_pos > 0 else torch.ones_like(tp)
    f1 = 2 * tp / (2 * tp + fp + fn)

    best = int(torch.argmax(f1).item())  # first maximum = highest threshold
    return {
        'thresholds': thresholds.tolist(),
        'precision': precision.tolist(),
        'recall': recall.tolist(),
        'f1': f1.tolist(),
        'best_threshold': thresholds[best].item(),
        'best_f1': f1[best].item(),
    }
`,
    hints: [
      'Each distinct score is a threshold; at each one you need TP and FP among the samples scoring at least that much.',
      'thresholds = torch.unique(scores).flip(0) gives the distinct scores in descending order.',
      'predicted = scores.unsqueeze(0) >= thresholds.unsqueeze(1) is (T, n); TP = (predicted & (y == 1)).sum(dim=1), FP likewise; F1 = 2*TP / (2*TP + FP + FN) as floats, and .argmax() picks the first (highest) best threshold.',
      'Pitfalls: F1 from P and R gives 0/0 when both are 0, and with no positives recall must be set to 1.0 instead of dividing by zero.',
    ],
    testCases: [
      {
        id: '1',
        description: 'Distinct thresholds, descending',
        input: '[round(v, 4) for v in pr_curve(torch.tensor([1, 0, 1, 0, 1, 0, 1, 0]), torch.tensor([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["thresholds"]]',
        expected: '[0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Precision at each threshold',
        input: '[round(v, 4) for v in pr_curve(torch.tensor([1, 0, 1, 0, 1, 0, 1, 0]), torch.tensor([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["precision"]]',
        expected: '[1.0, 0.5, 0.5, 0.6, 0.5, 0.5714, 0.5]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Recall at each threshold',
        input: '[round(v, 4) for v in pr_curve(torch.tensor([1, 0, 1, 0, 1, 0, 1, 0]), torch.tensor([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["recall"]]',
        expected: '[0.25, 0.25, 0.5, 0.75, 0.75, 1.0, 1.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'F1 at each threshold',
        input: '[round(v, 4) for v in pr_curve(torch.tensor([1, 0, 1, 0, 1, 0, 1, 0]), torch.tensor([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1]))["f1"]]',
        expected: '[0.4, 0.3333, 0.5, 0.6667, 0.6, 0.7273, 0.6667]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Best threshold and F1',
        input: '(lambda: (r := pr_curve(torch.tensor([1, 0, 1, 0, 1, 0, 1, 0]), torch.tensor([0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.1])), (round(r["best_threshold"], 4), round(r["best_f1"], 4)))[-1])()',
        expected: '(0.3, 0.7273)',
        hidden: true,
      },
      {
        id: '6',
        description: 'All scores tied: one threshold',
        input: '(lambda: (r := pr_curve(torch.tensor([1, 0, 0, 1, 0]), torch.tensor([0.5, 0.5, 0.5, 0.5, 0.5])), (r["thresholds"], [round(v, 4) for v in r["precision"]], r["recall"]))[-1])()',
        expected: '([0.5], [0.4], [1.0])',
        hidden: true,
      },
      {
        id: '7',
        description: 'No positives: recall 1.0, F1 0.0, highest threshold wins',
        input: '(lambda: (r := pr_curve(torch.tensor([0, 0, 0]), torch.tensor([0.2, 0.9, 0.5])), (r["recall"], r["f1"], round(r["best_threshold"], 4)))[-1])()',
        expected: '([1.0, 1.0, 1.0], [0.0, 0.0, 0.0], 0.9)',
        hidden: true,
      },
      {
        id: '8',
        description: 'F1 ties go to the higher threshold',
        input: '(lambda: (r := pr_curve(torch.tensor([1, 0, 1, 0, 0, 1]), torch.tensor([0.9, 0.8, 0.7, 0.6, 0.5, 0.4])), (round(r["best_threshold"], 4), round(r["best_f1"], 4)))[-1])()',
        expected: '(0.7, 0.6667)',
        hidden: true,
      },
      {
        id: '9',
        description: 'Random scores with many ties',
        input: '(lambda: (y := torch.from_numpy((np.random.rand(50) < 0.4).astype(int)), s := torch.from_numpy(np.round(np.random.rand(50), 1)).float(), r := pr_curve(y, s), (len(r["thresholds"]), round(r["best_threshold"], 1), round(r["best_f1"], 4)))[-1])()',
        expected: '(11, 0.2, 0.4706)',
        hidden: true,
      },
    ],
  },
};
