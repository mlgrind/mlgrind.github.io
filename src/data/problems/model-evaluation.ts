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
        expected: '[([2, 3, 4, 5], [0, 1]), ([0, 1, 4, 5], [2, 3]), ([0, 1, 2, 3], [4, 5])]',
        hidden: false,
      },
      {
        id: '2',
        description: '2-fold',
        input: '(4, 2)',
        expected: '[([2, 3], [0, 1]), ([0, 1], [2, 3])]',
        hidden: false,
      },
      {
        id: '3',
        description: '4-fold',
        input: '(8, 4)',
        expected: '[([2, 3, 4, 5, 6, 7], [0, 1]), ([0, 1, 4, 5, 6, 7], [2, 3]), ([0, 1, 2, 3, 6, 7], [4, 5]), ([0, 1, 2, 3, 4, 5], [6, 7])]',
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
];
