import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../model-evaluation.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const modelEvaluationPyTorch: Record<string, LanguageVariant> = {
  'precision-recall-f1': {
    note: 'Build boolean masks with == and &, count with .sum().item(), and return Python floats.',
    starterCode: `import torch

def precision_recall(y_true: torch.Tensor, y_pred: torch.Tensor) -> tuple:
    """
    Calculate precision and recall for binary classification.

    Args:
        y_true: True labels (0 or 1), int64 tensor
        y_pred: Predicted labels (0 or 1), int64 tensor

    Returns:
        Tuple of (precision, recall) rounded to 4 decimal places
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
    ],
    hints: [
      'TP: ((y_true == 1) & (y_pred == 1)).sum()',
      'FP: predicted 1 but actually 0; FN: actually 1 but predicted 0',
      'Use .item() to turn the counts into Python ints before dividing.',
    ],
  },

  'cross-validation': {
    note: 'Slice torch.arange(n_samples) into folds and join the rest with torch.cat. Return plain Python lists (.tolist()).',
    starterCode: `import torch

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Generate train/validation indices for K-fold cross-validation.

    Args:
        n_samples: Total number of samples
        k: Number of folds

    Returns:
        List of (train_indices, val_indices) tuples of Python lists
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
    ],
    hints: [
      'Fold sizes: n_samples // k, plus one for the first n_samples % k folds.',
      'indices[start:start + size] is the validation fold.',
      'torch.cat([indices[:start], indices[start + size:]]) is the training set.',
    ],
  },

  'confusion-matrix': {
    note: 'Compare tensors element-wise, convert the boolean result to float, and take the mean. Return a Python float.',
    starterCode: `import torch

def accuracy(y_true: torch.Tensor, y_pred: torch.Tensor) -> float:
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
    ],
    hints: [
      'y_true == y_pred gives a boolean tensor.',
      '.float().mean() gives the fraction of matches.',
      '.item() turns the 0-d result into a Python float.',
    ],
  },
};
